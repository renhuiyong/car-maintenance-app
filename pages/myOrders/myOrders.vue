<template>
  <view class="orders-container">
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
    
    <!-- 订单列表 -->
    <scroll-view 
      scroll-y 
      class="order-list"
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view 
        class="order-item"
        v-for="(order, index) in orderList" 
        :key="index"
        @click="goToDetail(order)"
      >
        <!-- 店铺信息 -->
        <view class="shop-info">
          <view class="shop-left">
            <image src="/static/images/dingwei.png" mode="aspectFit"></image>
            <text class="shop-name">{{order.shopName}}</text>
          </view>
          <text class="order-status">{{getStatusText(order.status, order)}}</text>
        </view>
        
        <!-- 商品列表 -->
        <view class="goods-list">
          <view class="goods-item" v-for="(goods, goodsIndex) in order.goods" :key="goodsIndex">
            <image class="goods-img" :src="goods.image" mode="aspectFill"></image>
            <view class="goods-detail">
              <view class="goods-top">
                <text class="goods-name">{{goods.name}}</text>
                <view class="price-wrap">
                  <text class="price">¥{{goods.price}}</text>
                  <text class="unit">/件</text>
                </view>
              </view>
              <text class="num">x{{goods.quantity}}</text>
            </view>
          </view>
        </view>
        
        <!-- 订单金额 -->
        <view class="order-amount">
          <text>共{{getGoodsCount(order)}}件商品</text>
          <view class="amount-right">
            <text>实付：</text>
            <text class="final-price">¥{{order.finalAmount}}</text>
          </view>
        </view>
        
        <!-- 订单操作按钮 -->
        <view class="order-actions">
          <view 
            class="action-btn"
            v-for="(btn, btnIndex) in getOrderButtons(order.status)"
            :key="btnIndex"
            :class="{ primary: btn.primary }"
            @click.stop="handleAction(btn.action, order)"
          >
            {{btn.text}}
          </view>
        </view>
      </view>
      <!-- 空状态 -->
      <view v-if="orderList.length === 0" class="empty-state">
        <image src="/static/products/empty_cart.png" mode="aspectFit"></image>
        <text>暂无相关订单</text>
      </view>
      
      <!-- 加载更多 -->
      <view class="loading-more" v-if="loading && orderList.length > 0">加载中...</view>
      <view class="no-more" v-if="!hasMore && orderList.length > 0">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script>
const ORDER_STATUS = {
  PENDING_PAY: 0,    // 待付款
  IN_PROGRESS: 4,    // 进行中
  COMPLETED: 2,      // 已完成
  CANCELLED: 3       // 已取消
}

export default {
  data() {
    return {
      tabList: ['全部', '进行中', '待付款', '已完成'],
      currentTab: 0,
      orderList: [],
      page: 1,
      loading: false,
      hasMore: true,
      refreshing: false
    }
  },
  
  onLoad() {
    this.getOrderList()
  },
  
  methods: {
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
        // 模拟接口请求
        setTimeout(() => {
          const mockOrders = this.getMockOrders()
          this.orderList = [...this.orderList, ...mockOrders]
          this.hasMore = this.page < 3
          this.page++
          this.loading = false
        }, 500)
      } catch (e) {
        console.error('获取订单列表失败:', e)
        this.loading = false
      }
    },
    
    // 获取订单状态文本
    getStatusText(status, order) {
      const statusMap = {
        [ORDER_STATUS.PENDING_PAY]: '待付款',
        [ORDER_STATUS.COMPLETED]: '已完成',
        [ORDER_STATUS.CANCELLED]: '已取消'
      }
      if (status === ORDER_STATUS.IN_PROGRESS) {
        return this.getInProgressStatusText(order)
      }
      return statusMap[status] || '未知状态'
    },
    
    // 获取进行中状态文本
    getInProgressStatusText(order) {
      if (!order.accepted) {
        return '待接单'
      }
      if (!order.replied) {
        return '等候商家服务'
      }
      return '进行中'
    },
    
    // 获取订单商品总数
    getGoodsCount(order) {
      return order.goods.reduce((total, goods) => total + goods.quantity, 0)
    },
    
    // 获取订单操作按钮
    getOrderButtons(status) {
      const btnMap = {
        [ORDER_STATUS.PENDING_PAY]: [
          { text: '取消订单', action: 'cancel' },
          { text: '去支付', action: 'pay', primary: true }
        ],
        [ORDER_STATUS.IN_PROGRESS]: [
          { text: '查看回复', action: 'viewReply' },
          { text: '查看进度', action: 'progress' },
          { text: '联系商家', action: 'contact' }
        ],
        [ORDER_STATUS.COMPLETED]: [
          { text: '删除订单', action: 'delete' },
          { text: '再次购买', action: 'rebuy', primary: true }
        ],
        [ORDER_STATUS.CANCELLED]: [
          { text: '删除订单', action: 'delete' }
        ]
      }
      return btnMap[status] || []
    },
    
    // 处理订单操作
    handleAction(action, order) {
      const actionMap = {
        cancel: () => this.cancelOrder(order),
        pay: () => this.payOrder(order),
        progress: () => this.viewProgress(order),
        contact: () => this.contactShop(order),
        delete: () => this.deleteOrder(order),
        rebuy: () => this.rebuyOrder(order),
        viewReply: () => this.viewReply(order)
      }
      
      if (actionMap[action]) {
        actionMap[action]()
      }
    },
    
    // 修改模拟订单数��
    getMockOrders() {
      const mockData = {
        [ORDER_STATUS.PENDING_PAY]: [
          {
            id: '1001',
            shopName: '电动车维修店一',
            shopPhone: '10086',
            status: ORDER_STATUS.PENDING_PAY,
            goods: [
              {
                id: '1',
                name: '电动车刹车片',
                price: 20,
                quantity: 2,
                image: '/static/products/shangpin_default.png'
              },
              {
                id: '2',
                name: '车把套',
                price: 15,
                quantity: 1,
                image: '/static/products/shangpin_default.png'
              }
            ],
            finalAmount: 55,
            createTime: '2024-01-20T14:30:00'
          }
        ],
        [ORDER_STATUS.IN_PROGRESS]: [
          {
            id: '1006',
            shopName: '电动车维修店一',
            shopPhone: '10086',
            status: ORDER_STATUS.IN_PROGRESS,
            accepted: false,
            replied: false,
            goods: [
              {
                id: '8',
                name: '电机维修服务',
                price: 150,
                quantity: 1,
                image: '/static/products/shangpin_default.png'
              }
            ],
            finalAmount: 150,
            createTime: '2024-03-19T10:30:00',
            repairInfo: {
              problem: '电机异响维修中',
              address: '广州市天河区天河路100号',
              appointmentTime: '2024-03-19T14:00:00',
              progress: '正在维修电机，预计30分钟完成'
            }
          },
          {
            id: '1007',
            shopName: '电动车维修店二',
            shopPhone: '10087',
            status: ORDER_STATUS.IN_PROGRESS,
            accepted: true,
            replied: false,
            goods: [
              {
                id: '9',
                name: '轮胎维修',
                price: 80,
                quantity: 1,
                image: '/static/products/shangpin_default.png'
              }
            ],
            finalAmount: 80,
            createTime: '2024-03-19T09:30:00',
            repairInfo: {
              problem: '轮胎漏气',
              address: '广州市天河区体育西路50号',
              appointmentTime: '2024-03-19T13:00:00'
            }
          }
        ],
        [ORDER_STATUS.COMPLETED]: [
          {
            id: '1004',
            shopName: '电动车维修店一',
            shopPhone: '10086',
            status: ORDER_STATUS.COMPLETED,
            goods: [
              {
                id: '5',
                name: '电瓶更换服务',
                price: 300,
                quantity: 1,
                image: '/static/products/shangpin_default.png'
              },
              {
                id: '6',
                name: '新电瓶',
                price: 400,
                quantity: 1,
                image: '/static/products/shangpin_default.png'
              }
            ],
            finalAmount: 700,
            createTime: '2024-01-19T10:30:00',
            completedTime: '2024-01-19T11:30:00'
          }
        ],
        [ORDER_STATUS.CANCELLED]: [
          {
            id: '1005',
            shopName: '电动车维修店三',
            shopPhone: '10088',
            status: ORDER_STATUS.CANCELLED,
            goods: [
              {
                id: '7',
                name: '车灯维修',
                price: 50,
                quantity: 1,
                image: '/static/products/shangpin_default.png'
              }
            ],
            finalAmount: 50,
            createTime: '2024-01-18T09:30:00',
            cancelTime: '2024-01-18T10:00:00',
            cancelReason: '用户取消'
          }
        ]
      }

      if (this.currentTab === 0) {
        return Object.values(mockData)
          .flat()
          .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      } else {
        const statusMap = {
          1: ORDER_STATUS.IN_PROGRESS,
          2: ORDER_STATUS.PENDING_PAY,
          3: ORDER_STATUS.COMPLETED
        }
        return mockData[statusMap[this.currentTab]] || []
      }
    },
    
    // 订单相关操作方法
    cancelOrder(order) {
      uni.showModal({
        title: '提示',
        content: '确定要取消该订单吗？',
        success: (res) => {
          if (res.confirm) {
            // 处理取消订单逻辑
          }
        }
      })
    },
    
    payOrder(order) {
      uni.navigateTo({
        url: `/pages/payment/payment?orderId=${order.id}`
      })
    },
    
    goToDetail(order) {
      // 将订单信息存储到本地
      uni.setStorageSync('currentOrder', JSON.stringify(order))
      uni.navigateTo({
        url: `/pages/orderDetail/orderDetail?orderId=${order.id}`
      })
    },
    
    viewProgress(order) {
      uni.navigateTo({
        url: `/pages/repairProgress/repairProgress?orderId=${order.id}`
      })
    },
    
    contactShop(order) {
      // 这里可以实现拨打电话或跳转到聊天页面
      uni.makePhoneCall({
        phoneNumber: order.shopPhone || '10086', // 这里替换为实际的商家电话
        fail: () => {
          uni.showToast({
            title: '拨打电话失败',
            icon: 'none'
          })
        }
      })
    },
    
    deleteOrder(order) {
      uni.showModal({
        title: '提示',
        content: '确定要删除该订单吗？',
        success: (res) => {
          if (res.confirm) {
            // 处理删除订单逻辑
          }
        }
      })
    },
    
    rebuyOrder(order) {
      // 处理再次购买逻辑
    },
    
    viewReply(order) {
      uni.navigateTo({
        url: `/pages/merchantReply/merchantReply?orderId=${order.id}`
      })
    },
    
    // 下拉刷新
    async onRefresh() {
      this.refreshing = true
      this.page = 1
      this.orderList = []
      this.hasMore = true
      await this.getOrderList()
      this.refreshing = false
    },
    
    // 加载更多
    loadMore() {
      this.getOrderList()
    }
  }
}
</script>

<style lang="scss" scoped>
.orders-container {
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
        color: #FF6B00;
        font-weight: bold;
        
        &::after {
          content: '';
          position: absolute;
          bottom: -10rpx;
          left: 50%;
          transform: translateX(-50%);
          width: 40rpx;
          height: 4rpx;
          background: #FF6B00;
          border-radius: 2rpx;
        }
      }
    }
  }
  
  .order-list {
    height: calc(100vh - 88rpx);
    padding: 20rpx;
    box-sizing: border-box;
    margin-top: 88rpx;
    
    .order-item {
      background: #fff;
      border-radius: 12rpx;
      margin-bottom: 20rpx;
      overflow: hidden;
      
      .shop-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx;
        border-bottom: 1rpx solid #eee;
        
        .shop-left {
          display: flex;
          align-items: center;
          
          image {
            width: 32rpx;
            height: 32rpx;
            margin-right: 10rpx;
          }
          
          .shop-name {
            font-size: 28rpx;
            color: #333;
          }
        }
        
        .order-status {
          font-size: 26rpx;
          color: #FF6B00;
        }
      }
      
      .goods-list {
        padding: 20rpx;
        
        .goods-item {
          display: flex;
          margin-bottom: 20rpx;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .goods-img {
            width: 120rpx;
            height: 120rpx;
            margin-right: 20rpx;
          }
          
          .goods-detail {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            
            .goods-top {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              
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
            }
          }
        }
      }
      
      .order-amount {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx;
        border-top: 1rpx solid #eee;
        font-size: 26rpx;
        color: #666;
        
        .amount-right {
          .final-price {
            color: #FF6B00;
            font-size: 32rpx;
            font-weight: bold;
          }
        }
      }
      
      .order-actions {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 20rpx;
        border-top: 1rpx solid #eee;
        gap: 20rpx;
        
        .action-btn {
          padding: 10rpx 30rpx;
          border: 1rpx solid #ddd;
          border-radius: 30rpx;
          font-size: 26rpx;
          color: #666;
          
          &.primary {
            background: #FF6B00;
            color: #fff;
            border-color: #FF6B00;
          }
        }
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
  
  .loading-more,
  .no-more {
    text-align: center;
    padding: 20rpx;
    color: #999;
    font-size: 24rpx;
  }
}
</style> 