Page({
  data: {
    tokatFrame: '/pages/pages/tokaRPS/assets/tokat/frame0000.png',
    idJuego: 'eyden-rps',
    nombreJuego: 'TOKA RPS RHYTHM'
  },

  onLeaderboard() {
    my.navigateTo({
      url: `/pages/leaderboard/leaderboard?id=${this.data.idJuego}&nombre=${encodeURIComponent(this.data.nombreJuego)}`
    });
  },

  onLoad() {
    this.frames = [
      '/pages/pages/tokaRPS/assets/tokat/frame0000.png',
      '/pages/pages/tokaRPS/assets/tokat/frame0001.png',
      '/pages/pages/tokaRPS/assets/tokat/frame0002.png',
      '/pages/pages/tokaRPS/assets/tokat/frame0003.png',
      '/pages/pages/tokaRPS/assets/tokat/frame0004.png',
      '/pages/pages/tokaRPS/assets/tokat/frame0005.png',
      '/pages/pages/tokaRPS/assets/tokat/frame0006.png'
    ];

    // Loop tipo ida y vuelta para que no “salte” raro
    this.sequence = [0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1];
    this.framePointer = 0;
    this.spriteTimer = null;

    this.startTokatAnimation();
  },

  onUnload() {
    this.stopTokatAnimation();
  },

  onHide() {
    this.stopTokatAnimation();
  },

  onShow() {
    if (!this.spriteTimer) {
      this.startTokatAnimation();
    }
  },

  startTokatAnimation() {
    this.stopTokatAnimation();

    this.spriteTimer = setInterval(() => {
      const frameIndex = this.sequence[this.framePointer];
      const nextFrame = this.frames[frameIndex];

      this.setData({
        tokatFrame: nextFrame
      });

      this.framePointer += 1;

      if (this.framePointer >= this.sequence.length) {
        this.framePointer = 0;
      }
    }, 140); // prueba entre 120 y 180
  },

  stopTokatAnimation() {
    if (this.spriteTimer) {
      clearInterval(this.spriteTimer);
      this.spriteTimer = null;
    }
  },

  startGame() {
    my.redirectTo({
      url: '/pages/tokaRPS/pages/game/game'
    });
  }
});
