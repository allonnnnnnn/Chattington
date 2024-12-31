const mysql = require("mysql2");

require("dotenv").config();

const connection = mysql.createConnection({
    host: "sql3.freemysqlhosting.net",
    user: "sql3754972",
    password: "aALgMeZVxi",
    database: "sql3754972"
});

module.exports = connection;
