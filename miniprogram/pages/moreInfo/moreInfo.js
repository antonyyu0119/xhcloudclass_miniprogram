// pages/moreInfo/moreInfo.js
var app = getApp();
const db = wx.cloud.database();
const cmd = db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {

    userAvatarUrl:"",
    studentInfo: "",
    identity: '',
    openid: ''
  },

  onChat: function(e){
    wx.navigateTo({
      url: '../chat/chat?target=' + this.data.openid + '&name=' + this.data.studentInfo.sname,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this 
    db.collection("studentInfo").where({
      _openid: options.openid
    }).get().then(res=>{
      var obj = res.data[0]
      that.setData({
        userAvatarUrl: options.userAvatarUrl,
        studentInfo: obj,
        identity: app.globalData.identity,
        openid: options.openid
      });
      console.log(that.data.studentInfo)
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