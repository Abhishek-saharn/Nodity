var utils = require('./utils');
var winner = require('./winner');
var findRank = function(players) {
    var trioCards = [];
    var straigntRunCards = [];
    var normalRunCards = [];
    var colorCards = [];
    var pairCards = [];
    var highCards = [];

    players.forEach(player => {
        if (utils.isTrio(player)) {
            console.log(">>>>>>>>>>");
            console.log(`Its A Trio  for player ${player.id}`);
            console.log(">>>>>>>>>>");
            trioCards.push(player);

        } else if (trioCards.length == 0 && utils.isStraightRun(player)) {
            console.log(">>>>>>>>>>");
            console.log(`Its A Straight Run  for player ${player.id}`);
            console.log(">>>>>>>>>>");
            straigntRunCards.push(player);

        } else if (trioCards.length == 0 && straigntRunCards.length == 0 && utils.isNormalRun(player)) {
            console.log(">>>>>>>>>>");
            console.log(`Its A normal Run  for player ${player.id}`);
            console.log(">>>>>>>>>>");
            normalRunCards.push(player);


        } else if (trioCards.length == 0 && straigntRunCards.length == 0 && normalRunCards.length == 0 && utils.isColor(player)) {

            console.log(">>>>>>>>>>");
            console.log(`Its Same Colors for player ${player.id}`);
            console.log(">>>>>>>>>>");
            colorCards.push(player);

        } else if (trioCards.length == 0 && straigntRunCards.length == 0 && normalRunCards.length == 0 && colorCards.length == 0 && utils.isPair(player)) {
            console.log(">>>>>>>>>>");
            console.log(`Its pair cards for player ${player.id}`);
            console.log(">>>>>>>>>>");
            pairCards.push(player);
        } else {
            console.log(`Its high cards for player ${player.id}`);
            highCards.push(player);
        }

    });

    if (trioCards.length != 0) {
        return winner.trioWinner(trioCards);
    } else if (straigntRunCards.length != 0) {
        return winner.straigntRunWinner(straigntRunCards);
    } else if (normalRunCards.length != 0) {
        return winner.normalRunWinner(normalRunCards);
    } else if (colorCards.length != 0) {
        return winner.colorWinner(colorCards);
    } else if (pairCards.length != 0) {
        return winner.pairWinner(pairCards);
    } else if (highCards.length != 0) {
        return winner.highCardWinner(highCards);
    }


}

var rank = function(players) {

    return new Promise((resolve, reject) => {
        let winner = findRank(players);
        if (winner != undefined) {
            return resolve(winner);
        } else {
            return reject("Error! Winner could not be found. Try Again!");
        }
    });

}


module.exports = rank;