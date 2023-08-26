// pages/activity/activity.js
const db = wx.cloud.database();
const cmd = db.command;
var app = getApp();
var date = new Date();
var timer_call
var timeout
Page({

  /**
   * 页面的初始数据
   */
  data: {
    background: ['../../images/banner_img1.png', '../../images/banner_img2.png','../../images/banner_img3.png'],
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 500,

    watcher: '',

    studentList: [],
    lessonName: '',

    //发言室组件参数
    identity: '',
    condition: {},
    classInfo: {},
    profile: {},
    dateObj: {},
    //发言室开关
    isOpen: false,

    avatarUrl: "../../images/touxiang.png",
    sname: "",
    show: false,
    showSpeeches: false,

    showHistory: false,
    label: "点名历史",
    calltheRoll: false,
    calltheRollList: []
  },



  changeIndicatorDots() {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    })
  },

  changeAutoplay() {
    this.setData({
      autoplay: !this.data.autoplay
    })
  },

  intervalChange(e) {
    this.setData({
      interval: e.detail.value
    })
  },

  durationChange(e) {
    this.setData({
      duration: e.detail.value
    })
  },

  achievement(){
    wx.navigateTo({
      url: '../achievement/achievement',
    })
  },

  signinInfo: function(){
    var that = this
    wx.navigateTo({
      url: '../signinInfo/signinInfo',
    })
  },
  
  onSpeech: function(){
    var that = this
    that.setData({
      showSpeeches: true
    }); 
    
  },

  setOpenTrue: function(){
    this.setData({
      isOpen: true
    })
  },

  setOpenFalse:function(){
    this.setData({
      isOpen: false
    })
  },
  
  popup: function () {
    var that = this
    that.setData({ 
      show: true,
      watcher: db.collection("class").where({
        lessonName: app.globalData.classDetail.lessonName,
        classId: app.globalData.classDetail.classId
      }).watch({
        onChange: function (snapshot){
          console.log('监听', snapshot)
          console.log(snapshot.docs)
          that.setData({
            calltheRollList: snapshot.docs[0].calltheRollList,
            sname: snapshot.docs[0].calltheRollList[snapshot.docs[0].calltheRollList.length - 1].sname,
            avatarUrl: snapshot.docs[0].calltheRollList[snapshot.docs[0].calltheRollList.length - 1].avatarUrl,
            calltheRoll: true
          });
          
        },
        onError: function (err){
          console.error('the watch closed because of error', err)
        }
      })
    });
    
  },

  showHistory: function(){
    if (this.data.showHistory == true){
      this.setData({
        showHistory: false,
        label: "点名历史"
      });
      return
    }
    this.setData({
      showHistory: true,
      label: "返回"
    });
  },

  onClose: function () {
    var that = this
    that.setData({showSpeeches: false})
    if (that.data.calltheRoll == true) {
      that.setData({
        show: false,
      });
    } else {
      clearInterval(timer_call)
      clearTimeout(timeout)
      that.setData({
        show: false,
        calltheRoll: false,
        avatarUrl: "../../images/touxiang.png",
        sname: "",
      });
    }
    this.setData({onDestroy: this.closeWatch})
    this.closeWatch();
    
  },

  closeWatch(){
    if(this.data.watcher){
      this.data.watcher.close().then(res => {
        console.log("点名监听关闭！")
      }).catch(console.error)
    }
    
  },

  calltheRoll: function () {
    var that = this
    clearInterval(timer_call)
    clearTimeout(timeout)
    that.setData({ calltheRoll: false });
    var studentList = that.data.studentList
    var i = Math.ceil(Math.random() * (studentList.length - 1))
    console.log(i);
    var delay = Math.ceil(Math.random() * 10);
    console.log(delay);
    timer_call = setInterval(function () {
      console.log(studentList[i].sname);
      that.setData({
        avatarUrl: studentList[i].userAvatarUrl,
        sname: studentList[i].sname
      });
      i++
      if (i == studentList.length) {
        i = 0
      }
    }, 100)
    timeout = setTimeout(function () {
      clearInterval(timer_call)
      that.setData({
        calltheRoll: true
      });
      
      db.collection("class").doc(app.globalData.classDetail._id).update({
        data:{
          calltheRollList: cmd.push([{ sname: that.data.sname, avatarUrl: that.data.avatarUrl}])
        }
      }).then(res => {
        //that.showCalltheRollList();
      }).catch(err => {
        console.error
      });
      
    }, delay * 1000)
  },
 

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    this.setData({
      identity: app.globalData.identity,
      lessonName: app.globalData.classDetail.lessonName + ' ' + app.globalData.classDetail.className,
      studentList: app.globalData.classDetail.students,
      classInfo: app.globalData.classDetail,
      profile: app.globalData.profile,
      condition: {
        classId: app.globalData.classDetail.classId,
        lessonName: app.globalData.classDetail.lessonName
        /* date: app.globalData.date */
      },
      dateObj: {
        today: app.globalData.date,
        yesterday: app.globalData.yesterday
      }
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
    var that = this
    //clearInterval(that.data.timer)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    /*wx.showNavigationBarLoading()
    this.onShow()
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新

    }, 1500);*/
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