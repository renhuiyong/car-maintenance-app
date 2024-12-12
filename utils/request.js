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
                    // 处理 token 无效和未能读取到有效 token 的情况
                    if (res.data.code === 401 && res.data.msg && 
                        (res.data.msg.includes('token') || 
                        res.data.msg.includes('未登录'))) {
                        // 清除所有用户相关的缓存数据
                        uni.removeStorageSync('token')
                        uni.removeStorageSync('userInfo')
                        uni.removeStorageSync('profile')
                        
                        // 提示用户
                        uni.showToast({
                            title: '登录已过期，请重新登录',
                            icon: 'none'
                        })
                        
                        // 延迟执行跳转和reject
                        setTimeout(() => {
                            uni.switchTab({
                                url: '/pages/my/my'
                            })
                            reject(res.data)
                        }, 1500)
                        return
                    }

                    if (res.data.code === 200) {
                        resolve(res.data)
                    } else {
                        uni.showToast({
                            title: res.data.message || res.data.msg || '请求失败',
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

// 添加文件上传方法
const upload = (url, options = {}) => {
    return new Promise((resolve, reject) => {
        uni.uploadFile({
            url: BASE_URL + url,
            filePath: options.file,
            name: options.name || 'file',
            formData: options.formData || {},
            header: {
                'WaAuthorization': uni.getStorageSync('token') || ''
            },
            success: (uploadFileRes) => {
                console.log(uploadFileRes)
                let result = uploadFileRes.data;
                if (typeof result === 'string') {
                    try {
                        result = JSON.parse(result);
                        console.log('result1', result)
                    } catch (e) {
                        reject(new Error('上传失败，返回数据格式错误'));
                        return;
                    }
                }
                console.log('result2', result)
                if (result.code === 200) {
                    console.log('result3', result)
                    // 返回文件名和完整URL
                    resolve({
                        fileName: result.fileName,
                        url: result.url
                    });
                } else {
                    reject(new Error(result.msg || '上传失败'));
                }
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}

export default {
    request,
    get,
    post,
    BASE_URL,
    upload
} 
