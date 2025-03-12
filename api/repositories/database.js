const mysql = require("mysql2");

require("dotenv").config();

const connection = mysql.createConnection({
    host: process.env.DBHOST,
    user: "root",
    password: process.env.DBPASSWORD,
    database: "railway",
    port: 54829 
});

module.exports = connection;
