import Vue from 'vue';
Vue.filter('setMsgInfo', (msgInfo, element) => {
    switch (msgInfo.type) {
        case 1:
            element.content = msgInfo.content;
            element.contentType = msgInfo.content;
            break;
        case 2:
            element.content = '图片';
            element.contentType = 2;
            break;
        case 8:
            element.content = '文件';
            element.contentType = 8;
            break;
        default:
            break;
    }
});
