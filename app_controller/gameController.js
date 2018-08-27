const gameDataService = require('../data_services/gameDataService');
const gameController = {
    insert: function(data) {
        console.log(`In controller.`);
        const gameData = {
            tableName: data.tableName,
            playerId: data.playerId,
            initialMoney: data.initialMoney,
        }

        return new Promise((resolve, reject) => {
            gameDataService.insert(gameData)
                .then(successData => resolve(successData))
                .catch(error => reject(error));
        });

    },
    update: function(data) {
        const gameData = {
            gameId: data.gameId,
            playerId: data.playerId,
            finalMoney: data.finalMoney,
        }

        return new Promise((resolve, reject) => {
            gameDataService.update(gameData)
                .then(successData => resolve(successData))
                .catch(error => reject(error));
        });

    },

}

module.exports = gameController;