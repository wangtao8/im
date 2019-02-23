import axios from 'axios'
import qs from 'qs'
import router from '../router/index'

export const service = axios.create({})
service.defaults.baseURL = 'http://openapi.moerlong.com:8081'
service.defaults.timeout = 5*1000;
service.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';

// 请求拦截
service.interceptors.request.use(
    config => {
      // if(token){//如果token有值才进行赋值  这个值可以是store里面取  可以是本地缓存取
      let publicParameter = {appKey: "12345", token: "2018121713093900001"}
         config.headers['publicParameter.appkey'] = publicParameter.appKey
         config.headers['publicParameter.token'] = publicParameter.token
      // }
      // console.log('config:', config)
      //判断token是否生效
      return config
    },
    error => {
      console.log(error) // for debug
      Promise.reject(error)
    }
  )
 
  
  //响应拦截器即异常处理
service.interceptors.response.use(response => {
    // console.log('拦截器里面请求：', response)
    return response
}, err => {
    // console.log('请求失败:', err)
    if (err && err.response) {
      switch (err.status) {
        case 400:
          err.message = '错误请求'
          break;
        case 401:
          err.message = '未授权，请重新登录'
          // Router.replace({ path: '/login' });
          break;
        case 403:
          err.message = '拒绝访问'
          break;
        case 404:
          err.message = '请求错误,未找到该资源'
          break;
        case 405:
          err.message = '请求方法未允许'
          break;
        case 408:
          err.message = '请求超时'
          break;
        case 500:
          err.message = '服务器端出错'
          //router.replace('/index')//跟 router.push 很像，唯一的不同就是，它不会向 history 添加新记录，而是跟它的方法名一样 —— 替换掉当前的 history 记录
          break;
        case 501:
          err.message = '网络未实现'
          break;
        case 502:
          err.message = '网络错误'
          break;
        case 503:
          err.message = '服务不可用'
          break;
        case 504:
          err.message = '网络超时'
          break;
        case 505:
          err.message = 'http版本不支持该请求'
          break;
        default:
          err.message = `连接错误${err.status}`
      }
    } else {
      err.message = "连接到服务器失败"
    }
      // console.log('err:', err)
      return Promise.reject(err)
})
