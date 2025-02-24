const connection = require("./database.js");

module.exports = {
    createMessage: function (userId, channelId, message, date, callback) {
        connection.query(
            "INSERT INTO message(userId, channelId, message, date) VALUES (?, ?, ?, ?)",
            [userId, channelId, message, date],
            function(err) {
                if (err) {
                    throw err;
                }

                connection.query(
                    "SELECT id FROM message WHERE id=LAST_INSERT_ID()",
                    callback
                )
            }
        );
    },

    updateMessage: function (messageId, newMessage, callback) {
        connection.query(
            "UPDATE message SET message=? WHERE id=?",
            [newMessage, messageId],
            callback
        )
    },

    deleteMessage: function (messageId, callback) {
        connection.query(
            "DELETE FROM message WHERE id=?",
            [messageId],
            callback
        );
    },

    findByChannelId: function (channelId, callback) {
        connection.query(
            "SELECT message.*, user.name FROM message INNER JOIN user ON user.id = message.userId WHERE channelId=?",
            [channelId],
            callback
        );
    }
}


