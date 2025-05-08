class BlackjackUI {
    constructor(game) {
        this.game = game;
        this.table = document.getElementById('game-table');
        this.playersContainer = document.getElementById('players-container');
        this.dealerCards = document.getElementById('dealer-cards');
        this.dealerScore = document.getElementById('dealer-score');
        this.countValue = document.getElementById('count-value');
        this.messageContainer = document.getElementById('message-container');
        
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('new-game-btn').addEventListener('click', () => this.startNewGame());
        document.getElementById('add-player-btn').addEventListener('click', () => this.addPlayer());
        document.getElementById('table-color').addEventListener('change', (e) => {
            this.table.style.backgroundColor = e.target.value;
        });
        
        document.getElementById('hit-btn').addEventListener('click', () => {
            if (this.game.gameState === 'playing') {
                this.game.hit();
                this.updateUI();
            }
        });
        
        document.getElementById('stand-btn').addEventListener('click', () => {
            if (this.game.gameState === 'playing') {
                this.game.stand();
                this.updateUI();
            }
        });
        
        document.getElementById('double-btn').addEventListener('click', () => {
            if (this.game.gameState === 'playing' && this.game.canDouble()) {
                const player = this.game.getCurrentPlayer();
                player.placeBet(player.bet);
                this.game.hit();
                this.game.stand();
                this.updateUI();
            }
        });
        
        document.getElementById('split-btn').addEventListener('click', () => {
            if (this.game.gameState === 'playing' && this.game.canSplit()) {
                this.showMessage("Divisão de mãos será implementada na próxima versão!");
            }
        });
    }

    showMessage(message, duration = 2000) {
        this.messageContainer.textContent = message;
        this.messageContainer.style.display = 'block';
        
        if (duration > 0) {
            setTimeout(() => {
                this.messageContainer.style.display = 'none';
            }, duration);
        }
    }

    addPlayer() {
        if (this.game.gameState !== 'waiting') {
            this.showMessage("Você só pode adicionar jogadores entre partidas");
            return;
        }
        
        const name = prompt('Digite o nome do novo jogador:', `Jogador ${this.game.players.length + 1}`);
        if (name && name.trim()) {
            this.game.addPlayer(name.trim());
            this.updateUI();
            this.showMessage(`${name} adicionado à mesa!`);
        }
    }

    startNewGame() {
        if (this.game.players.length === 0) {
            this.showMessage("Adicione jogadores antes de começar!");
            return;
        }
        
        if (!this.game.startNewGame()) {
            return;
        }
        
        let allBetsValid = true;
        this.game.players.forEach(player => {
            let bet;
            do {
                const input = prompt(`${player.name}, você tem ${player.chips} fichas. Quanto quer apostar? (Mínimo: 10)`, "100");
                bet = parseInt(input);
                
                if (isNaN(bet) || bet < 10 || bet > player.chips) {
                    this.showMessage(`Aposta inválida para ${player.name}. Mínimo: 10, Máximo: ${player.chips}`);
                    allBetsValid = false;
                }
            } while (isNaN(bet) || bet < 10 || bet > player.chips);
            
            player.placeBet(bet);
        });
        
        if (!allBetsValid) {
            this.game.startNewGame();
            return;
        }
        
        this.game.dealInitialCards();
        this.updateUI();
        this.showMessage("Boa sorte!", 1500);
    }

    updateUI() {
        this.updateDealer();
        this.updatePlayers();
        this.updateCount();
        this.updateControls();
        
        document.getElementById('total-bet').textContent = `Aposta Total: ${this.game.totalBet}`;
            
        if (this.game.gameState === 'game-over') {
            const winners = this.game.determineWinners();
            this.showWinnerNotification(winners);
        }
    }

    showWinnerNotification(winners) {
        let message = '';
        
        if (winners.length === 0) {
            message = 'Dealer venceu todas as mãos!';
        } else {
            const winnerNames = winners.map(winner => {
                if (winner.result === 'push') {
                    return `${winner.player.name} (Empate)`;
                }
                return `${winner.player.name} (Ganhou ${winner.player.hasBlackjack ? 'Blackjack!' : ''})`;
            }).join(', ');
            
            message = `Vencedores: ${winnerNames}`;
        }
        
        this.showMessage(message, 5000);
        
        setTimeout(() => {
            this.game.resetTable();
            this.updateUI();
            this.showMessage("Faça suas apostas para a próxima rodada!");
        }, 5000);
    }

    updateDealer() {
        this.dealerCards.innerHTML = '';
        this.dealerScore.textContent = '';
        this.dealerScore.className = 'score';
        
        this.game.dealer.hand.forEach((card, index) => {
            if (index === 1 && this.game.gameState !== 'dealer-turn' && this.game.gameState !== 'game-over') {
                this.createCardElement('back', this.dealerCards);
            } else {
                this.createCardElement(card, this.dealerCards);
            }
        });
        
        if (this.game.gameState === 'dealer-turn' || this.game.gameState === 'game-over') {
            let scoreText = this.game.dealer.score;
            
            if (this.game.dealer.bust) {
                scoreText += ' BUST!';
                this.dealerScore.classList.add('bust');
            } else if (this.game.dealer.hand.length === 2 && this.game.dealer.score === 21) {
                scoreText += ' BLACKJACK!';
                this.dealerScore.classList.add('blackjack');
            }
            
            this.dealerScore.textContent = scoreText;
        }
    }

    updatePlayers() {
        this.playersContainer.innerHTML = '';
        
        this.game.players.forEach((player, index) => {
            const playerElement = document.createElement('div');
            playerElement.className = `player-area ${index === this.game.currentPlayerIndex && this.game.gameState === 'playing' ? 'active-player' : ''}`;
            
            playerElement.innerHTML = `
                <h2>${player.name}</h2>
                <div class="bet-display">Fichas: ${player.chips} | Aposta: ${player.bet}</div>
                <div class="cards" id="player-${index}-cards"></div>
                <div class="score" id="player-${index}-score">${player.score}</div>
            `;
            
            this.playersContainer.appendChild(playerElement);
            
            const cardsContainer = playerElement.querySelector(`#player-${index}-cards`);
            const scoreElement = playerElement.querySelector(`#player-${index}-score`);
            
            player.hand.forEach(card => {
                this.createCardElement(card, cardsContainer);
            });
            
            scoreElement.className = 'score';
            
            if (player.bust) {
                scoreElement.textContent += ' BUST!';
                scoreElement.classList.add('bust');
            } else if (player.hasBlackjack) {
                scoreElement.textContent += ' BLACKJACK!';
                scoreElement.classList.add('blackjack');
            } else if (player.stand) {
                scoreElement.textContent += ' PAROU';
            }
        });
    }

    createCardElement(card, container) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        
        if (card === 'back') {
            cardElement.classList.add('card-back');
            container.appendChild(cardElement);
            return;
        }
        
        if (card.suit === 'hearts' || card.suit === 'diamonds') {
            cardElement.classList.add('red');
        }
        
        let suitSymbol;
        switch(card.suit) {
            case 'hearts': suitSymbol = '♥'; break;
            case 'diamonds': suitSymbol = '♦'; break;
            case 'clubs': suitSymbol = '♣'; break;
            case 'spades': suitSymbol = '♠'; break;
        }
        
        cardElement.innerHTML = `
            <div class="card-value">${card.value}</div>
            <div class="card-suit">${suitSymbol}</div>
        `;
        
        container.appendChild(cardElement);
    }

    updateCount() {
        const count = this.game.getCount();
        this.countValue.textContent = count;
        
        if (count > 0) {
            this.countValue.style.color = '#4CAF50';
        } else if (count < 0) {
            this.countValue.style.color = '#F44336';
        } else {
            this.countValue.style.color = '#FFD700';
        }
    }

    updateControls() {
        const hitBtn = document.getElementById('hit-btn');
        const standBtn = document.getElementById('stand-btn');
        const doubleBtn = document.getElementById('double-btn');
        const splitBtn = document.getElementById('split-btn');
        
        hitBtn.disabled = this.game.gameState !== 'playing';
        standBtn.disabled = this.game.gameState !== 'playing';
        doubleBtn.disabled = !(this.game.gameState === 'playing' && this.game.canDouble());
        splitBtn.disabled = !(this.game.gameState === 'playing' && this.game.canSplit());
    }
}