export class DetectiveTokatGame {
  constructor(category, totalQuestions, mode) {
    this.category = category || 'cultura';
    this.totalQuestions = totalQuestions || 10;
    this.mode = mode || 'short';
    
    this.state = {
      score: 0,
      correctCount: 0,
      lives: this.mode === 'infinite' ? 3 : 0,
      currentIndex: 0
    };
  }

  evaluateAnswer(isCorrect) {
     if (isCorrect) {
         this.state.score += 10;
         this.state.correctCount += 1;
         return { status: 'CORRECT' };
     } else {
         if (this.mode === 'infinite') {
             this.state.lives = Math.max(0, this.state.lives - 1);
             if (this.state.lives <= 0) return { status: 'DEAD', lives: 0 };
             return { status: 'WRONG_ALIVE', lives: this.state.lives };
         }
         return { status: 'WRONG' };
     }
  }

  handleTimeExpired() {
      if (this.mode === 'infinite') {
         this.state.lives = Math.max(0, this.state.lives - 1);
         if (this.state.lives <= 0) return { status: 'DEAD', lives: 0 };
         return { status: 'EXPIRED_ALIVE', lives: this.state.lives };
      }
      return { status: 'EXPIRED' };
  }

  nextQuestion() {
      this.state.currentIndex += 1;
      return this.state.currentIndex;
  }

  isGameOver(poolLength) {
     if (this.totalQuestions > 0 && this.state.currentIndex >= this.totalQuestions) return true;
     return false; // For infinite that automatically expands pool
  }

  revive(lives = 1) {
    this.state.lives = Math.max(this.state.lives, lives);
  }

  getState() { 
    return { ...this.state }; 
  }
}
