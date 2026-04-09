import { TokatSaysGame } from '../../../../src/core/domain/game/TokatSaysGame';
import { LocalStorageGameStatsRepository } from '../../../../src/core/infrastructure/storage/LocalStorageGameStatsRepository';
import { SaveGameStatsUseCase } from '../../../../src/core/application/game/SaveGameStatsUseCase';
import { AlipayPaymentRepository } from '../../../../src/core/infrastructure/alipay/AlipayPaymentRepository';
import { ProcessGamePaymentUseCase } from '../../../../src/core/application/game/ProcessGamePaymentUseCase';
import { VerifyGamePaymentUseCase } from '../../../../src/core/application/game/VerifyGamePaymentUseCase';
import { HttpClient } from '../../../../src/core/infrastructure/http/HttpClient';

const statsRepository = new LocalStorageGameStatsRepository();
const saveStatsUseCase = new SaveGameStatsUseCase(statsRepository);

const httpClient = new HttpClient(getApp().globalData.apiBaseUrl, getApp().globalData.appId);
const paymentRepository = new AlipayPaymentRepository(httpClient);
const processPaymentUseCase = new ProcessGamePaymentUseCase(paymentRepository);
const verifyPaymentUseCase = new VerifyGamePaymentUseCase(paymentRepository, statsRepository);

const BASE = '/images/tokat/';

const FRAMES = {
  idle: [0, 1, 2, 3, 4, 5, 6].map(i => `${BASE}frame${String(i).padStart(4, '0')}.png`),
  neutral: [`${BASE}TBO0000.png`],
  up: [0, 1, 2, 3, 4, 5, 6].map(i => `${BASE}TW${String(i).padStart(4, '0')}.png`),
  down: [0, 1, 2, 3, 4, 5].map(i => `${BASE}TL1${String(i).padStart(4, '0')}.png`),
  left: [
    `${BASE}TBO0000.png`, `${BASE}TBO0001.png`, `${BASE}TBO0002.png`, `${BASE}TBO0003.png`,
    `${BASE}TBP0000.png`, `${BASE}TBP0001.png`
  ],
  right: [0, 1, 2, 3].map(i => `${BASE}TBPa${String(i).padStart(4, '0')}.png`),
  center: [0, 1, 2].map(i => `${BASE}TR${String(i).padStart(4, '0')}.png`)
};

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

    tokatGestureText: '',
    tokatGestureColor: '#ffffff',
    tokatBorderColor: '#38BDF8',
    tokatSprite: FRAMES.neutral[0],

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
    countdownText: '',
    showContinueModal: false
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

    this._animTimer = null;
    this._animQueue = null;

    // Start with Idle Animation
    this._loopAnim(FRAMES.idle, 7);
  },

  onUnload() {
    this.cleanupTimers();
  },

  // ─── Animation System ─────────────────────────────────────────────────────────

  _loopAnim(frames, fps) {
    this._stopAnim();
    let pointer = 0;
    const delay = Math.floor(1000 / fps);
    const seq = [...frames, ...[...frames].reverse().slice(1, -1)];
    this.setData({ tokatSprite: seq[0] });

    this._animTimer = setInterval(() => {
      pointer = (pointer + 1) % seq.length;
      this.setData({ tokatSprite: seq[pointer] });
    }, delay);
  },

  _onceAnim(frames, totalDuration, onDone) {
    this._stopAnim();
    if (!frames || frames.length === 0) {
      if (onDone) onDone();
      return;
    }

    const delay = Math.floor(totalDuration / frames.length);
    let pointer = 0;
    this.setData({ tokatSprite: frames[0] });

    const tick = () => {
      pointer++;
      if (pointer < frames.length) {
        this.setData({ tokatSprite: frames[pointer] });
        this._animQueue = setTimeout(tick, delay);
      } else {
        if (onDone) onDone();
      }
    };

    this._animQueue = setTimeout(tick, delay);
  },

  _stopAnim() {
    if (this._animTimer) {
      clearInterval(this._animTimer);
      this._animTimer = null;
    }
    if (this._animQueue) {
      clearTimeout(this._animQueue);
      this._animQueue = null;
    }
  },

  _setNeutral() {
    this._stopAnim();
    this.setData({ tokatSprite: FRAMES.neutral[0] });
  },

  playGestureAnim(gesture, duration) {
    // Determine frames based on gesture
    let frames = FRAMES.neutral;
    if (gesture === '↑') frames = FRAMES.up;
    if (gesture === '↓') frames = FRAMES.down;
    if (gesture === '←') frames = FRAMES.left;
    if (gesture === '→') frames = FRAMES.right;
    if (gesture === '✦') frames = FRAMES.center;

    // Scale duration to fit the gesture showcase period (usually ~70% of showSpeed)
    // We add a tiny offset so it completes before resetting to neutral
    this._onceAnim(frames, duration, () => {
       // Revert back directly to neutral after gesture is done
       this._setNeutral();
    });
  },

  // ─── Game Logic ─────────────────────────────────────────────────────────────

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

      tokatGestureText: '',
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
      
      tokatGestureText: '',
      tokatGestureColor: '#ffffff',
      tokatBorderColor: '#38BDF8',
      
      statusText: 'Tokat está mostrando...',
      statusColor: '#38BDF8'
    });

    this.setButtonsEnabled(false);
    
    // Set to neutral state when Tokat starts showing
    this._setNeutral();
    
    // Add small delay before showing sequence
    this.nextRoundTimeout = setTimeout(() => {
      this.showSequence(roundData.sequence, roundData.showSpeed);
    }, 500);
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
        
        const animDuration = Math.floor(speed * 0.7);
        this.playGestureAnim(gesture, animDuration);

        const resetTimer = setTimeout(() => {
          if (this.data.gameOver || this.data.isPaused || this.data.isCountingDown) return;
          this.setData({
            tokatBorderColor: '#38BDF8',
            tokatGestureText: ''
          });
        }, animDuration);

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
      tokatGestureText: '',
      tokatGestureColor: '#ffffff',
      statusText: `¡Tu turno! (${this.data.sequenceLength} gestos)`,
      statusColor: '#10B981'
    });

    // Animate idle while waiting for player
    this._loopAnim(FRAMES.idle, 7);

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
      this.showPayToContinue();
    }, total);
  },

  onGestureTap(e) {
    const gesture = e.currentTarget.dataset.gesture;

    if (!this.data.isPlayerTurn || this.data.gameOver || this.data.isPaused || this.data.isCountingDown) return;
    if (gesture === '✦' && !this.data.showTapButton) return;

    this.flashGesture(gesture);
    
    // Animate player gesture on Tokat slightly
    this.playGestureAnim(gesture, 300);
    // Overwrite the timeout to revert to idle instead of neutral since it's player turn
    setTimeout(() => {
      if (this.data.isPlayerTurn && !this.data.gameOver) {
        this._loopAnim(FRAMES.idle, 7);
      }
    }, 300);

    const result = this.game.handlePlayerInput(gesture);

    if (result.status === 'WRONG') {
      this.showPayToContinue();
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
      tokatGestureText: '',
      tokatGestureColor: '#ffffff',
      tokatBorderColor: '#10B981'
    });

    // Play a happy gesture briefly
    this._onceAnim(FRAMES.up, 600, () => this._setNeutral());

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
      tokatGestureText: '',
      tokatGestureColor: '#ffffff',
      tokatBorderColor: '#EF4444'
    });

    // Sad animation for losing
    this._onceAnim(FRAMES.down, 600, () => {
      setTimeout(() => {
        my.redirectTo({
          url: `/pages/tokat-says/pages/end/end?round=${gameState.round}&tokens=${gameState.tokensEarned}&sequenceLen=${gameState.sequence.length}`
        });
      }, 700);
    });
  },

  showPayToContinue() {
    this.cleanupTimers();
    this.setData({
      showContinueModal: true,
      isPlayerTurn: false,
      showTimer: false
    });
  },

  async onContinuePay() {
    const app = getApp();
    my.showLoading({ content: 'Procesando pago...' });
    
    try {
      const response = await processPaymentUseCase.execute({
        userId: app.globalData.userId,
        accessToken: app.globalData.accessToken,
        gameId: 'tokat_says',
        amount: 0.01
      });

      my.hideLoading();
      
      my.call('pay', {
        paymentUrl: response.paymentUrl,
        success: async (res) => {
          my.showLoading({ content: 'Verificando pago...' });
          
          try {
            const isVerified = await verifyPaymentUseCase.execute({
              paymentId: response.paymentId,
              accessToken: app.globalData.accessToken,
              gameId: 'tokat_says',
              amount: 0.01
            });

            my.hideLoading();

            if (isVerified) {
              console.log('Pago verificado exitosamente');
              this.reviveGame();
            } else {
              my.showToast({ content: 'El pago no se concretó' });
            }
          } catch (verifyError) {
            my.hideLoading();
            console.error('Error verificando pago', verifyError);
            my.showToast({ content: 'Error verificando pago' });
          }
        },
        fail: (err) => {
          console.error('Error en pago', err);
          my.showToast({ content: 'Pago cancelado o fallido' });
        }
      });
    } catch (error) {
      my.hideLoading();
      console.warn('[Demo Mode] Pago simulado - servidor no disponible:', error.message);
      my.showToast({ content: '¡Vida extra gratis! (Demo)' });
      this.reviveGame();
    }
  },

  onCancelContinue() {
    this.setData({ showContinueModal: false });
    this.endGame();
  },

  reviveGame() {
    const roundData = this.game.revive();
    
    this.setData({
      showContinueModal: false,
      gameOver: false,
      round: roundData.round,
      sequenceLength: roundData.sequence.length,
      isShowingSequence: true,
      isPlayerTurn: false,
      showTimer: false,
      statusText: '¡Revivido! Tokat genera nueva secuencia...',
      statusColor: '#38BDF8',
      tokatBorderColor: '#38BDF8'
    });

    this.setButtonsEnabled(false);
    this._setNeutral();

    this.nextRoundTimeout = setTimeout(() => {
      this.showSequence(roundData.sequence, roundData.showSpeed);
    }, 1500);
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
    this._stopAnim();
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
