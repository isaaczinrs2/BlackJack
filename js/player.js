class Player {
    constructor(name, isDealer = false) {
        this.name = name;
        this.hand = [];
        this.score = 0;
        this.isDealer = isDealer;
        this.bust = false;
        this.stand = false;
        this.bet = 0;
        this.chips = isDealer ? 0 : 5000;
        this.hasBlackjack = false;
    }

    addCard(card) {
        this.hand.push(card);
        this.calculateScore();
        
        if (this.hand.length === 2 && this.score === 21 && !this.isDealer) {
            this.hasBlackjack = true;
        }
    }

    calculateScore() {
        this.score = 0;
        let aces = 0;

        for (let card of this.hand) {
            if (card.value === 'A') {
                aces++;
                this.score += 11;
            } else if (['K', 'Q', 'J'].includes(card.value)) {
                this.score += 10;
            } else {
                this.score += parseInt(card.value);
            }
        }

        while (this.score > 21 && aces > 0) {
            this.score -= 10;
            aces--;
        }

        this.bust = this.score > 21;
    }

    clearHand() {
        this.hand = [];
        this.score = 0;
        this.bust = false;
        this.stand = false;
        this.hasBlackjack = false;
        this.bet = 0;
    }

    placeBet(amount) {
        if (amount <= this.chips && amount > 0) {
            this.bet = amount;
            this.chips -= amount;
            return true;
        }
        return false;
    }

    win(bj = false) {
        let winAmount = this.bet * 2;
        if (bj) {
            winAmount = Math.floor(this.bet * 2.5);
        }
        this.chips += winAmount + this.bet;
        const profit = winAmount;
        this.bet = 0;
        return profit;
    }

    push() {
        this.chips += this.bet;
        this.bet = 0;
        return 0;
    }
}