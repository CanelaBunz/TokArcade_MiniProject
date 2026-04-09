const CATEGORY_NAMES = {
  cultura: '🎬 Cultura Popular',
  arte: '🎨 Arte y Literatura',
  historia: '🏛️ Historia'
};

const MODE_LABELS = {
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
    mode: 'infinite',
    totalQuestions: -1,
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
    const mode = query.mode || 'infinite';
    const totalQuestions = Number(query.totalQuestions || -1);

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
      url: `/detectivetokat/pages/game/game?category=${this.data.category}&mode=infinite&totalQuestions=-1`
    });
  },

  goMenu() {
    my.redirectTo({
      url: `/detectivetokat/pages/index/index`
    });
  }
});
