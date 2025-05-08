class BlackjackGame {
    constructor() {
        this.deck = new Deck();
        this.dealer = new Player('Dealer', true);
        this.players = [];
        this.currentPlayerIndex = 0;
        this.gameState = 'waiting';
    }

    addPlayer(name) {
        if (this.gameState !== 'waiting') {
            return null;
        }
        
        const player = new Player(name);
        this.players.push(player);
        return player;
    }

    startNewGame() {
        if (this.players.length === 0) {
            return false;
        }

        this.deck.reset();
        this.dealer.clearHand();
        
        for (let player of this.players) {
            player.clearHand();
        }
        
        this.gameState = 'betting';
        this.currentPlayerIndex = 0;
        return true;
    }

    dealInitialCards() {
        this.dealer.clearHand();
        this.players.forEach(player => player.clearHand());

        for (let i = 0; i < 2; i++) {
            for (let player of this.players) {
                player.addCard(this.deck.dealCard());
            }
            this.dealer.addCard(this.deck.dealCard());
        }
        
        this.gameState = 'playing';
        this.currentPlayerIndex = 0;
    }

    hit() {
        const player = this.players[this.currentPlayerIndex];
        player.addCard(this.deck.dealCard());
        
        if (player.bust) {
            this.nextPlayer();
        }
    }

    stand() {
        this.players[this.currentPlayerIndex].stand = true;
        this.nextPlayer();
    }

    nextPlayer() {
        this.currentPlayerIndex++;
        
        if (this.currentPlayerIndex >= this.players.length) {
            this.dealerTurn();
        }
    }

    dealerTurn() {
        this.gameState = 'dealer-turn';
        
        // Revelar a carta oculta
        this.dealer.calculateScore();
        
        // Regras do dealer: hit até 16, stand em 17 ou mais
        while (this.dealer.score < 17 && !this.dealer.bust) {
            this.dealer.addCard(this.deck.dealCard());
        }
        
        this.determineWinners();
        this.gameState = 'game-over';
    }

    determineWinners() {
        const dealerScore = this.dealer.score;
        const dealerBust = this.dealer.bust;
        
        for (let player of this.players) {
            if (player.bust) {
                continue;
            }
            
            if (dealerBust) {
                player.win(player.hasBlackjack);
            } else if (player.hasBlackjack && !this.dealer.hasBlackjack) {
                player.win(true);
            } else if (player.score > dealerScore) {
                player.win();
            } else if (player.score === dealerScore) {
                player.push();
            }
        }
    }

    getCurrentPlayer() {
        if (this.currentPlayerIndex < this.players.length) {
            return this.players[this.currentPlayerIndex];
        }
        return null;
    }

    getCount() {
        return this.deck.getCount();
    }

    canDouble() {
        const player = this.getCurrentPlayer();
        return player && 
               player.hand.length === 2 && 
               player.chips >= player.bet &&
               !player.hasBlackjack;
    }
}