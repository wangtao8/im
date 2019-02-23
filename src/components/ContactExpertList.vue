<template>
  <div class="contactExpertList">
    <!-- 导航条 -->
    <van-nav-bar :title=imTitle @click-left="onClickLeft" @click-right="searchGroup()">
      <van-icon slot="left">
        <img src="../assets/img/back.png">
      </van-icon>
      <van-icon slot="right">
        <img src="../assets/img/news_search.png">
      </van-icon>
    </van-nav-bar>
    <!-- 联系人列表 -->
    <div class="contacts-box">
      <div v-for='list in contactList' :key='list.contactGroupId'>
        <div class="contact" v-for='contact in list.contacts' :key='contact.id'>
          <router-link :to="{path:'/contactInfo',query: {
          toUserId: contact.contactUserId,
          ssoId:contact.contactUnionId
          }}">
            <img class="cont-img" :src="contact.avatar" :onerror="defaultImg" alt="head">
            <span class="cont-name">{{ contact.contactName }}</span>
            <span class="cont-remark">( {{ contact.remark }} )</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {NavBar, Icon} from 'vant'
  import {ContactList} from '../apis/server'
  import {ChatSplice} from '../mixins/mixin'

  export default {
    name: 'contactExpertList',
    components: {
      [NavBar.name]: NavBar,
      [Icon.name]: Icon
    },
    mixins: [ChatSplice],
    data() {
      return {
        imTitle: '摩尔龙专家联系人',
        contactList: [],
        defaultImg: 'this.src="' + require('../assets/img/my_news_normal.png') + '"',
      }
    },
    methods: {
      // 返回
      onClickLeft() {
        this.$router.go(-1);
      },
      //搜索
      async searchGroup() {
        let contactList = this.contactList;
        let len = contactList.length;
        for (var i = 0; i < len; i++) {
          let list = await this.PsearchChatSplice(contactList[i].contacts);
          this.$router.push({
            name: 'search',
            params: {users: list}
          })
        }
      }
    },
    // 获取专家联系人列表数据
    async created() {
      localStorage.setItem('isFromChatRoom', false);
      let params = {
        appKey: '12345',
        token: '260097083266990084'
      };
      let res = await ContactList(params);
      this.contactList = res.data.data;
    }
  }
</script>

<style>
  /* 联系人列表 */
  .contacts-box {
    background: #fff;
    padding: 0 0 0 15px;
  }

  .contact:first-child {
    border-top: none;
  }

  .contact {
    border-top: solid 1px #f0f1f6;
    padding: 14px 0;
  }

  .contact a {
    display: inline-block;
    width: 100%;
    height: 100%;
  }

  .contact .cont-img {
    width: 40px;
    height: 40px;
    border-radius: 40px;
  }

  .contact span {
    color: #000B22;
    margin: 0 0 0 6px;
    line-height: 40px;
    vertical-align: text-top;
    font-family: PingFang-SC-Medium;
  }

  .contact .cont-name {
    font-size: 16px;
    font-weight: 600;
    opacity: .85;
  }

  .contact .cont-remark {
    font-size: 12px;
    opacity: .45;
  }
</style>
