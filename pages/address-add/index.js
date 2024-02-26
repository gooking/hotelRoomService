const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
//获取应用实例
var app = getApp()
Page({
  data: {
    provinces: undefined,// 省份数据数组
    pIndex: 0,//选择的省下标
    cities: undefined,// 城市数据数组
    cIndex: 0,//选择的市下标
    areas: undefined,// 区县数数组
    aIndex: 0,//选择的区下标
  },
  async provinces(provinceId, cityId, districtId) {
    const res = await WXAPI.province()
    if (res.code == 0) {
      const provinces = [{
        id: 0,
        name: '请选择'
      }].concat(res.data)
      let pIndex = 0
      if (provinceId) {
        pIndex = provinces.findIndex(ele => {
          return ele.id == provinceId
        })
      }
      this.setData({
        pIndex,
        provinces: provinces
      })
      if (provinceId) {
        const e = { detail: { value: pIndex}}
        this.provinceChange(e, cityId, districtId)
      }
    }
  },
  async provinceChange(e, cityId, districtId) {
    const index = e.detail.value
    this.setData({
      pIndex: index
    })
    const pid = this.data.provinces[index].id
    if (pid == 0) {
      this.setData({
        cities: null,
        cIndex: 0,
        areas: null,
        aIndex: 0
      })
      return
    }
    const res = await WXAPI.nextRegion(pid);
    if (res.code == 0) {
      const cities = [{
        id: 0,
        name: '请选择'
      }].concat(res.data)
      let cIndex = 0
      if (cityId) {
        cIndex = cities.findIndex(ele => {
          return ele.id == cityId
        })
      }
      this.setData({
        cIndex,
        cities: cities
      })
      if (cityId) {
        const e = { detail: { value: cIndex } }
        this.cityChange(e, districtId)
      }
    }
  },
  async cityChange(e, districtId) {
    const index = e.detail.value
    this.setData({
      cIndex: index
    })
    const pid = this.data.cities[index].id
    if (pid == 0) {
      this.setData({
        areas: null,
        aIndex: 0
      })
      return
    }
    const res = await WXAPI.nextRegion(pid);
    if (res.code == 0) {
      const areas = [{
        id: 0,
        name: '请选择'
      }].concat(res.data)
      let aIndex = 0
      if (districtId) {
        aIndex = areas.findIndex(ele => {
          return ele.id == districtId
        })
      }
      this.setData({
        aIndex,
        areas: areas
      })
      if (districtId) {
        const e = { detail: { value: aIndex } }
        this.areaChange(e)
      }
    }
  },
  async areaChange(e) {
    const index = e.detail.value
    this.setData({
      aIndex: index
    })  
  },
  async bindSave(e) {
    if (this.data.pIndex == 0 ) {
      wx.showToast({
        title: '请选择省份',
        icon: 'none'
      })
      return
    }
    if (this.data.cIndex == 0 ) {
      wx.showToast({
        title: '请选择城市',
        icon: 'none'
      })
      return
    }
    var linkMan = e.detail.value.linkMan;
    const address = e.detail.value.address;
    var mobile = e.detail.value.mobile;
    if (linkMan == ""){
      wx.showToast({
        title: '请填写姓名',
        icon: 'none'
      })
      return
    }
    if (mobile == ""){
      wx.showToast({
        title: '请填写手机号',
        icon: 'none'
      })
      return
    }
    if (address == ""){
      wx.showToast({
        title: '请填写详细地址',
        icon: 'none'
      })
      return
    }
    let apiResult
    wx.showLoading({
      title: '保存中',
    })
    const postData = {
      token: wx.getStorageSync('token'),
      linkMan: linkMan,
      address: address,
      mobile: mobile,
      code: '322000',
      isDefault: 'true',
    }
    if (this.data.pIndex > 0) {
      postData.provinceId = this.data.provinces[this.data.pIndex].id
    }
    if (this.data.cIndex > 0) {
      postData.cityId = this.data.cities[this.data.cIndex].id
    }
    if (this.data.aIndex > 0) {
      postData.districtId = this.data.areas[this.data.aIndex].id
    }
    if (this.data.id) {
      postData.id = this.data.id
      apiResult = await WXAPI.updateAddress(postData)
    } else {
      apiResult = await WXAPI.addAddress(postData)
    }
    wx.hideLoading();
    if (apiResult.code != 0) {
      wx.showToast({
        title: apiResult.msg,
        icon: 'none'
      })
      return;
    }
    // 跳转到结算页面
    wx.navigateBack({})
  },
  async onLoad (e) {
    if (e.id) { // 修改初始化数据库数据
      const res = await WXAPI.addressDetail(wx.getStorageSync('token'), e.id)
      if (res.code == 0) {        
        this.setData({
          id: e.id,
          addressData: res.data.info,
        });
        this.provinces(res.data.info.provinceId, res.data.info.cityId, res.data.info.districtId)
      } else {
        wx.showToast({
          title: '无法获取快递地址数据',
          icon: 'none'
        })
      }
    } else {
      this.provinces()
    }
    this.setData({
      shop: wx.getStorageSync('shop')
    })
  },
  deleteAddress: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除该收货地址吗？',
      success: function (res) {
        if (res.confirm) {
          WXAPI.deleteAddress(wx.getStorageSync('token'), id).then(function () {
            wx.navigateBack({})
          })
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },
  readFromWx : function () {
    const _this = this
    wx.chooseAddress({
      success: function (res) {
        console.log(res)
        _this.initRegionDB(res.provinceName, res.cityName, res.countyName)
        _this.setData({
          wxaddress: res
        });
      }
    })
  }
})
