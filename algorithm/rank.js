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
        } else if (trioCards.length == 0 && straigntRunCards.length == 0 && normalRunCards.length == 0 && colorCards.length == 0 && pairCards.length == 0) {
            console.log(`Its high cards for player ${player.id}`);
            highCards.push(player);
        }

    });

    if (trioCards.length != 0) {
        let winnerData = winner.trioWinner(trioCards);
        winnerData.winRule = "Trio Cards"
        return winnerData;
    } else if (straigntRunCards.length != 0) {
        let winnerData = winner.straigntRunWinner(straigntRunCards);
        winnerData.winRule = "Straight Run"
        return winnerData;
    } else if (normalRunCards.length != 0) {
        let winnerData = winner.normalRunWinner(normalRunCards);
        winnerData.winRule = "Normal Run"
        return winnerData;
    } else if (colorCards.length != 0) {
        let winnerData = winner.colorWinner(colorCards);
        winnerData.winRule = "Same Color";
        return winnerData;
    } else if (pairCards.length != 0) {
        let winnerData = winner.pairWinner(pairCards);
        winnerData.winRule = "Pair Cards";
        return winnerData;
    } else if (highCards.length != 0) {
        let winnerData = winner.highCardWinner(highCards);
        winnerData.winRule = "High Cards";
        return winnerData;
    }


}

var rank = function(players) {

    return new Promise((resolve, reject) => {
        let winnerData = findRank(players);
        if (winnerData != undefined) {
            return resolve(winnerData);
        } else {
            return reject("Error! Winner could not be found. Try Again!");
        }
    });

}


module.exports = rank;