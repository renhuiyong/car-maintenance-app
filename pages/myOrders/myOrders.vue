<template>
  <view class="orders-container">
    <!-- 订单类型切换 -->
    <view class="order-type-bar">
      <view 
        v-for="(type, typeIndex) in orderTypes" 
        :key="typeIndex"
        :class="['type-item', currentOrderType === typeIndex ? 'active' : '']"
        @click="switchOrderType(typeIndex)"
      >
        {{ type }}
      </view>
    </view>

    <!-- 顶部标签切换 -->
    <view class="tab-bar">
      <view 
        v-for="(item, index) in currentTabs" 
        :key="index"
        :class="['tab-item', currentTab === index ? 'active' : '']"
        @click="switchTab(index)"
      >
        {{ item }}
      </view>
    </view>
    
    <!-- 订单列表 -->
    <scroll-view 
      scroll-y 
      class="order-list"
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 维修订单 -->
      <template v-if="currentOrderType === 0">
        <view 
          class="order-item repair-order"
          v-for="(order, index) in orderList" 
          :key="index"
          @click="goToOrderDetail(order.orderId, 'repair')"
        >
          <!-- 订单状态 -->
          <view class="order-status">
            <text>{{getStatusText(order)}}</text>
            <text class="status-tag">{{getStatusTagText(order)}}</text>
          </view>
          
          <!-- 订单内容 -->
          <view class="order-content">
            <view class="time">{{order.createTime}}</view>
            <view class="location">
              <text class="dot">•</text>
              <text>{{order.contactAddress}}</text>
            </view>
            <view class="description-wrapper">
              <view class="description">
                <text>{{order.description}}</text>
              </view>
            </view>
            <view class="btn-row">
              <button 
                class="btn outline"
                @click.stop="checkReply(order)"
              >
                查看回复
              </button>
            </view>
          </view>
        </view>
      </template>

      <!-- 商品订单 -->
      <template v-else>
        <view 
          class="order-item product-order"
          v-for="(order, index) in orderList" 
          :key="index"
          @click="goToOrderDetail(order.orderNo, 'product')"
        >
          <!-- 订单状态 -->
          <view class="order-status">
            <text>{{getProductStatusText(order)}}</text>
          </view>
          
          <!-- 订单内容 -->
          <view class="order-content">
            <view class="order-header">
              <text class="shop-name">{{order.shopName}}</text>
              <text class="order-no">订单号：{{order.orderNo}}</text>
            </view>
            <view class="time">{{order.createTime}}</view>
            <!-- 商品信息 -->
            <view class="product-info" v-for="(item, itemIndex) in order.shopOrderItems" :key="itemIndex">
              <image class="product-image" :src="baseUrl + item.goodsImage" mode="aspectFill"></image>
              <view class="product-detail">
                <view class="product-name">{{item.goodsName}}</view>
                <view class="product-price">
                  <text class="price">¥{{item.price}}</text>
                  <text class="quantity">x{{item.quantity}}</text>
                </view>
              </view>
            </view>
            <!-- 订单总价 -->
            <view class="order-total">
              <text>共{{getOrderItemCount(order)}}件商品</text>
              <text>合计：¥{{order.totalAmount}}</text>
            </view>
          </view>
        </view>
      </template>
      
      <!-- 空状态 -->
      <view v-if="orderList.length === 0" class="empty-state">
        <text>暂无相关订单</text>
      </view>
      
      <!-- 加载更多 -->
      <view class="loading-more" v-if="loading && orderList.length > 0">加载中...</view>
      <view class="no-more" v-if="!hasMore && orderList.length > 0">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script>
import api from '@/api/index.js'
import request from '@/utils/request'

export default {
  data() {
    return {
      baseUrl: request.BASE_URL,
      orderTypes: ['维修订单', '商品订单'],
      currentOrderType: 0, // 0: 维修订单, 1: 商品订单
      repairTabs: ['进行中', '已完成', '已取消'],
      productTabs: ['待提货', '已完成', '已取消'],
      currentTab: 0,
      orderList: [],
      page: 1,
      loading: false,
      hasMore: true,
      refreshing: false,
      pageSize: 5,
      total: 0
    }
  },
  
  computed: {
    currentTabs() {
      return this.currentOrderType === 0 ? this.repairTabs : this.productTabs
    }
  },
  
  onLoad() {
    this.getOrderList()
  },
  
  methods: {
    // 切换订单类型
    switchOrderType(typeIndex) {
      if (this.currentOrderType === typeIndex) return
      this.currentOrderType = typeIndex
      this.currentTab = 0
      this.page = 1
      this.orderList = []
      this.hasMore = true
      this.getOrderList()
    },

    // 切换标签
    switchTab(index) {
      if (this.currentTab === index) return
      this.currentTab = index
      this.page = 1
      this.orderList = []
      this.hasMore = true
      this.getOrderList()
    },
    
    // 获取订单列表
    async getOrderList() {
      if (this.loading || !this.hasMore) return
      this.loading = true
      
      try {
        const params = {
          pageNum: this.page,
          pageSize: this.pageSize
        }
        
        let res
        if (this.currentOrderType === 0) {
          // 维修订单
          const statusMap = {
            0: '0',  // 进行中
            1: '1',  // 已完成
            2: '2'   // 已取消
          }
          params.status = statusMap[this.currentTab]
          res = await api.repair.getOrderList(params)
        } else {
          // 商品订单
          const statusMap = {
            0: '1',  // 待提货
            1: '3',  // 已完成
            2: '2'   // 已取消
          }
          params.status = statusMap[this.currentTab]
          res = await api.order.getShopOrderList(params)
        }
        
        if (res.code === 200) {
          const { rows, total } = res
          this.total = total
          
          if (rows && rows.length > 0) {
            if (this.page === 1) {
              this.orderList = rows
            } else {
              this.orderList = [...this.orderList, ...rows]
            }
            
            this.hasMore = this.orderList.length < total
            
            if (this.hasMore) {
              this.page++
            }
          } else {
            this.hasMore = false
          }
        }
      } catch (err) {
        console.error('获取订单列表失败:', err)
        uni.showToast({
          title: '获取订单列表失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
        if (this.refreshing) {
          this.refreshing = false
          uni.stopPullDownRefresh()
        }
      }
    },
    
    // 获取维修订单状态文本
    getStatusText(order) {
      if (order.status === '0') return '进行中'
      if (order.status === '1') return '已完成'
      if (order.status === '2') return '已取消'
      return '未知状态'
    },
    
    // 获取商品订单状态文本
    getProductStatusText(order) {
      const statusMap = {
        '1': '待提货',
        '3': '已完成',
        '2': '已取消'
      }
      return statusMap[order.status] || '未知状态'
    },
    
    // 获取维修订单状态标签文本
    getStatusTagText(order) {
      if (order.status === '0') {
        if (order.statusDetail === '0') return '等待商家回复'
        if (order.statusDetail === '1') return '商家已回复，待购买配件'
        if (order.statusDetail === '2') return '已购买配件，待维修'
      }
      return ''
    },

    // 获取商品订单商品总数
    getOrderItemCount(order) {
      return order.shopOrderItems.reduce((total, item) => total + item.quantity, 0)
    },
    
    // 显示支付按钮
    showPayButton(order) {
      return false
    },

    // 显示确认收货按钮
    showConfirmButton(order) {
      return false
    },

    // 处理支付
    async handlePayment(order) {
      // 移除支付处理逻辑
    },

    // 确认收货
    async confirmReceipt(order) {
      // 移除确认收货逻辑
    },
    
    // 查看维修订单回复
    async checkReply(order) {
      try {
        const res = await api.repair.getMerchantResponse({
          orderId: order.orderId
        })
        
        if (res.code === 200 && res.data === false) {
          uni.showToast({
            title: '等待商家回复',
            icon: 'none'
          })
          return
        }
        
        if (res.code === 200) {
          const orderInfo = encodeURIComponent(JSON.stringify({
            description: order.description,
            merchantResponse: res.msg,
            images: order.images,
            voicePath: order.voicePath,
            voiceDuration: order.voiceDuration,
            shopId: order.shopId,
            repairOrderId: order.orderId,
            shopName: order.shopName
          }))
          uni.navigateTo({
            url: `/pages/merchantReply/merchantReply?orderInfo=${orderInfo}`
          })
        }
      } catch (err) {
        console.error('获取商家回复失败:', err)
        uni.showToast({
          title: '获取商家回复失败',
          icon: 'none'
        })
      }
    },
    
    // 刷新订单列表
    refreshOrderList() {
      this.page = 1
      this.hasMore = true
      this.orderList = []
      this.getOrderList()
    },
    
    // 下拉刷新
    async onRefresh() {
      this.refreshing = true
      this.refreshOrderList()
    },
    
    // 加载更多
    loadMore() {
      if (this.hasMore && !this.loading) {
        this.getOrderList()
      }
    },
    
    // 跳转到订单详情页面
    goToOrderDetail(orderId, type) {
      if (type === 'repair') {
        uni.navigateTo({
          url: `/pages/orderDetail/orderDetail?orderId=${orderId}`
        })
      } else {
        uni.navigateTo({
          url: `/pages/repairParts/repairParts?orderId=${orderId}&type=2`
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.orders-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  
  .order-type-bar {
    display: flex;
    background: #fff;
    padding: 0 32rpx;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    border-bottom: 1rpx solid #eee;
    
    .type-item {
      flex: 1;
      text-align: center;
      font-size: 32rpx;
      color: #999;
      position: relative;
      padding: 32rpx 0;
      
      &.active {
        color: #4468E8;
        font-weight: 500;
        
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40rpx;
          height: 4rpx;
          background: #4468E8;
          border-radius: 2rpx;
        }
      }
    }
  }

  .tab-bar {
    display: flex;
    background: #fff;
    padding: 0 32rpx;
    position: fixed;
    top: 96rpx;
    left: 0;
    right: 0;
    z-index: 100;
    
    .tab-item {
      flex: 1;
      text-align: center;
      font-size: 28rpx;
      color: #999;
      position: relative;
      padding: 32rpx 0;
      
      &.active {
        color: #4468E8;
        font-weight: 500;
        
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40rpx;
          height: 4rpx;
          background: #4468E8;
          border-radius: 2rpx;
        }
      }
    }
  }
  
  .order-list {
    padding: 216rpx 32rpx 32rpx;
    box-sizing: border-box;
    height: 100vh;
  }
  
  .order-item {
    background: #fff;
    border-radius: 16rpx;
    margin-bottom: 24rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.02);
    
    .order-status {
      padding: 24rpx 32rpx;
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      &::after {
        content: '';
        position: absolute;
        left: 5%;
        right: 5%;
        bottom: 0;
        height: 2rpx;
        background: #E3E3E3;
      }
      
      text {
        font-size: 36rpx;
        font-weight: 600;
        color: #333;
      }

      .status-tag {
        font-size: 28rpx;
        color: #333333;
        font-weight: normal;
      }
    }
    
    .order-content {
      padding: 24rpx 32rpx;
      
      .time {
        font-size: 26rpx;
        color: #999;
        margin-bottom: 16rpx;
      }
    }
  }

  // 维修订单特有样式
  .repair-order {
    .location {
      display: flex;
      align-items: flex-start;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 16rpx;
      
      .dot {
        color: #4468E8;
        margin-right: 8rpx;
        font-weight: bold;
      }
    }
    
    .description-wrapper {
      padding-bottom: 24rpx;
      position: relative;
      margin-bottom: 24rpx;
      z-index: 1;
      
      &::after {
        content: '';
        position: absolute;
        left: 1%;
        right: 1%;
        bottom: 0;
        height: 4rpx;
        background-image: linear-gradient(to right, #E3E3E3 50%, transparent 50%);
        background-size: 30rpx 4rpx;
        background-repeat: repeat-x;
      }
      
      .description {
        background: #f7f8fa;
        padding: 24rpx;
        border-radius: 12rpx;
        margin: 16rpx 0;
        
        text {
          font-size: 28rpx;
          color: #666;
          line-height: 1.5;
        }
      }
    }
  }

  // 商品订单特有样式
  .product-order {
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;
      
      .shop-name {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
      }
      
      .order-no {
        font-size: 24rpx;
        color: #999;
      }
    }

    .product-info {
      display: flex;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #eee;

      .product-image {
        width: 160rpx;
        height: 160rpx;
        border-radius: 8rpx;
        margin-right: 20rpx;
      }

      .product-detail {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .product-name {
          font-size: 28rpx;
          color: #333;
          line-height: 1.4;
        }

        .product-price {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .price {
            font-size: 32rpx;
            color: #FF9500;
            font-weight: 500;
          }

          .quantity {
            font-size: 26rpx;
            color: #999;
          }
        }
      }
    }

    .order-total {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 20rpx 0;
      font-size: 28rpx;

      text {
        margin-left: 20rpx;
        &:last-child {
          color: #FF9500;
          font-weight: 500;
        }
      }
    }
  }

  .btn-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 24rpx;
    position: relative;
    z-index: 2;
    margin-right: -32rpx;

    .btn {
      border-radius: 8rpx;
      padding: 8rpx 24rpx;
      font-size: 28rpx;
      line-height: 1.4;
      min-width: 160rpx;
      text-align: center;
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 32rpx;

      &::after {
        border: none;
      }

      &:active {
        opacity: 0.8;
      }

      &.outline {
        border: 1rpx solid #FF9500;
        color: #FF9500;
        background: #fff;
      }

      &.primary {
        background: #FF9500;
        color: #fff;
      }
    }
  }
  
  .empty-state {
    display: flex;
    justify-content: center;
    padding: 100rpx 0;
    color: #999;
    font-size: 28rpx;
  }
  
  .loading-more,
  .no-more {
    text-align: center;
    padding: 20rpx;
    color: #999;
    font-size: 24rpx;
  }
}
</style> 