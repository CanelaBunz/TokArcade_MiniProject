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

const MODES = {
  short: { id: 'short', questions: 10 },
  medium: { id: 'medium', questions: 20 },
  infinite: { id: 'infinite', questions: -1 }
};

Page({
  data: {
    selectedIndex: 0,
    currentCategory: CATEGORIES[0],
    showModeModal: false
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
    this.setData({
      showModeModal: true
    });
  },

  closeModeModal() {
    this.setData({
      showModeModal: false
    });
  },

  selectMode(e) {
    const modeId = e.currentTarget.dataset.mode;
    const mode = MODES[modeId];
    const category = this.data.currentCategory;

    my.redirectTo({
      url: `/pages/game/game?category=${category.id}&mode=${mode.id}&totalQuestions=${mode.questions}`
    });
  }
});