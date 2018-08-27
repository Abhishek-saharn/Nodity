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
                playerId: mongoose.Types.ObjectId(gameData.playerId),
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
        console.log(">>>>>>>>>>>>")
        console.log(updateData.gameId)
        console.log(updateData.gameId)
        return new Promise((resolve, reject) => {
            this.update({
                    _id: mongoose.Types.ObjectId(updateData.gameId),
                    playerId: mongoose.Types.ObjectId(updateData.playerId)
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