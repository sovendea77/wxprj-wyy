const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const rp = require('request-promise')
const playlistCollection = db.collection('playlist')
const URL = 'https://www.sovendea.icu/top/playlist'

function deDuplication(originList, playList) {
  const existingIds = new Set(originList.map(item => item.id))
  return playList.filter(item => !existingIds.has(item.id))
}

exports.main = async (event, context) => {

  // 从数据库获取全部数据
  const list = await playlistCollection.get()

  // 调用第三方接口获取新的歌单列表
  let playlist = await rp(URL).then(res => JSON.parse(res).playlists)

  // 对新的歌单列表进行去重
  let newPlaylist = deDuplication(list.data, playlist)
  // 逐条插入新数据
  const insertPromises = newPlaylist.map(item => {
    return playlistCollection.add({
      data: {
        ...item,
        createTime: db.serverDate()
      }
    })
  })

  try {
    await Promise.all(insertPromises)
    console.log('插入成功')
    return newPlaylist.length
  } catch (err) {
    console.error('插入失败', err)
    return 0
  }
}