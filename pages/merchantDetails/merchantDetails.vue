<template>
  <view class="merchant-details">
    <!-- 骨架屏 -->
    <template v-if="loading">
      <view class="merchant-info skeleton">
        <view class="info-content">
          <view class="header">
            <view class="skeleton-block shop-name-skeleton"></view>
            <view class="skeleton-block distance-skeleton"></view>
          </view>
          <view class="skeleton-block address-skeleton"></view>
          <view class="skeleton-block info-row-skeleton"></view>
          <view class="skeleton-block info-row-skeleton"></view>
        </view>
      </view>
      
      <view class="shop-info skeleton">
        <view class="skeleton-block title-skeleton"></view>
        <view class="skeleton-block shop-image-skeleton"></view>
      </view>
      
      <view class="shop-qualification skeleton">
        <view class="skeleton-block title-skeleton"></view>
        <view class="qualification-wrapper skeleton-qualifications">
          <view class="skeleton-block qualification-skeleton" v-for="i in 2" :key="i"></view>
        </view>
      </view>
    </template>

    <!-- ���铺信息 -->
    <template v-else>
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
        <view class="title">店铺</view>
        <view class="shop-image-container">
          <image 
            v-if="merchantInfo.shopImage"
            :src="merchantInfo.shopImage"
            mode="aspectFill"
            class="shop-image"
            @click="previewImage(merchantInfo.shopImage, [merchantInfo.shopImage])"
          ></image>
          <!-- 当没有图片时显示占位 -->
          <view 
            v-if="!merchantInfo.shopImage" 
            class="image-placeholder" 
          ></view>
        </view>
      </view>

      <!-- 店铺资质 -->
      <view class="shop-qualification">
        <view class="title">店铺资质</view>
        <scroll-view class="qualification-list" scroll-x="true" show-scrollbar="false">
          <view class="qualification-wrapper">
            <image 
              v-for="(qual, index) in merchantInfo.qualifications" 
              :key="index"
              :src="qual"
              mode="aspectFill"
              class="qualification-image"
              @click="previewImage(qual, merchantInfo.qualifications)"
            ></image>
            <!-- 当没有资质图片时显示占位 -->
            <view 
              v-if="!merchantInfo.qualifications.length" 
              class="qualification-placeholder" 
              v-for="i in 4" 
              :key="i"
            ></view>
          </view>
        </scroll-view>
      </view>

      <!-- 底部操作栏 -->
      <view class="bottom-actions">
        <view class="collect" @click="handleFavorite">
          <image 
            :src="isFavorited ? '/static/products/shoucang_active.png' : '/static/products/shoucang.png'" 
            mode="aspectFit"
          ></image>
          <text>{{ isFavorited ? '已收藏' : '收藏' }}</text>
        </view>
        <view class="buttons-group">
          <button class="repair-btn" @click="goToRepair">进店修车</button>
          <button class="shop-btn" @click="enterShop">进入商城</button>
        </view>
      </view>
    </template>
  </view>
</template>

<script>
import api from '@/api/index.js'
import request from '@/utils/request.js'

export default {
  data() {
    return {
      loading: true,
      shopId: '',
      currentLatitude: 0,
      currentLongitude: 0,
      merchantInfo: {
        name: '',
        distance: '',
        address: '',
        businessHours: '',
        phone: '',
        shopImage: '',
        qualifications: [],
        latitude: 0,
        longitude: 0,
        isCollected: false
      },
      shareConfig: {
        title: '',
        path: '',
        imageUrl: ''
      },
      isFavorited: false,
      handleFavoriteDebounced: null
    }
  },
  created() {
    this.handleFavoriteDebounced = this.debounce(async () => {
      try {
        if (this.isFavorited) {
          // 取消收藏
          const res = await api.favorite.cancel({
            type: 2,  // 2表示商家
            targetId: this.shopId
          })
          if (res.code === 200) {
            this.isFavorited = false
            uni.showToast({
              title: '已取消收藏',
              icon: 'success'
            })
          }
        } else {
          // 添加收藏
          const res = await api.favorite.add({
            type: 2,  // 2表示商家
            targetId: this.shopId
          })
          if (res.code === 200) {
            this.isFavorited = true
            uni.showToast({
              title: '收藏成功',
              icon: 'success'
            })
          }
        }
      } catch (err) {
        console.error('收藏操作失败:', err)
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        })
      }
    }, 1000)
  },
  onLoad(options) {
    if (options.shopId && options.latitude && options.longitude) {
      this.shopId = options.shopId
      this.currentLatitude = Number(options.latitude)
      this.currentLongitude = Number(options.longitude)
      this.getMerchantDetails()
      this.checkFavoriteStatus()
    }
    this.initShareConfig()
  },
  methods: {
    // 获取商家详情
    getMerchantDetails() {
      // 调用获取店详情接口
      api.shop.getShopDetail({
        shopId: this.shopId,
        latitude: this.currentLatitude,
        longitude: this.currentLongitude
      }).then(res => {
        if (res.code === 200) {
          // 处理资质图片路径
          let qualificationImages = [];
          if (res.data.qualifications) {
            qualificationImages = res.data.qualifications.split(',').map(path => 
              request.BASE_URL + path.trim()
            );
          }

          // 更新店铺信息
          this.merchantInfo = {
            name: res.data.name,
            distance: res.data.distance,
            address: res.data.address,
            businessHours: res.data.businessHours,
            phone: res.data.phone,
            shopImage: res.data.images ? request.BASE_URL + res.data.images : '',
            qualifications: qualificationImages,
            latitude: Number(res.data.latitude),
            longitude: Number(res.data.longitude),
            isCollected: res.data.isCollected || false
          }
          
          // 更新分享配置
          this.initShareConfig()
        } else {
          uni.showToast({
            title: res.msg || '获取店铺详情失败',
            icon: 'none'
          })
        }
      }).catch(err => {
        console.error('获取店铺详情失败:', err)
        uni.showToast({
          title: '获取店铺详情失败',
          icon: 'none'
        })
      }).finally(() => {
        this.loading = false
      })
    },
    // 打电话
    makePhoneCall() {
      uni.makePhoneCall({
        phoneNumber: this.merchantInfo.phone
      })
    },
    // 导航
    openLocation() {
      if (!this.merchantInfo.latitude || !this.merchantInfo.longitude) {
        uni.showToast({
          title: '暂无位置信息',
          icon: 'none'
        })
        return
      }
      
      uni.openLocation({
        latitude: Number(this.merchantInfo.latitude),
        longitude: Number(this.merchantInfo.longitude),
        name: this.merchantInfo.name,
        address: this.merchantInfo.address,
        success: () => {
          console.log('打开导航成功')
        },
        fail: (err) => {
          console.error('打开导航失败:', err)
          uni.showToast({
            title: '打开导航失败',
            icon: 'none'
          })
        }
      })
    },
    enterShop() {
      // 用 navigateTo 跳转到商城页面，并传递商家ID
      uni.navigateTo({
        url: `/pages/shop/shop?shopId=${this.shopId}`
      })
    },
    goToRepair() {
      // 构造需要传递的商家信息对象
      const shopInfo = {
        id: this.shopId,
        name: this.merchantInfo.name,
        distance: this.merchantInfo.distance,
        address: this.merchantInfo.address,
        businessHours: this.merchantInfo.businessHours,
        latitude: this.merchantInfo.latitude,
        longitude: this.merchantInfo.longitude,
        phone: this.merchantInfo.phone
      }
      
      // 使用 encodeURIComponent 对对象进行编码，防止特殊字符导致的问题
      const shopInfoStr = encodeURIComponent(JSON.stringify(shopInfo))
      
      uni.navigateTo({
        url: `/pages/assignRepair/assignRepair?shopInfo=${shopInfoStr}`
      })
    },
    initShareConfig() {
      this.shareConfig = {
        title: this.merchantInfo.name,
        path: `/pages/merchantDetails/merchantDetails?shopId=${this.shopId}&latitude=${this.currentLatitude}&longitude=${this.currentLongitude}`,
        imageUrl: this.merchantInfo.shopImage
      }
    },
    handleShare() {
      uni.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      })
    },
    previewImage(current, urls) {
      if (!urls || !urls.length) return
      
      uni.previewImage({
        current, // 当前显示图片的链接
        urls, // 需要预览的图片链接列表
        success: () => {
          console.log('片预览成功')
        },
        fail: (err) => {
          console.error('图片预览失败:', err)
        }
      })
    },
    // 防抖函数
    debounce(fn, delay = 1000) {
      let timer = null
      return () => {
        if (timer) {
          return
        }
        timer = setTimeout(() => {
          fn.call(this)
          timer = null
        }, delay)
      }
    },
    
    // 处理收藏点击
    handleFavorite() {
      this.handleFavoriteDebounced()
    },

    // 检查收藏状态
    async checkFavoriteStatus() {
      try {
        const res = await api.favorite.checkStatus({
          type: 2,
          targetId: this.shopId
        })
        if (res.code === 200) {
          this.isFavorited = res.data
        }
      } catch (err) {
        console.error('检查收藏状态失败:', err)
      }
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
      query: `shopId=${this.shopId}&latitude=${this.currentLatitude}&longitude=${this.currentLongitude}`,
      imageUrl: this.shareConfig.imageUrl
    }
  }
}
</script>

<style lang="scss" scoped>
.merchant-details {
  min-height: 100vh;
  background-color: #f5f6fa;
  padding-bottom: 120rpx;

  .merchant-info {
    position: relative;
    padding: 30rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    height: 260rpx;

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

    .shop-image-container {
      width: 100%;
      height: 300rpx;
      background-color: #f0f0f0;
      border-radius: 8rpx;
      overflow: hidden;
      
      .shop-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .image-placeholder {
        width: 100%;
        height: 300rpx;
        background-color: #f0f0f0;
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

  .bottom-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 130rpx;
    background-color: #fff;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

    .collect {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 30rpx;
      width: 80rpx;

      image {
        width: 40rpx;
        height: 40rpx;
        display: block;
        margin: 0 auto;
      }

      text {
        font-size: 24rpx;
        color: #666;
        margin-top: 4rpx;
        text-align: center;
        width: 100%;
      }
    }

    .buttons-group {
      flex: 1;
      display: flex;
      gap: 20rpx;
    }

    .repair-btn, .shop-btn {
      flex: 1;
      height: 80rpx;
      border-radius: 40rpx;
      font-size: 28rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .repair-btn {
      background-color: #fff;
      color: #4e6ef2;
      border: 2rpx solid #4e6ef2;
    }

    .shop-btn {
      background-color: #4e6ef2;
      color: #fff;
    }
  }

  // 骨架屏样式
  .skeleton {
    background: #fff;
    
    .skeleton-block {
      background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
      background-size: 400% 100%;
      animation: skeleton-loading 1.4s ease infinite;
      border-radius: 4rpx;
    }
    
    .shop-name-skeleton {
      width: 200rpx;
      height: 40rpx;
    }
    
    .distance-skeleton {
      width: 100rpx;
      height: 32rpx;
    }
    
    .address-skeleton {
      width: 80%;
      height: 32rpx;
      margin: 30rpx 0 20rpx;
    }
    
    .info-row-skeleton {
      width: 60%;
      height: 32rpx;
      margin-bottom: 16rpx;
    }
    
    .title-skeleton {
      width: 160rpx;
      height: 36rpx;
      margin-bottom: 20rpx;
    }
    
    .description-skeleton {
      width: 90%;
      height: 80rpx;
      margin-bottom: 20rpx;
    }
    
    .skeleton-images {
      display: flex;
      overflow-x: auto;
      padding: 10rpx 0;
      
      .image-skeleton {
        flex-shrink: 0;
        width: 220rpx;
        height: 160rpx;
        margin-right: 20rpx;
        border-radius: 8rpx;
      }
    }
    
    .skeleton-qualifications {
      display: flex;
      overflow-x: auto;
      padding: 10rpx 0;
      
      .qualification-skeleton {
        flex-shrink: 0;
        width: 340rpx;
        height: 180rpx;
        margin-right: 20rpx;
        border-radius: 8rpx;
      }
    }
    
    .shop-image-skeleton {
      width: 100%;
      height: 300rpx;
      border-radius: 8rpx;
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
}

.shop-image, .qualification-image {
  width: 220rpx;
  height: 160rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
  
  &:last-child {
    margin-right: 0;
  }
}

.qualification-image {
  width: 340rpx;
  height: 180rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
  
  &:last-child {
    margin-right: 0;
  }
}
</style>
