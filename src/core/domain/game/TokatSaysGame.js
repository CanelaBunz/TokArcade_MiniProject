export class TokatSaysGame {
  constructor() {
    this.gestures = ['↑', '↓', '←', '→'];
    this.gesturesWithTap = ['↑', '↓', '←', '→', '✦'];
    
    this.state = {
      round: 0,
      sequence: [],
      playerIndex: 0,
      tokensEarned: 0
    };
  }

  start() {
    this.state = {
      round: 0,
      sequence: [],
      playerIndex: 0,
      tokensEarned: 0
    };
  }

  nextRound() {
    this.state.round += 1;
    this.state.playerIndex = 0;

    const availableGestures = this.state.round >= 5 ? this.gesturesWithTap : this.gestures;
    const newGesture = availableGestures[Math.floor(Math.random() * availableGestures.length)];
    this.state.sequence.push(newGesture);

    return {
      round: this.state.round,
      sequence: this.state.sequence,
      showSpeed: this.calculateSpeed(this.state.round),
      timeLimit: this.calculateTimeLimit(this.state.round),
      showTapButton: this.state.round >= 5
    };
  }

  handlePlayerInput(gesture) {
    const expected = this.state.sequence[this.state.playerIndex];

    if (gesture !== expected) {
      return { status: 'WRONG' };
    }

    this.state.playerIndex += 1;

    if (this.state.playerIndex >= this.state.sequence.length) {
      // Round Complete
      if (this.state.round >= 5 && this.state.round % 5 === 0) {
        this.state.tokensEarned += 1;
      }
      return { status: 'ROUND_COMPLETE', tokensEarned: this.state.tokensEarned, nextIndex: this.state.playerIndex };
    }

    return { status: 'CORRECT', nextIndex: this.state.playerIndex };
  }

  calculateSpeed(round) {
    return Math.max(300, 600 - (round - 1) * 25);
  }

  calculateTimeLimit(round) {
    if (round < 5) return 0;
    return Math.max(1200, 2500 - (round - 5) * 150);
  }

  revive() {
    this.state.playerIndex = 0;
    // Generate a fresh sequence for the current round
    this.state.sequence = [];
    const availableGestures = this.state.round >= 5 ? this.gesturesWithTap : this.gestures;
    for (let i = 0; i < this.state.round; i++) {
      const newGesture = availableGestures[Math.floor(Math.random() * availableGestures.length)];
      this.state.sequence.push(newGesture);
    }
    
    return {
      round: this.state.round,
      sequence: this.state.sequence,
      showSpeed: this.calculateSpeed(this.state.round),
      timeLimit: this.calculateTimeLimit(this.state.round)
    };
  }

  getState() {
    return { ...this.state };
  }
}
