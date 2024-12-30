const connection = require("./database.js");

module.exports = {
    createRelationship: function (user1Id, user2Id, callback) {
        if (user1Id == user2Id) {
            callback(1);
            return;
        }

        connection.query(
            "INSERT INTO friendship(user1Id, user2Id) VALUES (LEAST(?, ?), GREATEST(?, ?))",
            [user1Id, user2Id, user1Id, user2Id],
            (err, result) => callback(err, result)
        );
    },

    findByUserId: function (userId, callback) {
        connection.query(
            "SELECT * FROM friendship WHERE user1Id=? OR user2Id=?",
            [userId, userId],
            (err, result) => callback(err, result)
        );
    },

    deleteByUserId: function (userId, deletingUserId, callback) {
        connection.query(
            "DELETE FROM friendship WHERE user1Id=? AND user2Id=? OR user1Id=? AND user2Id=?",
            [deletingUserId, userId, userId, deletingUserId],
            (err, result) => callback(err, result)
        );
    }
}




