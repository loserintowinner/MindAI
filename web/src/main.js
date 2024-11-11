import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/icon-font/iconfont.css'
import '@/assets/icon-font/extend/iconfont.css'
import 'viewerjs/dist/viewer.css'
import VueViewer from 'v-viewer'
import i18n from './i18n'
import './css/global.css'
import { getLang } from '@/api'
// import VConsole from 'vconsole'
// const vConsole = new VConsole()

Vue.config.productionTip = false
const bus = new Vue()
Vue.prototype.$bus = bus
Vue.use(ElementUI)
Vue.use(VueViewer)
Vue.mixin({
  data () {
    return {
      IS_ELECTRON: window.IS_ELECTRON,
      IS_MAC: window.platform === 'darwin',
      IS_WIN: window.platform === 'win32',
      IS_LINUX: window.platform === 'linux'
    }
  }
})

const initApp = () => {
  i18n.locale = getLang()
  new Vue({
    render: h => h(App),
    router,
    store,
    i18n
  }).$mount('#app')
}

// 是否处于接管应用模式
if (window.takeOverApp) {
  window.initApp = initApp
  window.$bus = bus
} else {
  initApp()
}

