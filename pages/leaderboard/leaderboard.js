const app = getApp();

Page({
  data: {
    puntos: 0,
    nombreJuego: '',
    idJuego: '',
    countdownText: '00d 00h 00m 00s',
    topPlayers: [],
    otherPlayers: [],
    timer: null
  },

  onLoad(query) {
    const id = query.id || 'detective-tokat';
    const nombre = decodeURIComponent(query.nombre || 'TokArcade');

    this.setData({
      idJuego: id,
      nombreJuego: nombre
    });

    this.loadLeaderboardData();
    this.startCountdown();
  },

  onShow() {
    this.setData({ puntos: app.globalData.puntos });
  },

  onUnload() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  onBack() {
    my.navigateBack();
  },

  loadLeaderboardData() {
    // Mock data for demonstration
    const allPlayers = [
      { rank: 1, name: 'AlexArcade', score: 12500, avatar: '' },
      { rank: 2, name: 'TokatMaster', score: 11200, avatar: '' },
      { rank: 3, name: 'PixelHero', score: 9800, avatar: '' },
      { rank: 4, name: 'SonicBoi', score: 8500, avatar: '' },
      { rank: 5, name: 'User123', score: 7200, avatar: '', isUser: true },
      { rank: 6, name: 'RetroQueen', score: 6900, avatar: '' },
      { rank: 7, name: 'GhostPlayer', score: 5500, avatar: '' },
      { rank: 8, name: 'BitsAndBytes', score: 4200, avatar: '' },
      { rank: 9, name: 'CyberNeon', score: 3800, avatar: '' },
      { rank: 10, name: 'PowerUp', score: 3100, avatar: '' },
    ];

    this.setData({
      topPlayers: allPlayers.slice(0, 3),
      otherPlayers: allPlayers.slice(3)
    });
  },

  startCountdown() {
    const updateTimer = () => {
      const now = new Date();
      const nextSunday = new Date();
      
      // Calculate next Sunday 23:59:59
      const day = nextSunday.getDay();
      const diff = 7 - day; 
      nextSunday.setDate(nextSunday.getDate() + (diff === 7 ? 0 : diff));
      nextSunday.setHours(23, 59, 59, 999);

      const timeLeft = nextSunday.getTime() - now.getTime();

      if (timeLeft <= 0) {
        this.setData({ countdownText: '00d 00h 00m 00s' });
        return;
      }

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      const text = `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
      
      this.setData({ countdownText: text });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    this.setData({ timer });
  }
});
