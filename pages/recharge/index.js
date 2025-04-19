const wxpay = require('../../utils/pay.js')
const WXAPI = require('apifm-wxapi')
import drawQrcode from '../../utils/weapp.qrcode.min.js'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    balance: 0,
    uid: undefined,
    showalipay: false,
    rechargeSendRules: undefined,

    activeIndex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let recharge_amount_min = wx.getStorageSync('recharge_amount_min');
    if (!recharge_amount_min) {
      recharge_amount_min = 0;
    }
    this.setData({
      uid: wx.getStorageSync('uid'),
      recharge_amount_min: recharge_amount_min
    });
  },

  /**
     * 点击充值优惠的充值送
     */
  rechargeAmount: function (e) {
    const confine = e.currentTarget.dataset.confine;
    const amount = confine;
    this.setData({
      amount: amount,
      activeIndex: e.currentTarget.dataset.index
    });
    wxpay.wxpay('recharge', amount, 0, "/pages/recharge/index");
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // https://www.yuque.com/apifm/nu0f75/be1cqu
    WXAPI.rechargeSendRules().then(res => {
      if (res.code === 0) {
        this.setData({
          rechargeSendRules: res.data
        });
      }
    })
    // https://www.yuque.com/apifm/nu0f75/wrqkcb
    WXAPI.userAmount(wx.getStorageSync('token')).then(res => {
      if (res.code == 0) {
        this.setData({
          balance: res.data.balance.toFixed(2),
          freeze: res.data.freeze.toFixed(2),
          score: res.data.score
        });
      }
    })
  },
  goAmountLogs(){
    wx.navigateTo({
      url: "/pages/asset/index"
    })
  }
})
