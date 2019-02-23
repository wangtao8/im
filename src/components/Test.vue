<template>
  <div class="hello">
    <!-- <h1>{{ msg }}</h1>
    <div @click="test">测试</div>
    <van-uploader :after-read="onRead" :before-read='upload(index)' >
      <van-icon name="photograph" />
    </van-uploader>
    <img :src="imgUrl" alt=""> -->
    <!-- <div>666666666:{{this.$store.talking.state.count}}</div> -->
    <img v-for="(item, index) in imgUrls" :src="item" :key="index" :alt="emotionLists[index]" @click="getUrl(index, emotionLists[index])">
    <div class="cont" contenteditable="true">
        <img v-for="(item, index) in newImgUrls" :key="index" :src="item.src" :alt="item.title">
    </div>
    <div class="Caoz">
      <div @click="send" class="btn">发送</div>
      <div @click="delet" class="btn">删除</div>
    </div>
    <div @click="test">测试请求</div>
    <div @click="test2">测试请求2</div>
    <div v-for="(item, index) in timeList" :key='item.time'>{{jisuan(item.time)}}</div>
  </div>
</template>

<script>
import { Dialog, Notify, List, Panel, Cell, SwipeCell, CellGroup, Uploader, Icon  } from 'vant'
import { resolve } from 'path';
import {Test2} from '../apis/server'
import {Test,TimeFiltering} from '../mixins/mixin'
export default {
  name: 'Test',
  mixins: [Test,TimeFiltering],
  components: {
     [List.name]: List,
     [Cell.name]: Cell,
     [Panel.name]: Panel,
     [SwipeCell.name]: SwipeCell,
     [CellGroup.name]: CellGroup,
     [Uploader.name]: Uploader,
     [Icon.name]: Icon,
  },
  data () {
    return {
      msg: 'Welcome to vant',
      imgUrl: '',
      imgUrls: [],//所有图片展示
      newImgUrls: [],//预览图
      sendImgUrls: [],//需要发送的图片
      emotionLists : [
        "微笑", "嘻嘻", "哈哈", "可爱", "可怜", "挖鼻", "吃惊", "害羞", "挤眼", "闭嘴", "鄙视", "爱你", "泪", 
        "偷笑", "亲亲", "生病", "太开心", "白眼", "右哼哼", "左哼哼", "嘘", "衰", "委屈", "吐", "哈欠", "抱抱", 
        "怒", "疑问", "馋嘴", "拜拜", "思考", "汗", "困", "睡", "钱", "失望", "酷", "色", "哼", "鼓掌", "晕", 
        "悲伤", "抓狂", "黑线", "阴险", "怒骂", "互粉", "心"
      ],
      timeList: [
        {time: '2018-12-01 20:24:14'},
        {time: '2018-12-31 20:24:14'},
        {time: '2019-1-01 20:24:14'},
        {time: '2019-1-02 20:24:14'},
        {time: '2019-1-03 20:24:14'}
      ]
    }
  },
  computed:{
    jisuan(){
      return function(time){
        return this.ChangeTime(time)
      }
    }
  },
  created(){
    for(let i = 0; i < 72; i++) {
        this.imgUrls.push(require('../assets/face/' + i + '.gif'))
      }
  },
  methods: {
    async send(){//发送图片
      // this.newImgUrls.filter((val, index, arr) => {
      //    this.sendImgUrls.push(val.src)
      // })
      // console.log('发送图片的链接：', this.sendImgUrls)
      var data = await Test2({name:'123',age:'333'})
    },
    getUrl(index, titles){//选中图片
      console.log('titles:', titles)
      let items = {}
      items.src = require('../assets/face/'+ index + '.gif')
      items.title = titles
      this.newImgUrls.push(items)
      // console.log('url:', url)
    },
    delet(){
      var len = this.newImgUrls.length
      this.newImgUrls.splice(len-1, 1)
    },
    // onRead(file) {
    //   console.log(file);
    //   this.imgUrl = file.content
    // },
    // upload(file) {
    //   console.log('before-read',file);
    // },
    async test(){//测试请求
      this.$store.dispatch('talking/changeMutations', {'counts': 666})
      console.log('123123:', this.$store.state.talking.count)
      // var data = await Test2()
      // console.log('data:', data)
    },
    async test2(){//测试请求
      this.$store.dispatch('test/changeMutations', {'counts': 666})
      console.log('234234:', this.$store.state.test.count)
      // var data = await Test2()
      // console.log('data:', data)
    }
  },
  mounted(){
    // this.tt().then(res=>console.log('返回值：', res))
    // alert(0)
    console.log('xxxxxx:', this.$store.state.talking.count)
  }
}
</script>
<style lang="scss">
  .Caoz{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 0 50px;
  }
  .btn{
    width: 80px;
    height: 40px;
    text-align: center;
    line-height: 40px;
    border-radius: 8px;
    border: 1px solid red;
    background: rgb(240,240,240);
    color: #000;
  }
  .cont{
    width: 500px;
    height: 100px;
    text-indent: 20px;
    background-color: rgb(240,240,240);
    margin: 20px auto;
    box-sizing: border-box;
    padding-top: 20px;
    overflow: scroll;
  }
</style>
