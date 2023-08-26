// pages/start/start.js
const db = wx.cloud.database()
const app = getApp();
var checkNetwork = require("../checkNetwork.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    duration: 30,
    loading: true,
    percent: 0,
    isShow: false
  },


  bindGetUserInfo: function (e) {
    var that = this
    //获取到用户的信息了，打印到控制台上看下
    
    if (e.detail.userInfo) {
      wx.showToast({
        title: '授权成功！',
      })
      console.log("用户的信息如下：");
      console.log(e.detail.userInfo);
      const identity = e.currentTarget.dataset.identity
      wx.cloud.callFunction({
        name: "login"
      }).then(res => {
        console.log(res)
        //app.globalData.openid = res.result.openid
        try {
          wx.setStorage({
            key: 'openid',
            data: res.result.openid,
            success: res => {
              wx.setStorage({
                key: 'identity',
                data: identity,
                success: res => {
                  that.checkAuthorized();
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
          // 用户没有授权成功，不需要改变 isShow 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  },

  checkAuthorized: function () {
    var that = this
    wx.showLoading({
      title: '检查授权信息...',
    })
    let loading_timer;
    loading_timer = () => {
      setTimeout(() => {
        if (that.data.percent >= 80) {
          return
        }
        that.setData({ 
          duration: 10,
          percent: that.data.percent + 10 });
        loading_timer();
      }, 100);
    }
    loading_timer();
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function (res1) {
              console.log(res1.userInfo)
              app.globalData.userNickName = res1.userInfo.nickName;
              app.globalData.userAvatarUrl = res1.userInfo.avatarUrl;
              wx.getStorage({
                key: 'openid',
                success: function(res2) {
                  app.globalData.openid = res2.data
                  wx.getStorage({
                    key: 'identity',
                    success: res3 => {
                      wx.hideLoading();
                      app.globalData.identity = res3.data
                      console.log(res3.data)
                      that.switchTab(res3.data);
                      that.setData({ percent: 98 });
                    }
                  });
                },
                fail: res => {
                  wx.hideLoading();
                  that.setData({
                    percent: 100,
                    isShow: true
                  });
                }
              });
              
              // 用户已经授权过,则第二次登录不需授权，但仍需要登录
              // 根据自己的需求有其他操作再补充
              // 我这里实现的是在用户授权成功后，调用微信的 wx.login 接口，从而获取code
              //wx.login({
              //success: res => {
              // 获取到用户的 code 之后：res.code
              //console.log("用户的code:" + res.code);
              // 可以传给后台，再经过解析获取用户的 openid
              // 或者可以直接使用微信的提供的接口直接获取 openid ，方法如下：
              //wx.request({
              //     // 自行补上自己的 APPID 和 SECRET
              // url:           'https://api.weixin.qq.com/sns/jscode2session?appid=wx884ebccf4138747a&secret=f697806903d5498142bfe6e861ed7b75&js_code=' + res.code + '&grant_type=authorization_code',
              //   success: res => {
              //         // 获取到用户的 openid
              //      console.log("用户的openid:" + res.data.openid);
              //     }
              //   });
              // }
              // });
            }
          });
        } else {
          wx.hideLoading();
          // 用户没有授权
          // 改变 isShow 的值，显示授权页面
          that.setData({
            //loading: false,
            percent: 100,
            isShow: true
          });
        }
      }
    });
  },

  switchTab: function (identity) {
    var that = this
    var identity = identity
    wx.showLoading({
      title: '正在跳转...'
    })
    that.setData({ percent: 100 });
    if (identity == 'teacher') {
      console.log(identity)
      wx.switchTab({
        url: '../class/class',
        success: res => {
          wx.hideLoading();
          app.globalData.identity = "teacher"
          app.globalData.idUrl = "../../images/jiaoshi.png"
          db.collection("teacherInfo").where({
            _openid: app.globalData.openid
          }).get().then(res2 => {
            console.log(res2.data[0])
            if(res2.data.length > 0){
              app.globalData.profile = res2.data[0]
              app.globalData.profile.userAvatarUrl = app.globalData.userAvatarUrl
            }else{
              console.log('no profile data!')
            }
            
          }).catch(err => {console.log(err)})
        }
      });
    } else if (identity == "student") {
      console.log(identity)
      wx.switchTab({
        url: '../class/class',
        success: res => {
          wx.hideLoading();
          app.globalData.identity = "student"
          app.globalData.idUrl = "../../images/xuesheng.png"
          db.collection("studentInfo").where({
            _openid: app.globalData.openid
          }).get().then(res2 => {
            console.log(res2.data[0])
            if(res2.data.length > 0){
              app.globalData.profile = res2.data[0]
              app.globalData.profile.userAvatarUrl = app.globalData.userAvatarUrl
            }else{
              console.log('no profile data!')
            }
            
          }).catch(err => {console.log(err)})
        }
      });
    } else if (identity == "instructor") {
      wx.navigateTo({
        url: '../instructor/instructor',
        success: res => {
          wx.hideLoading();
          app.globalData.identity = "instructor"
          //app.globalData.idUrl = "../../images/xuesheng.png"
          db.collection("instructorInfo").where({
            _openid: app.globalData.openid
          }).get().then(res2 => {
            console.log(res2.data[0])
            if(res2.data.length > 0){
              app.globalData.profile = res2.data[0]
              app.globalData.profile.userAvatarUrl = app.globalData.userAvatarUrl
            }else{
              console.log('no profile data!')
            }
            
          }).catch(err => {console.log(err)})
        }
      });
    }
  },

  instructorEnter: function () {
    wx.navigateTo({
      url: '../login/login',
    })
  },

  


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this
    /*if (checkNetwork.checkNetworkStatu() == false) {
      console.log("network is error!")
    }*/
    let loading_timer;
    loading_timer = () => {
      setTimeout(() => {
        if (that.data.percent >= 50) {
          return
        }
        that.setData({ percent: that.data.percent + 10 });
        loading_timer();
      }, 300);
    }
    loading_timer();
    console.log(app.globalData.date)
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.platform)
        app.globalData.platform = res.platform
      },
    });
    that.checkAuthorized();
    
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
    var that = this
    that.setData({
      loading: false,
      percent: 100,
      isShow: true
    });
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