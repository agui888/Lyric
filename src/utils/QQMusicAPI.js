/*
 * @Author: @u3u 
 * @Date: 2016-12-22 00:41:11 
 * @Last Modified by: @u3u
 * @Last Modified time: 2016-12-22 23:25:41
 */
import request from './request'

export default class QQMusicAPI {

  // 获取我喜欢的歌曲列表
  static async getMyLikeSongs(limit = 30, disstid = 2275334621, type = 1) {
    const json = await request({
      url: 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg',
      data: { disstid, song_num: limit, type }
    })
    return json.cdlist[0].songlist
  }

  // 获取热搜歌曲列表
  static async getHotKeyList() {
    const json = await request({ url: 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg' })
    return json
  }

  // 搜索歌曲
  static async search(w = '', p = 1, n = 10) {
    w = QQMusicAPI.htmldecode(w)
    const json = await request({ url: 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp', data: { w, p, n } })
    return json
  }

  // 获取歌曲播放地址
  static getPlayUrl(musicid) {
    return `http://ws.stream.qqmusic.qq.com/${musicid}.m4a?fromtag=0`
  }

  // 获取歌曲图片
  static getSongPic(albummid, size = 150) {
    return `http://y.gtimg.cn/music/photo_new/T002R${size}x${size}M000${albummid}.jpg?max_age=2592000`
  }

  // 获取歌词
  static async getLyric(mid) {
    const json = await request({ url: 'http://wemcc.com/fmusic/api.php', data: { type: 'qq', id: mid }, jsonpCallback: 'callback' })
    return json.lrc
  }

  // 解码 unicode
  static htmldecode(s) {
    if (!s) return ''
    return s.replace(/&#(\d+);/g, (str, match) => String.fromCharCode(match))
  }

}
