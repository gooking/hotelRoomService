const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    AUTH.checkHasLogined().then(isLogined => {
      if (!isLogined) {
        wx.showModal({
          title: '提示',
          content: '本次操作需要您的登录授权',
          cancelText: '暂不登录',
          confirmText: '前往登录',
          success(res) {
            if (res.confirm) {
              wx.switchTab({
                url: "/pages/my/index"
              })
            } else {
              wx.navigateBack()
            }
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '点击进入小程序申请开票',
      imageUrl: 'https://cdn.it120.cc/apifactory/2019/06/13/13f5f43c-4819-414d-88f5-968e32facd79.png',
      path: '/pages/invoice/apply?inviter_id=' + wx.getStorageSync('uid')
    }
  },
  async bindSave(e) {
    // 提交保存
    WXAPI.addTempleMsgFormid(wx.getStorageSync('token'), 'form', e.detail.formId)
    const _this = this;
    let comName = e.detail.value.comName;
    let tfn = e.detail.value.tfn;
    let consumption = e.detail.value.consumption;
    let amount = e.detail.value.amount;
    let mail = e.detail.value.mail;
    let address = e.detail.value.address;
    let bank = e.detail.value.bank;
    if (!comName) {
      wx.showToast({
        title: '发票抬头不能为空',
        icon: 'none'
      })
      return
    }
    if (!tfn) {
      wx.showToast({
        title: '税号不能为空',
        icon: 'none'
      })
      return
    }
    if (!consumption) {
      wx.showToast({
        title: '发票内容不能为空',
        icon: 'none'
      })
      return
    }
    if (!mail) {
      wx.showToast({
        title: '请填写邮箱',
        icon: 'none'
      })
      return
    }
    if (!amount) {
      wx.showToast({
        title: '填写开票金额',
        icon: 'none'
      })
      return
    }
    const extJsonStr = {}
    extJsonStr['邮箱地址'] = mail
    extJsonStr['地址与电话'] = address
    extJsonStr['开户行与账号'] = bank
    // https://www.yuque.com/apifm/nu0f75/nilvz0
    WXAPI.invoiceApply({
      token: wx.getStorageSync('token'),
      comName,
      tfn,
      amount,
      consumption,
      extJsonStr: JSON.stringify(extJsonStr)
    }).then(res => {
      if (res.code == 0) {
        wx.showModal({
          title: '成功',
          content: '提交成功，请耐心等待我们处理！',
          showCancel: false,
          confirmText: '我知道了',
          success(res) {
            wx.switchTab({
              url: '/pages/my/index'
            })
          }
        })
      } else {
        wx.showModal({
          title: '失败',
          content: res.msg,
          showCancel: false,
          confirmText: '我知道了'
        })
      }
    })
  }
})