Page({
  data: {
    round: 0,
    sequence: [],
    playerIndex: 0,
    isShowingSequence: false,
    isPlayerTurn: false,
    gameOver: false,

    tokensEarned: 0,

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
    tapOpacity: 0.4
  },

  onLoad() {
    this.gestures = ['↑', '↓', '←', '→'];
    this.gesturesWithTap = ['↑', '↓', '←', '→', '✦'];

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

    this.setData({
      round: 0,
      sequence: [],
      playerIndex: 0,
      isShowingSequence: false,
      isPlayerTurn: false,
      gameOver: false,

      tokensEarned: 0,

      gestureTimeLimit: 2500,
      showSpeed: 600,

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
    const nextRound = this.data.round + 1;

    const availableGestures = nextRound >= 5 ? this.gesturesWithTap : this.gestures;
    const newGesture = availableGestures[Math.floor(Math.random() * availableGestures.length)];
    const nextSequence = this.data.sequence.concat(newGesture);

    const nextShowSpeed = Math.max(300, 600 - (nextRound - 1) * 25);
    let nextGestureTimeLimit = this.data.gestureTimeLimit;

    if (nextRound >= 5) {
      nextGestureTimeLimit = Math.max(1200, 2500 - (nextRound - 5) * 150);
    }

    this.setData({
      round: nextRound,
      sequence: nextSequence,
      playerIndex: 0,
      isShowingSequence: true,
      isPlayerTurn: false,
      showTapButton: nextRound >= 5,
      showSpeed: nextShowSpeed,
      gestureTimeLimit: nextGestureTimeLimit,
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
    this.showSequence();
  },

  showSequence() {
    const sequence = this.data.sequence;
    const speed = this.data.showSpeed;

    this.cleanupSequenceTimers();

    sequence.forEach((gesture, index) => {
      const timer = setTimeout(() => {
        if (this.data.gameOver) return;

        const color = this.gestureColors[gesture] || '#ffffff';

        this.setData({
          tokatGestureText: gesture,
          tokatGestureColor: color,
          tokatBorderColor: color
        });

        this.flashGesture(gesture);

        const resetTimer = setTimeout(() => {
          if (this.data.gameOver) return;
          this.setData({
            tokatBorderColor: '#38BDF8'
          });
        }, Math.floor(speed * 0.7));

        this.flashTimeouts.push(resetTimer);
      }, speed * (index + 1));

      this.sequenceTimers.push(timer);
    });

    const turnTimer = setTimeout(() => {
      if (this.data.gameOver) return;
      this.startPlayerTurn();
    }, speed * (sequence.length + 1.5));

    this.sequenceTimers.push(turnTimer);
  },

  startPlayerTurn() {
    this.setData({
      isShowingSequence: false,
      isPlayerTurn: true,
      playerIndex: 0,
      tokatGestureText: '🤔',
      tokatGestureColor: '#ffffff',
      statusText: `¡Tu turno! (${this.data.sequence.length} gestos)`,
      statusColor: '#10B981'
    });

    this.setButtonsEnabled(true);

    if (this.data.round >= 5) {
      this.setData({
        showTimer: true
      });
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
      if (this.data.gameOver || !this.data.isPlayerTurn) {
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
      if (this.data.gameOver || !this.data.isPlayerTurn) return;
      this.endGame();
    }, total);
  },

  onGestureTap(e) {
    const gesture = e.currentTarget.dataset.gesture;

    if (!this.data.isPlayerTurn || this.data.gameOver) return;

    if (gesture === '✦' && !this.data.showTapButton) return;

    this.flashGesture(gesture);
    this.handlePlayerInput(gesture);
  },

  handlePlayerInput(gesture) {
    const expected = this.data.sequence[this.data.playerIndex];

    if (gesture !== expected) {
      this.endGame();
      return;
    }

    const nextIndex = this.data.playerIndex + 1;

    this.setData({
      playerIndex: nextIndex
    });

    if (this.data.round >= 5 && nextIndex < this.data.sequence.length) {
      this.startGestureTimer();
    }

    if (nextIndex >= this.data.sequence.length) {
      this.handleRoundComplete();
    }
  },

  handleRoundComplete() {
    this.setData({
      isPlayerTurn: false
    });

    this.setButtonsEnabled(false);
    this.clearGestureTimer();

    this.setData({
      showTimer: false
    });

    this.checkTokenReward();

    this.setData({
      statusText: '¡Correcto! 🎉',
      statusColor: '#10B981',
      tokatGestureText: '😼',
      tokatGestureColor: '#ffffff',
      tokatBorderColor: '#10B981'
    });

    this.nextRoundTimeout = setTimeout(() => {
      if (!this.data.gameOver) {
        this.nextRound();
      }
    }, 1200);
  },

  checkTokenReward() {
    if (this.data.round >= 5 && this.data.round % 5 === 0) {
      this.setData({
        tokensEarned: this.data.tokensEarned + 1
      });
    }
  },

  endGame() {
    if (this.data.gameOver) return;

    this.cleanupTimers();

    this.setData({
      gameOver: true,
      isPlayerTurn: false,
      showTimer: false,
      statusText: `¡Game Over! Ronda ${this.data.round}`,
      statusColor: '#EF4444',
      tokatGestureText: '😿',
      tokatGestureColor: '#ffffff',
      tokatBorderColor: '#EF4444'
    });

    setTimeout(() => {
      my.redirectTo({
        url: `/pages/end/end?round=${this.data.round}&tokens=${this.data.tokensEarned}&sequenceLen=${this.data.sequence.length}`
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

    if (gesture === '↑') {
      this.setData({ upOpacity: 1 });
      this.scheduleOpacityReset('upOpacity', resetValue);
    }

    if (gesture === '↓') {
      this.setData({ downOpacity: 1 });
      this.scheduleOpacityReset('downOpacity', resetValue);
    }

    if (gesture === '←') {
      this.setData({ leftOpacity: 1 });
      this.scheduleOpacityReset('leftOpacity', resetValue);
    }

    if (gesture === '→') {
      this.setData({ rightOpacity: 1 });
      this.scheduleOpacityReset('rightOpacity', resetValue);
    }

    if (gesture === '✦') {
      this.setData({ tapOpacity: 1 });
      this.scheduleOpacityReset('tapOpacity', this.data.showTapButton ? resetValue : 0.4);
    }
  },

  scheduleOpacityReset(key, value) {
    const timer = setTimeout(() => {
      if (this.data.gameOver) return;
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

    if (this.nextRoundTimeout) {
      clearTimeout(this.nextRoundTimeout);
      this.nextRoundTimeout = null;
    }

    if (this.flashTimeouts && this.flashTimeouts.length) {
      this.flashTimeouts.forEach(timer => clearTimeout(timer));
    }
    this.flashTimeouts = [];
  }
});