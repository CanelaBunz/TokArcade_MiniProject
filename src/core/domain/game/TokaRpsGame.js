export class TokaRpsGame {
  constructor() {
    this.choices = ["Piedra", "Papel", "Tijeras"];
    this.winPoints = 16;
    this.drawStreakGoal = 4;
    this.maxProgress = 150;
    
    this.state = {
      progress: 0,
      drawStreakCount: 0,
      totalTime: 50000,
      remainingTime: 50000,
    };
  }

  start() {
    this.state.progress = 0;
    this.state.drawStreakCount = 0;
    this.state.remainingTime = this.state.totalTime;
  }

  getTokatChoice() {
      return this.choices[Math.floor(Math.random() * this.choices.length)];
  }

  evaluateRound(playerChoice, tokatChoice) {
      if (playerChoice === tokatChoice) return "draw";
      if (
        (playerChoice === "Piedra" && tokatChoice === "Tijeras") ||
        (playerChoice === "Papel" && tokatChoice === "Piedra") ||
        (playerChoice === "Tijeras" && tokatChoice === "Papel")
      ) {
        return "win";
      }
      return "lose";
  }

  handleResult(result) {
      if (result === 'win') {
          this.state.progress = Math.min(this.maxProgress, this.state.progress + this.winPoints);
          this.state.drawStreakCount = 0;
          return { status: 'WIN', progress: this.state.progress };
      }
      if (result === 'draw') {
          this.state.drawStreakCount += 1;
          if (this.state.drawStreakCount >= this.drawStreakGoal) {
              this.state.progress = Math.min(this.maxProgress, this.state.progress + this.winPoints);
              this.state.drawStreakCount = 0;
              return { status: 'DRAW_CONVERTED', progress: this.state.progress };
          }
          return { status: 'DRAW', streak: this.state.drawStreakCount };
      }
      
      this.state.drawStreakCount = 0;
      return { status: 'LOSE' };
  }

  tickRemainingTime(ms) {
     this.state.remainingTime = Math.max(0, this.state.remainingTime - ms);
     return this.state.remainingTime;
  }

  getBeatWindow() {
    const elapsed = this.state.totalTime - this.state.remainingTime;
    const stage = Math.floor(elapsed / 5000);

    const initialBeat = 470;
    const minBeat = 220;
    const beat = Math.max(minBeat, initialBeat - stage * 35);

    const initialWindow = 360;
    const minWindow = 150;
    const choiceWindow = Math.max(minWindow, initialWindow - stage * 22);

    return { beat, choiceWindow };
  }

  isMaxProgress() {
      return this.state.progress >= this.maxProgress;
  }

  getState() { 
    return { ...this.state }; 
  }
}
