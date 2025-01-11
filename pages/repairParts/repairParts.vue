<template>
  <view class="repair-parts">
    <scroll-view 
      scroll-y 
      class="content-scroll"
      :show-scrollbar="false"
      :style="{ paddingBottom: partsInfo && partsInfo.length > 1 ? '120rpx' : '0' }"
    >
      <template v-if="partsInfo">
        <!-- 订单列表 -->
        <view class="order-list">
          <view class="order-item" v-for="(order, orderIndex) in partsInfo" :key="order.id">
            <!-- 顶部信息 -->
            <view class="header">
              <text class="title">已购配件清单</text>
              <text class="shop-name">{{ order.shopName }}</text>
              <text class="order-info">订单号：{{ order.orderNo }}</text>
              <text class="create-time">创建时间：{{ order.createTime }}</text>
            </view>
            
            <!-- 配件列表 -->
            <view class="parts-list">
              <view class="part-item" v-for="(item, index) in order.shopOrderItems" :key="index">
                <image class="part-image" :src="getFullImageUrl(item.goodsImage)" mode="aspectFill"></image>
                <view class="part-info">
                  <text class="part-name">{{ item.goodsName }}</text>
                  <view class="part-price-qty">
                    <text class="price">¥{{ item.price.toFixed(2) }}</text>
                    <text class="qty">x{{ item.quantity }}</text>
                  </view>
                </view>
                <view class="part-amount">
                  <text>¥{{ item.totalPrice.toFixed(2) }}</text>
                </view>
              </view>
            </view>
            
            <!-- 费用信息 -->
            <view class="amount-section">
              <view class="amount-item">
                <text>配件总价</text>
                <text class="amount">¥{{ order.totalAmount.toFixed(2) }}</text>
              </view>
              <view class="amount-item" v-if="order.deliveryType === 2">
                <text>运输费用</text>
                <text class="amount">¥{{ order.deliveryFee.toFixed(2) }}</text>
              </view>
              <view class="divider"></view>
              <view class="amount-item total">
                <text>实付金额</text>
                <text class="amount highlight">¥{{ order.actualAmount.toFixed(2) }}</text>
              </view>
            </view>
          </view>
        </view>
        <!-- 底部空白区域 -->
        <view class="bottom-space"></view>
      </template>
      
      <!-- 加载状态 -->
      <view v-else class="loading-state">
        <text>加载中...</text>
      </view>
    </scroll-view>
    
    <!-- 底部统计 -->
    <view class="total-statistics" v-if="partsInfo && partsInfo.length > 1">
      <view class="statistics-content">
        <view class="stat-item">
          <text class="label">订单数量</text>
          <text class="value">{{ partsInfo.length }}个</text>
        </view>
        <view class="stat-item">
          <text class="label">配件总数</text>
          <text class="value">{{ getTotalPartsCount() }}件</text>
        </view>
        <view class="stat-item">
          <text class="label">总金额</text>
          <text class="value highlight">¥{{ getTotalAmount().toFixed(2) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/api/index.js'
import request from '@/utils/request'

export default {
  data() {
    return {
      orderId: '',
      type: '',
      partsInfo: null,
      baseUrl: request.BASE_URL
    }
  },
  
  onLoad(options) {
    if (options.orderId && options.type) {
      this.orderId = options.orderId
      this.type = options.type
      this.getPartsInfo()
    }
  },
  
  methods: {
    // 获取配件信息
    async getPartsInfo() {
      try {
        const res = await api.repair.getRepairParts(this.type, this.orderId)
        if (res.code === 200) {
          this.partsInfo = res.data
        } else {
          uni.showToast({
            title: res.msg || '获取配件信息失败',
            icon: 'none'
          })
        }
      } catch (err) {
        console.error('获取配件信息失败:', err)
        uni.showToast({
          title: '获取配件信息失败',
          icon: 'none'
        })
      }
    },
    
    // 获取完整的图片URL
    getFullImageUrl(url) {
      if (!url) return ''
      if (url.startsWith('http')) return url
      return this.baseUrl + url
    },
    
    // 获取配件总数
    getTotalPartsCount() {
      if (!this.partsInfo) return 0
      return this.partsInfo.reduce((total, order) => {
        return total + order.shopOrderItems.reduce((sum, item) => sum + item.quantity, 0)
      }, 0)
    },
    
    // 获取总金额
    getTotalAmount() {
      if (!this.partsInfo) return 0
      return this.partsInfo.reduce((total, order) => total + order.actualAmount, 0)
    }
  }
}
</script>

<style lang="scss" scoped>
.repair-parts {
  height: 100vh;
  background: #f8f9fc;
  position: relative;
  display: flex;
  flex-direction: column;
  
  .content-scroll {
    flex: 1;
    height: 100%;
    box-sizing: border-box;
    padding: 24rpx;
    
    // 隐藏滚动条
    ::-webkit-scrollbar {
      display: none;
      width: 0 !important;
      height: 0 !important;
      -webkit-appearance: none;
      background: transparent;
    }
  }
  
  .order-list {
    .order-item {
      margin-bottom: 24rpx;
      
      &:last-child {
        margin-bottom: 32rpx;
      }
    }
  }
  
  .header {
    background: #fff;
    padding: 32rpx;
    border-radius: 16rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
    
    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      display: block;
      margin-bottom: 16rpx;
    }
    
    .shop-name {
      font-size: 32rpx;
      color: #333;
      display: block;
      margin-bottom: 12rpx;
    }
    
    .order-info,
    .create-time {
      font-size: 28rpx;
      color: #666;
      display: block;
      margin-top: 8rpx;
    }
  }
  
  .parts-list {
    background: #fff;
    border-radius: 16rpx;
    padding: 0 32rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
    
    .part-item {
      display: flex;
      align-items: center;
      padding: 32rpx 0;
      border-bottom: 2rpx solid #f5f5f5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .part-image {
        width: 120rpx;
        height: 120rpx;
        border-radius: 12rpx;
        margin-right: 24rpx;
        background: #f8f9fc;
      }
      
      .part-info {
        flex: 1;
        margin-right: 32rpx;
        
        .part-name {
          font-size: 32rpx;
          color: #333;
          font-weight: 500;
          margin-bottom: 16rpx;
          display: block;
        }
        
        .part-price-qty {
          display: flex;
          align-items: center;
          gap: 16rpx;
          
          .price {
            font-size: 28rpx;
            color: #FF6B00;
          }
          
          .qty {
            font-size: 26rpx;
            color: #999;
          }
        }
      }
      
      .part-amount {
        text {
          font-size: 32rpx;
          color: #333;
          font-weight: 500;
        }
      }
    }
  }
  
  .amount-section {
    background: #fff;
    border-radius: 16rpx;
    padding: 32rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
    
    .amount-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24rpx;
      
      text {
        font-size: 28rpx;
        color: #666;
        
        &.amount {
          color: #333;
        }
        
        &.highlight {
          color: #FF6B00;
          font-size: 36rpx;
          font-weight: bold;
        }
      }
      
      &.total {
        margin-bottom: 0;
        
        text:first-child {
          font-size: 32rpx;
          color: #333;
          font-weight: 500;
        }
      }
    }
    
    .divider {
      height: 2rpx;
      background: #f5f5f5;
      margin: 24rpx 0;
    }
  }
  
  .loading-state {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    
    text {
      color: #999;
      font-size: 28rpx;
    }
  }
  
  .bottom-space {
    height: 20rpx;
    width: 100%;
  }
  
  .total-statistics {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 24rpx 32rpx;
    box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
    z-index: 99;
    
    .statistics-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .stat-item {
        flex: 1;
        text-align: center;
        
        .label {
          font-size: 26rpx;
          color: #666;
          margin-bottom: 8rpx;
          display: block;
        }
        
        .value {
          font-size: 32rpx;
          color: #333;
          font-weight: 500;
          
          &.highlight {
            color: #FF6B00;
            font-size: 36rpx;
            font-weight: bold;
          }
        }
      }
    }
  }
}
</style> 