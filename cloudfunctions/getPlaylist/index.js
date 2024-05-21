const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const rp = require('request-promise')

const URL = 'https://www.sovendea.icu/top/playlist'
const playlistCollection = db.collection('playlist')
const offsetCollection = db.collection('offset')
const updateId = '8848'


function deDuplication(originList, playList) {
  const existingIds = new Set(originList.map(item => item.id))
  return playList.filter(item => !existingIds.has(item.id))
}

exports.main = async (event, context) => {

  // 从数据库获取全部数据
  const list = await playlistCollection.get()
  // console.log(list)
  var offset = 0
  temp = await offsetCollection.get()

  if (temp.data.length != 0) {
    console.log(offset)
    if (offset == 1200) {
      offset = 0
    }
    offset =  temp.data[0].offset + 50
   
}

  console.log(offset)

  // 调用第三方接口获取新的歌单列表

  let playlist = await rp(URL+"?offset="+offset).then(res => JSON.parse(res).playlists)

  var newData = {
    "offset":offset,
  }

  try {
    const result = await offsetCollection.doc(updateId).set({
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
