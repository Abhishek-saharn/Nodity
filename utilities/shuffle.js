var cards = require('./cards.js');
var shuffle = function() {
    var m = cards.length,
        t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = cards[m];
        cards[m] = cards[i];
        cards[i] = t;
    }

    return cards;
}

module.exports = shuffle;