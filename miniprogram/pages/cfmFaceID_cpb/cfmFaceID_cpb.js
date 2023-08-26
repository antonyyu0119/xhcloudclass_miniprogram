// pages/cfmFaceID/cfmFaceID.js
var app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    platform: "",
    change: false,
    src: "",
    src1: "",
    access_token: "",
    base64_1: "",
    face_token: ""
  },


  registerFaceID: function () {
    wx.navigateTo({
      url: '../regFaceID/regFaceID',
    })
  },


  confirmFaceID: function () {
    var that = this
    const ctx = wx.createCameraContext() //创建相机上下文

    ctx.takePhoto({
      quality: 'high', //获取原图
      success: (res) => {
        that.setData({
          src1: res.tempImagePath //得到拍照后的图片地址
        });

        wx.getFileSystemManager().readFile({
          filePath: that.data.src1, //选择图片返回的相对路径
          encoding: 'base64', //编码格式
          success: res => { //成功的回调

            that.setData({
              base64_1: res.data
            })

            wx.vibrateLong({
              success: function () {
                console.log("vibrate success");
              },
              fail: function () {
                console.log("vibrate fail");
              }
            })
            that.setData({
              base64_3: res.data,
              change: true,
              src: that.data.src1
            })
            wx.showLoading({
              title: '正在上传中。。。',
            })

            wx.request({
              url: 'https://aip.baidubce.com/oauth/2.0/token',
              data: {
                'grant_type': 'client_credentials',
                'client_id': 'dat528Sz6hvEdURPabrTO4vv',
                'client_secret': 'qTKTaHKIqlmXvA6yMaVQDXfQHlf8MLsC'
              },

              success: (res) => {
                console.log(res.data)
                that.setData({
                  access_token: res.data.access_token
                });
                wx.request({
                  url: 'https://aip.baidubce.com/rest/2.0/face/v3/faceverify?access_token=' + res.data.access_token,
                  method: 'post',
                  data: [
                    {
                      image: that.data.base64_1,
                      image_type: 'BASE64',
                      face_field: 'quality'
                    }],

                  header: {
                    'Content-Type': 'application/json'
                  },


                  success(res) {

                    wx.hideLoading();
                    wx.showToast({
                      title: '正在比对。。。',
                      icon: 'loading',
                      duration: 3000
                    })
                    if (res.data.error_msg == 'pic not has face') {
                      wx.showModal({
                        title: '错误提示',
                        content: '未检测到人脸，请保证人脸足够清晰！',
                        showCancel: false
                      })
                      that.setData({
                        change: false
                      });
                      return

                    }
                    console.log(res.data)
                    console.log(res.data.result.face_liveness)
                    var liveness = res.data.result.face_liveness
                    console.log(res.data.result.face_list[0].quality.completeness)
                    var completeness = res.data.result.face_list[0].quality.completeness
                    console.log(res.data.result.face_list[0].angle)
                    var yaw = Math.abs(res.data.result.face_list[0].angle.yaw)
                    var pitch = Math.abs(res.data.result.face_list[0].angle.pitch)
                    var roll = Math.abs(res.data.result.face_list[0].angle.roll)
                    if (completeness == 0) {
                      wx.showModal({
                        title: '错误提示',
                        content: '请将人脸移至图像中央！请勿遮挡脸部！',
                      })

                      that.setData({
                        change: false
                      });
                      return
                    }
                    if (liveness <= 0.05) {
                      wx.showModal({
                        title: '错误提示',
                        content: '请确保是真人！！！',
                        showCancel: false
                      })

                      that.setData({
                        change: false
                      });
                      return
                    }
                    if (yaw > 20 || pitch > 20 || roll > 20) {
                      wx.showModal({
                        title: '错误提示',
                        content: '请面向屏幕，保持直视！',
                        showCancel: false
                      })

                      that.setData({
                        change: false
                      });
                      return
                    }
                    that.setData({
                      face_token: res.data.result.face_list[0].face_token
                    });
                    wx.request({
                      url: 'https://aip.baidubce.com/rest/2.0/face/v3/search?access_token=' + that.data.access_token,
                      method: 'post',
                      header: {
                        'Content-Type': 'application/json'
                      },
                      data: {
                        image: res.data.result.face_list[0].face_token,
                        image_type: 'FACE_TOKEN',
                        group_id_list: 'student',
                        user_id: app.globalData.openid,
                        quality_control: 'NORMAL',
                        liveness_control: 'HIGH'
                      },

                      success: (res) => {
                        //console.log(res.data);
                        if (res.data.error_msg == "match user is not found" && res.data.result == null){
                          wx.showModal({
                            title: '认证失败！请先注册！',
                            showCancel: false
                          })

                          that.setData({
                            change: false
                          });
                          return
                        }
                        if (res.data.error_msg != '' && res.data.error_msg != "match user is not found" && res.data.error_msg != "SUCCESS") {
                          wx.showModal({
                            title: '检测失败！',
                            content: '请勿遮挡脸部，且保证人脸光线足够良好！！',
                            showCancel: false
                          })

                          that.setData({
                            change: false
                          });
                          return
                        }
                        console.log(res.data)
                        if (res.data.result.user_list[0].user_id == app.globalData.openid && res.data.result.user_list[0].score > 80) {
                          wx.showToast({
                            title: '认证成功 !',
                            image: '../../images/renlianshibie.png'
                          })
                          var pages = getCurrentPages();
                          var beforePage = pages[pages.length - 2];
                          setTimeout(function () {
                            wx.navigateBack({
                              success: function () {
                                beforePage.checkin_success();
                              }
                            })
                          }, 1500);
                        } else {
                          wx.showToast({
                            title: '认证失败 !',
                            image: '../../images/shibai.png'
                          })
                          that.setData({
                            change: false
                          });
                          return
                        }



                      },

                      fail: (res) => {
                        wx.showModal({
                          title: '检测失败！',
                          content: '请勿遮挡脸部，保证人脸足够清晰！！',
                          showCancel: false
                        })

                        that.setData({
                          change: false
                        });
                        return
                      },
                      complete: (res) => {
                      }
                    })


                  },

                  complete: (res) => {
                    wx.hideToast(); //隐藏Toast
                  }
                })
              },

              fail: (res) => {
              }

            })
          }
        })
        console.log(res)
      },

      fail: function () { },
      complete: (res) => {
        wx.hideToast()
      }

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