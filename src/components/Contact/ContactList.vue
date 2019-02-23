<template>
  <!-- 联系人列表 -->
  <div class="contacts-box">
    <div class="contact" v-for='(contact, index) in contactLists' :key='contact.id'>
      <!-- <router-link :to="{path:'/contactInfo',query: {id: contact.contactUserId,ssoId:contact.contactUnionId}}"> -->
      <div @click="goChatInfo(contact, index)">
        <img class="cont-img" :src="contact.avatar" :onerror="defaultImg">
        <span class="cont-name">{{ contact.contactName}}</span>
        <span class="cont-remark" v-if="contact.remark">( {{ contact.remark }} )</span>
      </div>
      <!-- </router-link> -->
    </div>
  </div>
</template>

<script>
  export default {
    name: 'contactList',
    props: {
      contactLists: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        defaultImg: 'this.src="' + require('../../assets/img/my_news_normal.png') + '"',
      }
    },
    methods: {
      goChatInfo(contact, index) {
        if (contact.toChatRoomId) {
          this.$router.push({path: '/ChatDetails', query: {id: 'Q-' + contact.toChatRoomId}})
        } else {
          this.$router.push({path: '/contactInfo', query: {id: contact.contactUserId, ssoId: contact.contactUnionId}})
        }
      }
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
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 40%;
  }
</style>
