const app = getApp();

Page({
  data: {
    puntos: 0,
    nombreJuego: '',
    idJuego: '',
    loremText: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`
  },

  onLoad(query) {
    this.setData({
      idJuego: query.id || '',
      nombreJuego: decodeURIComponent(query.nombre || 'NOMBRE DEL JUEGO')
    });
  },

  onShow() {
    this.setData({ puntos: app.globalData.puntos });
  },

  onBack() {
    my.navigateBack();
  },

  onJugar() {
    my.navigateTo({
      url: `../juego/juego?id=${this.data.idJuego}&nombre=${encodeURIComponent(this.data.nombreJuego)}`
    });
  },

  onLeaderboard() {
    my.showToast({
      content: 'Leaderboard próximamente',
      type: 'none'
    });
  }
});
