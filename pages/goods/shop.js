const WXAPI = require('apifm-wxapi')
const APP = getApp()

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
    wx.getFuzzyLocation({
      type: 'wgs84', //wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: (res) => {
        this.data.latitude = res.latitude
        this.data.longitude = res.longitude
        this.fetchShops(res.latitude, res.longitude, '')
      },
      fail(e){
        console.error(e)
        APP.checkAndAuthorize('scope.userLocation', '请先允许小程序读取您的位置')
      }
    })    
  },
  async fetchShops(latitude, longitude, kw){
    // https://www.yuque.com/apifm/nu0f75/vvgeq9
    const res = await WXAPI.fetchShops({
      curlatitude: latitude,
      curlongitude: longitude,
      nameLike: kw
    })
    if (res.code == 0) {
      res.data.forEach(ele => {
        ele.distance = ele.distance.toFixed(3) // 距离保留3位小数
      })
      this.setData({
        shops: res.data
      })
    } else {
      this.setData({
        shops: null
      })
    }
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
  searchChange(event){
    this.setData({
      searchValue: event.detail.value
    })
  },
  search(event){
    console.log('search')
    this.setData({
      searchValue: event.detail.value
    })
    this.fetchShops(this.data.latitude, this.data.longitude, event.detail.value)
  },
  goShop(e){
    const index = e.currentTarget.dataset.index
    const shop = this.data.shops[index]
    wx.setStorageSync('shop', shop)
    wx.setStorageSync('shopId', shop.id)
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})