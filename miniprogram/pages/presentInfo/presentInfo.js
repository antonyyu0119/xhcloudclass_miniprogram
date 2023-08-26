// pages/presentInfo/presentInfo.js
const db = wx.cloud.database();
const cmd = db.command;
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    today: '',
    yesterday: '',
    date: '',
    time: '',
    lessonName: '',
    className: '',

    duration: 20,
    percent: 0,
    loading: true,
    viewShow: false,

    presentNum: "",
    absentNum: "",
    askforNum: "",
    studentList: []
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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

    that.setData({
      studentList: app.globalData.classDetail.students,
      absentNum: app.globalData.classDetail.students.length
    });
    
    db.collection("signin").where({
      _id: options._id
    }).get().then(res => {
      console.log(res.data[0])
      that.setData({
        today: app.globalData.date,
        yesterday: app.globalData.yesterday,
        date: res.data[0].date,
        time: res.data[0].time || '',
        lessonName: res.data[0].lessonName,
        className: res.data[0].className || ''
      })
      //console.log(res.data[0].students)
      if (res.data[0].students.length == 0) {
        that.setData({
          duration: 5,
          percent: 100,
          loading: false,
          viewShow: true
        });
        return
        
      }
      const data = app.setPresentData(res.data[0].students);
      that.setData({
        presentNum: data.presentNum,
        absentNum: data.absentNum,
        askforNum: data.askforNum,
        studentList: data.presentArray,
        duration: 5,
        percent: 100,
        loading: false,
        viewShow: true
      });
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