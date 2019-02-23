import {GetPeopleInfo,GetGroupInfo,MarkRead} from '../apis/server'
import store from '../store'

/**
 * @param {MQTT过来的消息} message 
 */
export const MessageProcessing=function(message){//综合处理数据
    var fromUserMsg = JSON.parse(message.payloadString);//MQTT发送过来的数据
    var fromUserId = JSON.parse(message.payloadString).data.fromUserId;//消息来源人的id
    let userLists = {}//联系人或群 头像和昵称初始化
    let ChatList = {};//当前聊天对象数据初始化
    let messageLists = {}//消息列表初始化
    let userIdOrGroupId = ''//唯一id初始化
    let curtChatObjInfo = {}//当前聊天对象的信息

    userIdOrGroupId = backUserIdOrGroupId(fromUserMsg)// 拼接唯一id

    if(fromUserId != JSON.parse(localStorage.getItem('userInfo')).id){// 如果当前发送者id 不等于自己的id 才进行渲染消息

        if(fromUserMsg.type == 1){//如果当前为消息
            if(localGet('allUserLists') == null || localGet('allUserLists')[userIdOrGroupId] == undefined){//当前没有任何一条缓存 或有缓存 但没有当前联系人记录缓存
                getUserInfoOrGroupInfo(userIdOrGroupId)// 根据唯一id获取用户信息 或群信息 再存缓存
                    .then(res=>{
                        let list = res.data.data// 请求到当前人或者群信息的数据

                        curtChatObjInfo = getCurtChatObjInfo(list,userIdOrGroupId)//得到当前人或者群的头像昵称信息

                        dataProcessing(userIdOrGroupId,fromUserMsg, curtChatObjInfo,fromUserId)//处理这条信息
                    })
            } else {//如果本地有当前联系人记录
                curtChatObjInfo = localGet('allUserLists')[userIdOrGroupId]//取本地缓存

                dataProcessing(userIdOrGroupId,fromUserMsg, curtChatObjInfo,fromUserId)//处理这条信息
            }

        } else {//如果当前为通知
            if(fromUserMsg.data.notificationType == 2048){
                getUserInfoOrGroupInfo(userIdOrGroupId)// 根据唯一id获取用户信息 或群信息
                    .then(res=>{
                        let list = res.data.data// 请求到当前人或者群信息的数据
                        processingNotice(list, userIdOrGroupId, fromUserMsg)//存储当前消息人信息
                    })
            }
        }
    }
    
}

/**
 * @param {群id或者人id} userIdOrGroupId 
 * @param {MQTT过来的数据} fromUserMsg 
 * @param {当前聊天对象的信息} curtChatObjInfo 
 * @param {消息来源人的id} fromUserId 
 */
export const dataProcessing = function(userIdOrGroupId,fromUserMsg,curtChatObjInfo,fromUserId){//提取数据处理方法
    let ChatList = setOuterMessage(userIdOrGroupId,fromUserMsg,curtChatObjInfo)//6. 会返回当前聊天对象的数据            

    let messageLists = setCurntMessage(curtChatObjInfo, fromUserMsg)//7. 返回当前联系人message消息的拼接
    
    setLocalMessageCache(ChatList,userIdOrGroupId, messageLists)//8. 用当前联系人或群的唯一id 存本地缓存

    var nowData = localGet('contactList') ==  null ? [] : localGet('contactList')//9. 取最近联系人数据缓存列表
    
    nowData = setRecentContacts(ChatList,nowData, fromUserId, messageLists)//10. 操作最近联系人列表 以及存入本地缓存
    
    store.dispatch('talking/changeMutations', {counts: nowData});//11. 通知watch数据变动
}

/**
 * @param {拼接的当前聊天对象数据} ChatList 
 * @param {当前最近联系人列表缓存} nowData 
 * @param {推送消息过来的人或者群id} fromUserId 
 * @param {当前联系人消息拼接} messageLists 
 */
export const setRecentContacts = function(ChatList,nowData,fromUserId, messageLists){//设置当前最近联系人列表
    let flag = true
    if(nowData.length != 0){//如果本地缓存不为空  用来操作最近联系人
        for(var i = 0; i < nowData.length; i++){
                if(nowData[i].itemid == ChatList.itemid){//如果当前列表存在该id
                    var curtData = nowData.splice(i,1)[0]//用一个变量接收该条本地数据
                        if(messageLists.type == 2){
                            curtData.content = '【图片】'
                        } else if (messageLists.type == 8){
                            curtData.content = '【文件】'
                        } else if (messageLists.type == 4) {
                            curtData.content = '【语音】'
                        }else{
                            curtData.content = messageLists.content
                        }
                        curtData.read = 1

                        nowData.unshift(curtData)//再把该数据放到本地缓存首位
                        localSet('contactList', nowData)//存本地缓存
                        flag = false//关闭当前缓存不为空，且没有该条数据的赋值
                        return nowData
                }
        }
        if(flag){//如果当前缓存不为空，且没有该条数据，那么添加该条数据

            nowData.unshift(ChatList)
            localSet('contactList', nowData)//存本地缓存
            return nowData
        }
        
    } else {//如果本地缓存为空
        if(fromUserId != localGet('userInfo').id){
            nowData.unshift(ChatList)
            localSet('contactList', nowData)//存本地缓存
            return nowData
        }
    }
}

/**
 * @param {拼接的当前聊天列表对象} ChatList 
 * @param {群id或者人id} userIdOrGroupId 
 * @param {当前联系人消息拼接} messageLists 
 */
export const setLocalMessageCache = function(ChatList,userIdOrGroupId,messageLists){//设置当前消息本地缓存
    if(localGet(userIdOrGroupId)){//先获取本地是否有当前人的聊天数据,如果有那么用当前的数据来push 如果没有就创建该条数据并push消息
        let nowData = localGet(userIdOrGroupId)
            nowData.messages.push(messageLists)
            //以当前唯一id为键  储存聊天信息
            localSet(userIdOrGroupId, nowData)
    } else {
        ChatList.messages.push(messageLists)
        //以当前唯一id为键  储存聊天信息
        localSet(userIdOrGroupId, ChatList)
    }
}

/**
 * @param {联系人或群 头像和昵称} curtChatObjInfo 
 * @param {MQTT过来的数据} fromUserMsg 
 */
export const setCurntMessage = function(curtChatObjInfo, fromUserMsg){//当前聊天信息拼接
    let messageLists = {}
    messageLists.avatar = curtChatObjInfo.avatar//用户头像
    messageLists.contactUnionId = fromUserMsg.data.fromUnionId//ssoid
    messageLists.contactUserId = fromUserMsg.data.fromUserId//用户id
    messageLists.content = fromUserMsg.data.content//消息内容
    messageLists.createdOnDate = fromUserMsg.data.createdOnDate//创建时间
    messageLists.direction = 2//收
    messageLists.id = fromUserMsg.data.id//消息id
    messageLists.type = fromUserMsg.data.contentType//消息类型
    messageLists.contentName = fromUserMsg.data.fileName + '.' +fromUserMsg.data.fileType//文件名
    return messageLists
}

/**
 * @param {MQTT过来的数据} fromUserMsg 
 */
export const backUserIdOrGroupId = function(fromUserMsg){//拼接唯一id
    let userIdOrGroupId = ''
    if(fromUserMsg.data.toChatRoomId){
        // console.log('群')
        userIdOrGroupId = 'Q-' + fromUserMsg.data.toChatRoomId
    } else {
        userIdOrGroupId = 'R-' + fromUserMsg.data.fromUserId
        // console.log('个人')
    }
    return userIdOrGroupId
}

/**
 * @param {请求到的个人或者群数据} list 
 * @param {群或者用户id} userIdOrGroupId 
 * @param {MQTT过来的数据} fromUserMsg 
 */
export const setOuterMessage = function (userIdOrGroupId, fromUserMsg, curtChatObjInfo){//处理消息
    let ChatList = {}

    if(userIdOrGroupId.split('-')[0] == 'Q'){//如果是群
        ChatList = splicingCurrentMessage(1, fromUserMsg, userIdOrGroupId, curtChatObjInfo)//拼接这条对象
    } else {
        ChatList = splicingCurrentMessage(0, fromUserMsg, userIdOrGroupId, curtChatObjInfo)//拼接这条对象
    }
    return ChatList
}


/**
 * @param {当前用户或者群的信息} data 
 * @param {当前用户或者群的唯一id} userIdOrGroupId 
 * @param {当前MQTT推送过来的通知} fromUserMsg 
 */
export const processingNotice = function(data, userIdOrGroupId, fromUserMsg){//处理通知
    let curtChatObjInfo = {}
    if(userIdOrGroupId.split('-')[0] == 'Q'){
        curtChatObjInfo.avatar = data.avatar
        curtChatObjInfo.chatRoomName = data.chatRoomName
        curtChatObjInfo.chatName = fromUserMsg.data.content
    } else {
        curtChatObjInfo.avatar = data.avatar
        curtChatObjInfo.chatRoomName = data.name
        curtChatObjInfo.chatName = fromUserMsg.data.content || ''
    }
    let curUserLists = localGet('allUserLists') || {}//本地储存的所有联系人信息
    curUserLists[userIdOrGroupId] = curtChatObjInfo
    localSet('allUserLists',curUserLists)

    MarkReads(fromUserMsg)//标记消息为已读
}

/**
 * @param {当前MQTT推送过来的通知} fromUserMsg 
 */
export const MarkReads = function(fromUserMsg){//标记消息为已读
    let datas = {
        "publicParameter":{
        "appKey": "12345",
        "token": localGet('userInfo').id
        },
        "id": fromUserMsg.data.id
    }
    MarkRead(datas)
        .then(res=>{
            console.log('标记为已读:', res)
        })
}

/**
 * @param {当前用户或者群的信息} data 
 * @param {当前用户或者群的唯一id} userIdOrGroupId  
 */
export const getCurtChatObjInfo = function(data, userIdOrGroupId){//拼装当前消息的头像和昵称
    let curtChatObjInfo = {}
    if(userIdOrGroupId.split('-')[0] == 'Q'){
        curtChatObjInfo.avatar = data.avatar
        curtChatObjInfo.chatRoomName = data.chatRoomName
    } else {
        curtChatObjInfo.avatar = data.avatar
        curtChatObjInfo.chatRoomName = data.name
    }
    return curtChatObjInfo
}

/**
 * @param {1为群 0为人} type 
 * @param {MQTT过来的数据} fromUserMsg 
 * @param {群id或者人id} userIdOrGroupId 
 * @param {当前用户头像} curtChatObjInfo 
 */
export const splicingCurrentMessage = function(type, fromUserMsg, userIdOrGroupId, curtChatObjInfo){//拼接当前消息对象
    let ChatList = {}
    //拼接这条对象
    ChatList.avatar = curtChatObjInfo.avatar;
    ChatList.contactName = curtChatObjInfo.chatRoomName;
    ChatList.contactUnionId = "";
    ChatList.contactUserId = type == 1 ? "" : fromUserMsg.data.fromUserId;
    if(fromUserMsg.data.contentType == 2){
        ChatList.content = '【图片】'
    } else if (fromUserMsg.data.contentType == 8){
        ChatList.content = '【文件】'
    } else if (fromUserMsg.data.contentType == 4) {
        ChatList.content = '【语音】'
    }else{
        ChatList.content = fromUserMsg.data.content
    }
    ChatList.contentType = fromUserMsg.data.contentType;
    ChatList.createdOnDate = fromUserMsg.data.createdOnDate;
    ChatList.id = type == 1 ? "" : fromUserMsg.data.toUserId;
    ChatList.messages = [];
    ChatList.read = 1;
    ChatList.remark = type == 1 ? "" : fromUserMsg.data.remark;
    ChatList.toChatRoomId = type == 1 ? fromUserMsg.data.toChatRoomId : "";
    ChatList.itemid = userIdOrGroupId//唯一id
    return ChatList
}

/**
 * @param {被查询人或者群的id} userIdOrGroupId
 */
export const getUserInfoOrGroupInfo = function(userIdOrGroupId){//获得人信息或者群信息
    return new Promise(async (resolve, reject)=>{
        if(userIdOrGroupId.split('-')[0] == 'Q'){
            let datas = {}
                datas['publicParameter.appKey'] = '12345'
                datas['publicParameter.token'] = localGet('userInfo').id//查询人的id
                datas['id'] = userIdOrGroupId.split('-')[1]//被查询群的id
            let res = await GetGroupInfo(datas)
            resolve(res)
        } else {
            let datas = {}
                datas['publicParameter.appKey'] = '12345'
                datas['publicParameter.token'] = localGet('userInfo').id//查询人的id
                datas['id'] = userIdOrGroupId.split('-')[1]//被查询人的id
            let res = await GetPeopleInfo(datas)
            resolve(res)
        }
    })
}

/**
 * @param {存储的键} name 
 * @param {存储的值} data 
 */
export const localSet = function(name,data){//设置本地缓存
    localStorage.setItem(name, JSON.stringify(data))
}

/**
 * @param {存储的键} name 
 */
export const localGet = function(name){//拿到本地缓存
    return JSON.parse(localStorage.getItem(name))
}