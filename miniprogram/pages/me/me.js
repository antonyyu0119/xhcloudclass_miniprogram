// pages/me/me.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeNames: ['0'],
    userAvatarUrl:"../../images/touxiang.png",
    userNickName: "",
    isuserName: false,
    name:"",
    idUrl:"",
    isStudent: "",
    currentSize: ""
  },
  onChange(event) {
    this.setData({
      activeNames: event.detail
    });
  },

  gotoKejianku: function () {
    wx.navigateTo({
      url: '../kejianku/kejianku',
    })
  },
  gotoShitiku: function () {
    wx.navigateTo({
      url: '../shitiku/shitiku',
    })
  },

  getStorageInfo: function () {
    var that = this
    wx.getStorageInfo({
      success: function (res) {
        wx.hideLoading();
        console.log(res)
        that.setData({
          currentSize: res.currentSize + 'KB'
        });
      },
    });
  },
  

  clearStorage: function () {
    var that = this
    wx.showLoading({
      title: '正在清除缓存...',
    })
    app.clearStorage()
    setTimeout(function(){
      that.getStorageInfo();
    },2000);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this
    const db = wx.cloud.database()
    if (getApp().globalData.identity == "student") {
      that.setData({
        isStudent: true,
        isuserName: app.globalData.profile.isuserName,
        name: app.globalData.profile.sname
      });
      
    } else if (getApp().globalData.identity == "teacher"){
      that.setData({
        isStudent: false,
        isuserName: app.globalData.profile.isuserName,
        name: app.globalData.profile.tname
      });
      
    }  

    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this
    that.setData({
      userAvatarUrl: getApp().globalData.userAvatarUrl,
      userNickName: getApp().globalData.userNickName,
      idUrl: getApp().globalData.idUrl
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    that.getStorageInfo();
    app.setBadge();
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
});