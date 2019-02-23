class MQTT {
    reconnectTimeout = 2000;
    mqtt = {};
    msg = "";
    myId = "";
    id = "260097084726608000";
    constructor(){
    }
    getMyId(){
      //   console.log(store.state)
        this.myId = this.localGet('userInfo').id
        this.MQTTconnect()
    }
    //实时通信
    MQTTconnect() {
      //   debugger
      /**
         host: 服务器地址
        port: 服务器端口
        tls:  是否使用tls协议，mosca是支持tls的，如果使用了要设置成true
        keepalive: 心跳时间，单位秒，每隔固定时间发送心跳包, 心跳间隔不得大于120s
        clean: session是否清除，这个需要注意，如果是false，代表保持登录，如果客户端离线了再次登录就可以接收到离线消息
        auth: 是否使用登录验证
        user: 用户名
        pass: 密码
        willTopic: 订阅主题
        willMsg: 自定义的离线消息
        willQos: 接收离线消息的级别
        clientId: 客户端id，需要特别指出的是这个id需要全局唯一，因为服务端是根据这个来区分不同的客户端的，默认情况下一个id登录后，假如有另外的连接以这个id登录，上一个连接会被踢下线, 我使用的设备UUID
    */
      this.mqtt = new Paho.MQTT.Client("openapi.moerlong.com",28083, this.id);
      // debugger
      var options = {
            userName: "admin",
            password: "public",
            useSSL: false,
            // cleanSession: this.cleansession,
            onSuccess: this.onConnect,
            onFailure: function(message) {
                //连接失败定时重连
                setTimeout(this.MQTTconnect, this.reconnectTimeout);
            }
      };
      this.mqtt.onConnectionLost = this.onConnectionLost;
      this.mqtt.onMessageArrived = this.onMessageArrived;
      // if (username != null) {
  //   options.userName = "admin";
  //   options.password = "public";
      // }
      this.mqtt.connect(options);
  }
  //连接
  onConnect(data) {
      console.log('连接',data);
      debugger
      let datas = this.store.state.userinfo.userInfo.idList//需要订阅的列表数组
      //连接成功，循环订阅主题
      for(let i = 0; i < datas.length; i++) {
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
  cleansession(data){
      console.log(data)
  }
  //连接丢失
  onConnectionLost(response) {
      //this.MQTTconnect();//连接丢失重连
      console.log("异常掉线，掉线信息为:",response);
  }
  getUserInfo(id){
      // debugger
      return new Promise(async (resolve, reject)=>{
          if(id.split('-')[0] == 'Q'){
              let datas = {}
                  datas['appKey'] = '12345'
                  datas['token'] = id.split('-')[1]
              let res = await GetChatRoomList(datas)
              resolve(res)
          } else {
              let datas = {}
                  datas['publicParameter.appKey'] = '12345'
                  datas['publicParameter.token'] = id.split('-')[1]
                  datas['id'] = id.split('-')[1]
              let res = await GetPeopleInfo(datas)
              resolve(res)
          }
      })
  }
  //接收到消息，处理
  onMessageArrived(message) {
      console.log('接收到消息',message);
      debugger
      var fromUserId = JSON.parse(message.payloadString).data.fromUserId;
      var fromUserMsg = JSON.parse(message.payloadString);
      // debugger
      let userLists = this.localGet('userLists') || {}//联系人列表
      let obj = {};
      let messageLists = {}//消息列表
      let userid = ''//接收一个拼接的唯一id 可能是群 可能是个人
      let flag = true

      //拼接唯一id
      if(fromUserMsg.data.toChatRoomId){
          console.log('群')
          userid = 'Q-' + fromUserMsg.data.toChatRoomId
      } else {
          userid = 'R-' + fromUserMsg.data.toUserId
          console.log('个人')
      }

      //根据唯一id获取用户信息 或群信息 再存缓存
      this.getUserInfo(userid)
          .then(res=>{
              let list = res.data.data
              if(idList.split('-')[0] == 'Q'){//如果是群
                  // debugger
                  for(let i = 0; i < list.length; i++){//拼接每个群的头像和昵称
                      userLists['Q-'+list[i].id] = {
                          avatar: list[i].avatar,
                          chatRoomName: list[i].chatRoomName
                      }
                  }
                  //拼接这条对象
                  obj.avatar = userLists[idList].avatar;
                  obj.contactName = userLists[idList].chatRoomName;
                  obj.contactUnionId = "";
                  obj.contactUserId = "";
                  if(fromUserMsg.data.contentType == 2){
                      obj.content = '图片'
                  } else if (fromUserMsg.data.contentType == 8){
                      obj.content = '文件'
                  } else if (fromUserMsg.data.contentType == 4) {
                      obj.content = '语音'
                  }else{
                      obj.content = fromUserMsg.data.content
                  }
                  // obj.content = fromUserMsg.data.content;
                  obj.contentType = fromUserMsg.data.contentType;
                  obj.createdOnDate = fromUserMsg.data.createdOnDate;
                  obj.id = "";
                  obj.messages = [];
                  obj.read = 1;
                  obj.remark = "";
                  obj.toChatRoomId = fromUserMsg.data.toChatRoomId;
                  obj.itemid = idList//唯一id
              } else {//如果是人
                  userLists['R-'+list.id] = {//拼接这个人的头像及昵称
                      avatar: list.avatar,
                      chatRoomName: list.name
                  }
                  // debugger //拼接这条对象
                  obj.avatar = userLists[idList].avatar;
                  obj.contactName = userLists[idList].chatRoomName;
                  obj.contactUnionId = "";
                  obj.contactUserId = fromUserMsg.data.fromUserId;
                  if(fromUserMsg.data.contentType == 2){
                      obj.content = '图片'
                  } else if (fromUserMsg.data.contentType == 8){
                      obj.content = '文件'
                  } else if (fromUserMsg.data.contentType == 4) {
                      obj.content = '语音'
                  }else{
                      obj.content = fromUserMsg.data.content
                  }
                  // obj.content = fromUserMsg.data.content;
                  obj.contentType = fromUserMsg.data.contentType;
                  obj.createdOnDate = fromUserMsg.data.createdOnDate;
                  obj.id = fromUserMsg.data.toUserId;
                  obj.messages = [];
                  obj.read = 1;
                  obj.remark = fromUserMsg.data.remark;
                  obj.toChatRoomId = "";
                  obj.itemid = idList//唯一id
              }
              //this.localSet('userList',userLists)//储存user信息

              //联系人消息拼接
              messageLists.avatar = userLists[idList].avatar//用户头像
              messageLists.contactUnionId = fromUserMsg.data.fromUnionId//ssoid
              messageLists.contactUserId = fromUserMsg.data.fromUserId//用户id
              messageLists.content = fromUserMsg.data.content//消息内容
              messageLists.createdOnDate = fromUserMsg.data.createdOnDate//创建时间
              messageLists.direction = 2//收
              messageLists.id = fromUserMsg.data.id//消息id
              messageLists.type = fromUserMsg.data.contentType//消息类型
              // 最近联系人数据缓存列表
              let nowData = this.localGet('contactList') ==  null ? [] : this.localGet('contactList')
              
              //当前消息
              let masseges = []
              debugger
              if(this.localGet(idList)){//先获取本地是否有当前人的聊天数据,如果有那么用当前的数据来push 如果没有就为空
                  masseges = [this.localGet(idList)]
              }
              masseges.push(messageLists)
              this.localSet(idList, masseges)//以当前唯一id为键  储存聊天信息

              if(nowData.length != 0){//如果本地缓存不为空  用来操作最近联系人
                  // debugger
                  for(var i = 0; i < nowData.length; i++){
                      // debugger
                      if(fromUserId != JSON.parse(localStorage.getItem('userInfo')).id){//发送者id 不为自己的时候
                          // debugger
                          if(nowData[i].itemid == obj.itemid){//如果当前列表存在该id
                              // debugger
                              let curtData = nowData.splice(i,1)[0]//用一个变量接收该条本地数据
                                  if(messageLists.type == 2){
                                      curtData.content = '图片'
                                  } else if (messageLists.type == 8){
                                      curtData.content = '文件'
                                  } else if (messageLists.type == 4) {
                                      curtData.content = '语音'
                                  }else{
                                      curtData.content = fromUserMsg.data.content
                                  }
                                  curtData.read = 1

                                  //curtData.messages.push(messageLists)//对消息进行处理后加入该条数据
                                  nowData.unshift(curtData)//再把该数据放到本地缓存首位
                                  this.localSet('contactList', nowData)//存本地缓存
                                  flag = false//关闭当前缓存不为空，且没有该条数据的赋值
                                  break
                          }
                      }
                  }
                  if(flag){//如果当前缓存不为空，且没有该条数据，那么添加该条数据

                      //obj.messages.push(messageLists)//当前新聊天的所有信息
                      nowData.unshift(obj)
                      this.localSet('contactList', nowData)//存本地缓存
                      // flag = false
                  }
              } else {//如果本地缓存为空
                  // debugger

                  //obj.messages.push(messageLists)//当前新聊天的所有信息
                  nowData.unshift(obj)
                  this.localSet('contactList', nowData)//存本地缓存
              }
              // debugger
              if (fromUserId != JSON.parse(localStorage.getItem('userInfo')).id){//如果当前发送者id 不等于自己的id 那么提示更新
                  this.store.dispatch('talking/changeMutations', {counts: nowData});
              }
          })
          .catch(err=>{
              console.log('以上都错误的情况')
          })            
      // console.log('fromUserMsg',fromUserMsg);
  }
  //设置唯一id
  setUniqueId(id){
      if(id){
          console.log('群')
          let idList = 'Q-' + fromUserMsg.data.toChatRoomId
          return idList
      } else {
          let idList = 'R-' + fromUserMsg.data.toUserId
          return idList
          console.log('个人')
      }
  }
  localSet(name,data){//设置本地缓存
      localStorage.setItem(name, JSON.stringify(data))
  }
  localGet(data){//拿到本地缓存
      return JSON.parse(localStorage.getItem(data))
  }
  //订阅主题成功
  onSubscribeSuccess() {
      console.log('订阅主题成功');
  }
  //订阅主题失败
  onSubscribeFailure(data) {
      console.log('订阅主题失败',data);
  }
  sendMessage(ContentType){
      if(ContentType == 1) {
          console.log('文字 表情')

      } else if (ContentType == 2) {
          console.log('图片')
      } else {
          console.log('文件')
      }
  }
}