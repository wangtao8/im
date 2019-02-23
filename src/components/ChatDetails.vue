<template>
    <div class="chat-details">
        <!-- 导航条 -->
        <van-nav-bar v-if="isChatRoom" :title = imTitle @click-left="onClickLeft" @click-right="toGroupList()">
            <van-icon slot="left">
                <img src="../assets/img/back.png">
            </van-icon>
            <van-icon slot="right">
                <img src="../assets/img/contacts.png">
            </van-icon>
        </van-nav-bar>
        <van-nav-bar v-else :title = imTitle @click-left="onClickLeft" @click-right="ringUp()">
            <van-icon slot="left">
                <img src="../assets/img/back.png">
            </van-icon>
            <van-icon slot="right">
                <img src="../assets/img/my_news_phone.png">
            </van-icon>
        </van-nav-bar>
        <!-- 聊天界面 -->
        <ChatDetailsChild @click.native="hideToolBox" :chat-datas='chatData' :chat-id="this.itemId" ref='masseges'></ChatDetailsChild>
        <!-- 加载框 -->
        <div class="loading-box" v-if="isLoading">
            <van-loading type="spinner" />
        </div>
        <!-- 输入框，表情，文件发送 -->
        <div class="user-box" :class="isUpload == false ? 'toolHide' : 'toolShow'">
            <input type="text" class="send" v-model="contentText" placeholder="请输入消息内容…" maxlength="500" @keyup.enter="sendContent()"/>
            <div class="smile" @click="showEmotion()"><img src="../assets/img/my_news_smile.png"></div>
            <div :class="contentText == '' ? 'add' : 'sends'" @click='showToolBox()'><img :src="contentText == '' ? add : send"></div>
            <!-- 表情栏 -->
            <div v-show="isEmotion" :class="isEmotion == false ? 'emotion-hide' : 'emotion-show'">
                <emotion @emotion="handleEmotion" :height="130" ></emotion>
            </div>
            <!-- 上传工具栏 -->
            <transition name="van-slide-up">
                <div v-show="isUpload" class="tool-box">
                    <div class="piuter">
                        <van-uploader :after-read="upPhoto" :max-size=31457280 @oversize='noSize'>
                            <img src="../assets/img/news_piuter.png">
                        </van-uploader>
                        <p>相册</p>
                    </div>
                    <div class="photo">
                        <van-uploader :after-read="upPhoto" :max-size=31457280 @oversize='noSize'>
                            <img src="../assets/img/news_photo.png">
                        </van-uploader>
                        <p>拍照</p>
                    </div>
                    <div class="file">
                        <van-uploader :after-read="upFile" accept='*' :max-size=31457280 @oversize='noSize'>
                            <img src="../assets/img/news_file.png">
                        </van-uploader>
                        <p>文件</p>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import { NavBar, Dialog, Toast, Icon, Notify, Uploader, ImagePreview, Loading } from 'vant'
import ChatDetailsChild from './ChatDetails/ChatDetailsChild'
import Emotion from './Emotion/index'
import {Upload, GetSSOIdInfo, GetChatRoomMembers, sendMessage,sendRoomMessage} from '../apis/server'
import { stat } from 'fs';
import { setTimeout } from 'timers';
// import { SendMessage } from '../mixins/mixin'
import { sendmessage } from '../utlis/msg'

export default {
    name: 'chatDetails',
    components: {
        [NavBar.name]: NavBar,
        [Icon.name]: Icon,
        [Dialog.name]: Dialog,
        [Uploader.name]: Uploader,
        [ImagePreview.name]: ImagePreview,
        [Loading.name]: Loading,
        ChatDetailsChild,
        Emotion
    },
    // mixins: [SendMessage],
    data() {
        return {
            userId: '',
            add: require('../assets/img/my_news_add.png'),
            send: require('../assets/img/fs.png'),
            faces: [],    //表情数组
            imTitle: '',    //聊天title
            contentText: '',    //聊天内容
            fromId:　null,   //发送给谁
            isUpload: false,    //上传界面
            isEmotion: false,   //表情界面
            imgUrl: '',   //上传图片的url
            userInfo: '',   //当前用户信息
            vuexUserInfo: {},    //vuex用户信息，app返的，用于发送信息
            localAllList: [],   //所有聊天信息
            localContactList: [],   //当前聊天信息
            isChatRoom: false,
            isLoading: false,
            chatRoomMembers: [],
            RoomMembers: {},
            chatRoomName: '',
            phone: '',
            chatData: []    //当前聊天信息数组
        }
    },
    methods: {
        onClickLeft() {
            this.$router.go(-1);
            localStorage.setItem('isFromChatRoom', false);
        },
        toGroupList() {
            this.$router.push({
                name: 'ContactGroupList',
                params: { ChatRoomMembers: this.chatRoomMembers, title: this.imTitle}
            });
        },
        // 取联系人电话
        async getSSOIdInfo(ssoId) {
            let res = await GetSSOIdInfo(ssoId);
            if(res.Data){
                this.phone = res.Data.Phone;
            }
        },
        arrToObj(key,val){
            var data = {};
            this.RoomMembers[key] = val;
        },
        // 取所有群成员
        async GetChatRoomMembers(data){
            let res = await GetChatRoomMembers(data);
            if(res.data.status == '200') {
                let newMembersArr= [];
                res.data.data.members.filter( member => {
                    let data= {};
                    data.avatar = member.avatar;
                    data.id = member.id;
                    data.contactName = member.userName;
                    data.remark = member.remark;
                    data.contactUserId = member.userId;
                    data.contactUnionId = member.unionId;
                    newMembersArr.push(data);
                })
                this.chatRoomMembers = newMembersArr;
                this.imTitle = res.data.data.chatRoomName+'('+this.chatRoomMembers.length +'人)';
                this.chatRoomName = res.data.data.chatRoomName;
                localStorage.setItem('fromChatroomName',JSON.stringify(this.chatRoomName));
                // 缓存本地获取聊天头像
                let newMembersObj= {};
                for(var key in newMembersArr){  
                    this.arrToObj(newMembersArr[key].contactUserId,newMembersArr[key])
                }
            } if(res.data.status == '401') {
                // 删除次聊天界面
                Toast(res.data.error);
                localStorage.removeItem(data.id);
                let contactList = JSON.parse(localStorage.getItem('contactList'));
                for(var i = 0;i<contactList.length;i++){
                    if(contactList[i].itemid == data.id){
                        contactList.splice(i,1);
                        localStorage.setItem('contactList', JSON.stringify(contactList));
                    }
                }
                this.$router.go(-1);
            }
        },
        // 拨打电话
        ringUp() {
            if(this.phone){
                window.location.href = `tel:${this.phone}`;
            }else {
                Toast('暂无电话');
            }
        },
        // 显示表情
        showEmotion() {
            this.isEmotion = !this.isEmotion;
            this.isUpload = false;
        },
        // 发送表情
        handleEmotion (i) {
            this.contentText += i
        },
        // 循环表情
        face() {
            var index = 0;
            for (var i = 0; i <= 71; i++) {
                index = i;
                var index = require("../assets/face/"+i+".gif");
                this.faces.push(index);
            }
        },
        // 关闭工具栏
        hideToolBox() {
            this.isUpload = false;
            this.isEmotion = false;
        },
        // 显示工具箱
        showToolBox() {
            if (this.contentText == ''){
                this.isUpload = !this.isUpload;
                this.isEmotion = false;
            } else {
                this.sendContent();
            }
        },
        // 上传大小限制
        noSize(file) {
            Toast('单个文件大小不超过30M！');
        },
        // 处理发送后消息界面
        resetInterface() {
            this.contentText = '';
            this.isEmotion = false;
            this.isUpload = false;
            setTimeout(()=>{
                let scrollHeight =  this.$refs.masseges.$el.scrollHeight;
                this.$refs.masseges.$el.scrollTop = scrollHeight;
            },0)
        },
        // 发送消息
        async sendContent() {
            if ( this.contentText != '' ) {
                if(this.isChatRoom == true){
                    let oneMessage = await sendmessage.sendText('chatRoom',this.itemId,this.contentText,`Q-${this.userId}`);
                    if ( oneMessage.status != false ) {
                        this.chatData.push(oneMessage);
                        this.resetInterface();
                    } else {
                        Toast(oneMessage.msg);
                    }
                } else {
                    let oneMessage = await sendmessage.sendText('person',this.itemId,this.contentText,`Q-${this.userId}`);
                    if ( oneMessage.status != false ) {
                    this.chatData.push(oneMessage);
                        this.resetInterface();
                    } else {
                        Toast(oneMessage.msg);
                    }
                }
            } else {
                Toast('请输入内容再发送！');
            }
        },
        //发送图片
        async upPhoto(file) {
            // 发送图片消息
            if(this.isChatRoom == true){
                this.isLoading = true;
                let oneMessage = await sendmessage.sendPhoto('chatRoom',file, this.itemId,`Q-${this.userId}`);
                if ( oneMessage.status != false ) {
                    this.chatData.push(oneMessage);
                    this.resetInterface();
                    this.isLoading = false;
                } else {
                    this.isLoading = false;
                    Toast(oneMessage.msg);
                }
            } else {
                this.isLoading = true;
                let oneMessage = await sendmessage.sendPhoto('person',file, this.itemId,`Q-${this.userId}`);
                if(oneMessage.status != false){
                    this.chatData.push(oneMessage);
                    this.resetInterface();
                    this.isLoading = false;
                }else{
                    this.isLoading = false;
                    Toast(oneMessage.msg);
                }
            }
        },
        // 发送文件
        async upFile(file) {
            if ( this.isChatRoom == true ) {
                this.isLoading = true;
                let oneMessage = await sendmessage.sendFile('chatRoom',file, this.itemId,`Q-${this.userId}`);
                if ( oneMessage.status != false ) {
                    this.chatData.push(oneMessage);
                    this.resetInterface();
                    this.isLoading = false;
                } else {
                    this.isLoading = false;
                    Toast(oneMessage.msg);
                }
            } else {
                this.isLoading = true;
                let oneMessage = await sendmessage.sendFile('person',file, this.itemId,`Q-${this.userId}`);
                if ( oneMessage.status != false ) {
                    this.chatData.push(oneMessage);
                    this.resetInterface();
                    this.isLoading = false;
                } else {
                    this.isLoading = false;
                    Toast(oneMessage.msg);
                }
            }
        },
         // 得到当前群id的位置
        getIndex(arr,id){
            for(let i = 0; i < arr.length; i++) {
                if(arr[i].toChatRoomId == id){
                    return i
                }
            }
        }
    },
    created() {
        // 获取唯一id
        let itemId = ''
        if(!!this.$route.query.toUserId){
            itemId = 'R-' + this.$route.query.toUserId
        } else {
            itemId = 'Q-' + this.$route.query.toChatRoomId
        }
        // 发送消息用
        this.itemId = itemId;
        // 读取当前用户信息（缓存）
        this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
        this.userId = this.userInfo.id;
        // 读取当前用户信息（vuex）
        this.vuexUserInfo = this.$store.state.userinfo.userInfo;
        let isChanRoom = itemId.indexOf("Q");
        let fromId = itemId.split('-')[1];
        this.fromId = fromId;
        // 取数据
        var localAllList = JSON.parse(localStorage.getItem(itemId));
        if (localAllList == undefined) {
            localAllList = [];
            if(this.$route.query.remark == ""){
                this.imTitle = this.$route.query.name;
            } else {
                this.imTitle = this.$route.query.name+'('+this.$route.query.remark+')';
            }
        } else {
            this.imTitle = localAllList.contactName;
            this.chatData = localAllList.messages;
        }
        // 判断群还是人并渲染数据
        if( isChanRoom != -1 ){
            // console.log("是群",fromId);
            this.isChatRoom = true;
            let data = {};
            data['publicParameter.token'] = this.vuexUserInfo.token;
            data['publicParameter.appKey'] = this.vuexUserInfo.appKey;
            data['id']= fromId;
            this.GetChatRoomMembers(data);
            localStorage.setItem('isFromChatRoom', true);
        } else {
            // console.log("是人",fromId);
            // 获取联系人电话
            let ssoId = {ssoId: fromId};
            this.getSSOIdInfo(ssoId);
        }
        // 获取聊天相关信息
        // if (itemId == undefined) {//如果id没有定义  返回路由不带参的情况
        //     let toChatRoomId = localStorage.getItem('toChatRoomId')//读取本地缓存群id
        //     itemId = this.getIndex(this.localAllList, toChatRoomId)//根据群id得到群数据在总数据中的位置
        // } else {//如果有值 存数据
        //     let toChatRoomId = fromId//进入当前页面拿群id
        //     toChatRoomId == '' ? '' : localStorage.setItem('toChatRoomId', toChatRoomId)//如果有群id 存入本地缓存 每次进入群消息都会重新赋值本地群id
        // }
        // 生成表情
        this.face();
    },
    mounted() {
        sendmessage.init()
        setTimeout(()=>{
            let scrollHeight =  this.$refs.masseges.$el.scrollHeight;
            this.$refs.masseges.$el.scrollTop = scrollHeight;
        },0)
    },
    computed: {
      count() {
        return this.$store.state.talking.count
      }
    },
    watch: {
      count(newMsg) {
        console.log('监听到变化：', newMsg)
        if(newMsg[0].itemid == this.itemId){
            this.chatData = JSON.parse(localStorage.getItem(this.itemId)).messages;
            let contactList = JSON.parse(localStorage.getItem('contactList'))
            contactList.forEach( list => {
                if( list.itemid == this.itemId ) {
                    list.read = 0;
                }
            })
            localStorage.setItem('contactList',JSON.stringify(contactList));
        }
      }
    }
}
</script>

<style lang="scss">
// header
.chat-details .van-nav-bar{
    position: fixed;
    top: 0%;
    width: 100%;
}
// 加载狂
.loading-box{
    position: fixed;
    top: calc(50% - 20px);
    left: calc(50% - 17px);
    background: rgba(0, 0, 0, 0.5);
    padding: 4px;
    border-radius: 4px;
}
/* 输入框，表情，文件发送 */
.user-box{
    position: fixed;
    bottom: 0%;
    width: 100%;
    background: #fff;
    height: 49px;
    padding: 5px 15px;
    z-index: 10;
}
.user-box .send{
    display: inline-block;
    width: 71%;
    height: 100%;
    border-radius: 6px;
    border: solid 1px #dcdcdc;
    text-indent: 11px;
    line-height: 38px;
}
.user-box .smile,
.user-box .add{
    display: inline-block;
    vertical-align: middle;
    min-width: 13%;
    text-align: right;
    line-height: 30px;
}

@media screen and (max-device-width : 320px){
    .user-box .smile,
    .user-box .add{
        min-width: 10%;
    }
}
.user-box .smile img,
.user-box .add img{
    width: 28px;
}
.user-box .sends{
    display: inline-block;
    vertical-align: middle;
    width: 40px;
    height: 30px;
    margin-left: 4px;
}
.user-box .sends>img{
    width: 46px;
}
/* 表情栏 */
.emotion-show{
    position: absolute;
    left: 0px;
    width: 100%;
    z-index: 20;
    padding: 6px;
    background: #fff;
    border-bottom: solid 1px #eee;
    animation: showBox .1s infinite;
    animation-iteration-count:1;
    animation-fill-mode: forwards;
}
.emotion-hide{
    position: absolute;
    left: 0px;
    bottom: 0px;
    width: 100%;
    z-index: 20;
    padding: 6px;
    background: #fff;
    border-bottom: solid 1px #eee;
}
@keyframes showBox {
    from {bottom:0px;opacity: 0;}
    to {bottom:49px;opacity: 1;}
}
/* 上传工具栏 */
.tool-box{
    display: flex;
    margin: 5px 0 0;
    padding: 24px 0 0;
    background: #F0F1F6;
}
.toolShow {
    animation: toolShow .3s infinite;
    animation-iteration-count:1;
    animation-fill-mode: forwards;
}
.toolHide {
    bottom: 0px;
}
@keyframes toolShow {
    from {bottom: 0}
    to {bottom: 114px}
}

.tool-box .piuter,
.tool-box .photo,
.tool-box .file{
    flex: 1;
    max-width: 48px;
    text-align: left;
    margin: 0 0 0 39px;
}
.tool-box .piuter{
    margin: 0;
}
.tool-box>div>p{
    text-align: center;
}
.tool-box .van-uploader{
    width: 48px;
    height: 48px;
}
.van-uploader img{
    width: 48px;
    height: 48px;
}

</style>