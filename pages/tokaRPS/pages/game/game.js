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

    tokatBoxColor: "#f39c12",
    tokatStateText: "Preparado",

    rhythmText: "Prepárate...",
    rhythmColor: "#ffffff",

    resultText: 'Espera a "TIJERAS"',
    enemyChoiceText: "",

    isPaused: false,
    isCountingDown: false,
    countdownText: ""
  },

  onLoad() {
    this.game = new TokaRpsGame();

    this.wordTimers = [];
    this.choiceWindowTimer = null;
    this.nextExchangeTimer = null;
    this.globalTimer = null;

    this.startGame();
  },

  onUnload() {
    this.cleanupScene();
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
      tokatBoxColor: "#f39c12",
      tokatStateText: "Preparado",
      rhythmText: "Prepárate...",
      rhythmColor: "#ffffff",
      resultText: 'Espera a "TIJERAS"',
      enemyChoiceText: ""
    });

    this.updateDrawCounter();
    this.updateProgressBar();
    this.startGlobalTimer();
    this.startExchange();
  },

  startGlobalTimer() {
    this.clearGlobalTimer();
    this.globalTimer = setInterval(() => {
      if (this.data.gameEnded || this.data.isPaused || this.data.isCountingDown) return;

      const remaining = this.game.tickRemainingTime(100);

      this.setData({
        remainingTime: remaining
      });

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

    this.setData({
      timeText: `Tiempo: ${seconds}`,
      timeColor: color
    });
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
    if (this.data.gameEnded || this.data.isPaused || this.data.isCountingDown) return;

    this.clearRoundTimers();

    const token = this.data.roundToken + 1;
    this.setData({
      roundToken: token,
      canChoose: false,
      roundResolved: false,
      inputLocked: false,
      tokatBoxColor: "#f39c12",
      tokatStateText: "Sigue el ritmo",
      resultText: 'Espera a "TIJERAS"',
      enemyChoiceText: "",
      rhythmText: "Prepárate...",
      rhythmColor: "#ffffff"
    });

    const { beat, choiceWindow } = this.game.getBeatWindow();

    const words = [
      { text: "PIEDRA", color: "#2ecc71" },
      { text: "PAPEL", color: "#f39c12" },
      { text: "O...", color: "#f1c40f" },
      { text: "¡TIJERAS!", color: "#e74c3c" }
    ];

    this.wordTimers = words.map((word, index) => {
      return setTimeout(() => {
        if (!this.isRoundValid(token)) return;

        const payload = {
          rhythmText: word.text,
          rhythmColor: word.color
        };

        if (word.text === "¡TIJERAS!") {
          payload.canChoose = true;
          payload.inputLocked = false;
          payload.resultText = "¡AHORA!";
        }

        this.setData(payload);
      }, beat * index);
    });

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
    this.game.state.drawStreakCount = 0; // Reset streak

    this.setData({
      roundResolved: true,
      canChoose: false,
      inputLocked: true,
      roundToken: this.data.roundToken + 1,
      rhythmText: choice.toUpperCase(),
      rhythmColor: "#ffffff",
      resultText: "¡Te adelantaste!\nPerdiste por romper el ritmo",
      enemyChoiceText: 'Solo puedes elegir en "TIJERAS"',
      tokatStateText: "Tokat te castigó",
      tokatBoxColor: "#ff7675",
      drawStreakCount: 0
    });

    this.updateDrawCounter();
    this.queueNextExchange(700);
  },

  handlePlayerChoice(choice) {
    if (this.data.roundResolved || this.data.gameEnded) return;

    this.clearRoundTimers();

    const tokatChoice = this.game.getTokatChoice();
    const resultType = this.game.evaluateRound(choice, tokatChoice);
    const resultData = this.game.handleResult(resultType);

    let rhythmColor = "#ffffff";
    if (choice === "Piedra") rhythmColor = "#2ecc71";
    if (choice === "Papel") rhythmColor = "#f39c12";
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

    if (resultData.status === "WIN") {
      this.setData({
        resultText: "¡Ganaste!\nLa barra avanzó bastante",
        tokatStateText: "Tokat recibió un golpecito",
        tokatBoxColor: "#55efc4"
      });
    } else if (resultData.status === "DRAW_CONVERTED") {
       this.setData({
        resultText: "¡4 empates!\nSe convirtió en avance de victoria",
        tokatStateText: "Tokat quedó en equilibrio",
        tokatBoxColor: "#74b9ff"
      });
    } else if (resultData.status === "DRAW") {
      this.setData({
        resultText: `¡Empate!\nAcumulas ${this.data.drawStreakCount}/${this.data.drawStreakGoal}`,
        tokatStateText: "Empate",
        tokatBoxColor: "#f1c40f"
      });
    } else {
      this.setData({
        resultText: "Perdiste...\nLa barra no avanzó",
        tokatStateText: "¡Arañazo de Tokat!",
        tokatBoxColor: "#ff7675"
      });
    }

    this.updateDrawCounter();
    this.updateProgressBar();

    if (this.game.isMaxProgress()) {
      this.nextExchangeTimer = setTimeout(() => {
        this.endGame(true);
      }, 550);
      return;
    }

    this.queueNextExchange(550);
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
      tokatStateText: "Tokat te arañó",
      tokatBoxColor: "#ff7675",
      drawStreakCount: 0
    });

    this.updateDrawCounter();
    this.queueNextExchange(550);
  },

  queueNextExchange(delay) {
    this.nextExchangeTimer = setTimeout(() => {
      if (this.data.gameEnded || this.data.isPaused || this.data.isCountingDown) return;
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

    const isWin = this.game.isMaxProgress() || playerWon;

    saveStatsUseCase.execute({
      gameId: 'toka_rps',
      tokensEarned: isWin ? 5 : 1, // Reward system
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
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  },

  togglePause() {
    if (this.data.gameEnded || this.data.isCountingDown) return;

    if (!this.data.isPaused) {
      this.clearRoundTimers();
      this.clearGlobalTimer();
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
