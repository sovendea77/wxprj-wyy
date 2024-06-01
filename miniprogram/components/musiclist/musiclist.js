const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist: {
      type: Array
    },
    playingColor:{
      type: String,
      value: "#15966b"
    },
    indexColor: {
      type: String,
      value: "#888"
    },
    musicColor:{
      type: String,
      value: "#333"
    },
    singerColor:{
      type: String,
      value: "#666"
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
      // 将当前歌单所有歌曲信息储存在全局的musicList中
      app.setMusicList(this.properties.musiclist)
      
      const eventData = event.currentTarget.dataset
      this.setData({
        playerId: eventData.musicid
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicId=${eventData.musicid}&index=${eventData.index}`,
      })
    }
  }
})