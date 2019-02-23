<template>
  <div class="im-emotion" >
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'im-emotion',
  data() {
    return {
      emotions: []
    }
  },
  mounted () {
    const name = this.$el.innerHTML;
    const emotionLists = [
      "微笑", "嘻嘻", "哈哈", "可爱", "可怜", "挖鼻", "吃惊", "害羞", "挤眼", "闭嘴", "鄙视", "爱你", "泪", 
      "偷笑", "亲亲", "生病", "太开心", "白眼", "右哼哼", "左哼哼", "嘘", "衰", "委屈", "吐", "哈欠", "抱抱", 
      "怒", "疑问", "馋嘴", "拜拜", "思考", "汗", "困", "睡", "钱", "失望", "酷", "色", "哼", "鼓掌", "晕", 
      "悲伤", "抓狂", "黑线", "阴险", "怒骂", "互粉", "心"
    ]
    let index = emotionLists.indexOf(name);
    let imgHTML = "<img src="+this.emotions[index]+">";
    this.$nextTick(() => {
      this.$el.innerHTML = imgHTML
    })
  },
  methods: {
    emotion() {
      // var index = 0;
      for (var i = 0; i <= 71; i++) {
        // index = i;
        var index = require("../../assets/face/"+i+".gif");
        this.emotions.push(index);
      }
    }
  },
  created() {
    this.emotion();
  }
}
</script>
<style scoped>
.im-emotion {
  display: inline-block
}
.im-static-emotion {
  width: 24px;
  height: 24px;
  display: inline-block;
}
</style>
