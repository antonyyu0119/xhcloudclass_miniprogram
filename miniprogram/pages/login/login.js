// pages/login/login.js
var app = getApp();
const db = wx.cloud.database();
const cmd = db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    username: "",
    password: "",
    isDisabled: true,
  },

  onChange_username: function (e) {
    var that = this
    that.setData({
      username: e.detail
    });
    if (that.data.username != "" && that.data.password != "") {
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

  onChange_password: function (e) {
    var that = this
    that.setData({
      password: e.detail
    });
    if (that.data.username != "" && that.data.password != "") {
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

  onAlert: function () {
    var that = this
    if (that.data.isDisabled == true) {
      wx.showToast({
        title: '请填写完整 !',
        image: '../../images/shibai.png'
      })
    }
  },
  checkAcount: function () {
    var that = this
    var password = app.encodeMD5(that.data.password);
    db.collection("instructorInfo").where({
      username: that.data.username,
    }).get().then(res1 => {
      if (res1.data.length == 0) { //查询不到,函数返回
        console.log("result is none!"),
          wx.showToast({
            title: '用户名不存在',
            image: '../../images/shibai.png'
          })
        return
      }else if(password != res1.data[0].password){
        wx.showToast({
          title: '密码错误 !',
          image: '../../images/shibai.png'
        })
        return
      }else{
        console.log(res1.data);
        wx.showLoading({
          title: '正在登录...'
        });
        try {
          wx.setStorage({
            key: 'openid',
            data: that.data.openid,
            success: res => {
              wx.setStorage({
                key: 'identity',
                data: 'instructor',
                success: res => {
                  wx.redirectTo({
                    url: '../instructor/instructor',
                    success: res2 => {
                      app.globalData.openid = res1.data[0]._openid;
                      app.globalData.identity = 'instructor'
                      wx.hideLoading();
                    }
                  })
                },
                fail: res => {
                  wx.showToast({
                    title: '系统错误!',
                    image: '../../images/shibai.png'
                  })
                }
              });

            }
          });

        } catch (e) {
        }
        
      } 
    }
    );
  },

  onClick: function (e) {
    var that = this
    //获取到用户的信息了，打印到控制台上看下
    if (e.detail.userInfo) {
      wx.showToast({
        title: '授权成功！',
      })
      console.log("用户的信息如下：");
      console.log(e.detail.userInfo);
      app.globalData.userNickName = e.detail.userInfo.nickName;
      app.globalData.userAvatarUrl = e.detail.userInfo.avatarUrl;
      wx.cloud.callFunction({
        name: "login"
      }).then(res => {
        console.log(res.result.openid)
        that.setData({
          openid: res.result.openid
        })
        that.checkAcount();
      }).catch(err => {
        console.log(err)
      });
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          // 用户没有授权成功
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  },

  gotoSignup: function(){
    wx.navigateTo({
      url: '../signup/signup',
    })
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