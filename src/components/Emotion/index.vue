<template>
  <div class="emotion" :style="{height: height + 'px' }" >
    <div class="emotion-box-line" v-for="(line, i) in list" :key="i" >
      <emotion class="emotion-item" v-for="(item, i) in line" :key="i" @click.native="clickHandler(item)" :title="item">{{item}}</emotion>
    </div>
  </div>
</template>

<script>
import Emotion from './Emotion'

export default {
  props: {
    height: {
      type: Number,
      default: 130,
    }
  },
  data () {
    return {
      list: [
        ["微笑", "嘻嘻", "哈哈", "可爱", "可怜", "挖鼻", "吃惊", "害羞"], 
        ["挤眼", "闭嘴", "鄙视", "爱你", "泪", "偷笑", "亲亲", "生病"], 
        ["太开心", "白眼", "右哼哼", "左哼哼", "嘘", "衰", "委屈", "吐"],
        ["哈欠", "抱抱", "怒", "疑问", "馋嘴", "拜拜", "思考", "汗"], 
        ["困", "睡", "钱", "失望", "酷", "色", "哼", "鼓掌"], 
        ["晕", "悲伤", "抓狂", "黑线", "阴险", "怒骂", "互粉", "心"]
      ]
    }
  },
  methods: {
    clickHandler (i) {
      let emotion = `#${i};`
      this.$emit('emotion', emotion)
    }
  },
  components: {
    Emotion
  }
}
</script>
<style scoped>
  .emotion-box {
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
    padding: 5px;
    border: 1px solid #b4b4b4;
    overflow: hidden;
    overflow-y: auto;
  }
  .emotion-box-line {
    display: flex;
  }
  .emotion-item {
    flex: 1;
    text-align: center;
    cursor: pointer;
  }
</style>