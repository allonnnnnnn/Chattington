import { ajaxGET, ajaxPOST, ajaxDELETE } from "/js/ajaxRequests.js";

const socket = new WebSocket("wss://chattington-production.up.railway.app");
// const socket = new WebSocket("ws://localhost:8000");

function onLoggedIn() {
    ajaxGET("/getUser", function (result) {
        result = JSON.parse(result)[0];
        document.getElementById("username-here").innerText = result.name;
    });

    connectToSocket();
    loadChannels();
}
onLoggedIn()

function connectToSocket() {
    //Initializes the socket with an Id
    socket.addEventListener("open", function (event) {
        console.log("opned");
        ajaxGET("/getUser", function (result) {
            result = JSON.parse(result);
            socket.userId = result[0].id;
            socket.send(JSON.stringify({ "id": result[0].id, "name": result[0].name }));
        });

        socket.addEventListener("message", routeSocketMessages);
    });

    socket.addEventListener("close", function (event) {
        console.log(event.code + " " + event.message);
        //idk do something
    });
}

function routeSocketMessages(event) {
    const data = JSON.parse(event.data);
    socketMessageRoutes[data.type](data);
}

function loadMessage(templateElement, data) {
    const messageTemplate = templateElement.content.cloneNode(true);
    const fragment = document.createDocumentFragment();
    const messages = document.getElementById("messages");
    
    const date = (new Date(data.date)).toLocaleString();
    
    messageTemplate.querySelector(".text").innerText = data.message;
    messageTemplate.querySelector(".name").innerText = data.name;
    messageTemplate.querySelector(".messageDate").innerText = date;

    fragment.appendChild(messageTemplate);
    document.getElementById("messages").insertBefore(fragment, messages.children[0]);
}
const socketMessageRoutes = {
    "UpdateChannels": loadChannels,
    //Update the user's screen to show the message THEY sent when it went through
    "successfulSentMessage": function (data) {
        loadMessage(document.getElementById("userMessageTemplate"), data);
    },
    "incomingMessage": function (data) {
        loadMessage(document.getElementById("friendMessageTemplate"), data);
    },
    "incomingMessageHistory": function (data) {
        document.getElementById("messages").innerHTML = "";

        data["messages"].forEach(message => {
            if (socket.userId == message.userId) {
                loadMessage(document.getElementById("userMessageTemplate"), message);
            } else {
                loadMessage(document.getElementById("friendMessageTemplate"), message);
            }
        });
    }
}

function loadChannels() {
    const channelContainer = document.getElementById("channels");
    for (let i = channelContainer.children.length - 1; i >= 2; i--) {
        channelContainer.children[i].remove();
    }

    ajaxGET("/getFriendships", function (result) {
        result = JSON.parse(result);

        result.forEach(user => {
            const fragment = document.createDocumentFragment();
            const channelTemplate = document.getElementById("channelTemplate").content.cloneNode(true);

            channelTemplate.querySelector(".friendName").innerText = user.name;
            channelTemplate.querySelector(".unfriendButton").addEventListener("click", () => onUnfriend(user.id));
            channelTemplate.querySelector(".clickableProfile").addEventListener("click", () => changeChatroom(user.id));

            fragment.appendChild(channelTemplate);
            document.getElementById("channels").appendChild(fragment);
        });
    });
}

function onUnfriend(deletingUserId) {
    ajaxDELETE("/deleteFriendship", JSON.stringify({ 'id': deletingUserId }), function() { 
        loadChannels();

        ajaxGET("/getChannelId", function(result) {
            result = JSON.parse(result);
            if (!result.channelId) {
                document.getElementById("messages").innerHTML = "<h2>Please select a chat to start chatting</h2>";
            }
        });
    });
}

function changeChatroom(friendId) {
    socket.send(JSON.stringify({ "type": "ChangeChannel", "friendId": friendId }));
}

document.getElementById("logoutButton").addEventListener("click", function () {
    window.location.replace("/logout");
});

const popup = document.getElementById("addFriendPopup");
const emailInput = popup.querySelector("[type='email']");
const messageElement = document.getElementById("addFriendMessage");
document.getElementById("addUser").addEventListener("click", function () {
    popup.removeAttribute("style");
    emailInput.focus();
});

popup.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault();

    const friendEmail = emailInput.value;
    ajaxPOST("/addFriend", JSON.stringify({ 'email': friendEmail }), function (response) {
        response = JSON.parse(response);

        if (response.status == "failed") {
            messageElement.style["color"] = "red";
            messageElement.innerText = response.message;
            return;
        }

        messageElement.style["color"] = "green";
        messageElement.innerText = response.message;

        loadChannels();
    });
});

popup.querySelector("img").addEventListener("click", function () {
    popup.setAttribute("style", "display: none;");
    popup.querySelector("[type='email']").value = "";
    messageElement.innerText = "";
});

document.getElementById("messageForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const message = document.getElementById("userMessage").value;
    document.getElementById("userMessage").value = "";

    socket.send(JSON.stringify({ "type": "sendMessage", "message": message }));
});




