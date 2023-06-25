/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'

// Composables
import { createApp} from 'vue'
// import './main.scss'

import moment from 'moment';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

import Vue from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

const app = createApp(App)

app.component('VueDatePicker', VueDatePicker);

registerPlugins(app)

app.mount('#app')
