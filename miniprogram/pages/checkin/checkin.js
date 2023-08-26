// pages/checkin/checkin.js
const db = wx.cloud.database();
const cmd = db.command;
var app = getApp();
var date = new Date();
var DistanceLimit = 3;
var conditions = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lessonName: "",
    distance: "",
    checkinDate: "",
    checkin_today: [],
    checkin_history: [],

    presentNum: "",
    absentNum: "",
    askforNum: "",
    studentList: []
  },


  checkin: function () {
    var that = this
    db.collection("location").where(conditions).get().then(res => {
      if (res.data.length == 0) {
        wx.hideLoading();
        wx.showToast({
          title: '未发布签到 !',
          image: "../../images/shibai.png"
        });
        return
      }

      db.collection("signin").where(conditions).orderBy("order", "desc").get().then(res1 => {
        console.log(res1)
        db.collection("signin").where({
          _id: res1.data[0]._id,
          students: cmd.elemMatch({ openid: app.globalData.openid })
        }).get().then(res2 => {
          if (res2.data.length > 0) {
            wx.showModal({
              title: '提示',
              content: '你已经签到过了！',
              showCancel: false
            });
            return
          }
          that.gotoCheck();
        }).catch(console.error)

      }).catch(console.error)


    }).catch(err => { console.log(err) });


  },

  gotoCheck: function () {
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
      },
      complete: (res) => {
        wx.hideToast();
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
        var latitude2 = res.latitude
        var longitude2 = res.longitude
        var speed2 = res.speed
        var accuracy2 = res.accuracy
        console.log(latitude2 + "," + longitude2)
        db.collection("location").where(conditions).get().then(res => {
          console.log(app.globalData)
          console.log(res.data)
          console.log("教师的位置信息已获取");
          var La1 = res.data[0].latitude1 * Math.PI / 180.0;
          var La2 = latitude2 * Math.PI / 180.0;
          var La3 = La1 - La2;
          var Lb3 = res.data[0].longitude1 * Math.PI / 180.0 - longitude2 * Math.PI / 180.0;

          var result = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
          result = result * 6378.137; //地球半径
          //计算得与教师的距离（单位：Km）
          result = Math.round(result * 10000) / 10000;
          console.log("计算结果", result);
          that.setData({
            distance: result
          });
          if (result < DistanceLimit) {
            if (app.globalData.profile) {

              wx.hideLoading();
              wx.showLoading({
                title: '正在跳转。。。',
              })
              wx.navigateTo({
                url: app.globalData.platform == 'ios' ? '../cfmFaceID/cfmFaceID' : '../cfmFaceID_cpb/cfmFaceID_cpb',
                success: (res) => {
                  wx.hideLoading();
                }
              })

            } else {
              console.log("studentInfo is none")
              wx.showToast({
                title: '请先完善个人信息!',
                image: '../../images/shibai.png'
              })

            }



          } else {
            wx.hideLoading();
            wx.showToast({
              title: '超出签到范围 !',
              image: '../../images/shibai.png'
            })
          }
        }).catch(err => { });
      }
    })
  },

  checkin_success: function () {
    var that = this
    console.log(app.globalData)
    db.collection("signin").where(conditions).orderBy("order", "desc").get().then(res => {
      console.log(res.data[0]._id)
      console.log("签到学生准备加入集合")
      //console.log(time)
      const doc = {
        action: "update_signin",
        _id: res.data[0]._id,
        openid: app.globalData.openid,
        sname: app.globalData.profile.sname,
        sno: app.globalData.profile.sno,
        checkinTime: app.getTime().formatTime,
      }
      wx.cloud.callFunction({
        // 云函数名称
        name: 'accessDB',
        // 传给云函数的参数
        data: doc,
        success: function (res) {
          that.data.checkin_today.push(doc)
          console.log("签到学生加入集合成功！")
          wx.showToast({
            title: '签到成功 !',
          })
          that.setData({
            checkin_today: that.data.checkin_today
          })

          const selfInfo = {
            openid: app.globalData.openid,
            sname: app.globalData.profile.sname,
            sno: app.globalData.profile.sno,
          }
          //更改学生课堂成绩
          app.updateAchievement(app.globalData.classDetail, selfInfo, 2, "signin", "签到成功")//参数：班级信息、学生openid、分数变动值、得分类型、备注信息
        }
      })
    })
  },

  getCheckinList: function () {
    var that = this
    db.collection("signin").where({
      lessonName: conditions.lessonName,
      classId: conditions.classId,
      tname: conditions.tname
    }).orderBy("order", "desc").get().then(res => {
      console.log(res);
      let i = 0
      do {
        var arr = [...res.data[i].students];
        const index = arr.findIndex(student => student.openid == app.globalData.openid)
        console.log(index);
        if (index > -1) {
          if (res.data[i].date == app.globalData.date) {
            that.data.checkin_today.push(arr[index])
          } else {
            arr[index].date = res.data[i].date
            that.data.checkin_history.push(arr[index])
          }
        }

        i++
      } while (i < res.data.length)
      that.setData({
        checkin_today: that.data.checkin_today,
        checkin_history: that.data.checkin_history
      })

    })
  },

  showPresentList: function () {
    var that = this
    /* db.collection('location').where({}) */
    that.setData({
      watcher: db.collection("signin").where(conditions).orderBy("order", "desc").watch({
        onChange: function (snapshot) {
          console.log('监听', snapshot.docChanges)
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
              askforNum: data.askforNum
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
    var that = this
    console.log(app.globalData)
    if (app.globalData.classDetail) {
      conditions = {
        lessonName: app.globalData.classDetail.lessonName,
        classId: app.globalData.classDetail.classId,
        tname: app.globalData.classDetail.tname,
        date: app.globalData.date
      }
      that.setData({
        lessonName: app.globalData.classDetail.lessonName + ' ' + app.globalData.classDetail.className,
        studentList: app.globalData.classDetail.students
      });
      that.showPresentList();
      that.getCheckinList();
    } else if (options._id) {
      db.collection("class").where({
        _id: options._id
      }).get().then(res => {
        app.globalData.classDetail = res.data[0]
        conditions = {
          lessonName: res.data[0].lessonName,
          classId: res.data[0].classId,
          tname: res.data[0].tname,
          date: app.globalData.date
        }
        that.setData({
          lessonName: res.data[0].lessonName + ' ' + res.data[0].className,
          studentList: res.data[0].students
        });
        that.showPresentList();
        that.getCheckinList();
      }).catch(err => { console.log(err) })
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
    //that.showPresentList();
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
    if (that.data.watcher) {
      that.data.watcher.close().then(res => {
        console.log("监听关闭！")
      })
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