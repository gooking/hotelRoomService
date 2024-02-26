const WXAPI = require('apifm-wxapi')
const TOOLS = require('../../utils/tools.js')

const app = getApp()

Page({
  data: {
    totalPrice: 0
  },
  onLoad: function() {
    // this.initEleWidth();
  },
  onShow: function() {
    this.setData({
      goods: wx.getStorageSync('shopCarInfo')
    })
    this.calculatePrice()
  },
  toIndexPage: function() {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },
  selectTap: function(e) {
    const index = e.currentTarget.dataset.index;
    const list = this.data.goods;
    if (index !== "" && index != null) {
      list[index].active = !list[index].active;
      this.setData({
        goods: this.data.goods
      })
      wx.setStorageSync('shopCarInfo', this.data.goods)
      this.calculatePrice()
    }
  },
  longpress(e){
    const index = e.currentTarget.dataset.index;
    const list = this.data.goods;
    list.forEach(ele => {
      ele.goDelete = false
    })
    if (index !== "" && index != null) {
      list[index].goDelete = true;
      this.setData({
        goods: this.data.goods
      })
    }
  },
  deleteSel: function (e) {
    const index = e.currentTarget.dataset.index;
    const list = this.data.goods;
    if (index !== "" && index != null) {
      list.splice(index, 1)
      this.setData({
        goods: this.data.goods
      })
      wx.setStorageSync('shopCarInfo', this.data.goods)
      this.calculatePrice()
    }
  },
  jiaBtnTap: function(e) {
    const index = e.currentTarget.dataset.index;
    const list = this.data.goods;
    if (index !== "" && index != null) {
      if (list[index].number >= list[index].stores) {
        wx.showToast({
          title: '没有更多了~',
          icon: 'none'
        })
        return
      }
      list[index].number++      
      this.setData({
        goods: this.data.goods
      })
      wx.setStorageSync('shopCarInfo', this.data.goods)
      this.calculatePrice()
    }
  },
  jianBtnTap: function(e) {
    const index = e.currentTarget.dataset.index;
    const list = this.data.goods;
    if (index !== "" && index != null) {
      list[index].number--
      if (list[index].number <= 0) {
        // 移除该商品
        list.splice(index, 1)
      }
      this.setData({
        goods: this.data.goods
      })
      wx.setStorageSync('shopCarInfo', this.data.goods)
      this.calculatePrice()
    }
  },
  toPayOrder() {    
    const list = this.data.goods.filter(ele => {
      return ele.active
    })
    if (!list || list.length == 0) {
      wx.showToast({
        title: '选择商品',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: "/pages/to-pay-order/index"
    })
  },
  calculatePrice () {
    let totalPrice = 0
    this.data.goods.forEach(ele => {
      if (ele.active) {
        totalPrice += ele.number * ele.minPrice
      }
    })
    totalPrice = totalPrice.toFixed(2)
    this.setData({
      totalPrice
    })
    TOOLS.showTabBarBadge();
  },
})