const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const rp = require('request-promise')
const playlistCollection = db.collection('playlist')
const topplaylistCollection = db.collection('topplaylist')
const offsetCollection = db.collection('offset')
const updateId = '8848'
const URL = 'https://www.sovendea.icu'


function deDuplication(originList, playList) {
  const existingIds = new Set(originList.map(item => item.id))
  return playList.filter(item => !existingIds.has(item.id))
}

async function insertNewPlaylists(collection, newPlaylist) {
  const insertPromises = newPlaylist.map(item => {
    return collection.add({
      data: {
        ...item,
        createTime: db.serverDate()
      }
    })
  });
  try {
    await Promise.all(insertPromises)
    return newPlaylist.length
  } catch (err) {
    console.error('插入失败', err)
    return 0
  }
}


exports.main = async (event, context) => {
  
  if (event.type=="rec") {
    const list = await topplaylistCollection.get()
    let playlist = await rp(URL+"/personalized").then(res => JSON.parse(res).result)
    console.log(playlist)
    let newPlaylist = deDuplication(list.data, playlist)
    console.log(newPlaylist)
    insertNewPlaylists(topplaylistCollection,newPlaylist)
    return newPlaylist.length
  }


  const list = await playlistCollection.get()
  var offset = 0
  var updatenum = 0
  temp = await offsetCollection.get()

  if (temp.data.length != 0) {
    offset =  temp.data[0].offset
    updatenum = temp.data[0].updatenum
    offset = offset + updatenum
    if (offset >= 1200) {
      offset = 0
    }
}

  // 调用第三方接口获取新的歌单列表
  let playlist = await rp(URL+"/top/playlist"+"?offset="+offset).then(res => JSON.parse(res).playlists)

  // 对新的歌单列表进行去重
  let newPlaylist = deDuplication(list.data, playlist)

  updatenum = newPlaylist.length

  var newData = {
    "offset":offset,
    "updatenum":updatenum
  }

  try {
    await offsetCollection.doc(updateId).set({
      data: newData
    })
  } catch (err) {
    console.error('更新失败', err)
  }

  insertNewPlaylists(playlistCollection,newPlaylist)
  return updatenum
}
