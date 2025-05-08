document.addEventListener('DOMContentLoaded', () => {
    const game = new BlackjackGame();
    const ui = new BlackjackUI(game);
    
    // Adicionar jogador inicial
    game.addPlayer('Jogador 1');
    ui.updateUI();
    ui.showMessage("Bem-vindo ao Blackjack Premium! Clique em 'Novo Jogo' para começar.", 3000);
});