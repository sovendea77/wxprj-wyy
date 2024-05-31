const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    searchlist: {
      type: Array
    }
  },

  pageLifetimes: {
    // 页面被展示
    show: function () {
      this.setData({
        playerId: parseInt(app.getMusicId())
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    playerId: -1
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleSelect(event) {
      app.setMusicList(this.properties.searchlist)

      const eventData = event.currentTarget.dataset
      console.log(eventData)
      this.setData({
        playerId: eventData.musicid
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicId=${eventData.musicid}&index=${eventData.index}`,
      })
    }
  }
})