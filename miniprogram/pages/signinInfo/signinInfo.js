// pages/activity/activity.js
const db = wx.cloud.database();
const cmd = db.command;
var app = getApp();
var date = new Date();
var conditions = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {

    lessonName: "",
    isShow: false,
    isAppear: false,
    showTimes: false,
    times: [
      {
        name: '2分钟',
        value: '120'
      },
      {
        name: '3分钟',
        value: '180'
      },
      {
        name: '5分钟',
        value: '300'
      },
      {
        name: '10分钟',
        value: '600'
      }
    ],
    time: "",
    timer: "",
    warn: "",
    countdown: "",
    watcher: "",

    latitude1: "",//经度1
    longitude1: "",//纬度1
    signinList: [],
    studentList: [],
    presentNum: "",
    absentNum: "",
    askforNum: "",

    showChanges: false,
    index: "",
    studentInfo: {},
    changes: [
      {
        name: '将该学生改为已签到'
      },
      {
        name: '将该学生改为已请假'
      }
    ]
  },

  signinInfo: function () {
    var that = this
    wx.navigateTo({
      url: '../signinInfo/signinInfo?time=' + that.data.time,
    })
  },

  showHistory: function () {
    var that = this
    wx.navigateTo({
      url: '../present/present',
    })
  },

  signIn: function () {
    var that = this
    if (app.globalData.signinObj) {
      if (app.globalData.signinObj.lessonName == app.globalData.classDetail.lessonName && app.globalData.signinObj.classId == app.globalData.classDetail.classId) {
        wx.showModal({
          title: '提示',
          content: '当前班级正在签到，请等待签到结束！',
          showCancel: false
        });
        return
      } else {
        wx.showModal({
          title: '提示',
          content: '有其他课程正在签到，请等待其签到结束！',
          showCancel: false
        });
        return
      }

    }
    that.setData({
      showTimes: true
    });
  },

  selectTime: function (e) {
    var that = this
    console.log(e.detail.value)
    var time = e.detail.value
    that.setData({
      time: time
    });
    wx.showModal({
      title: '确认发起签到',
      content: '签到时长为' + e.detail.name + '，确认发起签到？',
      success: function (res) {
        if (res.confirm) {
          that.startSignin();
          that.setData({ showTimes: false });
        } else if (res.cancel) {
          console.log("用户点击了取消！")
        }
      }
    })
  },

  startSignin: function () {
    var that = this
    wx.getSetting({
      success: (res) => {
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          //未授权
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function (res) {
              if (res.cancel) {
                //取消授权
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                //确定授权，通过wx.openSetting发起授权请求
                wx.openSetting({
                  success: function (res) {
                    if (res.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      //再次授权，调用wx.getLocation的API
                      that.getLocation();
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          //用户首次进入页面,调用wx.getLocation的API
          that.getLocation();
        }
        else {
          console.log('授权成功')
          //调用wx.getLocation的API
          that.getLocation();
        }
      }
    })
  },

  getLocation: function () {
    wx.showLoading({
      title: '正在获取位置。。。',
    })
    var that = this
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        var latitude1 = res.latitude
        var longitude1 = res.longitude
        var speed1 = res.speed
        var accuracy1 = res.accuracy
        that.setData({
          latitude1: latitude1,
          longitude1: longitude1
        });
        console.log(latitude1 + "," + longitude1)
        that.uploadLocation();
      }
    })
  },

  uploadLocation: function () {
    var that = this
    const location = {
      "lessonName": app.globalData.classDetail.lessonName,
      "classId": app.globalData.classDetail.classId,
      "tname": app.globalData.classDetail.tname,
      "latitude1": that.data.latitude1,
      "longitude1": that.data.longitude1,
      "date": app.globalData.date,
    }
    db.collection("location").add({
      data: location
    }).then(res2 => {
      console.log(res2);
      app.globalData.signinObj = {
        lessonName: app.globalData.classDetail.lessonName,
        className: app.globalData.classDetail.className,
        classId: app.globalData.classDetail.classId,
        tname: app.globalData.classDetail.tname,
        location: res2._id
      }
    }).then(res3 => {
      var time = app.getTime();
      const doc = {
        lessonName: app.globalData.classDetail.lessonName,
        className: app.globalData.classDetail.className,
        classId: app.globalData.classDetail.classId,
        tname: app.globalData.classDetail.tname,
        date: app.globalData.date,
        time: time.formatTime,
        order: time.order,
        students: []
      }
      db.collection("signin").add({ //添加签到集合
        data: doc
      }).then(res4 => {
        console.log(res4)
        wx.hideLoading();
        wx.showToast({
          title: '发起签到成功 !',
          duration: 500
        });
        app.setCountdown(that.data.time);//设置后台签到倒计时 
        that.updateCount();//渲染倒计时
        that.showPresentList();//监听学生签到

        //发送签到通知
        app.sendNotification('checkin', app.globalData.classDetail.students, app.globalData.classDetail._id, null, 'success', time);

      })
    }).catch(console.error)
  },

  //更新倒计时
  updateCount: function () {
    var that = this;
    var timer = null;
    clearInterval(that.data.timer);
    that.setData({
      timer: setInterval(function () {
        //console.log(app.globalData.signinTime)
        if (app.globalData.signinTime <= 0) {
          clearInterval(timer);
          that.setData({
            countdown: '签到已结束！'
          });
        } else {
          that.setData({
            isShow: true,
            countdown: app.globalData.countdown + " （正在签到）"
          });
        }

      }, 30)
    })

  },

  changePresent: function (e) {
    var that = this
    const info = {
      openid: e.currentTarget.dataset.openid,
      sname: e.currentTarget.dataset.sname,
      sno: e.currentTarget.dataset.sno
    }
    that.setData({
      showChanges: true,
      index: e.currentTarget.dataset.index,
      studentInfo: info
    })
    console.log(e.currentTarget.dataset.index)

  },

  onSelect(e) {
    var that = this
    console.log(e.detail);
    that.onClose();

    const con = {
      lessonName: conditions.lessonName,
      classId: conditions.classId,
      tname: conditions.tname,
      date: conditions.date,
      'student.openid': that.data.studentInfo.openid
    }

    db.collection("signin").where(con).get().then(res => {
      if (res.data.length == 0) {
        db.collection("signin").where(conditions).orderBy('order', 'decs').get().then(res1 => {

          const doc = {
            action: "update_signin",
            _id: res1.data[0]._id,
            "openid": JSON.parse(JSON.stringify(that.data.studentInfo.openid)),
            "sname": JSON.parse(JSON.stringify(that.data.studentInfo.sname)),
            "sno": JSON.parse(JSON.stringify(that.data.studentInfo.sno)),
          }

          if (e.detail.name == '将该学生改为已请假') {
            doc.askfor = true
          } else {
            doc["checkinTime"] = "教师添加"
          }

          wx.cloud.callFunction({
            name: 'accessDB',
            data: doc,
            success: suc => {
              wx.showToast({
                title: '修改成功 !',
              })
              console.log("change successfully!")

              if (e.detail.name == '将该学生改为已签到') {
                //如果学生到了，则更改学生课堂成绩
                app.updateAchievement(app.globalData.classDetail, that.data.studentInfo, 2, 'signin', "签到成功(教师添加)")//参数：班级信息、学生openid、分数变动值、备注
              }


            },
            fail: err => { console.log(err) }
          })

        })
      }
    })

  },

  onClose() {
    var that = this
    that.setData({
      showTimes: false,
      showChanges: false,
    });
  },

  showPresentList: function () {
    var that = this
    that.setData({
      watcher: db.collection("signin").where(conditions).orderBy("order", "desc").watch({
        onChange: function (snapshot) {
          console.log('监听', snapshot)
          console.log(snapshot.docChanges[0].doc);
          //console.log(snapshot.docs[0])
          var signinList = snapshot.docChanges[0].doc.students;
          if (snapshot.type == 'init' && signinList.length === 0) {
            console.log('watcher init')
            console.log("no signin collection")
            that.setData({
              presentNum: 0,
              absentNum: app.globalData.classDetail.students.length,
              askforNum: 0
            })
            //return
          } else {
            const data = app.setPresentData(signinList);
            that.setData({
              presentNum: data.presentNum,
              absentNum: data.absentNum,
              askforNum: data.askforNum,
              studentList: data.presentArray
            })
          }

        },
        onError: function (err) {
          console.error('the watch closed because of error', err)
        }
      })
    });
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    conditions = {
      "lessonName": app.globalData.classDetail.lessonName,
      "classId": app.globalData.classDetail.classId,
      "tname": app.globalData.classDetail.tname,
      "date": app.globalData.date
    }

    var that = this
    var signinObj = app.globalData.signinObj
    that.setData({
      lessonName: app.globalData.classDetail.lessonName + ' ' + app.globalData.classDetail.className,
      studentList: app.globalData.classDetail.students
    });

    if (signinObj != undefined) {
      if (signinObj.lessonName == app.globalData.classDetail.lessonName && signinObj.classId == app.globalData.classDetail.classId) {
        console.log(app.globalData.signinTime)
        that.updateCount();
        that.showPresentList();
      } else {
        that.setData({
          isShow: true,
          countdown: signinObj.lessonName + ' ' + signinObj.className + " 正在签到"
        });
      }
    } else {
      if (app.globalData.signinTime <= 0) {
        that.setData({
          isShow: true,
          countdown: "签到已结束！"
        });
        return
      }
      db.collection("location").where({
        "lessonName": app.globalData.classDetail.lessonName,
        "classId": app.globalData.classDetail.classId,
        "tname": app.globalData.classDetail.tname
      }).limit(1000).get().then(res1 => {
        if (res1.data.length != 0) {
          wx.showModal({
            title: '警告',
            content: '小程序异常退出，请重新发起签到！',
            showCancel: false,
            success: (res2) => {
              if (res2.confirm) {
                //将_id传给app.js，停止签到
                app.stopCountdown(res1.data[0]._id);

              }
            }
          });
        }
      }).catch(console.error);
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
    //this.showPresentList();
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
    clearInterval(that.data.timer);
    that.setData({
      timer: ''
    })
    if (that.data.watcher) {
      that.data.watcher.close().then(res => {
        console.log("监听关闭！")
      }).catch(err => {
        console.log('no watcher!')
      })
    }

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    wx.showNavigationBarLoading()
    this.showPresentList();
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新

    }, 1500);
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