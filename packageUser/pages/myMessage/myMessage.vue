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
    <scroll-view 
      class="message-list" 
      scroll-y 
      @scrolltolower="loadMore"
      :style="{ height: 'calc(100vh - 100rpx)' }"
    >
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
      
      <!-- 加载状态 -->
      <view class="loading-state" v-if="loading">
        <text>加载中...</text>
      </view>
      <view class="no-more" v-if="!hasMore && filteredMessages.length > 0">
        <text>没有更多数据了</text>
      </view>
    </scroll-view>

    <!-- 空状态展示 -->
    <view class="empty-state" v-if="filteredMessages.length === 0">
      <image 
        class="empty-image" 
        src="/static/images/empty.png"
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
import api from '../../../api/index.js'

export default {
  data() {
    return {
      currentTab: 'unread',
      currentMessage: {},
      messageList: [],
      pageNum: 1,
      pageSize: 10,
      loading: false,
      hasMore: true,
      type: 0
    }
  },
  computed: {
    filteredMessages() {
      return this.messageList.filter(msg => 
        this.currentTab === 'unread' ? msg.status === 0 : msg.status === 1
      )
    }
  },
  methods: {
    switchTab(tab) {
      this.currentTab = tab
      this.pageNum = 1
      this.hasMore = true
      this.getMessageList()
    },
    async getMessageList(isLoadMore = false) {
      if (this.loading) return
      
      try {
        this.loading = true
        const apiMethod = this.type === 0 ? api.user.getNotificationList : api.merchant.getNotificationList
        const res = await apiMethod({
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          status: this.currentTab === 'unread' ? 0 : 1
        })
        
        if (res.code === 200 && res.rows) {
          const newMessages = res.rows.map(item => ({
            title: item.title,
            content: item.content,
            isRead: item.status === 1,
            time: item.createTime,
            id: item.id,
            businessId: item.businessId,
            businessType: item.businessType,
            status: item.status
          }))
          
          if (isLoadMore) {
            this.messageList = [...this.messageList, ...newMessages]
          } else {
            this.messageList = newMessages
          }
          
          // 判断是否还有更多数据
          this.hasMore = res.rows.length === this.pageSize
        }
      } catch (err) {
        console.error('Get message list error:', err)
        if (!isLoadMore) {
          this.messageList = []
        }
      } finally {
        this.loading = false
      }
    },
    
    async loadMore() {
      if (!this.hasMore || this.loading) return
      this.pageNum++
      await this.getMessageList(true)
    },
    
    showMessageDetail(item) {
      this.currentMessage = item
      this.$refs.messagePopup.open()
    },
    async closePopup() {
      if (this.currentMessage && this.currentMessage.status === 0) {
        try {
          const apiMethod = api.merchant.readNotification
          const res = await apiMethod(this.currentMessage.id)
          if (res.code === 200) {
            this.getMessageList()
          }
        } catch (err) {
          console.error('Update message status error:', err)
        }
      }
      this.$refs.messagePopup.close()
    }
  },
  onLoad(options) {
    this.type = Number(options.type || -1)
    
    this.getMessageList()
    
    if (options.autoOpen) {
      const selectedMessage = uni.getStorageSync('selectedMessage')
      if (selectedMessage) {
        this.currentMessage = JSON.parse(selectedMessage)
        setTimeout(() => {
          this.$refs.messagePopup.open()
          uni.removeStorageSync('selectedMessage')
        }, 100)
      }
    }
  },
  onUnload() {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.emit('refreshMessages')
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
  box-sizing: border-box;

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

.loading-state, .no-more {
  text-align: center;
  padding: 20rpx 0;
  
  text {
    font-size: 24rpx;
    color: #999;
  }
}
</style> 