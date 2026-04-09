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
      url: '/pages/tokat-says/tokaRhytm/pages/game/game'
    });
  }
});
