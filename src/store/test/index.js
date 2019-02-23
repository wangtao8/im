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
        console.log('newVal:', newVal)
      state.count = newVal.counts
    }
  };
const actions= {
    changeMutations ({commit}, val) {
        console.log('testtesttesttesttesttest')
       commit('increment', val)
    }
  };

export default{
    namespaced:true,
    state,
    getters,
    mutations,
    actions
}