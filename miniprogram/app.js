//app.js
App({



  onLaunch: function () {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'antonyyu20230722-1f0q1m1c9ecea5b',
        traceUser: true,
      })
    }
    
    this.globalData = {
      date: this.getDate()[0],
      yesterday: this.getDate()[1],
      tomorrow: this.getDate()[2],
      badge: 0,
      signinTimer: '',
      notifications: '',
      notificationList: '',
      countdown: '倒计时',
      chooseList: null
    }
  },


  //MD5加密
  encodeMD5: function(str){
    const md5 = require('./assets/md5/md5');
    var code = md5.md5(md5.md5(str))
    console.log(code);
    return code
  },

  removeStorage(key){
    try {
      wx.removeStorage({
        key: key,
      })
    } catch (e) {
      // Do something when catch error
    }
  },

  clearStorage: function () {
    try {
      wx.clearStorageSync()
    } catch (e) {
      // Do something when catch error
    }
    
  },

  getDate: function(){
    var date = new Date();
    //获取今天的日期
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var today = [year, month, day].map(this.formatNumber).join("/")
    //获取昨天的日期
    date.setTime(date.getTime() - 24 * 60 * 60 * 1000);
    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getDate();
    var yesterday = [year, month, day].map(this.formatNumber).join("/")
    //获取明天的时间
    date.setTime(date.getTime() + 24 * 60 * 60 * 1000 * 2);
    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getDate();
    var tomorrow = [year, month, day].map(this.formatNumber).join("/")
    return [today,yesterday,tomorrow]
    //this.globalData.date = today
    //console.log(this.globalData.date)
  },

  getTime: function(){
    var date = new Date();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    var formatTime = [hour, minute, second].map(this.formatNumber).join(":")
    var order = date.getTime();

    return {
      formatTime,
      order
    }
  },

  formatNumber: function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },

  sno_order: function(array){
    var that = this
    // 数组排序，单独放在一个方法里面，再去调用
    var newArray = array;
    var s = "";
    for (var i = 1; i < newArray.length; i++) {
      for (var j = i; j > 0; j--) {
        if (newArray[j].sno < newArray[j - 1].sno) {
          s = newArray[j];
          newArray[j] = newArray[j - 1];
          newArray[j - 1] = s;
        }
      }
    }
    console.log(newArray)
    wx.hideLoading();
    return newArray
  },

  time_order: function (array) {
    var that = this
    // 数组排序，单独放在一个方法里面，再去调用
    var newArray = array;
    var s = "";
    for (var i = 1; i < newArray.length; i++) {
      for (var j = i; j > 0; j--) {
        if (newArray[j].order > newArray[j - 1].order) {
          s = newArray[j];
          newArray[j] = newArray[j - 1];
          newArray[j - 1] = s;
        }
      }
    }
    console.log(newArray)
    wx.hideLoading();
    return newArray
  },

  async watchMessage() {
    var that = this
    const db = wx.cloud.database();
    var cmd = db.command;
    that.globalData.badge = 0;
    //监听通知消息
    that.globalData.setBadge_notice = db.collection("notification").where({
      target: that.globalData.openid,
      clear: 'uncleared'
    }).orderBy('order','desc').watch({
      onChange: function (snapshot) {
        console.warn('监听通知消息', snapshot)
        if(snapshot.type == 'init'){
          const docs = [...snapshot.docs]
          const list = docs.filter(item => item.flag == 1)
          if(list.length != 0){
            that.globalData.badge += list.length
          }
        }else{
          const docChanges = [...snapshot.docChanges];
          for (const docChange of docChanges) {
            switch(docChange.dataType){
              case 'add': {
                console.warn('收到新通知',docChange);
                that.globalData.badge ++
                break
              };
              case 'update': {
                if(docChange.updatedFields.flag == 0){
                  that.globalData.badge --
                }
                break
              };
              case 'remove': {
                if(docChange.doc.flag == 1){
                  that.globalData.badge --
                }
                break
              }
            }
          }
        }
        that.setBadge();
        
      },
      onError: function (err) {
        console.error('the watch closed because of error', err)
        wx.hideLoading();
      }
    })
  
    //监听私信消息
    that.globalData.setBadge_chat = db.collection("chatroom").where({
      target: that.globalData.openid,
      clear: 'uncleared'
    }).orderBy('sendTimeTS','desc').watch({
      onChange: function (snapshot) {
        console.warn('监听私信', snapshot)
        if(snapshot.type == 'init'){
          const docs = [...snapshot.docs]
          const list = docs.filter(item => item.flag == 1)
          if(list.length != 0){
            that.globalData.badge += list.length
          }
        }else{
          const docChanges = [...snapshot.docChanges];
          for (const docChange of docChanges) {
            switch(docChange.dataType){
              case 'add': {
                console.warn('收到新私信',docChange);
                that.globalData.badge ++
                break
              };
              case 'update': {
                if(docChange.updatedFields.flag == 0 || (docChange.updatedFields.clear == 'cleared' & docChange.doc.flag == 1)){
                  that.globalData.badge --
                }
                break
              };
              case 'remove': {
                if(docChange.doc.flag == 1){
                  that.globalData.badge --
                }
                break
              }
            }
          }
        }
        that.setBadge();
        
      },
      onError: function (err) {
        console.error('the watch closed because of error', err)
        wx.hideLoading();
      }
    })
  
  },

  setBadge(){
    console.log('setBadge!');
    if(this.globalData.badge <= 0){
      wx.removeTabBarBadge({
        index: 1,
      })
      return
    }
    wx.setTabBarBadge({
      index: 1,
      text: this.globalData.badge > 99 ?'99+' :this.globalData.badge.toString(),
    })
  },

  async closeWatchMsg(){
    /* return this.globalData.setBadge_notice.close().then(res1 => {
      return this.globalData.setBadge_chat.close().then(res2 => {
        return '123'
      })
    }) */
    const p1 = this.globalData.setBadge_notice.close()
    const p2 = this.globalData.setBadge_chat.close()
    /* const p1 = new Promise((resolve, reject) => {
      let data = '1'
      reject(data);
    })
    const p2 = new Promise((resolve, reject) => {
      let data = '2'
      resolve(data);
    }) */
    return await Promise.all([p1,p2])

  },


  sendNotification: function (type,target,contentId,sender,state,time) {
    var that = this
    const db = wx.cloud.database();
    var time = that.getTime();
    
    for (let i = 0; i < target.length; i++) {
      db.collection('notification').add({
        // data 传入需要添加的数据
        data: {
          type: type,
          target: target[i].openid,
          id: contentId,
          sender: arguments[3] ?arguments[3] :'系统通知',
          state: arguments[4] ?arguments[4] :'success',
          sendTime: arguments[5] ?arguments[5].formatTime :time.formatTime,
          order: arguments[5] ? arguments[5].order : time.order,
          date: that.globalData.date,
          flag: 1,
          clear: 'uncleared'
        }
      }).then(res => {
        console.log(res)
        wx.hideLoading();
        //console.log(arguments[1].length)
      }).catch(err => {
        console.log(err)
        wx.hideLoading();
        return false
      });
    }
  },

  updateAchievement(){
    const time = this.getTime()
    const arg = arguments
    const doc = {
      action: "add_achievement_record",
      lessonName: arg[0].lessonName,
      className: arg[0].className,
      classId: arg[0].classId,
      tname: arg[0].tname,
      _openid: arg[1].openid || arg[1]._openid,
      sname: arg[1].sname,
      sno: arg[1].sno,
      score: arg[2],
      scoreType: arg[3] || 'other',
      info: arg[4] || '其它',
      order: time.order,
      time: time.formatTime,
      date: this.globalData.date
    }
    wx.cloud.callFunction({
      name: 'accessDB',
      data: doc,
      success: suc => {console.log(suc)},
      fail: err => {console.log(err)}
    })

  },

  setCountdown: function (time) {
    var that = this
    clearInterval(that.globalData.signinTimer)
    that.globalData.signinTimer = setInterval(function () {
      var min = Math.floor(time / 60)
      var sec = Math.floor(time % 60)
      var countdown = [min, sec].map(that.formatNumber).join(":")
      that.globalData.countdown = countdown
      that.globalData.signinTime = time
      //console.log(that.globalData.signinTime)
      if (time <= 0) {
        clearInterval(that.globalData.signinTimer)
        that.stopCountdown();  
      }
      time--
    }, 1000);
  },

  stopCountdown: function () {
    var that = this
    const db = wx.cloud.database();
    db.collection("location").doc(arguments[0] ?arguments[0] :that.globalData.signinObj.location).remove().then(res => {
      console.log("后台签到已结束!")
      that.globalData.signinObj = undefined
    }).catch(err => {console.error})
    
      
  },

  setPresentData: function (signinList) {
    var that = this
    var absentNum = 0;
    var askforNum = 0;
    var presentNum = 0;
    var presentArray = []
    if (signinList.length == 0) {
      return
    }
    const arr = [...signinList];
    var studentArray = this.globalData.classDetail.students
    //var studentArray = students
    for (const student of studentArray) {
      const index1 = arr.findIndex(signinObj => signinObj.openid == student.openid && signinObj.askfor == true);
      const index2 = arr.findIndex(signinObj => signinObj.openid == student.openid && signinObj.checkinTime != '');
      var obj = {
        "openid": student.openid,
        "sname": student.sname,
        "sno": student.sno,
        "present": ""
      }
      if (index1 > -1) {
        obj.present = '已请假'
        askforNum++
      }
      else if (index2 > -1) {
        obj.present = '已签到'
        obj.checkinTime = ' (' + arr[index2].checkinTime + ')'
        presentNum++
      }
      else {
        obj.present = '未签到'
        absentNum++
      }
      presentArray.push(obj);
    }
    console.log(presentNum);
    console.log(absentNum);
    console.log(askforNum);
    console.log(presentArray);
    console.log("旷课人数为：" + absentNum)

    return {
      presentNum,
      absentNum,
      askforNum,
      presentArray: this.sno_order(presentArray)
    }

    
  }



})
