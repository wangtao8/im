<template>
    <!-- 聊天界面 -->
    <div class="messages">
        <p v-if="FromChatRoomName.length > 0 && FromChatRoomName.split('来自')[1].trim().length != 2" class="msg-time">
            <span>{{ this.FromChatRoomName }}</span>
        </p>
        <div v-for="(message,index) in chatDatas" :key="(message.content+index)" :class="message.direction == 1 ? 'send-msg' : 'receive-msg'">
            <!-- <div>当前：{{isShow(chatDatas,index)}}</div> -->
            <div class="msg-time" v-if='isShow(chatDatas,index)'><span>{{ setTime(message.createdOnDate) }}</span></div>
            <router-link v-if="message.direction == 2" :to="{path:'/ContactInfo',query: {toUserId: message.contactUserId,ssoId:message.contactUnionId}}">
                <div class="msg-img"><img :src="message.avatar" :onerror="defaultImg"></div>
            </router-link>
            <a v-else @click="showToast">
                <div class="msg-img"><img :src="message.avatar" :onerror="defaultImg"></div>
            </a>
            <div v-if="message.type == 1" class="msg-content" v-html="message.content.replace(/\#[\u4E00-\u9FA5]{1,3}\;/gi, emotion)"></div>
            <div v-if="message.type == 2" class="msg-content">
                <img :src="message.content" alt="" style="width:100%" @click="showImgs()">
            </div>
            <div v-if="message.type == 8" class="msg-content">
                <a :href="message.content" class="line">{{ message.contentName }}</a>
            </div>
        </div>
    </div>
</template>

<script>
import { ImagePreview, Toast } from 'vant'
import {TimeFiltering} from '../../mixins/mixin'
export default {
    name: 'chatDetailsChild',
    mixins: [TimeFiltering],
    data(){
        return{
            FromChatRoomName: '',
            faces: [],
            defaultImg: 'this.src="' + require('../../assets/img/my_news_normal.png') + '"'
        }
    },
    components: {
        [ImagePreview.name]: ImagePreview,
        [Toast.name]: Toast
    },
    props: {
        chatDatas: {
            type: Array,
            required: true
        },
        chatId: {
            type: String
        }
    },
    created(){
        this.face();
        this.imTitle = localStorage.getItem('oldImTitle') == 'undefined' ? '' : JSON.parse(localStorage.getItem('oldImTitle'));
        let allUserLists = JSON.parse(localStorage.getItem('allUserLists'));
        let chatId = this.chatId;
        if(allUserLists != null){
            if(allUserLists[chatId] != undefined){
                this.FromChatRoomName = allUserLists[chatId].chatName;
            }
        }
    },
    methods: {
        //是否显示当前时间
        isShow(chatDatas,index){
            if(index != 0){
                if(new Date(chatDatas[index].createdOnDate) - new Date(chatDatas[index-1].createdOnDate).getTime() < 5*60*1000){
                    return false
                } else {
                    return true
                }
            }
        },
        setTime(time){
            return this.ChangeTime(time)
        },
        face() {
            var index = 0;
            for (var i = 0; i <= 71; i++) {
                index = i;
                var index = require("../../assets/face/"+i+".gif");
                this.faces.push(index);
            }
        },
        // 将匹配结果替换表情图片
        emotion (res) {
        let word = res.replace(/\#|\;/gi,'');
        const list = [
            "微笑", "嘻嘻", "哈哈", "可爱", "可怜", "挖鼻", "吃惊", "害羞", "挤眼", "闭嘴", "鄙视", "爱你", "泪", "偷笑", "亲亲", "生病", 
            "太开心", "白眼", "右哼哼", "左哼哼", "嘘", "衰", "委屈", "吐", "哈欠", "抱抱", "怒", "疑问", "馋嘴", "拜拜", "思考", "汗", "困", 
            "睡", "钱", "失望", "酷", "色", "哼", "鼓掌", "晕", "悲伤", "抓狂", "黑线", "阴险", "怒骂", "互粉", "心"
        ]
        let index = list.indexOf(word);
            return "<img src="+this.faces[index]+" class='emotion' align='middle'>";
        },
        showImgs() {
            let imgArr = [];
            this.chatDatas.filter( msg => {
                if( msg.type == 2 ){
                    imgArr.push(msg.content);
                }
            })
            ImagePreview({
                images: imgArr
            })
        },
        showToast() {
            Toast("跳转crm个人信息页面");
        }
    }
}
</script>

<style>

/* 聊天详情 */
.messages{
    margin: 46px 0 56px 0;
    padding: 0 14px 56px;
    height: calc(100% - 95px);
    /* background: red; */
    overflow: scroll;
}
/* 消息时间 */
.messages .msg-time{
    margin: 23px 0 23px;
    text-align: center;
}
.messages .msg-time span{
    font-size: 10px;
    color: #fff;
    padding: 5px 7px;
    background-color: #dcdcdc;
    border-radius: 6px;
}
/* 消息公共样式 */
.messages .msg-img,
.messages .msg-content{
    display: inline-block;
    vertical-align: top;
}
.messages .msg-img img{
    width: 40px;
    height: 40px;
    border-radius: 40px;
}
.messages .receive-msg,
.messages .send-msg{
    margin: 15px 0 0;
    min-height: 40px;
}
.messages .receive-msg .msg-content,
.messages .send-msg .msg-content{
    position: relative;
    max-width: 71%;
    color: #000B22;
    word-wrap: break-word;
    padding: 10px 9px;
	border-radius: 6px;    
    font-size: 15px;
    line-height: 16px;
    min-height: 39px;
}
/* 收到消息 */
.messages .receive-msg{
    text-align: left;
}
.messages .receive-msg .msg-content{
    background: #ffffff;
    border: solid 1px #dcdcdc;
    margin: 0 0 0 8px;
}
.messages .receive-msg .msg-content:after{
    content: "";
    position: absolute;
    height: 22px;
    width: 9px;
    left: -9px;
    top: 6px;
    background: url('../../assets/img/news_l.png') no-repeat;
}
/* 发送消息 */
.messages .send-msg{
    text-align: right;
}
.messages .send-msg .msg-content{
    background: #a0e75a;
    border: solid 1px #70b44d;
    text-align: left;
    margin: 0 12px 0 0;
}
/* .messages .send-msg .msg-content img{
    width: 100%;
} */
.messages .send-msg .msg-img{
    float: right;
}
.messages .send-msg .msg-content:after{
    content: "";
    position: absolute;
    height: 22px;
    width: 9px;
    right: -9px;
    top: 6px;
    background: url('../../assets/img/news_r.png') no-repeat;
}
.line{
    text-decoration: underline;
}
/* .send-msg .msg-content > .emotion img{
    display: inline-block;
    width: 22px;
    height: 22px;
  } */
</style>
