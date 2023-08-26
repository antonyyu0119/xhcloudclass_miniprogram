// pages/classView_s/classView_s.js
var app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    watcher: "",
    
    classDetail: '',
    studentNum: 0,
    studentList: [],
    newStudents: [],
  },

  copy: function (e) {
    var that = this
    wx.setClipboardData({
      data: that.data.classDetail.classId,
    })
    wx.showToast({
      title: '复制成功 !',
    })
  },

  activity: function (e) {
    wx.navigateTo({
      url: '../activity/activity'
    })
  },

  onChat: function () {
    wx.navigateTo({
      url: '../chat/chat?target=' + app.globalData.classDetail._openid + '&name='+ app.globalData.classDetail.tname,
    })
  },

  moreInfo: function(e){
    console.log(e.currentTarget.dataset.openid)
    wx.navigateTo({
      url: '../moreInfo/moreInfo?openid=' + e.currentTarget.dataset.openid + '&userAvatarUrl=' + e.currentTarget.dataset.useravatarurl
    })
  },

  withdraw: function(){
    var that = this
    wx.showModal({
      title: '确认退出',
      content: '是否确认退出该班级',
      success: function(res1){
        if(res1.confirm){
          wx.cloud.callFunction({
            // 云函数名称
            name: 'accessDB',
            // 传给云函数的参数
            data: {
              action: "update_class_withdraw",
              _id: app.globalData.classDetail._id,
              openid: app.globalData.openid
            },
            success: res2 => {
              wx.showToast({
                title: '退出班级成功 !',
              })
              var pages = getCurrentPages()
              var beforePage = pages[pages.length - 2]
              setTimeout(function () {
                wx.navigateBack({
                  success: function () {
                    beforePage.onReady();
                  }
                })
              }, 1500)
            },
            fail: err => {
              console.log(err)
            }
          })
          
        }else{
          console.log("用户点击了取消！")
        }
      }
    });
    
  },

  achievement(){
    wx.navigateTo({
      url: '../achievement/achievement',
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.globalData.classDetail)
    console.log(app.globalData.classDetail.classWeek)
    var that = this
    if (app.globalData.classDetail.classWeek == 1) {
      var classWeek = "周一"
    } else if (app.globalData.classDetail.classWeek == 2) {
      var classWeek = "周二"
    } else if (app.globalData.classDetail.classWeek == 3) {
      var classWeek = "周三"
    } else if (app.globalData.classDetail.classWeek == 4) {
      var classWeek = "周四"
    } else if (app.globalData.classDetail.classWeek == 5) {
      var classWeek = "周五"
    } else if (app.globalData.classDetail.classWeek == 6) {
      var classWeek = "周六"
    } else if (app.globalData.classDetail.classWeek == 7) {
      var classWeek = "周日"
    }
    console.log(app.globalData.classDetail.classId)
    app.globalData.classDetail.classWeek = classWeek
    that.setData({
      classDetail: app.globalData.classDetail
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
    that.setData({
      watcher: db.collection("class").where({
        lessonName: app.globalData.classDetail.lessonName,
        classId: app.globalData.classDetail.classId
      }).watch({
        onChange: function (snapshot) {
          console.log('监听', snapshot.docChanges)
          console.log(snapshot.docs)
          console.log("本班人数为：" + snapshot.docs[0].students.length)
          that.setData({
            studentNum: snapshot.docs[0].students.length,
            studentList: app.sno_order(snapshot.docs[0].students)
          });
          app.globalData.classDetail.students = snapshot.docs[0].students
          //that.order(snapshot.docs[0].students);
        },
        onError: function (err) {
          console.error('the watch closed because of error', err)
        }
      })
    });
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    var that = this
    /* that.data.watcher.close().then(res => {
      console.log("监听关闭！")
    }); */
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    var that = this
    that.data.watcher.close().then(res => {
      console.log("监听关闭！")
    });
    app.globalData.classDetail = null
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