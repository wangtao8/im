<template>
    <!-- 搜索界面 -->
    <div class="search">
        <!-- 导航条 -->
        <van-nav-bar title= "搜索" @click-left="onClickLeft">
            <van-icon slot="left">
                <img src="../../assets/img/back.png">
            </van-icon>
        </van-nav-bar>
        <van-search placeholder="请输入搜索关键词" v-model="searchValue" />
        <!-- 联系人列表 -->
        <ContactList v-if="isSearch" :contact-lists="contactList"></ContactList>
        <ContactList v-else :contact-lists="resultList"></ContactList>
        <div class="no-tip" v-show="!isSearch && resultList.length <= 0">搜索结果为空</div>
    </div>
</template>

<script>
import { NavBar, Icon, Search } from 'vant'
import ContactList from '../Contact/ContactList'

export default {
    name: 'search',
    props: {
        datas: {
            type: Array
        }
    },
    data() {
        return {
            searchValue: "",
            contactList: [],
            resultList: [],
            isSearch: true
        }
    },
    components: {
        [NavBar.name]: NavBar,
        [Icon.name]: Icon,
        [Search.name]: Search,
        ContactList
    },
    methods: {
        onClickLeft() {
            this.$router.go(-1);
        },
        filterData() {
            this.resultList = this.contactList.filter( one => {
                this.isSearch = false;
                return one.contactName.indexOf(this.searchValue) != -1;
            })
        }
    },
    created() {
        if (this.$route.params.users && this.$route.params.users !== undefined) {//如果有传参过来
            this.contactList = this.$route.params.users
            localStorage.setItem('contactLists', JSON.stringify(this.$route.params.users));
        } else {//否则去本地缓存取
            this.contactList = JSON.parse(localStorage.getItem('contactLists'));
        }
        // console.log('url-contactList:', this.contactList)
    },
    beforeRouteEnter (to, from, next) {
    //   console.log('to:', to, 'from:', from)
      if(from.name == 'ChatRoomList'){
        localStorage.setItem('isFromChatRoom', true);
      }
       next()
    },
    watch: {
        searchValue() {
            this.filterData();
        }
    }
}
</script>

<style>
.no-tip{
    text-align: center;
    margin: 50px 0px 0px;
}
</style>
