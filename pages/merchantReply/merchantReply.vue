<template>
  <view class="merchant-reply">
    <!-- 问题描述区域 -->
    <view class="problem-section">
      <view class="section-title">问题描述</view>
      <view class="problem-content">
        <!-- 文字描述 -->
        <text>{{problemContent}}</text>
        
        <!-- 语音描述 -->
        <view class="voice-desc" v-if="voicePath" @click="playVoice">
          <image src="/static/images/yuyin.png" mode="aspectFit"></image>
          <text>{{voiceDuration}}″</text>
        </view>
        
        <!-- 图片列表 -->
        <view class="image-list" v-if="images && images.length > 0">
          <image 
            v-for="(img, imgIndex) in getImageList(images)" 
            :key="imgIndex"
            :src="getImageUrl(img)"
            mode="aspectFill"
            @click="previewImage(img)"
          ></image>
        </view>
      </view>
    </view>
    
    <!-- 商家信息区域 -->
    <view class="merchant-section">
      <view class="merchant-name">{{merchantName}}</view>
      <view class="section-title">商家回复</view>
      <view class="merchant-desc" v-html="merchantResponse"></view>
    </view>
    
    <!-- 进入商城按钮 -->
    <view class="enter-shop-btn" @tap="enterShop">
      进入商城
    </view>
  </view>
</template>

<script>
import request from '@/utils/request.js'

export default {
  data() {
    return {
      problemContent: '',
      merchantName: '',
      merchantResponse: '',
      images: '',
      voicePath: '',
      voiceDuration: 0,
      audioContext: null,
      orderId: '',
      shopId: '',
      repairOrderId: '',
      shopName: ''
    }
  },
  
  onLoad(options) {
    if (options.orderInfo) {
      try {
        const orderInfo = JSON.parse(decodeURIComponent(options.orderInfo))
        this.problemContent = orderInfo.description
        this.merchantName = orderInfo.shopName
        this.merchantResponse = orderInfo.merchantResponse
        this.images = orderInfo.images
        this.voicePath = orderInfo.voicePath
        this.voiceDuration = orderInfo.voiceDuration
        this.orderId = orderInfo.orderId
        this.shopId = orderInfo.shopId
        this.repairOrderId = orderInfo.repairOrderId
        this.shopName = orderInfo.shopName
        
        console.log('orderInfo:', orderInfo)
        // 初始化音频播放器
        this.audioContext = uni.createInnerAudioContext()
      } catch (err) {
        console.error('解析订单信息失败:', err)
        uni.showToast({
          title: '获取订单信息失败',
          icon: 'none'
        })
      }
    }
  },
  
  methods: {
    // 进入商城
    enterShop() {
      // 先将商家信息存储到本地
      uni.setStorageSync('currentShopId', this.shopId)
      uni.setStorageSync('currentShopName', this.merchantName)
      
      uni.navigateTo({
        url: `/pages/shop/shop?repairOrderId=${this.orderId}&shopId=${this.shopId}&shopName=${encodeURIComponent(this.merchantName)}&repairOrderId=${this.repairOrderId}`
      })
    },
    
    // 处理图片列表
    getImageList(images) {
      if (!images) return []
      return typeof images === 'string' ? images.split(',') : Array.isArray(images) ? images : []
    },
    
    // 获取图片完整URL
    getImageUrl(path) {
      if (!path) return '/static/products/shangpin_default.png'
      return path.startsWith('http') ? path : request.BASE_URL + path
    },
    
    // 预览图片
    previewImage(current) {
      const imageList = this.getImageList(this.images)
      const urls = imageList.map(img => this.getImageUrl(img))
      uni.previewImage({
        current: this.getImageUrl(current),
        urls
      })
    },
    
    // 播放语音
    playVoice() {
      if (!this.voicePath) return
      
      if (this.audioContext.src === request.BASE_URL + this.voicePath) {
        if (this.audioContext.paused) {
          this.audioContext.play()
        } else {
          this.audioContext.pause()
        }
      } else {
        this.audioContext.src = request.BASE_URL + this.voicePath
        this.audioContext.play()
      }
    }
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
      
      .voice-desc {
        display: inline-flex;
        align-items: center;
        background: #F7F7F7;
        padding: 10rpx 20rpx;
        border-radius: 30rpx;
        margin: 20rpx 0;
        
        image {
          width: 32rpx;
          height: 32rpx;
          margin-right: 10rpx;
        }
        
        text {
          font-size: 24rpx;
          color: #666;
        }
      }
      
      .image-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10rpx;
        margin-top: 20rpx;
        
        image {
          width: 160rpx;
          height: 160rpx;
          border-radius: 8rpx;
        }
      }
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
      padding-bottom: 20rpx;
      border-bottom: 1rpx solid #eee;
    }
    
    .section-title {
      font-size: 28rpx;
      color: #999;
      margin: 20rpx 0;
    }
    
    .merchant-desc {
      font-size: 28rpx;
      color: #666;
      line-height: 1.5;
      background: #f8f8f8;
      padding: 20rpx;
      border-radius: 8rpx;
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