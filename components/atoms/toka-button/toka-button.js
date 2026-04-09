Component({
  props: {
    variant: 'primary',
    size: 'md',
    fullWidth: false,
    loading: false,
    disabled: false,
    className: '',
    dataChoice: '',
    onClick: () => {}
  },
  methods: {
    handleTap(e) {
      if (!this.props.disabled && !this.props.loading) {
        if (typeof this.props.onClick === 'function') {
          // Pass proxy dataset back if needed
          if (this.props.dataChoice && e && e.currentTarget) {
            e.currentTarget.dataset = e.currentTarget.dataset || {};
            e.currentTarget.dataset.choice = this.props.dataChoice;
          }
          this.props.onClick(e);
        }
      }
    }
  }
});
