const Game = require('../models/Game');

const gameDataService = {
    insert: function(gameData) {
        return new Promise((resolve, reject) => {
            Game.insert(gameData)
                .then(successData => resolve(successData))
                .catch(gameErrorData => {
                    console.log(gameErrorData);
                    return reject(gameErrorData);
                });
        });
    },
    update: function(gameData) {
        return new Promise((resolve, reject) => {
            Game.update(gameData)
                .then(successData => resolve(successData))
                .catch(gameErrorData => {
                    console.log(gameErrorData);
                    return reject(gameErrorData);
                });
        });
    }
}

module.exports = gameDataService