export class SaveGameStatsUseCase {
  constructor(statsRepository) {
    this.statsRepository = statsRepository;
  }

  execute({ gameId, tokensEarned, currentScore }) {
    if (tokensEarned > 0) {
      this.statsRepository.saveTokens(tokensEarned);
    }
    
    if (currentScore > 0 && gameId) {
      this.statsRepository.saveHighScore(gameId, currentScore);
    }

    return {
      totalTokens: this.statsRepository.getTokens(),
      highScore: gameId ? this.statsRepository.getHighScore(gameId) : 0
    };
  }
}
