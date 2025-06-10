import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'


const app = createApp(App)

const pinia = createPinia()
pinia.use(({ store }) => {
  store.$subscribe((mutation, state) => {
    console.log(mutation.events.type, mutation, state);

    //localStorage.setItem(store.$id, JSON.stringify(state))
  })
})
app.use(pinia)
app.use(router)

app.mount('#app')
