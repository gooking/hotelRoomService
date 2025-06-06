import initCalendar from '../../template/calendar/index';
import { setTodoLabels } from '../../template/calendar/index';
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')

let interstitialAd = null

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
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-b5abb25cb93c2769'
      })
      interstitialAd.onLoad(() => { })
      interstitialAd.onError((err) => { })
      interstitialAd.onClose(() => { })
    }
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
  doneShow: function () {
    initCalendar({
      afterTapDay: (currentSelect, allSelectedDays) => {
        // 不是今天，直接 return 
        const myDate = new Date();
        // console.log('y:', myDate.getFullYear())
        // console.log('m:', myDate.getMonth() + 1)
        // console.log('d:', myDate.getDate())
        if (myDate.getFullYear() != currentSelect.year ||
          (myDate.getMonth() + 1) != currentSelect.month ||
          myDate.getDate() != currentSelect.day) {
          return
        }
        if (currentSelect.hasTodo) {
          wx.showToast({
            title: '今天已签到',
            icon: 'none'
          })
          return
        }
        // https://www.yuque.com/apifm/nu0f75/dqdgem
        WXAPI.scoreSign(wx.getStorageSync('token')).then(r => {
          wx.showToast({
            title: '签到成功',
            icon: 'none'
          })
          setTodoLabels({
            pos: 'bottom',
            dotColor: '#40',
            days: [{
              year: currentSelect.year,
              month: currentSelect.month,
              day: currentSelect.day,
              todoText: '已签到'
            }],
          });
        })
      }
    })
    // https://www.yuque.com/apifm/nu0f75/scftkq
    WXAPI.scoreSignLogs({
      token: wx.getStorageSync('token')
    }).then(res => {
      if (res.code == 0) {
        res.data.result.forEach(ele => {
          const _data = ele.dateAdd.split(" ")[0]
          setTodoLabels({
            pos: 'bottom',
            dotColor: '#40',
            days: [{
              year: parseInt(_data.split("-")[0]),
              month: parseInt(_data.split("-")[1]),
              day: parseInt(_data.split("-")[2]),
              todoText: '已签到'
            }],
          });
        })
      }
    })    
    // 显示广告
    if (interstitialAd) {
      interstitialAd.show().catch((err) => {
        console.error(err)
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})