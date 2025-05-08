class Deck {
    constructor() {
        this.cards = [];
        this.reset();
        this.count = 0;
    }

    reset() {
        this.cards = [];
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

        for (let suit of suits) {
            for (let value of values) {
                this.cards.push({ suit, value });
            }
        }

        this.shuffle();
        this.count = 0;
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    dealCard() {
        if (this.cards.length === 0) {
            this.reset();
        }
        
        const card = this.cards.pop();
        this.updateCount(card.value);
        return card;
    }

    updateCount(value) {
        if (['2', '3', '4', '5', '6'].includes(value)) {
            this.count++;
        } else if (['10', 'J', 'Q', 'K', 'A'].includes(value)) {
            this.count--;
        }
    }

    getCount() {
        return this.count;
    }
}