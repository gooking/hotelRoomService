const WXAPI = require('apifm-wxapi')
const CONFIG = require('config.js')
const AUTH = require('utils/auth')
App({
  onLaunch: function() {
    WXAPI.init(CONFIG.subDomain)
    WXAPI.setMerchantId(CONFIG.merchantId)
    const that = this;
    // 检测新版本
    const updateManager = wx.getUpdateManager()
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    /**
     * 初次加载判断网络情况
     * 无网络状态下根据实际情况进行调整
     */
    wx.getNetworkType({
      success(res) {
        const networkType = res.networkType
        if (networkType === 'none') {
          that.globalData.isConnected = false
          wx.showToast({
            title: '当前无网络',
            icon: 'loading',
            duration: 2000
          })
        }
      }
    });
    /**
     * 监听网络状态变化
     * 可根据业务需求进行调整
     */
    wx.onNetworkStatusChange(function(res) {
      if (!res.isConnected) {
        that.globalData.isConnected = false
        wx.showToast({
          title: '网络已断开',
          icon: 'loading',
          duration: 2000,
          complete: function() {
            that.goStartIndexPage()
          }
        })
      } else {
        that.globalData.isConnected = true
        wx.hideToast()
      }
    });
    //  获取接口和后台权限
    // https://www.yuque.com/apifm/nu0f75/wb6u7d
    WXAPI.vipLevel().then(res => {
      that.globalData.vipLevel = res.data
    })
    //  获取商城名称
    // https://www.yuque.com/apifm/nu0f75/dis5tl
    WXAPI.queryConfigBatch('TRIP_YUYUE_ID,RECHARGE_OPEN,recharge_amount_min,express_open').then(function(res) {
      if (res.code == 0) {
        res.data.forEach(config => {
          wx.setStorageSync(config.key, config.value);
          if (config.key === 'recharge_amount_min') {
            that.globalData.recharge_amount_min = res.data.value;
          }
        })
        
      }
    })
    // https://www.yuque.com/apifm/nu0f75/zi13yk
    WXAPI.scoreRules({
      code: 'goodReputation'
    }).then(function(res) {
      if (res.code == 0) {        
        that.globalData.order_reputation_score = res.data[0].score;
      }
    })
  },
  goStartIndexPage: function() {
    setTimeout(function() {
      wx.redirectTo({
        url: "/pages/start/start"
      })
    }, 1000)
  },  
  onShow (e) {
    this.globalData.launchOption = e
    // 保存邀请人
    if (e && e.query && e.query.inviter_id) {
      wx.setStorageSync('referrer', e.query.inviter_id)
      if (e.shareTicket) {
        // 通过分享链接进来
        wx.getShareInfo({
          shareTicket: e.shareTicket,
          success: res => {
            // console.error(res)
            // console.error({
            //   referrer: e.query.inviter_id,
            //   encryptedData: res.encryptedData,
            //   iv: res.iv
            // })
            // https://www.yuque.com/apifm/nu0f75/uthem8
            WXAPI.shareGroupGetScore(
              e.query.inviter_id,
              res.encryptedData,
              res.iv
            )
          }
        })
      }
    }
    // 自动登录
    AUTH.checkHasLogined().then(isLogined => {
      if (!isLogined) {
        AUTH.authorize()
      }
    })
  },
  checkAndAuthorize(scope, msg){
    wx.getSetting({
      success(res) {
        if (!res.authSetting[scope]) {
          wx.authorize({
            scope: scope,
            success() {
              console.log('授权成功')
            },
            fail(e) {
              wx.showModal({
                title: '提示',
                content: msg,
                showCancel: false,
                confirmText: '我知道了',
                success(){
                  wx.openSetting()
                }
              })
            },
          })
        }
      }
    })
  },
  globalData: {                
    isConnected: true,
    launchOption: undefined,
    vipLevel: 0
  }
})