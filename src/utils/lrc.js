/*
 * @Author: @u3u 
 * @Date: 2016-12-20 22:04:31 
 * @Last Modified by: @u3u
 * @Last Modified time: 2016-12-21 18:52:37
 */

export default class LRC {

  static regex = /\[(\d+):(\d+).(\d+)]/g
  static metaRegex = [
    /\[ti:(.*)]/g,
    /\[ar:(.*)]/g,
    /\[al:(.*)]/g,
    /\[by:(.*)]/g,
    /\[t_time:(.*)]/g,
    /\[offset:(.*)]/g,
  ]

  // 同步歌曲名／歌手名／专辑名／编辑人标签
  static syncMeta(meta = { songName: '', singerName: '', albumName: '', byName: '' }) {
    const template = LRC.removeSpaces(
      `[ti:${meta.songName || ''}]
      [ar:${meta.singerName || ''}]
      [al:${meta.albumName || ''}]
      [by:${meta.byName || ''}]
      [t_time:(00:00)]
      [offset:0]`
    )
    return template
  }

  // 插入时间标签
  static insertTimeLabel() {
    // debugger
    const textarea = this.$refs.textarea.$el.childNodes[0] // 文本框对象
    const value = this.lrc // 文本框内的值
    if (!value) return

    const audio = this.aplayer.audio // Audio
    const startCurPoint = textarea.selectionStart // 光标位置
    const lyrics = value.split('\n') // 歌词数组
    const lineIndex = value.substr(0, startCurPoint).split('\n').length - 1 // 光标当前的行索引

    // 要插入时间标签的索引位置
    let index = 0
    lyrics.filter((x, i) => i < lineIndex).map((x, i) => (index += x.length + 1))

    // 写入时间标签
    const minute = Number.parseInt(audio.currentTime / 60).toString().padLeft(2, '0')
    const second = Number.parseInt(audio.currentTime % 60).toString().padLeft(2, '0')
    const milliscond = Number.parseInt(audio.currentTime % 60 * 1000 % 100).toString().padLeft(2, '0')
    const time = `[${minute}:${second}.${milliscond}] `
    const result = value.substr(0, index) + time + value.substr(index)
    this.lrc = result.endsWith('\n') ? result : result + '\n' // 保证末尾有一个回车

    // 光标位置优化
    this.$nextTick(function () {
      textarea.focus()
      textarea.selectionStart = textarea.selectionEnd = index + time.length + lyrics[lineIndex].length + 1
    })
  }

  // 解析信息标签
  static analyzeMeta(lrc) {
    const meta = {
      songName: null,
      singerName: null,
      albumName: null,
      byName: null,
    }
    const orderKeys = ['songName', 'singerName', 'albumName', 'byName']
    if (!lrc) return meta

    LRC.metaRegex.forEach((reg, index) => {
      const res = new RegExp(reg).exec(lrc) // 警告：/g 模式匹配一次后会失效
      if (res && orderKeys[index]) {
        meta[orderKeys[index]] = res[1]
      }
    })
    return meta
  }

  // 删除所有信息标签
  static deleteMetaLabel(lrc) {
    if (!lrc) return ''
    LRC.metaRegex.forEach(reg => (lrc = lrc.replace(reg, '')))
    return lrc.trim()
  }

  // 删除所有时间标签
  static deleteTimeLabel(lrc) {
    if (!lrc) return ''
    return lrc.replace(LRC.regex, '')
  }

  // 替换当前行时间标签
  static replaceTimeLabel(textarea, audio) {

  }

  // 移除当前行时间标签
  static removeTimeLabel() {

  }

  // 去除每一行的首尾空格
  static removeSpaces(lrc) {
    if (!lrc) return ''
    return lrc.split('\n').map(x => x.trim()).join('\n')
  }

  // 保存到本地存储
  // 下载LRC文件

}
