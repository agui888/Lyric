/*
 * @Author: @u3u 
 * @Date: 2016-12-21 18:19:48 
 * @Last Modified by: @u3u
 * @Last Modified time: 2016-12-21 18:21:52
 */

export default class Thread {
  static sleep = delay => new Promise(resolve => setTimeout(resolve, delay)) // sleep
}
