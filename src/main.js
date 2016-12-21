/*
 * @Author: @u3u 
 * @Date: 2016-12-21 18:19:54 
 * @Last Modified by: @u3u
 * @Last Modified time: 2016-12-21 18:22:46
 */

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

// element-ui
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
Vue.use(ElementUI)

import Thread from './utils/thread'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  beforeCreate() {
    window.NProgress.start()
  },
  async mounted() {
    await Thread.sleep(3e2)
    window.NProgress.done()
  },
  render: h => h(App)
})
