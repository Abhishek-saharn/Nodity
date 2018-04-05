var winner = {
    trioWinner: function(players) {
        var winnerobj = {
            number: 0,
            id: null
        };

        players.forEach(player => {
            if (player.card1.number > winnerobj.number) {
                winnerobj.number = player.card1.number;
                winnerobj.id = player.id;
            }
        });

        return winnerobj.id;

    },
    straigntRunWinner: function(players) {
        var winnerobj = {
            number: 0,
            suit: null,
            id: null
        };
        players.forEach(player => {
            if (player.card3.number > winnerobj.number) {
                winnerobj.number = player.card3.number;
                winnerobj.suit = player.card3.suit;
                winnerobj.id = player.id;
            } else if (player.card3.number == winnerobj.number) {
                if (player.card3.suit > winnerobj.suit) {
                    winnerobj.number = player.card3.number;
                    winnerobj.suit = player.card3.suit;
                    winnerobj.id = player.id;
                }
            }
        });

        return winnerobj.id;
    },
    normalRunWinner: function(players) {
        return this.straigntRunWinner(players);
    },
    colorWinner: function(players) {
        return this.straigntRunWinner(players);
    },
    pairWinner: function(players) {
        var winnerobj = {
            number: 0,
            suit: null,
            id: null
        };

        players.forEach(player => {
            if (player.card1.number == player.card2.number) {
                if (player.card1.number > winnerobj.number) {
                    winnerobj.number = player.card1.number;
                    winnerobj.suit = player.card3.suit;
                    winnerobj.id = player.id;
                } else if (player.card1.number == winnerobj.number) {
                    if (player.card1.suit > winnerobj.suit) {
                        winnerobj.number = player.card1.number;
                        winnerobj.suit = player.card1.suit;
                        winnerobj.id = player.id;
                    }
                    if (player.card2.suit > winnerobj.suit) {
                        winnerobj.number = player.card2.number;
                        winnerobj.suit = player.card2.suit;
                        winnerobj.id = player.id;
                    }
                }
            } else if (player.card2.number == player.card3.number) {

                if (player.card2.number > winnerobj.number) {
                    winnerobj.number = player.card1.number;
                    winnerobj.suit = player.card2.suit;
                    winnerobj.id = player.id;
                } else if (player.card2.number == winnerobj.number) {
                    if (player.card3.suit > winnerobj.suit) {
                        winnerobj.number = player.card3.number;
                        winnerobj.suit = player.card3.suit;
                        winnerobj.id = player.id;
                    }
                    if (player.card2.suit > winnerobj.suit) {
                        winnerobj.number = player.card2.number;
                        winnerobj.suit = player.card2.suit;
                        winnerobj.id = player.id;
                    }
                }

            }
        });
        return winnerobj.id;
    },
    highCardWinner: function(players) {
        var winnerobj = {
            number1: 0,
            number2: 0,
            number3: 0,
            suit: null,
            id: null
        };

        players.forEach(player => {
            if (player.card3.number > winnerobj.number3) {
                winnerobj.number3 = player.card3.number;
                winnerobj.number2 = player.card2.number;
                winnerobj.number1 = player.card1.number;
                winnerobj.suit = player.card3.suit;
                winnerobj.id = player.id;
            } else if (player.card3.number == winnerobj.number3 && player.card2.number > winnerobj.number2) {
                winnerobj.number3 = player.card3.number;
                winnerobj.number2 = player.card2.number;
                winnerobj.number1 = player.card1.number;
                winnerobj.suit = player.card3.suit;
                winnerobj.id = player.id;
            } else if (player.card3.number == winnerobj.number3 && player.card2.number == winnerobj.number2 && player.card1.number > winnerobj.number1) {
                winnerobj.number3 = player.card3.number;
                winnerobj.number2 = player.card2.number;
                winnerobj.number1 = player.card1.number;
                winnerobj.suit = player.card3.suit;
                winnerobj.id = player.id;
            } else if (player.card3.number == winnerobj.number3 &&
                player.card2.number == winnerobj.number2 &&
                player.card1.number == winnerobj.number1 &&
                player.card3.suit > winnerobj.suit) {
                winnerobj.number3 = player.card3.number;
                winnerobj.number2 = player.card2.number;
                winnerobj.number1 = player.card1.number;
                winnerobj.suit = player.card3.suit;
                winnerobj.id = player.id;

            }
        });

        return winnerobj.id;

    }
}

module.exports = winner;