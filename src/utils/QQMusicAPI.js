/*
 * @Author: @u3u 
 * @Date: 2016-12-22 00:41:11 
 * @Last Modified by: @u3u
 * @Last Modified time: 2016-12-23 14:47:13
 */
import request from './request'

export default class QQMusicAPI {

  // 缓存对象
  static $cache = window.lscache

  // 获取我喜欢的歌曲列表(缓存1小时)
  static async getMyLikeSongs(limit = 30, cache = 60, disstid = 2275334621, type = 1) {
    const cacheKey = 'QQMusicAPI.getMyLikeSongs'
    if (cache <= 0) QQMusicAPI.$cache.remove(cacheKey) // 如果需要立即清除缓存
    let json = QQMusicAPI.$cache.get(cacheKey)
    if (json) return json // 如果缓存中有数据则返回缓存

    // 发送请求
    json = await request({
      url: 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg',
      data: { disstid, song_num: limit, type }
    })
    const songlist = json.cdlist[0].songlist
    QQMusicAPI.$cache.set(cacheKey, songlist, cache) // 写入缓存

    return songlist
  }

  // 获取热搜歌曲列表
  static async getHotKeyList() {
    return await request({ url: 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg' })
  }

  // 搜索歌曲(缓存10分钟)
  static async search(w = '', p = 1, n = 10, cache = 10) {
    const cacheKey = 'QQMusicAPI.search.' + w
    if (cache <= 0) QQMusicAPI.$cache.remove(cacheKey) // 如果需要立即清除缓存
    let json = QQMusicAPI.$cache.get(cacheKey)
    if (json) return json // 如果缓存中有数据则返回缓存

    w = QQMusicAPI.htmldecode(w) // 处理日韩歌曲名
    json = await request({ url: 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp', data: { w, p, n } })
    QQMusicAPI.$cache.set(cacheKey, json, cache) // 写入缓存
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

  // 获取歌词(永久缓存)
  static async getLyric(mid) {
    const cacheKey = 'QQMusicAPI.getLyric.' + mid
    let json = QQMusicAPI.$cache.get(cacheKey)
    if (json) return json.lrc // 如果缓存中有数据则返回缓存

    json = await request({ url: 'http://wemcc.com/fmusic/api.php', data: { type: 'qq', id: mid }, jsonpCallback: 'callback' })
    QQMusicAPI.$cache.set(cacheKey, json) // 写入缓存
    return json.lrc
  }

  // 解码 unicode
  static htmldecode(s) {
    if (!s) return ''
    return s.replace(/&#(\d+);/g, (str, match) => String.fromCharCode(match))
  }

}
