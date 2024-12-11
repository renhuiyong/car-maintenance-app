<template>
  <view class="order-detail">
    <template v-if="orderInfo">
      <!-- 订单状态 -->
      <view class="status-section">
        <text class="status-text">{{ getStatusText(orderInfo.status) }}</text>
        <text class="status-desc">{{ getStatusDesc(orderInfo.status) }}</text>
      </view>
      
      <!-- 维修信息 -->
      <view class="repair-info" v-if="orderInfo.repairInfo">
        <view class="section-title">维修信息</view>
        <view class="info-item">
          <text class="label">问题描述</text>
          <text class="value">{{ orderInfo.repairInfo.problem }}</text>
        </view>
        <view class="info-item">
          <text class="label">维修地址</text>
          <text class="value">{{ orderInfo.repairInfo.address }}</text>
        </view>
        <view class="info-item">
          <text class="label">预约时间</text>
          <text class="value">{{ orderInfo.repairInfo.appointmentTime }}</text>
        </view>
      </view>
      
      <!-- 店铺信息 -->
      <view class="shop-section">
        <view class="shop-info">
          <image src="/static/images/dingwei.png" mode="aspectFit"></image>
          <text class="shop-name">{{ orderInfo.shopName }}</text>
        </view>
        <view class="contact-btn" @click="contactShop">
          <image src="/static/images/dianhua.png" mode="aspectFit"></image>
          <text>联系商家</text>
        </view>
      </view>
      
      <!-- 商品列表 -->
      <view class="goods-section">
        <view class="goods-item" v-for="(goods, index) in orderInfo.goods" :key="index">
          <image class="goods-img" :src="goods.image" mode="aspectFill"></image>
          <view class="goods-info">
            <text class="goods-name">{{ goods.name }}</text>
            <view class="price-quantity">
              <text class="price">¥{{ goods.price }}</text>
              <text class="quantity">x{{ goods.quantity }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 订单信息 -->
      <view class="order-info">
        <view class="info-item">
          <text class="label">订单编号</text>
          <view class="value-wrap">
            <text class="value">{{ orderInfo.id }}</text>
            <text class="copy-btn" @click="copyOrderId">复制</text>
          </view>
        </view>
        <view class="info-item">
          <text class="label">创建时间</text>
          <text class="value">{{ orderInfo.createTime }}</text>
        </view>
        <view class="info-item" v-if="orderInfo.completedTime">
          <text class="label">完成时间</text>
          <text class="value">{{ orderInfo.completedTime }}</text>
        </view>
        <view class="info-item" v-if="orderInfo.cancelTime">
          <text class="label">取消时间</text>
          <text class="value">{{ orderInfo.cancelTime }}</text>
        </view>
        <view class="info-item" v-if="orderInfo.cancelReason">
          <text class="label">取消原因</text>
          <text class="value">{{ orderInfo.cancelReason }}</text>
        </view>
      </view>
      
      <!-- 金额信息 -->
      <view class="amount-section">
        <view class="amount-item">
          <text>商品总额</text>
          <text class="amount">¥{{ getTotalAmount() }}</text>
        </view>
        <view class="divider"></view>
        <view class="amount-item">
          <text>实付金额</text>
          <text class="amount highlight">¥{{ orderInfo.finalAmount }}</text>
        </view>
      </view>
      
      <!-- 底部操作按钮 -->
      <view class="footer">
        <view 
          class="action-btn"
          v-for="(btn, index) in getOrderButtons(orderInfo.status)"
          :key="index"
          :class="{ primary: btn.primary }"
          @click="handleAction(btn.action)"
        >
          {{ btn.text }}
        </view>
      </view>
    </template>
    
    <!-- 加载状态 -->
    <view v-else class="loading-state">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
const ORDER_STATUS = {
  PENDING_PAY: 0,    // 待付款
  IN_PROGRESS: 4,    // 进行中
  COMPLETED: 2,      // 已完成
  CANCELLED: 3       // 已取消
}

export default {
  data() {
    return {
      orderId: '',
      orderInfo: null,
      loading: true
    }
  },
  
  onLoad(options) {
    if (options.orderId) {
      this.orderId = options.orderId
      this.getOrderDetail()
    }
  },
  
  onUnload() {
    // 页面卸载时清除存储的订单信息
    uni.removeStorageSync('currentOrder')
  },
  
  methods: {
    // 修改获取订单详情的方法
    getOrderDetail() {
      this.loading = true
      try {
        // 从本地存储获取当前订单信息
        const orderStr = uni.getStorageSync('currentOrder')
        if (orderStr) {
          const order = JSON.parse(orderStr)
          if (order.id === this.orderId) {
            this.orderInfo = order
          }
        }
      } catch (e) {
        console.error('获取订单详情失败:', e)
      } finally {
        this.loading = false
      }
    },
    
    // 修改获取状态文本的方法
    getStatusText(status) {
      const statusMap = {
        [ORDER_STATUS.PENDING_PAY]: '待付款',
        [ORDER_STATUS.IN_PROGRESS]: '进行中',
        [ORDER_STATUS.COMPLETED]: '已完成',
        [ORDER_STATUS.CANCELLED]: '已取消'
      }
      return statusMap[status] || '未知状态'
    },
    
    // 修改获取状态描述的方法
    getStatusDesc(status) {
      const descMap = {
        [ORDER_STATUS.PENDING_PAY]: '请尽快完成支付',
        [ORDER_STATUS.IN_PROGRESS]: '维修正在进行中',
        [ORDER_STATUS.COMPLETED]: '订单已完成',
        [ORDER_STATUS.CANCELLED]: '订单已取消'
      }
      return descMap[status] || ''
    },
    
    // 修改获取订单按钮的方法
    getOrderButtons(status) {
      const btnMap = {
        [ORDER_STATUS.PENDING_PAY]: [
          { text: '取消订单', action: 'cancel' },
          { text: '去支付', action: 'pay', primary: true }
        ],
        [ORDER_STATUS.IN_PROGRESS]: [
          { text: '查看进度', action: 'progress' }
        ],
        [ORDER_STATUS.COMPLETED]: [
          { text: '删除订单', action: 'delete' },
          { text: '再次购买', action: 'rebuy', primary: true }
        ],
        [ORDER_STATUS.CANCELLED]: [
          { text: '删除订单', action: 'delete' }
        ]
      }
      return btnMap[status] || []
    },
    
    // 处理按钮操作
    handleAction(action) {
      const actionMap = {
        cancel: this.cancelOrder,
        pay: this.payOrder,
        progress: this.viewProgress,
        delete: this.deleteOrder,
        rebuy: this.rebuyOrder
      }
      
      if (actionMap[action]) {
        actionMap[action]()
      }
    },
    
    // 联系商家
    contactShop() {
      uni.makePhoneCall({
        phoneNumber: this.orderInfo.shopPhone,
        fail: () => {
          uni.showToast({
            title: '拨打电话失败',
            icon: 'none'
          })
        }
      })
    },
    
    // 复制订单号
    copyOrderId() {
      uni.setClipboardData({
        data: this.orderInfo.id,
        success: () => {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          })
        }
      })
    },
    
    // 计算商品总额
    getTotalAmount() {
      return this.orderInfo.goods.reduce((total, goods) => {
        return total + (goods.price * goods.quantity)
      }, 0)
    },
    
    // 订单操作方法
    cancelOrder() {
      uni.showModal({
        title: '提示',
        content: '确定要取消该订单吗？',
        success: (res) => {
          if (res.confirm) {
            // 处理取消订单逻辑
          }
        }
      })
    },
    
    payOrder() {
      uni.navigateTo({
        url: `/pages/payment/payment?orderId=${this.orderInfo.id}`
      })
    },
    
    viewProgress() {
      uni.navigateTo({
        url: `/pages/repairProgress/repairProgress?orderId=${this.orderInfo.id}`
      })
    },
    
    deleteOrder() {
      uni.showModal({
        title: '提示',
        content: '确定要删除该订单吗？',
        success: (res) => {
          if (res.confirm) {
            // 处理删除订单逻辑
          }
        }
      })
    },
    
    rebuyOrder() {
      // 处理再次购买逻辑
    }
  }
}
</script>

<style lang="scss" scoped>
.order-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
  
  .status-section {
    background: #FF6B00;
    padding: 40rpx 30rpx;
    color: #fff;
    
    .status-text {
      font-size: 36rpx;
      font-weight: bold;
      margin-bottom: 10rpx;
      display: block;
    }
    
    .status-desc {
      font-size: 26rpx;
      opacity: 0.9;
    }
  }
  
  .repair-info,
  .shop-section,
  .goods-section,
  .order-info,
  .amount-section {
    background: #fff;
    margin-top: 20rpx;
    padding: 30rpx;
  }
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .label {
      color: #666;
      font-size: 28rpx;
    }
    
    .value {
      color: #333;
      font-size: 28rpx;
    }
    
    .value-wrap {
      display: flex;
      align-items: center;
      
      .copy-btn {
        margin-left: 20rpx;
        color: #FF6B00;
        font-size: 26rpx;
      }
    }
  }
  
  .shop-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .shop-info {
      display: flex;
      align-items: center;
      
      image {
        width: 32rpx;
        height: 32rpx;
        margin-right: 10rpx;
      }
      
      .shop-name {
        font-size: 28rpx;
        color: #333;
      }
    }
    
    .contact-btn {
      display: flex;
      align-items: center;
      padding: 10rpx 20rpx;
      border: 1rpx solid #ddd;
      border-radius: 30rpx;
      
      image {
        width: 28rpx;
        height: 28rpx;
        margin-right: 6rpx;
      }
      
      text {
        font-size: 26rpx;
        color: #666;
      }
    }
  }
  
  .goods-section {
    .goods-item {
      display: flex;
      margin-bottom: 30rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .goods-img {
        width: 120rpx;
        height: 120rpx;
        margin-right: 20rpx;
      }
      
      .goods-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        
        .goods-name {
          font-size: 28rpx;
          color: #333;
        }
        
        .price-quantity {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .price {
            color: #FF6B00;
            font-size: 32rpx;
            font-weight: bold;
          }
          
          .quantity {
            color: #999;
            font-size: 26rpx;
          }
        }
      }
    }
  }
  
  .amount-section {
    .amount-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      font-size: 28rpx;
      color: #666;
      
      .amount {
        color: #333;
        
        &.highlight {
          color: #FF6B00;
          font-size: 36rpx;
          font-weight: bold;
        }
      }
    }
    
    .divider {
      height: 1rpx;
      background: #eee;
      margin: 10rpx 0;
    }
  }
  
  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100rpx;
    background: #fff;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 30rpx;
    gap: 20rpx;
    
    .action-btn {
      padding: 16rpx 40rpx;
      border: 1rpx solid #ddd;
      border-radius: 40rpx;
      font-size: 28rpx;
      color: #666;
      
      &.primary {
        background: #FF6B00;
        color: #fff;
        border-color: #FF6B00;
      }
    }
  }
  
  .loading-state {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    
    text {
      color: #999;
      font-size: 28rpx;
    }
  }
}
</style> 