const app = getApp();

Page({
  data: {
    puntos: 0,
    juegos: [
      { id: 'tokat-says', nombre: 'TOKAT SAYS', nombreDisplay: 'TOKAT\nSAYS', color: '#38bdf8' },
      { id: 'eyden-rps', nombre: 'TOKA RPS RHYTHM', nombreDisplay: 'TOKA RPS\nRHYTHM', color: '#10b981' },
      { id: 'detective-tokat', nombre: 'DETECTIVE TOKAT', nombreDisplay: 'DETECTIVE\nTOKAT', color: '#8b5cf6' }
    ]
  },

  onShow() {
    this.setData({ puntos: app.globalData.puntos });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      });
    }
  },

  onTapJuego(e) {
    const { id, nombre } = e.currentTarget.dataset;
    my.navigateTo({
      url: `../prejuego/prejuego?id=${id}&nombre=${encodeURIComponent(nombre)}`
    });
  }
});
