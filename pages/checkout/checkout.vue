<template>
  <view class="checkout-container">
    <!-- 店铺信息 -->
    <view class="shop-section">
      <view class="shop-info">
        <view class="location-icon">
          <image src="/static/images/dingwei.png" mode="aspectFit"></image>
        </view>
        <view class="shop-name">{{shopName}}</view>
        <view class="arrow-right">
          <image src="/static/images/youjiantou2.png" mode="aspectFit"></image>
        </view>
      </view>
    </view>
    
    <!-- 订单信息 -->
    <view class="order-info">
      <text class="title">订单信息</text>
      <view class="goods-list">
        <view class="goods-item" v-for="(item, index) in orderGoods" :key="index">
          <image class="goods-img" :src="item.image" mode="aspectFill"></image>
          <view class="goods-detail">
            <view class="goods-top">
              <text class="goods-name">{{item.name}}</text>
              <view class="price-wrap">
                <text class="price">¥{{item.price}}</text>
                <text class="unit">/件</text>
              </view>
            </view>
            <text class="num">x{{item.quantity}}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 金额信息 -->
    <view class="amount-info">
      <view class="amount-item">
        <text>商品金额</text>
        <text class="red-text">¥{{totalAmount}}</text>
      </view>
      <view class="amount-item coupon" @click="selectCoupon">
        <text>优惠券</text>
        <view class="coupon-right">
          <text v-if="selectedCoupon" class="discount-amount">-¥{{couponAmount}}</text>
          <text v-else class="no-coupon">{{ hasCoupons ? '请选择优惠券' : '暂无可用优惠券' }}</text>
          <image src="/static/images/youjiantou2.png" mode="aspectFit"></image>
        </view>
      </view>
      <view class="amount-item total">
        <text>合计：</text>
        <text class="total-price">¥{{finalAmount}}</text>
      </view>
    </view>
    
    <!-- 底部支付栏 -->
    <view class="footer">
      <view class="total-amount">
        <text>¥{{finalAmount}}</text>
      </view>
      <view class="pay-btn" @click="goPay">
        去支付
      </view>
    </view>
  </view>
</template>

<script>
import { getBestCoupon, getAvailableCoupons } from '@/api/coupon.js'

export default {
  data() {
    return {
      shopName: '',
      orderGoods: [],
      totalAmount: 0,
      couponAmount: 0,
      freight: 0,
      finalAmount: 0,
      selectedCoupon: null,
      hasCoupons: false,
      lastOrderAmount: 0
    }
  },
  
  watch: {
    totalAmount: {
      handler(newVal, oldVal) {
        if (newVal !== this.lastOrderAmount) {
          this.lastOrderAmount = newVal
          this.checkAvailableCoupons(true)
        }
      },
      immediate: true
    }
  },
  
  onLoad() {
    const orderInfo = uni.getStorageSync('orderInfo')
    if (orderInfo) {
      const info = JSON.parse(orderInfo)
      this.shopName = info.shopName
      this.orderGoods = info.orderGoods
      this.totalAmount = info.totalAmount
      this.freight = info.freight
      this.finalAmount = info.finalAmount
      this.lastOrderAmount = info.totalAmount
      
      this.checkAvailableCoupons()
    }
  },
  
  onShow() {
    const selectedCouponStr = uni.getStorageSync('selectedCoupon')
    if (selectedCouponStr) {
      const selectedCoupon = JSON.parse(selectedCouponStr)
      if (this.totalAmount >= selectedCoupon.minAmount) {
        this.selectedCoupon = selectedCoupon
        this.applyCoupon(selectedCoupon)
      } else {
        this.clearCoupon()
        this.checkAvailableCoupons()
      }
    }
  },
  
  methods: {
    async checkAvailableCoupons(isAmountChanged = false) {
      try {
        if (isAmountChanged && this.selectedCoupon) {
          if (this.totalAmount >= this.selectedCoupon.minAmount) {
            return
          } else {
            uni.showToast({
              title: `订单金额变化，当前优惠券不可用`,
              icon: 'none'
            })
            this.clearCoupon()
          }
        }

        const availableCoupons = await getAvailableCoupons(this.totalAmount)
        this.hasCoupons = availableCoupons.length > 0

        if (this.hasCoupons) {
          const bestCoupon = availableCoupons[0]
          if (bestCoupon) {
            this.selectedCoupon = bestCoupon
            this.applyCoupon(bestCoupon)
            uni.setStorageSync('selectedCoupon', JSON.stringify(bestCoupon))
          }
        } else {
          this.clearCoupon()
        }
      } catch (e) {
        console.error('查询优惠券失败:', e)
      }
    },

    applyCoupon(coupon) {
      if (!coupon) return
      
      if (this.totalAmount >= coupon.minAmount) {
        this.couponAmount = coupon.amount
        this.finalAmount = this.totalAmount - this.couponAmount
        if (this.finalAmount < 0) this.finalAmount = 0
      } else {
        uni.showToast({
          title: `订单金额需满${coupon.minAmount}元才能使用该优惠券`,
          icon: 'none'
        })
        this.clearCoupon()
      }
    },

    clearCoupon() {
      this.selectedCoupon = null
      this.couponAmount = 0
      this.finalAmount = this.totalAmount
      uni.removeStorageSync('selectedCoupon')
    },

    selectCoupon() {
      uni.navigateTo({
        url: '/pages/myCoupons/myCoupons?fromOrder=1'
      })
    },

    goPay() {
      uni.showToast({
        title: '正在开发中...',
        icon: 'none'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.checkout-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 130rpx;
  
  .shop-section {
    background: #fff;
    padding: 20rpx 30rpx;
    margin-bottom: 20rpx;
    
    .shop-info {
      display: flex;
      align-items: center;
      
      .location-icon {
        margin-right: 20rpx;
        padding-top: 18rpx;
        image {
          width: 40rpx;
          height: 40rpx;
        }
      }
      
      .shop-name {
        flex: 1;
        font-size: 28rpx;
        color: #333;
      }
      
      .arrow-right {
        image {
          width: 40rpx;
          height: 40rpx;
        }
      }
    }
  }
  
  .order-info {
    background: #fff;
    padding: 30rpx;
    margin-bottom: 20rpx;
    
    .title {
      font-size: 32rpx;
      color: #333;
      margin-bottom: 30rpx;
      font-weight: bold;
    }
    
    .goods-list {
      .goods-item {
        display: flex;
        margin: 30rpx 0;
        
        .goods-img {
          width: 120rpx;
          height: 120rpx;
          margin-right: 20rpx;
        }
        
        .goods-detail {
          flex: 1;
          padding-top: 12rpx;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          
          .goods-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20rpx;
            
            .goods-name {
              flex: 1;
              font-size: 28rpx;
              color: #333;
              margin-right: 20rpx;
            }
            
            .price-wrap {
              flex-shrink: 0;
              
              .price {
                font-size: 32rpx;
                color: #333;
                font-weight: bold;
              }
              
              .unit {
                font-size: 24rpx;
                color: #999;
              }
            }
          }
          
          .num {
            align-self: flex-end;
            color: #999;
            font-size: 26rpx;
            padding-bottom: 16rpx;
          }
        }
      }
    }
  }
  
  .amount-info {
    background: #fff;
    padding: 0 30rpx;
    
    .amount-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 88rpx;
      font-size: 28rpx;
      color: #333;
      border-bottom: 1rpx solid #eee;
      
      &:last-child {
        border-bottom: none;
      }
      
      .red-text {
        color: #FF0000;
        margin-right: 30rpx;
      }
      
      &.coupon {
        .coupon-right {
          display: flex;
          align-items: center;
          
          .discount-amount {
            color: #FF0000;
            margin-right: 10rpx;
          }
          
          image {
            width: 32rpx;
            height: 32rpx;
          }
        }
      }
      
      &.total {
        font-weight: bold;
        justify-content: flex-end;
        
        text {
          color: #FF0000;
          font-size: 32rpx;
        }
        
        .total-price {
          margin-left: 20rpx;
          margin-right: 20rpx;
        }
      }
    }
  }
  
  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 110rpx;
    background: #fff;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    
    .total-amount {
      flex: 1;
      font-size: 36rpx;
      color: #FF0000;
    }
    
    .pay-btn {
      width: 200rpx;
      height: 80rpx;
      background: #FF6B00;
      color: #fff;
      font-size: 32rpx;
      text-align: center;
      line-height: 80rpx;
      border-radius: 40rpx;
    }
  }
}

.coupon-right {
  .no-coupon {
    color: #999;
    font-size: 26rpx;
    margin-right: 10rpx;
  }
}
</style> 