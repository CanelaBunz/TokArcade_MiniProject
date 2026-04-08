const CATEGORY_NAMES = {
  cultura: '🎬 Cultura Popular',
  arte: '🎨 Arte y Literatura',
  historia: '🏛️ Historia'
};

const MODE_LABELS = {
  short: '⚡ Sesión Corta · 10 preguntas',
  medium: '📚 Sesión Media · 20 preguntas',
  infinite: '♾️ Modo Infinito · 3 vidas'
};

Page({
  data: {
    score: 0,
    correct: 0,
    total: 0,
    wrong: 0,
    precision: 0,
    precisionColor: '#ef4444',
    coins: 0,
    title: '',
    titleColor: '#ef4444',
    footerText: '',
    category: 'cultura',
    mode: 'short',
    totalQuestions: 10,
    categoryLabel: '',
    modeLabel: ''
  },

  onLoad(query) {
    const score = Number(query.score || 0);
    const correct = Number(query.correct || 0);
    const total = Number(query.total || 0);
    const wrong = Math.max(0, total - correct);
    const precision = total > 0 ? Math.round((correct / total) * 100) : 0;
    const coins = Math.floor(score / 5);
    const won = precision >= 60;

    const category = query.category || 'cultura';
    const mode = query.mode || 'short';
    const totalQuestions = Number(query.totalQuestions || 10);

    this.setData({
      score,
      correct,
      total,
      wrong,
      precision,
      precisionColor: won ? '#10b981' : '#ef4444',
      coins,
      title: won ? '¡Caso Resuelto! 🕵️' : 'Caso Cerrado 🔒',
      titleColor: won ? '#10b981' : '#ef4444',
      footerText: won ? '🏆 ¡Eres un gran detective!' : '🔦 ¡Sigue investigando!',
      category,
      mode,
      totalQuestions,
      categoryLabel: CATEGORY_NAMES[category] || category,
      modeLabel: MODE_LABELS[mode] || mode
    });
  },

  retryGame() {
    my.redirectTo({
      url: `/detectivetokat/tokaDetective/pages/game/game?category=${this.data.category}&mode=${this.data.mode}&totalQuestions=${this.data.totalQuestions}`
    });
  },

  goMenu() {
    my.redirectTo({
      url: `/detectivetokat/tokaDetective/pages/index/index`
    });
  }
});