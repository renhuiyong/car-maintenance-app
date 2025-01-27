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
           // 获取消息通知列表
        getNotificationList(params) {
            return request.get('/web/repair/order/notificationList', params)
        },
        // 阅读通知
        readNotification(id) {
            return request.post(`/web/repair/order/readNotification/${id}`)
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
        // 获取订单详情
        getOrderDetail(id) {
            return request.get(`/web/repair/order/orderDetail/${id}`)
        },
        // 获取维修配件信息
        getRepairParts(type, repairOrderId) {
            return request.get(`/web/user/shopOrder/getRepairParts/${type}/${repairOrderId}`)
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

        // 获取发货订单列表
        getDeliveryOrderList(params) {
            return request.get('/web/shop/deliveryOrderlist', params)
        },

        // 获取发货订单详情
        getDeliveryOrderInfo(id) {
            return request.get(`/web/shop/deliveryOrderInfo/${id}`)
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
        },

        // 获取商品订单列表
        getShopOrderList(params) {
            return request.get('/web/user/shopOrder/getShopOrderList', params)
        },

        // 检查是否第一次购买维修配件
        checkFirstPurchase(repairOrderId) {
            return request.get(`/web/user/shopOrder/checkFirstPurchase/${repairOrderId}`)
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
        // 创建merchant请求的工具函数
        createMerchantRequest(method, url, data = {}, customConfig = {}) {
            const config = { tokenType: 'merchant', ...customConfig };
            return method === 'get' ? 
                request.get(url, data, config) : 
                request.post(url, data, config);
        },

        // 商户微信登录
        wxMerchantLogin(data) {
            return this.createMerchantRequest('post', '/wx/miniapp/merchantLogin', data)
        },
        // 获取商家审核状态
        getShopSelfExamineStatus() {
            return this.createMerchantRequest('get', '/web/shop/getShopSelfExamineStatus')
        },
        // 更新商户资料
        updateMerchantProfile(data) {
            return this.createMerchantRequest('post', '/web/merchant/updateMerchantProfile', data)
        },
        // 提交商家入驻申请
        submitSettled(data) {
            return this.createMerchantRequest('post', '/web/shop/settledShop', data)
        },
        // 获取推广二维码
        getMerchantPromotionCode() {
            return this.createMerchantRequest('post', '/web/merchant/getMerchantPromotionCode')
        },
        // 获取商家自身信息
        getShopSelf() {
            return this.createMerchantRequest('get', '/web/shop/getShopSelf')
        },
        // 获取商家营业状态
        getShopBusinessStatus() {
            return this.createMerchantRequest('get', '/web/shop/getShopSelfBusinessStatus')
        },
        // 获取商家订单列表
        getOrderList(params) {
            return this.createMerchantRequest('get', '/web/merchant/order/list', params)
        },
        // 商家回复订单
        merchantToResponse(data) {
            return this.createMerchantRequest('post', '/web/merchant/order/merchantToResponse', data)
        },
        // 开始维修
        startRepair(orderId) {
            return this.createMerchantRequest('post', `/web/merchant/order/startRepair/${orderId}`)
        },
        // 完成维修
        finishRepair(orderId) {
            return this.createMerchantRequest('post', `/web/merchant/order/finishRepair/${orderId}`)
        },
        // 获取消息通知列表
        getNotificationList(params) {
            return this.createMerchantRequest('get', '/web/merchant/order/notificationList', params)
        },
        // 阅读通知
        readNotification(id) {
            return this.createMerchantRequest('post', `/web/merchant/order/readNotification/${id}`)
        },
        // 获取商品订单列表
        getMerchantShopOrderList(params) {
            return this.createMerchantRequest('get', '/web/merchant/order/getMerchantShopOrderList', params)
        },
        // 取消商品订单
        cancelOrder(data) {
            return this.createMerchantRequest('post', '/web/merchant/order/merchantCancelShopOrder', data)
        },
        // 取消维修订单
        merchantCancelRepairOrder(data) {
            return this.createMerchantRequest('post', '/web/merchant/order/merchantCancelRepairOrder', data)
        },
        // 获取抢单大厅列表
        getGrabOrderList(params) {
            return this.createMerchantRequest('post', '/web/merchant/order/getGrabOrderList', params)
        },
        // 商家抢单
        grabOrder(data) {
            return this.createMerchantRequest('post', `/web/merchant/order/grabOrder/${data.orderId}`)
        },
        // 获取抢单详情
        getGrabOrderDetail(data) {
            return this.createMerchantRequest('get', `/web/merchant/order/grabOrderDetail/${data.orderId}`)
        },
        // 提交付款凭证
        submitPaymentProof(data) {
            return this.createMerchantRequest('post', '/web/shop/uploadBondUrl?bondUrl=' + data.paymentProofs)
        },
        getCommissionAccount() {
            return this.createMerchantRequest('get', '/web/user/commission/commissionAccount')
        },
        // 获取发货订单列表
        getDeliveryOrderList(params) {
            return this.createMerchantRequest('get', '/web/shop/deliveryOrderlist', params)
        },
        // 获取商家账户信息
        getShopAccount() {
            return this.createMerchantRequest('get', '/web/user/commission/shopAccount')
        },
        // 获取商家账户记录
        getShopAccountRecord(params) {
            return this.createMerchantRequest('get', '/web/user/commission/shopAccountRecord', params)
        },
        // 提现
        shopAccountWithdraw(data) {
            return this.createMerchantRequest('post', '/web/user/commission/shopAccountWithdraw?amount=' + String(data.amount))
        },
        // 获取商品列表
        getProducts(data) {
            return this.createMerchantRequest('get', '/web/accessory/getList', data)
        },

        // 获取品牌列表
        selectModelsList() {
            return this.createMerchantRequest('get', '/web/accessory/selectModelsList')
        },
         // 获取配件详情
         getAccessory(data) {
            return this.createMerchantRequest('get', '/web/accessory/getAccessory', data)
        },
        // 上传文件
        uploadFile(file) {
            return request.upload({
                file,
                tokenType: 'merchant'
            })
        },
        //解析手机号
        decryptPhoneNumber(data) {
            return this.createMerchantRequest('post', '/wx/miniapp/decryptPhoneNumber', data)
        },
        // 获取配套服务列表
        getServicesList() {
            return this.createMerchantRequest('get', '/web/shop/selectServicesList')
        },
        // 商家上线
        shopOnline() {
            return this.createMerchantRequest('post', '/web/shop/openBusiness')
        },
        // 商家下线
        shopOffline() {
            return this.createMerchantRequest('post', '/web/shop/closeBusiness')
        },
        // 获取佣金记录
        getCommissionRecord(params) {
            return this.createMerchantRequest('get', '/web/user/commission/commissionRecord', params)
        },
         // 获取发货订单详情
         getDeliveryOrderInfo(id) {
            return this.createMerchantRequest('get', `/web/shop/deliveryOrderInfo/${id}`)
        },
         // 获取商品列表
         getProducts(data) {
            return this.createMerchantRequest('get', '/web/accessory/getList', data)
        },

         // 获取品牌列表
         selectModelsList() {
            return this.createMerchantRequest('get', '/web/accessory/selectModelsList')
        },
    },
    common: {
        // 上传文件
        uploadFile(file) {
            return request.upload({
                file
            })
        },
         //解析手机号
         decryptPhoneNumber(data) {
            return request.post('/wx/miniapp/decryptPhoneNumber', data)
        },
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
    },
    // 供应链相关接口
    supplyChain: {
        // 创建supplyChain请求的工具函数
        createSupplyChainRequest(method, url, data = {}, customConfig = {}) {
            const config = { tokenType: 'supplyChain', ...customConfig };
            return method === 'get' ? 
                request.get(url, data, config) : 
                request.post(url, data, config);
        },

        // 提交供应链入驻申请
        settledSupplyChain(data) {
            return this.createSupplyChainRequest('post', '/web/supplyChain/settledSupplyChain', data)
        },
        // 供应链微信登录
        wxSupplyChainLogin(data) {
            return this.createSupplyChainRequest('post', '/wx/miniapp/supplyChainLogin', data)
        },
        // 更新供应链资料
        updateSupplyChainProfile(data) {
            return this.createSupplyChainRequest('post', '/web/supplyChain/updateMerchantProfile', data)
        },
        // 获取供应商状态
        getSupplyChainStatus() {
            return this.createSupplyChainRequest('get', '/web/supplyChain/getSupplyChainStatus')
        },
        // 获取供应商详情
        getSupplyChainDetail() {
            return this.createSupplyChainRequest('get', '/web/supplyChain/getSupplyChainInfo')
        },
        // 获取快递公司列表
        getExpressList() {
            return this.createSupplyChainRequest('get', '/web/supplyChain/listAll')
        },
        // 我的配件
        getMyAccessoryList(data) {
            return this.createSupplyChainRequest('get', '/web/supplyChain/getAccessoryList', data)
        },
        // 添加配件
        addAccessory(data) {
            return this.createSupplyChainRequest('post', '/web/supplyChain/addAccessory', data)
        },
        // 获取配件详情
        getAccessoryDetail(data) {
            return this.createSupplyChainRequest('get', '/web/supplyChain/getAccessory', data)
        },
        // 修改配件
        updateAccessory(data) {
            return this.createSupplyChainRequest('post', '/web/supplyChain/updateAccessory', data)
        },
        // 获取进货订单列表
        getPurchaseOrderList(params) {
            return this.createSupplyChainRequest('get', '/web/supplyChain/purchaseOrderlist', params)
        },
        // 发货
        deliver(data) {
            return this.createSupplyChainRequest('post', '/web/supplyChain/deliver', data)
        },
        // 获取订单详情
        getPurchaseOrderDetail(id) {
            return this.createSupplyChainRequest('get', `/web/supplyChain/purchaseOrderInfo/${id}`)
        },
        // 发货
        sendOrder(data) {
            return this.createSupplyChainRequest('post', '/web/supplyChain/sendOrder', data)
        },
        // 获取消息通知列表
        getNotificationList(params) {
            return this.createSupplyChainRequest('get', '/web/supplyChain/notificationList', params)
        },
        // 阅读通知
        readNotification(id) {
            return this.createSupplyChainRequest('post', `/web/supplyChain/readNotification/${id}`)
        },
        // 上传文件
        uploadFile(file) {
            return request.upload({
                file,
                tokenType: 'supplyChain'
            })
        },
        //解析手机号
        decryptPhoneNumber(data) {
            return this.createSupplyChainRequest('post', '/wx/miniapp/decryptPhoneNumber', data)
        },
         // 获取品牌列表
         selectModelsList(){
            return this.createSupplyChainRequest('get','/web/accessory/selectModelsList')
         },
         // 获取配件分类列表
         selectTypesList(){
            return this.createSupplyChainRequest('get','/web/accessory/selectTypesList')
         },
    },
    // 佣金相关接口
    commission: {
        // 获取佣金账户信息
        getCommissionAccount() {
            return request.get('/web/user/commission/commissionAccount')
        },
        // 获取佣金记录
        getCommissionRecord(params) {
            return request.get('/web/user/commission/commissionRecord', params)
        },
        // 提现
        withdraw(data) {
            return request.post('/web/user/commission/withdraw?amount=' + String(data.amount))
        },
        // 获取商家账户信息
        getShopAccount() {
            return request.get('/web/user/commission/shopAccount')
        },
        // 获取商家账户记录
        getShopAccountRecord(params) {
            return request.get('/web/user/commission/shopAccountRecord', params)
        },
        // 提现
        shopAccountWithdraw(data) {
            return request.post('/web/user/commission/shopAccountWithdraw?amount=' + String(data.amount))
        },
    },
    // 支付相关接口
    payment: {
        // 获取收款的调起参数
        // 返回格式：
        // {
        //   code: 200,
        //   data: {
        //     mchId: '商户号',
        //     package: '预支付交易会话标识'
        //   }
        // }
        getTransferPayParams(data) {
            return request.post('/wx/miniapp/getTransferPayParams', data)
        }
    }
}

export default api
