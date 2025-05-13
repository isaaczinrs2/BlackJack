document.addEventListener('DOMContentLoaded', () => {
    // Elementos do jogo
    const dealerCardsEl = document.getElementById('dealer-cards');
    const playerCardsEl = document.getElementById('player-cards');
    const dealerCountEl = document.getElementById('dealer-count');
    const playerCountEl = document.getElementById('player-count');
    const bankrollEl = document.getElementById('bankroll');
    const betAmountEl = document.getElementById('bet-amount');
    const dealBtn = document.getElementById('deal');
    const hitBtn = document.getElementById('hit');
    const standBtn = document.getElementById('stand');
    const doubleBtn = document.getElementById('double');
    const increaseBetBtn = document.getElementById('increase-bet');
    const decreaseBetBtn = document.getElementById('decrease-bet');
    const allInBtn = document.getElementById('all-in');
    const messageBoxEl = document.getElementById('message-box');
    const resultModal = document.getElementById('result-modal');
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');
    const playAgainBtn = document.getElementById('play-again');
    const bankruptModal = document.getElementById('bankrupt-modal');
    const restartGameBtn = document.getElementById('restart-game');
    const trueCountEl = document.getElementById('true-count');
    const runningCountEl = document.getElementById('running-count');
    const cardsRemainingEl = document.getElementById('cards-remaining');
    const winSound = document.getElementById('win-sound');
    const loseSound = document.getElementById('lose-sound');
    const cardSound = document.getElementById('card-sound');
    const chipSound = document.getElementById('chip-sound');
    const shuffleSound = document.getElementById('shuffle-sound');

    // Estado do jogo
    let bankroll = 1000;
    let currentBet = 50;
    let deck = [];
    let dealerHand = [];
    let playerHand = [];
    let gameOver = false;
    let runningCount = 0;
    let decksRemaining = 6;
    const totalDecks = 6;

    // Mensagens em Português
    const messages = {
        welcome: "Bem-vindo ao Blackjack Vegas! Faça sua aposta.",
        shuffle: "Embaralhando novo baralho...",
        blackjack: "BLACKJACK! Você ganhou 3:2!",
        bust: "ESTOUROU! Você perdeu.",
        dealerBust: "Dealer estourou! Você ganhou!",
        push: "Empate! Fica com sua aposta.",
        win: "Você ganhou!",
        lose: "Você perdeu.",
        betError: "Você não tem fichas suficientes!",
        hitStand: "Hit ou Stand?",
        doubleAvailable: "Você pode dobrar sua aposta!",
        bankrupt: "Você ficou sem dinheiro! O jogo será reiniciado.",
        newGame: "Novo jogo iniciado! Boa sorte!"
    };

    // Valores para contagem de cartas (sistema Hi-Lo)
    const cardValues = {
        '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
        '7': 0, '8': 0, '9': 0,
        '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1
    };

    // Inicializa o jogo
    initGame();

    function initGame() {
        updateBankroll();
        updateBetDisplay();
        updateCountDisplay();
        enableBetControls();
        disableGameControls();
        showMessage('welcome');
        deck = createDeck();
        adjustLayout();
    }

    function createDeck() {
        const suits = ['♠', '♣', '♥', '♦'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        
        let newDeck = [];
        for (let i = 0; i < totalDecks; i++) {
            for (let suit of suits) {
                for (let value of values) {
                    newDeck.push({ suit, value });
                }
            }
        }
        
        return shuffleDeck(newDeck);
    }

    function shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    function deal() {
        if (checkBankrupt()) return;
        
        if (deck.length < 52) {
            deck = createDeck();
            runningCount = 0;
            decksRemaining = totalDecks;
            showMessage('shuffle');
        }

        dealerHand = [];
        playerHand = [];
        dealerCardsEl.innerHTML = '';
        playerCardsEl.innerHTML = '';
        dealerCountEl.textContent = '?';
        playerCountEl.textContent = '0';
        gameOver = false;
        
        if (currentBet > bankroll) {
            showMessage('betError');
            return;
        }
        
        bankroll -= currentBet;
        updateBankroll();
        
        playerHand.push(drawCard());
        dealerHand.push(drawCard());
        playerHand.push(drawCard());
        dealerHand.push(drawCard(true));
        
        renderCards();
        updateCounts();
        
        if (calculateHandValue(playerHand) === 21) {
            stand();
            return;
        }
        
        disableBetControls();
        enableGameControls();
        
        showMessage('hitStand');
    }

    function drawCard(hidden = false) {
        if (deck.length === 0) {
            deck = createDeck();
        }
        
        const card = deck.pop();
        
        if (!hidden) {
            runningCount += cardValues[card.value];
            decksRemaining = Math.ceil(deck.length / 52);
            updateCountDisplay();
        }
        
        return { ...card, hidden };
    }

    function renderCards() {
        dealerCardsEl.innerHTML = '';
        playerCardsEl.innerHTML = '';
        
        dealerHand.forEach(card => renderCard(card, dealerCardsEl));
        playerHand.forEach(card => renderCard(card, playerCardsEl));
    }

    function renderCard(card, element) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        
        if (card.hidden) {
            cardEl.classList.add('hidden');
            cardEl.textContent = '🂠';
        } else {
            cardEl.textContent = card.value + card.suit;
            
            if (card.suit === '♥' || card.suit === '♦') {
                cardEl.classList.add('red');
            }
            
            cardEl.setAttribute('data-value', card.value);
            cardEl.setAttribute('data-suit', card.suit);
        }
        
        element.appendChild(cardEl);
    }

    function hit() {
        if (gameOver) return;
        
        playerHand.push(drawCard());
        renderCards();
        updateCounts();
        
        const playerValue = calculateHandValue(playerHand);
        
        if (playerValue > 21) {
            endGame();
        } else if (playerValue === 21) {
            stand();
        } else if (playerHand.length === 2) {
            doubleBtn.disabled = (currentBet > bankroll);
        }
    }

    function stand() {
        if (gameOver) return;
        
        dealerHand[1].hidden = false;
        dealerCountEl.textContent = calculateHandValue(dealerHand);
        renderCards();
        
        while (calculateHandValue(dealerHand) < 17) {
            dealerHand.push(drawCard());
            renderCards();
            dealerCountEl.textContent = calculateHandValue(dealerHand);
        }
        
        endGame();
    }

    function double() {
        if (gameOver || playerHand.length !== 2) return;
        
        if (currentBet > bankroll) {
            showMessage('betError');
            return;
        }
        
        bankroll -= currentBet;
        currentBet *= 2;
        updateBankroll();
        updateBetDisplay();
        
        hit();
        if (!gameOver) {
            stand();
        }
    }

    function checkBankrupt() {
        if (bankroll <= 0) {
            showBankruptMessage();
            return true;
        }
        return false;
    }

    function showBankruptMessage() {
        bankruptModal.querySelector('#bankrupt-message').textContent = messages.bankrupt;
        bankruptModal.style.display = "flex";
        disableGameControls();
        disableBetControls();
    }

    function restartGame() {
        bankroll = 1000;
        currentBet = 50;
        deck = createDeck();
        runningCount = 0;
        updateBankroll();
        updateBetDisplay();
        updateCountDisplay();
        enableBetControls();
        bankruptModal.style.display = "none";
        showMessage('newGame');
        adjustLayout();
    }

    function endGame() {
        gameOver = true;
        disableGameControls();
        enableBetControls();
        
        const playerValue = calculateHandValue(playerHand);
        const dealerValue = calculateHandValue(dealerHand);
        
        if (dealerHand[1].hidden) {
            dealerHand[1].hidden = false;
            dealerCountEl.textContent = dealerValue;
            renderCards();
        }
        
        let resultKey, winnings;
        
        if (playerValue > 21) {
            resultKey = 'bust';
            winnings = 0;
            resultTitle.className = 'lose';
            resultTitle.textContent = 'Você Perdeu!';
        } else if (dealerValue > 21) {
            resultKey = 'dealerBust';
            winnings = currentBet * 2;
            bankroll += winnings;
            resultTitle.className = 'win';
            resultTitle.textContent = 'Você Ganhou!';
            createConfetti();
        } else if (playerValue === dealerValue) {
            resultKey = 'push';
            winnings = currentBet;
            bankroll += winnings;
            resultTitle.className = 'push';
            resultTitle.textContent = 'Empate!';
        } else if (playerValue > dealerValue) {
            resultKey = 'win';
            winnings = currentBet * 2;
            bankroll += winnings;
            resultTitle.className = 'win';
            resultTitle.textContent = 'Você Ganhou!';
            createConfetti();
        } else {
            resultKey = 'lose';
            winnings = 0;
            resultTitle.className = 'lose';
            resultTitle.textContent = 'Você Perdeu!';
        }
        
        if (playerValue === 21 && playerHand.length === 2 && dealerValue !== 21) {
            resultKey = 'blackjack';
            winnings = currentBet * 2.5;
            bankroll += winnings;
            resultTitle.className = 'win';
            resultTitle.textContent = 'Blackjack!';
            createConfetti();
        }
        
        updateBankroll();
        showMessage(resultKey);
        
        if (checkBankrupt()) {
            return;
        }
        
        resultMessage.textContent = messages[resultKey];
        if (winnings > currentBet) {
            resultMessage.innerHTML += `<br><br>Você ganhou ${winnings - currentBet} fichas!`;
        } else if (winnings === currentBet) {
            resultMessage.innerHTML += `<br><br>Você recuperou suas ${currentBet} fichas.`;
        } else {
            resultMessage.innerHTML += `<br><br>Você perdeu ${currentBet} fichas.`;
        }
        resultModal.style.display = 'flex';
        
        if (bankroll < 50) {
            currentBet = Math.min(50, bankroll);
            updateBetDisplay();
        }
    }

    function calculateHandValue(hand) {
        let value = 0;
        let aces = 0;
        
        for (let card of hand) {
            if (card.hidden) continue;
            
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

    function updateCounts() {
        playerCountEl.textContent = calculateHandValue(playerHand);
        if (!gameOver && !dealerHand[1].hidden) {
            dealerCountEl.textContent = calculateHandValue(dealerHand);
        }
    }

    function updateBankroll() {
        bankrollEl.textContent = bankroll;
        updateChipsDisplay();
        adjustLayout();
    }

    function updateBetDisplay() {
        betAmountEl.textContent = currentBet;
    }

    function updateChipsDisplay() {
        const chips = document.querySelectorAll('.chip');
        
        if (bankroll >= 1000) {
            chips[0].textContent = '500';
            chips[1].textContent = '200';
            chips[2].textContent = '100';
        } else if (bankroll >= 500) {
            chips[0].textContent = '200';
            chips[1].textContent = '100';
            chips[2].textContent = '50';
        } else if (bankroll >= 200) {
            chips[0].textContent = '100';
            chips[1].textContent = '50';
            chips[2].textContent = '25';
        } else {
            chips[0].textContent = '50';
            chips[1].textContent = '25';
            chips[2].textContent = '10';
        }
    }

    function updateCountDisplay() {
        const trueCount = Math.round(runningCount / decksRemaining);
        trueCountEl.textContent = trueCount;
        runningCountEl.textContent = runningCount;
        cardsRemainingEl.textContent = deck.length;
        
        if (trueCount >= 3) {
            trueCountEl.className = 'win';
        } else if (trueCount <= -3) {
            trueCountEl.className = 'lose';
        } else {
            trueCountEl.className = '';
        }
    }

    function showMessage(msgKey) {
        messageBoxEl.innerHTML = `<p>${messages[msgKey] || msgKey}</p>`;
    }

    function createConfetti() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = Math.random() * 10 + 5 + 'px';
            confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }

    function adjustLayout() {
        const gameContainer = document.querySelector('.game-container');
        const windowHeight = window.innerHeight;
        const containerHeight = gameContainer.offsetHeight;
        
        if (containerHeight > windowHeight * 0.9) {
            const scale = (windowHeight * 0.9) / containerHeight;
            gameContainer.style.transform = `scale(${Math.min(scale, 1)})`;
        } else {
            gameContainer.style.transform = 'scale(1)';
        }
    }

    function enableGameControls() {
        hitBtn.disabled = false;
        standBtn.disabled = false;
        doubleBtn.disabled = (playerHand.length !== 2 || currentBet > bankroll);
        dealBtn.disabled = true;
    }

    function disableGameControls() {
        hitBtn.disabled = true;
        standBtn.disabled = true;
        doubleBtn.disabled = true;
        dealBtn.disabled = false;
    }

    function enableBetControls() {
        increaseBetBtn.disabled = false;
        decreaseBetBtn.disabled = false;
        allInBtn.disabled = false;
    }

    function disableBetControls() {
        increaseBetBtn.disabled = true;
        decreaseBetBtn.disabled = true;
        allInBtn.disabled = true;
    }

    // Event listeners
    dealBtn.addEventListener('click', deal);
    hitBtn.addEventListener('click', hit);
    standBtn.addEventListener('click', stand);
    doubleBtn.addEventListener('click', double);
    playAgainBtn.addEventListener('click', () => {
        resultModal.style.display = 'none';
    });
    restartGameBtn.addEventListener('click', restartGame);

    increaseBetBtn.addEventListener('click', () => {
        currentBet = Math.min(currentBet + 10, bankroll);
        updateBetDisplay();
    });

    decreaseBetBtn.addEventListener('click', () => {
        currentBet = Math.max(currentBet - 10, 10);
        updateBetDisplay();
    });

    allInBtn.addEventListener('click', () => {
        currentBet = bankroll;
        updateBetDisplay();
    });

    // Ajustes iniciais
    window.addEventListener('resize', adjustLayout);
    window.addEventListener('load', adjustLayout);
    adjustLayout();
});
