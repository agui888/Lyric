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
      <el-tooltip content="撤销(ctrl+Z)" placement="top">
        <el-button size="small" icon="-undo-copy" @click="undo"></el-button>
      </el-tooltip>
      <el-tooltip content="恢复(ctrl+Y)" placement="top">
        <el-button size="small" icon="-undo-copy el-icon-reversal" @click="redo"></el-button>
      </el-tooltip>
      <!--<el-tooltip content="保存歌词" placement="top">
        <el-button size="small" icon="time"></el-button>
      </el-tooltip>-->
      <el-tooltip content="预览歌词(ctrl+shift+V)" placement="top">
        <el-button size="small" icon="-preview" @click="preview"></el-button>
      </el-tooltip>
    </div>
    <el-input ref="textarea" type="textarea" :autosize="{ minRows: 15, maxRows: 15 }" placeholder="请输入歌词文本" @input="syncMeta" @keyup.120.native="add" @keyup.121.native="replace" @keyup.122.native="remove" @keyup.123.native="del" @keyup.ctrl.90.native="undo" @keyup.ctrl.89.native="redo" v-model="lrc"></el-input>
    <div class="lrc-editor_status-bar">
      <span v-show="songName">正在编辑歌曲 《{{ songName }}》 的歌词 &nbsp;&nbsp; 编辑人: {{ byName || '活雷锋' }}</span>
      <span class="lrc-editor_timebar" v-show="savetime"><i class="el-icon-time"></i> {{ savetime }}</span>
    </div>
  </div>
</template>
<script lang="babel">
import LRC from '../utils/lrc.js'
export default {
  name: 'lrc-editor',
  props: {
    songName: String,
    byName: String,
    lyric: String,
    aplayer: Object,
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
      this.$message('preview lyric')
    },
    // 同步LRC头部信息
    syncMeta() {
      this.saveWork()
      this.$nextTick(function() {
        this.lrc = LRC.removeSpaces(this.lrc)
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
      this.syncMeta()
      const time = window.lscache.get('lrc-editor.textarea.savetime')
      if (time) this.savetime = '恢复于 ' + window.Moment(time).fromNow() + ' 的工作'
    },
  },
  watch: {
    // 同步LRC头部信息
    lyric() {
      this.lrc = this.lyric + LRC.deleteMeta(this.lrc)
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
      color: #ddd;
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