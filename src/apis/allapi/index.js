class DEV {

    constructor(){
        this.Upload = 'http://mservice.moerlong.com:8800/MAF.MELMS.Utility.File.FileServiceCom/api/SMFileStorage/CreateUpload'//上传图片
        this.ContactList = '/moerlong/im/service/contactGroup/findAllPublicGroupsAndContacts'//获取专家组联系列表
        this.GetSSOIdInfo = 'http://openapi.moerlong.com:8800/MAF.MELMS.User.UM.UMServiceCom/GetUserBySSOId'//通过ssoid获取联系人信息
        this.GetCompanyInfo = 'http://openapi.moerlong.com:8800/MAF.MELMS.User.UM.UMServiceCom/GetOrganizationById'//获取联系人公司信息
        this.GetGroupInfo = '/moerlong/im/service/chatRoom/findById'//获得群信息
        this.GetChatRoomMembers = '/moerlong/im/service/chatRoom/findWithMembersById'//查询指定聊天室及成员
        this.GetPeopleInfo = '/moerlong/im/service/user/findById'//获得个人信息
        this.sendMessage = '/moerlong/im/service/message/sendToPerson'//发送消息
        this.sendRoomMessage = '/moerlong/im/service/message/sendToRoom'//发送群消息
        this.GetChatRoomList = '/moerlong/im/service/chatRoom/findMine'//查询群列表
        this.MarkRead = '/moerlong/im/service/notification/read'//标记为已读
        this.Test2 = 'http://127.0.0.1:3000/test'//测试地址
    }
}

class Mock {
    constructor(){

    }
}

export const Api = new DEV();
