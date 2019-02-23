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
        <router-link :to="{path:'/ChatDetails',query: {toChatRoomId:contact.id}}">
          <img class="cont-img" :src="contact.avatar" :onerror="defaultImg">
          <span class="cont-name">{{ contact.chatRoomName }}</span>
          <span class="cont-remark" v-if="contact.currentMemberCount">( {{ contact.currentMemberCount }} )</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
  import { NavBar, Icon, Toast } from 'vant'
  import ContactList from './Contact/ContactList'
  import {GetChatRoomList} from '../apis/server'
  import {ChatSplice} from '../mixins/mixin'

  export default {
    name: 'contactGroupList',
    mixins: [ChatSplice],
    components: {
      [NavBar.name]: NavBar,
      [Icon.name]: Icon,
      [Toast.name]: Toast,
      ContactList
    },
    data() {
      return {
        imTitle: '我的项目组',
        contactList: [],
        defaultImg: 'this.src="'+require('../assets/img/my_news_normal.png')+'"',
      }
    },
    methods: {
      // 返回
      onClickLeft() {
        this.$router.go(-1)
      },
      //搜索
      searchGroup() {
        let ListData = this.contactList;
        this.searchChatSplice(ListData);
        this.$router.push({
          name: 'search',
          params:{users: this.NewContactList}
        })
      },
      //获得原始数据
      async getChatData(){
        let data = {};
        data['appKey'] = '12345';
        data['token'] = JSON.parse(localStorage.getItem('userInfo')).id;
        let res = await GetChatRoomList(data);
        if (res.data.status == 200) {
          let ListData = res.data.data;
          let NewContactList = [];
          for(let i = 0; i < ListData.length; i++){//跳转数据拼装
            var obj = {};
            obj.contactName = ListData[i].chatRoomName;
            obj.avatar = ListData[i].avatar;
            obj.remark = ListData[i].currentMemberCount;
            obj.toChatRoomId = ListData[i].id;
            NewContactList.push(obj);
          }
          this.NewContactList = NewContactList;
          this.contactList = res.data.data;
        } else {
          Toast(res.data.error)
        }
      }
    },
    created() {
      this.getChatData()
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
