<!-- http://music.163.com/#/store/gain/uplyric -->
<template>
  <div id="app">
    <div class="container">
      <!-- what is this -->
      <el-row>
        <el-col :lg="{ span: 20, push: 2 }">
          <el-alert title="什么是 LRC 歌词？" type="info" description="LRC 即 Lyric 的缩写，是一种歌词格式，包含时间轴和断句。以 .lrc 为扩展名的歌词文件可以用于播放歌曲时同步显示滚动歌词。" :closable="false" show-icon>
          </el-alert>
        </el-col>
      </el-row>
      <!-- steps -->
      <el-row>
        <el-col :lg="{ span: 20, push: 2 }">
          <el-steps :active="step" process-status="process" finish-status="success">
            <el-step title="载入音乐文件" description="可以选择上传本地音乐文件或选择网络文件"></el-step>
            <el-step title="编辑歌词" description="填写好以下信息跟着音乐编辑歌词"></el-step>
            <el-step title="预览歌词并下载" description="编辑完毕后点击预览歌词查看效果，确认效果OK后点击下载歌词"></el-step>
          </el-steps>
        </el-col>
      </el-row>
      <!-- form -->
      <el-row :gutter="20">
        <!-- left -->
        <el-col :lg="{ span: 13, push: 2 }">
          <el-form ref="form" label-position="right" label-width="70px" :model="formModel" :rules="rules">
            <el-form-item label="歌曲名" prop="songName">
              <el-autocomplete class="auto-complete-sugg" placeholder="请输入歌曲名" @input="syncMeta" @select="selectHandler" v-model="formModel.songName" :trigger-on-focus="true" :fetch-suggestions="searchSuggest" custom-item="autocomplete-singer-name"></el-autocomplete>
            </el-form-item>
            <el-form-item label="歌手名" prop="singerName">
              <!--<el-input placeholder="请输入歌手名" @input="syncMeta" v-model="singerName"></el-input>-->
              <el-autocomplete class="auto-complete-sugg" placeholder="请输入歌手名" @input="syncMeta" @select="selectHandler" v-model="formModel.singerName" :trigger-on-focus="true" :fetch-suggestions="searchSuggest" custom-item="autocomplete-singer-name"></el-autocomplete>
            </el-form-item>
            <el-form-item label="专辑名">
              <el-input placeholder="请输入专辑名" @input="syncMeta" v-model="albumName"></el-input>
            </el-form-item>
            <el-form-item label="编辑人">
              <el-input placeholder="请输入编辑人" @input="syncMeta" v-model="byName"></el-input>
            </el-form-item>
            <!-- lrc-editor component -->
            <lrc-editor @bindMeta="bindMeta" @previewCallback="previewLyric" :aplayer="aplayer" :lyric="lyric" :songName="formModel.songName" :byName="byName" :loadedMedia="loadedMedia"></lrc-editor>
            <div class="button-group">
              <!--<el-button type="warning" icon="edit">临时保存(ctrl+S)</el-button>-->
              <el-tooltip class="lyric-download-confirm-tooltip" content="点击下载后会重置UI，请务必保存到本地" placement="left">
                <a class="lyric-download-confirm" href="javascript:;" @click="downloadConfirm"></a>
                <a ref="download" :class="downloadButtonClass" :href="downloadUrl" :download="downloadName" @click="downloadLyric" target="_blank">
                  <i class="el-icon--download1"></i>
                  <span>下载歌词</span>
                </a>
              </el-tooltip>
            </div>
          </el-form>
        </el-col>
        <!-- right -->
        <el-col :lg="{ span: 7, push: 2 }">
          <!-- aplayer -->
          <div class="aplayer"></div>
          <!-- uplaod or network -->
          <el-input placeholder="请输入（音乐）网络地址或上传本地音乐文件" @blur="loadNetworkMedia" @keyup.enter.native="loadNetworkMedia" v-model="networkMedia">
            <el-tooltip slot="append" content="上传本地音乐文件" placement="bottom">
              <!--<el-button icon="upload2"></el-button>-->
              <label class="el-button el-button--default">
                <i class="el-icon-upload2"></i>
                <input type="file" @change="uploadMediaHandler" accept="audio/*">
              </label>
            </el-tooltip>
          </el-input>
        </el-col>
      </el-row>
    </div>
    <!-- footer -->
    <footer class="page-footer">
      <div class="footer-content">
        <h2>Lyrics production tool</h2>
        <a href="javascript:;">反馈建议</a>
        <a href="javascript:;">使用指南</a>
        <el-tooltip content="QQ音乐提供数据接口支持" placement="top">
          <a href="http://y.qq.com" target="_blank">QQ音乐</a>
        </el-tooltip>
        <el-tooltip content="上传歌词赚积分" placement="top">
          <a href="http://music.163.com/#/store/gain/uplyric" target="_blank">网易云音乐</a>
        </el-tooltip>
      </div>
      <div class="icon-groups">
        <a href="javascript:;" class="el-icon--qq"></a>
        <a href="javascript:;" class="el-icon--weixin"></a>
        <el-tooltip content="欢迎关注我的微博(๑>◡<๑)" placement="top">
          <a href="http://www.weibo.com/u/5896727167" class="el-icon--weibo" target="_blank"></a>
        </el-tooltip>
        <el-tooltip content="喜欢的话收藏一下仓库哟(⌯˃̶᷄ ꈊ˂̶᷄ ૢ)" placement="top">
          <a href="https://github.com/u3u" class="el-icon--github" target="_blank"></a>
        </el-tooltip>
      </div>
    </footer>
  </div>
</template>
<script lang="babel">
import LrcEditor from './components/LrcEditor.vue'
import LRC from './utils/lrc.js'
import QQMusicAPI from './utils/QQMusicAPI.js'
import Thread from './utils/thread.js'
import Clipboard from './utils/clipboard.js'

export default {
  name: 'app',
  data() {
    return {
      formModel: {
        songName: null,
        singerName: null,
      },
      // 验证规则
      rules: {
        songName: [
          { required: true, message: '请输入歌曲名称' }
        ],
        singerName: [
          { required: true, message: '请输入歌手名称，多个歌手之间用 / 或 & 隔开' }
        ]
      },
      albumName: null,
      byName: null,
      lyric: null,
      aplayer: null,
      step: 0,
      loadedMedia: false, // 是否载入音频文件
      downloadUrl: 'javascript:;', // 歌词下载地址
      uploadMedia: null, // 用户上传的文件
      networkMedia: null, // 网络文件地址
    }
  },
  methods: {
    // [回调] 绑定信息
    bindMeta(meta) {
      this.formModel.songName = meta.songName
      this.formModel.singerName = meta.singerName
      this.albumName = meta.albumName
      this.byName = meta.byName
      this.downloadUrl = meta.lrc && this.formModel.songName && // generate or update .lrc download url
        this.formModel.singerName ? `data:text/plain;base64,${window.base64.encode(meta.lrc)}` : 'javascript:;'

      // 更新步骤条
      if (this.formModel.songName && this.formModel.singerName && meta.lrc && this.loadedMedia) this.step = 2
      else this.step = this.loadedMedia ? 1 : 0
    },
    // 同步LRC头部信息
    syncMeta() {
      this.$nextTick(function() {
        this.lyric = LRC.syncMeta.call(this, {
          songName: this.formModel.songName,
          singerName: this.formModel.singerName,
          albumName: this.albumName,
          byName: this.byName
        }) || ''
      })
    },
    // 子组件要求预览歌词，重新初始化APlayer
    previewLyric(lrc) {
      if (!lrc) {
        this.$message()
        return
      }
      const music = this.aplayer.music
      music.lrc = lrc
      this.createAplayer(music, true, 1)
      this.step = 3
    },
    // 下载确认
    downloadConfirm() {
      if (this.downloadUrl === 'javascript:;') return
      this.$confirm('点击下载后会将工作区重置到初始状态以便编辑新歌词，请务必保存到本地（为了避免误操作歌词会复制到剪切板）', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnPressEscape: true,
      }).then(() => setTimeout(() => this.$refs.download.click(), 500)).catch(() => {})
    },
    // 下载歌词
    downloadLyric(ev) {
      if (this.downloadUrl === 'javascript:;') return

      // 判断 Safari (not support downlaod attribute)
      const ua = window.navigator.userAgent.toLowerCase()
      const isSafari = ua.includes('safari') && !ua.includes('chrome') // 是否是 Safari 用户
      const iOS = window.device.ios() // 是否是 iOS 用户

      // base64解码提取出歌词文本
      const base64LRC = this.downloadUrl.substr(this.downloadUrl.indexOf(',') + 1)
      const lrc = window.base64.decode(base64LRC)
        // const top = document.body.scrollTop // Safari 复制后滚动条位置会发生变化
      const copyRes = Clipboard.copy(lrc) // 将歌词文本复制到剪切板

      if (isSafari || iOS) { // Mac Safari 和 iOS 用户: 复制到剪切板并提示用户
        if (copyRes) {
          // document.body.scrollTop = top // 修复复制后滚动条位置发生变化
          this.$message({
            type: 'warning',
            message: '您的浏览器不支持直接下载，已成功将歌词复制到剪切板',
            duration: 8e3,
            showClose: true,
            onClose: () => this.initUI() // 重置UI
          })
        }
        ev.preventDefault()
        return false
      }

      // 重置UI
      setTimeout(() => this.initUI())
    },
    // 重置UI到初始状态
    async initUI() {
      const loading = this.$loading({ fullscreen: true })
      const list = await QQMusicAPI.getMyLikeSongs() // 获取我喜欢的音乐
      const music = []
      for (let item of list) {
        let lrc = await QQMusicAPI.getLyric(item.songmid) // 获取LRC歌词
        lrc = lrc.replace(/\[/g, '\n[').trim() // 单行歌词兼容
        music.push({
          title: item.songname,
          author: item.singer.map(x => x.name).join(' / '),
          url: QQMusicAPI.getPlayUrl(item.songid),
          pic: QQMusicAPI.getSongPic(item.albummid),
          lrc,
        })
      }
      this.createAplayer(music, false, 1) // 创建播放器

      // const index = Math.floor(Math.random() * list.length) // 随机一首
      // const song = list[index]
      // let lrc = await QQMusicAPI.getLyric(song.songmid) // 获取LRC歌词
      // lrc = lrc.replace(/\[/g, '\n[').trim() // 单行歌词兼容

      // 创建播放器
      // this.createAplayer({
      //   title: song.songname,
      //   author: song.singer.map(x => x.name).join(' / '),
      //   url: QQMusicAPI.getPlayUrl(song.songid),
      //   pic: QQMusicAPI.getSongPic(song.albummid),
      //   lrc,
      // }, false, 1)

      this.formModel.songName = null
      this.formModel.singerName = null
      this.albumName = null
      this.byName = null
      this.lyric = null
      this.step = 0
      this.networkMedia = null
      this.downloadUrl = 'javascript:;'
      this.$nextTick(function() {
        this.$refs.form.resetFields()
      })

      await Thread.sleep(3e2)
      loading.close()
    },
    // 初始化APlayer
    async createAplayer(music, autoplay = false, showlrc = 0, mode = 'random', preload = 'metadata') {
      autoplay && window.NProgress.start()

      // 处理歌词显示切换无效
      const old = document.querySelector('.aplayer')
      const element = document.createElement('div')
      element.className = 'aplayer'
      old.parentElement.insertBefore(element, old)
      old.remove()

      const fixScrollTop = () => { // 修正 scrollTop
        if (!('length' in music)) return
        this.aplayer.element.querySelector('.aplayer-list').scrollTop =
          this.aplayer.element.querySelector('.aplayer-list .aplayer-list-light').offsetTop -
          this.aplayer.element.querySelector('.aplayer-list').offsetTop
      }

      // 初始化 APlayer
      this.aplayer = new window.APlayer({ element, autoplay, mode, preload, showlrc, music, listmaxheight: '115px' })
      if ('length' in music) {
        this.aplayer.element.querySelector('.aplayer-icon-menu').click() // 播放列表默认收缩
        fixScrollTop() // 修正 scrollTop
      }

      // register event
      this.aplayer.on('canplay', () => {
        window.NProgress.done()
        if (showlrc !== 0) return
        this.step = 1
        this.syncMeta()
        this.loadedMedia = true
        this.$message('音频文件已载入')
      })

      this.aplayer.on('play', fixScrollTop)
      this.aplayer.on('error', (err) => {
        this.$message({
          type: 'error',
          message: err.toString(),
        })
      })

      return this.aplayer
    },
    // 搜索建议
    async searchSuggest(qs, cb) {
      const empty = this.formModel.songName && this.formModel.singerName
      let currentElement = (window.event || { currentTarget: null }).currentTarget // if null
      const currentValue = (currentElement || { value: null }).value // if null
      let suggLength = document.querySelectorAll('.el-autocomplete__suggestions').length
      if (suggLength === 1 && qs === currentValue) suggLength = 0 // 禁止弹出多个搜索建议

      // if (currentElement.tagName.toLowerCase() === 'textarea') currentElement = null
      // const isActive = document.activeElement === currentElement // 是否是当前激活项

      if (!qs || (empty && suggLength > 0)) { // 禁止弹出多个搜索建议
        cb([]) // 搜索关键字为空
        return
      }
      // 如果歌曲名和歌手名都输入了，则搜索组合
      this.formModel.songName && this.formModel.singerName && (qs = `${this.formModel.songName.trim()} - ${this.formModel.singerName.trim()}`)
      const songlist = await QQMusicAPI.search(qs)
      cb(songlist)
    },
    // 绑定建议信息
    async selectHandler(item) {
      this.formModel.songName = item.songname
      this.formModel.singerName = item.singer.map(x => x.name).join(' / ')
      this.albumName = null // 重置专辑名
      const lyric = await QQMusicAPI.getTextLyric(item.songname, item.songid)
      console.info(lyric)
      this.createAplayer({
        title: this.formModel.songName,
        author: this.formModel.singerName,
        url: QQMusicAPI.getPlayUrl(item.songid),
        pic: QQMusicAPI.getSongPic(item.albummid),
      }, true, 0, 'loop')
    },
    // 加载网络文件
    loadNetworkMedia() {
      // 武娘 http://124.14.7.27/m10.music.126.net/20161224174821/f3b95cf9f7eb23ffb890508699f4559e/ymusic/b7ba/8b59/9c12/d261860f251f53a78ac9b8a649ed1343.mp3?wshc_tag=0&wsts_tag=585e3e89&wsid_tag=652ca5c2&wsiphost=ipdbm
      if (!this.networkMedia.trim() || this.networkMedia === this.aplayer.audio.src) { // 如果URL为空或未改变则不加载
        return
      }
      this.formModel.songName = '未知歌曲'
      this.formModel.singerName = '未知歌手'
      this.aplayer = this.createAplayer({
        url: this.networkMedia,
        title: this.formModel.songName,
        author: this.formModel.singerName,
      }, true, 0)
    },
    // 上传音频文件
    uploadMediaHandler(ev) {
      const file = ev.target.files[0]

      // 判断文件类型
      if (!file.type.startsWith('audio/')) {
        this.$message({
          type: 'error',
          message: '文件格式不支持，请上传音频文件',
        })
        return
      }

      const loading = this.$loading({ fullscreen: true })

      // 文件名（歌手 - 歌名.扩展名）
      const result = /(.+)\s*-\s*(.+)(\..+)/.exec(file.name)
      if (result) {
        this.formModel.singerName = result[1]
        this.formModel.songName = result[2]
      } else { // 文件格式不匹配，采用文件名作为歌曲名
        this.formModel.songName = file.name.substr(0, file.name.lastIndexOf('.')) || '未知歌曲'
        this.formModel.singerName = '未知歌手'
      }

      // 读取本地文件
      const reader = new window.FileReader()
      reader.onload = (ev) => {
        const url = this.uplaodMedia = ev.target.result

        // create aplayer music object model
        this.aplayer = this.createAplayer({
          url,
          title: this.formModel.songName,
          author: this.formModel.singerName,
        }, true, 0)
        loading.close()
      }
      reader.readAsDataURL(file)

      ev.target.value = null // reset file value
    },
  },
  // 初始化
  created() {
    this.$nextTick(this.initUI)
  },
  computed: {
    downloadName() {
      if (this.downloadUrl === 'javascript:;') return
      return `${this.formModel.singerName.replace(/\s*\/\s*/, '&')} - ${this.formModel.songName}.lrc`
    },
    downloadButtonClass() {
      return {
        'el-button': true,
        'el-button--primary': true,
        'is-disabled': this.downloadUrl === 'javascript:;'
      }
    }
  },
  components: { LrcEditor }
}
</script>
<style lang="scss">
* {
  -webkit-tap-highlight-color: transparent;
}

::selection {
  background: rgba(88, 183, 255, .7);
  color: #fff;
}

html {
  height: 100%;
}

body {
  min-height: 100%;
  margin: 0;
  color: #333;
  font-family: "Pingfang SC", STHeiti, "Lantinghei SC", "Open Sans", Arial, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", SimSun, sans-serif;
  -webkit-font-smoothing: antialiased;
}

#app {
  [class*=" el-icon--"],
  [class^=el-icon--] {
    font-family: iconfont !important;
  }
  .container {
    padding: 15px;
  }
}

a {
  text-decoration: none;
}

input[type=file] {
  display: none;
}

.el-row {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}

textarea {
  resize: none !important;
  margin-bottom: 22px;
}

input,
textarea,
.el-alert,
.el-button,
.el-steps,
.aplayer-pic,
.el-input-group__append {
  opacity: .85 !important;
}

.aplayer {
  background: rgba(255, 255, 255, .85);
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, .12);
  margin: 0 !important;
  margin-bottom: 26px !important;
  .aplayer-pic {
    background: url('http://q4.qlogo.cn/g?b=qq&nk=485463145&s=100');
    background-size: cover;
  }
  .aplayer-lrc {
    background: transparent;
    &::before,
    &::after {
      opacity: 0;
    }
  }
  .aplayer-lrc-contents {
    margin-left: 5px;
    p {
      text-align: left;
    }
  }
  .aplayer-list ol li {
    height: 37px;
    line-height: 37px;
    .aplayer-list-index {
      display: none;
    }
  }
}

@media (max-width: 1199px) {
  .aplayer {
    margin-top: 26px !important;
  }
}

.button-group {
  text-align: right;
}

.page-footer {
  height: 120px;
  background-color: #324057;
  color: #a4aebd;
  overflow: hidden;
  margin-top: 10px;
  position: relative;
  .footer-content {
    white-space: nowrap;
    position: absolute;
    top: 50%;
    left: 15%;
    transform: translate3d(0, -50%, 0);
  }
  h2 {
    font-size: 22px;
    font-weight: 400;
    margin: 0;
    &::after {
      content: "(●'◡'●)ﾉ♥";
      animation: face-shake 5s infinite;
      display: inline-block;
      text-indent: 8px;
    }
  }
  a {
    font-size: 12px;
    color: #768193;
    text-decoration: none;
    margin-right: 8px;
  }
  .icon-groups {
    position: absolute;
    top: 50%;
    right: 15%;
    transform: translate3d(0, -50%, 0);
    -webkit-user-select: none;
    [class*=" el-icon--"],
    [class^=el-icon--] {
      font-size: 34px;
      display: inline-block;
      vertical-align: middle;
      transition: .3s;
      margin: 0 8px;
      &:hover {
        color: #fff;
        transform: scale(1.2);
      }
    }
  }
}


/* ipad */

@media (max-width: 768px) {
  .page-footer {
    .footer-content {
      left: 10%;
    }
    .icon-groups {
      right: 10%;
    }
  }
}


/* iPhone 6 plus */

@media (max-width: 414px) {
  .page-footer {
    h2::after,
    .icon-groups {
      display: none;
    }
    a {
      margin: 0;
      &:nth-of-type(3),
      &:nth-of-type(4) {
        display: none;
      }
    }
  }
}


/* auto-complete */

.auto-complete-sugg {
  li {
    line-height: normal !important;
    padding: 7px !important;
    .songName {
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .singerName {
      font-size: 12px;
      color: #b4b4b4;
    }
    .highlighted .singerName {
      color: #ddd;
    }
  }
}

.el-message__group p {
  vertical-align: top !important;
}

.lyric-download-confirm {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
}


/* 搜索建议增加QQ音乐版权 */

@media (min-width: 768px) {
  .auto-complete-sugg .el-input {
    /*.el-autocomplete__suggestions,*/
    &::before,
    &::after {
      content: 'QQ音乐提供接口支持';
      position: absolute;
      z-index: 9;
      right: 10px;
      top: 50%;
      transform: translate3d(0, -50%, 0);
      font-size: 12px;
      line-height: normal;
      color: #c6c6c6;
      /*bottom: 10px;*/
    }
    &::before {
      /*content: '\e615';
    font-family: iconfont !important;
    color: #f9cb15;*/
      /*bottom: 12px;*/
      content: '';
      right: 130px;
      width: 12px;
      height: 12px;
      background: url('http://y.qq.com/favicon.ico') no-repeat;
      background-size: cover;
    }
  }
}
</style>