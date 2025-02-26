const express = require("express");
const session = require("express-session");
const fs = require("fs");
const crypto = require("crypto");
const webSocket = require("ws");

const userRepository = require("./repositories/userRepository");
const friendshipRepository = require("./repositories/friendshipRepository");
const channelRepository = require("./repositories/channelRepository");
const messageRepository = require("./repositories/messageRepository.js");

const app = express();
const port = 8000;
const secret = crypto.randomBytes(64).toString("hex");
const clients = {};

const expressServer = app.listen(port, function () {
    console.log("Running on port: " + port);
});

const socketServer = new webSocket.Server({ server: expressServer });

app.use("/images", express.static("./public/images"));
app.use("/css", express.static("./public/css"));
app.use("/html", express.static("./public/html"));
app.use("/js", express.static("./public/js"));
app.use(express.json());

app.use(session(
    {
        secret: secret,
        name: "ChatSessionID",
        resave: false,
        saveUninitialized: false
    }
));

const messageRoutes = {
    "ChangeChannel": function (data) {
        channelRepository.getAChannel(data.userId, data.friendId, function (err, result) {
            if (err) throw err;

            //Trying to change to the same channel
            if (result.length == 0 || clients[data.userId].channelId == result[0].id) return;

            clients[data.userId].channelId = result[0].id;

            messageRepository.findByChannelId(clients[data.userId].channelId, function (messagesErr, messagesResult) {
                if (messagesErr) throw messagesErr;

                clients[data.userId].send(JSON.stringify({ "type": "incomingMessageHistory", "messages": messagesResult }));
            });
        });
    },

    "sendMessage": function (data) {
        if (!clients[data.userId].channelId) return;

        //Make sure they are connected to a channel first bruh
        channelRepository.getAChannelWithChannelId(clients[data.userId].channelId, function (err, result) {
            if (err) throw err;

            const friendId = (data.userId == result[0].user1Id) ? result[0].user2Id : result[0].user1Id;
            const date = Date(Date.now()).toString();

            messageRepository.createMessage(data.userId, clients[data.userId].channelId, data.message, date, function (err, messageResult) {
                if (err) throw err;

                //Check if the socket is also on the same channelId, if not, just don't send the message but a notification instead
                const friendSocket = clients[friendId];
                const newMessageJSON = { "type": "incomingMessage", "channelId": clients[data.userId].channelId, "id": messageResult[0].id, "message": data.message, "date": date, "name": clients[data.userId].username };
                if (friendSocket && clients[data.userId].channelId == friendSocket.channelId) {
                    friendSocket.send(JSON.stringify(newMessageJSON));
                }
                newMessageJSON.type = "successfulSentMessage";
                clients[data.userId].send(JSON.stringify(newMessageJSON))
            });

        });
    }
}

socketServer.on("connection", socketHandler);
function socketHandler(socket) {
    let hasinitalMessageSent = false;
    socket.on("message", function (data) {
        data = JSON.parse(data.toString());
        data.userId = socket.userId;

        if (!hasinitalMessageSent) {
            hasinitalMessageSent = true

            socket.channelId = null;
            socket.username = data.name
            socket.userId = data.id;
            clients[socket.userId] = socket;
            return;
        }

        messageRoutes[data.type](data);
    });
}

socketServer.on("close", function (socket) {
    clients[socket.userId] = null;
});

app.put("/updateMessage", function (req, res) {
    const messageId = req.body.id;
    const newMessage = req.body.message;
    const channelId = req.body.channelId;

    messageRepository.updateMessage(messageId, newMessage, function (err) {
        if (err) {
            return res.send({ "status": "failed", "message": err });
        }

        res.send({ "status": "success" });
        getFriendIdFromChannel(req.session.userId, channelId, function (friendId) {
            if (clients[friendId]) {
                clients[friendId].send(JSON.stringify({ "type": "updateMessage", "message": newMessage, "id": messageId }));
            }
        });
    });
});

app.delete("/deleteFriendship", function (req, res) {
    channelRepository.getAChannel(req.session.userId, req.body.id, function (err, result) {
        if (err) {
            return res.status(400).send({"status": "failed", "message": "Failed to find channel"});
        }

        if (clients[req.session.userId].channelId == result[0].id) {
            clients[req.session.userId].channelId = null;
        }

        friendshipRepository.deleteByUserId(req.session.userId, req.body.id, function (err) {
            if (err) {
                return res.status(400).send({"status": "failed", "message": "Failed to delete friendship"});
            }


            if (clients[req.body.id]) {
                clients[req.body.id].send(JSON.stringify({ "type": "UpdateChannels" }));
            }

            res.status(200).send({"status": "successful", "message": "Deleted friendship"});
        });
    });
});

app.delete("/deleteMessage", function (req, res) {
    //Should probably check if it's even the user's message but idrc
    const messageId = req.body.id;
    const channelId = req.body.channelId;

    messageRepository.deleteMessage(messageId, function (err) {
        if (err) throw err;

        getFriendIdFromChannel(req.session.userId, channelId, function (friendId) {
            if (clients[friendId]) {
                clients[friendId].send(JSON.stringify({ "type": "deleteMessage", "id": messageId }));
            }
        });

        res.send();
    });
});

function getFriendIdFromChannel(userId, channelId, callback) {
    channelRepository.getAChannelWithChannelId(channelId, function (err, result) {
        if (err) {
            throw err;
        }

        let friendId = result[0].user1Id;
        if (userId == result[0].user1Id) {
            friendId = result[0].user2Id;
        }

        callback(friendId);
    });
}

app.post("/login", loginsInUser);

app.post("/createNewAccount", function (req, res) {
    userRepository.createUser(req.body.email, req.body.name, req.body.password, function (err, result) {
        //Most likely this err will result from an already created user
        if (err) {
            return res.status(400).send({ "status": "failed", "message": "Account already created with same email" });
        }

        loginsInUser(req, res);
    });
});

function loginsInUser(req, res) {
    userRepository.findByEmailAndPassword(req.body.email, req.body.password, function (err, result) {
        if (err) {
            res.status(400).send({ "status": "failed", "message": "Something happened. Please try again" });
            return;
        }

        if (result.length == 0) {
            res.status(400).send({ "status": "failed", "message": "No account" });
            return;
        }

        req.session.loggedIn = true;
        req.session.userId = result[0].id;
        req.session.email = result[0].email;
        req.session.name = result[0].name;

        res.status(200).send({ "status": "success", "message": "Found account" });
    });
}

app.post("/addFriend", function (req, res) {
    const friendEmail = req.body.email;

    userRepository.findByEmail(friendEmail, function (err, userResult) {
        if (err) {
            res.status(400).send({ 'status': 'failed', 'message': 'Something realllllly happened this time. Pls try again :)' });
            return;
        }

        if (userResult.length == 0) {
            res.status(400).send({ 'status': 'failed', 'message': 'No user found' });
            return;
        }

        friendshipRepository.createRelationship(req.session.userId, userResult[0].id, function (err) {
            if (err == 1) {
                res.status(400).send({ 'status': 'failed', 'message': "That's you bruh" });
                return;
            }

            if (err) {
                res.status(400).send({ 'status': 'failed', 'message': 'Already is a friend bruh' });
                return;
            }

            if (clients[userResult[0].id]) {
                clients[userResult[0].id].send(JSON.stringify({ "type": "UpdateChannels" }));
            }
            channelRepository.createChannel(req.session.userId, userResult[0].id, (err) => { if (err) throw err; });

            res.status(200).send({ 'status': 'success', 'message': 'Added friend' });
        });
    });
});

app.get("/getChannelId", function (req, res) {
    res.send({ "channelId": clients[req.session.userId].channelId });
});

app.get("/getFriendships", function (req, res) {
    friendshipRepository.findByUserId(req.session.userId, function (err, result) {
        if (err) {
            throw err;
        }

        const arrayOfFriendsIds = [];
        result.forEach(friendship => {
            const id = (req.session.userId == friendship.user2Id) ? friendship.user1Id : friendship.user2Id;

            arrayOfFriendsIds.push(id);
        });

        userRepository.findByIds(arrayOfFriendsIds, function (err, result) {
            if (!result) {
                res.send([]);
                return;
            }

            if (err) {
                throw err;
            }

            res.send(result);
        });
    });
});

app.get("/getUser", function (req, res) {
    userRepository.findByEmail(req.session.email, function (err, result) {
        if (err) {
            throw err;
        }

        res.send(result);
    });
});

app.get("/logout", function (req, res) {
    if (!req.session) {
        res.redirect("/");
        return;
    }

    req.session.destroy(function (error) {
        if (error) {
            res.status(400).send("unable to logout")
            return;
        }

        res.redirect("/");
    })
});

app.get("/main", function (req, res) {
    if (!req.session.loggedIn) {
        res.redirect("/");
        return;
    }

    const file = fs.readFileSync("./public/html/main.html", "utf8");

    res.send(file);
});

app.get("/signup", function (req, res) {
    const file = fs.readFileSync("./public/html/signup.html", "utf8");

    res.send(file);
});

app.get("/", function (req, res) {
    const file = fs.readFileSync("./public/html/index.html", "utf8");

    res.send(file);
});




