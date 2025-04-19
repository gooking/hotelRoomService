const WXAPI = require('apifm-wxapi')
const TOOLS = require('../../utils/tools.js')

//获取应用实例
var app = getApp()
Page({
  data: {
    canshowthispage: false, // 判断是否需要跳转选择酒店界面
    showGoodsDetailPop: false, // 是否弹出商品选择界面
    categoryId: 0, // 0 为推荐
    buyNumber: 0
  },
  onLoad: function(e) {   
    wx.showShareMenu({
      withShareTicket: true
    }) 
    const that = this
    // if (e && e.query && e.query.inviter_id) { 
    //   wx.setStorageSync('referrer', e.query.inviter_id)
    // }
    if (e && e.scene) {
      const scene = decodeURIComponent(e.scene)
      if (scene) {        
        wx.setStorageSync('referrer', scene.substring(11))
      }
    }
  },
  onShow: function(e){
    const shopId = wx.getStorageSync('shopId')
    if (shopId) {
      this.setData({
        shopId,
        canshowthispage: true
      })
      this.shopSubdetail()
      this.category()
    }  else {
      wx.navigateTo({
        url: "/pages/goods/shop"
      })
    }
    // 获取购物车数据，显示TabBarBadge
    TOOLS.showTabBarBadge();
  },
  async shopSubdetail(){
    // https://www.yuque.com/apifm/nu0f75/cu4cfi
    const res = await WXAPI.shopSubdetail(this.data.shopId)
    if (res.code == 0) {
      this.setData({
        shopData: res.data
      })
      wx.setNavigationBarTitle({
        title: res.data.info.name
      })
    }
  },
  async category(){
    // https://www.yuque.com/apifm/nu0f75/racmle
    const res = await WXAPI.goodsCategoryV2()
    if (res.code == 0){
      const categories = [
        {
          id:0,
          name: '爆款推荐',
          type: 'tj'
        }
      ]      
      this.setData({
        categories: categories.concat(res.data)
      })
      this.getGoodsList(this.data.categoryId);
    }
  },
  tapCategory(e){
    const categoryId = e.currentTarget.dataset.id
    this.setData({
      categoryId
    })
    this.getGoodsList(categoryId)
  },  
  async getGoodsList(categoryId) {
    wx.showLoading({
      "mask": true
    })
    const postData = {
      shopId: this.data.shopId
    }
    if (categoryId == 0) {
      postData.recommendStatus = 1
    } else {
      postData.categoryId = categoryId
    }
    // https://www.yuque.com/apifm/nu0f75/wg5t98
    const res = await WXAPI.goodsv2(postData)
    wx.hideLoading()
    if (res.code == 0) {
      this.setData({
        goods: res.data.result
      })
    } else {
      this.setData({
        goods: null
      })
    }
  },
  onShareAppMessage: () => {
    return {
      title: this.data.shopData.info.name,
      path: '/pages/index/index?inviter_id=' + wx.getStorageSync('uid')
    }
  },
  selGood(e){
    const curGood = this.data.goods.find(ele => {
      return ele.id == e.currentTarget.dataset.id
    })    
    if (curGood) {
      if (curGood.stores <= 0) {
        wx.showToast({
          title: '已售罄~',
          icon: 'none'
        })
        return
      }
      this.setData({
        curGood,
        buyNumber: 1,
        showGoodsDetailPop: true
      })
    }
  },
  closePop(){
    this.setData({
      showGoodsDetailPop: false
    })
  },
  numJianTap () {
    let buyNumber = this.data.buyNumber;
    buyNumber--;
    if (buyNumber <= 0) {
      this.setData({
        showGoodsDetailPop: false
      })
      return
    }
    this.setData({
      buyNumber
    })
  },
  numJiaTap () {
    let buyNumber = this.data.buyNumber;
    if (buyNumber >= this.data.curGood.stores) {
      return
    }
    buyNumber++
    this.setData({
      buyNumber
    })
  },
  addShopCar(){
    let shopCarInfo = wx.getStorageSync('shopCarInfo')
    if (!shopCarInfo) {
      shopCarInfo = []
    }
    //增加商品信息
    const index = shopCarInfo.findIndex(ele => {
      return ele.id == this.data.curGood.id
    })
    let goodsItem; // 购物车中的当前商品对象
    if (index == -1) {
      goodsItem = {
        id: this.data.curGood.id,
        name: this.data.curGood.name,
        number: 0,
        active: true,
        pic: this.data.curGood.pic,
        characteristic: this.data.curGood.characteristic,
        stores: this.data.curGood.stores,
        minPrice: this.data.curGood.minPrice,
      }
    } else {
      goodsItem = shopCarInfo.splice(index, 1)[0]
    }
    goodsItem.number += this.data.buyNumber

    shopCarInfo.push(goodsItem)
    wx.setStorageSync('shopCarInfo', shopCarInfo)
    
    wx.showToast({
      title: '已加入购物车',
      icon: 'success'
    })
    this.setData({
      showGoodsDetailPop: false
    })
    TOOLS.showTabBarBadge();
  },
  addShopCar2(e){
    const curGood = this.data.goods.find(ele => {
      return ele.id == e.currentTarget.dataset.id
    })
    if (curGood) {
      if (curGood.stores <= 0) {
        wx.showToast({
          title: '已售罄~',
          icon: 'none'
        })
        return
      }
      this.setData({
        curGood,
        buyNumber: 1,
      })
      this.addShopCar()
    }
  },
  buyNow(){
    const goodsItem = {
      id: this.data.curGood.id,
      name: this.data.curGood.name,
      number: this.data.buyNumber,
      active: true,
      pic: this.data.curGood.pic,
      characteristic: this.data.curGood.characteristic,
      stores: this.data.curGood.stores,
      minPrice: this.data.curGood.minPrice,
    }    
    wx.setStorageSync('shopBuyInfo', goodsItem)
    this.setData({
      showGoodsDetailPop: false
    })
    wx.navigateTo({
      url: "/pages/to-pay-order/index?orderType=buyNow"
    })
  }
})