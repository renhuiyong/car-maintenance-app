<template>
    <view class="merchant-details">
      <!-- 状态提示 -->
      <view v-if="merchantInfo.examineStatus !== 1" class="status-tip">
        <view class="tip-content">
          <text>{{ getStatusText }}</text>
        </view>
      </view>

      <!-- 骨架屏 -->
      <view v-else-if="loading" class="skeleton">
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
        <!-- 商家详情信息 -->
        <view class="merchant-info">
          <image class="bg-image" src="/static/images/beijing.png" mode="aspectFill"></image>
          
          <view class="info-content">
            <!-- 店铺名称和距离 -->
            <view class="header">
              <text class="shop-name">{{ merchantInfo.shopName }}</text>
            </view>
            <view class="address">{{ merchantInfo.address }}</view>
            <view class="info-row">
              <text>联系电话：{{ merchantInfo.tel }}</text>
            </view>
          </view>
        </view>
    
        <!-- 店铺资质 -->
        <view class="shop-qualification">
          <view class="title">店铺资质</view>
          <scroll-view class="qualification-list" scroll-y="true" show-scrollbar="false">
            <view class="qualification-wrapper">
              <image v-for="(cert, index) in merchantInfo.qualificationImgs" 
                     :key="index" 
                     :src="cert" 
                     mode="aspectFill"
                     @click="previewImage(cert)"
                     class="qualification-image"></image>
            </view>
          </scroll-view>
        </view>
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
          address: '',
          tel: '',
          qualificationImgs: [],
          examineStatus: null
        },
        shareConfig: {
          title: '',
          path: '',
          imageUrl: ''
        }
      }
    },
    computed: {
      getStatusText() {
        const statusMap = {
          0: '您的入驻申请正在审核中',
          2: '很抱歉，您的入驻申请未通过审核',
          5: '您还未申请入驻，请先完成入驻申请'
        }
        return statusMap[this.merchantInfo.examineStatus] || '请登录后查看'
      }
    },
    created() {
      let token = uni.getStorageSync('supplyChainToken')
      if (token) {
        this.getMerchantDetails()
        this.initShareConfig()
      }
    },
    mounted() {
      console.log('myShop mounted')
    },
    onLoad(options) {
    },
    methods: {
      // 获取商家详情
      async getMerchantDetails() {
        console.log('开始获取店铺信息')
        this.loading = true
        try {
          const res = await api.supplyChain.getSupplyChainDetail()
          console.log('获取店铺信息成功：', res)
          if (res.code === 200) {
            const shopData = res.data
            
            // 处理资质图片
            const qualificationImgs = shopData.qualifications ? 
              shopData.qualifications.split(',').map(img => request.BASE_URL_OSS + img.trim()) : []
            
            this.merchantInfo = {
              shopName: shopData.name || '',
              address: shopData.address || '',
              tel: shopData.tel || '',
              qualificationImgs,
              examineStatus: shopData.examineStatus
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
      initShareConfig() {
        this.shareConfig = {
          title: this.merchantInfo.shopName,
          path: `/packageMerchant/pages/merchantDetails/merchantDetails?id=${this.merchantId}`,
          imageUrl: ''
        }
      },
      handleShare() {
        uni.showShareMenu({
          withShareTicket: true,
          menus: ['shareAppMessage', 'shareTimeline']
        })
      },
      // 预览图片
      previewImage(current) {
        uni.previewImage({
          urls: this.merchantInfo.qualificationImgs,
          current: current,
          indicator: 'number',
          loop: true,
          success: () => {
            console.log('预览图片成功')
          },
          fail: (err) => {
            console.error('预览图片失败：', err)
          }
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
    display: flex;
    flex-direction: column;
  
    .status-tip {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #fff;
      
      .tip-content {
        text-align: center;
        color: #666;
        font-size: 32rpx;
        padding: 40rpx;
      }
    }
  
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
    }
  
    .shop-qualification {
      flex: 1;
      background-color: #fff;
      padding: 30rpx;
      margin-bottom: 0;
      display: flex;
      flex-direction: column;
  
      .title {
        font-size: 32rpx;
        font-weight: bold;
        margin-bottom: 30rpx;
        position: relative;
        padding-left: 20rpx;
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 6rpx;
          height: 28rpx;
          background: #2979ff;
          border-radius: 3rpx;
        }
      }
  
      .qualification-list {
        flex: 1;
        width: 100%;
        
        .qualification-wrapper {
          display: flex;
          flex-direction: column;
          padding: 0 20rpx;
          
          .qualification-image {
            width: 100%;
            height: 360rpx;
            border-radius: 12rpx;
            margin-bottom: 30rpx;
            box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            
            &:active {
              transform: scale(0.98);
              box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
            }
  
            &:last-child {
              margin-bottom: 30rpx;  // 保持底部间距，避免最后一张图片贴边
            }
          }
        }
      }
    }
  }
  </style>
  