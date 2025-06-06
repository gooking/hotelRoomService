const app = getApp()
const CONFIG = require('../../config.js')
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')

import imageUtil from '../../utils/image'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wxlogin: true,

    applyStatus: -2, // -1 表示未申请，0 审核中 1 不通过 2 通过
    applyInfo: {},
    canvasHeight: 0,

    currentPages: undefined,
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
  onShow() {
    const _this = this
    AUTH.checkHasLogined().then(isLogined => {
      this.setData({
        wxlogin: isLogined
      })
      if (isLogined) {
        this.doneShow();
      }
    })
  },
  async doneShow() {
    const _this = this
    // https://www.yuque.com/apifm/nu0f75/zgf8pu
    const userDetail = await WXAPI.userDetail(wx.getStorageSync('token'))
    // https://www.yuque.com/apifm/nu0f75/awzg4o
    WXAPI.fxApplyProgress(wx.getStorageSync('token')).then(res => {
      let applyStatus = userDetail.data.base.isSeller ? 2 : -1
      if (res.code == 2000) {
        this.setData({
          wxlogin: false
        })
        return
      }
      if (res.code === 700) {
        _this.setData({
          applyStatus: applyStatus
        })
      }
      if (res.code === 0) {
        if (userDetail.data.base.isSeller) {
          applyStatus = 2
        } else {
          applyStatus = res.data.status
        }
        _this.setData({
          applyStatus: applyStatus,
          applyInfo: res.data
        })
      }
      if (applyStatus == 2) {
        _this.fetchQrcode()
      }
    })
    this.setData({
      currentPages: getCurrentPages()
    })
  },
  fetchQrcode(){
    const _this = this
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    // https://www.yuque.com/apifm/nu0f75/ak40es
    WXAPI.wxaQrcode({
      scene: 'inviter_id=' + wx.getStorageSync('uid'),
      page: 'pages/index/index',
      is_hyaline: true,
      expireHours: 1
    }).then(res => {
      wx.hideLoading()
      if (res.code == 0) {
        _this.showCanvas(res.data)
      }
    })
  },
  showCanvas(qrcode){
    const _this = this
    let ctx
    wx.getImageInfo({
      src: qrcode,
      success: (res) => {
        const imageSize = imageUtil(res.width, res.height)
        const qrcodeWidth = imageSize.windowWidth / 2
        _this.setData({
          canvasHeight: qrcodeWidth
        })
        ctx = wx.createCanvasContext('firstCanvas')
        ctx.setFillStyle('#fff')
        ctx.fillRect(0, 0, imageSize.windowWidth, imageSize.imageHeight + qrcodeWidth)
        ctx.drawImage(res.path, (imageSize.windowWidth - qrcodeWidth) / 2, 0, qrcodeWidth, qrcodeWidth)
        setTimeout(function () {
          wx.hideLoading()
          ctx.draw()
        }, 1000)
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
      title: '"' + wx.getStorageSync('mallName') + '" ' + CONFIG.shareProfile,
      path: '/pages/index/index?inviter_id=' + wx.getStorageSync('uid'),
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  bindSave: function (e) {
    WXAPI.addTempleMsgFormid(wx.getStorageSync('token'), 'form', e.detail.formId)
    wx.navigateTo({
      url: "/pages/fx/apply"
    })
  },
  goShop: function (e) {
    WXAPI.addTempleMsgFormid(wx.getStorageSync('token'), 'form', e.detail.formId)
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  saveToMobile() { //下载二维码到手机
    wx.canvasToTempFilePath({
      canvasId: 'firstCanvas',
      success: function (res) {
        let tempFilePath = res.tempFilePath
        wx.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success: (res) => {
            wx.showModal({
              content: '二维码已保存到手机相册',
              showCancel: false,
              confirmText: '知道了',
              confirmColor: '#333'
            })
          },
          fail: (res) => {
            wx.showToast({
              title: res.errMsg,
              icon: 'none',
              duration: 2000
            })
          }
        })
      }
    })
  },
  goIndex() {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
  cancelLogin() {
    wx.switchTab({
      url: '/pages/my/index'
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