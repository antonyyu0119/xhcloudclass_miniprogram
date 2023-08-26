// pages/askfor/askfor.js
const db = wx.cloud.database();
const cmd = db.command;
var app = getApp();

const times = {
  '周一': ['上午', '下午', ],
  '周二': [],
  '周三': [],
  '周四': [],
  '周五': [],
  '周六': [],
  '周日': [],
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
    unReadList: [],
    readList: [],
    active: 0,
    newHistory: "",
    show: false,

    sname: "", 
    sno: "",
    school: "",
    department: "",
    instructor: "",
    startTime: "",
    finishTime: "",
    reason: "",

    show_time: false,
    discover: true,
    time_index: "",
    columns_time: [
      {
        values: Object.keys(times),
        className: 'column1'
      },
      {
        values: times['周一'],
        className: 'column2'
      }
      ],
  },

  
  addAskfor: function(){
    var that = this 
    that.setData({
      show: true
    });
  },

  onChange_sname: function (e) {
    var that = this
    that.setData({
      sname: e.detail
    });
  },  
  onChange_sno: function (e) {
    var that = this
    that.setData({
      sno: e.detail
    });
  }, 
  onChange_school: function (e) {
    var that = this
    that.setData({
      school: e.detail
    });
  }, 
  onChange_department: function (e) {
    var that = this
    that.setData({
      department: e.detail
    });
  }, 
  onChange_instructor: function (e) {
    var that = this
    that.setData({
      instructor: e.detail
    });
  }, 
  onInput: function(e){
    var that = this
    that.setData({
      reason: e.detail.value
    });
  },
  

  chooseTime1: function () {
    var that = this
    that.setData({
      show_time: true,
      discover: false,
      time_index: 0
    });
  },

  chooseTime2: function () {
    var that = this
    that.setData({
      show_time: true,
      discover: false,
      time_index: 1
    });
  },

  closeTime: function(){
    var that = this
    that.setData({ 
      show_time: false,
      discover: true,
     });
  },

  onConfirm_time: function(event){
    const { picker, value, index } = event.detail;
    console.log(event.detail.value)
    var that = this
    if(that.data.time_index == 0){
      that.setData({
        show_time: false,
        discover: true,
        startTime: event.detail.value[0] + event.detail.value[1]
      });
    }else if(that.data.time_index == 1){
      that.setData({
        show_time: false,
        discover: true,
        finishTime: event.detail.value[0] + event.detail.value[1]
      });
    }
    
  },
  
  onClose: function(){
    var that = this
    that.setData({ show: false });
  },

  onSubmit: function(){
    var that = this
    if (that.data.sname == "" || that.data.sno == "" || that.data.school == "" || that.data.department == "" || that.data.instructor == "" || that.data.startTime == "" || that.data.finishTime == "" || that.data.reason == ""){
      wx.showToast({
        title: '请填写完整 !',
        image: '../../images/shibai.png'
      })
      return
    }
    wx.showModal({
      title: '确认提交',
      content: '检查信息无误，准备提交？',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          var time = app.getTime();
          db.collection("askfor").add({
            data: {
              sname: that.data.sname,
              sno: that.data.sno,
              school: that.data.school,
              department: that.data.department,
              instructor: that.data.instructor,
              time: that.data.startTime+"至"+that.data.finishTime,
              reason: that.data.reason,
              hasRead: "未读",
              isApprove: "",
              date: app.globalData.date,
              sendTime: time.formatTime,
              order: time.order,
              flag: 1
            }
          }).then(res => {
            wx.showToast({
              title: '提交成功 !',
            })
            that.onShow();
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },


  revoke: function(e){
    var that = this
    console.log(e.currentTarget.dataset.revoke_id)
    var _id = e.currentTarget.dataset.revoke_id
    wx.showModal({
      title: '确认撤销',
      content: '是否确认撤销该请假信息',
      success(res){
        if(res.confirm){
          db.collection("askfor").doc(_id).remove().then(res => {
            wx.showToast({
              title: '撤销成功 !',
            })
            setTimeout(function () { that.onShow() }, 1500)
          })
        }
        else if(res.cancel){
          console.log("用户点击取消")
        }
      }
    })
    
  },

  askforInfo: function(e){
    var that = this
    console.log(e.currentTarget.dataset._id)
    var _id = e.currentTarget.dataset._id
    wx.navigateTo({
      url: '../askforInfo/askforInfo?_id=' + _id + '&&identity=student',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.globalData)
    var that = this
    if(app.globalData.profile){
      that.setData({
        sname: app.globalData.profile.sname,
        sno: app.globalData.profile.sno,
        school: app.globalData.profile.sschool
      });
    }
    

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
    var newHistory = 0
    db.collection("askfor").where({
      _openid: app.globalData.openid,
      hasRead: "未读"
    }).orderBy("order", "desc").get().then(res => {
      var newArray1 = res.data
      that.setData({
        unReadList: newArray1
      });
    }).catch(err => { });
    db.collection("askfor").where({
      _openid: app.globalData.openid,
      hasRead: "已读"
    }).orderBy("order", "desc").get().then(res => {
      var newArray2 = res.data
      for (var i = 0; i < newArray2.length; i++) {
        if (newArray2[i].flag == 1) {
          newHistory++
        }
      }
      if (newHistory == 0) { newHistory = "" }
      that.setData({
        newHistory: newHistory,
        readList: newArray2
      });
    }).catch(err => { });
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