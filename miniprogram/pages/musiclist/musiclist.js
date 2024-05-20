

Page({
  /**
   * 页面的初始数据
   */
  data: {
    musiclist: [],  // 歌单对应的歌曲集合
    coverImgInfo: {}  // 歌单封面
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    wx.showLoading({
      title: '歌曲加载中...',
    })
    wx.cloud.callFunction({
      name: 'music',
      data:{
        playlistId: options.playlistId,
        $url: 'musiclist'
      }
    }).then((res)=>{
      const pl = res.result.playlist
      console.log(res.result.playlist.tracks)
      this.setData({
        musiclist: pl.tracks,
        coverImgInfo:{
          coverImgUrl: pl.coverImgUrl,
          coverImgName: pl.name
        }
      })
      wx.hideLoading()
    })
  },
})