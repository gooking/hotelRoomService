const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')

const app = getApp()
Page({
  data: {
    addressList: []
  },

  selectTap: function(e) {
    var id = e.currentTarget.dataset.id
    // https://www.yuque.com/apifm/nu0f75/cv6gh7
    WXAPI.updateAddress({
      token: wx.getStorageSync('token'),
      id: id,
      isDefault: 'true'
    }).then(function(res) {
      wx.navigateBack({})
    })
  },

  addAddess: function() {
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },

  editAddess: function(e) {
    wx.navigateTo({
      url: "/pages/address-add/index?id=" + e.currentTarget.dataset.id
    })
  },

  deleteAddress: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除该收货地址吗？',
      success: function (res) {
        if (res.confirm) {
          // https://www.yuque.com/apifm/nu0f75/gb0a2k
          WXAPI.deleteAddress(wx.getStorageSync('token'), id).then(function () {
            that.onShow()
          })
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },

  onLoad: function() {
  },
  onShow: function() {
    AUTH.checkHasLogined().then(isLogined => {
      if (isLogined) {
        this.initShippingAddress();
      } else {
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
  initShippingAddress: function() {
    var that = this
    // https://www.yuque.com/apifm/nu0f75/mmte1o
    WXAPI.queryAddressV2({
      token: wx.getStorageSync('token')
    }).then(function(res) {
      if (res.code == 0) {
        that.setData({
          addressList: res.data.result
        });
      } else if (res.code == 700) {
        that.setData({
          addressList: null
        });
      }
    })
  }

})