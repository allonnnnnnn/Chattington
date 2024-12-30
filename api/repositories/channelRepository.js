const connection = require("./database.js");

module.exports = {
    createChannel: function(user1Id, user2Id, callback) {
        let copy = user1Id;
        user1Id = Math.min(user1Id, user2Id);
        user2Id = Math.max(copy, user2Id);

        connection.query(
            "INSERT INTO channel(user1Id, user2Id) VALUES (?, ?)",
            [user1Id, user2Id],
            callback
        );
    },

    getAChannel: function(user1Id, user2Id, callback) {
        let copy = user1Id;
        user1Id = Math.min(user1Id, user2Id);
        user2Id = Math.max(copy, user2Id);

        connection.query(
            "SELECT * FROM channel WHERE user1Id=? AND user2Id=?",
            [user1Id, user2Id],
            callback
        );
    },

    getAChannelWithChannelId: function(channelId, callback) {
        connection.query(
            "SELECT * FROM channel WHERE id=?",
            [channelId],
            callback
        );
    }
}




