Component({
  props: {
    puntos: 0
  },
  methods: {
    onBellTap() {
      my.showToast({ content: 'Notificaciones' });
    }
  }
});
