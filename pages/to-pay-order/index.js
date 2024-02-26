const app = getApp()
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')

Page({
  data: {
    wxlogin: true,
    totalPrice: 0,
    couponsNumber: 0,
    showCouponsPop: false,

    totalScoreToPay: 0,
    goodsList: [],
    isNeedLogistics: 0, // 是否需要物流信息
    allGoodsPrice: 0,
    yunPrice: 0,
    allGoodsAndYunPrice: 0,
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，
    pingtuanOpenId: undefined, //拼团的话记录团号

    hasNoCoupons: true,
    coupons: [],
    youhuijine: 0, //优惠券金额
    curCoupon: null, // 当前选择使用的优惠券
    peisongType: 'zq'
  },
  onLoad(e) {
    this.setData({
      orderType: e.orderType,
      shop: wx.getStorageSync('shop'),
      express_open: wx.getStorageSync('express_open')
    })
  },
  onShow() {
    AUTH.checkHasLogined().then(isLogined => {
      if (isLogined) {
        this.doneShow()
      } else {
        this.setData({
          wxlogin: isLogined
        })
      }
    })
  },
  doneShow() {
    let goods = wx.getStorageSync('shopCarInfo')
    if (goods) {
      goods = goods.filter(ele => {
        return ele.active
      })
    }
    if ("buyNow" == this.data.orderType) {
      goods = []
      goods.push(wx.getStorageSync('shopBuyInfo'))
    }
    if (!goods || goods.length == 0) {
      wx.showToast({
        title: '购物车空~',
        icon: 'none'
      })
      wx.navigateBack()
      return
    }
    this.setData({
      goods
    })
    this.initShippingAddress();
  },
  createOrder(e) {    
    const postData = {
      token: wx.getStorageSync('token'),
      goodsJsonStr: this.data.goodsJsonStr,
      peisongType: this.data.peisongType
    }
    if (this.data.peisongType == 'kd') {
      if (!this.data.curAddressData) {
        wx.showToast({
          title: '请添加收货地址',
          icon: 'none'
        })
        return
      }
      postData.provinceId = this.data.curAddressData.provinceId;
      postData.cityId = this.data.curAddressData.cityId;
      if (this.data.curAddressData.districtId) {
        postData.districtId = this.data.curAddressData.districtId;
      }
      postData.address = this.data.curAddressData.address;
      postData.linkMan = this.data.curAddressData.linkMan;
      postData.mobile = this.data.curAddressData.mobile;
      postData.code = this.data.curAddressData.code;
    } else {
      postData.remark = '配送到房间:' + this.data.fjh
    }
    
    if (this.data.curCoupon) {
      postData.couponId = this.data.curCoupon.id;
    }
    if (!e) {
      postData.calculate = "true";
    } else {
      if (this.data.peisongType == 'zq' && !this.data.fjh) {
        wx.showToast({
          title: '请输入房间号',
          icon: 'none'
        })
        return
      }
    }

    WXAPI.orderCreate(postData).then(res => {
      if (res.code != 0) {
        wx.showModal({
          title: '错误',
          content: res.msg,
          showCancel: false
        })
        return;
      }

      if (e && "buyNow" != this.data.orderType) {
        // 清空购物车数据
        wx.removeStorageSync('shopCarInfo');
      }
      if (!e) {
        let totalPrice = 0
        let totalNumber = 0
        this.data.goods.forEach(ele => {
          if (ele.active) {
            totalNumber += ele.number
            totalPrice += ele.number * ele.minPrice
          }
        })
        this.setData({
          totalPrice,
          totalNumber,
          totalScoreToPay: res.data.score,
          isNeedLogistics: res.data.isNeedLogistics,
          allGoodsPrice: res.data.amountTotle,
          allGoodsAndYunPrice: res.data.amountLogistics + res.data.amountTotle,
          yunPrice: res.data.amountLogistics
        });
        this.getMyCoupons();
        return;
      }
      // 下单成功，跳转到订单管理界面
      wx.redirectTo({
        url: "/pages/order-list/index"
      });
    })
  },
  async initShippingAddress() {
    const res = await WXAPI.defaultAddress(wx.getStorageSync('token'))
    if (res.code == 0) {
      this.setData({
        curAddressData: res.data.info
      });
    }
    this.processYunfei();
  },
  processYunfei() {
    var goodsList = this.data.goods;
    var goodsJsonStr = "[";
    var isNeedLogistics = 0;
    var allGoodsPrice = 0;


    let inviter_id = 0;
    let inviter_id_storge = wx.getStorageSync('referrer');
    if (inviter_id_storge) {
      inviter_id = inviter_id_storge;
    }
    for (let i = 0; i < goodsList.length; i++) {
      let carShopBean = goodsList[i];
      if (carShopBean.logistics) {
        isNeedLogistics = 1;
      }
      allGoodsPrice += carShopBean.minPrice * carShopBean.number;

      var goodsJsonStrTmp = '';
      if (i > 0) {
        goodsJsonStrTmp = ",";
      }

      goodsJsonStrTmp += '{"goodsId":' + carShopBean.id + ',"number":' + carShopBean.number + ',"propertyChildIds":"","logisticsType":0, "inviter_id":' + inviter_id + '}';
      goodsJsonStr += goodsJsonStrTmp;


    }
    goodsJsonStr += "]";
    //console.log(goodsJsonStr);
    this.setData({
      isNeedLogistics: isNeedLogistics,
      goodsJsonStr: goodsJsonStr
    });
    this.createOrder();
  },
  addAddress: function() {
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },
  selectAddress: function() {
    wx.navigateTo({
      url: "/pages/select-address/index"
    })
  },
  getMyCoupons: function() {
    var that = this;
    WXAPI.myCoupons({
      token: wx.getStorageSync('token'),
      status: 0
    }).then(function(res) {
      if (res.code == 0) {
        var coupons = res.data.filter(entity => {
          return entity.moneyHreshold <= that.data.allGoodsAndYunPrice;
        });
        if (coupons.length > 0) {
          that.setData({
            hasNoCoupons: false,
            coupons: coupons,
            couponsNumber: coupons.length
          });
        } else {
          that.setData({
            hasNoCoupons: true,
            coupons: null,
            couponsNumber: 0
          });
        }
      }
    })
  },
  bindChangeCoupon(e) {
    const curCoupon = this.data.coupons.find(ele => {
      return ele.id == e.currentTarget.dataset.id
    })
    if (!curCoupon) {
      this.setData({
        youhuijine: 0,
        curCoupon: null,
        showCouponsPop: false
      });
      return
    }
    this.setData({
      youhuijine: curCoupon.money,
      curCoupon,
      showCouponsPop: false
    });
  },
  cancelLogin() {
    wx.navigateBack()
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
  openCouponsPop(){
    if (this.data.couponsNumber <= 0) {
      return
    }
    this.setData({
      showCouponsPop: true
    })
  },
  closePop(){
    this.setData({
      showCouponsPop: false
    })
  },
  radioChange (e) {
    this.setData({
      peisongType: e.detail.value
    })
  },
  fjhChange(e) {
    this.setData({
      fjh: e.detail.value
    })
  },
})