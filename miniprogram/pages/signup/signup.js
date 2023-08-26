// pages/signup/signup.js
const db = wx.cloud.database();
const cmd = db.command;
var app = getApp();
const ErrorMessage1 = '❌密码须8~16位且是数字和字母的组合';
const ErrorMessage2 = '密码不一致';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: "",
    password: "",
    _password: "",
    errorMessage1: '',
    errorMessage2: '',
    name: "",
    school: "",
    department: "",
    isDisabled: true,
    over: ""

  },

  onChange_username: function (e) {
    var that = this
    that.setData({
      username: e.detail
    });
    if (that.data.username != "" && that.data.password != "" && that.data._password != "" && that.data.name != "" && that.data.school != "" && that.data.department != "") {
      that.setData({
        isDisabled: false
      });
    } else {
      that.setData({
        isDisabled: true
      });
    }
  },

  onChange_password: function (e) {
    var that = this
    that.setData({
      password: e.detail
    });
    if (that.data.username != "" && that.data.password != "" && that.data._password != "" && that.data.name != "" && that.data.school != "" && that.data.department != "") {
      that.setData({
        isDisabled: false
      });
    } else {
      that.setData({
        isDisabled: true
      });
    }
  },

  onChange__password: function (e) {
    var that = this
    that.setData({
      _password: e.detail
    });
    if (that.data.username != "" && that.data.password != "" && that.data._password != "" && that.data.name != "" && that.data.school != "" && that.data.department != "") {
      that.setData({
        isDisabled: false
      });
    } else {
      that.setData({
        isDisabled: true
      });
    }
  },

  onCheck: function(e){
    var that = this
    //正则表达式密码校验
    var standard = /^(?!\d+$)(?![a-zA-Z]+$)[a-z0-9A-Z]{8,16}$/
    if(e.detail.value == ''){
      that.setData({
        errorMessage1: '密码不能为空'
      })
      return
    }
    if(!standard.test(e.detail.value)){
      that.setData({
        errorMessage1: ErrorMessage1
      })
    }else{
      that.setData({
        errorMessage1: ''
      })
    }
  },

  onRecheck: function(e){
    var that = this
    if(that.data.password == ''){
      that.setData({
        errorMessage1: '密码不能为空'
      })
      return
    }
    if(that.data.password != that.data._password){
      that.setData({
        errorMessage2: ErrorMessage2
      })
    }else{
      that.setData({
        errorMessage2: ''
      })
    }
  },

  onChange_name: function (e) {
    var that = this
    that.setData({
      name: e.detail
    });
    if (that.data.username != "" && that.data.password != "" && that.data._password != "" && that.data.name != "" && that.data.school != "" && that.data.department != "") {
      that.setData({
        isDisabled: false
      });
    } else {
      that.setData({
        isDisabled: true
      });
    }
  },

  onChange_school: function (e) {
    var that = this
    that.setData({
      school: e.detail
    });
    if (that.data.username != "" && that.data.password != "" && that.data._password != "" && that.data.name != "" && that.data.school != "" && that.data.department != "") {
      that.setData({
        isDisabled: false
      });
    } else {
      that.setData({
        isDisabled: true
      });
    }
  },

  onChange_department: function (e) {
    var that = this
    that.setData({
      department: e.detail
    });
    if (that.data.username != "" && that.data.password != "" && that.data._password != "" && that.data.name != "" && that.data.school != "" && that.data.department != "") {
      that.setData({
        isDisabled: false
      });
    } else {
      that.setData({
        isDisabled: true
      });
    }
  },

  onAlert: function () {
    var that = this
    if (that.data.isDisabled == true) {
      wx.showToast({
        title: '请不要漏填 !',
        image: '../../images/shibai.png'
      })
    }
  },

  onClick: function (e) {
    var that = this
    wx.showLoading({
      title: '操作中....',
    });
    that.checkAcount();
        
  },

  checkAcount: function(){
    var that = this
    db.collection("instructorInfo").where({
      username: that.data.username
    }).limit(1000).get().then(res => {
      if(res.data.length > 0){
        that.setData({
          over: true
        });
        wx.hideLoading();
        wx.showToast({
          title: '用户名已被占用!',
          image: '../../images/shibai.png'
        })
      } else if (that.data.password != that.data._password){
        wx.hideLoading();
        wx.showToast({
          title: '两次密码不一致!',
          image: '../../images/shibai.png'
        })
      } else {
        //that.bindGetUserInfo(event);
        db.collection("instructorInfo").add({
        data: {
          username: that.data.username,
          password: app.encodeMD5(that.data.password),
          name: that.data.name,
          school: that.data.school,
          department: that.data.department
        }
      }).then(res => {
        wx.hideLoading();
        wx.showToast({
          title: '注册成功 !',
        })
        console.log("注册成功！")
      })
      }
    }).catch(err =>{});
    
    
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