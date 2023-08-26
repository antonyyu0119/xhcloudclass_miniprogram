// pages/sendNotification/sendNotification.js
const db = wx.cloud.database();
var cmd = db.command;
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    viewShow: false,
    loading: true,
    percent: 0,

    today: "",
    yesterday: "",
    notificationList: []
  },

  onClose: function(event) {
    const { position, instance } = event.detail;
    switch (position) {
      case 'left':
      case 'cell':
        instance.close();
        break;
      case 'right':
        Dialog.confirm({
          message: '确定删除吗？'
        }).then(() => {
          instance.close();
        });
        break;
    }
  },


  notice: function(e){
    var that = this
    var _id = e.currentTarget.dataset._id
    wx.navigateTo({
      url: '../notice/notice?_id=' + _id,
    })
  },

  newNotification: function(){
    var that = this
      wx.navigateTo({
        url: '../notice/notice',
      })
      
    
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.showLoading({
      title: '加载中。。。',
    })
    that.setData({
      today: app.globalData.date,
      yesterday: app.globalData.yesterday
    });
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
        if (that.data.percent >= 70) {
          return
        }
        that.setData({ percent: that.data.percent + 10 });
        loading_timer();
      }, 100);
    }
    loading_timer();


    wx.cloud.callFunction({
      name: 'accessDB',
      // 传给云函数的参数
      data: {
        action: "get_notification",
        lessonName: app.globalData.classDetail.lessonName,
        classId: app.globalData.classDetail.classId,
        openid: app.globalData.openid
      },
      success: res => {
        that.setData({
          percent: 100,
          loading: false,
          viewShow: true
        });
        wx.hideLoading();
        that.setData({
          notificationList: res.result.data
        });
        console.log(res)
        //that.onShow();
      },
      fail: res => {
        console.log(res)
        //console.log("fail to get notifications!")
        wx.hideLoading();
      }
    })
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