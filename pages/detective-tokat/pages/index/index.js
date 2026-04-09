const CATEGORIES = [
  {
    id: 'cultura',
    name: 'Cultura Popular',
    desc: 'Series, películas, música y más sobre la cultura actual.'
  },
  {
    id: 'arte',
    name: 'Arte y Literatura',
    desc: 'Pintura, novelas y música clásica de todas las épocas.'
  },
  {
    id: 'historia',
    name: 'Historia',
    desc: 'Civilizaciones antiguas, grandes eventos y personajes históricos.'
  }
];

Page({
  data: {
    selectedIndex: 0,
    currentCategory: CATEGORIES[0],
    idJuego: 'detective-tokat',
    nombreJuego: 'DETECTIVE TOKAT'
  },

  onLeaderboard() {
    my.navigateTo({
      url: `/pages/leaderboard/leaderboard?id=${this.data.idJuego}&nombre=${encodeURIComponent(this.data.nombreJuego)}`
    });
  },

  prevCategory() {
    const nextIndex = (this.data.selectedIndex - 1 + CATEGORIES.length) % CATEGORIES.length;
    this.updateCategory(nextIndex);
  },

  nextCategory() {
    const nextIndex = (this.data.selectedIndex + 1) % CATEGORIES.length;
    this.updateCategory(nextIndex);
  },

  updateCategory(index) {
    this.setData({
      selectedIndex: index,
      currentCategory: CATEGORIES[index]
    });
  },

  openModeModal() {
    const category = this.data.currentCategory;
    my.redirectTo({
      url: `/pages/detective-tokat/pages/game/game?category=${category.id}&mode=infinite&totalQuestions=-1`
    });
  }
});
