Page({
  data: {
    playerWon: false,
    progress: 0,
    maxProgress: 150,
    title: '',
    titleColor: '#ff7675',
    subtitle: ''
  },

  onLoad(query) {
    const playerWon = query.playerWon === '1';
    const progress = Number(query.progress || 0);
    const maxProgress = Number(query.maxProgress || 150);

    this.setData({
      playerWon,
      progress,
      maxProgress,
      title: playerWon ? '¡Ganaste!' : 'Se acabó el tiempo',
      titleColor: playerWon ? '#55efc4' : '#ff7675',
      subtitle: playerWon
        ? 'Lograste llenar la barra a tiempo'
        : `Te faltó progreso: ${Math.max(0, maxProgress - progress)}`
    });
  },

  retryGame() {
    my.redirectTo({
      url: '/pages/game/game'
    });
  },

  goMenu() {
    my.redirectTo({
      url: '/pages/index/index'
    });
  }
});