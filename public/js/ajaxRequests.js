function ajaxGET(url, callback) {
    const xhr = new XMLHttpRequest();

    xhr.onload = function () {
        if (this.status != 200 && this.readyState != XMLHttpRequest.DONE) {
            console.log("Error occured: " + this.status);
            return;
        }

        if (callback) callback(this.responseText);
    };

    xhr.open("GET", url)
    xhr.send();
}

function ajaxPOST(url, data, callback) {
    const xhr = new XMLHttpRequest();

    xhr.onload = function () {
        if (this.status != 200 && this.readyState != XMLHttpRequest.DONE) {
            console.log("Error occured: " + this.status);
            return;
        }

        callback(this.responseText);
    };

    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
}

function ajaxPUT(url, data, callback) {
    const xhr = new XMLHttpRequest();

    xhr.onload = function () {
        if (this.status != 200 && this.readyState != XMLHttpRequest.DONE) {
            console.log("Error occured: " + this.status);
            return;
        }

        callback(this.responseText);
    };

    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
}

function ajaxDELETE(url, data, callback) {
    const xhr = new XMLHttpRequest();
    
    xhr.onload = function () {
        if (this.status != 200 && this.readyState != XMLHttpRequest.DONE) {
            console.log("Error occured: " + this.status);
            return;
        }

        callback(this.responseText);
    };
    
    xhr.open("DELETE", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
}

export {
    ajaxGET,
    ajaxPOST,
    ajaxPUT,
    ajaxDELETE
}
