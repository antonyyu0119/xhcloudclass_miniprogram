// pages/instructor/instructor.js
const db = wx.cloud.database();
var app = getApp();
var cmd = db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    today: '',
    yesterday: '',
    percent: 0,
    loading: true,
    viewShow: false,
   
    refreshing: false,
    askNum: "",

    active: 0,
    activeKey: 0,
    askList: [],

    lateList: [],
    absentList: [],
    teacherList: [],

    name: "",
    userAvatarUrl: "../../images/touxiang.png",
  },

  refresh: function(){
    var that = this
    wx.showLoading({
      title: '刷新中。。。',
    })
    that.setData({refreshing: true});
    that.getAskfor();
  },

  getAskfor: function(){
    var that = this
    var askNum = 0
    console.log(app.globalData.instructorInfo)
    wx.cloud.callFunction({
      // 云函数名称
      name: 'accessDB',
      // 传给云函数的参数
      data: {
        action: "get_askfor",
        name: app.globalData.instructorInfo.name,
        school: app.globalData.instructorInfo.school
      },
      success: function (res) {
        var newArray1 = res.result.data
        for (var i = 0; i < newArray1.length; i++) {
          if (newArray1[i].flag == 1 && newArray1[i].hasRead == '未读') {
            askNum++
          }
        }
        that.setData({
          percent: 100,
          loading: false,
          viewShow: true,
          askNum: askNum,
          askList: newArray1
        });
        wx.hideLoading();
        that.setData({refreshing: false});
        console.log(res)
      },
      fail: res => {
        wx.hideLoading();
        that.setData({ refreshing: false });
      }
    });
  },

  changeTab(event) {
    var that = this
    console.log(event.detail);
    that.setData({
      active: event.detail
    })
  },

  changeSide(event) {
    var that = this
    that.setData({
      activeKey: event.detail
    })
  },

  askforInfo: function (e) {
    var that = this
    console.log(e.currentTarget.dataset._id)
    var _id = e.currentTarget.dataset._id
    wx.navigateTo({
      url: '../askforInfo/askforInfo?_id=' + _id + '&&identity=' + app.globalData.identity,
    })
  },

  //清缓存
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

  //显示缓存大小
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




  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.setData({
      today: app.globalData.date,
      yesterday: app.globalData.yesterday,
      userAvatarUrl: app.globalData.userAvatarUrl
    })
    
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
    var that = this
    let loading_timer;
    loading_timer = () => {
      setTimeout(() => {
        if (that.data.percent >= 95) {
          return
        }
        that.setData({ percent: that.data.percent + 1 });
        loading_timer();
      }, 10);
    }
    loading_timer();
    console.log(app.globalData);
    
    db.collection("instructorInfo").where({
      _openid: app.globalData.openid
    }).get().then(res => {
      app.globalData.instructorInfo = res.data[0]
      that.setData({ name: res.data[0].name });
      that.getStorageInfo();
      that.getAskfor();
    }).catch(err => { })
    
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
    var that = this
    wx.showLoading({
      title: '加载中...',
    })
    wx.showNavigationBarLoading()
    that.setData({refreshing: true})
    that.getAskfor();
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新

    }, 1500);
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