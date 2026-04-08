const app = getApp();

Page({
  data: {
    puntos: 0,
    showKiosco: false,
    selectedMarca: null,
    marcas: [
      { id: 'tokat', nombre: 'Tokat Coffee', color: '#ff9800', logo: '/images/logo_tokat.png' },
      { id: 'cine', nombre: 'CineTok', color: '#e91e63', logo: '/images/logo_cine.png' },
      { id: 'burger', nombre: 'BurgerArcade', color: '#ffc107', logo: '/images/logo_burger.png' },
      { id: 'tech', nombre: 'Tech Store', color: '#2196f3', logo: '/images/logo_tech.png' },
      { id: 'pizza', nombre: 'Pizza Hero', color: '#f44336', logo: '/images/logo_pizza.png' },
      { id: 'ice', nombre: 'Ice Cream Lab', color: '#00bcd4', logo: '/images/logo_ice.png' }
    ],
    rayas: [
      { color: '#800000' }, { color: '#ffffff' },
      { color: '#800000' }, { color: '#ffffff' },
      { color: '#800000' }, { color: '#ffffff' }
    ]
  },

  onShow() {
    this.setData({ puntos: app.globalData.puntos });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  },

  onTapMarca(e) {
    const id = e.currentTarget.dataset.id;
    const marca = this.data.marcas.find(m => m.id === id);
    this.setData({
      selectedMarca: marca,
      showKiosco: true
    });
  },

  onCloseKiosco() {
    this.setData({
      showKiosco: false,
      selectedMarca: null
    });
  }
});
