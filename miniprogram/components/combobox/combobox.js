Component({
  properties: {
    selectArray: {
      type: Array,
    }
  },
  data: {
    selectShow: false,
    selectText: "按歌曲",
  },

  methods: {
    selectToggle: function () {
      var nowShow = this.data.selectShow;
      this.setData({
        selectShow: !nowShow
      })
    },

    setText: function (e) {
      var nowData = this.properties.selectArray;
      var nowIdx = e.target.dataset.index;
      var nowText = nowData[nowIdx].text;
      this.setData({
        selectShow: false,
        selectText: nowText,
      })
      this.triggerEvent('select', nowData[nowIdx])
    }
  }
})