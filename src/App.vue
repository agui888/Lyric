<template>
  <div id="app">
    <div style="padding: 15px;">
      <el-button type="primary" @click="welcome">{{ hello }}</el-button>
    </div>
  </div>
</template>
<script>
import { Message } from 'element-ui'

export default {
  name: 'app',
  data() {
    return {
      hello: 'Welcome Use Element-UI',
    }
  },
  methods: {
    welcome() {
      Message({
        type: 'warning',
        showClose: true,
        message: 'Welcome Use Element-UI'
      })
    }
  },
  components: { Message }
}
</script>
<style>
html {
  height: 100%;
}

body {
  min-height: 100%;
  margin: 0;
}

#app {
  font-family: "Pingfang SC", STHeiti, "Lantinghei SC", "Open Sans", Arial, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", SimSun, sans-serif;
  color: #333;
}
</style>