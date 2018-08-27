const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let gameSchema = new Schema({
    tableName: { type: String, require: true },
    playedOn: { type: Date, default: Date.now },
    playerId: { type: Schema.Types.ObjectId },
    initialMoney: Number,
    finalMoney: Number
});

gameSchema.statics = {
    insert: function(gameData) {
        return new Promise((resolve, reject) => {
            const obj = {
                tableName: gameData.tableName,
                playerId: Schema.Types.ObjectId(gameData.playerId),
                initialMoney: gameData.initialMoney,
                finalMoney: 0

            }

            this.create(obj)
                .then((returnedGameData) => {
                    return resolve(returnedGameData);
                })
                .catch(error => {
                    return reject(error);
                });

        })
    },
    update: function(updateData) {
        return new Promise((resolve, reject) => {
            this.update({
                    _id: Schema.Types.ObjectId(updateData.gameId),
                    playerId: Schema.Types.ObjectId(updateData.playerId)
                }, {
                    $set: {
                        finalMoney: updateData.finalMoney
                    }
                })
                .then(data => resolve(data))
                .catch(error => reject(data));
        });
    }
}

module.exports = mongoose.model("Game", gameSchema);