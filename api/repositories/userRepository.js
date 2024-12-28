const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chattington",
});

module.exports = {
    findByIds : function(ids, callback) {
        const questionMarks = ids.map(() => "?").join(",");

        connection.query(
            `SELECT * FROM user WHERE id IN (${questionMarks})`,
            ids,
            (err, result) => callback(err, result)
        )
    },

    findByEmail : function(email, callback) {
        connection.query(
            "SELECT * FROM user WHERE email=?",
            [email],
            (err, result) => callback(err, result)
        )
    },

    findByEmailAndPassword: function (email, password, callback) {
        connection.query(
            "SELECT id, email, name FROM user WHERE email=? AND password=?",
            [email, password],
            (err, result) => callback(err, result)
        );
    }

}