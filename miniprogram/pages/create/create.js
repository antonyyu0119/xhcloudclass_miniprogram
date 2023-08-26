// pages/create/create.js
var app = getApp();
const db = wx.cloud.database();
const times = {
  '星期': [],
  '周一': ['节次',1, 2, 3, 4, 5,6,7,8,9,10,11,12,13],
  '周二': [],
  '周三': [],
  '周四': [],
  '周五': [],
  '周六': [],
  '周日': [],
};
const nums = ['节数',1,2,3,4];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lessonName:"",
    className:"",
    classroom: "",
    classTime:"",
    classWeek:"",
    classOrder:"",
    classNum:"",
    isDisabled: true,


    show_time: false,
    columns_time: [
      {
        values: Object.keys(times),
        className: 'column1'
      },
      {
        values: times['周一'],
        className: 'column2',
        defaultIndex: 0
      },
      {
        values: nums,
        className: 'column3',
        defaultIndex: 0
      }
    ]
  },

  onChange_lessonName: function(e){
    var that = this
    that.setData({
      lessonName: e.detail
    });
    if (that.data.lessonName != "" && that.data.className != "" && that.data.classroom != "" && that.data.classWeek != "" && that.data.classOrder != "" && that.data.classNum != "") {
      that.setData({
        isDisabled: false
      });
    } else {
      that.setData({
        isDisabled: true
      });
    }
  },
  
  onChange_className: function (e) {
    var that = this
    that.setData({
      className: e.detail
    });
    if (that.data.lessonName != "" && that.data.className != "" && that.data.classroom != "" && that.data.classWeek != "" && that.data.classOrder != "" && that.data.classNum != "") {
      that.setData({
        isDisabled: false
      });
    } else {
      that.setData({
        isDisabled: true
      });
    }
  },

  onChange_classroom: function (e) {
    var that = this
    that.setData({
      classroom: e.detail
    });
    if (that.data.lessonName != "" && that.data.className != "" && that.data.classroom != "" && that.data.classWeek != "" && that.data.classOrder != "" && that.data.classNum != "") {
      that.setData({
        isDisabled: false
      });
    } else {
      that.setData({
        isDisabled: true
      });
    }
  },

  chooseTime: function () {
    var that = this
    that.setData({
      show_time: true
    });
  },
  onClose: function () {
    var that = this
    that.setData({
      show_time: false  
    });
  },
  onConfirm_time(event) {
    const { picker, value, index } = event.detail;
    console.log(event.detail.index)
    var that = this
    that.setData({
      classTime: event.detail.value[0]+'，第'+event.detail.value[1]+'节'+'，共'+event.detail.value[2]+'节',
      show_time: false,
      classWeek: event.detail.index[0],
      classOrder: event.detail.index[1],
      classNum: event.detail.index[2]
    });
    if (that.data.lessonName != "" && that.data.className != "" && that.data.classroom != "" && that.data.classWeek != "" && that.data.classOrder != "" && that.data.classNum != "") {
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
    if (that.data.isDisabled == true && (that.data.lessonName == "" || that.data.className == "" || that.data.classroom == "" || that.data.classWeek =="" || that.data.classOrder == "" || that.data.classNum == "")) {
      wx.showToast({
        title: '请完善信息 !',
        image: '../../images/shibai.png'
      })
    }
  },

  onClick: function () {
    var that = this
    that.setData({
      isDisabled: true
    });
    wx.showLoading({
      title: '正在创建。。。',
    })
    wx.cloud.callFunction({
      name: 'accessDB',
      data: {
        action: "query_class_teacher",
        db: "class",
        openid: app.globalData.openid
      },
      success: res => {
        console.log(res.result.data)
        if (res.result.data.length == 0) { //当数据库中无课程时直接创建
          that.createSuccess();
          return
        } else {
          var i = 0
          while (i < res.result.data.length) { //循环查询数据库中所有课程，以免重复创建
            var classWeek_check = res.result.data[i].classWeek
            var classOrder_check = res.result.data[i].classOrder
            var classNum_check = res.result.data[i].classNum
            if ((that.data.classWeek == classWeek_check && that.data.classOrder >= classOrder_check && that.data.classOrder < classOrder_check + classNum_check) || (that.data.classWeek == classWeek_check && that.data.classOrder < classOrder_check && that.data.classOrder + that.data.classNum > classOrder_check)) {
              console.log("error!")
              wx.hideLoading();
              wx.showToast({
                title: '课程重复 !',
                image: '../../images/shibai.png'
              })
              break
            } else if (i == res.result.data.length - 1) { //如果循环完毕时没有重复的课程，即可创建
            that.createSuccess();
            return
              
            }
            i++
          }
        }
      },
      fail: err => console.log(err)
    })
  },

  createSuccess: function(){
    var that = this
    var str = "",
    range = 6,//随机数的个数
    arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    // 生成随机数
    for (var i = 0; i < range; i++) {
      var pos = Math.round(Math.random() * (arr.length - 1));
      str += arr[pos];
    }
    console.log(app.globalData.tname)
    console.log("班级ID：" + str)
    db.collection("class").add({
      data: {
        lessonName: that.data.lessonName,
        classId: str,
        className: that.data.className,
        classroom: that.data.classroom,
        classWeek: that.data.classWeek,
        classOrder: that.data.classOrder,
        classNum: that.data.classNum,
        tname: app.globalData.profile.tname,
        students: []
      }
    }).then(res => {
      var pages = getCurrentPages();
      var beforePage = pages[pages.length - 2];
      console.log(beforePage)
      wx.hideLoading();
      wx.showToast({
        title: '创建成功 !',
      });
      setTimeout(function () {
        wx.navigateBack({
          success: function () {
            beforePage.onReady();
            beforePage.showModal(str);
          }
        })
      }, 1500);

    }).catch(err => {
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(!app.globalData.profile){
      wx.showModal({
        title: '请先完善个人信息!',
        showCancel: false
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