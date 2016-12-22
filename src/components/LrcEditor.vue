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
      <el-tooltip content="撤销(ctrl+z)" placement="top">
        <el-button size="small" icon="-undo-copy"></el-button>
      </el-tooltip>
      <el-tooltip content="恢复(ctrl+shift+z)" placement="top">
        <el-button size="small" icon="-undo-copy el-icon-reversal"></el-button>
      </el-tooltip>
      <!--<el-tooltip content="保存歌词" placement="top">
        <el-button size="small" icon="time"></el-button>
      </el-tooltip>-->
      <el-tooltip content="预览歌词(ctrl+shift+v)" placement="top">
        <el-button size="small" icon="-preview" @click="preview"></el-button>
      </el-tooltip>
    </div>
    <el-input ref="textarea" type="textarea" :autosize="{ minRows: 15, maxRows: 15 }" placeholder="请输入歌词文本" @input="syncMeta" v-model="lrc"></el-input>
  </div>
</template>
<script lang="babel">
import LRC from '../utils/lrc.js'
export default {
  name: 'lrc-editor',
  props: {
    lyric: String,
    aplayer: Object,
  },
  data() {
    return {
      lrc: this.lyric
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
    // 预览歌词
    preview() {
      this.$message('preview lyric')
    },
    // 同步LRC头部信息
    syncMeta() {
      this.$nextTick(function() {
        this.lrc = LRC.removeSpaces(this.lrc)
        this.$emit('bindMeta', LRC.analyzeMeta(this.lrc))
      })
    }
  },
  watch: {
    // 同步LRC头部信息
    lyric() {
      this.lrc = this.lyric + LRC.deleteMeta(this.lrc)
    }
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
  [class*=" el-icon--"],
  [class^=el-icon--] {
    font-family: iconfont !important;
  }
  .el-icon-reversal {
    transform: rotate(90deg);
  }
  /*&:hover {
    border-color: #8492a6;
  }*/
  textarea {
    padding-top: 40px;
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
}
</style>