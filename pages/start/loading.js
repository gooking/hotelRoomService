const WXAPI = require('apifm-wxapi')
const APP = getApp()
const AUTH = require('../../utils/auth')

Page({
  data: {
    initSuccess: false
  },
  onLoad: function (options) {
    // this.shopSubdetail(5732)
    console.log(options)
    // 处理参数
    if (options && options.scene) {
      const scene = decodeURIComponent(options.scene) // 处理扫码进来的业务逻辑,格式为：   shopId,5732
      const _const = scene.split(',')
      if (_const[0] == 'shopId') {
        const shopId = _const[1]
        this.shopSubdetail(shopId)
      }
      
    }  
  },
  async shopSubdetail(shopId){
    // https://www.yuque.com/apifm/nu0f75/cu4cfi
    const res = await WXAPI.shopSubdetail(shopId)
    if (res.code == 0) {
      wx.setStorageSync('shop', res.data.info)
      wx.setStorageSync('shopId', shopId)
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },
})