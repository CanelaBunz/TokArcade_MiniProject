Page({
  data: {
    choices: ["Piedra", "Papel", "Tijeras"],

    totalTime: 50000,
    remainingTime: 50000,

    progress: 0,
    maxProgress: 150,

    winPoints: 16,
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

    finalTitle: "",
    finalMessage: ""
  },

  onLoad() {
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

    this.setData({
      choices: ["Piedra", "Papel", "Tijeras"],

      totalTime: 50000,
      remainingTime: 50000,

      progress: 0,
      maxProgress: 150,

      winPoints: 16,
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

      finalTitle: "",
      finalMessage: ""
    });

    this.updateDrawCounter();
    this.updateProgressBar();
    this.startGlobalTimer();
    this.startExchange();
  },

  restartGame() {
    this.startGame();
  },

  startGlobalTimer() {
    this.globalTimer = setInterval(() => {
      if (this.data.gameEnded) return;

      const nextRemaining = Math.max(0, this.data.remainingTime - 100);

      this.setData({
        remainingTime: nextRemaining
      });

      this.updateTimeLabel();

      if (nextRemaining <= 0) {
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

  resetDrawCounter() {
    this.setData({
      drawStreakCount: 0
    });
    this.updateDrawCounter();
  },

  addDrawCount() {
    const nextCount = this.data.drawStreakCount + 1;

    if (nextCount >= this.data.drawStreakGoal) {
      const nextProgress = Math.min(this.data.maxProgress, this.data.progress + this.data.winPoints);

      this.setData({
        drawStreakCount: 0,
        progress: nextProgress,
        resultText: "¡4 empates!\nSe convirtió en avance de victoria",
        tokatStateText: "Tokat quedó en equilibrio",
        tokatBoxColor: "#74b9ff"
      });

      this.updateDrawCounter();
      return "converted";
    }

    this.setData({
      drawStreakCount: nextCount
    });
    this.updateDrawCounter();
    return "counted";
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

  getCurrentBeat() {
    const elapsed = this.data.totalTime - this.data.remainingTime;
    const stage = Math.floor(elapsed / 5000);

    const initialBeat = 470;
    const reductionPerStage = 35;
    const minBeat = 220;

    return Math.max(minBeat, initialBeat - stage * reductionPerStage);
  },

  getChoiceWindow() {
    const elapsed = this.data.totalTime - this.data.remainingTime;
    const stage = Math.floor(elapsed / 5000);

    const initialWindow = 360;
    const reductionPerStage = 22;
    const minWindow = 150;

    return Math.max(minWindow, initialWindow - stage * reductionPerStage);
  },

  isRoundValid(token) {
    return !this.data.gameEnded &&
      !this.data.roundResolved &&
      token === this.data.roundToken;
  },

  startExchange() {
    if (this.data.gameEnded) return;

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

    const beat = this.getCurrentBeat();

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
    }, beat * 3 + this.getChoiceWindow());
  },

  onChoiceTap(e) {
    const choice = e.currentTarget.dataset.choice;

    if (this.data.gameEnded || this.data.roundResolved || this.data.inputLocked) {
      return;
    }

    this.setData({
      inputLocked: true
    });

    if (!this.data.canChoose) {
      this.handleEarlyChoice(choice);
      return;
    }

    this.handlePlayerChoice(choice);
  },

  handleEarlyChoice(choice) {
    if (this.data.roundResolved || this.data.gameEnded) return;

    this.clearRoundTimers();

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
      tokatBoxColor: "#ff7675"
    });

    this.resetDrawCounter();
    this.queueNextExchange(700);
  },

  handlePlayerChoice(choice) {
    if (this.data.roundResolved || this.data.gameEnded) return;

    this.clearRoundTimers();

    const tokatChoice = this.data.choices[Math.floor(Math.random() * this.data.choices.length)];
    const result = this.getRoundResult(choice, tokatChoice);

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
      enemyChoiceText: `Tokat eligió: ${tokatChoice}`
    });

    if (result === "win") {
      const nextProgress = Math.min(this.data.maxProgress, this.data.progress + this.data.winPoints);

      this.setData({
        progress: nextProgress,
        resultText: "¡Ganaste!\nLa barra avanzó bastante",
        tokatStateText: "Tokat recibió un golpecito",
        tokatBoxColor: "#55efc4"
      });

      this.resetDrawCounter();
    } else if (result === "draw") {
      const drawResult = this.addDrawCount();

      if (drawResult !== "converted") {
        this.setData({
          resultText: `¡Empate!\nAcumulas ${this.data.drawStreakCount}/${this.data.drawStreakGoal}`,
          tokatStateText: "Empate",
          tokatBoxColor: "#f1c40f"
        });
      }
    } else {
      this.setData({
        resultText: "Perdiste...\nLa barra no avanzó",
        tokatStateText: "¡Arañazo de Tokat!",
        tokatBoxColor: "#ff7675"
      });

      this.resetDrawCounter();
    }

    this.updateProgressBar();

    if (this.data.progress >= this.data.maxProgress) {
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
      tokatBoxColor: "#ff7675"
    });

    this.resetDrawCounter();
    this.queueNextExchange(550);
  },

  queueNextExchange(delay) {
    this.nextExchangeTimer = setTimeout(() => {
      if (this.data.gameEnded) return;
      this.startExchange();
    }, delay);
  },

  getRoundResult(player, tokat) {
    if (player === tokat) return "draw";

    if (
      (player === "Piedra" && tokat === "Tijeras") ||
      (player === "Papel" && tokat === "Piedra") ||
      (player === "Tijeras" && tokat === "Papel")
    ) {
      return "win";
    }

    return "lose";
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
  
    my.redirectTo({
      url: `/pages/end/end?playerWon=${playerWon ? 1 : 0}&progress=${this.data.progress}&maxProgress=${this.data.maxProgress}`
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
  }
});