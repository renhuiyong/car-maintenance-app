// 配置基础URL
// const BASE_URL = 'https://rhyme.mynatapp.cc'
const BASE_URL = 'https://kyx.qskyx.com/prod-api'
const BASE_URL_OSS = 'https://prod-car-maintenance-bucket.oss-cn-beijing.aliyuncs.com/'

// OSS凭证缓存
let ossTokenCache = {
    token: null,
    timestamp: null
}

// 检查OSS凭证是否过期
const isOssTokenExpired = () => {
    if (!ossTokenCache.timestamp) return true
    const now = Date.now()
    const diff = now - ossTokenCache.timestamp
    // 如果距离上次获取时间超过55分钟（预留5分钟缓冲），则认为过期
    return diff > 55 * 60 * 1000
}

// 获取OSS凭证
const getOssToken = async (tokenType) => {
    if (!isOssTokenExpired() && ossTokenCache.token) {
        return ossTokenCache.token
    }
    const tokenRes = await request({
        url: '/web/user/oss/token',
        method: 'GET',
        tokenType
    })

    if (tokenRes.code !== 200) {
        throw new Error(tokenRes.msg || '获取上传凭证失败')
    }

    ossTokenCache = {
        token: tokenRes.data,
        timestamp: Date.now()
    }

    return tokenRes.data
}

// 请求封装
const request = (options = {}) => {
    return new Promise((resolve, reject) => {
        // 获取token
        const token = uni.getStorageSync('token')
        const merchantToken = uni.getStorageSync('merchantToken')
        const supplyChainToken = uni.getStorageSync('supplyChainToken')

        // 合并选项
        options.url = BASE_URL + options.url
        options.header = {
            'Content-Type': 'application/json',
            // 根据tokenType使用不同的token
            ...(options.tokenType === 'merchant' ? { 'WaAuthorization': merchantToken } :
               options.tokenType === 'supplyChain' ? { 'WaAuthorization': supplyChainToken } :
               token ? { 'WaAuthorization': token } : {}),
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
                            const roleFlag = uni.getStorageSync('roleFlag')
                            if (roleFlag === 1) {
                                uni.clearStorageSync()
                                uni.setStorageSync('roleFlag', 1)
                                uni.switchTab({
                                     url: '/pages/my/my'
                                })
                            } else if (roleFlag === 2) {
                                uni.clearStorageSync()
                                uni.setStorageSync('roleFlag', 2)
                                uni.reLaunch({
                                    url: '/pages/merchant/merchant'
                                })
                            } else if (roleFlag === 3) {
                                uni.clearStorageSync()
                                uni.setStorageSync('roleFlag', 3)
                                uni.reLaunch({
                                    url: '/pages/supplyChainMy/supplyChainMy'
                                })
                            }
                            reject(res.data)
                        }, 3000)
                        return
                    }

                    if (res.data.code === 200) {
                        resolve(res.data)
                    } else {
                        uni.showToast({
                            title: res.data.msg || '请求失败',
                            icon: 'none'
                        })
                        resolve(res.data)
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

// 封装上传方法
const upload = async (options = {}) => {
    try {
        console.log('options', options)
        // 1. 获取OSS上传凭证
        const ossData = await getOssToken(options.tokenType)

        // 2. 构建文件名
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')

        // 获取文件后缀名
        let fileExt = ''
        const tempFilePath = options.file

        // 根据uni.uploadFile的文件类型判断后缀
        if (tempFilePath.indexOf('mp3') > -1 || tempFilePath.indexOf('audio') > -1) {
            fileExt = '.mp3'
        } else {
            // 默认按照图片处理，微信小程序选择的图片
            if (tempFilePath.indexOf('.png') > -1) {
                fileExt = '.png'
            } else if (tempFilePath.indexOf('.jpg') > -1) {
                fileExt = '.jpg'
            } else if (tempFilePath.indexOf('.jpeg') > -1) {
                fileExt = '.jpeg'
            } else if (tempFilePath.indexOf('.gif') > -1) {
                fileExt = '.gif'
            } else if (tempFilePath.indexOf('.webp') > -1) {
                fileExt = '.webp'
            } else if (tempFilePath.indexOf('.bmp') > -1) {
                fileExt = '.bmp'
            } else if (tempFilePath.indexOf('.svg') > -1) {
                fileExt = '.svg'
            } else {
                fileExt = '.jpg'  // 默认jpg
            }
        }

        // 生成唯一文件名
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).slice(-6)
        const fileName = `${ossData.dir}${year}/${month}/${day}/${timestamp}_${randomStr}${fileExt}`

        // 3. 构建上传参数
        const formData = {
            'key': fileName,
            'policy': ossData.policy,
            'x-oss-signature-version': ossData.x_oss_signature_version,
            'x-oss-date': ossData.x_oss_date,
            'x-oss-credential': ossData.x_oss_credential,
            'x-oss-security-token': ossData.security_token,
            'x-oss-signature': ossData.signature,
            'success_action_status': '200'
        }

        // 4. 上传文件
        return new Promise((resolve, reject) => {
            uni.uploadFile({
                url: ossData.host,
                filePath: options.file,
                name: 'file',
                formData: formData,
                success: (uploadRes) => {
                    if (uploadRes.statusCode === 200) {
                        // 上传成功，返回文件信息
                        resolve({
                            code: 200,
                            msg: '上传成功',
                            fileName: fileName,
                            url: `${ossData.host}/${fileName}`
                        })
                    } else {
                        reject(new Error('上传失败'))
                    }
                },
                fail: (err) => {
                    reject(err)
                }
            })
        })

    } catch (err) {
        return Promise.reject({
            code: 500,
            msg: err.message || '上传失败'
        })
    }
}

export default {
    request,
    get,
    post,
    BASE_URL,
    BASE_URL_OSS,
    upload
}
