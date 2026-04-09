const app = getApp();

const simulatedCoupons = [
  { id: 'c1', tipo: '2x1', desc: 'Lleva 2 y paga 1 en seleccionados', precio: 50 },
  { id: 'c2', tipo: '40% OFF', desc: 'Descuento en tu próxima compra', precio: 100 },
  { id: 'c3', tipo: 'Envío', desc: 'Envío sin costo (pedidos > $200)', precio: 30 }
];

Page({
  data: {
    puntos: 0,
    showKiosco: false,
    selectedMarca: null,
    marcas: [
      { id: 'tokat', nombre: 'Tokat Coffee', color: '#ff9800', logo: '/images/logo_tokat.png', cupones: simulatedCoupons },
      { id: 'cine', nombre: 'CineTok', color: '#e91e63', logo: '/images/logo_cine.png', cupones: simulatedCoupons },
      { id: 'burger', nombre: 'BurgerArcade', color: '#ffc107', logo: '/images/logo_burger.png', cupones: simulatedCoupons },
      { id: 'tech', nombre: 'Tech Store', color: '#2196f3', logo: '/images/logo_tech.png', cupones: simulatedCoupons },
      { id: 'pizza', nombre: 'Pizza Hero', color: '#f44336', logo: '/images/logo_pizza.png', cupones: simulatedCoupons },
      { id: 'ice', nombre: 'Ice Cream Lab', color: '#00bcd4', logo: '/images/logo_ice.png', cupones: simulatedCoupons }
    ],
    rayas: [
      { color: '#800000' }, { color: '#ffffff' },
      { color: '#800000' }, { color: '#ffffff' },
      { color: '#800000' }, { color: '#ffffff' }
    ],
    cart: [],
    cartTotal: 0,
    showCartModal: false,
    selectedCupon: null
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
  },

  onLongTapCupon(e) {
    const cupon = e.currentTarget.dataset.cupon;
    this.setData({ selectedCupon: cupon });
  },

  onCloseCuponInfo() {
    this.setData({ selectedCupon: null });
  },

  onTapCupon(e) {
    const cupon = e.currentTarget.dataset.cupon;
    const item = { ...cupon, marcaNombre: this.data.selectedMarca.nombre, idCarrito: Date.now().toString() };
    const newCart = [...this.data.cart, item];
    const newTotal = newCart.reduce((s, c) => s + c.precio, 0);
    this.setData({ cart: newCart, cartTotal: newTotal });
    my.showToast({ content: 'Añadido al carrito' });
  },

  onOpenCart() {
    this.setData({ showCartModal: true });
  },

  onCloseCart() {
    this.setData({ showCartModal: false });
  },

  onCheckout() {
    if (this.data.cart.length === 0) {
      my.showToast({ content: 'Carrito vacío' });
      return;
    }
    if (this.data.puntos >= this.data.cartTotal) {
      app.globalData.puntos -= this.data.cartTotal;
      this.setData({ 
        puntos: app.globalData.puntos, 
        cart: [],
        cartTotal: 0,
        showCartModal: false
      });
      my.showToast({ content: 'Canje exitoso' });
    } else {
      my.showToast({ content: 'Puntos insuficientes' });
    }
  }
});
