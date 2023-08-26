// pages/join/join.js
var app = getApp();
const db = wx.cloud.database();
const cmd = db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lessonName: "",
    classID: "",
    isDisabled: true,
  },

  onChange_lessonName: function (e) {
    var that = this
    that.setData({
      lessonName: e.detail
    });
    if (that.data.lessonName != "" && that.data.classID != "") {
      var that = this
      that.setData({
        isDisabled: false
      });
    } else {
      var that = this
      that.setData({
        isDisabled: true
      });
    }
  },

  onChange_classID: function (e) {
    var that = this
    that.setData({
      classID: e.detail
    });
    if (that.data.lessonName != "" && that.data.classID != "") {
      var that = this
      that.setData({
        isDisabled: false
      });
    } else {
      var that = this
      that.setData({
        isDisabled: true
      });
    }
  },

  onAlert: function(){
    var that = this
    if(that.data.isDisabled == true){
      wx.showToast({
        title: '请填写完整 !',
        image: '../../images/shibai.png'
      })
    }
  },
  onClick: function(){
    var that = this
    var pages = getCurrentPages()
    var beforePage = pages[pages.length-2]

    //查看个人信息是否完善
    if(!app.globalData.profile){
      console.log("studentInfo is none")
      wx.showToast({
        title: '请完善个人信息!',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '正在查询...',
    })

    db.collection("class").where({
      lessonName: that.data.lessonName,
      classId: that.data.classID
    }).limit(100).get().then(res => {
      if(res.data.length == 0){ //查询不到该班级,函数返回
        console.log("result is none!"),
        wx.hideLoading();
        wx.showToast({
          title: '未查询到结果',
          image: '../../images/shibai.png'
        })
        return
      }
      var _id = res.data[0]._id // 若查询到班级则取到该条信息的_id,以便进行更新操作
      wx.showLoading({
        title: '正在加入班级...',
      })

      db.collection("class").where({
        lessonName: that.data.lessonName,
        classId: that.data.classID,
        "students.openid": app.globalData.openid
      }).limit(100).get().then(res => {
        console.log(res.data.length)
        if (res.data.length > 0){
          console.log("你已在班级中，无需重复加入")
          wx.hideLoading();
          wx.showToast({
            title: '你已在班级 !',
            image: '../../images/shibai.png'
          });
          return
        }
         
        wx.cloud.callFunction({
          // 云函数名称
          name: 'accessDB',
          // 传给云函数的参数
          data: {
            action: "update_class_join",
            _id: _id,
            openid: app.globalData.openid,
            userAvatarUrl: app.globalData.userAvatarUrl,
            sname: app.globalData.profile.sname,
            sno: app.globalData.profile.sno
          },
          success: function (res) {
            console.log(res)
            wx.hideLoading();
            wx.showToast({
              title: '加入班级成功 !',
            });
            setTimeout(function () {
              wx.navigateBack({
                success: function () {
                  beforePage.onReady();
                }
              })
            }, 1500)
          },
          fail: console.error
        }) 

      }).catch(err => {
        
      }); 
      

    }).catch(err =>{
      console.log("search error!"),
      wx.hideLoading();
        wx.showToast({
          title: '未查询到结果',
          image: '../../images/shibai.png'
        })
    }
    ); 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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