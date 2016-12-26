/*
 * @Author: @u3u 
 * @Date: 2016-12-22 00:41:11 
 * @Last Modified by: @u3u
 * @Last Modified time: 2016-12-26 16:24:56
 */
import request from './request'

export default class QQMusicAPI {

  // 缓存对象
  static $cache = window.lscache

  // 获取我喜欢的歌曲列表(缓存1小时)
  static async getMyLikeSongs(limit = 50, page = 0, cache = 60, disstid = 2275334621, type = 1) {
    const cacheKey = 'QQMusicAPI.getMyLikeSongs'
    if (cache <= 0) QQMusicAPI.$cache.remove(cacheKey) // 如果需要立即清除缓存
    let songlist = QQMusicAPI.$cache.get(cacheKey)
    if (songlist) return songlist // 如果缓存中有数据则返回缓存

    // 发送请求
    const json = await request({
      url: '//c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg',
      data: { disstid, song_begin: page, song_num: limit, outCharset: 'utf-8', type }
    })
    songlist = json.cdlist[0].songlist
    QQMusicAPI.$cache.set(cacheKey, songlist, cache) // 写入缓存
    return songlist
  }

  // 获取热搜歌曲列表
  static async getHotKeyList() {
    return await request({ url: '//c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg' })
  }

  // 搜索歌曲(缓存10分钟)
  static async search(w = '', p = 1, n = 10, cache = 10) {
    const cacheKey = 'QQMusicAPI.search.' + w
    if (cache <= 0) QQMusicAPI.$cache.remove(cacheKey) // 如果需要立即清除缓存
    let songlist = QQMusicAPI.$cache.get(cacheKey)
    if (songlist) return songlist // 如果缓存中有数据则返回缓存

    w = QQMusicAPI.htmldecode(w) // 处理日韩歌曲名
    const json = await request({ url: '//c.y.qq.com/soso/fcgi-bin/search_for_qq_cp', data: { w, p, n } })
    songlist = json.data.song.list
    QQMusicAPI.$cache.set(cacheKey, songlist, cache) // 写入缓存
    return songlist
  }

  // 获取歌曲播放地址
  // 2016-12-26 16:22:12 某些歌曲通过该方式无法播放
  // 通过最新的方式获取播放地址（同步QQ音乐）
  // musicid 传入 songmid
  // vkey 可通过接口 https://c.y.qq.com/base/fcgi-bin/fcg_musicexpress.fcg?json=3&guid=7578619704 获取，测试固定vkey也可以。
  static getPlayUrl(musicid, vkey = 'F0F1BD1246DE59DC81678E3EAD23B514ED951E345E3FBB042DE09DA1F892D3AD83F13C92AFD7A4C8B75B16B7396BBEC8F471C49A3DB8DFCE') {
    // return `//ws.stream.qqmusic.qq.com/${musicid}.m4a?fromtag=0`
    return `http://thirdparty.gtimg.com/C400${musicid}.m4a?vkey=${vkey}&fromtag=30&guid=7578619704`
  }

  // 获取歌曲图片
  static getSongPic(albummid, size = 150) {
    return `//y.gtimg.cn/music/photo_new/T002R${size}x${size}M000${albummid}.jpg?max_age=2592000`
  }

  // 获取LRC歌词(永久缓存)
  static async getLyric(mid) {
    const cacheKey = 'QQMusicAPI.getLyric.' + mid
    let lrc = QQMusicAPI.$cache.get(cacheKey)
    if (lrc) return lrc // 如果缓存中有数据则返回缓存

    const json = await request({ url: '//wemcc.com/fmusic/api.php', data: { type: 'qq', id: mid }, jsonpCallback: 'callback' })
    lrc = json.lrc
    QQMusicAPI.$cache.set(cacheKey, lrc) // 写入缓存
    return lrc
  }

  // 获取纯文本歌词(缓存10分钟)
  static async getTextLyric(w, songid = null, cache = 10) {
    if (!songid) return
    const cacheKey = 'QQMusicAPI.getTextLyric.' + (songid || w)
    let lyric = QQMusicAPI.$cache.get(cacheKey)
    if (lyric) return lyric

    const json = await request({ url: '//c.y.qq.com/soso/fcgi-bin/search_cp', data: { w, t: 7 } }) // p&n
    const list = json.data.lyric.list
    if (list.length <= 0) return

    lyric = (list.find(x => x.songid === songid) || list[0]).content

    if (lyric) {
      lyric = QQMusicAPI.htmldecode(lyric.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/<br\/*>/g, '\n')
        .replace(/<strong class="keyword">(.+?)<\/strong>/g, (match, keyword) => keyword))
    }
    QQMusicAPI.$cache.set(cacheKey, lyric, cache) // 写入缓存
    return lyric
  }

  // 解码 unicode
  static htmldecode(s) {
    if (!s) return ''
    return s.replace(/&#(\d+);/g, (str, match) => String.fromCharCode(match))
  }

}
