var utils = {
    isTrio: function(player) {
        if (player.card1.number == player.card2.number && player.card2.number == player.card3.number) {
            return true;
        } else return false;
    },
    isStraightRun: function(player) {
        var sameSuit = this.isSameSuit(player.card1.suit, player.card2.suit, player.card3.suit);
        var run = this.isRun(player.card1.number, player.card2.number, player.card3.number);
        if (sameSuit && run) return true;
        else return false;
    },
    isNormalRun: function(player) {
        var run = this.isRun(player.card1.number, player.card2.number, player.card3.number);
        if (run) return true;
        else return false;
    },
    isColor: function(player) {
        if (player.card1.color == player.card2.color && player.card2.color == player.card3.color) return true;
        else return false;
    },
    isPair: function(player) {
        if (player.card1.number == player.card2.number ||
            player.card2.number == player.card3.number) {
            return true
        } else {
            return false;
        }
    },
    isHighCard: function() {

    },
    isRun: function(n1, n2, n3) {

        if (n2 == n1 + 1 && n3 == n2 + 1) return true;
        else return false;
    },
    isSameSuit: function(suit1, suit2, suit3) {
        if (suit1 == suit2 && suit2 == suit3) return true;
        else return false;
    }

}

module.exports = utils;