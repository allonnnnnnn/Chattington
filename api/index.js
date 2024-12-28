const express = require("express");
const session = require("express-session");
const fs = require("fs");
const crypto = require("crypto");
const webSocket = require("ws");

const userRepository = require("./repositories/userRepository");
const friendshipRepository = require("./repositories/friendshipRepository");
const channelRepository = require("./repositories/channelRepository");

const app = express();
const port = 8000;
const secret = crypto.randomBytes(64).toString("hex");
const clients = {};

app.use("/images", express.static("../public/images"));
app.use("/css", express.static("../public/css"));
app.use("/html", express.static("../public/html"));
app.use("/js", express.static("../public/js"));
app.use(express.json());

app.use(session(
    {
        secret: secret,
        name: "ChatSessionID",
        resave: false,
        saveUninitialized: false
    }
));

const socketServer = new webSocket.Server({
    port: 8081
});

socketServer.on("connection", socketHandler);
function socketHandler(socket) {
    let hasinitalMessageSent = false;
    socket.on("message", function (data) {
        data = JSON.parse(data.toString());
        if (!hasinitalMessageSent) {
            hasinitalMessageSent = true

            socket.userId = data.id;
            clients[socket.userId] = socket;
            return;
        }
    });
}

socketServer.on("close", function (socket) {
    clients[socket.userId] = null;
});

app.delete("/deleteFriendship", function (req, res) {
    friendshipRepository.deleteByUserId(req.session.userId, req.body.id, function (err, result) {
        if (err) {
            throw err;
        }

        clients[req.body.id].send(JSON.stringify({ "type": "UpdateChatrooms" }));
        res.send();
    });
});

app.post("/login", function (req, res) {
    userRepository.findByEmailAndPassword(req.body.email, req.body.password, function (err, result) {
        if (err) {
            res.send({ "status": "failed", "message": "Something happened. Please try again" });
            return;
        }

        if (result.length == 0) {
            res.send({ "status": "failed", "message": "No account" });
            return;
        }

        req.session.loggedIn = true;
        req.session.userId = result[0].id;
        req.session.email = result[0].email;
        req.session.name = result[0].name;

        res.send({ "status": "success", "message": "Found account" });
    });
});

app.post("/addFriend", function (req, res) {
    const friendEmail = req.body.email;

    userRepository.findByEmail(friendEmail, function (err, userResult) {
        if (err) {
            res.send({ 'status': 'failed', 'message': 'Something realllllly happened this time. Pls try again :)' });
            return;
        }

        if (userResult.length == 0) {
            res.send({ 'status': 'failed', 'message': 'No user found' });
            return;
        }

        friendshipRepository.createRelationship(req.session.userId, userResult[0].id, function (err) {
            if (err == 1) {
                res.send({ 'status': 'failed', 'message': "That's you bruh" });
                return;
            }

            if (err) {
                res.send({ 'status': 'failed', 'message': 'Already is a friend bruh' });
                return;
            }

            clients[userResult[0].id].send(JSON.stringify({ "type": "UpdateChatrooms" }));
            channelRepository.createChannel(req.session.userId, userResult[0].id, (err) => {if (err) throw err;});

            res.send({ 'status': 'success', 'message': 'Added friend' });
        });
    });
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
    if (!req.session) return;

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

    const file = fs.readFileSync("../public/html/main.html", "utf8");

    res.send(file);
});

app.get("/signup", function (req, res) {
    const file = fs.readFileSync("../public/html/signup.html", "utf8");

    res.send(file);
});

app.get("/", function (req, res) {
    const file = fs.readFileSync("../public/html/index.html", "utf8");

    res.send(file);
});

app.listen(port, function () {
    console.log("Running on port: " + port);
});


