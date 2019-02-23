const state = {
    count: ''
  };
const getters= {
    getCountNum(state){
      return state.count.length
    }
  };
  
const mutations= {
    increment (state, newVal) {
        // console.log('newVal:', newVal)
      state.count = newVal.counts
    }
  };
const actions= {
    changeMutations ({commit}, val) {
       commit('increment', val)
    //    var b = this.state.testData.filter((val,index,arr)=>{//filter过滤器val每个对象 index每个对象索引  arr 整个数组
    //       return val.id < 3
    //    })
    //    console.log('b:', b)//所有id < 3的都会被赋值给b
    }
  };

export default{
    namespaced:true,//命名空间 如果不使用，在多个模块间有多个重名action函数会在dispatch时同时执行,显然不符合预期，配置以后页面调用：this.$store.dispatch('talking/函数名', 值)
    state,
    getters,
    mutations,
    actions
}