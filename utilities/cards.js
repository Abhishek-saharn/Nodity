var numbers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
var suits = ['c', 'd', 'h', 's'];
var cards = [];
var i = 0;
suits.forEach(function(suit) {
    numbers.forEach(function(number) {
        var newCard = {
            'index': i++,
            'number': number,
            'suit': suit
        };
        cards.push(newCard);
    })
});
cards.forEach(function(card) {
    if (card.suit == 'c' || card.suit == 's') {
        card['color'] = 'black';
    }
    if (card.suit == 'd' || card.suit == 'h') {
        card['color'] = 'red';
    }
});
module.exports = cards;