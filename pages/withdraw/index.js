const app = getApp()
const WXAPI = require('apifm-wxapi')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    balance: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    WXAPI.userAmount(wx.getStorageSync('token')).then(res => {
      if (res.code == 0) {
        this.setData({
          balance: res.data.balance.toFixed(2),
          freeze: res.data.freeze.toFixed(2),
          score: res.data.score
        });
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  bindCancel: function() {
    wx.navigateBack({})
  },
  doneAll(){
    this.setData({
      amount: this.data.balance
    })
  },
  bindinput(e){
    this.setData({
      amount: e.detail.value
    })
  },
  bindSave: function() {
    const that = this;
    let minWidthAmount = wx.getStorageSync('WITHDRAW_MIN');
    if (!minWidthAmount) {
      minWidthAmount = 0
    }
    var amount = this.data.amount;

    if (!amount) {
      wx.showModal({
        title: '错误',
        content: '请填写正确的提现金额',
        showCancel: false
      })
      return
    }
    if (amount * 1 < minWidthAmount) {
      wx.showModal({
        title: '错误',
        content: '提现金额不能低于' + minWidthAmount + '元',
        showCancel: false
      })
      return
    }
    WXAPI.withDrawApply(wx.getStorageSync('token'), amount).then(function(res) {
      if (res.code == 0) {
        wx.showModal({
          title: '成功',
          content: '您的提现申请已提交，等待财务打款',
          showCancel: false,
          success: function(res) {
            wx.navigateTo({
              url: '/pages/withdraw/logs',
            })
          }
        })
      } else {
        wx.showModal({
          title: '错误',
          content: res.msg,
          showCancel: false
        })
      }
    })
  }
})