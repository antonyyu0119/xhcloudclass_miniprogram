// pages/present/present.js
var app = getApp();
const db = wx.cloud.database();
var cmd = db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    today: '',
    yesterday: '',

    signinList: [],
    lessonName: "",
    tname: ""
  },

  getPresentList: function(){
    var that = this
    wx.showLoading({
      title: '获取中。。。',
    })
    db.collection('signin').where({
      lessonName: app.globalData.classDetail.lessonName,
      classId: app.globalData.classDetail.classId
    }).orderBy("order","desc").skip(that.data.signinList.length).limit(10).get().then(res => {
      if(res.data.length == 0){
        wx.hideLoading();
        wx.showToast({
          title: '已经到到底了~~',
          duration: 500
        });
        return
      }
      that.setData({
        signinList: that.data.signinList.concat(res.data)
      });
      wx.hideLoading();
    }).catch(console.error)

  },

  showMore: function(e){
    var that = this
    console.log(e.currentTarget.dataset._id)
    var _id = e.currentTarget.dataset._id
    wx.navigateTo({
      url: '../presentInfo/presentInfo?_id=' + _id,
    })
  },

  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.setData({
      today: app.globalData.date,
      yesterday: app.globalData.yesterday
    })
    that.getPresentList();

    


    /*wx.cloud.callFunction({
      name: 'accessDB',
      data: {
        action: 'show_signin_teacher',
        lessonName: app.globalData.classDetail.lessonName,
        classId: app.globalData.classDetail.classId
      },
      success: function (res) {
        //that.order(res.result.data);
        that.setData({
          lessonName: app.globalData.classDetail.lessonName,
          tname: app.globalData.classDetail.tname,
          signinList: res.result.data
        });
      }
    });*/
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
    this.getPresentList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})