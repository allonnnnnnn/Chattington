import { ajaxGET, ajaxPOST } from "/js/ajaxRequests.js";

document.getElementById("email").addEventListener("click", function(event) {
    document.getElementById("errorMessage").style.visibility = "hidden";
});

document.getElementById("password").addEventListener("click", function(event) {
    document.getElementById("errorMessage").style.visibility = "hidden";
});

document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const data = { "email": email, "password": password };

    ajaxPOST("/login", JSON.stringify(data), function (response) {
        response = JSON.parse(response);

        if (response.status != "success") {
            document.getElementById("errorMessage").style.visibility = "visible";
            document.getElementById("errorMessage").textContent = "Invalid username or password";
            return;
        }

        window.location.replace("/main");
    })
});





