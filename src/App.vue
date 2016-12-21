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
          <el-steps :active="0">
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
              <el-input placeholder="请输入歌曲名" @input="syncMeta" v-model="songName"></el-input>
            </el-form-item>
            <el-form-item label="歌手名">
              <el-input placeholder="请输入歌手名" @input="syncMeta" v-model="singerName"></el-input>
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
        <a href="javascript:;">贡献指南</a>
      </div>
    </footer>
  </div>
</template>
<script lang="babel">
import LrcEditor from './components/LrcEditor.vue'
import LRC from './utils/lrc.js'
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
    }
  },
  methods: {
    preview() {
      this.$message({
        type: 'warning',
        showClose: true,
        message: 'Welcome Use Element-UI'
      })
    },
    bindMeta(meta) {
      this.songName = meta.songName
      this.singerName = meta.singerName
      this.albumName = meta.albumName
      this.byName = meta.byName
    },
    syncMeta() {
      this.lyric = LRC.syncMeta(this)
    },
    createAplayer() {
      this.aplayer = new window.APlayer({
        element: document.querySelector('.aplayer'), // Optional, player element
        autoplay: false, // Optional, autoplay song(s), not supported by mobile browsers
        showlrc: 1, // Optional, show lrc, can be 0, 1, 2, see: ###With lrc
        mode: 'loop', // Optional, play mode, can be `random` `single` `circulation`(loop) `order`(no loop), default: `circulation`
        preload: 'metadata', // Optional, the way to load music, can be 'none' 'metadata' 'auto', default: 'auto'
        music: { // Required, music info, see: ###With playlist
          title: '大浪淘沙', // Required, music title
          author: '玄觞', // Required, music author
          url: 'http://ws.stream.qqmusic.qq.com/C100001ucK5y0OG575.m4a?fromtag=0', // Required, music url
          pic: 'http://q4.qlogo.cn/g?b=qq&nk=485463145&s=140', // Optional, music picture
          lrc: '[ti:大浪淘沙]\n[ar:玄觞]\n[al:大浪淘沙]\n[by:]\n[offset:0]\n[00:00.13]大浪淘沙 - 玄觞\n[00:01.18]词：王朝\n[00:01.73]曲：王朝\n[00:02.35]编曲：宏宇\n[00:03.07]吉他：Envoyofchaos\n[00:03.70]美工：KK\n[00:04.37]\n[00:31.92]紫色的沙漠\n[00:33.20]有黑色的漩涡\n[00:34.81]驼铃像一个陷阱\n[00:36.37]会将路人捕获\n[00:37.72]\n[00:38.36]仙人掌下面\n[00:39.75]长出一簇贝壳\n[00:41.22]而风会变成毒蛇\n[00:42.95]给云彩触摸\n[00:44.99]初冬的季节\n[00:46.32]会有商队经过\n[00:47.84]马蹄底下却踩着\n[00:49.50]被遗忘的王国\n[00:50.91]\n[00:51.54]也许你听说\n[00:52.93]这里太阳不落\n[00:54.37]温柔也伴着恶魔\n[00:56.18]会将我们吞没\n[00:58.27]Ah\n[00:58.57]\n[00:59.28]Ah\n[01:00.00]\n[01:00.53]Ah\n[01:04.12]Ah\n[01:10.81]\n[01:11.62]梦境里大浪淘沙\n[01:13.21]洗尽了谁的铅华\n[01:14.84]海市蜃楼千年之期都化作涂鸦\n[01:18.00]梦境里大浪淘沙\n[01:19.70]沉寂了多少梦啊\n[01:21.39]记忆都坍塌\n[01:23.84]被冲刷\n[01:26.75]\n[01:31.55]紫色的沙漠\n[01:32.62]有黑色的漩涡\n[01:34.27]驼铃像一个陷阱\n[01:36.06]会将路人捕获\n[01:37.88]仙人掌下面\n[01:39.37]长出一簇贝壳\n[01:40.94]而风会变成毒蛇\n[01:42.73]给云彩触摸\n[01:44.60]初冬的季节\n[01:46.03]会有商队经过\n[01:47.57]马蹄底下却踩着\n[01:49.40]被遗忘的王国\n[01:51.19]也许你听说\n[01:52.55]这里太阳不落\n[01:54.19]温柔也伴着恶魔\n[01:55.90]会将我们吞没\n[01:57.85]Ah\n[02:00.41]Ah\n[02:02.87]\n[02:03.64]Ah\n[02:06.35]\n[02:07.85]Ah\n[02:10.42]\n[02:11.15]梦境里大浪淘沙\n[02:12.67]洗尽了谁的铅华\n[02:14.40]海市蜃楼千年之期都化作涂鸦\n[02:17.63]梦境里大浪淘沙\n[02:19.34]沉寂了多少梦啊\n[02:20.97]记忆都坍塌\n[02:24.46]梦境里大浪淘沙\n[02:25.99]洗尽了谁的铅华\n[02:27.46]海市蜃楼千年之期都化作涂鸦\n[02:30.85]梦境里大浪淘沙\n[02:32.55]沉寂了多少梦啊\n[02:34.22]记忆都坍塌\n[02:36.67]\n[02:37.54]梦境里大浪淘沙\n[02:39.23]洗尽了谁的铅华\n[02:40.89]海市蜃楼千年之期都化作涂鸦\n[02:44.14]梦境里大浪淘沙\n[02:45.73]沉寂了多少梦啊\n[02:47.47]记忆都坍塌\n[02:49.94]被冲刷'
        }
      })
    }
  },
  created() {
    this.$nextTick(function() {
      this.createAplayer()
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

.container {
  padding: 15px;
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
  margin: 0;
  margin-bottom: 26px;
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
}

@media (max-width: 1199px) {
  .aplayer {
    margin-top: 26px;
  }
}

@media (max-width: 768px) {
  .page-footer h2::after {
    display: none !important;
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
    left: 20%;
    transform: translate3d(-20%, -50%, 0);
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
  }
}
</style>