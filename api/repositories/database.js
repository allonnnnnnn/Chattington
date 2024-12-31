const mysql = require("mysql2");
const fs = require("fs");
const ca = fs.readFileSync("./ca.pem");

require("dotenv").config();
console.log(ca);
const connection = mysql.createConnection({
    host: "mysql-2e67ef58-chattington.l.aivencloud.com",
    user: "avnadmin",
    password: process.env.DB_PASSWORD,
    database: "defaultdb",
    port: 15569,
    ssl: {
        ca: ca
    }
});

module.exports = connection;
