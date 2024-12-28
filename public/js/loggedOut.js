import { ajaxGET, ajaxPOST } from "/js/ajaxRequests.js";

document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const data = { "email": email, "password": password };

    ajaxPOST("/login", JSON.stringify(data), function (response) {
        response = JSON.parse(response);

        if (response.status != "success") {
            //put this message below the login submit button
            return;
        }

        window.location.replace("/main");
    })
});





