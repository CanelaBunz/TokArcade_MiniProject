import { TokaRpsGame } from '../../../../src/core/domain/game/TokaRpsGame';
import { LocalStorageGameStatsRepository } from '../../../../src/core/infrastructure/storage/LocalStorageGameStatsRepository';
import { SaveGameStatsUseCase } from '../../../../src/core/application/game/SaveGameStatsUseCase';

const statsRepository = new LocalStorageGameStatsRepository();
const saveStatsUseCase = new SaveGameStatsUseCase(statsRepository);

// ─── Rutas de assets ─────────────────────────────────────────────────────────
const BASE = '/images/tokat/';

const FRAMES = {
  idle:  [0,1,2,3,4,5,6].map(i => `${BASE}frame${String(i).padStart(4,'0')}.png`),
  ready: [0,1,2,3,4,5].map(i   => `${BASE}TK${String(i).padStart(4,'0')}.png`),
  beatP: [0,1,2,3,4,5,6].map(i => `${BASE}TBP${String(i).padStart(4,'0')}.png`),
  beatPa:[0,1,2,3].map(i        => `${BASE}TBPa${String(i).padStart(4,'0')}.png`),
  beatO: [0,1,2,3,4,5,6].map(i => `${BASE}TBO${String(i).padStart(4,'0')}.png`),
  scissors: [`${BASE}TR0000.png`, `${BASE}TR0001.png`, `${BASE}TR0002.png`],
  paper:    [`${BASE}TR1`],   // TR1 (solo un frame para papel)
  rock:     [`${BASE}TK2`],   // TK2 (solo un frame para piedra)
  lose: [0,1,2,3,4,5].map(i  => `${BASE}TL1${String(i).padStart(4,'0')}.png`),
  win:  [0,1,2,3,4,5,6].map(i=> `${BASE}TW${String(i).padStart(4,'0')}.png`),
};

// Verifica extensiones de los frames únicos
FRAMES.paper   = [`${BASE}TR1.png`];
FRAMES.rock    = [`${BASE}TK2.png`];

Page({
  data: {
    totalTime: 50000,
    remainingTime: 50000,

    progress: 0,
    maxProgress: 150,

    drawStreakCount: 0,
    drawStreakGoal: 4,

    canChoose: false,
    roundResolved: false,
    gameEnded: false,
    inputLocked: false,

    roundToken: 0,

    timeText: "Tiempo: 50.0",
    timeColor: "#ffffff",

    drawCounterText: "Empates: 0/4",
    drawCounterColor: "#dfe6e9",

    progressPercent: 0,
    progressColor: "#74b9ff",

    rhythmText: "Prepárate...",
    rhythmColor: "#ffffff",

    resultText: 'Espera a "TIJERAS"',
    enemyChoiceText: "",

    isPaused: false,
    isCountingDown: false,
    countdownText: "",

    // ── Tokat sprite ──
    tokatFrame: FRAMES.idle[0],
  },

  onLoad() {
    this.game = new TokaRpsGame();

    this.wordTimers = [];
    this.choiceWindowTimer = null;
    this.nextExchangeTimer = null;
    this.globalTimer = null;

    // Animación interna de Tokat
    this._animTimer  = null;  // setInterval para animaciones en bucle
    this._animQueue  = null;  // setTimeout para animaciones de un solo ciclo

    this.startGame();
  },

  onUnload() {
    this.cleanupScene();
  },

  // ─── Animación de Tokat ─────────────────────────────────────────────────────

  /**
   * Reproduce una animación en bucle continuo.
   * @param {string[]} frames  Array de rutas
   * @param {number}   fps     Cuadros por segundo
   */
  _loopAnim(frames, fps) {
    this._stopAnim();
    let pointer = 0;
    const delay = Math.floor(1000 / fps);
    // Secuencia ping-pong suave para animaciones idle/ready
    const seq = [...frames, ...[...frames].reverse().slice(1, -1)];

    this.setData({ tokatFrame: seq[0] });

    this._animTimer = setInterval(() => {
      pointer = (pointer + 1) % seq.length;
      this.setData({ tokatFrame: seq[pointer] });
    }, delay);
  },

  /**
   * Reproduce una animación una sola vez de principio a fin,
   * luego llama onDone().
   * @param {string[]} frames
   * @param {number}   totalDuration  ms totales para toda la animación
   * @param {Function} [onDone]
   */
  _onceAnim(frames, totalDuration, onDone) {
    this._stopAnim();
    if (!frames || frames.length === 0) {
      if (onDone) onDone();
      return;
    }

    const delay = Math.floor(totalDuration / frames.length);
    let pointer = 0;

    this.setData({ tokatFrame: frames[0] });

    const tick = () => {
      pointer++;
      if (pointer < frames.length) {
        this.setData({ tokatFrame: frames[pointer] });
        this._animQueue = setTimeout(tick, delay);
      } else {
        if (onDone) onDone();
      }
    };

    this._animQueue = setTimeout(tick, delay);
  },

  /**
   * Reproduce N cuadros distribuidos exactamente en totalDuration ms,
   * luego llama onDone().
   */
  _timedAnim(frames, totalDuration, onDone) {
    this._stopAnim();
    if (!frames || frames.length === 0) {
      if (onDone) onDone();
      return;
    }

    const delay = Math.floor(totalDuration / frames.length);
    let pointer = 0;

    this.setData({ tokatFrame: frames[0] });

    const advance = () => {
      pointer++;
      if (pointer < frames.length) {
        this.setData({ tokatFrame: frames[pointer] });
        this._animQueue = setTimeout(advance, delay);
      } else {
        if (onDone) onDone();
      }
    };

    this._animQueue = setTimeout(advance, delay);
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

  // ─── Lógica del juego ───────────────────────────────────────────────────────

  startGame() {
    this.clearRoundTimers();
    this.clearGlobalTimer();
    this.game.start();

    this.setData({
      totalTime: 50000,
      remainingTime: 50000,
      progress: 0,
      drawStreakCount: 0,
      canChoose: false,
      roundResolved: false,
      gameEnded: false,
      inputLocked: false,
      roundToken: 0,
      timeText: "Tiempo: 50.0",
      timeColor: "#ffffff",
      drawCounterText: "Empates: 0/4",
      drawCounterColor: "#dfe6e9",
      progressPercent: 0,
      progressColor: "#74b9ff",
      rhythmText: "Prepárate...",
      rhythmColor: "#ffffff",
      resultText: 'Espera a "TIJERAS"',
      enemyChoiceText: ""
    });

    this.updateDrawCounter();
    this.updateProgressBar();

    // Animación "ready" (TK) antes de iniciar el primer beat
    this._onceAnim(FRAMES.ready, 800, () => {
      this.startGlobalTimer();
      this.startExchange();
    });
  },

  startGlobalTimer() {
    this.clearGlobalTimer();
    this.globalTimer = setInterval(() => {
      if (this.data.gameEnded || this.data.isPaused || this.data.isCountingDown) return;

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

    let color = "#ffffff";
    if (this.data.remainingTime <= 10000) {
      color = "#ff7675";
    } else if (this.data.remainingTime <= 25000) {
      color = "#ffd166";
    }

    this.setData({ timeText: `Tiempo: ${seconds}`, timeColor: color });
  },

  updateDrawCounter() {
    const nearGoal = this.data.drawStreakCount >= this.data.drawStreakGoal - 1;

    this.setData({
      drawCounterText: `Empates: ${this.data.drawStreakCount}/${this.data.drawStreakGoal}`,
      drawCounterColor: nearGoal ? "#ffd166" : "#dfe6e9"
    });
  },

  updateProgressBar() {
    const percent = (this.data.progress / this.data.maxProgress) * 100;

    let color = "#74b9ff";
    if (this.data.progress >= 100) {
      color = "#00cec9";
    } else if (this.data.progress >= 50) {
      color = "#55efc4";
    }

    this.setData({ progressPercent: percent, progressColor: color });
  },

  isRoundValid(token) {
    return !this.data.gameEnded &&
      !this.data.roundResolved &&
      token === this.data.roundToken;
  },

  startExchange() {
    if (this.data.gameEnded || this.data.isPaused || this.data.isCountingDown) return;

    this.clearRoundTimers();

    const token = this.data.roundToken + 1;
    this.setData({
      roundToken: token,
      canChoose: false,
      roundResolved: false,
      inputLocked: false,
      resultText: 'Espera a "TIJERAS"',
      enemyChoiceText: "",
      rhythmText: "Prepárate...",
      rhythmColor: "#ffffff"
    });

    const { beat, choiceWindow } = this.game.getBeatWindow();

    // ── Animaciones sincronizadas con beat ─────────────────────────────────
    // Palabra 0: PIEDRA  → animación TBP (beat ms)
    // Palabra 1: PAPEL   → animación TBPa (beat ms)
    // Palabra 2: O...    → animación TBO  (beat ms)
    // Palabra 3: TIJERAS → ventana de elección (choiceWindow ms)

    // PIEDRA
    this.wordTimers.push(setTimeout(() => {
      if (!this.isRoundValid(token)) return;
      this.setData({ rhythmText: "PIEDRA", rhythmColor: "#2ecc71" });
      this._timedAnim(FRAMES.beatP, beat);
    }, 0));

    // PAPEL
    this.wordTimers.push(setTimeout(() => {
      if (!this.isRoundValid(token)) return;
      this.setData({ rhythmText: "PAPEL", rhythmColor: "#f39c12" });
      this._timedAnim(FRAMES.beatPa, beat);
    }, beat));

    // O...
    this.wordTimers.push(setTimeout(() => {
      if (!this.isRoundValid(token)) return;
      this.setData({ rhythmText: "O...", rhythmColor: "#f1c40f" });
      this._timedAnim(FRAMES.beatO, beat);
    }, beat * 2));

    // ¡TIJERAS! → habilitar elección
    this.wordTimers.push(setTimeout(() => {
      if (!this.isRoundValid(token)) return;
      this.setData({
        rhythmText: "¡TIJERAS!",
        rhythmColor: "#e74c3c",
        canChoose: true,
        inputLocked: false,
        resultText: "¡AHORA!"
      });
      // Animación idle mientras espera la elección
      this._loopAnim(FRAMES.idle, 7);
    }, beat * 3));

    // Tiempo límite de elección
    this.choiceWindowTimer = setTimeout(() => {
      if (!this.isRoundValid(token)) return;
      this.handleTimeout();
    }, beat * 3 + choiceWindow);
  },

  onChoiceTap(e) {
    const choice = e.currentTarget.dataset.choice;

    if (this.data.gameEnded || this.data.roundResolved || this.data.inputLocked || this.data.isPaused || this.data.isCountingDown) {
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
      rhythmColor: "#ffffff",
      resultText: "¡Te adelantaste!\nPerdiste por romper el ritmo",
      enemyChoiceText: 'Solo puedes elegir en "TIJERAS"',
      drawStreakCount: 0
    });

    this.updateDrawCounter();

    // Animación de pérdida/empate
    this._onceAnim(FRAMES.lose, 600, () => {
      this._loopAnim(FRAMES.idle, 7);
    });

    this.queueNextExchange(700);
  },

  handlePlayerChoice(choice) {
    if (this.data.roundResolved || this.data.gameEnded) return;

    this.clearRoundTimers();

    const tokatChoice = this.game.getTokatChoice();
    const resultType  = this.game.evaluateRound(choice, tokatChoice);
    const resultData  = this.game.handleResult(resultType);

    let rhythmColor = "#ffffff";
    if (choice === "Piedra")  rhythmColor = "#2ecc71";
    if (choice === "Papel")   rhythmColor = "#f39c12";
    if (choice === "Tijeras") rhythmColor = "#e74c3c";

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

    // ── Frame de elección de Tokat ──────────────────────────────────────────
    // Mostrar el frame de la jugada de Tokat brevemente
    if (tokatChoice === "Tijeras") {
      this._onceAnim(FRAMES.scissors, 400, () => this._loopAnim(FRAMES.idle, 7));
    } else if (tokatChoice === "Papel") {
      this._onceAnim(FRAMES.paper, 300, () => this._loopAnim(FRAMES.idle, 7));
    } else {
      this._onceAnim(FRAMES.rock, 300, () => this._loopAnim(FRAMES.idle, 7));
    }

    if (resultData.status === "WIN") {
      this.setData({
        resultText: "¡Ganaste!\nLa barra avanzó bastante",
      });
      this._stopAnim();
      this._onceAnim(FRAMES.win, 700, () => this._loopAnim(FRAMES.idle, 7));
    } else if (resultData.status === "DRAW_CONVERTED") {
      this.setData({
        resultText: "¡4 empates!\nSe convirtió en avance de victoria",
      });
      this._stopAnim();
      this._onceAnim(FRAMES.win, 700, () => this._loopAnim(FRAMES.idle, 7));
    } else if (resultData.status === "DRAW") {
      this.setData({
        resultText: `¡Empate!\nAcumulas ${this.data.drawStreakCount}/${this.data.drawStreakGoal}`,
      });
      this._stopAnim();
      this._onceAnim(FRAMES.lose, 600, () => this._loopAnim(FRAMES.idle, 7));
    } else {
      this.setData({
        resultText: "Perdiste...\nLa barra no avanzó",
      });
      this._stopAnim();
      this._onceAnim(FRAMES.lose, 600, () => this._loopAnim(FRAMES.idle, 7));
    }

    this.updateDrawCounter();
    this.updateProgressBar();

    if (this.game.isMaxProgress()) {
      this.nextExchangeTimer = setTimeout(() => { this.endGame(true); }, 700);
      return;
    }

    this.queueNextExchange(700);
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
      rhythmText: "¡TARDE!",
      rhythmColor: "#ff7675",
      resultText: 'No elegiste en "TIJERAS"\nLa barra no avanzó',
      enemyChoiceText: "Tokat aprovechó tu retraso",
      drawStreakCount: 0
    });

    this.updateDrawCounter();

    this._stopAnim();
    this._onceAnim(FRAMES.lose, 600, () => this._loopAnim(FRAMES.idle, 7));

    this.queueNextExchange(550);
  },

  queueNextExchange(delay) {
    this.nextExchangeTimer = setTimeout(() => {
      if (this.data.gameEnded || this.data.isPaused || this.data.isCountingDown) return;

      // Animación "ready" (TK) entre rondas
      this._onceAnim(FRAMES.ready, 500, () => {
        this.startExchange();
      });
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
      this.wordTimers.forEach(timer => clearTimeout(timer));
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
    this._stopAnim();
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  },

  togglePause() {
    if (this.data.gameEnded || this.data.isCountingDown) return;

    if (!this.data.isPaused) {
      this.clearRoundTimers();
      this.clearGlobalTimer();
      this._stopAnim();
      this._loopAnim(FRAMES.idle, 7);
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

        // Animación "ready" antes de reanudar
        this._onceAnim(FRAMES.ready, 500, () => {
          this.startGlobalTimer();
          this.startExchange();
        });
      }
    }, 1000);
  },

  exitGame() {
    my.redirectTo({
      url: '/pages/tokaRPS/pages/index/index'
    });
  }
});
