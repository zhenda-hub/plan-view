import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// Create pinia instance
const pinia = createPinia()

// Create app
const app = createApp(App)

app.use(pinia)

app.mount('#app')
