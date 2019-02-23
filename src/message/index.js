import GetChatRoomList from './xxx'
class MessageProcessing {
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
}