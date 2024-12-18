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
            <text class="repair-status">{{getRepairStatusText(order.repairStatus)}}</text>
          </view>
          <text class="order-status">{{getStatusText(order)}}</text>
        </view>
        
        <!-- 订单内容 -->
        <view class="order-content">
          <!-- 问题描述 -->
          <view class="problem-desc">
            <text>问题描述：{{order.description}}</text>
          </view>
          
          <!-- 语音描述 -->
          <view class="voice-desc" v-if="order.voicePath" @click.stop="playVoice(order)">
            <image src="/static/images/yuyin.png" mode="aspectFit"></image>
            <text>{{order.voiceDuration}}″</text>
          </view>
          
          <!-- 图片列表 -->
          <view class="image-list" v-if="order.images && order.images.length > 0">
            <image 
              v-for="(img, imgIndex) in getImageList(order.images)" 
              :key="imgIndex"
              :src="getImageUrl(img)"
              mode="aspectFill"
              @click.stop="previewImage(img, order.images)"
            ></image>
          </view>
          
          <!-- 联系信息 -->
          <view class="contact-info">
            <text>联系人：{{order.contactName}}</text>
            <text>联系电话：{{order.contactPhone}}</text>
            <text>联系地址：{{order.contactAddress}}</text>
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
import api from '@/api/index.js'
import request from '@/utils/request.js'

export default {
  data() {
    return {
      tabList: ['全部', '进行中', '待付款', '已完成'],
      currentTab: 0,
      orderList: [],
      page: 1,
      loading: false,
      hasMore: true,
      refreshing: false,
      audioContext: null
    }
  },
  
  onLoad() {
    this.getOrderList()
    // 初始化音频播放器
    this.audioContext = uni.createInnerAudioContext()
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
          pageSize: 10
        }
        
        // 根据当前标签添加状态筛选
        if (this.currentTab !== 0) {
          const statusMap = {
            1: 0,  // 进行中
            2: 1,  // 待付款
            3: 2   // 已完成
          }
          params.status = statusMap[this.currentTab]
        }
        
        const res = await api.repair.getOrderList(params)
        
        if (res.code === 200) {
          const { data } = res
          if (data && data.length > 0) {
            this.orderList = [...this.orderList, ...data]
            this.page++
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
        }
      }
    },
    
    // 获取订单状态文本
    getStatusText(order) {
      const statusMap = {
        0: '等候商家回复',
        1: '车辆维修中',
        2: '已完成'
      }
      return statusMap[order.repairStatus] || '未知状态'
    },
    
    // 获取维修状态文本
    getRepairStatusText(status) {
      const statusMap = {
        0: '未接单',
        1: '维修中',
        2: '已完成'
      }
      return statusMap[status] || '未知状态'
    },
    
    // 获取订单操作按钮
    getOrderButtons(status) {
      const btnMap = {
        0: [ // 进行中
          { text: '查看商家回复', action: 'checkReply' }
        ],
        1: [ // 待付款
          { text: '取消订单', action: 'cancel' },
          { text: '去支付', action: 'pay', primary: true }
        ],
        2: [ // 已完成
          { text: '删除订单', action: 'delete' },
          { text: '再次购买', action: 'rebuy', primary: true }
        ]
      }
      // 根据维修状态返回不同的按钮
      if (this.currentOrder && this.currentOrder.repairStatus === 0) {
        return [
          { text: '查看商家回复', action: 'checkReply' },
          { text: '联系商家', action: 'contact' }
        ]
      }
      return btnMap[status] || []
    },
    
    // 处理按钮操作
    handleAction(action, order) {
      const actionMap = {
        checkReply: () => this.checkMerchantReply(order),
        progress: () => this.viewProgress(order),
        contact: () => this.contactShop(order),
        cancel: () => this.cancelOrder(order),
        pay: () => this.payOrder(order),
        delete: () => this.deleteOrder(order),
        rebuy: () => this.rebuyOrder(order)
      }
      
      if (actionMap[action]) {
        actionMap[action]()
      }
    },
    
    // 查看商家回复
    async checkMerchantReply(order) {
      try {
        const res = await api.repair.getMerchantResponse({
          orderId: order.orderId
        })
        
        if (res.code === 200 && res.data === false) {
          uni.showToast({
            title: '商家暂未回复',
            icon: 'none'
          })
          return
        }
        
        if (res.code === 200) {
          const orderInfo = encodeURIComponent(JSON.stringify({
            orderId: order.orderId,
            repairOrderId: order.orderId,
            description: order.description,
            shopName: order.shopName,
            merchantResponse: res.msg,
            images: order.images,
            voicePath: order.voicePath,
            voiceDuration: order.voiceDuration,
            shopId: order.shopId
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
    
    // 处理图片列表
    getImageList(images) {
      if (!images) return []
      return typeof images === 'string' ? images.split(',') : Array.isArray(images) ? images : []
    },
    
    // 修改预览图片方法
    previewImage(current, images) {
      const imageList = this.getImageList(images)
      const urls = imageList.map(img => this.getImageUrl(img))
      uni.previewImage({
        current: this.getImageUrl(current),
        urls
      })
    },
    
    // 播放语音
    playVoice(order) {
      if (!order.voicePath) return
      
      if (this.audioContext.src === request.BASE_URL + order.voicePath) {
        if (this.audioContext.paused) {
          this.audioContext.play()
        } else {
          this.audioContext.pause()
        }
      } else {
        this.audioContext.src = request.BASE_URL + order.voicePath
        this.audioContext.play()
      }
    },
    
    // 下拉刷新
    async onRefresh() {
      this.refreshing = true
      this.page = 1
      this.orderList = []
      this.hasMore = true
      await this.getOrderList()
    },
    
    // 加载更多
    loadMore() {
      this.getOrderList()
    },
    
    // 跳转到订单详情
    goToDetail(order) {
      uni.navigateTo({
        url: `/pages/orderDetail/orderDetail?orderId=${order.orderId}`
      })
    },
    
    // 获取图片完整URL
    getImageUrl(path) {
      if (!path) return '/static/products/shangpin_default.png'
      return path.startsWith('http') ? path : request.BASE_URL + path
    }
  }
}
</script>

<style lang="scss" scoped>
.orders-container {
  min-height: 100vh;
  background-color: #f5f6fa;
  
  .tab-wrapper {
    display: flex;
    background: #fff;
    padding: 20rpx 30rpx;
    position: sticky;
    top: 0;
    z-index: 100;
    
    .tab-item {
      flex: 1;
      text-align: center;
      font-size: 28rpx;
      color: #666;
      position: relative;
      padding: 20rpx 0;
      
      &.active {
        color: #333;
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
    padding: 20rpx;
  }
  
  .order-item {
    background: #fff;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    
    .shop-info {
      padding: 20rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
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
          margin-right: 20rpx;
        }
        
        .repair-status {
          font-size: 24rpx;
          color: #4468E8;
          background: rgba(68, 104, 232, 0.1);
          padding: 4rpx 12rpx;
          border-radius: 20rpx;
        }
      }
      
      .order-status {
        font-size: 26rpx;
        color: #FF6B00;
      }
    }
    
    .order-content {
      padding: 20rpx;
      
      .problem-desc {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 20rpx;
      }
      
      .voice-desc {
        display: inline-flex;
        align-items: center;
        background: #F7F7F7;
        padding: 10rpx 20rpx;
        border-radius: 30rpx;
        margin-bottom: 20rpx;
        
        image {
          width: 32rpx;
          height: 32rpx;
          margin-right: 10rpx;
        }
        
        text {
          font-size: 24rpx;
          color: #666;
        }
      }
      
      .image-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10rpx;
        margin-bottom: 20rpx;
        
        image {
          width: 160rpx;
          height: 160rpx;
          border-radius: 8rpx;
        }
      }
      
      .contact-info {
        font-size: 26rpx;
        color: #666;
        
        text {
          display: block;
          margin-bottom: 10rpx;
          
          &:last-child {
            margin-bottom: 0;
          }
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