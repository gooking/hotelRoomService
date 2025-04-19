const WXAPI = require('apifm-wxapi')
const APP = getApp()
const AUTH = require('../../utils/auth')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wxlogin: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      yuyueId: wx.getStorageSync('TRIP_YUYUE_ID')
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.getFuzzyLocation({
      type: 'wgs84', //wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: (res) => {
        this.setData(res)
      },
      fail(e) {
        console.error(e)
        APP.checkAndAuthorize('scope.userLocation', '请先允许小程序读取您的位置')
      }
    }) 
  },
  changeName(e){
    this.setData({
      name: e.detail.value
    })
  },
  changeMobile(e){
    this.setData({
      mobile: e.detail.value
    })
  },
  async save(){
    if (!this.data.name) {
      wx.showToast({
        title: '填写乘车人',
        icon: 'none',
      })
      return;
    }
    if (!this.data.mobile) {
      wx.showToast({
        title: '填写手机号',
        icon: 'none',
      })
      return;
    }
    // https://www.yuque.com/apifm/nu0f75/yndxym
    const res = await WXAPI.yuyueJoin({
      token: wx.getStorageSync('token'),
      yuyueId: this.data.yuyueId,
      remark: this.data.name + ' - ' + this.data.mobile
    })
    if (res.code == 30000) {
      this.setData({
        wxlogin: false
      })
      return
    }
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
      return
    }
    this.setData({
      name: null,
      mobile: null,
    })
    wx.showModal({
      title: '预约成功',
      content: '我们尽快为您预约租车',
      showCancel: false,
      confirmText: '我知道了',
      success(res) {
        wx.navigateTo({
          url: "/pages/trip/logs"
        })
      }
    })
  },
  cancelLogin() {
    this.setData({
      wxlogin: true
    })
  },
  processLogin(e) {
    if (!e.detail.userInfo) {
      wx.showToast({
        title: '已取消',
        icon: 'none',
      })
      return;
    }
    AUTH.authorize(this);
  },
})