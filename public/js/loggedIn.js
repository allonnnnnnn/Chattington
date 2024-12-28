import { ajaxGET, ajaxPOST, ajaxDELETE } from "/js/ajaxRequests.js";

function onLoggedIn() {
    ajaxGET("/getUser", function(result) {
        result = JSON.parse(result)[0];
        document.getElementById("username-here").innerText = result.name;
    });

    connectToSocket();
    loadChatrooms();
}
onLoggedIn()

function connectToSocket() {
    const socket = new WebSocket("ws://localhost:8081");
    
    //Initializes the socket with an Id
    socket.addEventListener("open", function(event) {
        ajaxGET("/getUser", function(result) {
            result = JSON.parse(result);
            socket.send(JSON.stringify({"id": result[0].id}));
        });
    });

    socket.addEventListener("message", routeMessages);

    socket.addEventListener("close", function() {
        //idk do something
    });
}

function routeMessages(event) {
    const data = JSON.parse(event.data);
    messageRoutes[data.type](data);
}

const messageRoutes = {
    "UpdateChatrooms": function(data) {
        loadChatrooms();
    }
}

function loadChatrooms() {
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
            channelTemplate.querySelector("#unfriendButton").addEventListener("click", () => onUnfriend(user.id));
            channelTemplate.querySelector("div").addEventListener("click", () => changeChatroom(user.id));

            fragment.appendChild(channelTemplate);
            document.getElementById("channels").appendChild(fragment);
        });
    });
}

function onUnfriend(deletingUserId) {
    ajaxDELETE("/deleteFriendship", JSON.stringify({ 'id': deletingUserId }), loadChatrooms);
}

function changeChatroom(friendId) {
    
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

        loadChatrooms();
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

    //TODO: send the message to the server to process with the web socket :)
});




