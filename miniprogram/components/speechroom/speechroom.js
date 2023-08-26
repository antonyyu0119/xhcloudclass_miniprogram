// components/speechroom/speechroom.js
const db = wx.cloud.database();
const cmd = db.command;
var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    classInfo: Object,
    condition: Object,
    profile: Object,
    identity: String,
    collection: String,
    dateObj: Object,

    //方法
    initRoom: {
      type: Function
    },
    destroyRoom: {
      type: Function
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    identity: '',

    dateObj: {},

    openId: '',
    isOpen: '',
    notice: '',
    _id: '',
    speakerList: [],
    historyList: [],
    popup: false,
    speakerArr: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //开启发言
    openSpeech() {
      var that = this
      wx.showModal({
        title: '确定开启发言？',
        success: suc => {
          if (suc.cancel) {
            console.log("用户点击了取消！")
          } else {
            //添加发言室实例
            const time = app.getTime()
            const doc = {
              classId: this.properties.classInfo.classId,
              className: this.properties.classInfo.className,
              lessonName: this.properties.classInfo.lessonName,
              order: time.order,
              speakers: [],//发言学生队列
              date: app.globalData.date,
              time: time.formatTime,
              isOpen: true
            }
            db.collection(this.properties.collection).add({ data: doc }).then(res1 => {
              wx.showToast({
                title: '发言已开启',
                icon: 'success'
              })

            }).catch(err => { console.error(err) })

          }
        }
      })

    },
    switchOn() {
      this.triggerEvent('switchOn', {})
    },

    watchSpeakers() {
      this.data.speakerWatcher = db.collection(this.properties.collection).where(this.properties.condition).orderBy("order", "desc").watch({
        onChange: this.onRealtimeSpeakersChange.bind(this),
        onError: err => {
          console.error
        }
      })
    },

    onRealtimeSpeakersChange(snapshot) {
      //渲染发言历史记录
      this.setData({
        historyList: [...snapshot.docs].sort((x, y) => y.order - x.order) //根据时间戳逆序排列
      })
      const speakerList = [...this.data.speakerList];
      if (snapshot.type === 'init') {
        console.log("发言人监听器初始化完成！")
        console.warn("监听发言室:", snapshot);
        if (snapshot.docs.length > 0) {
          if (this.data.isOpen) {
            this.setData({
              speakerList: [...snapshot.docs[0].speakers]//初始化本次发言的学生列表
            })
          }

        }

      } else {
        console.log(snapshot.docChanges)
        for (const docChange of snapshot.docChanges) {
          switch (docChange.dataType) {
            case "add":
              {
                //监听到有新的发言室创建
                if (docChange.doc.isOpen) {
                  //开启本地发言室开关
                  this.setData({
                    isOpen: docChange.doc.isOpen,
                    _id: docChange.doc._id
                  })
                  //同时开启父组件开关
                  this.switchOn()
                }
                break
              };

            case "update":
              {
                if (docChange.updatedFields.isOpen == false) {//监听发言关闭
                  this.closeSpeechWatcher();
                } else { //监听更新
                  let hasNewSpeaker = false
                  let hasOldSpeaker = false
                  let speakerWithdraw = false

                  const speakers = [...docChange.doc.speakers]
                  if (speakers.length < speakerList.length) {//监听到有人撤回
                    speakerWithdraw = true
                    this.setData({
                      speakerList: [...speakers]
                    })
                  }
                  else { //监听到有发言人加入
                    const speaker = speakers[speakers.length - 1]
                    //查看是否是新发言人
                    const index = speakerList.findIndex(speakerObj => speakerObj._openid == speaker._openid || speakerObj.openid == speaker._openid)
                    if (index > -1) {//如果是重复加入的发言人
                      hasOldSpeaker = true
                      //将原有对象出队
                      speakerList.splice(index, 1)
                      this.setData({
                        notice: speaker.sname + '重新加入了发言列表',
                      })
                    } else { //是新的发言人
                      hasNewSpeaker = true
                      this.setData({
                        notice: speaker.sname + "加入了发言列表"
                      })
                    }
                    //将新对象入队
                    speakerList.push(speaker);
                    //并设置欢迎动画
                    if (hasOldSpeaker || hasNewSpeaker) {
                      this.setAnimation()
                    }
                    //渲染页面数据
                    this.setData({ speakerList: speakerList })
                    this.scrollToBottom()
                  }

                }
                break
              };
          }
        }

      }
    },

    setAnimation(){
      this.setData({
        notice_animation: 'on'
      })
      setTimeout(() => {
        this.setData({
          notice_animation: ''
        })
      }, 2000)
    },

    //学生加入发言队列
    readyToJoin() {
      var that = this
      this.querySpeechOpen().then(res => {
        if (res.data.length > 0) {
          if (!res.data[0].isOpen) {
            wx.showModal({
              title: '老师还没开启发言哦~',
              showCancel: false
            })
          } else {
            wx.showModal({
              title: '确定加入发言队列？若已在队列，将移动至队尾！',
              success: res1 => {
                if (res1.cancel) {
                  console.log("用户点击了取消！")
                }
                else {
                  wx.showLoading({
                    title: '操作中...',
                  })
                  const profile = that.properties.profile
                  const time = app.getTime()
                  profile.order = time.order
                  profile.joinTime = time.formatTime
                  const data = {
                    action: 'query_speeches_speakers',
                    profile: profile,
                    _id: res.data[0]._id
                  }
                  //查看学生是否已在队列。若已经在队列，则将原者出队，并重新入对
                  wx.cloud.callFunction({
                    name: 'accessDB',
                    data,
                    success: res2 => {
                      wx.hideLoading();
                      console.log("加入发言队列成功")
                      wx.showToast({
                        title: '已加入发言队列！',
                        icon: 'success'
                      })
                    },
                    fail: err => console.log(err)
                  })

                }
              }
            });
          }
        }
        else {
          wx.showToast({
            title: '无效操作！',
            icon: 'none'
          })
        }
      })
    },

    //轮询发言是否已经开启
    querySpeechOpen() {
      return db.collection(this.properties.collection).where(this.properties.condition).orderBy("order", 'desc').get()
    },

    scrollToBottom() {
      this.createSelectorQuery().select('.speakerList').boundingClientRect(client => {
        console.log(client)
      }).exec()
    },

    closeSpeech(e) {
      //关闭数据库开关
      db.collection(this.properties.collection).doc(this.data._id).update({
        data: {
          isOpen: false
        }
      }).then(res => {
        wx.showToast({
          title: '发言已关闭',
          icon: 'success'
        });
      }).catch(err => { console.log(err) });
    },

    closeSpeechWatcher() {
      var that = this
      this.data.speakerWatcher.close().then(res => { console.log("发言列表监听器已关闭！") }).then(res => {
        //关闭本地开关
        that.setData({
          isOpen: false
        })
        //将父组件发言开关关闭
        that.switchOff()
      });
    },

    switchOff() {
      this.triggerEvent('switchOff', {})
    },

    addScore(e) {
      if (e.currentTarget.dataset._openid) {
        const openid = e.currentTarget.dataset._openid
        const sname = e.currentTarget.dataset.sname
        const sno = e.currentTarget.dataset.sno
        const selfInfo = {
          openid,
          sname,
          sno
        }
        wx.showModal({
          title: '给' + sname + "加分？",
          success: (suc) => {
            if (suc.confirm) {
              //给学生加分
              app.updateAchievement(this.properties.classInfo, selfInfo, 5, "speech", "课堂发言")
              wx.showToast({
                title: '操作成功！',
              })
              this.setData({
                notice: sname + "回答地太好了！老师给你加分了！"
              })
              this.setAnimation()
            }
          }
        })

      }
    },

    withdraw(e) {
      wx.showModal({
        title: '确认撤回本次发言？操作不可恢复！',
        success: res => {
          if (res.cancel) {
            console.log("用户点击了取消！")
          } else {
            if (this.data.isOpen) {
              const data = {
                action: "withdraw_speeches_speakers",
                _openid: e.currentTarget.dataset._openid,
                _id: this.data._id,
              }
              wx.cloud.callFunction({
                name: 'accessDB',
                data,
                success: suc => {
                  console.log(suc)
                  wx.showToast({
                    title: '撤回成功！',
                    icon: 'success'
                  })
                },
                fail: err => console.log(err)
              })

            } else {
              wx.showModal({
                title: '发言已关闭，操作失败！',
                showCancel: false
              })
            }
          }
        }
      })

    },

    checkHistory() {
      this.setData({ flip: this.data.flip ? '' : 'flip' })
    },

    showHistory() {
      db.collection("speeches").where({
        lessonName: this.properties.classInfo.lessonName,
        classId: this.properties.classInfo.classId,
      }).orderBy("order", 'desc').get().then(res => { console.log(res.data) })
    },

    showMore(e) {
      if (e.currentTarget.dataset._id) {
        //根据_id查找发言记录详情，并渲染到popup弹出框中
        db.collection(this.properties.collection).where({
          _id: e.currentTarget.dataset._id
        }).get().then(res => {
          this.setData({ speakerArr: res.data[0].speakers })
        })
      }
      //控制popup显示与否
      this.setData({
        popup: !this.data.popup
      })
    },

    setOpenId() {
      this.setData({
        openId: this.properties.profile._openid || this.properties.profile.openid
      })
    },

    setDateObj() {
      this.setData({
        dateObj: this.properties.dateObj ? this.properties.dateObj : ''
      })
    },

    //对发言室进行初始化
    initSpeechRoom() {
      //初始化组件数据
      this.setData({ identity: this.properties.identity })
      this.setOpenId();
      this.setDateObj();
      //查看是否已有发言室开启
      this.querySpeechOpen().then(res => {
        console.log(res)
        if (res.data.length > 0) {
          //若有，则将isOpen设置为true，
          if (res.data[0].isOpen) {
            this.setData({
              isOpen: res.data[0].isOpen,
              _id: res.data[0]._id
            })
            //并开启监听
            this.watchSpeakers()
            //同时将父组件发言开关也打开
            this.switchOn()
            console.log("发言室已就绪...")
          } else {
            //启动监听
            this.watchSpeakers()
            console.log("初始化发言室成功！")
          }
        }
        else {
          //启动监听
          this.watchSpeakers()
          console.log("初始化发言室成功！")
        }
      }).catch(err => console.log(err));

    },

  },


  //组件生明周期函数：组件已经就绪
  ready() {
    global.speechroom = this
    this.initSpeechRoom()
  }



})
