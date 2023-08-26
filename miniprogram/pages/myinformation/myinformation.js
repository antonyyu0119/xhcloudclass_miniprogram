// pages/myinformation/myinformation.js
const db = wx.cloud.database();
var cmd = db.command;
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    upload: false,
    change: false,
    isHidden: false,
    isInstructor: false,

    userAvatarUrl: "../../images/touxiang.png",
    tempFilePaths: "",
    nickName: "",
    nickName_c: "",
    name: "",
    sex: "",
    identity: "",
    instructor: "",
    school: "",
    sno: "",
    email: "",

    show_sex: false,
    show_id: false,

    columns_sex: [
      { text: '请选择', disabled: "true" },
      { text: '男' },
      { text: '女' },
      { text: '其他'}],
    
  },

  onSave: function () {
    console.log(getApp().globalData)
    var that = this  
    if (that.data.name != "") {
      getApp().globalData.isuserName = true
    }else{
      getApp().globalData.isuserName = false
    }
    
    if (getApp().globalData.identity == "student"){
      if(that.data.name == '' || that.data.sno == ''){
        wx.showModal({
          title: '姓名和学号不能为空！',
          showCancel: false
        })
        return
      }
      const profile = {
        openid: app.globalData.openid,
        sname: that.data.name,
        ssex: that.data.sex,
        instructor: that.data.instructor,
        sschool: that.data.school,
        sno: that.data.sno,
        semail: that.data.email,
        isuserName: getApp().globalData.isuserName,
        userAvatarUrl: app.globalData.userAvatarUrl
      }
      db.collection("studentInfo").where({
        _openid: getApp().globalData.openid
      }).get().then(res => {
        if(res.data.length == 0){
          db.collection("studentInfo").add({
            data: profile
          }).then(res => {
            console.log("添加学生数据成功！")
            that.setStorage_myInfo(profile);
          }).catch(err => {
            wx.showToast({
              title: '操作失败！',
              icon: '../../images/shibai.png'
            })
          });
        }else{
          console.log(res)
          console.log(res.data[0]._id)
          var _id = res.data[0]._id
          db.collection("studentInfo").doc(_id).update({
            data: profile
          }).then(res => {
            console.log("更新学生数据成功！")
            that.setStorage_myInfo(profile);
            }).catch(err => {
              wx.showToast({
                title: '操作失败！',
                icon: '../../images/shibai.png'
              })
            });
        } 
      }).catch(err => {});
    } else if (getApp().globalData.identity == "teacher"){
      if(that.data.name == ''){
        wx.showModal({
          title: '姓名不能为空！',
          showCancel: false
        })
        return
      }
      const profile = {
        openid: app.globalData.openid,
        tname: that.data.name,
        tsex: that.data.sex,
        tschool: that.data.school,
        temail: that.data.email,
        isuserName: getApp().globalData.isuserName,
        userAvatarUrl: app.globalData.userAvatarUrl
      }
      db.collection("teacherInfo").where({
        _openid: getApp().globalData.openid
      }).get().then(res => {
        if(res.data.length == 0){
          db.collection("teacherInfo").add({
            data: profile
          }).then(res => {
            console.log("添加老师数据成功！")
            that.setStorage_myInfo(profile);
            }).catch(err => {
              wx.showToast({
                title: '操作失败！',
                icon: '../../images/shibai.png'
              })
            });
        }else{
          console.log(res)
          console.log(res.data[0]._id)
          var _id = res.data[0]._id
          db.collection("teacherInfo").doc(_id).update({
            data: profile
          }).then(res => {
            console.log("更新老师数据成功！")
            that.setStorage_myInfo(profile);
            }).catch(err => {
              wx.showToast({
                title: '操作失败！',
                icon: '../../images/shibai.png'
              })
            });
        }
      }).catch(err => {});
    } else if (getApp().globalData.identity == "instructor") {
      const profile = {
        openid: app.globalData.openid,
        name: that.data.name,
        sex: that.data.sex,
        school: that.data.school,
        email: that.data.email,
        userAvatarUrl: app.globalData.userAvatarUrl
      }
      db.collection("instructorInfo").where({
        username: getApp().globalData.instructorInfo.username
      }).get().then(res => {
        console.log(res)
        console.log(res.data[0]._id)
        var _id = res.data[0]._id
        db.collection("instructorInfo").doc(_id).update({
          data: profile
        }).then(res => {
          console.log("更新导员数据成功！")
          that.setStorage_myInfo(profile);
        }).catch(err => {
          wx.showToast({
            title: '操作失败！',
            icon: '../../images/shibai.png'
          })
        });
      }).catch(err => { });
    } 
    
  },

  setStorage_myInfo: function(profile){
    var that = this
    var pages = getCurrentPages();
    var beforePage = pages[pages.length - 2];
    wx.setStorage({
      key: 'profile',
      data: profile,
      success: res => {
        app.globalData.profile = profile
        wx.showToast({
          title: '保存成功!',
          duration: 1000
        })

        setTimeout(function () {
          wx.navigateBack({
            success: function () {
              beforePage.onLoad()
            }
          })
        }, 1000);
      }
    })
  },

  getMyInfo: function(){
    var that = this

    wx.showLoading({
      title: '获取信息中。。。',
    });

    wx.getStorage({
      key: 'myInfo',
      success: function(res) {
        console.log("profile",res.data)
        that.setData({
          name: res.data.name,
          sex: res.data.sex,
          instructor: res.data.instructor,
          school: res.data.school,
          sno: res.data.sno,
          email: res.data.email,
          isuserName: getApp().globalData.isuserName
        });
      },
      fail: function(res){
        console.log("no myInfo data")
        const db = wx.cloud.database()
        if (getApp().globalData.identity == "teacher") {
          db.collection("teacherInfo").where({
            _openid: getApp().globalData.openid
          }).get().then(res => {
            console.log("老师数据取出成功！")
            console.log(res.data[0])
            that.setData({
              name: res.data[0].tname,
              sex: res.data[0].tsex,
              school: res.data[0].tschool,
              email: res.data[0].temail,
              isuserName: res.data[0].isuserName
            });
            
          }).catch(err => {
            
            console.log("无老师数据！！")
          });
        } else if (getApp().globalData.identity == "student") {
          db.collection("studentInfo").where({
            _openid: getApp().globalData.openid
          }).get().then(res => {
            console.log("学生数据取出成功！")
            console.log(res.data[0])
            that.setData({
              name: res.data[0].sname,
              sex: res.data[0].ssex,
              instructor: res.data[0].instructor,
              school: res.data[0].sschool,
              sno: res.data[0].sno,
              email: res.data[0].semail,
              isuserName: res.data[0].isuserName
            });
            
          }).catch(err => {
            
            console.log("无学生数据！！")
          });
        } else if (getApp().globalData.identity == "instructor") {

          db.collection("instructorInfo").where({
            username: getApp().globalData.instructorInfo.username
          }).get().then(res => {
            console.log("导员数据取出成功！")
            console.log(res.data[0])
            that.setData({
              name: res.data[0].name,
              sex: res.data[0].sex,
              school: res.data[0].school,
              email: res.data[0].email
            });
            
          }).catch(err => {
            
            console.log("无导员数据！！")
          });
        }
      },
      complete: res => {
        wx.hideLoading();
      }
    })
  },

  onBlur_nickName: function (e) {
    var that = this
    that.setData({
      nickName_c: e.detail.value,
      change: true
    });
    
  },
  onBlur_name: function (e) {
    var that = this
    that.setData({
      name: e.detail.value
    });
    getApp().globalData.name = e.detail.value
    
  },
  onBlur_sex: function (e) {
    var that = this
    that.setData({
      sex: e.detail.value
    });
    
  },
  onBlur_id: function (e) {
    var that = this
    that.setData({
      id: e.detail.value
    });
    
  },
  onBlur_instructor: function (e) {
    var that = this
    that.setData({
      instructor: e.detail.value
    });

  },
  onBlur_school: function (e) {
    var that = this
    that.setData({
      school: e.detail.value
    });
    
  },
  onBlur_sno: function (e) {
    var that = this
    that.setData({
      sno: e.detail.value
    });
    
  },
  onBlur_email: function (e) {
    var that = this
    that.setData({
      email: e.detail.value
    });
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.setData({
      userAvatarUrl: getApp().globalData.userAvatarUrl,
      nickName: getApp().globalData.userNickName
    });
    if (getApp().globalData.identity == 'student') {
      that.setData({
        identity: "学生"
      });
    } else if (getApp().globalData.identity == 'teacher'){
      that.setData({
        identity: "老师",
        isHidden: true
      });
    } else if (getApp().globalData.identity == 'instructor') {
      that.setData({
        identity: "辅导员",
        isInstructor: true
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
    var that = this
    that.getMyInfo();

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (e) {
  },


  uploadAvatar: function(){
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        
        wx.showToast({
          title: "上传成功",
          icon: "success",
          duration: 1000  
        });
        const tempFilePaths = res.tempFilePaths  // tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          upload: true,
          tempFilePaths: tempFilePaths
        });
      },

      fail: function (res) { },

      complete: function (res) { },

    });
  },

  chooseSex: function(){
    var that = this
    that.setData({
      show_sex: true
    });
  },
  onClose: function () {
    var that = this
    that.setData({
      show_sex: false,
      show_id: false
    });
  },
  onConfirm_sex(event) {
    const { picker, value, index } = event.detail;
    var that = this
    that.setData({
      show_sex: false,
      sex: event.detail.value.text
      
    });
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