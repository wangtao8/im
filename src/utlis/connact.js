import store from '../store'
import { receivemessage } from './msg'
class Connact{
    constructor(){
        this.instance = null//初始化这个实例化对象
        this.reconnectTimeout= 2000
        this.mqtt= {}
        this.msg= ""
        this.myId= ''
        this.counts= 1000
        this.CurtThis = {}
        this.onConnect = this.onConnect.bind(this);
    }
    IdInit() {
        this.myId = store.state.userinfo.userInfo.id
    }
    //实时通信
    MQTTconnect() {
        this.mqtt = new Paho.MQTT.Client("openapi.moerlong.com", 28083, this.myId);
        this.CurtThis = this;
        var options = {
            timeout: 10,
            userName: "admin",
            password: "public",
            useSSL: false,
            onSuccess: this.onConnect,
            onFailure: function (message) {
                //连接失败定时重连
                setTimeout(this.MQTTconnect, this.reconnectTimeout);
            }
        };
        this.mqtt.onConnectionLost = this.onConnectionLost;
        this.mqtt.onMessageArrived = this.onMessageArrived;
        this.mqtt.connect(options);
    }
    //连接
    onConnect(data) {
        console.log('连接', data);
       let datas = store.state.userinfo.userInfo.idList//需要订阅的列表数组
        //连接成功，循环订阅主题
        for (let i = 0; i < datas.length; i++) {
            //连接成功，订阅主题
            this.mqtt.subscribe(datas[i], {
                qos: 2,
                onSuccess: this.onSubscribeSuccess,
                onFailure: this.onSubscribeFailure,
                timeout: 3
            });
        }
        //发布一个消息
        // this.mqtt.send("login", "{\"command\":\"login\",\"clientId\":\"" + this.mqtt.clientId + "\"}", 0);
    }
    cleansession(data) {
        console.log(data)
    }
    //连接丢失
    onConnectionLost(response) {
        var num = this.counts * 2
        if (num < (128 * 1000)) {
            this.counts = num
            setTimeout(() => {
                console.log('调用重连')
                this.MQTTconnect();//连接丢失重连
            }, num)
        } else {
            return false
        }

        console.log("异常掉线，掉线信息为:", response);
    }
    //接收到消息，处理
    onMessageArrived(message) {
        receivemessage.init(message)
    }
    //订阅主题成功
    onSubscribeSuccess() {
        console.log('订阅主题成功');
    }
    //订阅主题失败
    onSubscribeFailure(data) {
        console.log('订阅主题失败', data);
    }
    static getInstance() {//单例模式 只会new出一个实例化对象 如果已经有了 会返回之前new好的实例化对象
        if (!this.instance) {
            this.instance = new Connact()
        }
        return this.instance
    }
}

export const connact = Connact.getInstance()