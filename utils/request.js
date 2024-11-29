// 配置基础URL
const BASE_URL = 'http://rhyme.nat300.top'

// 请求封装
const request = (options = {}) => {
    return new Promise((resolve, reject) => {
        // 获取token
        const token = uni.getStorageSync('token')
        
        // 合并选项
        options.url = BASE_URL + options.url
        options.header = {
            'Content-Type': 'application/json',
            // 如果有token就带上
            ...(token ? { 'WaAuthorization': token } : {}),
            ...options.header
        }
        // 发起请求
        uni.request({
            ...options,
            success: (res) => {
                if (res.statusCode === 200) {
                    if (res.data.code === 200) {
                        resolve(res.data)
                    } else {
                        uni.showToast({
                            title: res.data.message || '请求失败',
                            icon: 'none'
                        })
                        reject(res.data)
                    }
                } else {
                    uni.showToast({
                        title: '网络错误',
                        icon: 'none'
                    })
                    reject(new Error('Network Error'))
                }
            },
            fail: (err) => {
                uni.showToast({
                    title: '请求失败',
                    icon: 'none'
                })
                reject(err)
            }
        })
    })
}

export const get = (url, data = {}, options = {}) => {
    return request({
        url,
        data,
        method: 'GET',
        ...options
    })
}

export const post = (url, data = {}, options = {}) => {
    return request({
        url,
        data,
        method: 'POST',
        ...options
    })
}

export default {
    request,
    get,
    post
} 