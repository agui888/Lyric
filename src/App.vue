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
            <el-step title="预览歌词" description="编辑完毕后点击预览歌词查看效果"></el-step>
          </el-steps>
        </el-col>
      </el-row>
      <!-- form -->
      <el-row :gutter="20">
        <el-col :lg="{ span: 13, push: 2 }">
          <el-form ref="form" label-position="left" label-width="60px">
            <el-form-item label="歌曲名">
              <el-autocomplete class="auto-complete-sugg" placeholder="请输入歌曲名" @input="syncMeta" @select="selectHandler" v-model="songName" :trigger-on-focus="false" :fetch-suggestions="searchSuggest" custom-item="autocomplete-singer-name"></el-autocomplete>
            </el-form-item>
            <el-form-item label="歌手名">
              <!--<el-input placeholder="请输入歌手名" @input="syncMeta" v-model="singerName"></el-input>-->
              <el-autocomplete class="auto-complete-sugg" placeholder="请输入歌手名" @input="syncMeta" @select="selectHandler" v-model="singerName" :trigger-on-focus="false" :fetch-suggestions="searchSuggest" custom-item="autocomplete-singer-name"></el-autocomplete>
            </el-form-item>
            <el-form-item label="专辑名">
              <el-input placeholder="请输入专辑名" @input="syncMeta" v-model="albumName"></el-input>
            </el-form-item>
            <el-form-item label="编辑人">
              <el-input placeholder="请输入编辑人" @input="syncMeta" v-model="byName"></el-input>
            </el-form-item>
            <!-- lrc-editor component -->
            <lrc-editor @bindMeta="bindMeta" :aplayer="aplayer" :lyric="lyric"></lrc-editor>
          </el-form>
        </el-col>
        <el-col :lg="{ span: 7, push: 2 }">
          <!-- aplayer -->
          <div class="aplayer"></div>
          <!-- uplaod or network -->
          <el-input placeholder="请输入（音乐）网络地址或上传本地音乐文件">
            <el-tooltip slot="append" content="上传本地音乐文件" placement="bottom">
              <el-button icon="upload2"></el-button>
            </el-tooltip>
          </el-input>
        </el-col>
      </el-row>
    </div>
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

export default {
  name: 'app',
  data() {
    return {
      songName: null,
      singerName: null,
      albumName: null,
      byName: null,
      lyric: null,
      aplayer: null,
      step: 0,
    }
  },
  methods: {
    // [回调] 绑定信息
    bindMeta(meta) {
      this.songName = meta.songName
      this.singerName = meta.singerName
      this.albumName = meta.albumName
      this.byName = meta.byName
    },
    // 同步LRC头部信息
    syncMeta() {
      this.$nextTick(function() {
        this.lyric = LRC.syncMeta.call(this, {
          songName: this.songName,
          singerName: this.singerName,
          albumName: this.albumName,
          byName: this.byName
        })
      })
    },
    // 初始化APlayer
    async createAplayer(music, autoplay = false, showlrc = 0, mode = 'random', preload = 'metadata') {
      // 处理歌词显示切换无效
      const old = document.querySelector('.aplayer')
      const element = document.createElement('div')
      element.className = 'aplayer'
      old.parentElement.insertBefore(element, old)
      old.remove()

      this.aplayer = new window.APlayer({ element, autoplay, mode, preload, showlrc, music, listmaxheight: '115px' })
      this.aplayer.on('canplay', () => {
        debugger
        if (showlrc !== 0) return
        this.step = 1
        this.syncMeta()
        this.$message('音频文件已载入')
      })
      return this.aplayer
    },
    // 搜索建议
    async searchSuggest(qs, cb) {
      const empty = this.songName && this.singerName // 禁止弹出多个搜索建议
      if (!qs || (empty && document.querySelectorAll('.el-autocomplete__suggestions').length > 0)) {
        cb([]) // 搜索关键字为空
        return
      }
      // 如果歌曲名和歌手名都输入了，则搜索组合
      this.songName && this.singerName && (qs = `${this.songName.trim()} - ${this.singerName.trim()}`)
      const result = await QQMusicAPI.search(qs)
      cb(result.data.song.list)
    },
    // 绑定建议信息
    selectHandler(item) {
      this.songName = item.songname
      this.singerName = item.singer.map(x => x.name).join(' / ')
      this.createAplayer({
        title: this.songName,
        author: this.singerName,
        url: QQMusicAPI.getPlayUrl(item.songid),
        pic: QQMusicAPI.getSongPic(item.albummid),
      }, true, 0, 'loop')
    }
  },
  // 初始化
  created() {
    this.$nextTick(async function() {
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

      await Thread.sleep(3e2)
      loading.close()
    })
  },
  components: { LrcEditor }
}
</script>
<style lang="scss">
* {
  -webkit-tap-highlight-color: transparent;
}

html {
  height: 100%;
}

body {
  min-height: 100%;
  margin: 0;
  font-family: "Pingfang SC", STHeiti, "Lantinghei SC", "Open Sans", Arial, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", SimSun, sans-serif;
  color: #333;
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
    margin-top: 26px;
  }
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
</style>