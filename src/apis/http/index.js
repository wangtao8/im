import {service} from '../../utlis/request'
/**
 * get方法，post方法, 上传方法
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 * @param {String} method [请求类型]
 */

export function request(url, params, methods){
    let method = methods.toLocaleUpperCase()
    if (method == 'GET') {// get请求
      return new Promise((resolve, reject) =>{
        service.get(url, {
          params: params 
        })
          .then(res => {
            resolve(res);
          })
          .catch(err =>{
            // console.log('请求超时的信息：',err)
            resolve(err) 
          }) 
      })
    } else if (method =='POST') {// post请求
      return new Promise((resolve, reject) => {
        service.post(url, JSON.stringify(params))
         .then(res => {
           resolve(res);
         })
         .catch(err =>{
           resolve(err)
         })
       })
    } else if( (method =='PUT')){
      // debugger
      service.headers = {'Content-Type': 'application/json'}
      return new Promise((resolve, reject) => {
        service.put(url, params)
         .then(res => {
           resolve(res);
         })
         .catch(err =>{
           resolve(err)
         })
       })
    }else{// 上传方法
      service.headers = {'Content-Type': 'multipart/form-data'}
      return new Promise((resolve, reject) => {
        service.post(url, params).then(res => {
          // console.log('upload里面的值：', res.data)
            resolve(res.data);
        }).catch(error => {
            resolve(error);
        })
      })
    }
  }