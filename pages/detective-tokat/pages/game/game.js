import { DetectiveTokatGame } from '../../../../src/core/domain/game/DetectiveTokatGame';
import { LocalStorageGameStatsRepository } from '../../../../src/core/infrastructure/storage/LocalStorageGameStatsRepository';
import { SaveGameStatsUseCase } from '../../../../src/core/application/game/SaveGameStatsUseCase';

const statsRepository = new LocalStorageGameStatsRepository();
const saveStatsUseCase = new SaveGameStatsUseCase(statsRepository);

const TIMER_SECONDS = 30;

const CATEGORY_LABELS = {
  cultura: '🎬 Cultura Popular',
  arte: '🎨 Arte y Literatura',
  historia: '🏛️ Historia'
};

const MODE_LABELS = {
  short: '⚡ Sesión Corta · 10 preguntas',
  medium: '📚 Sesión Media · 20 preguntas',
  infinite: '♾️ Modo Infinito · 3 vidas'
};

const QUESTIONS = {
  cultura: [
    { q: '¿En qué año se estrenó "El Rey León" de Disney?', opts: ['1992', '1994', '1996', '1998'], correct: 1 },
    { q: '¿Qué serie tiene el episodio "Ozymandias" considerado uno de los mejores de TV?', opts: ['The Wire', 'The Sopranos', 'Breaking Bad', 'Mad Men'], correct: 2 },
    { q: '¿Quién interpretó a Iron Man en el UCM?', opts: ['Chris Evans', 'Robert Downey Jr.', 'Chris Hemsworth', 'Mark Ruffalo'], correct: 1 },
    { q: '¿Cuántas temporadas tiene "Friends"?', opts: ['8', '9', '10', '11'], correct: 2 },
    { q: '¿Qué película ganó el Oscar a Mejor Película en 2020?', opts: ['1917', 'Joker', 'Parasite', 'Ford v Ferrari'], correct: 2 },
    { q: '¿Qué artista cantó "Bad Guy"?', opts: ['Ariana Grande', 'Dua Lipa', 'Billie Eilish', 'Olivia Rodrigo'], correct: 2 },
    { q: '¿En qué ciudad se desarrolla la serie "Narcos"?', opts: ['Lima', 'Buenos Aires', 'Bogotá', 'Ciudad de México'], correct: 2 },
    { q: '¿Cuántos Infinity Stones existen en el UCM?', opts: ['4', '5', '6', '7'], correct: 2 },
    { q: '¿Qué personaje dijo "I am Groot"?', opts: ['Rocket', 'Drax', 'Gamora', 'Groot'], correct: 3 },
    { q: '¿En qué año se fundó YouTube?', opts: ['2003', '2004', '2005', '2006'], correct: 2 },
    { q: '¿Qué videojuego tiene el personaje "Master Chief"?', opts: ['Doom', 'Halo', 'Call of Duty', 'Gears of War'], correct: 1 },
    { q: '¿Cuántas películas tiene la saga "Harry Potter" principal?', opts: ['6', '7', '8', '9'], correct: 2 }
  ],
  arte: [
    { q: '¿Quién pintó "La Noche Estrellada"?', opts: ['Claude Monet', 'Pablo Picasso', 'Vincent van Gogh', 'Salvador Dalí'], correct: 2 },
    { q: '¿Qué escritora creó a "Elizabeth Bennet"?', opts: ['Charlotte Brontë', 'Jane Austen', 'Virginia Woolf', 'Mary Shelley'], correct: 1 },
    { q: '¿En qué siglo vivió Miguel de Cervantes?', opts: ['XIV', 'XV', 'XVI', 'XVII'], correct: 2 },
    { q: '¿Quién escribió "Cien Años de Soledad"?', opts: ['Mario Vargas Llosa', 'Pablo Neruda', 'Jorge Luis Borges', 'Gabriel García Márquez'], correct: 3 },
    { q: '¿Cuál es la ópera más famosa de Mozart?', opts: ['Tosca', 'La Traviata', 'La Flauta Mágica', 'Madama Butterfly'], correct: 2 },
    { q: '¿Dónde está la Capilla Sixtina?', opts: ['Florencia', 'Milán', 'Venecia', 'Ciudad del Vaticano'], correct: 3 },
    { q: '¿Quién esculpió "El Pensador"?', opts: ['Donatello', 'Bernini', 'Auguste Rodin', 'Michelangelo'], correct: 2 },
    { q: '¿De qué país era la pintora Frida Kahlo?', opts: ['Argentina', 'Colombia', 'España', 'México'], correct: 3 },
    { q: '¿Qué novela comienza con "Llamadme Ismael"?', opts: ['Don Quijote', 'Moby Dick', 'La Metamorfosis', 'El Gran Gatsby'], correct: 1 },
    { q: '¿Quién compuso la Quinta Sinfonía?', opts: ['Bach', 'Mozart', 'Beethoven', 'Chopin'], correct: 2 },
    { q: '¿En qué museo se encuentra la Mona Lisa?', opts: ['British Museum', 'Prado', 'Louvre', 'Uffizi'], correct: 2 },
    { q: '¿Qué arquitecto diseñó la Sagrada Familia?', opts: ['Mies van der Rohe', 'Le Corbusier', 'Antoni Gaudí', 'Frank Lloyd Wright'], correct: 2 },
    { q: '¿Quién escribió "1984"?', opts: ['Aldous Huxley', 'George Orwell', 'Ray Bradbury', 'Philip K. Dick'], correct: 1 },
    { q: '¿Cuál es el primer libro de Harry Potter?', opts: ['Cáliz de fuego', 'Piedra Filosofal', 'Cámara Secreta', 'Prisionero de Azkaban'], correct: 1 },
    { q: '¿Qué corriente artística fundó Picasso?', opts: ['Impresionismo', 'Surrealismo', 'Cubismo', 'Fauvismo'], correct: 2 },
    { q: '¿Quién escribió "El Principito"?', opts: ['Antoine de Saint-Exupéry', 'Jules Verne', 'Victor Hugo', 'Émile Zola'], correct: 0 },
    { q: '¿En qué ciudad está el museo del Prado?', opts: ['Barcelona', 'Sevilla', 'Valencia', 'Madrid'], correct: 3 },
    { q: '¿Qué instrumento tocaba Beethoven principalmente?', opts: ['Violín', 'Flauta', 'Piano', 'Trompeta'], correct: 2 },
    { q: '¿Quién pintó "Las Meninas"?', opts: ['El Greco', 'Francisco Goya', 'Diego Velázquez', 'Bartolomé Murillo'], correct: 2 },
    { q: '¿Cuál es la obra de teatro más famosa de Shakespeare?', opts: ['Macbeth', 'Otelo', 'Romeo y Julieta', 'Hamlet'], correct: 3 }
  ],
  historia: [
    { q: '¿En qué año cayó el Imperio Romano de Occidente?', opts: ['376 d.C.', '410 d.C.', '455 d.C.', '476 d.C.'], correct: 3 },
    { q: '¿Quién fue el primer presidente de México?', opts: ['Benito Juárez', 'Guadalupe Victoria', 'Agustín de Iturbide', 'Miguel Hidalgo'], correct: 1 },
    { q: '¿En qué año comenzó la Primera Guerra Mundial?', opts: ['1912', '1913', '1914', '1915'], correct: 2 },
    { q: '¿Quién construyó las Pirámides de Giza?', opts: ['Los romanos', 'Los fenicios', 'Los egipcios', 'Los babilonios'], correct: 2 },
    { q: '¿En qué año llegó Colón a América?', opts: ['1488', '1490', '1492', '1494'], correct: 2 },
    { q: '¿Quién fue Cleopatra?', opts: ['Reina de Persia', 'Reina de Egipto', 'Reina de Roma', 'Reina de Grecia'], correct: 1 },
    { q: '¿Qué evento inició la Revolución Francesa?', opts: ['Ejecución del rey', 'Toma de la Bastilla', 'Declaración de derechos', 'Marcha sobre Versalles'], correct: 1 },
    { q: '¿En qué año terminó la Segunda Guerra Mundial?', opts: ['1943', '1944', '1945', '1946'], correct: 2 },
    { q: '¿Quién lideró la Revolución Cubana?', opts: ['Ernesto Che Guevara', 'Fidel Castro', 'Raúl Castro', 'Camilo Cienfuegos'], correct: 1 },
    { q: '¿Cuánto duró el Imperio Romano?', opts: ['500 años', '700 años', '900 años', '1000 años'], correct: 3 },
    { q: '¿Dónde se firmó la Carta Magna?', opts: ['Francia', 'España', 'Inglaterra', 'Alemania'], correct: 2 },
    { q: '¿Quién fue el primer hombre en pisar la Luna?', opts: ['Buzz Aldrin', 'Yuri Gagarin', 'Neil Armstrong', 'Michael Collins'], correct: 2 },
    { q: '¿En qué ciudad se firmó la Declaración de Independencia de EE.UU.?', opts: ['Boston', 'Nueva York', 'Washington', 'Filadelfia'], correct: 3 },
    { q: '¿Qué civilización construyó Machu Picchu?', opts: ['Azteca', 'Maya', 'Inca', 'Olmeca'], correct: 2 },
    { q: '¿En qué año cayó el Muro de Berlín?', opts: ['1987', '1988', '1989', '1990'], correct: 2 }
  ]
};

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

Page({
  data: {
    category: 'cultura',
    mode: 'short',
    totalQuestions: 10,

    categoryLabel: '',
    modeLabel: '',

    questionPool: [],
    score: 0,
    showLives: false,
    livesText: '',

    phase: 'walk',
    timerSeconds: TIMER_SECONDS,
    timerColor: '#9ca3af',
    counterText: '1/10',

    questionText: '',
    currentOptions: ['', '', '', ''],
    currentCorrectIndex: 0,

    torchX: 130,
    torchY: 80,
    torchActive: false,

    lensActive: false,
    showOptionsOverlay: false,
    selectedOption: -1,
    paperPulse: false,

    feedbackText: '',
    feedbackColor: '#10b981',

    showTutorial: true,
    tutorialDone: false,

    isPaused: false,
    gameEnded: false
  },

  onLoad(query) {
    const category = query.category || 'cultura';
    const mode = query.mode || 'short';
    const totalQuestions = Number(query.totalQuestions || 10);

    const pool = this.buildQuestionPool(category, totalQuestions);
    const showLives = mode === 'infinite';

    this.game = new DetectiveTokatGame(category, totalQuestions, mode);

    this.setData({
      category,
      mode,
      totalQuestions,
      categoryLabel: CATEGORY_LABELS[category] || category,
      modeLabel: MODE_LABELS[mode] || mode,
      questionPool: pool,
      showLives,
      livesText: this.getLivesText(this.game.state.lives),
      counterText: this.getCounterText(0, totalQuestions),
      showTutorial: false,
      tutorialDone: true
    });

    this.remainingMs = TIMER_SECONDS * 1000;
    this.walkTimer = null;
    this.timerInterval = null;
    this.timerTimeout = null;
    this.resultDelay = null;
    this.rect = null; 

    this.startWalk();
  },

  onUnload() {
    this.clearAllTimers();
  },

  buildQuestionPool(category, totalQuestions) {
    let pool = shuffleArray(QUESTIONS[category] || []);
    if (totalQuestions > 0) {
      while (pool.length < totalQuestions) {
        pool = pool.concat(shuffleArray(QUESTIONS[category] || []));
      }
      pool = pool.slice(0, totalQuestions);
    }
    return pool;
  },

  getLivesText(lives) {
    return '❤️'.repeat(lives) + '🖤'.repeat(Math.max(0, 3 - lives));
  },

  getCounterText(index, totalQuestions) {
    const total = totalQuestions > 0 ? totalQuestions : '∞';
    return `${index + 1}/${total}`;
  },

  closeTutorial() {
    this.setData({
      showTutorial: false,
      tutorialDone: true
    });
    this.startWalk();
  },

  startWalk() {
    if (this.data.gameEnded) return;

    this.clearQuestionTimers();
    this.setData({
      phase: 'walk',
      torchActive: false,
      lensActive: false,
      showOptionsOverlay: false,
      selectedOption: -1,
      paperPulse: false,
      feedbackText: ''
    });

    this.walkTimer = setTimeout(() => {
      this.startQuestionPhase();
    }, 1200);
  },

  startQuestionPhase() {
    if (this.data.gameEnded) return;

    const q = this.data.questionPool[this.game.state.currentIndex];
    if (!q) {
      this.endGame();
      return;
    }

    this.setData({
      phase: 'question',
      questionText: q.q,
      currentOptions: q.opts,
      currentCorrectIndex: q.correct,
      torchX: 130,
      torchY: 80,
      torchActive: false,
      lensActive: false,
      showOptionsOverlay: false,
      selectedOption: -1,
      paperPulse: true,
      timerSeconds: TIMER_SECONDS,
      timerColor: '#9ca3af',
      counterText: this.getCounterText(this.game.state.currentIndex, this.data.totalQuestions)
    });

    this.measureContainer();

    this.remainingMs = TIMER_SECONDS * 1000;
    this.startQuestionTimer();
  },

  measureContainer() {
    my.createSelectorQuery()
      .select('#scratchContainer')
      .boundingClientRect()
      .exec((res) => {
        if (res && res[0]) {
          this.rect = res[0];
          this.setData({
            torchX: this.rect.width / 2,
            torchY: this.rect.height / 2
          });
        }
      });
  },

  startQuestionTimer() {
    this.clearQuestionTimers();

    this.timerInterval = setInterval(() => {
      if (this.data.isPaused) return;

      this.remainingMs -= 100;

      const seconds = Math.max(0, Math.ceil(this.remainingMs / 1000));
      let color = '#9ca3af';

      if (seconds <= 5) color = '#ef4444';
      else if (seconds <= 10) color = '#fbbf24';

      this.setData({
        timerSeconds: seconds,
        timerColor: color
      });

      if (this.remainingMs <= 0) {
        this.handleTimeExpired();
      }
    }, 100);
  },

  togglePause() {
    if (this.data.gameEnded || this.data.showTutorial) return;
    this.setData({ isPaused: !this.data.isPaused });
  },

  resumeGame() {
    this.setData({ isPaused: false });
  },

  exitGame() {
    my.redirectTo({
      url: '/pages/detective-tokat/pages/index/index'
    });
  },

  clearQuestionTimers() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.timerTimeout) clearTimeout(this.timerTimeout);
    if (this.resultDelay) clearTimeout(this.resultDelay);
    this.timerInterval = null;
    this.timerTimeout = null;
    this.resultDelay = null;
  },

  clearAllTimers() {
    this.clearQuestionTimers();
    if (this.walkTimer) clearTimeout(this.walkTimer);
    this.walkTimer = null;
  },

  onTorchStart(e) {
    if (this.data.phase !== 'question' || this.data.isPaused) return;
    this.setData({ torchActive: true });
    this.onTorchMove(e);
  },

  onTorchMove(e) {
    if (this.data.phase !== 'question' || this.data.isPaused) return;
    if (!e.touches || !e.touches[0] || !this.rect) return;

    const touch = e.touches[0];
    const x = touch.clientX - this.rect.left;
    const y = touch.clientY - this.rect.top;

    this.setData({ torchX: x, torchY: y });
  },

  onTorchEnd() {
    this.setData({ torchActive: false });
  },

  toggleLens() {
    if (this.data.phase !== 'question' || this.data.isPaused) return;
    this.setData({ lensActive: !this.data.lensActive });
  },

  tapPaper() {
    if (this.data.phase !== 'question' || this.data.isPaused) return;
    if (!this.data.lensActive) return;

    this.setData({
      showOptionsOverlay: true,
      selectedOption: -1
    });
  },

  selectOption(e) {
    const index = Number(e.currentTarget.dataset.index);
    this.setData({ selectedOption: index });
  },

  confirmAnswer() {
    if (this.data.phase !== 'question') return;
    if (this.data.selectedOption === -1) return;

    this.clearQuestionTimers();

    const isCorrect = this.data.selectedOption === this.data.currentCorrectIndex;
    const result = this.game.evaluateAnswer(isCorrect);
    this.processResult(result);
  },

  handleTimeExpired() {
    this.clearQuestionTimers();
    if (this.data.phase !== 'question') return;

    const result = this.game.handleTimeExpired();
    this.processResult(result);
  },

  processResult(result) {
    let text = '';
    let color = '';

    if (result.status === 'CORRECT') {
       text = '¡Correcto! 🎉'; color = '#10b981';
    } else if (result.status === 'WRONG_ALIVE' || result.status === 'WRONG') {
       text = 'Incorrecto 💔'; color = '#ef4444';
    } else if (result.status === 'EXPIRED_ALIVE' || result.status === 'EXPIRED') {
       text = '⏰ ¡Tiempo agotado! 💔'; color = '#ef4444';
    } else if (result.status === 'DEAD') {
       text = '💔 ¡Sin Vidas!'; color = '#ef4444';
    }

    this.setData({
      phase: 'result',
      showOptionsOverlay: false,
      paperPulse: false,
      score: this.game.state.score,
      livesText: this.getLivesText(this.game.state.lives),
      feedbackText: text,
      feedbackColor: color
    });

    if (result.status === 'DEAD') {
      this.resultDelay = setTimeout(() => this.endGame(), 1500);
      return;
    }

    this.resultDelay = setTimeout(() => this.advanceOrEnd(), 1500);
  },

  advanceOrEnd() {
    const isOver = this.game.isGameOver(this.data.questionPool.length);
    if (isOver) {
        this.endGame();
        return;
    }

    this.game.nextQuestion();
    
    // handle infinite pool extension
    let nextPool = this.data.questionPool;
    if (this.data.totalQuestions <= 0 && this.game.state.currentIndex >= nextPool.length) {
      nextPool = nextPool.concat(shuffleArray(QUESTIONS[this.data.category] || []));
      this.setData({ questionPool: nextPool });
    }

    this.startWalk();
  },

  endGame() {
    if (this.data.gameEnded) return;
    this.clearAllTimers();
    this.setData({ gameEnded: true });

    const total = this.data.totalQuestions > 0 ? this.data.totalQuestions : this.game.state.currentIndex;
    const score = this.game.state.score;
    const tokensEarned = score >= 50 ? Math.floor(score / 50) : 0;

    saveStatsUseCase.execute({
      gameId: 'detective_tokat',
      tokensEarned: tokensEarned, 
      currentScore: score
    });

    my.redirectTo({
      url: `/pages/detective-tokat/pages/end/end?score=${score}&correct=${this.game.state.correctCount}&total=${total}&category=${this.data.category}&mode=${this.data.mode}&totalQuestions=${this.data.totalQuestions}`
    });
  }
});
