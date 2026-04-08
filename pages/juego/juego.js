Page({
  data: {
    nombreJuego: '',
    idJuego: ''
  },

  onLoad(query) {
    this.setData({
      idJuego: query.id || '',
      nombreJuego: decodeURIComponent(query.nombre || 'JUEGO DESCONOCIDO')
    });
  },

  onSalir() {
    // Al salir regresamos al tab de Inicio (MenuPrincipal)
    my.switchTab({
      url: '/pages/menu/menu'
    });
  }
});
