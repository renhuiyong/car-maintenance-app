<template>
  <view class="merchant-order-reply">
    <!-- 问题描述区域 -->
    <view class="problem-section">
      <view class="section-title">问题描述</view>
      <view class="problem-content">
        <text>{{problemContent}}</text>
        
        <!-- 语音描述 -->
        <view class="voice-desc" v-if="voicePath" @click="playVoice">
          <image src="/static/images/yuyin.png" mode="aspectFit"></image>
          <text>{{voiceDuration}}″</text>
        </view>
        
        <!-- 图片列表 -->
        <view class="image-list" v-if="images && images.length > 0">
          <image 
            v-for="(img, imgIndex) in getImageList(images)" 
            :key="imgIndex"
            :src="getImageUrl(img)"
            mode="aspectFill"
            @click="previewImage(img)"
          ></image>
        </view>
      </view>
    </view>

    <!-- 商家回复区域 -->
    <scroll-view 
      class="reply-section" 
      scroll-y 
      :scroll-top="scrollTop"
      :scroll-with-animation="true"
      :scroll-animation-duration="500"
      id="replyScroll"
    >
      <view class="section-title">商家回复</view>
      <view class="reply-input">
        <textarea 
          v-model="replyContent"
          placeholder="输入回复内容"
          :maxlength="500"
          auto-height
          :style="{ whiteSpace: 'pre-wrap' }"
          @input="handleInput"
          id="replyTextarea"
          adjust-position="false"
          :show-confirm-bar="false"
          :focus="autoFocus"
          :cursor="cursorPosition"
        ></textarea>
      </view>
    </scroll-view>

    <!-- 底部按钮区域 -->
    <view class="bottom-btns">
      <button class="submit-btn" @tap="submitReply">回复</button>
      <button class="mall-btn" @tap="goToSelectParts">{{ hasSelectedParts ? '重新选择' : '选配件' }}</button>
    </view>
  </view>
</template>

<script>
import request from '@/utils/request.js'
import api from '@/api/index.js'

export default {
  data() {
    return {
      orderId: '',
      orderTime: '',
      problemContent: '',
      images: '',
      voicePath: '',
      voiceDuration: 0,
      replyContent: '',
      audioContext: null,
      hasSelectedParts: false,
      scrollTop: 0,
      scrollTimer: null,
      autoFocus: false,
      cursorPosition: -1,
      focusTimer: null
    }
  },

  watch: {
    // 监听replyContent变化
    replyContent(newVal) {
      this.hasSelectedParts = newVal.includes('您此次维修需要购买以下配件');
      // 在内容变化时重置滚动位置到底部
      this.$nextTick(() => {
        this.resetScroll();
        // 如果是从选择配件页面返回，延迟1秒后设置光标位置
        if (this.hasSelectedParts) {
          if (this.focusTimer) {
            clearTimeout(this.focusTimer);
          }
          this.focusTimer = setTimeout(() => {
            this.cursorPosition = newVal.length;
            this.autoFocus = true;
          }, 1000);
        }
      });
    }
  },

  onLoad(options) {
    if (options.params) {
      try {
        const params = JSON.parse(decodeURIComponent(options.params))
        this.orderId = params.orderId
        this.orderTime = params.createTime
        this.problemContent = params.description
        this.images = params.images
        this.voicePath = params.voicePath
        this.voiceDuration = params.voiceDuration

        // 初始化音频播放器
        if (this.voicePath) {
          this.audioContext = uni.createInnerAudioContext()
        }
      } catch (error) {
        console.error('解析参数失败:', error)
        uni.showToast({
          title: '参数错误',
          icon: 'none'
        })
      }
    }
  },

  methods: {
    // 处理图片列表
    getImageList(images) {
      if (!images) return []
      return typeof images === 'string' ? images.split(',') : Array.isArray(images) ? images : []
    },

    // 获取图片完整URL
    getImageUrl(path) {
      if (!path) return '/static/products/shangpin_default.png'
      return path.startsWith('http') ? path : request.BASE_URL + path
    },

    // 预览图片
    previewImage(current) {
      const imageList = this.getImageList(this.images)
      const urls = imageList.map(img => this.getImageUrl(img))
      uni.previewImage({
        current: this.getImageUrl(current),
        urls
      })
    },

    // 播放语音
    playVoice() {
      if (!this.voicePath) return
      
      if (this.audioContext.src === request.BASE_URL + this.voicePath) {
        if (this.audioContext.paused) {
          this.audioContext.play()
        } else {
          this.audioContext.pause()
        }
      } else {
        this.audioContext.src = request.BASE_URL + this.voicePath
        this.audioContext.play()
      }
    },

    // 提交回复
    async submitReply() {
      if (!this.replyContent.trim()) {
        uni.showToast({
          title: '请输入回复内容',
          icon: 'none'
        })
        return
      }

      try {
        // 将回复内容中的换行符转换为HTML换行标签
        const formattedContent = this.replyContent.replace(/\n/g, '<br>');
        
        const res = await api.merchant.merchantToResponse({
          orderId: this.orderId,
          replyContent: formattedContent
        })

        if (res.code === 200) {
          uni.showToast({
            title: '回复成功',
            icon: 'success'
          })
          
          // 获取页面实例
          const pages = getCurrentPages()
          // 获取上一页实例
          const prevPage = pages[pages.length - 2]
          // 调用上一页的onLoad方法刷新数据
          if (prevPage && prevPage.onLoad) {
            prevPage.onLoad(prevPage.options)
          }
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: res.msg || '回复失败',
            icon: 'none'
          })
        }
      } catch (err) {
        console.error('提交回复失败:', err)
        const errMsg = err.response?.data?.msg || err.msg || '提交回复失败'
        uni.showToast({
          title: errMsg,
          icon: 'none'
        })
      }
    },

    // 跳转到选择配件页面
    goToSelectParts() {
      // 记录当前是否已有配件信息
      const hadParts = this.hasSelectedParts;
      uni.navigateTo({
        url: '/pages/merchantShopSelect/merchantShopSelect'
      });
    },

    // 修改重置滚动位置的方法
    resetScroll() {
      // 清除之前的定时器
      if (this.scrollTimer) {
        clearTimeout(this.scrollTimer);
      }
      
      // 设置的定时器，确保在内容渲染完成后执行
      this.scrollTimer = setTimeout(() => {
        const query = uni.createSelectorQuery().in(this);
        query.select('#replyTextarea').boundingClientRect(data => {
          if (data) {
            // 通过修改 scrollTop 触发滚动
            this.scrollTop = data.height * 2; // 乘以2确保滚动到底部
          }
        }).exec();
      }, 300);
    },

    // 处理输入事件
    handleInput() {
      // 在输入时也重置滚动位置
      this.resetScroll();
    },

    // 添加设置光标位置的方法
    focusTextarea() {
      const query = uni.createSelectorQuery().in(this);
      query.select('#replyTextarea').context((res) => {
        if (res && res.context) {
          res.context.focus();
          // 设置光标位置到末尾
          res.context.setSelectionRange(this.replyContent.length, this.replyContent.length);
        }
      }).exec();
    }
  },

  // 组件销毁时清除定时器
  beforeDestroy() {
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
    }
    if (this.focusTimer) {
      clearTimeout(this.focusTimer);
    }
  }
}
</script>

<style lang="scss" scoped>
.merchant-order-reply {
  height: 100vh;
  background-color: #F7F8FC;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 20rpx 20rpx 0;
  
  .problem-section {
    flex-shrink: 0;
    background-color: #fff;
    padding: 30rpx;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.02);
    
    .section-title {
      font-size: 30rpx;
      color: #333;
      margin-bottom: 24rpx;
      font-weight: 500;
    }
    
    .problem-content {
      font-size: 28rpx;
      color: #333;
      line-height: 1.6;
      display: flex;
      flex-direction: column;
      
      text {
        display: inline-block;
        color: #666;
      }
      
      .voice-desc {
        display: inline-flex;
        align-items: center;
        background: #F7F7F7;
        padding: 16rpx 30rpx;
        border-radius: 40rpx;
        margin: 24rpx 0;
        width: fit-content;
        cursor: pointer;
        transition: all 0.2s;
        
        &:active {
          opacity: 0.8;
        }
        
        image {
          width: 32rpx;
          height: 32rpx;
          margin-right: 16rpx;
        }
        
        text {
          font-size: 26rpx;
          color: #666;
        }
      }
      
      .image-list {
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;
        margin-top: 24rpx;
        
        image {
          width: 200rpx;
          height: 200rpx;
          border-radius: 12rpx;
          transition: opacity 0.2s;
          
          &:active {
            opacity: 0.8;
          }
        }
      }
    }
  }

  .reply-section {
    flex: 1;
    height: 0;
    padding-bottom: 140rpx;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    background-color: #fff;
    padding: 30rpx;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.02);
    
    .section-title {
        font-size: 30rpx;
        color: #333;
        margin-bottom: 24rpx;
        font-weight: 500;
    }
    
    .reply-input {
        background: #fff;
        
        textarea {
            width: 100%;
            min-height: 300rpx;
            font-size: 28rpx;
            color: #333;
            padding: 20rpx;
            background: #F7F8FC;
            border-radius: 12rpx;
            white-space: pre-wrap;
            word-break: break-all;
            
            &::placeholder {
                color: #999;
            }
        }
    }
  }

  .bottom-btns {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 20rpx 30rpx;
    display: flex;
    justify-content: space-between;
    gap: 24rpx;
    background: #fff;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
    z-index: 100;
    
    button {
      flex: 1;
      height: 96rpx;
      line-height: 96rpx;
      font-size: 32rpx;
      font-weight: 500;
      border-radius: 20rpx;
      transition: all 0.2s;
      border: none;
      letter-spacing: 2rpx;
      
      &::after {
        border: none;
      }
      
      &:active {
        transform: scale(0.98);
        opacity: 0.9;
      }
      
      &.submit-btn {
        background: linear-gradient(135deg, #FF9650 0%, #FF7B2F 100%);
        color: #fff;
        box-shadow: 0 8rpx 16rpx rgba(255, 150, 80, 0.25);
      }
      
      &.mall-btn {
        background: linear-gradient(135deg, #5C8AFF 0%, #4E7CFF 100%);
        color: #fff;
        box-shadow: 0 8rpx 16rpx rgba(78, 124, 255, 0.25);
      }
    }
  }
}
</style> 