const app = getApp();

Page({
  data: {
    puntos: 0,
    rayas: [
      { color: '#800000' }, { color: '#ffffff' },
      { color: '#800000' }, { color: '#ffffff' },
      { color: '#800000' }, { color: '#ffffff' },
      { color: '#800000' }, { color: '#ffffff' }
    ]
  },

  onShow() {
    this.setData({ puntos: app.globalData.puntos });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      });
    }
  }
});
