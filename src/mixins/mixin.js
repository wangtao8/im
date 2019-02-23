import "../assets/js/mqttws31";
import {Upload, sendMessage,GetGroupInfo,GetInfos,sendRoomMessage} from '../apis/server'
import { Toast } from 'vant'
import {getUserInfoOrGroupInfo, getCurtChatObjInfo} from './msg'

export const GetInfo = {
    methods: {
        /**
         * 判断是群消息还是个人消息
         * @param {是否为群消息} personOrGroup 
         * @param {Object} msg 
         * @param {Object} data 
         * @param {Object} datas 
         */
    AllChatInfo(personOrGroup, msg, data, datas){
            return new Promise(async (resolve, reject) => {
                if (personOrGroup) {
                    datas['id'] = data.toChatRoomId;
                    
                    let res = await GetGroupInfo(datas);
                        msg = await this.GetGroupInfo(res, msg, data)
                  } else {
                    datas['id'] = data.fromUserId;
        
                    let res = await GetInfos(datas);
                        msg = await this.GetPeopleInfo(res, msg, data)
                  }
                  msg["read"] = 1;
                  msg["remark"]="";
                  msg["content"] = data.content;
                  msg["createdOnDate"] = data.createdOnDate;
                  msg["messages"] = [];
                  resolve(msg)
            })
        },
        /**
         * 新的群消息字段拼装
         * @param {Object} res 
         * @param {Object} msg 
         * @param {Object} data 
         */
        GetGroupInfo(res, msg, data){
            return new Promise((resolve, reject) =>{
                msg["contactName"] = res.data.data.chatRoomName;
                msg["toChatRoomId"] = data.toChatRoomId;
                msg["contactUserId"] = "";
                msg["contactUnionId"]= "";
                msg["id"]="";
                msg["avatar"] = res.data.data.avatar;
                resolve(msg)
            })
        },
        /**
         * 新的个人消息字段拼装
         * @param {Object} res 
         * @param {Object} msg 
         * @param {Object} data 
         */
        GetPeopleInfo(res, msg, data){
            return new Promise((resolve, reject) => {
                msg["toChatRoomId"] = "";
                msg["contactName"] = res.data.data.name;
                msg["contactUserId"] = res.data.data.id;
                msg["id"]=res.data.data.id;
                msg["contactUnionId"]= res.data.data.unionId;
                msg["avatar"] = res.data.data.avatar;
                resolve(msg)
            })
        }
    }
}

export const TimeFiltering = {//时间格式化
    created(){
        Date.prototype.format = function(fmt) { 
            var o = { 
               "M+" : this.getMonth()+1,                 //月份 
               "d+" : this.getDate(),                    //日 
               "h+" : this.getHours(),                   //小时 
               "m+" : this.getMinutes(),                 //分 
               "s+" : this.getSeconds(),                 //秒 
               "q+" : Math.floor((this.getMonth()+3)/3), //季度 
               "S"  : this.getMilliseconds()             //毫秒 
           }; 
           if(/(y+)/.test(fmt)) {
                   fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
           }
            for(var k in o) {
               if(new RegExp("("+ k +")").test(fmt)){
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
                }
            }
           return fmt; 
       }
    },
    methods: {
        ChangeTime(time){
            time = time != '' ? time : new Date().format("hh:mm")
            let nowTime = new Date().getTime()
            // let oldTime = new Date(time).getTime()
            let oldTime = new Date(time.replace(/-/g,'/')).getTime()//解决苹果手机兼容问题
            let oneDay = 24*60*60*1000
            let twoDay = 2*24*60*60*1000
            let oneWeek = 7*24*60*60*1000
            let nowDay = new Date(time.replace(/-/g,'/')).getDay()
            if (nowTime - oldTime < oneDay){
                return new Date(time.replace(/-/g,'/')).format("hh:mm")
            } else if ( nowTime - oldTime < oneWeek ){
                switch (nowDay) {
                    case 0:
                    return ('周日' + ' ' + new Date(time.replace(/-/g,'/')).format("hh:mm"));
                    case 1:
                    return ('周一' + ' ' + new Date(time.replace(/-/g,'/')).format("hh:mm"));
                    case 2:
                    return ('周二' + ' ' + new Date(time.replace(/-/g,'/')).format("hh:mm"));
                    case 3:
                    return ('周三' + ' ' + new Date(time.replace(/-/g,'/')).format("hh:mm"));
                    case 4:
                    return ('周四' + ' ' + new Date(time.replace(/-/g,'/')).format("hh:mm"));
                    case 5:
                    return ('周五' + ' ' + new Date(time.replace(/-/g,'/')).format("hh:mm"));
                    case 6:
                    return ('周六' + ' ' + new Date(time.replace(/-/g,'/')).format("hh:mm"));
                }
            } else {
                // return new Date(time).format("yyyy-MM-dd hh:mm:ss")
                return new Date(time.replace(/-/g,'/')).format("yyyy-MM-dd")
            }
        }
    }
}

export const ChatSplice = {//拼接数据
    created(){
        Date.prototype.format = function(fmt) { 
            var o = { 
            "M+" : this.getMonth()+1,                 //月份 
            "d+" : this.getDate(),                    //日 
            "h+" : this.getHours(),                   //小时 
            "m+" : this.getMinutes(),                 //分 
            "s+" : this.getSeconds(),                 //秒 
            "q+" : Math.floor((this.getMonth()+3)/3), //季度 
            "S"  : this.getMilliseconds()             //毫秒 
        }; 
        if(/(y+)/.test(fmt)) {
                fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
        }
            for(var k in o) {
            if(new RegExp("("+ k +")").test(fmt)){
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
                }
            }
        return fmt; 
        }
    },
    methods:{
        searchChatSplice(res){
            let NewContactList2 = []
            for(var i = 0; i < res.length; i++){
                var obj = {}
                    obj["id"] = res[i].id;
                    obj["avatar"] = res[i].avatar;
                    obj["contactName"] = res[i].chatRoomName;
                    obj["contactUnionId"] = '';
                    obj["contactUserId"] = res[i].id;
                    obj["content"] = "";
                    obj["createdOnDate"] = '';
                    obj["messages"] = [];
                    obj["read"] = null;
                    obj["remark"] = '';
                    obj["toChatRoomId"] = res[i].id;
                    NewContactList2.push(obj)
            }
            this.$store.dispatch('search/changeMutations',NewContactList2)
        },
        PsearchChatSplice(res){
            return new Promise((resolve,reject)=>{
                let list = []
                for(var i = 0; i < res.length; i++){//拼装全部数据为标准格式存入
                    var obj = {}
                        obj["id"] = res[i].id;
                        obj["avatar"] = res[i].avatar;
                        obj["contactName"] = res[i].contactName;
                        obj["contactUnionId"] = res[i].contactUnionId;
                        obj["contactUserId"] = res[i].contactUserId;
                        obj["content"] = "";
                        obj["createdOnDate"] = "";
                        obj["messages"] = [];
                        obj["read"] = null;
                        obj["remark"] = res[i].remark;
                        obj["toChatRoomId"] = "";
                        list.push(obj)
                }
                this.$store.dispatch('search/changeMutations',list)
                resolve(list)
            })
        },
        /**
         * 整理单条聊天信息
         * @param {本地缓存列表} list 
         * @param {当前聊天数据} contact 
         * @param {1为群聊天 0为个人聊天} type 
         */
        setSessions(list, contact, type){
            if (!list) {
                list = [];
            }
            let len = list.length;
            let isFromChatRoom = localStorage.getItem('isFromChatRoom')
            let obj = {};
            if (len) {
                let flag = true;
                for (let i = 0; i < len; i++) {
                    if (list[i].id == contact.id || list[i].toChatRoomId == contact.id) {
                    obj = list[i];
                    list.splice(i, 1);
                    flag = false;
                    break;
                    }
                }
                if (flag) {
                        obj["id"] = contact.id;
                        obj["avatar"] = contact.avatar;
                        obj["contactName"] = type == 1 ? contact.chatRoomName : contact.contactName;
                        obj["contactUnionId"] = type == 1 ? '' : contact.contactUnionId;
                        obj["contactUserId"] = type == 1 ? contact.id : contact.contactUserId;
                        obj["content"] = "";
                        obj["createdOnDate"] = '';
                        obj["messages"] = [];
                        obj["read"] = null;
                        obj["fromChatRoom"] = type == 0 && isFromChatRoom == 'false' ? undefined : JSON.parse(localStorage.getItem('oldImTitle'));
                        obj["remark"] = type == 1 ? '' : contact.remark;
                        obj["toChatRoomId"] = type == 1 ? contact.id : '';
                    } 
                        list.unshift(obj);
                }else{
                        obj["id"] = contact.id;
                        obj["avatar"] = contact.avatar;
                        obj["contactName"] = type == 1 ? contact.chatRoomName : contact.contactName;
                        obj["contactUnionId"] = type == 1 ? '' : contact.contactUnionId;
                        obj["contactUserId"] = type == 1 ? contact.id : contact.contactUserId;
                        obj["content"] = "";
                        obj["createdOnDate"] = new Date().format('yyyy-MM-dd hh:mm:ss');
                        obj["messages"] = [];
                        obj["read"] = null;
                        obj["fromChatRoom"] = type == 0 && isFromChatRoom == 'false' ? undefined : JSON.parse(localStorage.getItem('oldImTitle'));
                        obj["remark"] = type == 1 ? '' : contact.remark;
                        obj["toChatRoomId"] = type == 1 ? contact.id : '';
                        list.unshift(obj);
                }
                localStorage.setItem('contactList', JSON.stringify(list));
        }
    }
}

export const SendMessage = {
    created() {
        // 读取当前用户信息
        this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
    },
    methods: {
        isHaveList(itemId) {  //判断消息发送是新的还是旧的，传来的itemId是一个拼装过的唯一id
            return new Promise(async (resolve, reject) =>{
                let reqInfo = await getUserInfoOrGroupInfo(itemId);
                let curtChatObjInfo = getCurtChatObjInfo(reqInfo.data.data, itemId); 
                let isChanRoom = itemId.indexOf("Q");
                var fromId = itemId.split('-')[1];
                var localAllList = JSON.parse(localStorage.getItem(itemId)) || [];
                var isFromChatRoom = JSON.parse(localStorage.getItem('isFromChatRoom'));
                var obj = {};
                if (localAllList == '') {
                    if( isChanRoom != -1 ) {
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
                        localStorage.setItem(itemId,JSON.stringify(obj));
                        this.fromId = fromId;   //fromId
                        this.localContactList = obj;   //当前条缓存
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
                        localStorage.setItem(itemId,JSON.stringify(obj));
                        this.fromId = fromId;   //fromId
                        this.localContactList = obj;   //当前条缓存
                        resolve(obj)
                    }
                } else {
                    this.fromId = fromId;   //fromId
                    localAllList.isFromChatRoom = isFromChatRoom == true ? true : false;
                    this.localContactList = localAllList;   //当前条缓存
                    resolve(localAllList)
                }
                })
        },
        async sendText(isPerson,itemId, userId) {
            let localContactList = await this.isHaveList(itemId);
            let contentText = this.contentText;
            let isFromChatRoom = localContactList.isFromChatRoom;
            let fromChatroomName = JSON.parse(localStorage.getItem("fromChatroomName"));
            if( isPerson == 'person') {
                var datas = {
                    publicParameter:{
                        appKey: this.vuexUserInfo.appKey,
                        token: this.vuexUserInfo.token,
                        vid: this.vuexUserInfo.vid
                    },
                    content: contentText,
                    contentTypeEnum: 'TEXT',
                    toUserId: this.fromId,
                    toVid: this.fromId,
                    sourceName: isFromChatRoom == true ? fromChatroomName : ''
                }
                // 接收数据
                var data = await sendMessage(datas);
            }
            if ( isPerson == 'chatRoom') {
                var datas = {
                    publicParameter:{
                        appKey: this.vuexUserInfo.appKey,
                        token: this.vuexUserInfo.token
                    },
                    content: contentText,
                    contentTypeEnum: 'TEXT',
                    toChatRoomId: this.fromId
                }
                // 接收数据
                var data = await sendRoomMessage(datas);
            }
            if ( data == "Error: 连接到服务器失败" ) {
                Toast("未连接网络，请稍后再试");
            }
            if( data.data.status == 200 ){
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
                this.chatData.push(oneMseeage);
                // mixin存储消息到local
                this.saveMessage(oneMseeage,contentText,contentText,data.data.timestamp,itemId);
                // 发送成功后更新最近联系列表'contactList'
                this.saveRecentContactList(oneMseeage, itemId, userId);
                // 清除输入框
                this.contentText = '';
                this.isEmotion = false;
                setTimeout(()=>{
                    let scrollHeight =  this.$refs.masseges.$el.scrollHeight;
                    this.$refs.masseges.$el.scrollTop = scrollHeight;
                },0)
            } else {
                Toast(data.data.error);
            }
        },
        async sendPhoto(isPerson,file,itemId, userId) {
            let localContactList = await this.isHaveList(itemId);
            let formData = new FormData(); 
            formData.append('type', '1');
            formData.append('appkey', '1174726');
            formData.append('name', file.file.name);
            formData.append('file', file.file);
            this.isLoading = true;
            let imgData = await Upload(formData);
            if(imgData.status){
                this.isLoading = false;
                // 图片url
                this.imgUrl = `http://mservice.moerlong.com:8800/MAF.MELMS.Utility.File.FileServiceCom/api/fileservice/getfile?id=${imgData.data.id}`;
                let isFromChatRoom = localContactList.isFromChatRoom;
                let fromChatroomName = JSON.parse(localStorage.getItem("fromChatroomName"));
                if( isPerson == 'person') {
                    let imgDatas = {
                        publicParameter:{
                            appKey: this.vuexUserInfo.appKey,
                            token: this.vuexUserInfo.token,
                            vid: this.vuexUserInfo.vid,
                        },
                        content: imgData.data.id,
                        contentTypeEnum: 'IMAGE',
                        toUserId: this.fromId,
                        toVid: this.fromId,
                        sourceName: isFromChatRoom == true ? fromChatroomName : ''
                    }
                    var data = await sendMessage(imgDatas);
                } if( isPerson == 'chatRoom') {
                    let imgDatas = {
                        publicParameter:{
                            appKey: this.vuexUserInfo.appKey,
                            token: this.vuexUserInfo.token
                        },
                        content: imgData.data.id,
                        contentTypeEnum: 'IMAGE',
                        toChatRoomId: this.fromId
                    }
                    var data = await sendRoomMessage(imgDatas);
                }
            } else{
                this.isLoading = false;
                Toast(imgData.message);
            }
            if ( data == "Error: 连接到服务器失败" ) {
                Toast("未连接网络，请稍后再试");
            }
            if( data.data.status == 200 ){
                let oneMseeage = {
                    id: data.data.data,
                    direction: 1,
                    contactUserId: this.userInfo.id,
                    contactUnionId: this.userInfo.unionId,
                    type: 2,
                    content: this.imgUrl,
                    avatar: this.userInfo.avatar,
                    createdOnDate: data.data.timestamp
                }
                this.chatData.push(oneMseeage);
                // 存储消息到local
                this.saveMessage(oneMseeage,'【图片】',2,data.data.timestamp,itemId);
                // 发送成功后更新最近联系列表'contactList'
                this.saveRecentContactList(oneMseeage, itemId, userId);
                setTimeout(()=>{
                    let scrollHeight =  this.$refs.masseges.$el.scrollHeight;
                    this.$refs.masseges.$el.scrollTop = scrollHeight;
                },0)
                this.isUpload = false;
            } else {
                Toast(data.data.error);
            }
        },
        async sendFile(isPerson,file,itemId, userId) {
            let localContactList = await this.isHaveList(itemId);
            let formData = new FormData(); 
            formData.append('type', '2');
            formData.append('appkey', '1174726');
            formData.append('name', file.file.name);
            formData.append('file', file.file);
            let fileData = await Upload(formData);
            this.isLoading = true;
            if(fileData.status){
                this.isLoading = false;
                // 文件url
                this.fileUrl = `http://mservice.moerlong.com:8800/MAF.MELMS.Utility.File.FileServiceCom/api/fileservice/getfile?id=${fileData.data.id}`;
                let isFromChatRoom = localContactList.isFromChatRoom;
                let fromChatroomName = JSON.parse(localStorage.getItem("fromChatroomName"));
                if( isPerson == 'person') {
                    let fileDatas = {
                        publicParameter:{
                            appKey: this.vuexUserInfo.appKey,
                            token: this.vuexUserInfo.token,
                            vid: this.vuexUserInfo.vid,
                        },
                        content: fileData.data.id,
                        contentTypeEnum: 'FILE',
                        toUserId: this.fromId,
                        toVid: this.fromId,
                        sourceName: isFromChatRoom == true ? fromChatroomName : ''
                    }
                    var data = await sendMessage(fileDatas);
                } if( isPerson == 'chatRoom') {
                    let fileDatas = {
                        publicParameter:{
                            appKey: this.vuexUserInfo.appKey,
                            token: this.vuexUserInfo.token
                        },
                        content: fileData.data.id,
                        contentTypeEnum: 'FILE',
                        toChatRoomId: this.fromId
                    }
                    var data = await sendRoomMessage(fileDatas);
                }
            } else{
                this.isLoading = false;
                Toast(fileData.message);
            }
            if ( data == "Error: 连接到服务器失败" ) {
                Toast("未连接网络，请稍后再试");
            }
            if( data.data.status == 200 ){
                let oneMseeage = {
                    id: data.data.data,
                    direction: 1,
                    contactUserId: this.userInfo.id,
                    contactUnionId: this.userInfo.unionId,
                    type: 8,
                    content: this.fileUrl,
                    contentName: `${fileData.data.name}.${fileData.data.formatType}`,
                    avatar: this.userInfo.avatar,
                    createdOnDate: data.data.timestamp
                }
                this.chatData.push(oneMseeage);
                // mixin存储消息到local
                this.saveMessage(oneMseeage,'【文件】',8,data.data.timestamp,itemId);
                // 发送成功后更新最近联系列表'contactList'
                this.saveRecentContactList(oneMseeage, itemId, userId);
                setTimeout(()=>{
                    let scrollHeight =  this.$refs.masseges.$el.scrollHeight;
                    this.$refs.masseges.$el.scrollTop = scrollHeight;
                },0)
                this.isUpload = false;
            }else{
                Toast(data.data.error);
            }
        },
        saveRecentContactList(msgInfo, itemId, userId) {
            this.isHaveList(itemId, userId);
            let isHomology = true;
            let storageContactList = JSON.parse(localStorage.getItem('contactList'));
            if(storageContactList){
                storageContactList.forEach((element, i) => {
                    // 同一聊天室
                    if(element.itemid == itemId) {
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
                        storageContactList.unshift(...storageContactList.splice(i,i+1));
                        isHomology = false;
                        return;
                    }
                });
                if(isHomology) {
                    storageContactList.unshift(this.localContactList);
                }
                localStorage.setItem('contactList', JSON.stringify(storageContactList));
            } else {
                localStorage.setItem('contactList', JSON.stringify([this.localContactList]));
            }
        },
        saveMessage(data,content,type,time,itemId) {
            this.localContactList.messages.push(data);
            this.localContactList.content = content;
            this.localContactList.contentType = type;
            this.localContactList.createdOnDate = time;
            localStorage.setItem(itemId, JSON.stringify(this.localContactList));
        }
    }
}

export const Test = {
    methods: {
        tt(){
            return new Promise(async (resolve, reject) => {
                var data = await Test2()
                console.log('请求的值：', data)
                resolve(data)
            })
        }
    },
}
