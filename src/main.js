// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

// element-ui
import { Button } from 'element-ui'
Vue.use(Button)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
