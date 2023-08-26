// pages/upload/upload.js
Page({

  /**
   * 页面的初始数据
   */
   data: {

      src: ''

},

    upload() {

    wx.chooseImage({

      count: 1, // 默认9

      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有

      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有

      success(res) {

        const src = res.tempFilePaths[0]



        wx.redirectTo({

          url: '../cut/cut?src=' + src

        })

      }

    })

  },

/**
   * 生命周期函数--监听页面加载
   */
  onLoad(option) {

    let {

      avatar

    } = option

if(avatar) {

      this.setData({

        src: avatar

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