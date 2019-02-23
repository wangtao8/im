import {request} from '../http'
import {Api} from '../allapi'

/**
 * 测试
 */
 export const Test2 = data => request(Api.Test2, data, 'get');

 /**
 * 上传
 */
export const Upload = query => request(Api.Upload, query, 'upload');

/**
 * 发送消息
 */
export const sendMessage = data => request(Api.sendMessage, data, 'post')

/**
 * 发送群消息
 */
export const sendRoomMessage = data => request(Api.sendRoomMessage, data, 'post')

/** 
 * 获取专家组联系列表
 */
export const ContactList = query => request(Api.ContactList, query, 'get')
  
/**
 * 获取联系人信息
 */
export const GetInfos = query => request(Api.GetPeopleInfo, query, 'get')

export const GetSSOIdInfo = query =>request(Api.GetSSOIdInfo, query, 'get')

export const GetCompanyInfo = query => request(Api.GetCompanyInfo, query, 'get')

/**
 * 查询指定聊天室及成员
 */
export const GetChatRoomMembers = query => request(Api.GetChatRoomMembers, query, 'get')

/**
 * 获得新的群消息
 */
export const GetGroupInfo = query => request(Api.GetGroupInfo, query, 'get')

/**
 * 获得新的个人消息
 */
export const GetPeopleInfo = query => request(Api.GetPeopleInfo, query, 'get')

/**
 * 获得群列表
 */
export const GetChatRoomList = query => request(Api.GetChatRoomList, query, 'get')

/**
 * 标记通知为已读
 */

 export const MarkRead = query => request(Api.MarkRead, query, 'put')

