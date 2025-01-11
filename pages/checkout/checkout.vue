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
          <text v-else-if="hasCoupons" class="no-coupon">{{ '请选择优惠券' }}</text>
          <text v-else class="no-coupon">暂无可用优惠券</text>
          <image src="/static/images/youjiantou2.png" mode="aspectFit"></image>
        </view>
      </view>
      <view class="amount-item no-coupon-option" @click="clearCoupon">
        <text>不使用优惠券</text>
        <view class="coupon-right">
          <text :class="['check-icon', {'checked': !selectedCoupon}]"></text>
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
      <view class="pay-btn" :class="{'loading': submitting}" @click="goPay">
        <text v-if="!submitting">去支付</text>
        <view v-else class="loading-dots">
          <text class="dot"></text>
          <text class="dot"></text>
          <text class="dot"></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/api/index.js'

export default {
  data() {
    return {
      shopId: '',
      shopName: '',
      orderGoods: [],
      totalAmount: 0,
      couponAmount: 0,
      freight: 0,
      finalAmount: 0,
      selectedCoupon: null,
      hasCoupons: false,
      lastOrderAmount: 0,
      submitting: false
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
  
  onLoad(options) {
    const orderInfo = uni.getStorageSync('orderInfo')
    console.log('结算页面接收到的订单信息:', orderInfo)
    if (orderInfo) {
      const info = JSON.parse(orderInfo)
      this.shopName = info.shopName || '未知店铺'
      this.shopId = info.shopId
      this.orderGoods = info.orderGoods
      this.totalAmount = info.totalAmount
      this.freight = info.freight || 0
      this.finalAmount = info.finalAmount
      this.lastOrderAmount = info.totalAmount
      this.repairOrderId = info.repairOrderId

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

        const res = await api.coupon.getCouponList({
          orderAmount: this.totalAmount,
          status: 0  // 未使用的优惠券
        })
        
        if (res.code === 200) {
          // 过滤出可用且未过期的优惠券
          const now = new Date().getTime()
          const availableCoupons = res.data.filter(coupon => {
            const endTime = new Date(coupon.endDate.replace(/-/g, '/')).getTime()
            // 判断优惠券是否满足金额条件且未过期
            return this.totalAmount >= coupon.minAmount && now <= endTime
          })
          
          this.hasCoupons = availableCoupons.length > 0

          if (this.hasCoupons) {
            // 获取优惠金额最大的优惠券作为最优券
            const bestCoupon = availableCoupons.reduce((best, current) => {
              // 计算当前优惠券的优惠金额
              let currentDiscount = 0
              if (current.type === 1) {
                currentDiscount = current.amount
              } else if (current.type === 2) {
                const discount = current.amount / 10
                const discountedPrice = Math.round(this.totalAmount * discount * 100) / 100
                currentDiscount = Math.round((this.totalAmount - discountedPrice) * 100) / 100
              }
              
              // 计算最优优惠券的优惠金额
              let bestDiscount = 0
              if (best) {
                if (best.type === 1) {
                  bestDiscount = best.amount
                } else if (best.type === 2) {
                  const discount = best.amount / 10
                  const discountedPrice = Math.round(this.totalAmount * discount * 100) / 100
                  bestDiscount = Math.round((this.totalAmount - discountedPrice) * 100) / 100
                }
              }
              
              // 返回优惠金额更大的优惠券
              return (!best || currentDiscount > bestDiscount) ? current : best
            }, null)
            
            if (bestCoupon) {
              this.selectedCoupon = bestCoupon
              this.applyCoupon(bestCoupon)
              uni.setStorageSync('selectedCoupon', JSON.stringify(bestCoupon))
            }
          } else {
            this.clearCoupon()
          }
        }
      } catch (e) {
        console.error('查询优惠券失败:', e)
      }
    },

    applyCoupon(coupon) {
      if (!coupon) return
      
      if (this.totalAmount >= coupon.minAmount) {
        if (coupon.type === 1) {
          // 满减券直接使用优惠金额
          this.couponAmount = coupon.amount
        } else if (coupon.type === 2) {
          // 折扣券计算折扣金额
          const discount = coupon.amount / 10  // 8.8 / 10 = 0.88
          // 折扣后价格 = 原价 × 折扣率，四舍五入保留2位小数
          const discountedPrice = Math.round(this.totalAmount * discount * 100) / 100
          // 优惠金额 = 原价 - 折扣后价格，四舍五入保留2位小数
          this.couponAmount = Math.round((this.totalAmount - discountedPrice) * 100) / 100
        }
        
        // 计算最终金额，四舍五入保留2位小数
        this.finalAmount = Math.round((this.totalAmount - this.couponAmount) * 100) / 100
      } else {
        uni.showToast({
          title: `订单金额需满${coupon.minAmount}元才能使用优惠券`,
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

    async checkStock() {
      try {
        console.log(this.shopId)
        const res = await api.shop.checkStock({
          shopId: this.shopId,
          items: this.orderGoods.map(item => ({
            shopId: this.shopId,
            goodsId: item.id,
            quantity: item.quantity
          }))
        })
        return res.code === 200
      } catch (err) {
        console.error('库存检查失败:', err)
        return false
      }
    },

    async goPay() {
      if (this.submitting) return
      
      try {
        this.submitting = true
        // 先检查库存
        const stockValid = await this.checkStock()
        if (!stockValid) {
          uni.showToast({
            title: '部分商品库存不足',
            icon: 'none'
          })
          return
        }

        // 构造订单数据
        const orderData = {
          // 主表数据
          shopId: this.shopId,                    // 店铺ID
          repairOrderId: this.repairOrderId,      // 维修订单ID（如果是从维修订单过来的）
          totalAmount: this.totalAmount,          // 订单总金额
          couponId: this.selectedCoupon?.id,      // 优惠券ID
          couponAmount: this.couponAmount,        // 优惠券抵扣金额
          actualAmount: this.finalAmount,         // 实际支付金额

          // 子表数据
          orderItems: this.orderGoods.map(item => ({
            goodsId: item.id,                     // 商品ID
            quantity: item.quantity,              // 购买数量
          }))
        }

        console.log(orderData)
       
        // 调用创建订单接口
        const res = await api.order.create(orderData)
        
        if (res.code === 200) {
          // 调用微信支付
          const payParams = res.data.payParams
          uni.requestPayment({
            provider: 'wxpay',
            appId: payParams.appId,
            timeStamp: payParams.timeStamp,
            nonceStr: payParams.nonceStr,
            package: payParams.packageValue,  // 使用packageValue作为package参数
            signType: payParams.signType,
            paySign: payParams.paySign,
            success: (payRes) => {
              uni.showToast({
                title: '支付成功',
                icon: 'success'
              })
              
              // 清空购物车
              uni.removeStorageSync('cartData')
              // 清空订单信息
              uni.removeStorageSync('orderInfo')
              // 清空选中的优惠券
              uni.removeStorageSync('selectedCoupon')
              
              // 延迟跳转，让用户看到成功提示
              setTimeout(() => {
                // 根据是否存在维修订单ID决定跳转页面
                if (this.repairOrderId) {
                  uni.redirectTo({
                    url: `/pages/orderDetail/orderDetail?orderId=${res.data.orderNo}`
                  })
                } else {
                  uni.redirectTo({
                    url: `/pages/repairParts/repairParts?type=2&orderId=${res.data.orderNo}`
                  })
                }
              }, 1500)
            },
            fail: (err) => {
              console.error('支付失败:', err)
              uni.showToast({
                title: '支付失败，请重试',
                icon: 'none'
              })
              // 支付失败时的跳转逻辑也需要修改
              if (this.repairOrderId) {
                uni.redirectTo({
                  url: `/pages/orderDetail/orderDetail?orderId=${res.data.orderNo}`
                })
              } else {
                uni.redirectTo({
                  url: `/pages/repairParts/repairParts?type=2&orderId=${res.data.orderNo}`
                })
              }
            }
          })
        } else {
          uni.showToast({
            title: res.msg || '创建订单失败',
            icon: 'none'
          })
        }
      } finally {
        this.submitting = false
      }
    },

    onBackPress() {
      // 如果正在提交订单，阻止返回
      if (this.submitting) {
        return true
      }
      return false
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
    padding: 30rpx;
    margin-bottom: 20rpx;
    
    .shop-info {
      display: flex;
      align-items: center;
      
      .location-icon {
        margin-right: 20rpx;
        image {
          width: 32rpx;
          height: 32rpx;
        }
      }
      
      .shop-name {
        flex: 1;
        font-size: 30rpx;
        color: #333;
        font-weight: 500;
      }
      
      .arrow-right {
        image {
          width: 32rpx;
          height: 32rpx;
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
    
    .no-coupon-option {
      .coupon-right {
        display: flex;
        align-items: center;
        
        .check-icon {
          width: 36rpx;
          height: 36rpx;
          border: 2rpx solid #ddd;
          border-radius: 50%;
          position: relative;
          margin-right: 20rpx;
          
          &.checked {
            background: #FF6B00;
            border-color: #FF6B00;
            
            &::after {
              content: '';
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%) rotate(45deg);
              width: 12rpx;
              height: 20rpx;
              border-right: 4rpx solid #fff;
              border-bottom: 4rpx solid #fff;
            }
          }
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
      position: relative;
      overflow: hidden;
      
      &.loading {
        background: #ff8533;
      }
      
      .loading-dots {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        
        .dot {
          width: 8rpx;
          height: 8rpx;
          background: #fff;
          border-radius: 50%;
          margin: 0 6rpx;
          animation: loading 1.4s infinite ease-in-out;
          
          &:nth-child(1) {
            animation-delay: 0s;
          }
          
          &:nth-child(2) {
            animation-delay: 0.2s;
          }
          
          &:nth-child(3) {
            animation-delay: 0.4s;
          }
        }
      }
    }
  }
}

@keyframes loading {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0;
  }
  40% {
    transform: scale(1);
    opacity: 1;
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