import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import "chance";



const app = createApp(App)

const pinia = createPinia()
console.log(import.meta.env)

app.use(pinia)
app.use(router)

app.mount('#app')
