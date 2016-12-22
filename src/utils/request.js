/*
 * @Author: @u3u 
 * @Date: 2016-12-09 17:26:30 
 * @Last Modified by: @u3u
 * @Last Modified time: 2016-12-22 01:11:15
 * @Descript: Http Request
 */

export default async function ({
  url = null,
  method = 'get',
  data = {},
  contentType = 'application/x-www-form-urlencoded',
  cookie = false,
  jsonp = true,
  jsonpCallback = 'jsonpCallback'
} = {}) {
  let post = method.toLowerCase() === 'post'

  if (jsonp) post = false

  // fetch options
  let opts = {
    method,
    headers: {},
    mode: 'no-cors'
  }

  if (cookie) opts.credentials = 'include'
  contentType && (opts.headers['Content-Type'] = contentType)

  if (!post) {
    // get method
    let keys = Object.keys(data)
    let symbol = url.includes('?') ? '&' : '?'
    let query = keys.map(x => x + '=' + data[x]).join('&')
    query && (url += symbol + query)
  } else opts.body = data

  // send request
  if (jsonp) {
    return await window.fetchJsonp(url, { jsonpCallback }).then(res => res.json())
  } else return await window.fetch(url, opts).then(res => res.json())
}
