<template>
  <view class="merchant-reply">
    <!-- 问题描述区域 -->
    <view class="problem-section">
      <view class="section-title">问题描述</view>
      <view class="problem-content">{{problemContent}}</view>
    </view>
    
    <!-- 商家信息区域 -->
    <view class="merchant-section">
      <view class="merchant-name">{{merchantName}}</view>
      <view class="merchant-desc">您的车辆需要维修，进入配件商城选购配件进行维修</view>
    </view>
    
    <!-- 进入商城按钮 -->
    <view class="enter-shop-btn" @tap="enterShop">
      进入商城
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      problemContent: '车辆故障无法移动',
      merchantName: '电动车维修店一'
    }
  },
  
  methods: {
    // 进入商城
    enterShop() {
      uni.switchTab({
        url: '/pages/shop/shop'
      })
    }
  },
  
  onLoad(options) {
    // 获取订单信息
    const orderId = options.orderId
    // TODO: 根据orderId获取详细信息
  }
}
</script>

<style lang="scss" scoped>
.merchant-reply {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
  
  .problem-section {
    background-color: #fff;
    padding: 30rpx;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    
    .section-title {
      font-size: 28rpx;
      color: #999;
      margin-bottom: 20rpx;
    }
    
    .problem-content {
      font-size: 32rpx;
      color: #333;
    }
  }
  
  .merchant-section {
    background-color: #fff;
    padding: 30rpx;
    border-radius: 12rpx;
    margin-bottom: 40rpx;
    
    .merchant-name {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 20rpx;
    }
    
    .merchant-desc {
      font-size: 28rpx;
      color: #666;
      line-height: 1.5;
    }
  }
  
  .enter-shop-btn {
    background-color: #4080ff;
    color: #fff;
    text-align: center;
    padding: 24rpx 0;
    border-radius: 8rpx;
    font-size: 32rpx;
    margin: 0 20rpx;
  }
}
</style> 