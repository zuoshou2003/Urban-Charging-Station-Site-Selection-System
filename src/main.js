import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'leaflet/dist/leaflet.css'

const app = createApp(App)
app.use(ElementPlus)

// 防止ResizeObserver错误显示
const debounceResizeObserverLoopError = () => {
  const resizeObserverError = /ResizeObserver loop completed with undelivered notifications/
  window.addEventListener('error', e => {
    if (e.message && resizeObserverError.test(e.message)) {
      e.stopImmediatePropagation()
      return true
    }
  }, true)
}

debounceResizeObserverLoopError()

// Mount the app
app.mount('#app')
