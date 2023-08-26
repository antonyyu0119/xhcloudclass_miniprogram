// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境


// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database();
  const cmd = db.command;
  const MAX_LIMIT = 100

  switch(event.action){
    case "show_class_teacher" :
      return await db.collection(event.db).where({
        _openid: event.openid
      }).get();
      break
    case "show_class_student" :
      return await db.collection(event.db).where({
        "students.openid": event.openid
      }).get();
      break
    case "update_class_join" :
      return await db.collection('class').doc(event._id).update({
        // data 传入需要局部更新的数据
        data: {
          students: cmd.push([{ "openid": event.openid, "userAvatarUrl": event.userAvatarUrl, "sname": event.sname, "sno": event.sno, "choose": "" }])
        }
      })
      break
    case "update_signin" :
      return await db.collection('signin').doc(event._id).update({
        // data 传入需要局部更新的数据
        data: {
          students: cmd.push([/* { "openid": JSON.parse(JSON.stringify(event.openid)), "sname": JSON.parse(JSON.stringify(event.sname)), "sno": JSON.parse(JSON.stringify(event.sno)), "checkinTime": JSON.parse(JSON.stringify(event.checkinTime)) } */event])
        }
      })
      break
    case "update_class_withdraw" :
      return await db.collection('class').doc(event._id).update({
        // data 传入需要局部更新的数据
        data: {
          students: cmd.pull({openid: event.openid})
        }
      })
      break
    case "query_class_teacher":
      return await db.collection('class').where({
        // data 传入需要局部更新的数据
        _openid: event.openid
      }).get();
      break
    case "get_askfor":
      var countResult = await db.collection("askfor").where({
        instructor: event.name,
        school: event.school
      }).orderBy("order", "desc").count()
      var total = countResult.total
      // 计算需分几次取
      var batchTimes = Math.ceil(total / 100)
      // 承载所有读操作的 promise 的数组
      var tasks = []
      for (let i = 0; i < batchTimes; i++) {
        var promise = db.collection('askfor').where({
          instructor: event.name,
          school: event.school
        }).orderBy("order", "desc").skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
        tasks.push(promise)
      }
      // 等待所有
      return (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
          data: acc.data.concat(cur.data),
          errMsg: acc.errMsg,
        }
      })
      break 
    case "askfor_flag_instructor":
      return await db.collection('askfor').doc(event._id).update({
        data:{
          hasRead: "已读"
        }
      });
      break
    case "askfor_isApprove_instructor":
      if (event.choice == 'approve') {
        return await db.collection('askfor').doc(event._id).update({
          data: {
            isApprove: "approve"
          }
        });
      }
      else if (event.choice == 'disapprove') {
        return await db.collection('askfor').doc(event._id).update({
          data: {
            isApprove: "disapprove",
            radio: event.radio,
            argument: event.argument
          }
        });
      }
      break
    /*case "update_notification_instructor":
      return await db.collection('notification').doc("b2e060ee-33e2-4610-a140-4d68b92f60d8"
).update({
        // data 传入需要局部更新的数据
        data: {
          askfor: cmd.push([{ "_id": JSON.parse(JSON.stringify(event._id)), "openid": JSON.parse(JSON.stringify(event.openid)), "state": JSON.parse(JSON.stringify(event.state)), "changeTime": JSON.parse(JSON.stringify(event.changeTime)) }])
        }
      })
      break*/
    /*case "send_notification":
      db.collection('notification').where({
        // data 传入需要局部更新的数据
        _openid: arguments[1]}).update
        data: {
          type: arguments[0],
          target: arguments[1],
          id: arguments[2],
          state: arguments[3],
          changeTime: time,
          date: app.globalData.date,
          order: order,
          flag: 1,
          clear: arguments[4]
        }
      })
    break*/
    case "get_notification":
      var countResult = await db.collection('notice').where({
        lessonName: event.lessonName,
        classId: event.classId,
        _openid: event.openid
      }).count()
      var total = countResult.total
      if(total == 0){
        return total
      }
      // 计算需分几次取
      var batchTimes = Math.ceil(total / 100)
      // 承载所有读操作的 promise 的数组
      var tasks = []
      for (let i = 0; i < batchTimes; i++) {
        var promise = db.collection('notice').where({
          lessonName: event.lessonName,
          classId: event.classId,
          _openid: event.openid
        }).orderBy("order", "desc").skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
        tasks.push(promise)
      }
      // 等待所有
      return (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
          data: acc.data.concat(cur.data),
          errMsg: acc.errMsg,
        }
      })
      break
    case "update_message_flag":
      return await db.collection(event.collection).doc(event._id).update({
        data:{
          flag: cmd.min(0)
        }
      });
      break
    case "clear_notification":
      try {
        return await db.collection('notification').doc(event._id).remove();
      } catch (e) {
        console.error(e)
      };
      break
    case "clear_all_notifications":
      try {
        return await db.collection('notification').where({
          target: event.target
        }).remove();
      } catch (e) {
        console.error(e)
      };
      break
    case 'clear_chat':
      try {
        return await db.collection('chatroom').doc(event._id).update({
          data: {
            clear: 'cleared'
          }
        })
      } catch (e) {
        console.error(e)
      }
      break
    case 'clear_all_chat': {
      try {
        return await db.collection("chatroom").where({
          target: event.target,
          clear: 'uncleared'
        }).update({
          data: {
            clear: 'cleared'
          }
        })
      } catch (e) {
        console.error(e)
      }
    }
    /*case "get_notification":
      return await db.collection("notification").where({
        target: event.target
      }).orderBy("order","desc").skip(event.length).limit(10).get();
      break*/
    case "update_notice_readed":
      return await db.collection("notice").doc(event._id).update({
        data: {
          readed: cmd.inc(1)
        }
      });
      break
    
    case "query_speeches_speakers":
      return db.collection("speeches").doc(event._id).update(
        {
          data: {
            speakers: cmd.pull({_openid: event.profile._openid})
          }
        }
      ).then(res => {
        return db.collection("speeches").doc(event._id).update(
          {
            data: {
              speakers: cmd.push([event.profile])
            }
          }
        )
      })
      break
    
    case "withdraw_speeches_speakers":
      return await db.collection("speeches").doc(event._id).update(
        {
          data: {
            speakers: cmd.pull({_openid: event._openid})
          }
        }
      )
      break

    case "get_achievement_all":
      return await db.collection("achievement").where(event.con).orderBy('order', 'desc').get()
      break

    case "add_achievement_record":
      return await db.collection("achievement").add({
        data: event
      })
      break
    
    default: break
    }
    
    

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }

}


