const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
    host: "mysql-2e67ef58-chattington.l.aivencloud.com",
    user: "avnadmin",
    password: process.env.DB_PASSWORD,
    database: "defaultdb",
    port: 15569
});

module.exports = connection;
