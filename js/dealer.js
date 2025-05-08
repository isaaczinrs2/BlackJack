class Dealer {
    constructor() {
        this.hand = [];
    }

    receiveCard(card) {
        this.hand.push(card);
    }

    clearHand() {
        this.hand = [];
    }

    getHandValue() {
        let value = 0;
        let aces = 0;

        for (let card of this.hand) {
            if (card.value === 'A') {
                aces++;
                value += 11;
            } else if (['K', 'Q', 'J'].includes(card.value)) {
                value += 10;
            } else {
                value += parseInt(card.value);
            }
        }

        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }

        return value;
    }

    hasBlackjack() {
        return this.hand.length === 2 && this.getHandValue() === 21;
    }

    isBusted() {
        return this.getHandValue() > 21;
    }

    shouldHit() {
        return this.getHandValue() < 17;
    }

    getVisibleCard() {
        return this.hand.length > 0 ? this.hand[0] : null;
    }
}