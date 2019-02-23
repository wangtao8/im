<template>
  <div>
    <!-- 导航条 -->
    <van-nav-bar title='详细资料' @click-left="onClickLeft">
      <van-icon slot="left">
        <img src="../assets/img/back.png">
      </van-icon>
    </van-nav-bar>
    <div class="contact-info">
      <img class="contact-info-head"
           :src="avatar"
           :onerror="defaultImg"
           alt="head">
      <div>
        <div>
          <span class="contact-info-name">{{name}}</span>
        </div>
        <div class="contact-info-msg">{{company}}</div>
      </div>
    </div>
    <div class="contact-info-notes">
      <span>备注信息</span>
      <!--<img class="fr" src="../assets/img/news-more.png" alt="">-->
      <input class="fr" v-model="signature"
             maxlength="6" type="text" placeholder="" disabled>
    </div>
    <div class="contact-info-btn">
      <router-link :to="{path:'/ChatDetails',query: {toUserId:contactUserId,name: name,remark: company}}">发消息</router-link>
    </div>
    <div class="contact-info-btn" @click="call()">
      <button type="button">拨电话</button>
    </div>
  </div>
</template>

<script>
  import {NavBar, Icon, Dialog, Toast} from 'vant';
  import {GetInfos, GetSSOIdInfo, GetCompanyInfo} from '../apis/server'

  export default {
    name: 'ContactInfo',
    components: {
      [NavBar.name]: NavBar,
      [Icon.name]: Icon,
      [Dialog.name]: Dialog,
      [Toast.name]: Toast
    },
    data() {
      return {
        defaultImg: 'this.src="' + require('../assets/img/my_news_normal.png') + '"',
        //显示输入框
        showInputStatus: false,
        //备注信息
        signature: "",
        //姓名
        name: "",
        //头像
        avatar: "",
        //组织
        company: "",
        // 电话
        phone: "",
        contactUserId: "",
      }
    },
    methods: {
      // 返回
      onClickLeft() {
        // let list = JSON.parse(localStorage.getItem('contactList'));
        // let isFromChatRoom = localStorage.getItem('isFromChatRoom')
        // if (isFromChatRoom == 'true'){
        //   let nowData = list.splice(1,1)[0]
        //   list.unshift(nowData)
        //   localStorage.setItem('contactList',JSON.stringify(list))
        // }
        // localStorage.setItem('isBack', true)
        this.$router.go(-1);
      },
      //拨电话
      call() {
        if (this.phone) {
          window.location.href = `tel:${this.phone}`
        } else {
          Toast('暂无电话');
        }
      },
      //获取信息
      async getUserInfo(params) {
        let res = await GetInfos(params);
        this.name = res.data.data.name;
        this.signature = res.data.data.signature;
        this.avatar = res.data.data.avatar;
      },
      //通过ssoid获取用户信息
      async getSSOIdInfo(ssoId) {
        let res = await GetSSOIdInfo(ssoId);
        if (res.Data) {
          this.getCompanyInfo(res.Data.OrganizationId);
          this.phone = res.Data.Phone;
        }
      },
      //获取组织信息
      async getCompanyInfo(id) {
        let res = await GetCompanyInfo({id: id});
        this.company = res.data.Data.Name;
      }
    },
    created() {
      let id = this.$route.query.toUserId;
      this.contactUserId = id;
      let ssoId = {ssoId: '260097083266990084'};
      let params = {};
      params['publicParameter.token'] = '260097083266990084';
      params['publicParameter.appKey'] = '12345';
      params['id'] = id;
      this.getUserInfo(params);
      this.getSSOIdInfo(ssoId);
    }
  }
</script>

<style>
  .contact-info {
    font-size: 0;
    padding: 25px 15px;
    background: #fff;
    margin-bottom: 10px;
  }

  .contact-info img,
  .contact-info > div {
    display: inline-block;
    vertical-align: middle;
  }

  .contact-info-head {
    width: 55px;
    margin-right: 14px;
  }

  .contact-info-name {
    display: inline-block;
    font-size: 22px;
    font-weight: bold;
    color: rgba(0, 11, 34, 1);
    margin-top: 8px;
  }

  .contact-info-msg {
    font-size: 14px;
    font-weight: 500;
    color: rgba(0, 11, 34, 0.65);
    margin-top: 8px;
  }

  .contact-info-notes {
    padding: 18px 15px;
    background: #fff;
    margin-bottom: 65px;
  }

  .contact-info-notes input {
    text-align: right;
  }

  .contact-info-notes > span:first-child {
    color: rgba(0, 11, 34, 0.65);
  }

  .contact-info-notes input {
    color: rgba(0, 11, 34, 1);
  }

  .contact-info-notes img {
    width: 10px;
    margin-left: 8px;
  }

  .contact-info-btn {
    width: 81.33%;
    height: 44px;
    line-height: 44px;
    margin: auto;
  }

  .contact-info-btn * {
    display: inline-block;
    width: 100%;
    height: 100%;
    font-size: 18px;
    font-weight: 500;
    text-align: center;
    letter-spacing: 2px;
  }

  .contact-info-btn a {
    color: #fff;
    background: rgba(0, 122, 255, 1);
  }

  .contact-info-btn button {
    color: rgba(0, 122, 255, 1);
    background: #fff;
    border: 1px solid rgba(0, 122, 255, 1);
    margin-top: 21px;
  }

  .call-dialog .van-dialog__confirm,
  .call-dialog .van-dialog__confirm:active {
    color: rgba(0, 122, 255, 1);
  }
</style>
