Page({
  /**
   * 页面的初始数据
   */
  data: {
    keyword: '',
    type: 1,
    songlist: [] // 歌曲
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "搜索结果："+options.keyword
    })

    console.log(options.keyword)
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: 'music',
      data:{
        keyword: options.keyword,
        type:options.type,
        $url: 'search'
      }
    }).then((res)=>{
      const song = res.result.result.songs
      console.log(song)
      this.setData({
        songlist: song
      })
      wx.hideLoading()
    })
  },
})