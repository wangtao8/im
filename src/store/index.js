import Vue from 'vue';
import Vuex from 'vuex';
import talking from './talking'
import userinfo from './userinfo'
import search from './search'
import test from './test'
Vue.use(Vuex);

const store = new Vuex.Store({
    // state: {
    //   count: '',
    //   testData: [
    //       {
    //         id:1,
    //         name: '123'
    //       },
    //       {
    //         id:2,
    //         name: '234'
    //       },{
    //         id:3,
    //         name: '345'
    //       },{
    //         id:4,
    //         name: '456'
    //       }
    //   ]
    // },
    // getters: {
    //   getCountNum(state){
    //     return state.count.length
    //   }
    // },
    // mutations: {
    //   increment (state, newVal) {
    //       console.log('newVal:', newVal)
    //     state.count = newVal.counts
    //   }
    // },
    // actions: {
    //   changeMutations ({commit}, val) {
    //      commit('increment', val)
    //      var b = this.state.testData.filter((val,index,arr)=>{//filter过滤器val每个对象 index每个对象索引  arr 整个数组
    //         return val.id < 3
    //      })
    //      console.log('b:', b)//所有id < 3的都会被赋值给b
    //   }
    // }
    modules: {
      talking: talking,
      userinfo: userinfo,
      search: search,
      test: test
    }
  })
  export default store