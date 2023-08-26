// pages/message/message.js
const db = wx.cloud.database();
var cmd = db.command;
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
    data: {
      today: "",
      yesterday: "",
      active: 0, 
      dot: false,
      notifications: 0,
      chats: 0,
      notificationList: [],
      chatList: [],
      clearIndex: ''
  },
  

  clearAllNotifications: function(){
    var that = this
    if(that.data.notificationList.length == 0){
      wx.showToast({
        title: '没有可清理的通知!',
        image: '../../images/shibai.png'
      });
      return
    }

    wx.showModal({
      title: '提示',
      content: '是否清除所有通知？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '操作中...',
          })
          let i = 0
          var timer = setInterval(function () {
            var notificationList = that.data.notificationList
            var str = `notificationList[${i}].clear`
            that.setData({ [str]: 'cleared' });
            if (i == notificationList.length - 1) {
              clearInterval(timer);
              wx.cloud.callFunction({
                name: 'accessDB',
                // 传给云函数的参数
                data: {
                  action: "clear_all_notifications",
                  target: app.globalData.openid
                },
                success: res => {
                  wx.hideLoading();
                  wx.showToast({
                    title: '清除完成!',
                    duration: 500
                  })
                  that.getNotification();
                }
              })
            }

            i++
          }, 200);

        }
        if (res.cancel) {
          console.log("用户点击了取消")
        }
      }
    })
    
  },

  clearAllChats: function(){
    var that = this
    if(that.data.chatList.length == 0){
      wx.showToast({
        title: '没有可清理内容!',
        image: '../../images/shibai.png'
      });
      return
    }

    wx.showModal({
      title: '提示',
      content: '是否清除所有私信？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '操作中...',
          })
          let i = 0
          var timer = setInterval(function () {
            const chatList = that.data.chatList
            const str = `chatList[${i}].clear`
            that.setData({ [str]: 'cleared' });
            if (i == chatList.length - 1) {
              clearInterval(timer);
              wx.cloud.callFunction({
                name: 'accessDB',
                // 传给云函数的参数
                data: {
                  action: "clear_all_chat",
                  target: app.globalData.openid
                },
                success: res => {
                  wx.hideLoading();
                  wx.showToast({
                    title: '清除完成!',
                    duration: 500
                  })
                  that.getChatList();
                }
              })
            }

            i++
          }, 200);

        }
        if (res.cancel) {
          console.log("用户点击了取消")
        }
      }
    })
  },

  async getNotification(){
    var that = this
    if(that.data.notificationWatcher){
      that.data.notificationWatcher.close();
    }
    that.data.notificationWatcher = ''
    that.setData({
      notificationWatcher: //设置通知列表监听器
      db.collection("notification").where({
        target: app.globalData.openid,
        clear: 'uncleared'
      }).orderBy('order','desc').watch({
        onChange: function (snapshot) {
  
          console.warn('监听通知列表', snapshot)
          if(snapshot.type == 'init'){
            const docs = [...snapshot.docs];
            const arr = docs.filter(item => item.flag == 1)
            that.setData({
              notifications: arr.length,
              notificationList: [...docs]
            })
          }else{
            const list = [...that.data.notificationList]
  
            for (const docChange of snapshot.docChanges) {
              const index = list.findIndex(item => item._id == docChange.docId)
              switch(docChange.dataType){
                case 'add': {
                  console.log('add a new notify')
                  list.unshift(docChange.doc)
                  that.data.notifications ++
                  break
                };
                case 'update': {
                  if(index > -1){
                    list.splice(index,1,docChange.doc)
                  }
                  if(docChange.updatedFields.flag == 0){
                    that.data.notifications --
                  }
                  break
                };
                //与删除动画效果冲突。。。
                /* case 'remove': {
                  if(index > -1){
                    if(list[index].flag == 1){
                      that.data.notifications --
                    }
                    list.splice(index,1)
                  }
                  break
                }; */
  
              }
            }
            that.setData({
              notifications: that.data.notifications,
              notificationList: list
            })
          }
        },
        onError: function (err) {
          console.error('the watch closed because of error', err)
          wx.hideLoading();
        }
        
      })
    })
  },

  async getChatList(){
    var that = this
    if(that.data.chatWatcher){
      that.data.chatWatcher.close()
    }
    that.data.chatWatcher = ''
    that.setData({
      chatWatcher: //设置私信列表监听器
      db.collection("chatroom").where({
        target: app.globalData.openid,
        clear: 'uncleared'
      }).orderBy('sendTimeTS','desc').watch({
        onChange: snapshot => {
          console.warn('监听私信列表',snapshot)
          if(snapshot.type === 'init'){
            const docs = [...snapshot.docs]
            const arr = docs.filter(item => item.flag == 1)
            that.setData({
              chats: arr.length,
              chatList: docs
            })
          }else{
            const list = [...that.data.chatList]
            for (const docChange of snapshot.docChanges) {
              const ind = list.findIndex(item => item._id == docChange.docId)
              switch(docChange.dataType){
                case 'add': {
                  console.log('add a new chat')
                  list.unshift(docChange.doc)
                  that.data.chats ++
                  break
                }
  
                case 'update': {
                  if(ind > -1){
                    list.splice(ind,1,docChange.doc)
                  }
                  if(docChange.updatedFields.flag == 0){
                    that.data.chats --
                  }
                  break
                }
  
                case 'remove': {
                  that.getChatList();
                }
              }
            }
            that.setData({
              chatList: list,
              chats: that.data.chats
            })
          }
          
        },
        onError: err => {
          console.error('the watch closed because of error', err)
        }
      })
    })
  },
  
  readInfo: function(e){
    wx.showLoading({
      title: '正在跳转...',
    })
    var type = e.currentTarget.dataset.type
    var id = e.currentTarget.dataset.id
    var _id = e.currentTarget.dataset._id

    wx.navigateTo({
      url: '../' + type + '/' + type + '?_id=' + id + '&&identity=' + app.globalData.identity,
      success: res1 => {
        wx.cloud.callFunction({
          name: 'accessDB',
          // 传给云函数的参数
          data: {
            action: "update_message_flag",
            collection: 'notification',
            _id: _id,
          },
          success: res2 => {
            if(type == 'notice'){
              wx.cloud.callFunction({
                name: 'accessDB',
                data: {
                  action: 'update_notice_readed',
                  _id: id
                },
                complete: res4 => {
                  wx.hideLoading();
                }
              })
            }
          },
          complete: err => {
            wx.hideLoading();
          }
        });
      },
      complete: err => {}
    });
    
  },

  goChat: function(e){

    var that = this
    wx.showLoading({
      title: '正在跳转...',
    })
    const groupId = e.currentTarget.dataset.groupid
    const name = e.currentTarget.dataset.name
    const target = e.currentTarget.dataset.target
    const _id = e.currentTarget.dataset._id
    wx.navigateTo({
      url: '../chat/chat?groupId=' + groupId + '&name=' + name + '&target=' + target,
      success: res => {
        wx.cloud.callFunction({
          name: 'accessDB',
          // 传给云函数的参数
          data: {
            action: "update_message_flag",
            collection: 'chatroom',
            _id: _id,
          },
          complete: res => {
            wx.hideLoading();
          }
        })
      }
    })
  },

  clearMessage: function(e){
    var that = this
    const state = e.currentTarget.dataset.state
    const index = e.currentTarget.dataset.index
    const notificationList = that.data.notificationList
    const chatList = that.data.chatList

    switch(state){
      case 'notification': {
        var str = `notificationList[${index}].clear`
        if (notificationList[index].clear == 'rotate') {
          that.setData({
            [str]: ''
          });
        } else {
          that.setData({
            [str]: 'rotate'
          });
        }
        break
      };

      case 'chat': {
        var str = `chatList[${index}].clear`
        if (chatList[index].clear == 'rotate') {
          that.setData({
            [str]: ''
          });
        } else {
          that.setData({
            [str]: 'rotate'
          });
        }
        break
      }
    }
    
    
  },
  
  deleteMessage: function(e){
    var that = this
    wx.showLoading({
      title: '正在删除。。。',
    })
    const _id = e.currentTarget.dataset._id
    const index = e.currentTarget.dataset.index
    console.log(e);
    const state = e.currentTarget.dataset.state
    switch(state){
      case 'notification': {
        const notificationList = that.data.notificationList
        var str = `notificationList[${index}].clear`
        that.setData({ 
          [str]: "cleared"
        });
        if (index < notificationList.length - 1){
          for (let i = index + 1; i < notificationList.length; i++) {
            str = `notificationList[${i}].clear`
            that.setData({
              [str]: "slide"
            });
          }
          wx.cloud.callFunction({
            name: 'accessDB',
            // 传给云函数的参数
            data: {
              action: "clear_notification",
              _id: _id
            },
            success: res => {
            },
            fail: res => {
              wx.showModal({
                title: '错误提示',
                content: '操作失败！',
                showCancel: false
              });
            },
            complete: res => {
              that.getNotification();
              wx.hideLoading();
            }
          })
        }else{
          wx.cloud.callFunction({
            name: 'accessDB',
            // 传给云函数的参数
            data: {
              action: "clear_notification",
              _id: _id
            },
            success: res => {
            },
            fail: res => {
              wx.showModal({
                title: '错误提示',
                content: '操作失败！',
                showCancel: false
              });
            },
            complete: res => {
              that.getNotification();
              wx.hideLoading();
            }
          })
        }
        break
      };

      case 'chat': {
        const chatList = that.data.chatList
        var str = `chatList[${index}].clear`
        that.setData({ 
          [str]: "cleared"
        });
        if (index < chatList.length - 1){
          for (let i = index + 1; i < chatList.length; i++) {
            str = `chatList[${i}].clear`
            that.setData({
              [str]: "slide"
            });
            if (i == chatList.length - 1) {
              wx.cloud.callFunction({
                name: 'accessDB',
                // 传给云函数的参数
                data: {
                  action: "clear_chat",
                  _id: _id
                },
                success: res => {
                },
                fail: res => {
                  wx.showModal({
                    title: '错误提示',
                    content: '操作失败！',
                    showCancel: false
                  });
                },
                complete: res => {
                  that.getChatList();
                  wx.hideLoading();
                }
              })
            }
          }
        }else{
          wx.cloud.callFunction({
            name: 'accessDB',
            // 传给云函数的参数
            data: {
              action: "clear_chat",
              _id: _id
            },
            success: res => {
            },
            fail: res => {
              wx.showModal({
                title: '错误提示',
                content: '操作失败！',
                showCancel: false
              });
            },
            complete: res => {
              that.getChatList();
              wx.hideLoading();
            }
          })
        }
        break
      }
    }
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.setData({ 
      today: app.globalData.date,
      yesterday: app.globalData.yesterday
    });

    that.getNotification();
    that.getChatList();
    
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
    console.log(that.data.today)
    
    app.setBadge();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
   // app.closeWatchMsg()
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
    wx.showLoading({
      title: '加载中...',
    })
    wx.showNavigationBarLoading()

    /* app.closeWatchMsg().then(res => {
      console.log(res)
      if(res.length > 0){
        console.log('MsgWatcher is closed successfully!')
        app.globalData.setBadge_notice = null
        app.globalData.setBadge_chat = null
        //重新启动消息监听
        app.watchMessage()
      }
    }).catch(err => console.log(err)) */
    //重新渲染列表数据
    this.onLoad();
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
      wx.hideLoading();

    }, 1500);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    //this.getNotification();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})