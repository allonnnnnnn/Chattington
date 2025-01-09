const mysql = require("mysql2");

require("dotenv").config();

console.log(process.env.DBHOST);

const connection = mysql.createConnection({
    host: process.env.DBHOST,
    user: "root",
    password: process.env.DBPASSWORD,
    database: "railway",
    port: 21075
});

module.exports = connection;
