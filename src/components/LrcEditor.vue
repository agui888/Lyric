<template>
  <div class="lrc-editor">
    <div class="lrc-editor_toolbar">
      <el-tooltip content="添加时间标签(F9)" placement="top">
        <el-button size="small" icon="plus" @click="add"></el-button>
      </el-tooltip>
      <el-tooltip content="替换当前时间标签(F10)" placement="top">
        <el-button size="small" icon="-replace3" @click="replace"></el-button>
      </el-tooltip>
      <el-tooltip content="移除当前时间标签(F11)" placement="top">
        <el-button size="small" icon="minus" @click="remove"></el-button>
      </el-tooltip>
      <el-tooltip content="删除所有时间标签(F12)" placement="top">
        <el-button size="small" icon="delete2" @click="del"></el-button>
      </el-tooltip>
      <el-tooltip content="撤销(CTRL+Z)" placement="top">
        <el-button size="small" icon="-undo-copy" @click="undo"></el-button>
      </el-tooltip>
      <el-tooltip content="恢复(CTRL+Y)" placement="top">
        <el-button size="small" icon="-undo-copy el-icon-reversal" @click="redo"></el-button>
      </el-tooltip>
      <el-tooltip content="预览歌词(CTRL+ALT+V)" placement="top">
        <el-button size="small" icon="-preview" @click="preview"></el-button>
      </el-tooltip>
    </div>
    <el-input ref="textarea" type="textarea" :autosize="{ minRows: 15, maxRows: 15 }" placeholder="请输入歌词文本" @input="syncMeta" @keyup.120.native="add" @keyup.121.native="replace" @keyup.122.native="remove" @keyup.123.native="del" @keyup.ctrl.90.native="undo" @keyup.ctrl.89.native="redo" @keyup.ctrl.alt.86.native="preview" v-model="lrc"></el-input>
    <div class="lrc-editor_status-bar">
      <span v-if="songName">正在编辑歌曲 《{{ songName }}》 的歌词 &nbsp;&nbsp; 编辑人: {{ byName || '活雷锋' }}</span>
      <span v-else>LRC Editor Version 1.0</span>
      <span class="lrc-editor_timebar" v-show="savetime"><i class="el-icon-time"></i> {{ savetime }}</span>
    </div>
  </div>
</template>
<script lang="babel">
import LRC from '../utils/lrc.js'

export default {
  name: 'lrc-editor',
  props: {
    songName: String, // 歌曲名称
    byName: String, // 编辑者
    lyric: String, // LRC头部信息
    autocompleteLyric: String, // 自动完成同步的纯文本歌词，同步到 LRC Editor 组件，方便编辑
    loadedMedia: Boolean, // 是否载入音频文件 未载入提示载入后预览歌词
    aplayer: Object, // 播放器实例
  },
  data() {
    return {
      lrc: this.lyric, // 歌词内容
      savetime: null, // 保存时间
    }
  },
  methods: {
    // 添加时间标签
    add() {
      LRC.insertTimeTag.call(this)
    },
    // 移除当前时间标签
    remove() {
      LRC.removeTimeTag(this)
    },
    // 替换时间标签
    replace() {
      LRC.replaceTimeTag(this)
    },
    // 删除所有时间标签
    del() {
      this.lrc = LRC.deleteTimeTag(this.lrc)
    },
    // 撤销
    undo() {
      this.$refs.textarea.$el.childNodes[0].focus()
      document.execCommand('undo')
    },
    // 重做
    redo() {
      this.$refs.textarea.$el.childNodes[0].focus()
      document.execCommand('redo')
    },
    // 预览歌词
    preview() {
      const isDesktop = window.device.desktop()
      if (!this.loadedMedia) {
        this.$message({
          type: 'warning',
          message: isDesktop ? '音乐文件未载入，可通过歌曲名称搜索QQ音乐曲库，使用网络地址，或本地上传的方式载入。' : '请先载入音乐文件',
          duration: isDesktop ? 5e3 : 3e3,
          showClose: isDesktop,
        })
        return
      }

      if (!LRC.isValid(this.lrc)) { // reg.tset is not defined? 喵喵喵?
        this.$message({
          type: 'error',
          message: '歌词格式错误',
        })
        return
      }
      this.$emit('previewCallback', this.lrc)
    },
    // 同步LRC头部信息
    syncMeta(save) {
      if (typeof save !== 'boolean' || save === true) this.saveWork() // 防止递归

      // 如果输入的是空格则不处理空格
      let isInputSpace = false
      let inputValue = null
      const target = (window.event || { target: null }).target

      if (target && target.tagName.toLowerCase() === 'textarea') {
        const value = (target.value || '').substr(0, target.selectionStart) // 获取最后一次输入的字符
        inputValue = value[value.length - 1]
        isInputSpace = inputValue === ' '
      }
      
      this.$nextTick(function() {
        if (this.lrc && !isInputSpace) this.lrc = LRC.removeSpaces(this.lrc)
        this.$emit('bindMeta', Object.assign({}, LRC.analyzeMeta(this.lrc), { lrc: this.lrc }))
      })
    },
    // 保存工作 避免数据丢失
    saveWork() {
      const old = window.lscache.get('lrc-editor.textarea')
      if (this.lrc === old) return // 如果和旧值相同则不保存
      window.lscache.set('lrc-editor.textarea', this.lrc)
      const now = new Date() // 记录保存时间
      window.lscache.set('lrc-editor.textarea.savetime', now)
      this.savetime = '保存于 ' + window.Moment(now).fromNow()
      setTimeout(() => (this.savetime = null), 3e3)
    },
    // 恢复工作
    recoveryWork() {
      this.lrc = window.lscache.get('lrc-editor.textarea')
      this.syncMeta(false)
      const time = window.lscache.get('lrc-editor.textarea.savetime')
      if (time) this.savetime = '恢复于 ' + window.Moment(time).fromNow() + ' 的工作'
    },
  },
  watch: {
    // 同步LRC头部信息
    lyric() {
      this.lrc = this.lyric ? this.lyric + LRC.deleteMeta(this.lrc) : null
    },
    // 同步自动完成歌词
    autocompleteLyric() {
      const oldText = LRC.deleteMeta(this.lrc) // 如果与原文本相同或编辑器文本是LRC格式则忽略
      if (!this.autocompleteLyric || this.autocompleteLyric === oldText || LRC.isValid(this.lrc)) return
      if (this.lyric) {
        let lrc = this.lyric + this.autocompleteLyric // LRC头部信息 + 纯文本歌词（初始化编辑状态）
        if (oldText) { // 如果编辑框内还含有用户手动天填写的歌词，则追加到末尾并提示
          lrc += '\n\n以下是您的原文本：\n' + oldText
        }
        lrc && (this.lrc = lrc)
      }
    },
  },
  created() {
    this.recoveryWork() // 如果有数据可恢复则恢复数据
  },
  mounted() {
    setInterval(() => this.saveWork(), 1e3 * 15) // 保存工作 避免数据丢失 15秒保存一次
    setInterval(() => { // 更新恢复时间
      const time = window.lscache.get('lrc-editor.textarea.savetime')
      if (time) this.savetime = '恢复于 ' + window.Moment(time).fromNow() + ' 的工作'
    }, 1e3 * 30)
  }
}
</script>
<style lang="scss">
.lrc-editor {
  position: relative;
  border: 1px solid #c0ccda;
  border-radius: 4px;
  background: rgba(255, 255, 255, .85);
  transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
  margin-bottom: 20px;
  .el-icon-reversal {
    transform: rotate(90deg);
  }
  /*&:hover {
    border-color: #8492a6;
  }*/
  textarea {
    margin-bottom: 0;
    padding-top: 40px;
    padding-bottom: 40px;
    border: 0;
    border-radius: 0;
    background: transparent;
  }
  .lrc-editor_toolbar {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 9;
    width: 100%;
    background: rgba(255, 255, 255, .85);
    border-radius: 4px 4px 0 0;
    border-bottom: 1px solid #c0ccda;
    box-sizing: border-box;
    padding: 0 8px;
    -webkit-user-select: none;
    button {
      border: 0;
      border-radius: 0;
      padding: 10px;
      background: transparent;
      &:focus,
      &:hover,
      &:active {
        color: inherit;
      }
      &:hover,
      &:active {
        background: rgba(241, 241, 241, .8);
      }
    }
  }
  .lrc-editor_status-bar {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 10px;
    border-top: 1px solid #c0ccda;
    border-radius: 0 0 4px 4px;
    color: #666;
    font-size: 14px;
    height: 30px;
    line-height: 30px;
    box-sizing: border-box;
    background: rgba(255, 255, 255, .8);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    .lrc-editor_timebar {
      color: #c6c6c6;
      position: absolute;
      top: 50%;
      right: 15px;
      transform: translate3d(0, -50%, 0);
    }
  }
}

@media (max-width: 414px) {
  .lrc-editor_timebar {
    display: none;
  }
}
</style>