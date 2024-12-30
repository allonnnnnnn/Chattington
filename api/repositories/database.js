const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
    host: "bdfstnwx1ihai75szfde-mysql.services.clever-cloud.com",
    user: "udicjo53zlxs9oqa",
    password: process.env.DB_PASSWORD,
    database: "bdfstnwx1ihai75szfde",
    port: 3306
});

module.exports = connection;
