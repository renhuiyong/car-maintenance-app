<template>
  <view class="coupons-container">
    <!-- 顶部标签切换 -->
    <view class="tab-wrapper">
      <view 
        v-for="(item, index) in tabList" 
        :key="index"
        :class="['tab-item', currentTab === index ? 'active' : '']"
        @click="switchTab(index)"
      >
        {{ item }}
      </view>
    </view>
    
    <!-- 优惠券列表 -->
    <scroll-view 
      scroll-y 
      class="coupon-list"
      @scrolltolower="loadMore"
    >
      <view 
        v-if="couponList.length > 0"
        v-for="(coupon, index) in couponList" 
        :key="index"
        :class="[
          'coupon-item', 
          currentTab !== 0 ? 'disabled' : '',
          !isCouponAvailable(coupon) ? 'unavailable' : ''
        ]"
        :data-status="getStatusText(coupon)"
      >
        <!-- 优惠券主体 -->
        <view class="coupon-main">
          <view class="coupon-left">
            <image class="bg-image" src="/static/images/youhuiquan.png" mode="aspectFill" />
            <view class="amount">
              <!-- 根据优惠券类型显示不同的优惠形式 -->
              <template v-if="coupon.type === 1">
                <text class="symbol">¥</text>
                <text class="number">{{coupon.amount}}</text>
              </template>
              <template v-else-if="coupon.type === 2">
                <text class="number">{{coupon.amount}}</text>
                <text class="symbol">折</text>
              </template>
            </view>
            <view class="condition">
              <!-- 根据优惠券类型显示不同的使用条件 -->
              <text v-if="coupon.type === 1">满{{coupon.minAmount}}可用</text>
              <text v-else-if="coupon.type === 2">满{{coupon.minAmount}}可用</text>
              <text v-if="fromOrder && !isCouponAvailable(coupon)" class="unavailable-text">
                (差{{(coupon.minAmount - orderAmount).toFixed(2)}}元)
              </text>
            </view>
          </view>
          <view class="coupon-right">
            <view class="coupon-info">
              <view class="coupon-name">{{coupon.name}}</view>
              <view class="valid-date">{{coupon.startDate}} - {{coupon.endDate}}</view>
            </view>
            <view 
              class="use-btn" 
              v-if="currentTab === 0" 
              :class="{ 'unavailable': fromOrder && !isCouponAvailable(coupon) }"
              @click="handleUseCoupon(coupon)"
            >
              {{ fromOrder && !isCouponAvailable(coupon) ? 
                '差' + (coupon.minAmount - orderAmount).toFixed(2) + '元' : 
                '去使用' 
              }}
            </view>
            <view class="status-tag" v-else>
              {{currentTab === 1 ? '已使用' : '已过期'}}
            </view>
          </view>
        </view>
        <!-- 使用说明 -->
        <view class="coupon-desc">
          <view class="desc-title">使用说明</view>
          <view class="desc-content">{{coupon.description || '优惠券适用于所有商品'}}</view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="couponList.length === 0" class="empty-state">
        <image src="/static/images/empty-coupon.png" mode="aspectFit"></image>
        <text>暂无优惠券</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import api from '@/api/index'

export default {
  data() {
    return {
      tabList: ['未使用', '已使用', '已过期'],
      currentTab: 0,
      allCoupons: [], // 存储所有优惠券
      couponList: [], // 当前显示的优惠券
      loading: false,
      hasMore: false,
      orderAmount: 0,
      fromOrder: false
    }
  },
  
  onReady() {
    this.initPage()
  },
  
  onLoad(options) {
    this.fromOrder = Boolean(options.fromOrder)
    
    const orderInfo = uni.getStorageSync('orderInfo')
    if (orderInfo && this.fromOrder) {
      const info = JSON.parse(orderInfo)
      this.orderAmount = info.totalAmount
    }
  },
  
  methods: {
    initPage() {
      setTimeout(() => {
        this.getCouponList()
      }, 100)
    },
    
    // 判断优惠券是否可用
    isCouponAvailable(coupon) {
      return this.orderAmount >= coupon.minAmount
    },
    
    // 获取优惠券状态文本
    getStatusText(coupon) {
      const now = new Date().getTime()
      const endTime = new Date(coupon.endDate.replace(/-/g, '/')).getTime()
      
      if (coupon.status === 1) {
        return '已使用'
      } else if (now > endTime) {
        return '已过期'
      }
      return !this.isCouponAvailable(coupon) ? 
        `订单未满${coupon.minAmount}元(差${(coupon.minAmount - this.orderAmount).toFixed(2)}元)` : ''
    },
    
    // 处理优惠券使用
    handleUseCoupon(coupon) {
      if (this.fromOrder) {
        if (!this.isCouponAvailable(coupon)) {
          uni.showToast({
            title: `订单金额需满${coupon.minAmount}元才能使用该优惠券`,
            icon: 'none'
          })
          return
        }
        // 使用优惠券并返回
        const couponInfo = {
          ...coupon,
          discountAmount: this.calculateDiscount(coupon)
        }
        uni.setStorageSync('selectedCoupon', JSON.stringify(couponInfo))
        uni.navigateBack()
      } else {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }
    },
    
    // 计算优惠金额
    calculateDiscount(coupon) {
      if (coupon.type === 1) {
        // 满减券直接返回优惠金额
        return coupon.amount
      } else if (coupon.type === 2) {
        // 折扣券计算折扣金额
        const discount = (100 - coupon.amount) / 100
        return Math.floor(this.orderAmount * discount * 100) / 100
      }
      return 0
    },
    
    // 切换标签
    switchTab(index) {
      if (this.currentTab === index) return
      this.currentTab = index
      // 根据状态筛选优惠券
      this.filterCoupons()
    },
    
    // 筛选优惠券
    filterCoupons() {
      const now = new Date().getTime()
      
      this.couponList = this.allCoupons.filter(coupon => {
        const endTime = new Date(coupon.endDate.replace(/-/g, '/')).getTime()
        
        switch(this.currentTab) {
          case 0: // 未使用
            return coupon.status === 0 && now <= endTime
          case 1: // 已使用
            return coupon.status === 1
          case 2: // 已过期
            return coupon.status === 0 && now > endTime
          default:
            return false
        }
      })
    },
    
    // 获取优惠券列表
    async getCouponList() {
      if (this.loading) return
      this.loading = true
      
      try {
        const res = await api.coupon.getCouponList()
        if (res.code === 200) {
          // 处理日期格式，只显示日期部分
          this.allCoupons = res.data.map(coupon => ({
            ...coupon,
            // startDate: coupon.startDate.split(' ')[0],
            // endDate: coupon.endDate.split(' ')[0]
          }))
          // 初始筛选
          this.filterCoupons()
        } else {
          uni.showToast({
            title: res.msg || '获取优惠券列表失败',
            icon: 'none'
          })
        }
      } catch (e) {
        console.error('获取优惠券列表失败:', e)
        uni.showToast({
          title: '获取优惠券列表失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.coupons-container {
  min-height: 100vh;
  background: #f5f5f5;
  
  .tab-wrapper {
    display: flex;
    background: #fff;
    padding: 20rpx 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
    
    .tab-item {
      flex: 1;
      text-align: center;
      font-size: 28rpx;
      color: #666;
      position: relative;
      
      &.active {
        color: #2A82E4;
        font-weight: bold;
        
        &::after {
          content: '';
          position: absolute;
          bottom: -10rpx;
          left: 50%;
          transform: translateX(-50%);
          width: 40rpx;
          height: 4rpx;
          background: #2A82E4;
          border-radius: 2rpx;
        }
      }
    }
  }
  
  .coupon-list {
    height: calc(100vh - 88rpx);
    padding: 20rpx;
    box-sizing: border-box;
    margin-top: 88rpx;
    
    .coupon-item {
      background: #fff;
      margin-bottom: 20rpx;
      border-radius: 12rpx;
      overflow: hidden;
      color: #000;
      
      .coupon-main {
        display: flex;
        position: relative;
        height: 180rpx;
        
        .coupon-left {
          width: 240rpx;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          
          // 添加背景图片
          .bg-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
          }
          
          // 确保内容在背景图片上层
          .amount, .condition {
            position: relative;
            z-index: 1;
          }
          
          &::after {
            content: '';
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            width: 10rpx;
            background: radial-gradient(circle at -5rpx, transparent 5rpx, white 6rpx) repeat-y;
            background-size: 10rpx 20rpx;
            z-index: 2;
          }
          
          .amount {
            color: #fff;
            text-align: center;
            
            .symbol {
              font-size: 40rpx;
              color: #fff !important;
            }
            .number {
              font-size: 80rpx;
              color: #fff !important;
              font-weight: bold;
            }
          }
          
          .condition {
            color: #000;
            font-size: 24rpx;
            margin-top: 24rpx;
            
            .unavailable-text {
              color: #FF6B35;
              margin-left: 10rpx;
            }
          }
        }
        
        .coupon-right {
          flex: 1;
          padding: 30rpx;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          
          .coupon-info {
            .coupon-name {
              margin-bottom: 12rpx;
            }
            
            .valid-date {
              font-size: 24rpx;
              color: #999;
            }
          }
          
          .use-btn {
            align-self: flex-end;
            background: #ff6b35;
            color: #fff;
            padding: 8rpx 30rpx;
            border-radius: 30rpx;
            font-size: 26rpx;
            
            &.unavailable {
              background: #ccc;
              pointer-events: none;
            }
          }
          
          .status-tag {
            align-self: flex-end;
            padding: 8rpx 30rpx;
            border-radius: 30rpx;
            font-size: 26rpx;
            background: #F5F5F5;
            color: #999;
          }
        }
      }
      
      &.disabled {
        opacity: 1;
        position: relative;
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(245, 245, 245, 0.6);
          z-index: 1;
          pointer-events: none;
        }
        
        .coupon-left {
          &::before {
            display: none;
          }
          
          .amount {
            opacity: 0.8;
            
            .symbol, .number {
              color: #000;
            }
          }
          
          .condition {
            color: #000;
          }
        }
        
        .coupon-right {
          .coupon-name {
            color: #333;
          }
          
          .valid-date {
            color: #333;
          }
          
          .status-tag {
            position: relative;
            z-index: 2;
            background: rgba(153, 153, 153, 0.15);
            color: #666;
            font-size: 22rpx;
            padding: 6rpx 20rpx;
            border: 1px solid rgba(153, 153, 153, 0.3);
          }
        }
        
        &::after {
          content: attr(data-status);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 56rpx;
          color: rgba(153, 153, 153, 0.15);
          font-weight: bold;
          z-index: 2;
          pointer-events: none;
          letter-spacing: 4rpx;
        }
      }
      
      // 添加不可用状态样式
      &.unavailable {
        opacity: 0.8;
        
        .use-btn {
          background: #F5F5F5;
          color: #999;
          border: 1px solid #E5E5E5;
          
          &.unavailable {
            background: #F5F5F5;
            color: #999;
          }
        }
        
        // 移除旋转的文字遮罩，改为更友好的提示
        &::after {
          display: none;
        }
      }
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 200rpx;
      
      image {
        width: 200rpx;
        height: 200rpx;
        margin-bottom: 20rpx;
      }
      
      text {
        color: #999;
        font-size: 28rpx;
      }
    }
  }
}

.coupon-desc {
  display: none;
}
</style> 