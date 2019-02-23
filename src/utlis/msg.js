import { GetPeopleInfo, GetGroupInfo, MarkRead, Upload, sendRoomMessage, sendMessage } from '../apis/server'
import store from '../store'
import { Toast } from 'vant';
class MessageProcessing {//收消息处理
    constructor() {
        this.message = ''
        this.fromUserMsg = ''//MQTT发送过来的数据
        this.fromUserId = ''//消息来源人的id
        this.userLists = {}//联系人或群 头像和昵称初始化
        this.ChatList = {};//当前聊天对象数据初始化
        this.messageLists = {}//消息列表初始化
        this.userIdOrGroupId = ''//唯一id初始化
        this.curtChatObjInfo = {}//当前聊天对象的信息
    }
    /**
     * @param {Object} message [MQTT过来的消息或通知,未处理]
     */
    init(message) {//初始化message
        this.message = message
        this.saveOriginalMessage(message)
        this.fromUserMsg = JSON.parse(message.payloadString)//MQTT发送过来的数据
        this.fromUserId = JSON.parse(message.payloadString).data.fromUserId//消息来源人的id
        this.userIdOrGroupId = this.backUserIdOrGroupId(this.fromUserMsg)
        this.MessageProcessing(this.fromUserMsg, this.fromUserId, this.userIdOrGroupId)
    }
    /**
     * @param {Object} fromUserMsg [MQTT过来的消息或通知,已取部分数据]
     * @param {String} fromUserId [消息来源人的id]
     * @param {String} userIdOrGroupId [群id或者人id]
     */
    MessageProcessing(fromUserMsg, fromUserId, userIdOrGroupId) {
        if (fromUserId != this.localGet('userInfo').id) {// 如果当前发送者id 不等于自己的id 才进行渲染消息

            if (fromUserMsg.type == 1) {//如果当前为消息
                if (this.localGet('allUserLists') == null || this.localGet('allUserLists')[userIdOrGroupId] == undefined) {//当前没有任何一条缓存 或有缓存 但没有当前联系人记录缓存
                    this.getUserInfoOrGroupInfo(userIdOrGroupId)// 根据唯一id获取用户信息 或群信息 再存缓存
                        .then(res => {
                            let list = res.data.data// 请求到当前人或者群信息的数据

                            this.curtChatObjInfo = this.getCurtChatObjInfo(list, userIdOrGroupId)//得到当前人或者群的头像昵称信息

                            this.dataProcessing(userIdOrGroupId, fromUserMsg, this.curtChatObjInfo, fromUserId)//处理这条信息
                        })
                } else {//如果本地有当前联系人记录
                    this.curtChatObjInfo = this.localGet('allUserLists')[userIdOrGroupId]//取本地缓存

                    this.dataProcessing(userIdOrGroupId, fromUserMsg, this.curtChatObjInfo, fromUserId)//处理这条信息
                }

            } else {//如果当前为通知
                if (fromUserMsg.data.notificationType == 2048) {
                    this.getUserInfoOrGroupInfo(userIdOrGroupId)// 根据唯一id获取用户信息 或群信息
                        .then(res => {
                            let list = res.data.data// 请求到当前人或者群信息的数据
                            this.processingNotice(list, userIdOrGroupId, fromUserMsg)//存储当前消息人信息
                        })
                }
            }
        }
    }
    /**
     * @param {Object} message [MQTT过来的消息或通知,未处理]
     */
    saveOriginalMessage(message) {//每条原始消息都存入本地缓存，防止数据变动导致数据无法重构的问题出现
        let fromUserMsg = JSON.parse(message.payloadString)
        let fromUserMsgType = fromUserMsg.type
        let fromUserId = fromUserMsg.data.fromUserId
        let toChatRoomId = fromUserMsg.data.toChatRoomId || ''
        let curLoclData = this.localGet('oldMessage') || {}

        if (fromUserMsgType == 1) {//如果为消息
            if (toChatRoomId == '') {//如果是人消息
                fromUserId = 'R-' + fromUserId
                if (curLoclData[fromUserId] == undefined) {
                    let curLoclDataArray = []
                    curLoclDataArray.push(fromUserMsg)
                    curLoclData[fromUserId] = curLoclDataArray
                } else {
                    curLoclData[fromUserId].unshift(fromUserMsg)
                }
            } else {//如果是群消息
                toChatRoomId = 'Q-' + toChatRoomId
                if (curLoclData[toChatRoomId] == undefined) {
                    let curLoclDataArray = []
                    curLoclDataArray.push(fromUserMsg)
                    curLoclData[toChatRoomId] = curLoclDataArray
                } else {
                    curLoclData[toChatRoomId].unshift(fromUserMsg)
                }
            }
            
            this.localSet('oldMessage', curLoclData)
        }
    }

    /**
     * @param {Object} fromUserMsg [MQTT过来的消息或通知,已取部分数据]
     */
    backUserIdOrGroupId(fromUserMsg) {//拼接唯一id
        let userIdOrGroupId = ''
        if (fromUserMsg.data.toChatRoomId) {
            // console.log('群')
            userIdOrGroupId = 'Q-' + fromUserMsg.data.toChatRoomId
        } else {
            userIdOrGroupId = 'R-' + fromUserMsg.data.fromUserId
            // console.log('个人')
        }
        return userIdOrGroupId
    }

    /**
     * @param {String} userIdOrGroupId [群id或者人id]
     * @param {Object} fromUserMsg [MQTT过来的消息或通知,已取部分数据]
     * @param {Object} curtChatObjInfo [当前聊天对象的信息]
     * @param {String} fromUserId [消息来源人的id]
     */
    dataProcessing(userIdOrGroupId, fromUserMsg, curtChatObjInfo, fromUserId) {//提取数据处理方法
        let ChatList = this.setOuterMessage(fromUserMsg, curtChatObjInfo)//6. 会返回当前聊天对象的数据     

        let messageLists = this.setCurntMessage(curtChatObjInfo, fromUserMsg)//7. 返回当前联系人message消息的拼接

        this.setLocalMessageCache(ChatList, userIdOrGroupId, messageLists)//8. 用当前联系人或群的唯一id 存本地缓存

        var nowData = this.localGet('contactList') == null ? [] : this.localGet('contactList')//9. 取最近联系人数据缓存列表

        nowData = this.setRecentContacts(ChatList, nowData, fromUserId, messageLists)//10. 操作最近联系人列表 以及存入本地缓存

        store.dispatch('talking/changeMutations', { counts: nowData });//11. 通知watch数据变动
    }
    /**
     * @param {Object} ChatList [拼接的当前聊天对象数据]
     * @param {Object} nowData [当前最近联系人列表缓存]
     * @param {String} fromUserId [推送消息过来的人或者群id]
     * @param {Object} messageLists [当前联系人消息拼接]
     */
    setRecentContacts(ChatList, nowData, fromUserId, messageLists) {//设置当前最近联系人列表
        let flag = true
        if (nowData.length != 0) {//如果本地缓存不为空  用来操作最近联系人
            for (var i = 0; i < nowData.length; i++) {
                if (nowData[i].itemid == ChatList.itemid) {//如果当前列表存在该id
                    var curtData = nowData.splice(i, 1)[0]//用一个变量接收该条本地数据
                    if (messageLists.type == 2) {
                        curtData.content = '【图片】'
                    } else if (messageLists.type == 8) {
                        curtData.content = '【文件】'
                    } else if (messageLists.type == 4) {
                        curtData.content = '【语音】'
                    } else {
                        curtData.content = messageLists.content
                    }
                    curtData.read = 1

                    nowData.unshift(curtData)//再把该数据放到本地缓存首位
                    this.localSet('contactList', nowData)//存本地缓存
                    flag = false//关闭当前缓存不为空，且没有该条数据的赋值
                    return nowData
                }
            }
            if (flag) {//如果当前缓存不为空，且没有该条数据，那么添加该条数据

                nowData.unshift(ChatList)
                this.localSet('contactList', nowData)//存本地缓存
                return nowData
            }

        } else {//如果本地缓存为空
            if (fromUserId != this.localGet('userInfo').id) {
                nowData.unshift(ChatList)
                this.localSet('contactList', nowData)//存本地缓存
                return nowData
            }
        }
    }
    /**
     * @param {Object} ChatList [拼接的当前聊天列表对象]
     * @param {String} userIdOrGroupId [群id或者人id]
     * @param {Object} messageLists [当前联系人消息拼接]
     */
    setLocalMessageCache(ChatList, userIdOrGroupId, messageLists) {//设置当前消息本地缓存
        if (this.localGet(userIdOrGroupId)) {//先获取本地是否有当前人的聊天数据,如果有那么用当前的数据来push 如果没有就创建该条数据并push消息
            let nowData = this.localGet(userIdOrGroupId)
            nowData.messages.push(messageLists)
            //以当前唯一id为键  储存聊天信息
            this.localSet(userIdOrGroupId, nowData)
        } else {
            ChatList.messages.push(messageLists)
            //以当前唯一id为键  储存聊天信息
            this.localSet(userIdOrGroupId, ChatList)
        }
    }
    /**
     * @param {Object} curtChatObjInfo [联系人或群头像和昵称]
     * @param {Object} fromUserMsg [MQTT过来的消息或通知,已取部分数据]
     */
    setCurntMessage(curtChatObjInfo, fromUserMsg) {//当前聊天信息拼接
        let messageLists = {}
        messageLists.avatar = curtChatObjInfo.avatar//用户头像
        messageLists.contactUnionId = fromUserMsg.data.fromUnionId//ssoid
        messageLists.contactUserId = fromUserMsg.data.fromUserId//用户id
        messageLists.content = fromUserMsg.data.content//消息内容
        messageLists.createdOnDate = fromUserMsg.data.createdOnDate//创建时间
        messageLists.direction = 2//收
        messageLists.id = fromUserMsg.data.id//消息id
        messageLists.type = fromUserMsg.data.contentType//消息类型
        messageLists.contentName = fromUserMsg.data.fileName + '.' + fromUserMsg.data.fileType//文件名
        return messageLists
    }
    /**
     * @param {Object} list [请求到的个人或者群数据]
     * @param {String} userIdOrGroupId [群或者用户id]
     * @param {Object} fromUserMsg [MQTT过来的消息或通知,已取部分数据]
     */
    setOuterMessage(fromUserMsg, curtChatObjInfo) {//处理消息
        let ChatList = {}
        let toChatRoomId = fromUserMsg.data.toChatRoomId
        if (toChatRoomId != undefined) {//如果是群
            ChatList = this.splicingCurrentGroupMessage(fromUserMsg, curtChatObjInfo)//拼接这条群消息对象
        } else {
            ChatList = this.splicingCurrentPeopleMessage(fromUserMsg, curtChatObjInfo)//拼接这条人消息对象
        }
        return ChatList
    }
    /**
     * @param {Object} data [当前用户或者群的信息]
     * @param {String} userIdOrGroupId [当前用户或者群的唯一id]
     * @param {Object} fromUserMsg [当前MQTT推送过来的通知,已取部分数据]
     */
    processingNotice(data, userIdOrGroupId, fromUserMsg) {//处理通知
        let curtChatObjInfo = {}
        if (userIdOrGroupId.split('-')[0] == 'Q') {
            curtChatObjInfo.avatar = data.avatar
            curtChatObjInfo.chatRoomName = data.chatRoomName
            curtChatObjInfo.chatName = fromUserMsg.data.content
        } else {
            curtChatObjInfo.avatar = data.avatar
            curtChatObjInfo.chatRoomName = data.name
            curtChatObjInfo.chatName = fromUserMsg.data.content || ''
        }
        let curUserLists = this.localGet('allUserLists') || {}//本地储存的所有联系人信息
        curUserLists[userIdOrGroupId] = curtChatObjInfo
        this.localSet('allUserLists', curUserLists)

        this.MarkReads(fromUserMsg)//标记消息为已读
    }
    /**
     * @param {Object} fromUserMsg [当前MQTT推送过来的通知,已取部分数据]
     */
    MarkReads(fromUserMsg) {//标记消息为已读
        let datas = {
            "publicParameter": {
                "appKey": store.state.userinfo.userInfo.appKey,
                "token": this.localGet('userInfo').id
            },
            "id": fromUserMsg.data.id
        }
        MarkRead(datas)
            .then(res => {
                console.log('标记为已读:', res)
            })
    }
    /**
     * @param {Object} data [当前用户或者群的信息]
     * @param {String} userIdOrGroupId [当前用户或者群的唯一id]
     */
    getCurtChatObjInfo(data, userIdOrGroupId) {//拼装当前消息的头像和昵称
        let curtChatObjInfo = {}
        if (userIdOrGroupId.split('-')[0] == 'Q') {
            curtChatObjInfo.avatar = data.avatar
            curtChatObjInfo.chatRoomName = data.chatRoomName
        } else {
            curtChatObjInfo.avatar = data.avatar
            curtChatObjInfo.chatRoomName = data.name
        }
        return curtChatObjInfo
    }
    /**
     * @param {Object} fromUserMsg [当前MQTT推送过来的通知,已取部分数据]
     * @param {Object} curtChatObjInfo [当前用户头像]
     */
    splicingCurrentPeopleMessage(fromUserMsg, curtChatObjInfo) {//拼接当前人消息对象
        let ChatList = {}
        //拼接这条对象
        ChatList.avatar = curtChatObjInfo.avatar;
        ChatList.contactName = curtChatObjInfo.chatRoomName;
        ChatList.contactUnionId = "";
        ChatList.contactUserId = fromUserMsg.data.fromUserId;
        if (fromUserMsg.data.contentType == 2) {
            ChatList.content = '【图片】'
        } else if (fromUserMsg.data.contentType == 8) {
            ChatList.content = '【文件】'
        } else if (fromUserMsg.data.contentType == 4) {
            ChatList.content = '【语音】'
        } else {
            ChatList.content = fromUserMsg.data.content
        }
        ChatList.contentType = fromUserMsg.data.contentType;
        ChatList.createdOnDate = fromUserMsg.data.createdOnDate;
        ChatList.id = fromUserMsg.data.toUserId;
        ChatList.messages = [];
        ChatList.read = 1;
        ChatList.remark = fromUserMsg.data.remark;
        ChatList.toChatRoomId = "";
        ChatList.itemid = 'R-' + fromUserMsg.data.fromUserId//唯一id
        return ChatList
    }
    /**
     * @param {Object} fromUserMsg [当前MQTT推送过来的通知,已取部分数据]
     * @param {Object} curtChatObjInfo [当前用户头像]
     */
    splicingCurrentGroupMessage(fromUserMsg, curtChatObjInfo) {//拼接当前群消息对象
        let ChatList = {}
        //拼接这条对象
        ChatList.avatar = curtChatObjInfo.avatar;
        ChatList.contactName = curtChatObjInfo.chatRoomName;
        ChatList.contactUnionId = "";
        ChatList.contactUserId = "";
        if (fromUserMsg.data.contentType == 2) {
            ChatList.content = '【图片】'
        } else if (fromUserMsg.data.contentType == 8) {
            ChatList.content = '【文件】'
        } else if (fromUserMsg.data.contentType == 4) {
            ChatList.content = '【语音】'
        } else {
            ChatList.content = fromUserMsg.data.content
        }
        ChatList.contentType = fromUserMsg.data.contentType;
        ChatList.createdOnDate = fromUserMsg.data.createdOnDate;
        ChatList.id = "";
        ChatList.messages = [];
        ChatList.read = 1;
        ChatList.remark = "";
        ChatList.toChatRoomId = fromUserMsg.data.toChatRoomId;
        ChatList.itemid = 'Q-' + fromUserMsg.data.toChatRoomId//唯一id
        return ChatList
    }
    /**
     * @param {String} userIdOrGroupId [被查询人或者群的id]
     */
    getUserInfoOrGroupInfo(userIdOrGroupId) {//获得人信息或者群信息
        return new Promise((resolve, reject) => {
            if (userIdOrGroupId.split('-')[0] == 'Q') {
                let datas = {}
                datas['publicParameter.appKey'] = store.state.userinfo.userInfo.appKey
                datas['publicParameter.token'] = this.localGet('userInfo').id//查询人的id
                datas['id'] = userIdOrGroupId.split('-')[1]//被查询群的id
                GetGroupInfo(datas)
                    .then(res => {
                        let status = res.data.status
                        if (status == 200) {
                            resolve(res)
                        } else {
                            Toast(res.data.error)
                        }
                    })
            } else {
                let datas = {}
                datas['publicParameter.appKey'] = store.state.userinfo.userInfo.appKey
                datas['publicParameter.token'] = this.localGet('userInfo').id//查询人的id
                datas['id'] = userIdOrGroupId.split('-')[1]//被查询人的id
                GetPeopleInfo(datas)
                    .then(res => {
                        let status = res.data.status
                        if (status == 200) {
                            resolve(res)
                        } else {
                            Toast(res.data.error)
                        }
                    })
            }
        })
    }
    /**
     * @param {String} name [存储的键]
     * @param {Object} data [存储的值]
     */
    localSet(name, data) {//设置本地缓存
        localStorage.setItem(name, JSON.stringify(data))
    }
    /**
     * @param {String} name [存储的键]
     */
    localGet(name) {//拿到本地缓存
        return JSON.parse(localStorage.getItem(name))
    }
}

class SendMessage {//发消息处理
    constructor() {
        // 读取当前用户信息
        this.userInfo = {};
        this.MessageProcessing = new MessageProcessing()
    }
    init() {
        this.userInfo = JSON.parse(localStorage.getItem('userInfo'))
    }
    isHaveList(itemId) {  //判断消息发送是新的还是旧的，传来的itemId是一个拼装过的唯一id
        return new Promise(async (resolve, reject) => {
            let reqInfo = await this.MessageProcessing.getUserInfoOrGroupInfo(itemId);
            let curtChatObjInfo = this.MessageProcessing.getCurtChatObjInfo(reqInfo.data.data, itemId);
            let isChanRoom = itemId.indexOf("Q");
            var fromId = itemId.split('-')[1];
            var localData = JSON.parse(localStorage.getItem(itemId)) || [];
            var isFromChatRoom = JSON.parse(localStorage.getItem('isFromChatRoom'));
            var obj = {};
            if (localData == '') {
                if (isChanRoom != -1) {
                    let idList = itemId;//接收一个拼接的唯一id 可能是群 可能是个人
                    obj.avatar = curtChatObjInfo.avatar;
                    obj.contactName = curtChatObjInfo.chatRoomName;
                    obj.contactUnionId = "";
                    obj.contactUserId = "";
                    obj.content = "";
                    obj.contentType = "";
                    obj.createdOnDate = "";
                    obj.id = "";
                    obj.messages = [];
                    obj.read = 0;
                    obj.remark = "";
                    obj.toChatRoomId = fromId;
                    obj.itemid = idList;//唯一id
                    localStorage.setItem(itemId, JSON.stringify(obj));
                    // localContactList.itemid.split('-')[1] = fromId;   //fromId
                    // this.localContactList = obj;   //当前条缓存
                    resolve(obj)
                } else {
                    let idList = itemId;//接收一个拼接的唯一id 可能是群 可能是个人
                    obj.avatar = curtChatObjInfo.avatar;
                    obj.contactName = curtChatObjInfo.chatRoomName;
                    obj.contactUnionId = "";
                    obj.contactUserId = "";
                    obj.content = "";
                    obj.contentType = "";
                    obj.createdOnDate = "";
                    obj.id = fromId;
                    obj.messages = [];
                    obj.read = 0;
                    obj.remark = "";
                    obj.toChatRoomId = "";
                    obj.itemid = idList;//唯一id
                    obj.isFromChatRoom = isFromChatRoom == true ? true : false;
                    localStorage.setItem(itemId, JSON.stringify(obj));
                    // localContactList.itemid.split('-')[1] = fromId;   //fromId
                    // this.localContactList = obj;   //当前条缓存
                    resolve(obj)
                }
            } else {
                // localContactList.itemid.split('-')[1] = fromId;   //fromId
                localData.isFromChatRoom = isFromChatRoom == true ? true : false;
                // this.localContactList = localData;   //当前条缓存
                resolve(localData)
            }
        })
    }
    async sendText(isPerson, itemId, contentText, userId) {    //发送文字表情
        let localContactList = await this.isHaveList(itemId);
        let isFromChatRoom = localContactList.isFromChatRoom;
        let fromChatroomName = JSON.parse(localStorage.getItem("fromChatroomName"));
        if (isPerson == 'person') {
            var datas = {
                publicParameter: {
                    appKey: store.state.userinfo.userInfo.appKey,
                    token: store.state.userinfo.userInfo.token,
                    vid: store.state.userinfo.userInfo.vid
                },
                content: contentText,
                contentTypeEnum: 'TEXT',
                toUserId: localContactList.itemid.split('-')[1],
                toVid: localContactList.itemid.split('-')[1],
                sourceName: isFromChatRoom == true ? fromChatroomName : ''
            }
            // 接收数据
            var data = await sendMessage(datas);
        } if (isPerson == 'chatRoom') {
            var datas = {
                publicParameter: {
                    appKey: store.state.userinfo.userInfo.appKey,
                    token: store.state.userinfo.userInfo.token
                },
                content: contentText,
                contentTypeEnum: 'TEXT',
                toChatRoomId: localContactList.itemid.split('-')[1]
            }
            // 接收数据
            var data = await sendRoomMessage(datas);
        }
        if (data.data.status == 200) {
            let oneMseeage = {
                id: data.data.data,
                direction: 1,
                contactUserId: this.userInfo.id,
                contactUnionId: this.userInfo.unionId,
                type: 1,
                content: contentText,
                avatar: this.userInfo.avatar,
                createdOnDate: data.data.timestamp
            }
            // mixin存储消息到local
            this.saveMessage(localContactList, oneMseeage, contentText, contentText, data.data.timestamp, itemId);
            // 发送成功后更新最近联系列表'contactList'
            this.saveRecentContactList(localContactList, oneMseeage, itemId, userId);
            return oneMseeage;
        } else if (data == "Error: 连接到服务器失败") {
            return {
                status: false,
                msg: "未连接网络，请稍后再试"
            }
        } else {
            return {
                status: false,
                msg: data.data.error
            }
        }
    }
    async sendPhoto(isPerson, file, itemId, userId) {     //发送图片
        let localContactList = await this.isHaveList(itemId);
        let formData = new FormData();
        formData.append('type', '1');
        formData.append('appkey', '1174726');
        formData.append('name', file.file.name);
        formData.append('file', file.file);
        let imgData = await Upload(formData);
        if (imgData.status) {
            // 图片url
            var imgUrl = `http://mservice.moerlong.com:8800/MAF.MELMS.Utility.File.FileServiceCom/api/fileservice/getfile?id=${imgData.data.id}`;
            let isFromChatRoom = localContactList.isFromChatRoom;
            let fromChatroomName = JSON.parse(localStorage.getItem("fromChatroomName"));
            if (isPerson == 'person') {
                let imgDatas = {
                    publicParameter: {
                        appKey: store.state.userinfo.userInfo.appKey,
                        token: store.state.userinfo.userInfo.token,
                        vid: store.state.userinfo.userInfo.vid,
                    },
                    content: imgData.data.id,
                    contentTypeEnum: 'IMAGE',
                    toUserId: localContactList.itemid.split('-')[1],
                    toVid: localContactList.itemid.split('-')[1],
                    sourceName: isFromChatRoom == true ? fromChatroomName : ''
                }
                var data = await sendMessage(imgDatas);
            } if (isPerson == 'chatRoom') {
                let imgDatas = {
                    publicParameter: {
                        appKey: store.state.userinfo.userInfo.appKey,
                        token: store.state.userinfo.userInfo.token
                    },
                    content: imgData.data.id,
                    contentTypeEnum: 'IMAGE',
                    toChatRoomId: localContactList.itemid.split('-')[1]
                }
                var data = await sendRoomMessage(imgDatas);
            }
            if (data.data.status == 200) {
                let oneMseeage = {
                    id: data.data.data,
                    direction: 1,
                    contactUserId: this.userInfo.id,
                    contactUnionId: this.userInfo.unionId,
                    type: 2,
                    content: imgUrl,
                    avatar: this.userInfo.avatar,
                    createdOnDate: data.data.timestamp
                }
                // 存储消息到local
                this.saveMessage(localContactList, oneMseeage, '【图片】', 2, data.data.timestamp, itemId);
                // 发送成功后更新最近联系列表'contactList'
                this.saveRecentContactList(localContactList, oneMseeage, itemId, userId);
                return oneMseeage;
            } else if (data == "Error: 连接到服务器失败") {
                return {
                    status: false,
                    msg: "未连接网络，请稍后再试"
                }
            } else {
                return {
                    status: false,
                    msg: data.data.error
                }
            }
        } else {
            return {
                status: false,
                msg: imgData.Message
            }
        }
    }
    async sendFile(isPerson, file, itemId, userId) {      //发送文件
        let localContactList = await this.isHaveList(itemId);
        let formData = new FormData();
        formData.append('type', '2');
        formData.append('appkey', '1174726');
        formData.append('name', file.file.name);
        formData.append('file', file.file);
        let fileData = await Upload(formData);
        if (fileData.status) {
            // 文件url
            var fileUrl = `http://mservice.moerlong.com:8800/MAF.MELMS.Utility.File.FileServiceCom/api/fileservice/getfile?id=${fileData.data.id}`;
            let isFromChatRoom = localContactList.isFromChatRoom;
            let fromChatroomName = JSON.parse(localStorage.getItem("fromChatroomName"));
            if (isPerson == 'person') {
                let fileDatas = {
                    publicParameter: {
                        appKey: store.state.userinfo.userInfo.appKey,
                        token: store.state.userinfo.userInfo.token,
                        vid: store.state.userinfo.userInfo.vid,
                    },
                    content: fileData.data.id,
                    contentTypeEnum: 'FILE',
                    toUserId: localContactList.itemid.split('-')[1],
                    toVid: localContactList.itemid.split('-')[1],
                    sourceName: isFromChatRoom == true ? fromChatroomName : ''
                }
                var data = await sendMessage(fileDatas);
            } if (isPerson == 'chatRoom') {
                let fileDatas = {
                    publicParameter: {
                        appKey: store.state.userinfo.userInfo.appKey,
                        token: store.state.userinfo.userInfo.token
                    },
                    content: fileData.data.id,
                    contentTypeEnum: 'FILE',
                    toChatRoomId: localContactList.itemid.split('-')[1]
                }
                var data = await sendRoomMessage(fileDatas);
            }
            if (data.data.status == 200) {
                let oneMseeage = {
                    id: data.data.data,
                    direction: 1,
                    contactUserId: this.userInfo.id,
                    contactUnionId: this.userInfo.unionId,
                    type: 8,
                    content: fileUrl,
                    contentName: `${fileData.data.name}.${fileData.data.formatType}`,
                    avatar: this.userInfo.avatar,
                    createdOnDate: data.data.timestamp
                }
                // mixin存储消息到local
                this.saveMessage(localContactList, oneMseeage, '【文件】', 8, data.data.timestamp, itemId);
                // 发送成功后更新最近联系列表'contactList'
                this.saveRecentContactList(localContactList, oneMseeage, itemId, userId);
                return oneMseeage;
            } else if (data == "Error: 连接到服务器失败") {
                return {
                    status: false,
                    msg: "未连接网络，请稍后再试"
                }
            } else {
                return {
                    status: false,
                    msg: data.data.error
                }
            }
        } else {
            return {
                status: false,
                msg: fileData.Message
            }
        }
    }
    saveRecentContactList(localContactList, msgInfo, itemId, userId) {     //操作最近联系人列表
        this.isHaveList(itemId, userId);
        let isHomology = true;
        let storageContactList = JSON.parse(localStorage.getItem('contactList'));
        if (storageContactList) {
            storageContactList.forEach((element, i) => {
                // 同一聊天室
                if (element.itemid == itemId) {
                    switch (msgInfo.type) {
                        case 1:
                            element.content = msgInfo.content;
                            element.contentType = msgInfo.content;
                            break;
                        case 2:
                            element.content = '【图片】';
                            element.contentType = 2;
                            break;
                        case 8:
                            element.content = '【文件】';
                            element.contentType = 8;
                            break;
                        default:
                            break;
                    }
                    element.messages.push(msgInfo);
                    storageContactList.unshift(...storageContactList.splice(i, i + 1));
                    isHomology = false;
                    return;
                }
            });
            if (isHomology) {
                storageContactList.unshift(localContactList);
            }
            localStorage.setItem('contactList', JSON.stringify(storageContactList));
        } else {
            localStorage.setItem('contactList', JSON.stringify([localContactList]));
        }
    }
    saveMessage(localContactList, oneMseeage, contentText, type, time, itemId) {     //储存到本地
        localContactList.messages.push(oneMseeage);
        localContactList.content = contentText;
        localContactList.contentType = type;
        localContactList.createdOnDate = time;
        localStorage.setItem(itemId, JSON.stringify(localContactList));
    }

}

class AllClass {
    ReceiveMessage() {//接收消息
        return new MessageProcessing()
    }
    SendMessage() {//发消息
        return new SendMessage()
    }
}

let allclass = new AllClass()
export const receivemessage = allclass.ReceiveMessage()
export const sendmessage = allclass.SendMessage()