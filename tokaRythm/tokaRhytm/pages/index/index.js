Page({
  data: {
    idJuego: 'tokat-says',
    nombreJuego: 'TOKAT SAYS'
  },
  onLeaderboard() {
    my.navigateTo({
      url: `/pages/leaderboard/leaderboard?id=${this.data.idJuego}&nombre=${encodeURIComponent(this.data.nombreJuego)}`
    });
  },
  startGame() {
    my.redirectTo({
      url: '/tokaRythm/tokaRhytm/pages/game/game'
    });
  }
});
