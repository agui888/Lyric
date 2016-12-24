/*
 * @Author: @u3u 
 * @Date: 2016-12-24 17:37:11 
 * @Last Modified by: @u3u
 * @Last Modified time: 2016-12-25 02:07:17
 */

export default class Clipboard {
  // 现代浏览器复制文本
  static copy(text) {
    const top = document.body.scrollTop // 修复复制后滚动条位置发生变化
    const input = document.createElement('textarea')
    input.style.opacity = 0
    input.style.position = 'absolute'
    input.style.top = '-1px'
    input.style.left = '-1px'
    input.style.zIndex = -1
    input.style.width = '1px'
    input.style.height = '1px'
    input.style.margin = 0
    input.style.padding = 0
    document.body.appendChild(input)

    input.value = text
    input.focus()
    input.selectionStart = 0
    input.selectionEnd = input.value.length

    const copyRes = document.execCommand('copy')
    document.body.scrollTop = top
    if (!copyRes) console.warn('[Clipboard.copy]: copy failed')
    input.remove()
    return copyRes
  }
}
