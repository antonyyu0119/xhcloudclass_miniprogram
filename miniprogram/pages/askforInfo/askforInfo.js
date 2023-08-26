// pages/askforInfo/askforInfo.js
var app = getApp();
const db = wx.cloud.database();
var cmd = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    _id: "",
    target: [],
    identity: "",
    askforInfo:[],
    disabled: "",
    approve: '',
    disapprove: '',

    state: 0,
    show: false,
    radio: '',
    display: false,
    argument: ""
  },

  

  stampOn: function(state){
    var that = this
    if(state == '批准'){
      that.setData({approve: true });
    } else if (state == '驳回'){
      that.setData({ disapprove: true });
    }
  },

  approve: function(e){
    var pages = getCurrentPages();
    var beforePage = pages[pages.length - 2];
    var that = this
    wx.showModal({
      title: '提示',
      content: '确认批准该假条？',
      success: res =>{
        if(res.confirm){
          //that.setData({ disabled: true });
          wx.showLoading({
            title: '操作中...',
          })
          wx.cloud.callFunction({
            name: 'accessDB',
            // 传给云函数的参数
            data: {
              action: "askfor_isApprove_instructor",
              _id: that.data._id,
              choice: "approve",
              openid: app.globalData.openid
            },
            success: function (res) {
              app.sendNotification("askforInfo", that.data.target, that.data._id, "辅导员", "批准");
              that.stampOn("批准");
            },
            fail: res => {
              wx.hideLoading();
              wx.showToast({
                title: '操作失败',
                icon: '../../images/shibai.png'
              })
              that.setData({ disabled: false });
            }
          });
        }
        if(res.cancel){
          console.log("用户点击了取消!")
        }
      },
      fail: res => {
        wx.hideLoading();
        wx.showToast({
          title: '操作失败',
          icon: '../../images/shibai.png'
        })
        that.setData({ disabled: false });
      }
    })
    
  },

  disapprove: function(){
    var that = this
    that.setData({ show: true });
  },

  showArgu: function(){
    var that = this
    that.setData({ show: true });
  },

  submit: function(){
    var that = this
    if(that.data.radio == '' || (that.data.radio == '其他' && that.data.argument == '')){
      wx.showToast({
        title: '内容不能为空!',
        image: '../../images/shibai.png'
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '确认选择无误，准备提交？',
        success: res => {
          if(res.confirm){
            //that.setData({ disabled: true });
            wx.showLoading({
              title: '操作中...',
            })
            wx.cloud.callFunction({
              name: 'accessDB',
              // 传给云函数的参数
              data: {
                action: "askfor_isApprove_instructor",
                _id: that.data._id,
                choice: "disapprove",
                openid: app.globalData.openid,
                radio: that.data.radio,
                argument: that.data.argument
              },
              success: function (res) {
                app.sendNotification("askforInfo", that.data.target, that.data._id, "辅导员", "驳回");
                that.stampOn("驳回");
              },
              fail: res => {
                wx.hideLoading();
                wx.showToast({
                  title: '操作失败',
                  icon: '../../images/shibai.png'
                })
                that.setData({ disabled: false });
              }
            });
          }
          if(res.cancel){
            console.log("用户点击了取消！")
          }
        },
        fail: res => {
          wx.hideLoading();
          wx.showToast({
            title: '操作失败',
            icon: '../../images/shibai.png'
          })
          that.setData({ disabled: false });
        }
      })
    }
  },

  onChange(event) {
    this.setData({
      radio: event.detail
    });
    if(event.detail == '其他'){
      this.setData({
        display: true
      });
    }else{
      this.setData({
        display: false
      });
    }
  },

  onClose: function(){
    this.setData({show: false})
  },

  onGet: function(event){
    var that = this
    console.log(event.detail.value);
    that.setData({
      argument: event.detail.value
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.identity)
    console.log(options._id)
    var that = this
    //var pages = getCurrentPages();
    //var beforePage = pages[pages.length - 2];
    that.setData({ _id: options._id});
    wx.showLoading({
      title: '加载中。。。',
    })
    db.collection("askfor").where({
      _id: options._id
    }).get().then(res =>{
      console.log(res.data[0])
      var newArray = []
      newArray = [{
        openid: res.data[0]._openid
      }]
      if (res.data[0].isApprove == 'approve'){
        that.setData({ approve: true});
      } else if (res.data[0].isApprove == 'disapprove'){
        that.setData({ 
          disabled: true,
          disapprove: true,
          radio: res.data[0].radio,
          argument: res.data[0].argument
         });
         if(res.data[0].radio == "其他"){
           that.setData({
             display: true
           });
           
         }
      }
      
      that.setData({
        identity: options.identity,
        askforInfo: res.data[0],
        target: newArray
      });
      if(options.identity == "instructor"){
        if (res.data[0].isApprove != ""){
          that.setData({ disabled: true});
        }
        if (res.data[0].hasRead == "未读") {
          wx.cloud.callFunction({
            // 云函数名称
            name: 'accessDB',
            // 传给云函数的参数
            data: {
              action: "askfor_flag_instructor",
              _id: options._id,
              openid: app.globalData.openid
            },
            success: function (res) {
              wx.hideLoading();
            }
          })
        } else { wx.hideLoading();}
      } else if (options.identity == "student"){
        if (res.data[0].hasRead == "已读") {
          db.collection("askfor").doc(options._id).update({
            data: {
              flag: 0
            }
          }).then(res => {
            wx.hideLoading();
          }).catch(err => { console.log(err) })
        } else { wx.hideLoading();}
      }
    }).catch(err =>{})
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