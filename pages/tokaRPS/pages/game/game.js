import { TokaRpsGame } from '../../../../src/core/domain/game/TokaRpsGame';
import { LocalStorageGameStatsRepository } from '../../../../src/core/infrastructure/storage/LocalStorageGameStatsRepository';
import { SaveGameStatsUseCase } from '../../../../src/core/application/game/SaveGameStatsUseCase';

const statsRepository = new LocalStorageGameStatsRepository();
const saveStatsUseCase = new SaveGameStatsUseCase(statsRepository);

Page({
  data: {
    totalTime: 50000,
    remainingTime: 50000,

    progress: 0,
    maxProgress: 150,

    drawStreakCount: 0,
    drawStreakGoal: 4,

    roundCount: 0,
    paceLabel: 'Suave',
    helperText: 'Escucha el ritmo',
    helperColor: '#8ec5ff',

    canChoose: false,
    roundResolved: false,
    gameEnded: false,
    inputLocked: false,

    roundToken: 0,

    timeText: 'Tiempo: 50.0',
    timeColor: '#ffffff',

    drawCounterText: 'Empates: 0/4',
    drawCounterColor: '#dfe6e9',

    progressPercent: 0,
    progressColor: '#74b9ff',

    tokatFrame: '/images/tokat/frame0000.png',
    tokatStateText: 'Preparado',

    rhythmText: 'Prepárate...',
    rhythmColor: '#ffffff',

    resultText: 'Espera a "TIJERAS"',
    enemyChoiceText: '',

    isPaused: false,
    isCountingDown: false,
    countdownText: '',
    showTutorialModal: false
  },

  onLoad(query) {
    this.game = new TokaRpsGame();

    this.wordTimers = [];
    this.choiceWindowTimer = null;
    this.nextExchangeTimer = null;
    this.globalTimer = null;
    this.countdownInterval = null;

    this.tokatAnimationTimer = null;
    this.tokatAnimations = this.buildTokatAnimations();

    this.playTokatAnimation('idle');

    if (query && query.skipTutorial === '1') {
      this.startGame();
    } else {
      this.setData({
        showTutorialModal: true,
        rhythmText: 'Tutorial',
        resultText: 'Aprende el ritmo antes de empezar',
        helperText: 'Solo toca cuando aparezca ¡TIJERAS!',
        helperColor: '#55efc4',
        tokatStateText: 'Tokat te enseña el ritmo'
      });
    }
  },

  onUnload() {
    this.cleanupScene();
  },

  buildTokatAnimations() {
    const base = '/images/tokat';

    const range = (prefix, count, startAt = 0, padLength = 4) => {
      const frames = [];
      for (let i = startAt; i < startAt + count; i += 1) {
        frames.push(`${base}/${prefix}${String(i).padStart(padLength, '0')}.png`);
      }
      return frames;
    };

    return {
      idle: {
        frames: range('frame', 7),
        sequence: [0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1],
        interval: 140
      },
      ready: {
        frames: range('TK', 6),
        sequence: [0, 1, 2, 3, 4, 5],
        interval: 95
      },
      beat_rock: {
        frames: range('TBP', 7),
        sequence: [0, 1, 2, 3, 4, 5, 6],
        interval: 90
      },
      beat_paper: {
        frames: range('TBPa', 4),
        sequence: [0, 1, 2, 3],
        interval: 90
      },
      beat_o: {
        frames: range('TBO', 7),
        sequence: [0, 1, 2, 3, 4, 5, 6],
        interval: 90
      },
      win: { // Cuando Tokat gana
        frames: range('TW', 7),
        sequence: [0, 1, 2, 3, 4, 5, 6],
        interval: 95
      },
      lose: { // Cuando Tokat pierde o hay empate
        frames: [
          `${base}/TL10000.png`,
          `${base}/TL10001.png`,
          `${base}/TL10002.png`,
          `${base}/TL10003.png`,
          `${base}/TL10004.png`,
          `${base}/TL10005.png`
        ],
        sequence: [0, 1, 2, 3, 4, 5],
        interval: 110
      },
      choice_scissors: {
        frames: range('TR', 1, 0), // TR0000.png
        sequence: [0],
        interval: 1000
      },
      choice_paper: {
        frames: range('TR', 1, 1), // TR0001.png
        sequence: [0],
        interval: 1000
      },
      choice_rock: {
        frames: range('TR', 1, 2), // TR0002.png
        sequence: [0],
        interval: 1000
      }
    };
  },

  playTokatAnimation(name, options = {}) {
    const animation = this.tokatAnimations[name] || this.tokatAnimations.idle;
    const once = !!options.once;
    const fallback = options.fallback !== undefined ? options.fallback : 'idle';
    const interval = options.duration ? Math.max(20, Math.floor(options.duration / animation.sequence.length)) : animation.interval;

    this.stopTokatAnimation();

    let pointer = 0;
    const firstIndex = animation.sequence[0] || 0;
    this.setData({ tokatFrame: animation.frames[firstIndex] });

    if (animation.sequence.length > 1) {
      this.tokatAnimationTimer = setInterval(() => {
        pointer += 1;

        if (pointer >= animation.sequence.length) {
          if (once) {
            this.stopTokatAnimation();
            if (fallback) {
              this.playTokatAnimation(fallback);
            }
            return;
          }
          pointer = 0;
        }

        const frameIndex = animation.sequence[pointer];
        this.setData({ tokatFrame: animation.frames[frameIndex] });
      }, interval);
    }
  },

  stopTokatAnimation() {
    if (this.tokatAnimationTimer) {
      clearInterval(this.tokatAnimationTimer);
      this.tokatAnimationTimer = null;
    }
  },

  beginFromTutorial() {
    this.setData({ showTutorialModal: false });
    this.startGame();
  },

  getFairBeatWindow() {
    const round = this.data.roundCount;
    const progress = Math.min(round / 26, 1);
    const eased = progress * progress * (3 - 2 * progress);

    const beat = Math.round(780 + (600 - 780) * eased);
    const choiceWindow = Math.round(950 + (760 - 950) * eased);
    const leadIn = Math.round(260 + (180 - 260) * eased);

    let paceLabel = 'Suave';
    if (progress >= 0.8) {
      paceLabel = 'Rápido';
    } else if (progress >= 0.45) {
      paceLabel = 'Medio';
    }

    return { beat, choiceWindow, leadIn, paceLabel };
  },

  getNextExchangeDelay() {
    const round = this.data.roundCount;
    const progress = Math.min(round / 26, 1);
    const eased = progress * progress * (3 - 2 * progress);
    return Math.round(980 + (760 - 980) * eased);
  },

  startGame() {
    this.clearRoundTimers();
    this.clearGlobalTimer();
    this.game.start();

    this.setData({
      totalTime: 50000,
      remainingTime: 50000,
      progress: 0,
      drawStreakCount: 0,
      roundCount: 0,
      paceLabel: 'Suave',
      helperText: 'Respira, el ritmo va a empezar',
      helperColor: '#a29bfe',
      canChoose: false,
      roundResolved: false,
      gameEnded: false,
      inputLocked: false,
      roundToken: 0,
      timeText: 'Tiempo: 50.0',
      timeColor: '#ffffff',
      drawCounterText: 'Empates: 0/4',
      drawCounterColor: '#dfe6e9',
      progressPercent: 0,
      progressColor: '#74b9ff',
      tokatFrame: '/images/tokat/frame0000.png',
      tokatStateText: 'Tokat se prepara',
      rhythmText: 'Listo...',
      rhythmColor: '#ffffff',
      resultText: 'Primero observa el ritmo',
      enemyChoiceText: '',
      isPaused: false,
      isCountingDown: false,
      countdownText: ''
    });

    this.updateDrawCounter();
    this.updateProgressBar();
    this.playTokatAnimation('idle');

    this.nextExchangeTimer = setTimeout(() => {
      if (this.data.gameEnded || this.data.isPaused || this.data.isCountingDown || this.data.showTutorialModal) return;
      this.startGlobalTimer();
      this.startExchange();
    }, 1800);
  },

  startGlobalTimer() {
    this.clearGlobalTimer();
    this.globalTimer = setInterval(() => {
      if (this.data.gameEnded || this.data.isPaused || this.data.isCountingDown || this.data.showTutorialModal) return;

      const remaining = this.game.tickRemainingTime(100);

      this.setData({ remainingTime: remaining });
      this.updateTimeLabel();

      if (remaining <= 0) {
        this.endGame(false);
      }
    }, 100);
  },

  clearGlobalTimer() {
    if (this.globalTimer) {
      clearInterval(this.globalTimer);
      this.globalTimer = null;
    }
  },

  updateTimeLabel() {
    const seconds = (this.data.remainingTime / 1000).toFixed(1);

    let color = '#ffffff';
    if (this.data.remainingTime <= 10000) {
      color = '#ff7675';
    } else if (this.data.remainingTime <= 25000) {
      color = '#ffd166';
    }

    this.setData({
      timeText: `Tiempo: ${seconds}`,
      timeColor: color
    });
  },

  updateDrawCounter() {
    const nearGoal = this.data.drawStreakCount >= this.data.drawStreakGoal - 1;

    this.setData({
      drawCounterText: `Empates: ${this.data.drawStreakCount}/${this.data.drawStreakGoal}`,
      drawCounterColor: nearGoal ? '#ffd166' : '#dfe6e9'
    });
  },

  updateProgressBar() {
    const percent = (this.data.progress / this.data.maxProgress) * 100;

    let color = '#74b9ff';
    if (this.data.progress >= 100) {
      color = '#00cec9';
    } else if (this.data.progress >= 50) {
      color = '#55efc4';
    }

    this.setData({
      progressPercent: percent,
      progressColor: color
    });
  },

  isRoundValid(token) {
    return !this.data.gameEnded &&
      !this.data.roundResolved &&
      token === this.data.roundToken;
  },

  startExchange() {
    if (this.data.gameEnded || this.data.isPaused || this.data.isCountingDown || this.data.showTutorialModal) return;

    this.clearRoundTimers();

    const token = this.data.roundToken + 1;
    const nextRound = this.data.roundCount + 1;
    const timing = this.getFairBeatWindow();
    const beat = timing.beat;
    const choiceWindow = timing.choiceWindow;
    const leadIn = timing.leadIn;

    this.setData({
      roundCount: nextRound,
      paceLabel: timing.paceLabel,
      roundToken: token,
      canChoose: false,
      roundResolved: false,
      inputLocked: false,
      helperText: 'Todavía no, entra en el ritmo',
      helperColor: '#8ec5ff',
      resultText: 'Espera a "TIJERAS"',
      enemyChoiceText: '',
      rhythmText: 'Escucha...',
      rhythmColor: '#ffffff',
      tokatStateText: 'Sigue el ritmo'
    });

    this.playTokatAnimation('ready');

    const words = [
      { text: 'PIEDRA', color: '#2ecc71' },
      { text: 'PAPEL', color: '#f39c12' },
      { text: 'O...', color: '#f1c40f' },
      { text: '¡TIJERAS!', color: '#e74c3c' }
    ];

    this.wordTimers = words.map((word, index) => {
      return setTimeout(() => {
        if (!this.isRoundValid(token)) return;

        const payload = {
          rhythmText: word.text,
          rhythmColor: word.color
        };

        if (word.text === '¡TIJERAS!') {
          payload.canChoose = true;
          payload.inputLocked = false;
          payload.resultText = '¡AHORA!';
          payload.helperText = '¡Toca ahora!';
          payload.helperColor = '#55efc4';
          payload.tokatStateText = '¡Ahora!';
          this.stopTokatAnimation(); // Wait for user choice
        } else if (word.text === 'PIEDRA') {
          this.playTokatAnimation('beat_rock', { once: true, duration: beat, fallback: null });
        } else if (word.text === 'PAPEL') {
          this.playTokatAnimation('beat_paper', { once: true, duration: beat, fallback: null });
        } else if (word.text === 'O...') {
          this.playTokatAnimation('beat_o', { once: true, duration: beat, fallback: null });
        }

        this.setData(payload);
      }, leadIn + (beat * index));
    });

    this.choiceWindowTimer = setTimeout(() => {
      if (!this.isRoundValid(token)) return;
      this.handleTimeout();
    }, leadIn + (beat * 3) + choiceWindow);
  },

  onChoiceTap(e) {
    const choice = e.currentTarget.dataset.choice;

    if (this.data.gameEnded || this.data.roundResolved || this.data.inputLocked || this.data.isPaused || this.data.isCountingDown || this.data.showTutorialModal) {
      return;
    }

    this.setData({ inputLocked: true });

    if (!this.data.canChoose) {
      this.handleEarlyChoice(choice);
      return;
    }

    this.handlePlayerChoice(choice);
  },

  handleEarlyChoice(choice) {
    if (this.data.roundResolved || this.data.gameEnded) return;

    this.clearRoundTimers();
    this.game.state.drawStreakCount = 0;

    this.setData({
      roundResolved: true,
      canChoose: false,
      inputLocked: true,
      roundToken: this.data.roundToken + 1,
      rhythmText: choice.toUpperCase(),
      rhythmColor: '#ffffff',
      resultText: '¡Te adelantaste!\nPerdiste por romper el ritmo',
      enemyChoiceText: 'Solo puedes elegir en "TIJERAS"',
      helperText: 'Espera el siguiente ritmo',
      helperColor: '#ffb199',
      drawStreakCount: 0,
      tokatStateText: 'Tokat te castigó'
    });

    this.playTokatAnimation('choice_scissors', { once: true, fallback: null });
    setTimeout(() => {
      this.playTokatAnimation('win', { once: true, fallback: 'idle' });
    }, 200);

    this.updateDrawCounter();
    this.queueNextExchange(this.getNextExchangeDelay() + 500);
  },

  handlePlayerChoice(choice) {
    if (this.data.roundResolved || this.data.gameEnded) return;

    this.clearRoundTimers();

    const tokatChoice = this.game.getTokatChoice();
    const resultType = this.game.evaluateRound(choice, tokatChoice);
    const resultData = this.game.handleResult(resultType);

    let rhythmColor = '#ffffff';
    if (choice === 'Piedra') rhythmColor = '#2ecc71';
    if (choice === 'Papel') rhythmColor = '#f39c12';
    if (choice === 'Tijeras') rhythmColor = '#e74c3c';

    this.setData({
      roundResolved: true,
      canChoose: false,
      inputLocked: true,
      roundToken: this.data.roundToken + 1,
      rhythmText: choice.toUpperCase(),
      rhythmColor,
      enemyChoiceText: `Tokat eligió: ${tokatChoice}`,
      progress: this.game.state.progress,
      drawStreakCount: this.game.state.drawStreakCount
    });

    if (resultData.status === 'WIN') {
      this.setData({
        resultText: '¡Ganaste!\nLa barra avanzó bastante',
        helperText: 'Buen timing',
        helperColor: '#55efc4',
        tokatStateText: 'Tokat fue derrotado'
      });
    } else if (resultData.status === 'DRAW_CONVERTED') {
      this.setData({
        resultText: '¡4 empates!\nSe convirtió en avance de victoria',
        helperText: 'Racha de empates completada',
        helperColor: '#74b9ff',
        tokatStateText: 'Empate con impulso'
      });
    } else if (resultData.status === 'DRAW') {
      this.setData({
        resultText: `¡Empate!\nAcumulas ${this.game.state.drawStreakCount}/${this.data.drawStreakGoal}`,
        helperText: 'Los empates también ayudan',
        helperColor: '#ffd166',
        tokatStateText: 'Empate'
      });
    } else {
      this.setData({
        resultText: 'Perdiste...\nLa barra no avanzó',
        helperText: 'No pasa nada, vuelve al ritmo',
        helperColor: '#ffb199',
        tokatStateText: 'Tokat celebró'
      });
    }

    let tokatChoiceAnim = 'choice_scissors';
    if (tokatChoice === 'Papel') tokatChoiceAnim = 'choice_paper';
    if (tokatChoice === 'Piedra') tokatChoiceAnim = 'choice_rock';
    
    this.playTokatAnimation(tokatChoiceAnim, { once: true, fallback: null });

    setTimeout(() => {
      if (resultData.status === 'WIN' || resultData.status === 'DRAW_CONVERTED' || resultData.status === 'DRAW') {
        this.playTokatAnimation('lose', { once: true, fallback: 'idle' });
      } else {
        this.playTokatAnimation('win', { once: true, fallback: 'idle' });
      }
    }, 200);

    this.updateDrawCounter();
    this.updateProgressBar();

    if (this.game.isMaxProgress()) {
      this.nextExchangeTimer = setTimeout(() => {
        this.endGame(true);
      }, 750);
      return;
    }

    this.queueNextExchange(this.getNextExchangeDelay() + 380);
  },

  handleTimeout() {
    if (this.data.roundResolved || this.data.gameEnded) return;

    this.clearRoundTimers();
    this.game.state.drawStreakCount = 0;

    this.setData({
      roundResolved: true,
      canChoose: false,
      inputLocked: true,
      roundToken: this.data.roundToken + 1,
      rhythmText: '¡TARDE!',
      rhythmColor: '#ff7675',
      resultText: 'No elegiste en "TIJERAS"\nLa barra no avanzó',
      enemyChoiceText: 'Tokat aprovechó tu retraso',
      helperText: 'En la siguiente ronda toca un poco antes',
      helperColor: '#ffb199',
      drawStreakCount: 0,
      tokatStateText: 'Tokat te arañó'
    });

    this.playTokatAnimation('choice_scissors', { once: true, fallback: null });
    setTimeout(() => {
      this.playTokatAnimation('win', { once: true, fallback: 'idle' });
    }, 200);

    this.updateDrawCounter();
    this.queueNextExchange(this.getNextExchangeDelay() + 520);
  },

  queueNextExchange(delay) {
    this.nextExchangeTimer = setTimeout(() => {
      if (this.data.gameEnded || this.data.isPaused || this.data.isCountingDown || this.data.showTutorialModal) return;
      this.startExchange();
    }, delay);
  },

  endGame(playerWon) {
    if (this.data.gameEnded) return;

    this.clearRoundTimers();
    this.clearGlobalTimer();

    this.setData({
      gameEnded: true,
      canChoose: false,
      inputLocked: true,
      roundToken: this.data.roundToken + 1
    });

    this.stopTokatAnimation();

    const isWin = this.game.isMaxProgress() || playerWon;

    saveStatsUseCase.execute({
      gameId: 'toka_rps',
      tokensEarned: isWin ? 5 : 1,
      currentScore: this.game.state.progress
    });

    my.redirectTo({
      url: `/pages/tokaRPS/pages/end/end?playerWon=${isWin ? 1 : 0}&progress=${this.data.progress}&maxProgress=${this.data.maxProgress}`
    });
  },

  clearRoundTimers() {
    if (this.wordTimers && this.wordTimers.length) {
      this.wordTimers.forEach((timer) => clearTimeout(timer));
    }
    this.wordTimers = [];

    if (this.choiceWindowTimer) {
      clearTimeout(this.choiceWindowTimer);
      this.choiceWindowTimer = null;
    }

    if (this.nextExchangeTimer) {
      clearTimeout(this.nextExchangeTimer);
      this.nextExchangeTimer = null;
    }
  },

  cleanupScene() {
    this.clearRoundTimers();
    this.clearGlobalTimer();
    this.stopTokatAnimation();
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  },

  togglePause() {
    if (this.data.gameEnded || this.data.isCountingDown || this.data.showTutorialModal) return;

    if (!this.data.isPaused) {
      this.clearRoundTimers();
      this.clearGlobalTimer();
      this.setData({ isPaused: true, tokatStateText: 'Pausa' });
      this.playTokatAnimation('idle');
    } else {
      this.startCountdown();
    }
  },

  startCountdown() {
    this.setData({
      isPaused: false,
      isCountingDown: true,
      countdownText: '3',
      tokatStateText: 'Vuelve al ritmo'
    });

    this.playTokatAnimation('idle');

    let count = 3;
    this.countdownInterval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        this.setData({ countdownText: count.toString() });
      } else if (count === 0) {
        this.setData({ countdownText: '¡YA!' });
      } else {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        this.setData({ isCountingDown: false });
        this.startGlobalTimer();
        this.startExchange();
      }
    }, 1000);
  },

  exitGame() {
    my.redirectTo({
      url: '/pages/tokaRPS/pages/index/index'
    });
  }
});
