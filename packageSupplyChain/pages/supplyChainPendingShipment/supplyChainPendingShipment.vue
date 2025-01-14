<template>
  <view class="pending-shipment">
    <!-- 待发货状态 -->
    <view class="shipment-status">
      <image src="/static/images/daifahuo.png" mode="aspectFit" class="status-icon"></image>
      <text class="status-text">待发货</text>
    </view>
    
    <!-- 物流信息 -->
    <view class="logistics-info" @click="goToLogistics">
      <view class="left">
        <text>物流信息</text>
      </view>
      <image src="/static/images/youjiantou2.png" mode="aspectFit" class="arrow-icon"></image>
    </view>
    
    <!-- 订单信息 -->
    <view class="order-info">
      <text class="section-title">订单信息</text>
      <view class="product-list">
        <view class="product-item" v-for="(item, index) in orderItems" :key="index">
          <image :src="item.image" mode="aspectFit" class="product-image"></image>
          <view class="product-detail">
            <text class="product-name">{{item.name}}</text>
            <text class="product-price">¥ {{item.price}}/件</text>
          </view>
          <text class="product-count">×{{item.count}}</text>
        </view>
      </view>
      <view class="total-amount">
        <text>商品金额</text>
        <text class="amount">¥ {{totalAmount}}</text>
      </view>
    </view>
    
    <!-- 底部操作区 -->
    <view class="bottom-actions">
      <button class="contact-service" open-type="contact" plain="true" hover-class="none">
        <image src="/static/images/kf.png" mode="aspectFit" class="service-icon"></image>
        <text>联系客服</text>
      </button>
      <view class="action-buttons">
        <button class="btn-fill" @click="fillLogistics">填写物流信息</button>
        <!-- <button class="btn-cancel" @click="cancelOrder">取消</button> -->
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/api/index.js'
import request from '@/utils/request.js'

export default {
  data() {
    return {
      orderId: '',
      orderItems: [],
      totalAmount: 0
    }
  },
  onLoad(options) {
    if (options.orderId) {
      this.orderId = options.orderId
      this.getOrderDetail()
    }
  },
  methods: {
    async getOrderDetail() {
      try {
        const res = await api.supplyChain.getPurchaseOrderDetail(this.orderId)
        
        if (res.code === 200) {
          // 处理订单数据
          const orderData = res.data
          this.orderItems = orderData.accessoryNumList.map(item => ({
            name: item.accessoryName,
            price: item.price,
            count: item.num,
            image: item.accessoryImage ? request.BASE_URL_OSS + item.accessoryImage : '/static/images/empty.png'
          }))
          this.totalAmount = orderData.price
        } else {
          uni.showToast({
            title: res.msg || '获取订单详情失败',
            icon: 'none'
          })
        }
      } catch (err) {
        console.error('Get order detail error:', err)
        uni.showToast({
          title: '获取订单详情失败',
          icon: 'none'
        })
      }
    },
    goToLogistics() {
      // 跳转到物流信息页面
      uni.navigateTo({
        url: '/packageSupplyChain/pages/supplyChainLogisticsInformation/supplyChainLogisticsInformation'
      })
    },
    contactService() {
      // 联系客服
    },
    cancelOrder() {
      // 取消订单
      uni.showModal({
        title: '提示',
        content: '确定要取消该订单吗？',
        success: (res) => {
          if (res.confirm) {
            // 执行取消订单操作
          }
        }
      })
    },
    fillLogistics() {
      // 填写物流信息并发货
      uni.navigateTo({
        url: `/packageSupplyChain/pages/supplyChainLogisticsInformation/supplyChainLogisticsInformation?orderId=${this.orderId}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.pending-shipment {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.shipment-status {
  background-color: #fff;
  padding: 30rpx;
  display: flex;
  align-items: center;
  
  .status-icon {
    width: 60rpx;
    height: 60rpx;
    margin-right: 20rpx;
  }
  
  .status-text {
    font-size: 32rpx;
    color: #333;
  }
}

.logistics-info {
  background-color: #fff;
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f5f5f5;
  
  .left {
    display: flex;
    align-items: center;
    
    text {
      font-size: 28rpx;
      color: #333;
    }
  }
  
  .arrow-icon {
    width: 32rpx;
    height: 32rpx;
  }
}

.order-info {
  background-color: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 12rpx;
  
  .section-title {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .product-list {
    .product-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #eee;
      
      .product-image {
        width: 120rpx;
        height: 120rpx;
        margin-right: 20rpx;
      }
      
      .product-detail {
        flex: 1;
        
        .product-name {
          font-size: 28rpx;
          color: #333;
          margin-bottom: 10rpx;
        }
        
        .product-price {
          font-size: 24rpx;
          color: #666;
        }
      }
      
      .product-count {
        font-size: 28rpx;
        color: #333;
      }
    }
  }
  
  .total-amount {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 30rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #eee;
    
    .amount {
      font-size: 32rpx;
      color: #333;
      font-weight: bold;
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 30rpx;
  height: 160rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  
  .contact-service {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: transparent !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    line-height: normal !important;
    
    &::after {
      border: none !important;
    }
    
    .service-icon {
      width: 44rpx;
      height: 44rpx;
      margin-bottom: 8rpx;
    }
    
    text {
      font-size: 26rpx;
      color: #999;
    }
  }
  
  .action-buttons {
    display: flex;
    align-items: center;
    
    button {
      height: 80rpx;
      line-height: 80rpx;
      font-size: 28rpx;
      border-radius: 4rpx;
      margin-left: 20rpx;
      
      &.btn-fill {
        width: 220rpx;
        background-color: #fff;
        border: 1px solid #ddd;
        color: #333;
      }
      
      &.btn-cancel {
        width: 120rpx;
        background-color: #fff;
        border: 1px solid #ddd;
        color: #333;
      }
    }
  }
}
</style>
