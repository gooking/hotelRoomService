const WXAPI = require('apifm-wxapi')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    logs: undefined
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  onShow: function () {
    // https://www.yuque.com/apifm/nu0f75/zbrb96
    WXAPI.yuyueMyJoinLogs({
      token: wx.getStorageSync('token'),
    }).then(res => {
      if (res.code == 0) {
        res.data.result.forEach(ele => {
          if (ele.status <= 1) {
            ele.statusStr = '正在预约'
          }
          if (ele.status == 2) {
            ele.statusStr = '已完成'
          }
          if (ele.status == 3) {
            ele.statusStr = '已关闭'
          }
        })
        this.setData({
          logs: res.data.result
        })
      }
    })
  },

})