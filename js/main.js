document.addEventListener('DOMContentLoaded', () => {
    const game = new BlackjackGame();
    const ui = new BlackjackUI(game);
    
    // Adicionar jogador inicial
    game.addPlayer('Jogador 1');
    ui.updateUI();
    
    // Configurar evento de mudança de cor da mesa
    document.getElementById('table-color').addEventListener('change', (e) => {
        document.getElementById('game-table').style.backgroundColor = e.target.value;
    });
    
    // Mostrar mensagem inicial
    ui.showMessage("Bem-vindo ao Blackjack Premium! Clique em 'Novo Jogo' para começar.", 3000);
});