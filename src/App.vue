<template>
  <div id="app">
    <transition :name="transitionName">
        <router-view class="child-view"></router-view>
    </transition>
  </div>
</template>

<script>
import {GetInfos} from './apis/server'

export default {
  name: "App",
  data() {
    return {
      transitionName: "slide-left"
    };
  },
  methods: {
    //获取当前用户信息
    // async getUserInfo(params) {
    //   let res = await GetInfos(params);
    //   // console.log('请求到的信息：', res)
    //   localStorage.setItem('userInfo', JSON.stringify(res.data.data));
    // },
    goBack(){
      // this.$router.isBack = true
      // alert(this.$router.isBack)
      // this.$router.isBack = true;
    }
  },
  created() {
      // let params = {};
      // params['publicParameter.token'] = '260097083266990184';
      // params['publicParameter.appKey'] = '12345';
      // params['id'] = '260097083266990184';
      // let saveVuexUserInfo = {
      //   appKey: '12345',
      //   id: '260097083266990184',
      //   token: '260097083266990184'
      // }
      // this.$store.dispatch('userinfo/saveUserInfo',{userInfo:saveVuexUserInfo});
      // this.getUserInfo(params);
  },
  mounted(){
    if (window.history && window.history.pushState) {
      history.pushState(null, null, document.URL);
      window.addEventListener('popstate', this.goBack, false);
    }
  },
  destroyed(){
    window.removeEventListener('popstate', this.goBack, false);
  },
  watch: {
    '$route'(to, from) {
      //获取当前路由数据，并转化为数组，没有就默认为空
      let routersArr=sessionStorage.getItem('routers')&&sessionStorage.getItem('routers').split(',')||[];
      //如果当前的路由数组为空那么添加 from 的路径以及 to 的路径
      if(routersArr.length==0){
        routersArr.push(from.path);
        routersArr.push(to.path);
      }else{
        //检查即 to 的路径，如果存在在当前路由数组，那么是返回操作，删除此路径及以后的路径
        if(routersArr.indexOf(to.path)!=-1){
          this.transitionName='slide-right';
          routersArr.splice(routersArr.indexOf(to.path)+1,100);
          //如果不存在，那么添加该路径到路由数组中
        }else{
          this.transitionName='slide-left';
          routersArr.push(to.path);
        }
      }
      //存入本地sessionStorage,并转为字符串
      sessionStorage.setItem('routers',routersArr.join(','));
    }
  }
};
</script>

<style>
.child-view {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  transition: all 0.4s cubic-bezier(0.55, 0, 0.1, 1);
}
.slide-left-enter,
.slide-right-leave-active {
  opacity: 0;
  -webkit-transform: translate(100px, 0);
  transform: translate(100px, 0);
}
.slide-left-leave-active,
.slide-right-enter {
  opacity: 0;
  -webkit-transform: translate(-100px, 0);
  transform: translate(-100px, 0);
}
</style>
