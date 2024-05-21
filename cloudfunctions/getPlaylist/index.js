const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const rp = require('request-promise')
const URL = 'https://www.sovendea.icu/top/playlist/highquality'
const playlistCollection = db.collection('playlist')
const lastPlayerlistUpdateTimeCollection = db.collection('updatetime')
const updateId = '8848'

function deDuplication(originList, playList) {
  const existingIds = new Set(originList.map(item => item.id))
  return playList.filter(item => !existingIds.has(item.id))
}

exports.main = async (event, context) => {
  // 从数据库获取全部数据
  const list = await playlistCollection.get()
  // console.log(list)
  var lastPlayerlistUpdateTime = 0
  temp = await lastPlayerlistUpdateTimeCollection.get()
  if (temp.data.length != 0) {
  lastPlayerlistUpdateTime =  temp.data[0].updatetime
}

  console.log(lastPlayerlistUpdateTime)

  // 调用第三方接口获取新的歌单列表
  let playlist = await rp(URL+"?before="+lastPlayerlistUpdateTime).then(res => JSON.parse(res).playlists)

  lastPlayerlistUpdateTime = playlist[playlist.length-1].updateTime
  var newData = {
    "updatetime":lastPlayerlistUpdateTime,
  }

  try {
    const result = await lastPlayerlistUpdateTimeCollection.doc(updateId).set({
      data: newData
    })
    console.log('更新成功', result)
  } catch (err) {
    console.error('更新失败', err)
  }

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