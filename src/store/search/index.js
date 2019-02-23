const state = {
    allMessage: ''
  };
const getters= {
    getCountNum(state){
      return state.allMessage.length
    }
  };
  
const mutations= {
    increment (state, newVal) {
        // console.log('newVal:', newVal)
      state.allMessage = newVal
    }
  };
const actions= {
    changeMutations ({commit}, val) {
        // console.log('actions数据：', val)
       commit('increment', val)
    }
  };

export default{
    namespaced:true,//命名空间 如果不使用，在多个模块间有多个重名action函数会在dispatch时同时执行,显然不符合预期，配置以后页面调用：this.$store.dispatch('talking/函数名', 值)
    state,
    getters,
    mutations,
    actions
}