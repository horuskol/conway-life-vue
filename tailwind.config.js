module.exports = {
  content: [
    './src/**/*.html',
    './src/**/*.vue'
  ],
  theme: {
    extend: {
      gridTemplateRows: {
        'layout': 'auto 1fr auto'
      }
    },
    fontFamily: {
      'default': 'roboto, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans',
    }
  },
  variants: {},
  plugins: [],
}
