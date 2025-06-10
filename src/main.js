import { createApp } from 'vue'
import './assets/main.css'
import App from './App.vue'

// Global error handler
const app = createApp(App)

app.config.errorHandler = (error, instance, info) => {
  console.error('Vue Error:', error)
  console.error('Component:', instance)
  console.error('Info:', info)
}

// Global properties for debugging (development only)
if (import.meta.env.DEV) {
  app.config.globalProperties.$log = console.log
}

app.mount('#app')