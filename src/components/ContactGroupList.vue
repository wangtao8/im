<template>
    <div class="contactGroupList">
        <!-- 导航条 -->
        <van-nav-bar :title = imTitle @click-left="onClickLeft" @click-right="searchGroup()">
            <van-icon slot="left">
                <img src="../assets/img/back.png">
            </van-icon>
            <van-icon slot="right">
                <img src="../assets/img/news_search.png">
            </van-icon>
        </van-nav-bar>
        <!-- 联系人列表 -->
        <div class="contacts-box">
            <div class="contact" v-for='contact in contactList' :key='contact.id'>
                <router-link :to="{path:'/contactInfo',query: {
                toUserId: contact.contactUserId,
                ssoId:contact.contactUnionId
                }}">
                    <img class="cont-img" :src="contact.avatar" :onerror="defaultImg">
                    <span class="cont-name">{{ contact.contactName }}</span>
                    <span class="cont-remark" v-if="contact.remark">( {{ contact.remark }} )</span>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
import { NavBar, Icon, Toast } from 'vant'
import ContactList from './Contact/ContactList'
import {ChatSplice} from '../mixins/mixin'

export default {
    name: 'contactGroupList',
    components: {
        [NavBar.name]: NavBar,
        [Icon.name]: Icon,
        ContactList
    },
    mixins:[ChatSplice],
    data() {
        return {
            imTitle: '',
            contactList: [],
            defaultImg: 'this.src="' + require('../assets/img/my_news_normal.png') + '"',
        }
    },
    methods: {
        onClickLeft() {
            this.$router.go(-1)
        },
        searchGroup() {
            this.$router.push({
                name: 'search',
                params:{users: this.contactList}
            })
        },
    },
    created() {
        if (this.$route.params.ChatRoomMembers && this.$route.params.ChatRoomMembers !== undefined) {//如果有传参过来
            this.contactList = this.$route.params.ChatRoomMembers;
            this.imTitle = this.$route.params.title;
            localStorage.setItem('chatRoomMembers', JSON.stringify(this.$route.params.ChatRoomMembers));
            localStorage.setItem('oldImTitle', JSON.stringify(this.$route.params.title));
        } else {//否则去本地缓存取
            this.contactList = JSON.parse(localStorage.getItem('chatRoomMembers'));
            this.imTitle = JSON.parse(localStorage.getItem('oldImTitle'));
        }
    }
}
</script>

<style>
/* 联系人列表 */
.contacts-box{
    background: #fff;
    padding: 0 0 0 15px;
}
.contact:first-child{
    border-top: none;
}
.contact{
    border-top: solid 1px #f0f1f6;
    padding: 14px 0;
}
.contact .cont-img{
    width: 40px;
	height: 40px;
	border-radius: 40px;
}
.contact span{
    color: #000B22;
    margin: 0 0 0 6px;
    line-height: 40px;
    vertical-align: text-top;
    font-family: PingFang-SC-Medium;
}
.contact .cont-name{
    font-size: 16px;
    font-weight: 600;
    opacity: .85;
}
.contact .cont-remark{
    font-size: 12px;
    opacity: .45;
    font-size: 12px;
    opacity: .45;
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 40%;
}
</style>
