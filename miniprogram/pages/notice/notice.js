// pages/notice/notice.js
var app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "",
    isSend: false,

    isShow: true,
    text: '',
    readed: '',
    index: 0,
    chooseList: [],
    chooseNum: '',
    target: ''
  },

  onInput: function(e){
    var that = this
    that.setData({
      text: e.detail.value
    });
  },

  onChoose: function(e){
    var that = this
    that.setData({
      index: e.currentTarget.dataset.index
    });
    if (e.currentTarget.dataset.index == 1){
      wx.showLoading({
        title: '跳转中。。。',
      })
      that.toStudentInfo('onChoose');
    }
  },

  toStudentInfo: function(action){
    wx.navigateTo({
      url: '../studentInfo/studentInfo?action=' + action,
      success: res => {
        wx.hideLoading();
      },
      fail: res => {
        wx.hideLoading();
      }
    })
  },

  getTarget: function(){
    var that = this
    console.log(that.data.chooseList);
    that.toStudentInfo('getTarget');
  },

  //发送通知
  onClick: function(){
    var that = this
    if(app.globalData.classDetail.students.length == 0){
      wx.showModal({
        title: '错误提示',
        content: '搜索不到学生，请检查班级是否有学生！',
        showCancel: false
      })
      return false
    }else{
      if (that.data.text != '') {
        that.setData({
          isDisabled: true
        });
        var time = app.getTime();
        const doc = {
          lessonName: app.globalData.classDetail.lessonName,
          classId: app.globalData.classDetail.classId,
          target: that.data.index == 0 ?'全体学生' : that.data.chooseList,
          text: that.data.text,
          time: time.formatTime,
          date: app.globalData.date,
          order: time.order,
          readed: 0
        }
        db.collection("notice").add({
          data: doc
        }).then(res => {
          console.log(res)
          wx.showToast({
            title: '发送成功！',
            success: async res1 => {
              //通知已发送
              that.setData({isSend: true})

              //发送通知消息
              await app.sendNotification("notice", that.data.index == 0 ? app.globalData.classDetail.students : that.data.chooseList, res._id, app.globalData.classDetail.lessonName + app.globalData.classDetail.tname, 'success', time);

              //清除缓存
              await app.removeStorage(app.globalData.classDetail.classId + '_notice')

              await app.removeStorage(app.globalData.classDetail.classId + '_stu_chooseList')
    
              //返回页面
              setTimeout(function(){
                wx.navigateBack();
              },1000)
              
            }
          })
        }).catch(err1 => {
          console.log(err1)
        });
      } else {
        wx.showModal({
          title: '警告',
          content: '通知内容不能为空！',
          showCancel: false
        })
      }
    }
    
  },

  getStorage: function(){
    var that = this
    wx.getStorage({
      key: app.globalData.classDetail.classId + '_notice',
      success: function (res) {
        console.log(res.data)
        that.setData({ text: res.data });
      },
      fail: res => {
        console.log('no text data!')
      }
    });

    wx.getStorage({
      key: app.globalData.classDetail.classId + '_stu_chooseList',
      success: function (res) {
        console.log(res.data)
        that.setData({
          index: 1,
          chooseList: res.data,
          chooseNum: that.formatName(res.data)
        })
        
      },
      fail: res => {
        that.setData({ index: 0 });
        console.log('no chooseList data!')
      }
    });
  },

  formatName: function(list){
    var that = this
    console.log(Object.prototype.toString.call(list))
    if (Object.prototype.toString.call(list) == '[object Array]'){
      if (list.length > 1) {
        return list[0].sname + '、' + list[1].sname + '等 ' + list.length + ' 人'
      } else {
        return list[0].sname
      }
    }else{
      return list
    }
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    if(options._id){
      console.log(options._id)
      db.collection("notice").where({
        _id: options._id
      }).get().then(res=>{
        console.log(res.data[0]);
        var data = res.data[0]
        app.globalData.chooseList = data.target
        that.setData({
          text: data.text,
          readed: data.readed ?data.readed :'',
          isSend: true,
          target: data.target ?that.formatName(data.target) :'',
        })
      })
    }else{//编辑一条新通知
      that.getStorage();
    }
    if(app.globalData.identity == 'teacher'){
      that.setData({title: '编辑通知:'})
    } else if (app.globalData.identity == 'student'){
      that.setData({ 
        title: '通知:',
        isShow: false 
      })
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
    //清除发送目标学生列表
    app.globalData.chooseList = null
    //若是未发送的通知且有内容，则放入缓存
    if (!that.data.isSend){
      if (that.data.text != ''){
        wx.setStorage({
          key: app.globalData.classDetail.classId + '_notice',
          data: that.data.text,
          success: res => {
          }
        });
        return
      }
      //若没有内容则清除缓存
      app.removeStorage(app.globalData.classDetail.classId + '_notice');
    }
    
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