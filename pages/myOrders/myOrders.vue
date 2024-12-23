<template>
  <view class="orders-container">
    <!-- 顶部标签切换 -->
    <view class="tab-bar">
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
      >
        <!-- 订单状态 -->
        <view class="order-status">
          <text>{{getStatusText(order)}}</text>
          <text class="status-tag">{{getStatusTagText(order)}}</text>
        </view>
        
        <!-- 订单内容 -->
        <view class="order-content">
          <!-- 时间 -->
          <view class="time">{{order.createTime}}</view>
          
          <!-- 地址 -->
          <view class="location">
            <text class="dot">•</text>
            <text>{{order.contactAddress}}</text>
          </view>
          
          <!-- 问题描述区域 -->
          <view class="description-wrapper">
            <view class="description">
              <text>{{order.description}}</text>
            </view>
          </view>
          
          <!-- 查看回复按钮 -->
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

export default {
  data() {
    return {
      tabList: ['进行中', '已完成', '已取消'],
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
        const params = {
          pageNum: this.page,
          pageSize: this.pageSize
        }
        
        // 根据当前标签添加状态筛选
        const statusMap = {
          0: '0',  // 进行中
          1: '1',  // 已完成
          2: '2'   // 已取消
        }
        params.status = statusMap[this.currentTab]
        
        const res = await api.repair.getOrderList(params)
        
        if (res.code === 200) {
          const { rows, total } = res
          this.total = total
          
          if (rows && rows.length > 0) {
            // 如果是刷新或第一页，直接替换数据
            if (this.page === 1) {
              this.orderList = rows
            } else {
              // 否则追加数据
              this.orderList = [...this.orderList, ...rows]
            }
            
            // 判断是否还有更多数据
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
    
    // 获取订单状态文本
    getStatusText(order) {
      if (order.status === '0') {
        return '进行中'
      }
      if (order.status === '1') {
        return '已完成'
      }
      if (order.status === '2') {
        return '已取消'
      }
      return '未知状态'
    },
    
    // 获取状态标签文本
    getStatusTagText(order) {
      if (order.status === '0' && !order.merchantResponse) {
        return '等候商家回复'
      }
      if (order.status === '0' && order.merchantResponse) {
        return '等候用户购买配件'
      }
      if (order.status === '0') {
        return '车辆维修中'
      }
      return ''
    },
    
    // 查看回复
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
            orderId: order.orderId,
            description: order.description,
            merchantResponse: res.msg,
            images: order.images,
            voicePath: order.voicePath,
            voiceDuration: order.voiceDuration,
            shopId: order.shopId,
            repairOrderId: order.repairOrderId,
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
    
    // 下拉刷新
    async onRefresh() {
      this.refreshing = true
      this.page = 1
      this.hasMore = true
      await this.getOrderList()
    },
    
    // 加载更多
    loadMore() {
      if (this.hasMore && !this.loading) {
        this.getOrderList()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.orders-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  
  .tab-bar {
    display: flex;
    background: #fff;
    padding: 0 32rpx;
    position: fixed;
    top: 0;
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
    padding: 120rpx 32rpx 32rpx;
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

      .btn-row {
        display: flex;
        justify-content: flex-end;
        margin-top: 24rpx;
        position: relative;
        z-index: 2;
        margin-right: -32rpx;

        .btn.outline {
          border: 1rpx solid #FF9500;
          color: #FF9500;
          border-radius: 8rpx;
          padding: 8rpx 24rpx;
          font-size: 28rpx;
          background: #fff;
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
        }
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