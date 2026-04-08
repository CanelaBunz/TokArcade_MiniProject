Component({
  data: {
    selected: 1,
    color: "#888888",
    selectedColor: "#e94560",
    list: [
      {
        pagePath: "/pages/tienda/tienda",
        text: "Tienda",
        iconPath: "/images/icon_tienda.png",
        selectedIconPath: "/images/icon_tienda.png"
      },
      {
        pagePath: "/pages/menu/menu",
        text: "Inicio",
        iconPath: "/images/icon_home.png",
        selectedIconPath: "/images/icon_home.png"
      },
      {
        pagePath: "/pages/perfil/perfil",
        text: "Perfil",
        iconPath: "/images/icon_perfil.png",
        selectedIconPath: "/images/icon_perfil.png"
      }
    ]
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      my.switchTab({ url });
      // Note: setData for 'selected' is usually called from page onShow
      // to ensure consistency across different entry points.
    }
  }
});
