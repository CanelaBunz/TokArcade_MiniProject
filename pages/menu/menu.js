const app = getApp();

const GAME_ROUTES = {
  'detective-tokat': '/pages/detective-tokat/pages/index/index',
  'tokat-says':      '/pages/tokat-says/pages/index/index',
  'eyden-rps':       '/pages/tokaRPS/pages/index/index'
};

Page({
  data: {
    puntos: 0,
    juegos: [
      { id: 'tokat-says', nombre: 'TOKAT SAYS', nombreDisplay: 'TOKAT\nSAYS', color: '#38bdf8', emoji: '🐱' },
      { id: 'eyden-rps', nombre: 'TOKA RPS RHYTHM', nombreDisplay: 'TOKA RPS\nRHYTHM', color: '#10b981', emoji: '✊' },
      { id: 'detective-tokat', nombre: 'DETECTIVE TOKAT', nombreDisplay: 'DETECTIVE\nTOKAT', color: '#8b5cf6', emoji: '🔦' }
    ]
  },

  onShow() {
    this.setData({ puntos: app.globalData.puntos });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },

  onTapJuego(e) {
    const { id, nombre } = e.currentTarget.dataset;
    const route = GAME_ROUTES[id];
    if (route) {
      my.navigateTo({ url: `${route}?id=${id}&nombre=${encodeURIComponent(nombre)}` });
    }
  }
});
