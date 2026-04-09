import { TokatSaysGame } from '../../../../src/core/domain/game/TokatSaysGame';
import { LocalStorageGameStatsRepository } from '../../../../src/core/infrastructure/storage/LocalStorageGameStatsRepository';
import { SaveGameStatsUseCase } from '../../../../src/core/application/game/SaveGameStatsUseCase';

const statsRepository = new LocalStorageGameStatsRepository();
const saveStatsUseCase = new SaveGameStatsUseCase(statsRepository);

Page({
  data: {
    round: 0,
    tokensEarned: 0,
    sequenceLength: 0,

    isShowingSequence: false,
    isPlayerTurn: false,
    gameOver: false,

    gestureTimeLimit: 2500,
    showSpeed: 600,

    showTapButton: false,
    showTimer: false,
    timerPercent: 100,
    timerColor: '#38BDF8',

    tokatGestureText: '🐱',
    tokatGestureColor: '#ffffff',
    tokatBorderColor: '#38BDF8',

    statusText: 'Presiona EMPEZAR',
    statusColor: '#E2E8F0',

    showStartButton: true,

    upOpacity: 0.4,
    downOpacity: 0.4,
    leftOpacity: 0.4,
    rightOpacity: 0.4,
    tapOpacity: 0.4,

    isPaused: false,
    isCountingDown: false,
    countdownText: ''
  },

  onLoad() {
    this.game = new TokatSaysGame();
    this.gestureColors = {
      '↑': '#38BDF8',
      '↓': '#10B981',
      '←': '#F59E0B',
      '→': '#EF4444',
      '✦': '#A855F7'
    };

    this.sequenceTimers = [];
    this.gestureTimerTimeout = null;
    this.gestureTimerInterval = null;
    this.nextRoundTimeout = null;
    this.flashTimeouts = [];
  },

  onUnload() {
    this.cleanupTimers();
  },

  startGame() {
    this.cleanupTimers();
    this.game.start();

    this.setData({
      round: 0,
      tokensEarned: 0,
      sequenceLength: 0,
      isShowingSequence: false,
      isPlayerTurn: false,
      gameOver: false,

      showTapButton: false,
      showTimer: false,
      timerPercent: 100,
      timerColor: '#38BDF8',

      tokatGestureText: '🐱',
      tokatGestureColor: '#ffffff',
      tokatBorderColor: '#38BDF8',

      statusText: 'Tokat está listo...',
      statusColor: '#E2E8F0',

      showStartButton: false,

      upOpacity: 0.4,
      downOpacity: 0.4,
      leftOpacity: 0.4,
      rightOpacity: 0.4,
      tapOpacity: 0.4
    });

    this.nextRound();
  },

  nextRound() {
    const roundData = this.game.nextRound();

    this.setData({
      round: roundData.round,
      sequenceLength: roundData.sequence.length,
      isShowingSequence: true,
      isPlayerTurn: false,
      showTapButton: roundData.showTapButton,
      showSpeed: roundData.showSpeed,
      gestureTimeLimit: roundData.timeLimit,
      
      showTimer: false,
      timerPercent: 100,
      timerColor: '#38BDF8',
      
      tokatGestureText: '🐱',
      tokatGestureColor: '#ffffff',
      tokatBorderColor: '#38BDF8',
      
      statusText: 'Tokat está mostrando...',
      statusColor: '#38BDF8'
    });

    this.setButtonsEnabled(false);
    this.showSequence(roundData.sequence, roundData.showSpeed);
  },

  showSequence(sequence, speed) {
    if (this.data.isPaused || this.data.isCountingDown) return;

    this.cleanupSequenceTimers();

    sequence.forEach((gesture, index) => {
      const timer = setTimeout(() => {
        if (this.data.gameOver || this.data.isPaused || this.data.isCountingDown) return;

        const color = this.gestureColors[gesture] || '#ffffff';

        this.setData({
          tokatGestureText: gesture,
          tokatGestureColor: color,
          tokatBorderColor: color
        });

        this.flashGesture(gesture);

        const resetTimer = setTimeout(() => {
          if (this.data.gameOver || this.data.isPaused || this.data.isCountingDown) return;
          this.setData({
            tokatBorderColor: '#38BDF8'
          });
        }, Math.floor(speed * 0.7));

        this.flashTimeouts.push(resetTimer);
      }, speed * (index + 1));

      this.sequenceTimers.push(timer);
    });

    const turnTimer = setTimeout(() => {
      if (this.data.gameOver || this.data.isPaused || this.data.isCountingDown) return;
      this.startPlayerTurn();
    }, speed * (sequence.length + 1.5));

    this.sequenceTimers.push(turnTimer);
  },

  startPlayerTurn() {
    if (this.data.isPaused || this.data.isCountingDown) return;

    this.setData({
      isShowingSequence: false,
      isPlayerTurn: true,
      tokatGestureText: '🤔',
      tokatGestureColor: '#ffffff',
      statusText: `¡Tu turno! (${this.data.sequenceLength} gestos)`,
      statusColor: '#10B981'
    });

    this.setButtonsEnabled(true);

    if (this.data.round >= 5) {
      this.setData({ showTimer: true });
      this.startGestureTimer();
    }
  },

  startGestureTimer() {
    this.clearGestureTimer();

    const total = this.data.gestureTimeLimit;
    const start = Date.now();

    this.setData({
      timerPercent: 100,
      timerColor: '#38BDF8'
    });

    this.gestureTimerInterval = setInterval(() => {
      if (this.data.gameOver || !this.data.isPlayerTurn || this.data.isPaused || this.data.isCountingDown) {
        this.clearGestureTimer();
        return;
      }

      const elapsed = Date.now() - start;
      const remaining = Math.max(0, total - elapsed);
      const percent = Math.max(0, (remaining / total) * 100);

      let color = '#38BDF8';
      const progress = elapsed / total;

      if (progress > 0.7) {
        color = '#EF4444';
      } else if (progress > 0.4) {
        color = '#F59E0B';
      }

      this.setData({
        timerPercent: percent,
        timerColor: color
      });
    }, 50);

    this.gestureTimerTimeout = setTimeout(() => {
      if (this.data.gameOver || !this.data.isPlayerTurn || this.data.isPaused || this.data.isCountingDown) return;
      this.endGame();
    }, total);
  },

  onGestureTap(e) {
    const gesture = e.currentTarget.dataset.gesture;

    if (!this.data.isPlayerTurn || this.data.gameOver || this.data.isPaused || this.data.isCountingDown) return;
    if (gesture === '✦' && !this.data.showTapButton) return;

    this.flashGesture(gesture);
    
    // Pass logic to the domain game engine
    const result = this.game.handlePlayerInput(gesture);

    if (result.status === 'WRONG') {
      this.endGame();
      return;
    }

    if (this.data.round >= 5 && result.status !== 'ROUND_COMPLETE') {
      this.startGestureTimer();
    }

    if (result.status === 'ROUND_COMPLETE') {
      this.handleRoundComplete(result.tokensEarned);
    }
  },

  handleRoundComplete(tokensEarned) {
    this.setData({
      isPlayerTurn: false,
      showTimer: false,
      tokensEarned: tokensEarned,
      statusText: '¡Correcto! 🎉',
      statusColor: '#10B981',
      tokatGestureText: '😼',
      tokatGestureColor: '#ffffff',
      tokatBorderColor: '#10B981'
    });

    this.setButtonsEnabled(false);
    this.clearGestureTimer();

    this.nextRoundTimeout = setTimeout(() => {
      if (!this.data.gameOver && !this.data.isPaused && !this.data.isCountingDown) {
        this.nextRound();
      }
    }, 1200);
  },

  endGame() {
    if (this.data.gameOver) return;

    this.cleanupTimers();

    const gameState = this.game.getState();

    // Use Application Layer to persist tokens and high score
    saveStatsUseCase.execute({
      gameId: 'tokat_says',
      tokensEarned: gameState.tokensEarned,
      currentScore: gameState.round
    });

    this.setData({
      gameOver: true,
      isPlayerTurn: false,
      showTimer: false,
      statusText: `¡Game Over! Ronda ${gameState.round}`,
      statusColor: '#EF4444',
      tokatGestureText: '😿',
      tokatGestureColor: '#ffffff',
      tokatBorderColor: '#EF4444'
    });

    setTimeout(() => {
      my.redirectTo({
        url: `/pages/tokat-says/pages/end/end?round=${gameState.round}&tokens=${gameState.tokensEarned}&sequenceLen=${gameState.sequence.length}`
      });
    }, 700);
  },

  setButtonsEnabled(enabled) {
    const activeOpacity = enabled ? 1 : 0.4;
    const tapOpacity = enabled && this.data.showTapButton ? 1 : 0.4;

    this.setData({
      upOpacity: activeOpacity,
      downOpacity: activeOpacity,
      leftOpacity: activeOpacity,
      rightOpacity: activeOpacity,
      tapOpacity: tapOpacity
    });
  },

  flashGesture(gesture) {
    const resetValue = this.data.isPlayerTurn ? 1 : 0.4;

    if (gesture === '↑') { this.setData({ upOpacity: 1 }); this.scheduleOpacityReset('upOpacity', resetValue); }
    if (gesture === '↓') { this.setData({ downOpacity: 1 }); this.scheduleOpacityReset('downOpacity', resetValue); }
    if (gesture === '←') { this.setData({ leftOpacity: 1 }); this.scheduleOpacityReset('leftOpacity', resetValue); }
    if (gesture === '→') { this.setData({ rightOpacity: 1 }); this.scheduleOpacityReset('rightOpacity', resetValue); }
    if (gesture === '✦') { this.setData({ tapOpacity: 1 }); this.scheduleOpacityReset('tapOpacity', this.data.showTapButton ? resetValue : 0.4); }
  },

  scheduleOpacityReset(key, value) {
    const timer = setTimeout(() => {
      if (this.data.gameOver || this.data.isPaused || this.data.isCountingDown) return;
      const payload = {};
      payload[key] = value;
      this.setData(payload);
    }, 180);

    this.flashTimeouts.push(timer);
  },

  cleanupSequenceTimers() {
    if (this.sequenceTimers && this.sequenceTimers.length) {
      this.sequenceTimers.forEach(timer => clearTimeout(timer));
    }
    this.sequenceTimers = [];
  },

  clearGestureTimer() {
    if (this.gestureTimerTimeout) {
      clearTimeout(this.gestureTimerTimeout);
      this.gestureTimerTimeout = null;
    }
    if (this.gestureTimerInterval) {
      clearInterval(this.gestureTimerInterval);
      this.gestureTimerInterval = null;
    }
  },

  cleanupTimers() {
    this.cleanupSequenceTimers();
    this.clearGestureTimer();
    if (this.nextRoundTimeout) clearTimeout(this.nextRoundTimeout);
    if (this.flashTimeouts && this.flashTimeouts.length) {
      this.flashTimeouts.forEach(timer => clearTimeout(timer));
    }
    this.flashTimeouts = [];
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  },

  togglePause() {
    if (this.data.gameOver || this.data.isCountingDown || this.data.showStartButton) return;

    if (!this.data.isPaused) {
      this.cleanupTimers();
      this.setData({ isPaused: true });
    } else {
      this.startCountdown();
    }
  },

  startCountdown() {
    this.setData({
      isPaused: false,
      isCountingDown: true,
      countdownText: "3"
    });

    let count = 3;
    this.countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        this.setData({ countdownText: count.toString() });
      } else if (count === 0) {
        this.setData({ countdownText: "¡YA!" });
      } else {
        clearInterval(this.countdownInterval);
        this.setData({ isCountingDown: false });
        
        const state = this.game.getState();
        if (this.data.isShowingSequence) {
          this.showSequence(state.sequence, this.data.showSpeed);
        } else if (this.data.isPlayerTurn) {
          this.startPlayerTurn();
        }
      }
    }, 1000);
  },

  exitGame() {
    my.redirectTo({
      url: '/pages/tokat-says/pages/index/index'
    });
  }
});
