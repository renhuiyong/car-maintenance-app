<template>
  <view class="message-container">
    <!-- 顶部标签切换 -->
    <view class="tab-container">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'unread' }"
        @click="switchTab('unread')"
      >
        未读
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'read' }"
        @click="switchTab('read')"
      >
        已读
      </view>
    </view>

    <!-- 消息列表 -->
    <view class="message-list">
      <view 
        class="message-item" 
        v-for="(item, index) in filteredMessages" 
        :key="index"
        :class="{ 'message-read': item.isRead }"
        @click="showMessageDetail(item)"
      >
        <view class="message-content">{{ item.title }}</view>
        <view class="message-arrow">
          <image src="/static/images/youjiantou2.png" mode="aspectFit"></image>
        </view>
      </view>
    </view>

    <!-- 空状态展示 -->
    <view class="empty-state" v-if="filteredMessages.length === 0">
      <image 
        class="empty-image" 
        :src="currentTab === 'unread' ? '/static/my/zanwuweidu.png' : '/static/my/empty-message.png'" 
        mode="aspectFit"
      ></image>
      <text class="empty-text">暂无消息</text>
    </view>

    <!-- 消息详情弹窗 -->
    <uni-popup ref="messagePopup" type="center">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">{{ currentMessage.title }}</text>
        </view>
        <view class="popup-info">
          <text class="time">{{ currentMessage.time || '2024-03-21 14:30' }}</text>
        </view>
        <scroll-view class="popup-body" scroll-y>
          <text class="content">{{ currentMessage.content || '消息内容' }}</text>
        </scroll-view>
        <view class="popup-footer">
          <view class="btn" @click="closePopup">关闭</view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTab: 'unread',
      currentMessage: {},
      messageList: [
        { 
          title: '您的订单已收货',
          isRead: false,
          content: '尊敬的用户您好，您的维修订单已完成配送，感谢您的使用。如有任何问题，请及时联系客服。'
        },
        { 
          title: '您的订单未付��',
          isRead: false,
          content: '您的维修订单尚未支付，请及时完成支付，以免订单自动取消。'
        },
        { 
          title: '最新活动通知，请查看活动详情',
          isRead: false,
          content: '亲爱的用户，平台正在开展新一轮优惠活动，点击查看详情了解更多优惠信息。'
        },
        { 
          title: '您收到一笔推广佣金',
          isRead: false,
          content: '恭喜您获得推广佣金奖励，可以在"我的资产"中查看详情。'
        },
        { 
          title: '您的维修订单已完成',
          isRead: true,
          content: '您的维修订单已完成服务，如对服务不满意，请及时反馈。'
        },
        { 
          title: '系统升级通知',
          isRead: true,
          content: '为了给您提供更好的服务体验，系统将于本周六凌晨2点进行例行升级维护，预计耗时2小时，给您带来的不便敬请谅解。'
        },
        { 
          title: '您的优惠券即将到期',
          isRead: true,
          content: '您有张优惠券即将在本周日到期，请及时使用，避免浪费。'
        },
        { 
          title: '感谢您的使用，您的反馈已收到',
          isRead: true,
          content: '感谢您的反馈，我们会认真处理您的建议，不断改进服务质量。'
        }
      ]
    }
  },
  computed: {
    filteredMessages() {
      return this.messageList.filter(msg => 
        this.currentTab === 'unread' ? !msg.isRead : msg.isRead
      )
    }
  },
  methods: {
    switchTab(tab) {
      this.currentTab = tab
      // 这里可以根据tab类型请求不同的消息列表
      this.getMessageList(tab)
    },
    getMessageList(type) {
      // TODO: 调用接口获取消息列表
    },
    showMessageDetail(item) {
      this.currentMessage = item
      this.$refs.messagePopup.open()
    },
    closePopup() {
      // 如果是未读消息，关闭弹窗时标记为已读
      if (this.currentMessage && !this.currentMessage.isRead) {
        // 更新当前消息的已读状态
        this.currentMessage.isRead = true
        
        // 在消息列表中找到并更新对应消息的已读状态
        const messageIndex = this.messageList.findIndex(msg => 
          msg.title === this.currentMessage.title && 
          msg.content === this.currentMessage.content
        )
        
        if (messageIndex !== -1) {
          this.messageList[messageIndex].isRead = true
          
          // 将更新后的消息列表保存到本地存储，以便在 my 页面使用
          uni.setStorageSync('messageList', JSON.stringify(this.messageList))
          
          // TODO: 调用接口更新消息状态
        }
      }
      this.$refs.messagePopup.close()
    }
  },
  onLoad(options) {
    // 获取本地存储的消息列表
    const storedMessages = uni.getStorageSync('messageList')
    if (storedMessages) {
      this.messageList = JSON.parse(storedMessages)
    }
    
    // 检查是否需要自动打开消息详情
    if (options.autoOpen) {
      const selectedMessage = uni.getStorageSync('selectedMessage')
      if (selectedMessage) {
        this.currentMessage = JSON.parse(selectedMessage)
        // 延迟一下再打开弹窗，确保组件已经完全加载
        setTimeout(() => {
          this.$refs.messagePopup.open()
          // 清除存储的消息数据
          uni.removeStorageSync('selectedMessage')
        }, 100)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.message-container {
  min-height: 100vh;
  background-color: #f5f6fa;
}

.tab-container {
  display: flex;
  background-color: #fff;
  padding: 20rpx 40rpx;
  border-bottom: 1rpx solid #eee;

  .tab-item {
    flex: 1;
    text-align: center;
    font-size: 28rpx;
    color: #666;
    position: relative;
    padding: 20rpx 0;

    &.active {
      color: #2b5cff;
      font-weight: 500;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 4rpx;
        background-color: #2b5cff;
        border-radius: 2rpx;
      }
    }
  }
}

.message-list {
  padding: 20rpx;

  .message-item {
    background-color: #fff;
    border-radius: 12rpx;
    padding: 30rpx;
    margin-bottom: 2rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .message-content {
      font-size: 28rpx;
      color: #333;
      flex: 1;
      margin-right: 20rpx;
    }

    .message-arrow {
      image {
        width: 24rpx;
        height: 24rpx;
      }
    }

    // 已读消息的样式
    &.message-read {
      .message-content {
        color: #999;
      }
      
      .message-arrow {
        opacity: 0.5;
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 300rpx;

  .empty-image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 30rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
    text-align: center;
  }
}

.popup-content {
  width: 560rpx;
  background-color: #fff;
  border-radius: 16rpx;
  
  .popup-header {
    padding: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
    
    .popup-title {
      font-size: 32rpx;
      color: #333;
      line-height: 1.4;
      word-break: break-all;
      white-space: normal;
      overflow: visible;
    }
  }
  
  .popup-info {
    padding: 20rpx 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
    
    .time {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .popup-body {
    padding: 30rpx;
    max-height: 400rpx;
    
    .content {
      font-size: 28rpx;
      color: #333;
      line-height: 1.6;
      display: block;
      width: 93%;
      box-sizing: border-box;
      word-wrap: break-word;
      word-break: break-all;
      white-space: pre-line;
      padding-right: 10rpx;
    }
  }
  
  .popup-footer {
    padding: 20rpx 30rpx;
    border-top: 1rpx solid #f5f5f5;
    
    .btn {
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      font-size: 28rpx;
      color: #333;
      background: #f5f5f5;
      border-radius: 8rpx;
    }
  }
}
</style> 