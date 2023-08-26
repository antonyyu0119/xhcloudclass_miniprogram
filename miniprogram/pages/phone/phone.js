// pages/phone/phone.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

    send: "发送验证码",
    timer: "",
    isDisabled: false,
  },


  
  onClick_send: function () {
    var that = this
    wx.showToast({
      title: '发送成功 !',
    });
    var countDown = 60
    that.setData({
      isDisabled: true,
      timer : setInterval(function(){
        countDown --
        if(countDown < 10){
          countDown = '0'+countDown
          if(countDown == 0){
            clearInterval(that.data.timer)
          }
        }
        that.setData({
          send: countDown + " s 后重试"
        });
      },1000),
    });
    setTimeout(function(){
      that.setData({
        isDisabled: false,
        send: "发送验证码"
      });
    },60000);
    
  },
  onClick_check: function () {
    var that = this
    wx.showToast({
      title: '验证成功 !',
    });
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