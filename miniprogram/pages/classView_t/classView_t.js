// pages/classView_t/classView_t.js
var app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    watcher: '',

    classDetail: '',
    studentNum: 0,
    studentList: [],
    avatarUrl: "",
    sname: ""
  },

  copy: function(e){
    var that = this
    wx.setClipboardData({
      data: that.data.classDetail.classId,
    })
    wx.showToast({
      title: '复制成功 !',
    })
  },

  activity: function(e){
    wx.navigateTo({
      url: '../activity/activity'
    })
  },

  sendNotification:function(){

    db.collection("location").where({
      _openid: app.globalData.openid
    }).get().then( res => {
      if (res.data.length > 0) {
        wx.navigateTo({
          url: '../sendNotification/sendNotification',
        })
        return
      }
      wx.navigateTo({
        url: '../sendNotification/sendNotification',
      })
      return
    }).catch(err => {
      wx.showModal({
        title: "敬请期待",
        showCancel: false
      })
      return
    });

    /* db.collection("teacherInfo").where({
      _openid: app.globalData.openid
    }).get().then(res => {
      if (res.data.length > 0) {
        wx.navigateTo({
          url: '../sendNotification/sendNotification',
        })
        return
      }
      return
    }).catch(console.error) */
    
  },

  onChat: function(){
    /* wx.showModal({
      title: '敬请期待~',
      content: '程序猿们正在加紧测试私信功能哦~ 不要着急~ 不要着急~',
      showCancel: false
    }) */
    wx.navigateTo({
      url: '../studentInfo/studentInfo?action=onChat',
    })
  },

  studentInfo: function(){
    wx.navigateTo({
      url: '../studentInfo/studentInfo',
    })
  },


  deleteClass: function(){
    
    var that = this
    var pages = getCurrentPages()
    var beforePage = pages[pages.length - 2]
    wx.showModal({
      title: '确认删除',
      content: '是否确认删除该班级？此操作将无法恢复！',
      success: function(res){
        if(res.confirm){
          wx.showLoading({
            title: '正在删除。。。',
          })
          db.collection("class").where({
            lessonName: app.globalData.classDetail.lessonName,
            classId: app.globalData.classDetail.classId,
            tname: app.globalData.classDetail.tname
          }).get().then(res1 => {
            that.data.watcher.close().then(res2 => {
              console.log("监听关闭!")
              var _id = res1.data[0]._id
              db.collection("class").doc(_id).remove().then(res3 => {
                wx.hideLoading();
                wx.showToast({
                  title: '删除成功 !',
                });
                setTimeout(function () {
                  wx.navigateBack({
                    success: function () {
                      beforePage.onReady();
                    }
                  })
                }, 1500)
              });
            });
            
          });
        }else if(res.cancel){
          console.log("用户点击了取消")
        }
      }
    })
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.globalData.classDetail)
    var that = this
    if (app.globalData.classDetail.classWeek == 1){
      var classWeek = "周一"
    } else if (app.globalData.classDetail.classWeek == 2){
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
        className: app.globalData.classDetail.className
      }).watch({
        onChange: function (snapshot) {
          console.log('监听', snapshot.docChanges)
          console.log(snapshot.docs)
          that.setData({
            studentNum: snapshot.docs[0].students.length,
            studentList: snapshot.docs[0].students
          });
          app.globalData.classDetail.students = snapshot.docs[0].students
          console.log("本班人数为：" + snapshot.docs[0].students.length)
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
      console.log("监听关闭!")
    }) */
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    var that = this
    that.data.watcher.close().then(res => {
      console.log("监听关闭!")
    })
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