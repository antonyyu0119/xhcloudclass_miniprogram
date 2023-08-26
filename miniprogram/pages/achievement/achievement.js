// pages/achievement/achievement.js
const db = wx.cloud.database();
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

    identity: '',
    today: '',
    yesterday: '',
    achievementList: [],
    totalAchievements: 0,
    userAvatarUrl: '',
    sname: '',
    sno: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      identity: app.globalData.identity,
      today: app.globalData.date,
      yesterday: app.globalData.yesterday,
      userAvatarUrl: '../../images/touxiang.png',
      sname: app.globalData.profile.sname,
      sno: app.globalData.profile.sno
    })


    const con = {
      lessonName: app.globalData.classDetail.lessonName,
      classId: app.globalData.classDetail.classId
    }
    if (app.globalData.identity == 'student') {
      con._openid = app.globalData.openid
    }
    //获取成绩记录
    wx.cloud.callFunction({
      name: 'accessDB',
      data: {
        action: 'get_achievement_all',
        con
      },
      success: res => {
        var total = 0
        //console.log(res)
        if (res.result.data.length > 0) {
          const list = [...res.result.data]
          for (const item of list) {
            total += item.score
          }
          this.setData({
            achievementList: list,
            totalAchievements: total
          })
        }
        
      },
      fail: err => {console.log(err)}
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