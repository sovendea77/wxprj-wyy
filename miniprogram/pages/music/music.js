const MAX_LIMIT = 15 // 歌单每次请求的最大量
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    playlist: [],  // 歌单列表
    topplaylist: [], //推荐歌单列表
    keyword: '', //搜索内容
    selectArray: [{
        "id": "1",
        "text": "按歌曲"
      }, 
      {
        "id": "1",
        "text": "按歌手"
      },
      {
        "id": "1006",
        "text": "按歌词"
      }],
      selectType: 1,
    current: 0,
    autoplay: false,
    duration: 500,
    interval: 5000,
    swiperList: [],
  },

  onTap(e) {
    const { index } = e.detail;
    console.log(this.data.topplaylist[index])
    wx.navigateTo({
      url: `../../pages/musiclist/musiclist?playlistId=${this.data.topplaylist[index].id}`,
    })
  },


  select: function(e) {

    this.setData(
      {
        selectType:parseInt(e.detail.id)
      }
    )
  },
  /**
   * 生命周期函数--监听页面加载--首次加载获取第一页歌单列表
   */
  onLoad: function (options) {
    this._getplaylist('high');
    this._getplaylist('rec');
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作--下拉重新请求
   */
  onPullDownRefresh: function () {
    // app.getPlaylist('high')
    // app.getPlaylist('rec')
    this._getplaylist('high')
    this._getplaylist('rec')
  },

  /**
   * 页面上拉触底事件的处理函数--加载更多歌单
   */
  onReachBottom: function () {
    this._getplaylist('high')
  },

  // 向云服务请求获取歌单列表
  _getplaylist(param) {
    wx.showLoading({
      title: '歌单加载中...',
    })

    wx.cloud.callFunction({
      name: 'music',
      data: {
        start: this.data.playlist.length,
        count: MAX_LIMIT,
        $url: 'playlist',
        type: param
      }
    }).then((res) => {
      console.log(res.result.data)

      if (!res.result.data) {
        app.getPlaylist(param)
      }

      if (param == 'rec') {
        console.log(res.result)
        const newSwiperList = res.result.data.map(item => item.picUrl);
        this.setData({
          topplaylist: this.data.topplaylist.concat(res.result.data),
          swiperList: this.data.swiperList.concat(newSwiperList)
        })
      } else {
        this.setData({
          playlist: this.data.playlist.concat(res.result.data),
        })
      }

      wx.stopPullDownRefresh();
      wx.hideLoading();
    })
  },

  goSearch(options) {
    var input = options.detail.keyword
    if (input === '') {
      return
    }
    wx.navigateTo({
      url: `../../pages/search/search?keyword=${input}&type=${this.data.selectType}`,
    })
  }
})