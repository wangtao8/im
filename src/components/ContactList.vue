<template>
  <div>
    <!-- 导航条 -->
    <van-nav-bar @click-left="onClickLeft" @click-right="toGroupList()" title="最近联系人">
      <van-icon slot="left">
        <img src="../assets/img/back.png">
      </van-icon>
      <van-icon slot="right">
        <img src="../assets/img/contacts.png">
      </van-icon>
    </van-nav-bar>
    <div class="system">
      <a>
        <img alt="" src="../assets/img/my_news_system.png">
        <span>系统消息</span>
        <img alt="" class="fr" src="../assets/img/ic_forward.png">
        <span class="contact-list-dot">1</span>
      </a>
      <a>
        <img alt="" src="../assets/img/my_news_schedule.png">
        <span>进度通知</span>
        <img alt="" class="fr" src="../assets/img/ic_forward.png">
      </a>
      <router-link :to="{path:'/ChatRoomList'}">
        <img alt="" src="../assets/img/my_news_group.png">
        <span>我的项目组</span>
        <img alt="" class="fr" src="../assets/img/ic_forward.png">
      </router-link>
    </div>
    <div class="contact-list-box">
      <div v-for="(contact, index) in contactList" :key="index">
        <van-swipe-cell :right-width="72">
          <div @click="goDetail(contact,index)">
            <div class="contact-list">
              <div>
                <img :onerror="defaultImg" :src="contact.avatar" alt="head" class="contact-list-head">
                <span class="contact-list-dot" v-if="contact.read == 1"></span>
                <div>
                  <div class="contact-name">
                    <span><span class="contact-list-name">{{contact.contactName}}</span><span class="contact-list-post"
                                                                                              v-if="contact.remark">（{{contact.remark}}）</span></span>
                    <span class="contact-list-date fr">{{setTime(contact.createdOnDate)}}</span>
                  </div>
                  <div class="contact-list-msg">{{contact.content}}</div>
                </div>
              </div>
            </div>
          </div>
          <img @click="delMsg(index)"
               alt="delete"
               class="contact-list-del"
               slot="right"
               src="../assets/img/news_delete.png">
        </van-swipe-cell>
      </div>
    </div>
    <div>
      <div class="wai">
        <input type="text" ref="myId" class="testInput" value="26009708472660800">
        <div @click="getId(0)" class="testDiv">设置我的id</div>
      </div>
      <div class="wai">
        <input type="text" ref="toFromId" class="testInput" value="26009708472660800">
        <div @click="getId(1)" class="testDiv">设置接收id</div>
      </div>
      <div @click="clearAll">清除本地缓存</div>
    </div>
  </div>
</template>

<script>
  import {NavBar, Icon, SwipeCell, Dialog, Toast} from 'vant';
  import store from '../store';
  import {GetInfo, TimeFiltering, ChatSplice} from './../mixins/mixin'
  import {GetInfos, GetGroupInfo, GetChatRoomList} from '../apis/server'
  import {connact} from '../utlis/connact'

  export default {
    name: 'ContactList',
    mixins: [GetInfo, TimeFiltering, ChatSplice],
    components: {
      [NavBar.name]: NavBar,
      [Icon.name]: Icon,
      [SwipeCell.name]: SwipeCell,
      [Dialog.name]: Dialog,
      [Toast.name]: Toast
    },
    data() {
      return {
        defaultImg: 'this.src="' + require('../assets/img/my_news_normal.png') + '"',
        contactList: []
      }
    },
    methods: {
      setTime(time) {
        return this.ChangeTime(time)
      },
      goDetail(contact,index){
        let contactList = JSON.parse(localStorage.getItem('contactList'));
        let id;
        contactList[index].read = 0;
        if(contact.contactUserId){
          id=contact.contactUserId
          this.toRouter('toUserId', id)
        } 

        if(contact.toChatRoomId){
            id=contact.toChatRoomId
            this.toRouter('toChatRoomId', id)
        }
        localStorage.setItem('contactList', JSON.stringify(contactList));
      },
      toRouter(name, id){
        this.$router.push({
          name: 'ChatDetails',
          query: { [name]: id}
        });
      },
      clearAll(){
        localStorage.removeItem('contactList')
        localStorage.removeItem('toChatRoomId')
        localStorage.removeItem('userList')
        localStorage.removeItem('userInfo')
        this.contactList = []
        Toast('清除完毕!!')
      },
      // 获取当前用户信息
      async getUserInfo(params) {
        let res = await GetInfos(params);
        // debugger
        // console.log('请求到的信息：', res)
        localStorage.setItem('userInfo', JSON.stringify(res.data.data));
      },
      async getId(type) {
        let params = {};
        let data = {
          appKey: '123456',
          token: this.$refs.myId.value
        }
        let idLists = []//群id列表
        let res = await GetChatRoomList(data)//获取群列表
        let nowData = res.data.data//赋值新的变量接这个群列表数据
        params['publicParameter.token'] = this.$refs.myId.value;
        params['publicParameter.appKey'] = '12345';
        params['id'] = this.$refs.myId.value;
        for(let i = 0; i < nowData.length; i++){//循环这个数据，将id push到id列表
            idLists.push(nowData[i].id)
        }
        if (type == 0) {
          console.log('refs1:', this.$refs.myId.value, )
          let saveVuexUserInfo = {
            appKey: '12345',
            id: this.$refs.myId.value,
            token: this.$refs.myId.value,
            idList: [this.$refs.myId.value, ...idLists]//需要订阅的数据列表
          }
          this.$store.dispatch('userinfo/saveUserInfo', {userInfo: saveVuexUserInfo});
          // localStorage.setItem('userInfo', JSON.stringify(saveVuexUserInfo))
          this.getUserInfo(params)
          this.myId = this.$refs.myId.value
          connact.IdInit()
          connact.MQTTconnect()
          // this.MQTTconnect()
          // this.getUserInfo(params)
          Toast('设置个人id成功')
        } else {
          console.log('refs2:', this.$refs.toFromId.value)
          this.$store.dispatch('userinfo/saveToFromId', this.$refs.toFromId.value);
          Toast('设置接收id成功')
        }
      },
      //删除
      delMsg(index) {
        Dialog.confirm({
          title: '确认删除',
          confirmButtonText: '删除',
          message: '确认删除这条消息，删除后会将清除对应账号下该条记录的本地数据'
        }).then(() => {
          let list = JSON.parse(localStorage.getItem('contactList'));
          localStorage.removeItem(list[index].itemid);
          list.splice(index, 1);
          Toast('删除成功');
          if (list.length) {
          } else {
            Toast('暂无最近联系人');
          }
          this.contactList = list;
          localStorage.setItem('contactList', JSON.stringify(list));
        });
      },
      //跳转至专家联系人列表
      toGroupList() {
        this.$router.push('/contactExpertList');
      },
      //返回
      onClickLeft() {
        this.$router.go(-1);
      },
    },
    //获取联系人列表数据
    created() {
      let list = JSON.parse(localStorage.getItem('contactList'));
      if (list) {
        this.contactList = list;
      } else {
        Toast('暂无最近联系人');
      }
    },
    computed: {
      count() {
        return store.state.talking.count
      }
    },
    watch: {
      count(newMsg){
        // console.log('页面监听到变化:', newMsg)
        this.contactList = JSON.parse(localStorage.getItem('contactList'));
      }
    }
  }
</script>

<style>
  .wai {
    margin: 20px 0;
  }

  .testInput {
    display: inline-block;
    width: 70%;
    height: 40px;
    border: 1px solid red;
    box-sizing: border-box;
    padding-left: 20px;
  }

  .testDiv {
    display: inline-block;
    width: 20%;
    height: 40px;
    text-align: center;
    line-height: 40px;
  }

  .contact-list-dot {
    display: inline-block;
    position: absolute;
    left: 28px;
    width: 8px;
    height: 8px;
    background: #fc2d31;
    border-radius: 50%;
  }

  .system {
    background: #fff;
    padding: 0 15px;
  }

  .system > a {
    display: block;
    padding: 14px 0;
    border-top: 1px solid #F0F1F6;
  }

  .system > a:first-child {
    position: relative;
    border: none;
  }

  .system img:first-child {
    width: 40px;
    margin-right: 8px;
  }

  .system span {
    font-size: 16px;
    font-weight: bold;
    color: rgba(0, 11, 34, 1);
    opacity: 0.85;
  }

  .system span + img {
    width: 20px;
    margin-top: 10px;
  }

  .system * {
    vertical-align: middle;
  }

  .system .contact-list-dot {
    top: 10px;
    width: 18px;
    height: 18px;
    color: #fff;
    font-size: 12px;
    text-align: center;
    line-height: 18px;
  }

  .contact-list-box {
    margin-top: 10px;
  }

  .contact-list {
    padding: 0 15px;
    background: #fff;
  }

  .contact-list > div {
    position: relative;
    height: 70px;
    font-size: 0;
    padding: 16px 0;
    border-bottom: solid 1px #F0F1F6;
  }

  .contact-list img,
  .contact-list > div > div {
    display: inline-block;
    vertical-align: middle;
  }

  .contact-list > div > div {
    width: 70%;
  }

  @media screen and (min-width: 768px) {
    .contact-list > div > div {
      width: 80%;
    }
  }

  .contact-list-head {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
  }


  .contact-list-name {
    font-size: 15px;
    font-weight: bold;
    color: rgba(0, 11, 34, 0.85);
    margin-right: 7px;
  }

  .contact-list-post,
  .contact-list-msg {
    font-size: 13px;
    font-weight: 500;
    color: rgba(0, 11, 34, 1);
    opacity: 0.45;
  }

  .contact-list-post {
    display: inline-block;
    width: 78px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .contact-name > span:first-child {
    white-space: nowrap;
  }

  .contact-list-date {
    position: absolute;
    top: 18px;
    right: 0;
    font-size: 11px;
    font-weight: 400;
    color: rgba(0, 11, 34, 1);
    opacity: 0.45;
  }

  .contact-list-msg {
    width: 90%;
    margin-top: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap
  }

  .contact-list-del {
    width: 72px;
  }

  .van-button--default {
    color: #000b22;
    font-weight: 500;
  }

  .van-dialog__confirm,
  .van-dialog__confirm:active {
    color: #FC2D31;
  }
</style>
