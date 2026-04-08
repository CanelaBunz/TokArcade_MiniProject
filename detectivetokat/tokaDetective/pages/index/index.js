const CATEGORIES = [
  {
    id: 'cultura',
    name: 'Cultura Popular',
    emoji: '🎬',
    desc: 'Series, películas, música y más'
  },
  {
    id: 'arte',
    name: 'Arte y Literatura',
    emoji: '🎨',
    desc: 'Pintura, novelas, música clásica'
  },
  {
    id: 'historia',
    name: 'Historia',
    emoji: '🏛️',
    desc: 'Civilizaciones, eventos y personajes'
  }
];

Page({
  data: {
    selectedIndex: 0,
    currentCategory: CATEGORIES[0]
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
      url: `/detectivetokat/tokaDetective/pages/game/game?category=${category.id}&mode=infinite&totalQuestions=-1`
    });
  }
});