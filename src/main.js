/*
 * @Author: @u3u 
 * @Date: 2016-12-21 18:19:54 
 * @Last Modified by: @u3u
 * @Last Modified time: 2016-12-23 21:59:09
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
import QQMusicAPI from './utils/QQMusicAPI.js'

/* eslint-disable no-new */

Vue.component('autocomplete-singer-name', {
  functional: true,
  render: function (h, ctx) {
    var item = ctx.props.item
    return h('li', ctx.data, [
      h('div', { attrs: { class: 'songName' } }, [QQMusicAPI.htmldecode(item.songname)]),
      h('span', { attrs: { class: 'singerName' } }, [QQMusicAPI.htmldecode(item.singer.map(x => x.name).join(' / '))])
    ])
  },
  props: {
    item: { type: Object, required: true }
  }
})

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
