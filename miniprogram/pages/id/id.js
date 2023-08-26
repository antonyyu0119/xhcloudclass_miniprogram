// pages/id/id.js
var app  = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {

    show: "",
    platform: ""
    
  },

  
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.setData({
      platform: app.globalData.platform
    });
    db.collection("location").where({
      _openid: app.globalData.openid
    }).get().then(res => {
      that.setData({
        show: true
      })
    }).catch(err => {
      that.setData({
        show: false
      })
    })

    /* if(app.globalData.identity == "student"){
      db.collection("studentInfo").where({
        _openid: app.globalData.openid
      }).get().then(res => {
        if (res.data.length > 0) {
          that.setData({
            show: true
          });
          return
        }
        return
      }).catch(console.error)
    }else if (app.globalData.identity == "teacher"){
      db.collection("teacherInfo").where({
        _openid: app.globalData.openid
      }).get().then(res => {
        if (res.data.length > 0) {
          that.setData({
            show: true
          });
          return
        }
        return
      }).catch(console.error)
    } */
    
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