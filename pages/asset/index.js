const app = getApp()
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
import ApifmLogin from '../../template/login/index.js';

var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wxlogin: true,
    balance: 0.00,
    freeze: 0,
    score: 0,
    score_sign_continuous: 0,
    cashlogs: undefined,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  onShow: function () {
    AUTH.checkHasLogined().then(isLogined => {
      this.setData({
        wxlogin: isLogined
      })
      if (isLogined) {
        this.doneShow();
      }
    })
  },
  doneShow: function () {
    const _this = this
    const token = wx.getStorageSync('token')
    if (!token) {
      this.setData({
        wxlogin: false
      })
      return
    }
    // https://www.yuque.com/apifm/nu0f75/wrqkcb
    WXAPI.userAmount(token).then(function (res) {
      if (res.code == 700) {
        wx.showToast({
          title: '当前账户存在异常',
          icon: 'none'
        })
        return
      }
      if (res.code == 2000) {
        this.setData({
          wxlogin: false
        })
        return
      }
      if (res.code == 0) {
        _this.setData({
          balance: res.data.balance.toFixed(2),
          freeze: res.data.freeze.toFixed(2),
          totleConsumed: res.data.totleConsumed.toFixed(2),
          score: res.data.score
        });
      }
    })
    this.cashLogs()
  },
  cashLogs() {
    const _this = this
    // https://www.yuque.com/apifm/nu0f75/khq7xu
    WXAPI.cashLogsV2({
      token: wx.getStorageSync('token'),
      page:1,
      pageSize:10000
    }).then(res => {
      if (res.code == 0) {
        _this.setData({
          cashlogs: res.data.result
        })
      }
    })
  },
  cancelLogin(){
    this.setData({
      wxlogin: true
    })
  },
  processLogin(e){
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