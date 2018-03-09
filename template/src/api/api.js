import axios from 'axios'
{{#if_eq proType "admin"}}
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import authUtils from '@/utils/auth'
{{/if_eq}}
const instance = axios.create({
  timeout: 15000
})
{{#if_eq proType "admin"}}
// request拦截器
service.interceptors.request.use(config => {
  if (store.getters.token) {
    // 让每个请求携带自定义token 请根据实际情况自行修改
    config.headers['X-Token'] = authUtils.getToken()
  }
  return config
}, error => {
  // Do something with request error
  console.log(error)
  Promise.reject(error)
})

// respone拦截器
service.interceptors.response.use(
  response => {
  /**
  * returncode为非10000是抛错 可结合自己业务进行修改
  */
    const res = response.data
    if (res.returncode !== 10000) {
      Message({
        message: res.data,
        type: 'error',
        duration: 5 * 1000
      })

      // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
      if (res.returncode === 50008 || res.returncode === 50012 || res.returncode === 50014) {
        MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('FedLogOut').then(() => {
            // 为了重新实例化vue-router对象 避免bug
            location.reload()
          })
        })
      }
      return Promise.reject(new Error('error'))
    } else {
      return response.data
    }
  },
  error => {
    console.log('err' + error)
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)
{{/if_eq}}
const API = {
  get (url, params, callback) {
    return new Promise((resolve, reject) => {
      instance.get(url, params).then((response) => {
        if (response.returncode === 10000) {
          callback && callback(response.data)
          resolve(response.data)
        } else {
          console.log('服务器错误:' + response.message)
          reject(response.message)
        }
      }).catch((error) => {
        console.log('服务器错误!' + error)
        reject(error)
      })
    })
  },
  post (url, params, callback) {
    return new Promise((resolve, reject) => {
      instance.post(url, params).then((response) => {
        if (response.returncode === 10000) {
          callback && callback(response.data)
          resolve(response.data)
        } else {
          console.log('服务器错误:' + response.message)
          reject(response.message)
        }
      }).catch((error) => {
        console.log('服务器错误!' + error)
        reject(error)
      })
    })
  }
}

export { API }
