<template>
    <view class="merchant-details">
      <!-- 骨架屏 -->
      <view v-if="loading" class="skeleton">
        <view class="merchant-info skeleton-box">
          <view class="info-content">
            <view class="header">
              <view class="skeleton-text-lg"></view>
              <view class="skeleton-text-sm"></view>
            </view>
            <view class="skeleton-text"></view>
            <view class="skeleton-text"></view>
            <view class="skeleton-text"></view>
          </view>
        </view>
        
        <view class="shop-info skeleton-box">
          <view class="skeleton-title"></view>
          <view class="skeleton-text"></view>
          <view class="skeleton-images">
            <view class="skeleton-image" v-for="i in 3" :key="i"></view>
          </view>
        </view>
        
        <view class="shop-qualification skeleton-box">
          <view class="skeleton-title"></view>
          <view class="skeleton-images">
            <view class="skeleton-image-lg" v-for="i in 2" :key="i"></view>
          </view>
        </view>
      </view>

      <!-- 实际内容 -->
      <template v-else>
        <!-- 未申请入驻状态 -->
        <view v-if="merchantInfo.examineStatus === 5" class="not-applied">
          <view class="empty-state">
            <image src="/static/images/shop.png" mode="aspectFit"></image>
            <text>您还未申请入驻，请先完成入驻申请</text>
          </view>
        </view>

        <!-- 未审核状态 -->
        <view v-else-if="merchantInfo.examineStatus === 0" class="pending-review">
          <view class="status-message">
            <text>您的入驻申请正在审核中，请耐心等待</text>
          </view>
        </view>

        <!-- 已审核未付保证金状态 -->
        <view v-else-if="merchantInfo.examineStatus === 1" class="pending-deposit">
          <view class="status-message">
            <text>审核已通过，请缴纳保证金</text>
          </view>
        </view>

        <!-- 已付保证金状态 -->
        <view v-else-if="merchantInfo.examineStatus === 2" class="paid-deposit">
          <view class="status-message">
            <text>保证金已缴纳，等待最终审核</text>
          </view>
        </view>

        <!-- 审核失败状态 -->
        <view v-else-if="merchantInfo.examineStatus === 4" class="review-failed">
          <view class="status-message">
            <text>很抱歉，您的入驻申请未通过审核</text>
            <text class="reason" v-if="merchantInfo.rejectReason">原因：{{ merchantInfo.rejectReason }}</text>
          </view>
        </view>

        <!-- 已通过状态 - 显示完整店铺信息 -->
        <template v-else-if="merchantInfo.examineStatus === 3">
          <!-- 商家详情信息 -->
          <view class="merchant-info">
            <image class="bg-image" src="/static/images/beijing.png" mode="aspectFill"></image>
            
            <view class="info-content">
              <!-- 店铺名称和距离 -->
              <view class="header">
                <text class="shop-name">{{ merchantInfo.shopName }}</text>
                <text class="distance">{{ merchantInfo.distance }}</text>
              </view>
              <view class="address">{{ merchantInfo.address }}</view>
              <view class="info-row">
                <text>营业时间：{{ merchantInfo.businessHours }}</text>
              </view>
              <view class="info-row">
                <text>联系电话：{{ merchantInfo.phone }}</text>
              </view>
              
              <!-- 添加固定定位的图标 -->
              <view class="fixed-icons">
                <view class="icon-item" @click="openLocation">
                  <image src="/static/images/youshang.png" mode="aspectFit"></image>
                </view>
                <view class="icon-item" @click="makePhoneCall">
                  <image src="/static/images/dianhua.png" mode="aspectFit"></image>
                </view>
              </view>
            </view>
          </view>
      
          <!-- 店铺门头 -->
          <view class="shop-info">
            <view class="title">店铺门头</view>
            <view class="shop-description">
              {{ merchantInfo.description }}
            </view>
            <scroll-view class="image-list" scroll-x="true" show-scrollbar="false">
              <view class="image-wrapper">
                <image v-for="(img, index) in merchantInfo.shopImgs" 
                       :key="index" 
                       :src="img" 
                       mode="aspectFill"
                       class="shop-image"></image>
              </view>
            </scroll-view>
          </view>
      
          <!-- 店铺资质 -->
          <view class="shop-qualification">
            <view class="title">店铺资质</view>
            <scroll-view class="qualification-list" scroll-x="true" show-scrollbar="false">
              <view class="qualification-wrapper">
                <image v-for="(cert, index) in merchantInfo.qualificationImgs" 
                       :key="index" 
                       :src="cert" 
                       mode="aspectFill"
                       class="qualification-image"></image>
              </view>
            </scroll-view>
          </view>
        </template>
      </template>
    </view>
  </template>
  
  <script>
  import api from '../../api/index.js'
  import request from '../../utils/request.js'
  
  export default {
    data() {
      return {
        loading: true,
        merchantId: '',
        merchantInfo: {
          shopName: '',
          distance: '',
          address: '',
          businessHours: '',
          phone: '',
          description: '',
          shopImgs: [],
          qualificationImgs: [],
          latitude: 0,
          longitude: 0,
          examineStatus: 5, // 默认未申请入驻
          rejectReason: '' // 审核失败原因
        },
        shareConfig: {
          title: '',
          path: '',
          imageUrl: ''
        }
      }
    },
    created() {
      console.log('myShop created')
      this.getMerchantDetails()
    },
    mounted() {
      console.log('myShop mounted')
    },
    onLoad(options) {
      console.log('myShop onLoad', options)
      this.initShareConfig()
    },
    methods: {
      // 获取商家详情
      async getMerchantDetails() {
        console.log('开始获取店铺信息')
        this.loading = true
        try {
          const res = await api.merchant.getShopSelf()
          if (res.code === 200) {
            const shopData = res.data
            // 处理店铺图片
            const shopImgs = shopData.images ? 
              shopData.images.split(',').map(img => request.BASE_URL_OSS + img.trim()) : []
            
            // 处理资质图片
            const qualificationImgs = shopData.qualifications ? 
              shopData.qualifications.split(',').map(img => request.BASE_URL_OSS + img.trim()) : []
            
            this.merchantInfo = {
              shopName: shopData.name,
              distance: '',
              address: shopData.address,
              businessHours: shopData.businessHours,
              phone: shopData.phone,
              description: shopData.description || '',
              shopImgs,
              qualificationImgs,
              latitude: Number(shopData.latitude),
              longitude: Number(shopData.longitude),
              examineStatus: shopData.examineStatus,
              rejectReason: shopData.rejectReason || ''
            }
            this.merchantId = shopData.id
            this.initShareConfig()
          } else {
            uni.showToast({
              title: res.msg || '获取店铺信息失败',
              icon: 'none'
            })
          }
        } catch (err) {
          console.error('获取店铺信息失败：', err)
          uni.showToast({
            title: '网络请求失败',
            icon: 'none'
          })
        } finally {
          this.loading = false
        }
      },
      // 打电话
      makePhoneCall() {
        if (this.merchantInfo.phone) {
          uni.makePhoneCall({
            phoneNumber: this.merchantInfo.phone
          })
        } else {
          uni.showToast({
            title: '暂无联系电话',
            icon: 'none'
          })
        }
      },
      // 导航
      openLocation() {
        if (this.merchantInfo.latitude && this.merchantInfo.longitude) {
          uni.openLocation({
            latitude: this.merchantInfo.latitude,
            longitude: this.merchantInfo.longitude,
            name: this.merchantInfo.shopName,
            address: this.merchantInfo.address
          })
        } else {
          uni.showToast({
            title: '暂无位置信息',
            icon: 'none'
          })
        }
      },
      initShareConfig() {
        this.shareConfig = {
          title: this.merchantInfo.shopName,
          path: `/packageMerchant/pages/merchantDetails/merchantDetails?id=${this.merchantId}`,
          imageUrl: this.merchantInfo.shopImgs?.[0]
        }
      },
      handleShare() {
        uni.showShareMenu({
          withShareTicket: true,
          menus: ['shareAppMessage', 'shareTimeline']
        })
      }
    },
    onShareAppMessage(res) {
      return {
        title: this.shareConfig.title,
        path: this.shareConfig.path,
        imageUrl: this.shareConfig.imageUrl,
        success(res) {
          uni.showToast({
            title: '分享成功',
            icon: 'success'
          })
        },
        fail(err) {
          uni.showToast({
            title: '分享失败',
            icon: 'none'
          })
        }
      }
    },
    onShareTimeline() {
      return {
        title: this.shareConfig.title,
        query: `id=${this.merchantId}`,
        imageUrl: this.shareConfig.imageUrl
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .merchant-details {
    min-height: 100vh;
    background-color: #f5f6fa;
    padding-bottom: 0;
  
    // 骨架屏样式
    .skeleton {
      .skeleton-box {
        background-color: #fff;
        padding: 30rpx;
        margin-bottom: 20rpx;
      }
      
      .skeleton-text-lg {
        height: 40rpx;
        width: 200rpx;
        background: #f0f0f0;
        border-radius: 4rpx;
        margin-bottom: 20rpx;
      }
      
      .skeleton-text-sm {
        height: 32rpx;
        width: 100rpx;
        background: #f0f0f0;
        border-radius: 4rpx;
      }
      
      .skeleton-text {
        height: 32rpx;
        width: 300rpx;
        background: #f0f0f0;
        border-radius: 4rpx;
        margin-bottom: 16rpx;
      }
      
      .skeleton-title {
        height: 36rpx;
        width: 160rpx;
        background: #f0f0f0;
        border-radius: 4rpx;
        margin-bottom: 20rpx;
      }
      
      .skeleton-images {
        display: flex;
        overflow-x: auto;
        margin-top: 20rpx;
        
        .skeleton-image {
          flex-shrink: 0;
          width: 220rpx;
          height: 160rpx;
          background: #f0f0f0;
          border-radius: 8rpx;
          margin-right: 20rpx;
        }
        
        .skeleton-image-lg {
          flex-shrink: 0;
          width: 340rpx;
          height: 180rpx;
          background: #f0f0f0;
          border-radius: 8rpx;
          margin-right: 20rpx;
        }
      }
      
      @keyframes skeleton-loading {
        0% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0 50%;
        }
      }
      
      .skeleton-text-lg,
      .skeleton-text-sm,
      .skeleton-text,
      .skeleton-title,
      .skeleton-image,
      .skeleton-image-lg {
        background: linear-gradient(
          90deg,
          #f0f0f0 25%,
          #f8f8f8 37%,
          #f0f0f0 63%
        );
        background-size: 400% 100%;
        animation: skeleton-loading 1.4s ease infinite;
      }
    }
  
    .merchant-info {
      position: relative;
      padding: 30rpx;
      margin-bottom: 20rpx;
      overflow: hidden;
      height: 238rpx;
  
      .bg-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
      }
  
      .info-content {
        position: relative;
        z-index: 1;
  
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20rpx;
  
          .shop-name {
            font-size: 36rpx;
            font-weight: bold;
            color: #333;
          }
          
          .distance {
            font-size: 28rpx;
            color: #666;
            font-weight: bold;
          }
        }
  
        .address {
          font-size: 28rpx;
          color: #666;
          margin-bottom: 4rpx;
          margin-top: 30rpx;
        }
  
        .info-row {
          margin-bottom: 4rpx;
          font-size: 28rpx;
          color: #666;
        }
  
        .fixed-icons {
          position: absolute;
          right: 0;
          bottom: -15rpx;
          display: flex;
          flex-direction: column;
         
          .icon-item {
            width: 80rpx;
            height: 80rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            
            image {
              width: 50rpx;
              height: 50rpx;
            }
          }
        }
      }
    }
  
    .shop-info, .shop-qualification {
      background-color: #fff;
      padding: 30rpx;
      margin-bottom: 20rpx;
  
      .title {
        font-size: 32rpx;
        font-weight: 500;
        margin-bottom: 20rpx;
        font-weight: bold;
      }
  
      .shop-description {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 20rpx;
        
      }
  
      .image-list {
        width: 100%;
        white-space: nowrap;
        
        .image-wrapper {
          display: inline-flex;
          
          .shop-image {
            flex-shrink: 0;
            width: 220rpx;
            height: 160rpx;
            border-radius: 8rpx;
            margin-right: 20rpx;
  
            &:last-child {
              margin-right: 0;
            }
          }
        }
      }
    }
  
    .shop-qualification {
      .qualification-list {
        width: 100%;
        white-space: nowrap;
        
        .qualification-wrapper {
          display: inline-flex;
          
          .qualification-image {
            flex-shrink: 0;
            width: 340rpx;
            height: 180rpx;
            border-radius: 8rpx;
            margin-right: 20rpx;
  
            &:last-child {
              margin-right: 0;
            }
          }
        }
      }
    }
  
    // 状态相关样式
    .not-applied,
    .pending-review,
    .pending-deposit,
    .paid-deposit,
    .review-failed {
      background-color: #fff;
      padding: 40rpx;
      margin: 20rpx;
      border-radius: 12rpx;
      text-align: center;

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 60rpx 0;

        image {
          width: 200rpx;
          height: 200rpx;
          margin-bottom: 30rpx;
        }

        text {
          font-size: 28rpx;
          color: #666;
        }
      }

      .status-message {
        padding: 60rpx 0;
        
        text {
          font-size: 32rpx;
          color: #333;
          display: block;
          line-height: 1.6;
        }

        .reason {
          margin-top: 20rpx;
          font-size: 28rpx;
          color: #ff4d4f;
        }
      }
    }
  }
  </style>
  