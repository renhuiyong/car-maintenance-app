<template>
    <view class="merchant-details">
      <!-- 商家详情信息 -->
      <view class="merchant-info">
        <image class="bg-image" src="/static/images/beijing.png" mode="aspectFill"></image>
        
        <view class="info-content">
          <!-- 店铺名称和距离 -->
          <view class="header">
            <text class="shop-name">{{ merchantInfo.name }}</text>
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
  
      <!-- 店铺详 -->
      <view class="shop-info">
        <view class="title">店铺详情</view>
        <view class="shop-description">
          {{ merchantInfo.description }}
        </view>
        <scroll-view class="image-list" scroll-x="true" show-scrollbar="false">
          <view class="image-wrapper">
            <view class="image-placeholder" v-for="i in 6" :key="i"></view>
          </view>
        </scroll-view>
      </view>
  
      <!-- 店铺资质 -->
      <view class="shop-qualification">
        <view class="title">店铺资质</view>
        <scroll-view class="qualification-list" scroll-x="true" show-scrollbar="false">
          <view class="qualification-wrapper">
            <view class="qualification-placeholder" v-for="i in 4" :key="i"></view>
          </view>
        </scroll-view>
      </view>
    </view>
  </template>
  
  <script>
  export default {
    data() {
      return {
        merchantId: '',
        merchantInfo: {
          name: '电动车维修店一',
          distance: '0.6KM',
          address: '安徽省淮北市惠泉路泉城浦淮北路88号',
          businessHours: '08：00 - 18：00',
          phone: '18888888888',
          description: '电动车维修店一详细介绍安徽省淮北市惠泉路泉城浦淮北路88',
          images: [],
          qualifications: []
        },
        shareConfig: {
          title: '',
          path: '',
          imageUrl: ''
        }
      }
    },
    onLoad(options) {
      if (options.id) {
        this.merchantId = options.id
        this.getMerchantDetails()
      }
      this.initShareConfig()
    },
    methods: {
      // 获取商家详情
      getMerchantDetails() {
        // 这里添加获取商家详情的接口请求
        // 示例：
        // uni.request({
        //   url: '/api/merchant/detail',
        //   data: { id: this.merchantId },
        //   success: (res) => {
        //     this.merchantInfo = res.data
        //   }
        // })
      },
      // 打电话
      makePhoneCall() {
        uni.makePhoneCall({
          phoneNumber: this.merchantInfo.phone
        })
      },
      // 导航
      openLocation() {
        // 这里要后端返回经纬度信息
        uni.openLocation({
          latitude: 0,
          longitude: 0,
          name: this.merchantInfo.name,
          address: this.merchantInfo.address
        })
      },
      initShareConfig() {
        this.shareConfig = {
          title: this.merchantInfo.name,
          path: `/pages/merchantDetails/merchantDetails?id=${this.merchantId}`,
          imageUrl: this.merchantInfo.images?.[0]
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
          
          .image-placeholder {
            flex-shrink: 0;
            width: 220rpx;
            height: 160rpx;
            background-color: #f0f0f0;
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
          
          .qualification-placeholder {
            flex-shrink: 0;
            width: 340rpx;
            height: 180rpx;
            background-color: #f0f0f0;
            border-radius: 8rpx;
            margin-right: 20rpx;
  
            &:last-child {
              margin-right: 0;
            }
          }
        }
      }
    }
  }
  </style>
  