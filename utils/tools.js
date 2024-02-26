// 显示购物车tabBar的Badge
function showTabBarBadge(){
  wx.getStorage({
    key: 'shopCarInfo',
    success: function (res) {
      let totleNumber = 0
      if (res && res.data) {
        res.data.forEach(ele => {
          totleNumber += ele.number
        })
      }
      if (totleNumber > 0) {
        wx.setTabBarBadge({
          index: 3,
          text: `${totleNumber}`
        });
      } else {
        wx.removeTabBarBadge({
          index: 3
        });
      }
    }
  });
}

module.exports = {
  showTabBarBadge: showTabBarBadge
}