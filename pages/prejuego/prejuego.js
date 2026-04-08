const app = getApp();

const GAME_INFO = {
  'detective-tokat': {
    instrucciones: "¡Hola Detective! Alguien ha robado los archivos secretos de Tokat. Tu misión es recuperarlos respondiendo preguntas sobre Cultura, Arte o Historia.\n\nElige tu categoría y nivel de dificultad para comenzar la investigación. ¡Buena suerte!",
    route: '/detectivetokat/tokaDetective/pages/index/index'
  },
  'tokat-says': {
    instrucciones: "Memoriza la secuencia que muestra Tokat y repite los gestos en el mismo orden. A partir de la ronda 5, prepárate para el botón TAP y el tiempo límite por gesto. ¡Gana tokens cada 5 rondas!",
    route: '/tokaRythm/tokaRhytm/pages/index/index' 
  },
  'eyden-rps': {
    instrucciones: "¡Piedra, Papel o Tijera al ritmo de la música! Derrota a tus oponentes siguiendo el compás. Toca el gesto correcto en el momento preciso.",
    route: '/pages/juego/juego'
  }
};

Page({
  data: {
    puntos: 0,
    nombreJuego: '',
    idJuego: '',
    instrucciones: ''
  },

  onLoad(query) {
    const id = query.id || '';
    const info = GAME_INFO[id] || { instrucciones: 'Cargando instrucciones...' };

    this.setData({
      idJuego: id,
      nombreJuego: decodeURIComponent(query.nombre || 'NOMBRE DEL JUEGO'),
      instrucciones: info.instrucciones
    });
  },

  onShow() {
    this.setData({ puntos: app.globalData.puntos });
  },

  onBack() {
    my.navigateBack();
  },

  onJugar() {
    const info = GAME_INFO[this.data.idJuego];
    const url = info && info.route ? 
      `${info.route}?id=${this.data.idJuego}&nombre=${encodeURIComponent(this.data.nombreJuego)}` :
      `../juego/juego?id=${this.data.idJuego}&nombre=${encodeURIComponent(this.data.nombreJuego)}`;

    my.navigateTo({ url });
  },

  onLeaderboard() {
    my.showToast({
      content: 'Leaderboard próximamente',
      type: 'none'
    });
  }
});
