const app = getApp();

Page({
  data: {
    puntos: 0,
    usuario: 'Jugador_01',
    opciones: [
      { label: 'Historial de Cupones' },
      { label: 'Configuración' },
      { label: 'Soporte' }
    ]
  },

  onShow() {
    this.setData({
      puntos: app.globalData.puntos,
      usuario: app.globalData.usuario
    });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      });
    }
  },

  onTapOpcion(e) {
    const label = e.currentTarget.dataset.label;
    console.log(`Abriendo sección: ${label}`);
    my.showToast({ content: `Abriendo: ${label}` });
  }
});
