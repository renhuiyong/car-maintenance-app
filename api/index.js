import request from '../utils/request'

// 所有接口统一管理
const api = {
    // 用户相关接口
    user: {
        // 微信登录
        wxLogin(data) {
            return request.post('/wx/miniapp/login', data)
        },
        
        // 手机号密码登录
        login(data) {
            return request.post('/login', data)
        },
        
        // 获取用户信息
        getUserInfo() {
            return request.get('/user/info')
        },
        
        // 更新用户信息
        updateUserInfo(data) {
            return request.post('/user/update', data)
        },
        bindPhone(data) {
            return request.post('/user/bindPhone', data)
        },
          
        updateProfile(data) {
            return request.post('/web/user/updateProfile', data)
        },
        updateAvatar(data) {
            return request.post('/user/updateAvatar', {
                avatarUrl: data.avatarUrl
            })
        },
        
        // 获取推广二维码
        getPromotionCode() {
            return request.post('/web/user/getPromotionCode')
        },
    },

    // 维修相关接口
    repair: {
        // 获取维修列表
        getList(data) {
            return request.get('/repair/list', data)
        },
        
        // 提交维修订单
        submit(data) {
            return request.post('/repair/submit', data)
        }
    },

    // 商城相关接口
    shop: {
        // 获取商品列表
        getProducts(data) {
            return request.get('/shop/products', data)
        },
        
        // 获取商品详情
        getProductDetail(id) {
            return request.get(`/shop/product/${id}`)
        },

        // 添加获取维修商家列表接口
        getShopList(params) {
            return request.get('/web/shop/getList', params)
        }
    },

    // 订单相关接口
    order: {
        // 获取订单列表
        getList(data) {
            return request.get('/order/list', data)
        },
        
        // 创建订单
        create(data) {
            return request.post('/order/create', data)
        },
        
        // 取消订单
        cancel(orderId) {
            return request.post(`/order/cancel/${orderId}`)
        }
    },

    // 消息相关接口
    message: {
        // 获取消息列表
        getList(data) {
            return request.get('/message/list', data)
        },
        
        // 标记消息已读
        markRead(messageId) {
            return request.post(`/message/read/${messageId}`)
        }
    },
}

export default api 