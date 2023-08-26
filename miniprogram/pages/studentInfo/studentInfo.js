// pages/studentInfo/studentInfo.js
const db = wx.cloud.database();
const cmd = db.command;
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    percent: 0,
    loading: true,
    viewShow: false,

    isShow: false,
    focus: false,
    chooseAll: '全选',
    disabled: false,
    chooseNum: 0,
    studentList: [],
    chooseList: [],
    searchList: [],
    action: '',

    choose_src: '../../images/choose.png'
  },

  onSearch(e) {
    this.setData({
      isShow: true
    })
    setTimeout(() => {
      this.setData({
        focus: true
      })
    }, 250)
  },

  cancel(e) {
    this.setData({
      isShow: false,
      focus: false
    })
  },

  onInput(e) {
    var that = this
    if (e.detail.value == '') {
      that.setData({ searchList: [] })
      return
    }
    const list = [...that.data.studentList];
    list.map((item, index) => {
      item._index = index
    })
    //字符串模糊匹配
    that.setData({
      searchList: list.filter(item => item.sno.indexOf(e.detail.value) > -1 || item.sname.indexOf(e.detail.value) > -1)
    })
  },

  chooseAll: function () {
    const newArray = [...this.data.studentList]
    if (this.data.chooseAll == '全不选') {
      for (let i = 0; i < newArray.length; i++) {
        newArray[i].choose = ''
      }
      this.setData({
        chooseAll: '全选',
        chooseNum: 0
      })
    } else {
      for (let i = 0; i < newArray.length; i++) {
        newArray[i].choose = 'chosen'
      }
      this.setData({
        chooseAll: '全不选',
        chooseNum: newArray.length
      })
    }

    this.setData({
      studentList: newArray
    });


  },

  done: function () {
    var that = this
    that.setData({ disabled: true })
    for (let i = 0; i < that.data.studentList.length; i++) {
      if (that.data.studentList[i].choose == 'chosen') {
        that.data.chooseList.push(that.data.studentList[i])
      }
      if (i == that.data.studentList.length - 1) {
        console.log(that.data.chooseList)
        if (that.data.chooseList.length > 0) {
          wx.setStorage({
            key: app.globalData.classDetail.classId + '_stu_chooseList',
            data: that.data.chooseList,
            success: res => {
              var pages = getCurrentPages();
              var beforePage = pages[pages.length - 2];
              wx.navigateBack({
                success: res => {
                  beforePage.getStorage();
                }
              });
            }
          });
        } else {
          wx.showModal({
            title: '提示',
            content: '请选择学生',
            showCancel: false,
            success: res => {
              that.setData({ disabled: false })
            }
          })
        }

      }
    }
  },


  moreInfo: function (e) {
    console.log(e.currentTarget.dataset.openid)
    wx.navigateTo({
      url: '../moreInfo/moreInfo?openid=' + e.currentTarget.dataset.openid + '&userAvatarUrl=' + e.currentTarget.dataset.useravatarurl
    })
  },


  onChoose: function (e) {
    var that = this
    var choose = e.currentTarget.dataset.choose
    var index = e.currentTarget.dataset.index | e.currentTarget.dataset._index
    var s = `eee`;
    if (e.currentTarget.dataset.flag) {
      const flag = e.currentTarget.dataset.flag
      s = `searchList[${flag}].choose`
    }

    const str = `studentList[${index}].choose`
    if (choose == 'chosen') {
      that.setData({
        [s]: '',
        [str]: '',
        chooseNum: that.data.chooseNum - 1
      });
    } else {
      that.setData({
        [s]: 'chosen',
        [str]: 'chosen',
        chooseNum: that.data.chooseNum + 1
      });
    }

    that.setData({ searchList: that.data.searchList })
  },

  onChat: function (e) {
    wx.navigateTo({
      url: '../chat/chat?target=' + e.currentTarget.dataset.openid + '&name=' + e.currentTarget.dataset.sname,
    })
  },

  onLoad: function (options) {
    var that = this
    console.log(options)
    if (options.action) {
      that.setData({
        action: options.action
      });

      if (options.action == 'getTarget') {
        wx.setNavigationBarTitle({
          title: '谁可以看',
          success: (res) => { },
          fail: (res) => { },
          complete: (res) => { },
        })
      }
      if (options.action == 'onChoose') {
        wx.setNavigationBarTitle({
          title: '选择学生',
          success: (res) => { },
          fail: (res) => { },
          complete: (res) => { },
        })
      }
    }


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.showLoading({
      title: '获取中。。。',
    })
    var that = this
    let loading_timer;
    loading_timer = () => {
      setTimeout(() => {
        if (that.data.percent >= 98) {
          return
        }
        that.setData({ percent: that.data.percent + 1 });
        loading_timer();
      }, 10);
    }
    loading_timer();

    //获取所要查看的学生列表
    if (app.globalData.chooseList) {
      that.setData({
        percent: 100,
        loading: false,
        viewShow: true,
        studentList: app.globalData.chooseList
      });
      wx.hideLoading();
    } 
    //获取班级全部学生列表
    else {
      db.collection("class").where({
        lessonName: app.globalData.classDetail.lessonName,
        classId: app.globalData.classDetail.classId
      }).watch({
        onChange: function (snapshot) {
          console.warn('监听', snapshot)
          console.log("本班人数为：" + snapshot.docs[0].students.length)
          that.setData({
            studentList: app.sno_order(snapshot.docs[0].students)
          });
          //获取缓存中被选中的学生
          wx.getStorage({
            key: app.globalData.classDetail.classId + '_stu_chooseList',
            success: function (res) {
              console.log(res.data)
              const studentList = [...that.data.studentList]
              for (let i = 0; i < res.data.length; i++) {
                const ind = studentList.findIndex(item => item.openid == res.data[i].openid)
                if(ind > -1){
                  var str = `studentList[${ind}].choose`
                  that.setData({ [str]: 'chosen' })
                }
              }
              that.setData({
                chooseNum: res.data.length
              });
            },
            fail: res => {
              console.log('no studentList storage data!')
            },
            complete: res => {
              wx.hideLoading();
              that.setData({
                percent: 100,
                loading: false,
                viewShow: true
              });
            }
          });
        },
        onError: function (err) {
          console.error('the watch closed because of error', err)
        }
      });
    }




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