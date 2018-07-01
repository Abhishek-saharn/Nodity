var winner = {
    trioWinner: function(players) {
        var winnerobj = {
            number: 0,
            name: "",
            id: null
        };

        players.forEach(player => {
            if (player.card1.number > winnerobj.number) {
                winnerobj.number = player.card1.number;
                winnerobj.id = player.id;
                winnerobj.name = player.name;
            }
        });
        let retwinnerobj = {
            id: winnerobj.id,
            name: winnerobj.name,
        }
        return retwinnerobj;

    },
    straigntRunWinner: function(players) {
        var winnerobj = {
            number: 0,
            name: "",
            suit: null,
            id: null
        };
        players.forEach(player => {
            if (player.card3.number > winnerobj.number) {
                winnerobj.number = player.card3.number;
                winnerobj.suit = player.card3.suit;
                winnerobj.id = player.id;
                winnerobj.name = player.name;
            } else if (player.card3.number == winnerobj.number) {
                if (player.card3.suit > winnerobj.suit) {
                    winnerobj.number = player.card3.number;
                    winnerobj.suit = player.card3.suit;
                    winnerobj.id = player.id;
                    winnerobj.name = player.name;
                }
            }
        });
        let retwinnerobj = {
            id: winnerobj.id,
            name: winnerobj.name,
        }
        return retwinnerobj;
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
            name: "",
            suit: null,
            id: null
        };

        players.forEach(player => {
            if (player.card1.number == player.card2.number) {
                if (player.card1.number > winnerobj.number) {
                    winnerobj.number = player.card1.number;
                    winnerobj.suit = player.card3.suit;
                    winnerobj.id = player.id;
                    winnerobj.name = player.name;
                } else if (player.card1.number == winnerobj.number) {
                    if (player.card1.suit > winnerobj.suit) {
                        winnerobj.number = player.card1.number;
                        winnerobj.suit = player.card1.suit;
                        winnerobj.id = player.id;
                        winnerobj.name = player.name;
                    }
                    if (player.card2.suit > winnerobj.suit) {
                        winnerobj.number = player.card2.number;
                        winnerobj.suit = player.card2.suit;
                        winnerobj.id = player.id;
                        winnerobj.name = player.name;
                    }
                }
            } else if (player.card2.number == player.card3.number) {

                if (player.card2.number > winnerobj.number) {
                    winnerobj.number = player.card1.number;
                    winnerobj.suit = player.card2.suit;
                    winnerobj.id = player.id;
                    winnerobj.name = player.name;
                } else if (player.card2.number == winnerobj.number) {
                    if (player.card3.suit > winnerobj.suit) {
                        winnerobj.number = player.card3.number;
                        winnerobj.suit = player.card3.suit;
                        winnerobj.id = player.id;
                        winnerobj.name = player.name;
                    }
                    if (player.card2.suit > winnerobj.suit) {
                        winnerobj.number = player.card2.number;
                        winnerobj.suit = player.card2.suit;
                        winnerobj.id = player.id;
                        winnerobj.name = player.name;
                    }
                }

            }
        });
        let retwinnerobj = {
            id: winnerobj.id,
            name: winnerobj.name,
        }
        return retwinnerobj;
    },
    highCardWinner: function(players) {
        var winnerobj = {
            number1: 0,
            number2: 0,
            number3: 0,
            name: "",
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
                winnerobj.name = player.name;
            } else if (player.card3.number == winnerobj.number3 && player.card2.number > winnerobj.number2) {
                winnerobj.number3 = player.card3.number;
                winnerobj.number2 = player.card2.number;
                winnerobj.number1 = player.card1.number;
                winnerobj.suit = player.card3.suit;
                winnerobj.id = player.id;
                winnerobj.name = player.name;
            } else if (player.card3.number == winnerobj.number3 && player.card2.number == winnerobj.number2 && player.card1.number > winnerobj.number1) {
                winnerobj.number3 = player.card3.number;
                winnerobj.number2 = player.card2.number;
                winnerobj.number1 = player.card1.number;
                winnerobj.suit = player.card3.suit;
                winnerobj.id = player.id;
                winnerobj.name = player.name;
            } else if (player.card3.number == winnerobj.number3 &&
                player.card2.number == winnerobj.number2 &&
                player.card1.number == winnerobj.number1 &&
                player.card3.suit > winnerobj.suit) {
                winnerobj.number3 = player.card3.number;
                winnerobj.number2 = player.card2.number;
                winnerobj.number1 = player.card1.number;
                winnerobj.suit = player.card3.suit;
                winnerobj.id = player.id;
                winnerobj.name = player.name;

            }
        });
        let retwinnerobj = {
            id: winnerobj.id,
            name: winnerobj.name,
        }
        return retwinnerobj;

    }
}

module.exports = winner;