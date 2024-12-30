const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "bdfstnwx1ihai75szfde-mysql.services.clever-cloud.com",
    user: "udicjo53zlxs9oqa",
    password: "PVi5PxcIynod0OYJoq41",
    database: "bdfstnwx1ihai75szfde",
});

module.exports = connection;
