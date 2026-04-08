Page({
  data: {
    round: 0,
    tokens: 0,
    sequenceLen: 0
  },

  onLoad(query) {
    this.setData({
      round: Number(query.round || 0),
      tokens: Number(query.tokens || 0),
      sequenceLen: Number(query.sequenceLen || 0)
    });
  },

  retryGame() {
    my.redirectTo({
      url: '/tokaRythm/tokaRhytm/pages/game/game'
    });
  },

  goMenu() {
    my.switchTab({
      url: '/pages/menu/menu'
    });
  }
});