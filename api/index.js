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
        },
        // 提交维修工单
        submitRepairOrder(data) {
            return request.post('/web/repair/order/submit', data)
        },
        // 获取维修工单列表
        getOrderList(params) {
            return request.get('/web/repair/order/list', params)
        },
        // 获取商家回复
        getMerchantResponse(params) {
            return request.get('/web/repair/order/merchantResponse', params)
        },
    },

    // 商城相关接口
    shop: {
        // 获取商品列表
        getProducts: (data) => request.get('/web/accessory/getList', data),
        
        // 获取品牌列表
        selectModelsList: () => request.get('/web/accessory/selectModelsList'),
        
        // 获取配件分类列表
        selectTypesList: () => request.get('/web/accessory/selectTypesList'),
        
        // 获取配件详情
        getAccessory: (data) => request.get('/web/accessory/getAccessory', data),
        
        // 获取商品详情
        getProductDetail(id) {
            return request.get(`/shop/product/${id}`)
        },

        // 添加获取维修商家列表接口
        getShopList(params) {
            return request.get('/web/shop/getList', params)
        },

        // 获取商家详情
        getShopDetail(params) {
            return request.get('/web/shop/getShop', {
                shopId: params.shopId,
                latitude: params.latitude,
                longitude: params.longitude
            })
        },
        // 检查商品库存
        checkStock(data) {
            return request.post('/web/accessory/checkStock', data)
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
            return request.post('/web/user/shopOrder/create', data)
        },
        
        // 取消订单
        cancel(orderId) {
            return request.post(`/order/cancel/${orderId}`)
        }
    },

    // 消息相关接口
    message: {
        // 获消息列表
        getList(data) {
            return request.get('/message/list', data)
        },
        
        // 标记消息已读
        markRead(messageId) {
            return request.post(`/message/read/${messageId}`)
        }
    },

    // 商家相关接口
    merchant: {
           // 商户微信登录
        wxMerchantLogin(data) {
            return request.post('/wx/miniapp/merchantLogin', data)
        },
        // 更新商户资料
        updateMerchantProfile(data) {
            return request.post('/web/merchant/updateMerchantProfile', data)
        },
        // 提交商家入驻申请
        submitSettled(data) {
            return request.post('/web/shop/settledShop', data)
        },
         // 获取推广二维码
         getMerchantPromotionCode() {
            return request.post('/web/merchant/getMerchantPromotionCode')
        },
        // 获取商家自身信息
        getShopSelf() {
            return request.get('/web/shop/getShopSelf')
        }
      
    },
    common: {
        // 上传文件
        uploadFile(file) {
            return request.upload('/web/user/upload', {
                file,
                name: 'file'
            })
        }
    },
    // 在 api 对象中添加收藏相关接口
    favorite: {
        // 添加收藏
        add(data) {
            return request.post('/web/user/favorite/add', data)
        },
        
        // 取消收藏
        cancel(data) {
            return request.post('/web/user/favorite/cancel', data)
        },
        
        // 获取收藏列表
        getList(params) {
            return request.get('/web/user/favorite/list', params)
        },
        
        // 检查是否已收藏
        checkStatus(data) {
            return request.get('/web/user/favorite/check', data)
        }
    },
    // 优惠券相关接口
    coupon: {
        // 获取优惠券列表
        getCouponList(query) {
            return request.post('/web/user/coupon/getCouponList', query)
        },
        // 使用优惠券
        useCoupon(data) {
            return request.post('/web/user/coupon/use', data)
        }
    }
}

export default api 
