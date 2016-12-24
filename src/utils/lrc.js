/*
 * @Author: @u3u 
 * @Date: 2016-12-20 22:04:31 
 * @Last Modified by: @u3u
 * @Last Modified time: 2016-12-24 14:40:14
 */

import QQMusicAPI from './QQMusicAPI'

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
    // 空信息不要返回
    if (Object.values(meta).map(x => !x).filter(x => x === false).length <= 0) return ''
    const audio = (this.aplayer || { audio: { duration: 0 } }).audio // if null 
    const minute = (Number.parseInt(audio.duration / 60) || 0).toString().padLeft(2, '0')
    const second = (Number.parseInt(audio.duration % 60) || 0).toString().padLeft(2, '0')
    return LRC.removeSpaces(
      `[ti:${QQMusicAPI.htmldecode(meta.songName || '')}]
      [ar:${QQMusicAPI.htmldecode(meta.singerName || '')}]
      [al:${meta.albumName || ''}]
      [by:${meta.byName || ''}]
      [t_time:(${minute}:${second})]
      [offset:0]`
    ) + '\n\n'
  }

  // 插入时间标签
  static insertTimeTag(mode = 'insert') {
    const textarea = this.$refs.textarea.$el.childNodes[0] // 文本框对象
    let value = this.lrc // 文本框内的值
    if (!value) return

    const audio = this.aplayer.audio // 音频对象
    const startCurPoint = textarea.selectionStart // 光标位置
    const lyrics = value.split('\n') // 歌词数组
    const lineIndex = value.substr(0, startCurPoint).split('\n').length - 1 // 光标当前的行索引

    // 要插入时间标签的索引位置
    let index = 0
    lyrics.filter((x, i) => i < lineIndex).map((x, i) => (index += x.length + 1))

    // debugger

    let time = { length: 0 }
    mode !== 'insert' && // 除了插入操作 移除和替换都需要移除当前行的时间标签（替换=移除+插入）
      (lyrics[lineIndex] = LRC.deleteTimeTag(lyrics[lineIndex]))

    if (mode === 'remove') {
      // 移除时间标签
      this.lrc = lyrics.join('\n')
    } else {
      // 写入／替换时间标签
      const minute = Number.parseInt(audio.currentTime / 60).toString().padLeft(2, '0')
      const second = Number.parseInt(audio.currentTime % 60).toString().padLeft(2, '0')
      const milliscond = Number.parseInt(audio.currentTime % 60 % (Number.parseInt(second) || 1) * 100).toString().padLeft(2, '0')

      // if (milliscond === 'NaN') { // 0 不能为除数
      //   console.info('duration: ', audio.duration)
      //   console.info('currentTime: ', audio.currentTime)
      //   console.info('minute: ', minute)
      //   console.info('second: ', second)
      // }

      time = `[${minute}:${second}.${milliscond}]`
      mode === 'replace' && (value = lyrics.join('\n')) // 替换模式需要更新值
      const result = value.substr(0, index) + time + value.substr(index)
      this.lrc = result.endsWith('\n') ? result : result + '\n' // 保证末尾有一个回车
    }

    // 光标位置优化
    this.$nextTick(function () {
      textarea.selectionStart = textarea.selectionEnd = index + time.length + lyrics[lineIndex].length + 1
      textarea.focus()
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
  static deleteMeta(lrc) {
    if (!lrc) return ''
    LRC.metaRegex.forEach(reg => (lrc = lrc.replace(reg, '')))
    return lrc.trim()
  }

  // 删除所有时间标签
  static deleteTimeTag(lrc) {
    if (!lrc) return ''
    return lrc.replace(LRC.regex, '')
  }

  // 替换当前行时间标签
  static replaceTimeTag(vm) {
    LRC.insertTimeTag.call(vm, 'replace')
  }

  // 移除当前行时间标签
  static removeTimeTag(vm) {
    LRC.insertTimeTag.call(vm, 'remove')
  }

  // 去除每一行的首尾空格
  static removeSpaces(lrc) {
    if (!lrc) return ''
    return lrc.split('\n').map(x => x.trim()).join('\n')
  }

  // 保存到本地存储
  // 下载LRC文件

}
