import { ajaxPOST } from "/js/ajaxRequests.js"

const mainForm = document.getElementById("newAccountForm")
mainForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = mainForm.querySelector("[type='email']").value;
    const username = mainForm.querySelector("[type='text']").value;
    const password = mainForm.querySelector("[type='password']").value;

    ajaxPOST("/createNewAccount", JSON.stringify({"email": email, "name": username, "password": password}), (response) => {
        response = JSON.parse(response);

        if (response.status != "success") {
            //put this message below the login submit button
            return;
        }

        window.location.replace("/main");
    });
});




