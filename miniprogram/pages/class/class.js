// pages/lesson/lesson.js
var checkNetwork = require("../checkNetwork.js");
const db = wx.cloud.database();
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    duration: 20,
    percent: 0,
    loading: true,
    viewShow: false,
    isFixed: false,
    isToday: "",
    openid: "",
    colorArrays: ["#85B8CF", "#90C652", "#D8AA5A", "#FC9F9D", "#0A9A84", "#61BC69", "#12AEF3", "#E29AAD"],
    classList: []

  },

  setStorage_class: function(classList){
    var that = this
    wx.setStorage({
      key: app.globalData.identity + '_classList',
      data: classList,
      success: res => {
        that.setData({
          classList: classList
        });
      }
    })
  },

  //备用缓存机制
  /**
   * getStorage_class: function(){
    var that = this
    wx.getStorage({
      key: app.globalData.identity + '_classList',
      success: function(res) {
        console.log("课程表",res.data)
        that.setData({
          classList: res.data
        })
      },
      fail: function(err){
        console.log("no" + app.globalData.identity + "classList")
      },
      complete: function(res){
        that.setData({
          percent: 100,
          loading: false,
          viewShow: true
        });
      }
    })
  },*/

  addClass: function (e) {
    var week = e.target.dataset.week
    var order = e.target.dataset.order
    var classInfo = week + "，第" + order + "节"
    if (app.globalData.identity == "teacher") {
      wx.navigateTo({
        url: '../create/create',
      })
    } else if (app.globalData.identity == "student") {
      wx.navigateTo({
        url: '../join/join',
      })
    }
  },

  deleteClass(e){
    wx.showModal({
      cancelColor: 'cancelColor',
      title: '内测功能，敬请期待',
      showCancel: false
    })
    console.log(e.currentTarget.dataset._id);
  },  
  
  showClassView: function(event){
    console.log(event.currentTarget.dataset)
    var that = this
    wx.showLoading({
      title: '进入班级...',
    })
    
    db.collection("class").where({
      _id: event.currentTarget.dataset._id
    }).get().then(res => {
      console.log(res.data[0])
      app.globalData.classDetail = res.data[0]
      console.log(app.globalData.classDetail)
      if (app.globalData.identity == "teacher") {
        wx.navigateTo({
          url: '../classView_t/classView_t'
        })
      } else if (app.globalData.identity == "student") {
        wx.navigateTo({
          url: '../classView_s/classView_s'
        })
      }
      wx.hideLoading();
    }).catch(err => { console.log(err) })
      
  },

  showModal: function(str){
    wx.showModal({
      title: '课程创建成功！班级ID为' + str + ',是否复制班级ID到剪切板？',
      success: (res) => {
        if(res.confirm){
          wx.setClipboardData({
            data: str,
            success: () =>{
              wx.showToast({
                title: '复制成功!',
              })
            }
          })
        }
      }
    })
  },

  onPageScroll: function(e){
    if(e.scrollTop >= 25){
      this.setData({
        isFixed: true
      })
    }else{
      this.setData({
        isFixed: false
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var today = new Date().getDay()
    console.log(today);
    that.setData({
      isToday: today
    });

    //加载进度条
    let loading_timer;
    loading_timer = () => {
      setTimeout(() => {
        if (that.data.percent >= 95) {
          return
        }
        
        that.setData({ percent: that.data.percent + 1 });
        loading_timer();
      }, 10);
    }
    loading_timer();

    //检测网络
    if(checkNetwork.checkNetworkStatu() == false){
      console.log("network is error!")
    }
    
    console.log(app.globalData)

    //启动通知监听
    app.watchMessage();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this
    wx.cloud.callFunction({
      name: 'accessDB',
      data: {
        action: "show_class_" + app.globalData.identity,
        db: "class",
        openid: app.globalData.openid
      },
      success: res2 => {
        that.setStorage_class(res2.result.data);
        console.log(res2.result.data)
      },
      complete: res3 => {
        wx.hideLoading();
        that.setData({
          percent: 100,
          loading: false,
          viewShow: true
        });
      }
    });
    

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //设置badge
    app.setBadge();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    //app.closeWatchMsg();
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
    wx.showNavigationBarLoading()
    wx.showLoading({
      title: '获取中。。。',
    })
    this.onReady();
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
  onShareAppMessage: function (options) {
    var that = this;
    return {
      
      success: function (options) {
        if (options.shareTickets) {
          wx.showToast({
            title: '已经分享到群',
          });
        } else {
          wx.showToast({
            title: '请分享到群',
          });
        }
      },
      fail: function (options) {
        that.setData({
          msg: JSON.stringify(options)
        });
      }
    }
  },
})