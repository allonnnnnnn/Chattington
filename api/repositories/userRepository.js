const connection = require("./database.js");

module.exports = {
    createUser: function(email, name, password, callback) {
        connection.query(
            "INSERT INTO user(email, name, password) VALUES (?, ?, ?)",
            [email, name, password],
            callback
        )
    },

    findByIds : function(ids, callback) {
        const questionMarks = ids.map(() => "?").join(",");

        connection.query(
            `SELECT * FROM user WHERE id IN (${questionMarks})`,
            ids,
            callback
        )
    },

    findByEmail : function(email, callback) {
        connection.query(
            "SELECT * FROM user WHERE email=?",
            [email],
            callback
        )
    },

    findByEmailAndPassword: function (email, password, callback) {
        connection.query(
            "SELECT id, email, name FROM user WHERE email=? AND password=?",
            [email, password],
            callback
        );
    }

}