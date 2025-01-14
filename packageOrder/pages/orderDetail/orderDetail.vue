<template>
  <view class="order-detail">
    <template v-if="orderInfo">
      <scroll-view 
        scroll-y 
        class="order-scroll"
        :refresher-enabled="true"
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
        :show-scrollbar="false"
      >
        <!-- 订单状态 -->
        <view class="status-section">
          <text class="status-text">{{ getStatusText(orderInfo.status) }}</text>
          <text class="status-desc">{{ getStatusDesc(orderInfo.status) }}</text>
        </view>
        
        <!-- 内容区域 -->
        <view class="content-wrapper">
          <!-- 其他内容保持不变 -->
          <view class="repair-info">
            <view class="section-title">维修信息</view>
            <view class="info-item">
              <text class="label">问题描述</text>
              <text class="value">{{ orderInfo.description }}</text>
            </view>
            <!-- 维修图片 -->
            <view class="images-wrapper" v-if="orderInfo.images">
              <image 
                v-for="(img, index) in orderInfo.images.split(',')" 
                :key="index"
                :src="getFullImageUrl(img)"
                mode="aspectFill"
                @click="previewImage(img, orderInfo.images.split(','))"
              ></image>
            </view>
            <!-- 语音消息 -->
            <view class="voice-wrapper" v-if="orderInfo.voicePath">
              <view class="voice-player" @click="playVoice(orderInfo.voicePath)">
                <view class="voice-waves" :class="{ 'playing': isPlaying }">
                  <view class="wave"></view>
                  <view class="wave"></view>
                  <view class="wave"></view>
                </view>
                <text>{{ orderInfo.voiceDuration }}s</text>
              </view>
            </view>
          </view>
          
          <view class="shop-section" v-if="orderInfo.shopId">
            <view class="shop-info">
              <image 
                :src="orderInfo.logoUrl ? getFullImageUrl(orderInfo.logoUrl) : '/static/images/shop.png'" 
                mode="aspectFill"
              ></image>
              <view class="shop-detail">
                <text class="shop-name">{{ orderInfo.shopName }}</text>
                <text class="shop-address">{{ orderInfo.shopAddress }}</text>
              </view>
            </view>
            <view class="contact-btn" @click="contactShop">
              <image src="/static/images/dianhua.png" mode="aspectFit"></image>
              <text>联系商家</text>
            </view>
          </view>
          
          <view class="contact-section">
            <view class="section-title">联系人信息</view>
            <view class="info-item">
              <text class="label">联系人</text>
              <text class="value">{{ orderInfo.contactName }}</text>
            </view>
            <view class="info-item">
              <text class="label">联系电话</text>
              <text class="value">{{ orderInfo.contactPhone }}</text>
            </view>
            <view class="info-item">
              <text class="label">联系地址</text>
              <text class="value">{{ orderInfo.contactAddress }}</text>
            </view>
          </view>
          
          <view class="order-info">
            <view class="section-title">订单信息</view>
            <view class="info-item">
              <text class="label">订单编号</text>
              <view class="value-wrap">
                <text class="value">{{ orderInfo.orderId }}</text>
                <text class="copy-btn" @click="copyOrderId">复制</text>
              </view>
            </view>
            <view class="info-item">
              <text class="label">创建时间</text>
              <text class="value">{{ orderInfo.createTime }}</text>
            </view>
            <view class="info-item" v-if="orderInfo.shopId">
              <text class="label">订单状态</text>
              <text class="value">{{ getStatusDetailText(orderInfo.statusDetail) }}</text>
            </view>
            <!-- <view class="info-item" v-if="orderInfo.shopId">
              <text class="label">支付状态</text>
              <text class="value">{{ getPayStatusText(orderInfo.payStatus) }}</text>
            </view> -->
            <!-- <view class="info-item" v-if="orderInfo.shopId">
              <text class="label">维修状态</text>
              <text class="value">{{ getRepairStatusText(orderInfo.repairStatus) }}</text>
            </view> -->
          </view>
          
          <view class="amount-section">
            
            <view class="amount-item" v-if="orderInfo.needTransport === 1">
              <text>运输费用</text>
              <text class="amount">¥{{ orderInfo.transportFee.toFixed(2) }}</text>
            </view>
            <!-- 配件费用 计算所有shopOrderItems的price-->
            <view class="amount-item">
              <text>配件费用</text>
              <text class="amount">¥{{ partsInfo ? partsInfo.reduce((total, part) => total + part.shopOrderItems.reduce((itemTotal, item) => itemTotal + item.price * item.quantity, 0), 0).toFixed(2) : '0.00' }}</text>
            </view>
            <view class="divider"></view>
            <view class="amount-item" v-if="orderInfo.shopId">
              <text>订单总额</text>
              <text class="amount highlight">¥{{ partsInfo ? partsInfo.reduce((total, part) => total + part.actualAmount, 0).toFixed(2) : orderInfo.transportFee.toFixed(2) }}</text>
            </view>
            <view class="amount-item" v-else>
              <text>订单总额</text>
              <text class="amount highlight">¥{{ orderInfo.transportFee.toFixed(2) }}</text>
            </view>
          </view>
          
          <!-- 底部占位，确保内容不被底部按钮遮挡 -->
          <view style="height: 20rpx;"></view>
        </view>
      </scroll-view>
      
      <!-- 底部操作按钮 -->
      <view class="footer">
        <template v-if="getOrderButtons(orderInfo.status).length > 0">
          <view 
            class="action-btn"
            v-for="(btn, index) in getOrderButtons(orderInfo.status)"
            :key="index"
            :class="{ primary: btn.primary }"
            @click="handleAction(btn.action)"
          >
            {{ btn.text }}
          </view>
        </template>
        <view v-else-if="orderInfo.status === '0' && orderInfo.statusDetail === '0'" class="waiting-tip">
          <text>{{ orderInfo.shopId ? '商家将尽快回复，请耐心等待' : '等候商家抢单' }}</text>
        </view>
      </view>
    </template>
    
    <!-- 加载状态 -->
    <view v-else class="loading-state">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
import api from '@/api/index.js'
import request from '@/utils/request'

const ORDER_STATUS = {
  PENDING_PAY: 0,    // 待付款
  IN_PROGRESS: 4,    // 进行中
  COMPLETED: 2,      // 已完成
  CANCELLED: 3       // 已取消
}

export default {
  data() {
    return {
      orderId: '',
      orderInfo: null,
      loading: true,
      refreshing: false,
      baseUrl: request.BASE_URL_OSS,
      pollingTimer: null,  // 添加轮询定时器
      partsInfo: null,  // 添加配件信息字段
      isPlaying: false,  // 添加播放状态
      audioContext: null  // 添加音频上下文
    }
  },
  
  onLoad(options) {
    if (options.orderId) {
      this.orderId = options.orderId
      this.getOrderDetail()
      this.getPartsInfo()  // 添加获取配件信息的调用
      // 开始轮询检查商家回复
      this.startPolling()
    }
  },
  
  onUnload() {
    // 页面卸载时清除存储的订单信息和轮询定时器
    uni.removeStorageSync('currentOrder')
    this.stopPolling()
  },
  
  methods: {
    // 开始轮询
    startPolling() {
      // 如果订单状态是进行中且等待商家回复，才开始轮询
      if (this.orderInfo && this.orderInfo.status === '0' && this.orderInfo.statusDetail === '0') {
        this.pollingTimer = setInterval(async () => {
          try {
            const res = await api.repair.getMerchantResponse({ orderId: this.orderId })
            if (res.code === 200) {
              // data为false表示商家未回复，有msg表示商家已回复
              if (res.data === false) {
                return // 继续轮询
              }
              // 商家已回复
              if (res.msg) {
                // 刷新订单详情
                this.getOrderDetail()
                // 停止轮询
                this.stopPolling()
                // 提示用户
                uni.showToast({
                  title: res.msg,
                  icon: 'none',
                  duration: 3000
                })
              }
            }
          } catch (err) {
            console.error('检查商家回复失败:', err)
          }
        }, 5000) // 每5秒检查一次
      }
    },
    
    // 停止轮询
    stopPolling() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer)
        this.pollingTimer = null
      }
    },
    
    // 获取订单详情
    async getOrderDetail() {
      this.loading = true
      try {
        const res = await api.repair.getOrderDetail(this.orderId)
        if (res.code === 200) {
          this.orderInfo = res.data
          // 如果订单状态不是等待商家回复，停止轮询
          if (this.orderInfo.status !== '0' || this.orderInfo.statusDetail !== '0') {
            this.stopPolling()
          } else {
            // 只有在等待商家回复状态才开始轮询
            this.startPolling()
          }
        } else {
          uni.showToast({
            title: res.msg || '获取订单详情失败',
            icon: 'none'
          })
        }
      } catch (err) {
        console.error('获取订单详情失败:', err)
        uni.showToast({
          title: '获取订单详情失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 获取配件信息
    async getPartsInfo() {
      try {
        const res = await api.repair.getRepairParts(1, this.orderId)
        if (res.code === 200) {
          this.partsInfo = res.data
        } else {
          uni.showToast({
            title: res.msg || '获取配件信息失败',
            icon: 'none'
          })
        }
      } catch (err) {
        console.error('获取配件信息失败:', err)
        uni.showToast({
          title: '获取配件信息失败',
          icon: 'none'
        })
      }
    },
    
    // 修改获取状态文本的方法
    getStatusText(status) {
      const statusMap = {
        '0': '进行中',
        '1': '已完成',
        '2': '已取消'
      }
      return statusMap[status] || '未知状态'
    },
    getStatusDetailText(statusDetail) {
      const statusDetailMap = {
        '0': '等待商家回复',
        '1': '商家已回复，待购买配件',
        '2': '已购买配件，待维修'
      }
      return statusDetailMap[statusDetail] || '已结束'
    },
    
    // 修改获取状态描述的方法
    getStatusDesc(status) {
      // 如果订单状态是进行中，则根据statusDetail显示详细状态
      if (status === '0') {
        if (this.orderInfo.statusDetail === '0') {
          return this.orderInfo.shopId ? '等待商家回复' : '等候商家抢单'
        }
        const statusDetailMap = {
          '1': '商家已回复，待购买配件',
          '2': '已购买配件，待维修'
        }
        return statusDetailMap[this.orderInfo.statusDetail] || '维修进行中'
      }
      
      const descMap = {
        '1': '订单已完成',
        '2': '订单已取消'
      }
      return descMap[status] || ''
    },
    
    // 获取支付状态文本
    getPayStatusText(payStatus) {
      const statusMap = {
        '0': '未支付',
        '1': '已支付',
        '2': '已退款'
      }
      return statusMap[payStatus] || '未知状态'
    },
    
    // 获取维修状态文本
    getRepairStatusText(repairStatus) {
      const statusMap = {
        '0': '待维修',
        '1': '维修中',
        '2': '已完成'
      }
      return statusMap[repairStatus] || '未知状态'
    },
    
    // 获取完整的图片URL
    getFullImageUrl(url) {
      if (!url) return ''
      if (url.startsWith('http')) return url
      return this.baseUrl + url
    },
    
    // 预览图片
    previewImage(current, urls) {
      const fullUrls = urls.map(url => this.getFullImageUrl(url))
      uni.previewImage({
        current: this.getFullImageUrl(current),
        urls: fullUrls
      })
    },
    
    // 播放语音
    playVoice(voicePath) {
      if (this.isPlaying) {
        // 如果正在播放，则停止
        if (this.audioContext) {
          this.audioContext.stop()
          this.audioContext = null
        }
        this.isPlaying = false
        return
      }
      
      this.audioContext = uni.createInnerAudioContext()
      this.audioContext.src = this.getFullImageUrl(voicePath)
      this.audioContext.onPlay(() => {
        this.isPlaying = true
      })
      this.audioContext.onEnded(() => {
        this.isPlaying = false
        this.audioContext = null
      })
      this.audioContext.onError(() => {
        this.isPlaying = false
        this.audioContext = null
        uni.showToast({
          title: '播放失败',
          icon: 'none'
        })
      })
      this.audioContext.play()
    },
    
    // 修改获取订单按钮的方法
    getOrderButtons(status) {
      // 如果订单状态是进行中，根据statusDetail显示不同按钮
      if (status === '0') {
        const statusDetailBtnMap = {
          '0': [], // 等待商家回复时不显示按钮
          '1': [{ text: '查看回复', action: 'checkReply', primary: true }], // 商家已回复，显示查看回复按钮
          '2': [
            { text: '查看回复', action: 'checkReply' },
            { text: '查看已购配件', action: 'checkParts', primary: true }
          ] // 已购买配件待维修时显示两个按钮
        }
        return statusDetailBtnMap[this.orderInfo.statusDetail] || []
      }
      
      // 其他状态的按钮
      const btnMap = {
        // '1': [{ text: '删除订单', action: 'delete' }], // 已完成
        // '2': [{ text: '删除订单', action: 'delete' }]  // 已取消
      }
      return btnMap[status] || []
    },
    
    // 处理按钮操作
    handleAction(action) {
      const actionMap = {
        delete: this.deleteOrder,
        checkReply: this.checkReply,
        checkParts: this.checkParts
      }
      
      if (actionMap[action]) {
        actionMap[action]()
      }
    },
    
    // 添加查看已购配件方法
    checkParts() {
      uni.navigateTo({
        url: `/pages/repairParts/repairParts?type=1&orderId=${this.orderInfo.orderId}`
      })
    },
    
    // 添加查看回复方法
    async checkReply() {
      try {
        const res = await api.repair.getMerchantResponse({
          orderId: this.orderInfo.orderId
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
            description: this.orderInfo.description,
            merchantResponse: res.data.merchantResponse,
            images: this.orderInfo.images,
            voicePath: this.orderInfo.voicePath,
            voiceDuration: this.orderInfo.voiceDuration,
            shopId: this.orderInfo.shopId,
            repairOrderId: this.orderInfo.orderId,
            shopName: this.orderInfo.shopName,
            transportFee: res.data.transportFee,
            needTransport: res.data.needTransport,
          }))
          uni.navigateTo({
            url: `/packageMerchant/pages/merchantReply/merchantReply?orderInfo=${orderInfo}`
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
    
    // 联系商家
    contactShop() {
      if (!this.orderInfo.tel) {
        uni.showToast({
          title: '暂无商家联系电话',
          icon: 'none'
        })
        return
      }
      
      uni.makePhoneCall({
        phoneNumber: this.orderInfo.tel,
        fail: () => {
          uni.showToast({
            title: '拨打电话失败',
            icon: 'none'
          })
        }
      })
    },
    
    // 复制订单号
    copyOrderId() {
      uni.setClipboardData({
        data: this.orderInfo.orderId,
        success: () => {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          })
        }
      })
    },
    
    // 计算商品总额
    getTotalAmount() {
      return this.orderInfo.goods.reduce((total, goods) => {
        return total + (goods.price * goods.quantity)
      }, 0)
    },
    
    // 订单操作方法
    cancelOrder() {
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
    
    payOrder() {
      uni.navigateTo({
        url: `/pages/payment/payment?orderId=${this.orderInfo.id}`
      })
    },
    
    viewProgress() {
      uni.navigateTo({
        url: `/pages/repairProgress/repairProgress?orderId=${this.orderInfo.id}`
      })
    },
    
    deleteOrder() {
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
    
    rebuyOrder() {
      // 处理再次购买逻辑
    },
    
    // 下拉刷新
    async onRefresh() {
      this.refreshing = true
      await Promise.all([
        this.getOrderDetail(),
        this.getPartsInfo()
      ])
      this.refreshing = false
    }
  }
}
</script>

<style lang="scss" scoped>
.order-detail {
  min-height: 100vh;
  height: 100vh;
  background: #f8f9fc;
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: 100rpx;
  box-sizing: border-box;
  
  .order-scroll {
    flex: 1;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    
    ::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
      color: transparent;
    }
  }
  
  .content-wrapper {
    padding: 0 24rpx 40rpx;
    box-sizing: border-box;
  }
  
  .status-section {
    background: linear-gradient(135deg, #FF6B00, #FF9500);
    padding: 48rpx 32rpx;
    color: #fff;
    position: relative;
    overflow: hidden;
    
    &::after {
      content: '';
      position: absolute;
      right: -20rpx;
      top: -20rpx;
      width: 200rpx;
      height: 200rpx;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }
    
    .status-text {
      font-size: 40rpx;
      font-weight: bold;
      margin-bottom: 16rpx;
      display: block;
      position: relative;
      z-index: 1;
    }
    
    .status-desc {
      font-size: 28rpx;
      opacity: 0.9;
      position: relative;
      z-index: 1;
    }
  }
  
  .repair-info,
  .shop-section,
  .contact-section,
  .order-info,
  .amount-section {
    background: #fff;
    margin-top: 24rpx;
    padding: 32rpx;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
  }
  
  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    margin-bottom: 24rpx;
    color: #333;
    display: flex;
    align-items: center;
    
    &::before {
      content: '';
      width: 6rpx;
      height: 28rpx;
      background: #FF6B00;
      margin-right: 16rpx;
      border-radius: 3rpx;
    }
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24rpx;
    line-height: 1.5;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      color: #666;
      font-size: 28rpx;
      min-width: 140rpx;
      margin-right: 20rpx;
    }
    
    .value {
      color: #333;
      font-size: 28rpx;
      flex: 1;
      text-align: right;
    }
    
    .value-wrap {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      
      .value {
        color: #333;
        font-size: 28rpx;
      }
      
      .copy-btn {
        margin-left: 20rpx;
        color: #FF6B00;
        font-size: 26rpx;
        background: rgba(255, 107, 0, 0.1);
        padding: 4rpx 16rpx;
        border-radius: 20rpx;
      }
    }
  }
  
  .images-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-top: 24rpx;
    
    image {
      width: 216rpx;
      height: 216rpx;
      border-radius: 12rpx;
      background: #f8f9fc;
    }
  }
  
  .voice-wrapper {
    margin-top: 24rpx;
    
    .voice-player {
      display: flex;
      align-items: center;
      background: #f8f9fc;
      padding: 20rpx 32rpx;
      border-radius: 12rpx;
      width: fit-content;
      cursor: pointer;
      
      .voice-waves {
        display: flex;
        align-items: center;
        gap: 6rpx;
        margin-right: 16rpx;
        height: 40rpx;
        
        .wave {
          width: 4rpx;
          height: 16rpx;
          background: #FF6B00;
          border-radius: 2rpx;
          
          &:nth-child(2) {
            height: 24rpx;
          }
          
          &:nth-child(3) {
            height: 16rpx;
          }
        }
        
        &.playing {
          .wave {
            animation: waveAnimation 1s ease-in-out infinite;
            
            &:nth-child(2) {
              animation-delay: 0.2s;
            }
            
            &:nth-child(3) {
              animation-delay: 0.4s;
            }
          }
        }
      }
      
      text {
        color: #666;
        font-size: 28rpx;
      }
      
      &:active {
        opacity: 0.8;
      }
    }
  }
  
  @keyframes waveAnimation {
    0%, 100% {
      transform: scaleY(1);
    }
    50% {
      transform: scaleY(1.5);
    }
  }
  
  .shop-section {
    .shop-info {
      display: flex;
      align-items: flex-start;
      margin-bottom: 24rpx;
      
      image {
        width: 48rpx;
        height: 48rpx;
        margin-right: 20rpx;
        padding: 8rpx;
        background: #f8f9fc;
        border-radius: 8rpx;
        flex-shrink: 0;
      }
      
      .shop-detail {
        flex: 1;
        overflow: hidden;
        
        .shop-name {
          font-size: 32rpx;
          color: #333;
          font-weight: 600;
          margin-bottom: 12rpx;
          display: block;
        }
        
        .shop-address {
          font-size: 26rpx;
          color: #666;
          line-height: 1.4;
          display: block;
          word-break: break-all;
        }
      }
    }
    
    .contact-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20rpx 40rpx;
      border: 1rpx solid #eee;
      border-radius: 40rpx;
      background: #f8f9fc;
      
      image {
        width: 32rpx;
        height: 32rpx;
        margin-right: 12rpx;
      }
      
      text {
        font-size: 28rpx;
        color: #333;
      }
      
      &:active {
        opacity: 0.8;
      }
    }
  }
  
  .amount-section {
    .amount-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;
      
      text {
        font-size: 28rpx;
        color: #666;
        
        &:last-child {
          color: #333;
          font-weight: 500;
        }
      }
      
      .amount {
        color: #333;
        font-weight: 500;
        
        &.highlight {
          color: #FF6B00;
          font-size: 36rpx;
          font-weight: bold;
        }
      }
    }
    
    .divider {
      height: 2rpx;
      background: #f5f5f5;
      margin: 16rpx 0;
    }
  }
  
  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100rpx;
    background: #fff;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 32rpx;
    gap: 24rpx;
    box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
    z-index: 99;
    
    .waiting-tip {
      flex: 1;
      text-align: center;
      color: #999;
      font-size: 28rpx;
    }
    
    .action-btn {
      min-width: 180rpx;
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 40rpx;
      border: 1rpx solid #eee;
      border-radius: 36rpx;
      font-size: 28rpx;
      color: #666;
      background: #fff;
      
      &.primary {
        background: linear-gradient(135deg, #FF6B00, #FF9500);
        color: #fff;
        border: none;
        font-weight: 500;
      }
      
      &:active {
        opacity: 0.9;
        transform: scale(0.98);
      }
    }
  }
  
  .loading-state {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    
    text {
      color: #999;
      font-size: 28rpx;
    }
  }
}
</style> 