const wxpay = require('../../utils/pay.js')
const app = getApp()
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')

Page({
  data: {
    statusType: ["待付款", "待发货", "待确认", "已完成"],
    hasRefund: false,
    currentType: 0,
    tabClass: ["", "", "", "", ""]
  },
  statusTap: function(e) {
    const curType = e.currentTarget.dataset.index;
    this.data.currentType = curType
    this.setData({
      currentType: curType
    });
    this.onShow();
  },
  cancelOrderTap: function(e) {
    const that = this;
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: function(res) {
        if (res.confirm) {
          WXAPI.orderClose(wx.getStorageSync('token'), orderId).then(function(res) {
            if (res.code == 0) {
              that.onShow();
            }
          })
        }
      }
    })
  },
  refundApply (e) {
    // 申请售后
    const orderId = e.currentTarget.dataset.id;
    const amount = e.currentTarget.dataset.amount;
    wx.navigateTo({
      url: "/pages/order/refundApply?id=" + orderId + "&amount=" + amount
    })
  },
  toPayTap: function(e) {
    // 防止连续点击--开始
    if (this.data.payButtonClicked) {
      wx.showToast({
        title: '休息一下~',
        icon: 'none'
      })
      return
    }
    this.data.payButtonClicked = true
    setTimeout(() => {
      this.data.payButtonClicked = false
    }, 3000)  // 可自行修改时间间隔（目前是3秒内只能点击一次支付按钮）
    // 防止连续点击--结束
    const that = this;
    const orderId = e.currentTarget.dataset.id;
    let money = e.currentTarget.dataset.money;
    const needScore = e.currentTarget.dataset.score;
    WXAPI.userAmount(wx.getStorageSync('token')).then(function(res) {
      if (res.code == 0) {
        // 增加提示框
        if (res.data.score < needScore) {
          wx.showToast({
            title: '您的积分不足，无法支付',
            icon: 'none'
          })
          return;
        }
        let _msg = '订单金额: ' + money +' 元'
        if (res.data.balance > 0) {
          _msg += ',可用余额为 ' + res.data.balance +' 元'
          if (money - res.data.balance > 0) {
            _msg += ',仍需微信支付 ' + (money - res.data.balance) + ' 元'
          }          
        }
        if (needScore > 0) {
          _msg += ',并扣除 ' + money + ' 积分'
        }
        money = money - res.data.balance
        wx.showModal({
          title: '请确认支付',
          content: _msg,
          confirmText: "确认支付",
          cancelText: "取消支付",
          success: function (res) {
            console.log(res);
            if (res.confirm) {
              that._toPayTap(orderId, money)
            } else {
              console.log('用户点击取消支付')
            }
          }
        });
      } else {
        wx.showModal({
          title: '错误',
          content: '无法获取用户资金信息',
          showCancel: false
        })
      }
    })
  },
  _toPayTap: function (orderId, money){
    const _this = this
    if (money <= 0) {
      // 直接使用余额支付
      WXAPI.orderPay(wx.getStorageSync('token'), orderId).then(function (res) {
        _this.onShow();
      })
    } else {
      wxpay.wxpay('order', money, orderId, "/pages/order-list/index");
    }
  },
  onLoad: function(options) {
    
  },
  onShow: function() {
    AUTH.checkHasLogined().then(isLogined => {
      if (isLogined) {
        this.doneShow();
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
  doneShow() {
    // 获取订单列表
    var that = this;
    var postData = {
      token: wx.getStorageSync('token')
    };
    if (that.data.currentType != 3) {
      postData.status = that.data.currentType;
    } else {
      postData.statusBatch = '3,4';
    }
    WXAPI.orderList(postData).then(function(res) {
      if (res.code == 0) {
        res.data.orderList.forEach(ele => {
          if (ele.status == 0) {
            ele.statusStr = '等待买家付款'
          }
          if (ele.status == 1) {
            ele.statusStr = '买家已付款'
          }
          if (ele.status == 2) {
            ele.statusStr = '仓库已发货'
          }
          if (ele.status == 3 || ele.status == 4) {
            ele.statusStr = '已完成'
          }
        })
        that.setData({
          orderList: res.data.orderList,
          logisticsMap: res.data.logisticsMap,
          goodsMap: res.data.goodsMap
        });
      } else {
        that.setData({
          orderList: null,
          logisticsMap: {},
          goodsMap: {}
        });
      }
    })
  },
  orderDelivery(e){
    const orderId = e.currentTarget.dataset.id;
    let that = this;
    wx.showModal({
      title: '确认您已收到商品？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          WXAPI.orderDelivery(wx.getStorageSync('token'), orderId).then(function (res) {
            if (res.code == 0) {
              that.onShow();
            }
          })
        }
      }
    })
  },
  orderDelete(e){
    const orderId = e.currentTarget.dataset.id;
    let that = this;
    wx.showModal({
      title: '确认删除该订单？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          WXAPI.orderDelete(wx.getStorageSync('token'), orderId).then(function (res) {
            if (res.code == 0) {
              that.onShow();
            }
          })
        }
      }
    })
  },
})