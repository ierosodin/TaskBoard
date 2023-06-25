/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify, ThemeDefinition  } from 'vuetify'

const myCustomDarkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#202030',
    surface: '#303040',
    primary: '#d0d0d0',
    'primary-darken-1': '#0d56a2',
    secondary: '#5CBBF6',
    'secondary-darken-1': '#3f81ad',
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
    heatmap: '#008FFB',
    unknown: '#888888',
  }
}

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'myCustomDarkTheme',
    themes: {
      myCustomDarkTheme,
    }
  }
})
