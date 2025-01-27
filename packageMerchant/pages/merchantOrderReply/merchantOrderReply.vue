<template>
  <view class="merchant-order-reply">
    <!-- 问题描述区域 -->
    <view class="problem-section">
      <view class="section-title">问题描述</view>
      <view class="problem-content">
        <text>{{problemContent}}</text>
        
        <!-- 语音描述 -->
        <view class="voice-desc" v-if="voicePath" @click="playVoice">
          <view class="voice-waves" :class="{ 'playing': isPlaying }">
            <view class="wave"></view>
            <view class="wave"></view>
            <view class="wave"></view>
          </view>
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
      <!-- 托运费输入框 -->
      <view class="transport-fee" v-if="needTransport === 1">
        <view class="fee-title">托运费用</view>
        <view class="fee-display" :class="{ 'disabled': grabStatus === 1 }" @click="grabStatus !== 1 && editTransportFee()">
          <text>¥{{transportFee || '0.00'}}</text>
          <image v-if="grabStatus !== 1" src="/static/images/bianji.png" mode="aspectFit"></image>
        </view>
      </view>
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

    <!-- 添加自定义金额输入弹窗 -->
    <view class="fee-popup" v-if="showFeePopup">
      <view class="popup-mask" @click="showFeePopup = false"></view>
      <view class="popup-content">
        <view class="popup-header">
          <text>修改托运金额</text>
          <text class="close-icon" @click="showFeePopup = false">×</text>
        </view>
        <view class="popup-body">
          <view class="fee-input-box">
            <view class="input-wrapper">
              <text class="currency">¥</text>
              <input 
                type="digit"
                v-model="tempFee"
                class="fee-input"
                placeholder="0.00"
                @input="onFeeInput"
              />
            </view>
            <view class="input-line"></view>
          </view>
        </view>
        <view class="popup-footer">
          <button 
            class="cancel-btn"
            @click="showFeePopup = false"
          >取消</button>
          <button 
            class="confirm-btn" 
            :class="{ 'active': isValidFee }"
            @click="confirmFee"
          >确定</button>
        </view>
      </view>
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
      focusTimer: null,
      needTransport: 0,
      transportFee: '',
      showFeePopup: false,
      tempFee: '',
      isValidFee: false,
      grabStatus: 0,
      isPlaying: false
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
    },
    // 监听transportFee变化
    transportFee(newVal) {
      if (newVal) {
        // 确保 newVal 是字符串类型
        let value = newVal.toString();
        // 移除非数字和小数点
        value = value.replace(/[^\d.]/g, '');
        // 确保只有一个小数点
        const parts = value.split('.');
        if (parts.length > 2) {
          value = parts[0] + '.' + parts.slice(1).join('');
        }
        // 限制小数点后最多2位
        if (parts.length === 2 && parts[1].length > 2) {
          value = parts[0] + '.' + parts[1].slice(0, 2);
        }
        // 如果值发生变化，更新输入框
        if (value !== newVal.toString()) {
          this.transportFee = value;
        }
      }
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
        this.needTransport = params.needTransport
        this.grabStatus = params.grabStatus
        this.transportFee = params.transportFee
        // 初始化音频播放器
        if (this.voicePath) {
          this.audioContext = uni.createInnerAudioContext()
          // 添加音频事件监听
          this.audioContext.onPlay(() => {
            this.isPlaying = true
          })
          this.audioContext.onPause(() => {
            this.isPlaying = false
          })
          this.audioContext.onStop(() => {
            this.isPlaying = false
          })
          this.audioContext.onEnded(() => {
            this.isPlaying = false
          })
          this.audioContext.onError((res) => {
            console.error('音频播放错误:', res)
            uni.showToast({
              title: '音频播放失败',
              icon: 'none'
            })
            this.isPlaying = false
          })
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
    // 编辑托运费
    editTransportFee() {
      this.tempFee = this.transportFee === 0 ? '' : this.transportFee.toString()
      this.showFeePopup = true
      this.isValidFee = this.transportFee > 0
    },

    // 处理费用输入
    onFeeInput(e) {
      const value = e.detail.value
      // 验证输入格式：只允许数字和最多2位小数
      this.isValidFee = /^\d+(\.\d{0,2})?$/.test(value) && Number(value) > 0
    },

    // 确认费用
    confirmFee() {
      if (!this.isValidFee) {
        uni.showToast({
          title: '请输入有效金额',
          icon: 'none'
        })
        return
      }
      this.transportFee = Number(this.tempFee)
      this.showFeePopup = false
    },

    // 处理图片列表
    getImageList(images) {
      if (!images) return []
      return typeof images === 'string' ? images.split(',') : Array.isArray(images) ? images : []
    },

    // 获取图片完整URL
    getImageUrl(path) {
      if (!path) return '/static/products/shangpin_default.png'
      return path.startsWith('http') ? path : request.BASE_URL_OSS + path
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
      if (!this.voicePath || !this.audioContext) return
      
      if (this.audioContext.src === request.BASE_URL_OSS + this.voicePath) {
        if (this.audioContext.paused) {
          this.audioContext.play()
        } else {
          this.audioContext.pause()
        }
      } else {
        this.audioContext.src = request.BASE_URL_OSS + this.voicePath
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

      if (this.needTransport === 1) {
        if (!this.transportFee) {
          uni.showToast({
            title: '请输入托运费用',
            icon: 'none'
          })
          return
        }
        // 验证托运费格式
        const feeRegex = /^\d+(\.\d{1,2})?$/;
        if (!feeRegex.test(this.transportFee)) {
          uni.showToast({
            title: '托运费用格式不正确，请输入数字，最多2位小数',
            icon: 'none'
          })
          return
        }
      }

      try {
        // 将回复内容中的换行符转换为HTML换行标签
        const formattedContent = this.replyContent.replace(/\n/g, '<br>');
        
        const res = await api.merchant.merchantToResponse({
          orderId: this.orderId,
          replyContent: formattedContent,
          transportFee: this.needTransport === 1 ? this.transportFee : undefined
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
          // 如果上一页存在，调用其刷新方法
          if (prevPage) {
            // 优先调用专门的刷新方法
            if (typeof prevPage.refreshData === 'function') {
              prevPage.refreshData()
            } else if (typeof prevPage.onShow === 'function') {
              // 如果没有专门的刷新方法，则调用onShow
              prevPage.onShow()
            }
          }
          
          setTimeout(() => {
            uni.navigateBack({
              delta: 1,
              success: () => {
                // 通过事件总线触发刷新
                uni.$emit('refreshRepairOrderList')
              }
            })
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
        url: '/packageMerchant/pages/merchantShopSelect/merchantShopSelect'
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
    if (this.audioContext) {
      this.audioContext.destroy()
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
        
        .voice-waves {
          display: flex;
          align-items: center;
          margin-right: 16rpx;
          
          .wave {
            width: 4rpx;
            height: 16rpx;
            background: #4468E8;
            margin: 0 4rpx;
            border-radius: 2rpx;
            animation: waveAnimation 1s infinite;
            animation-play-state: paused;
            
            &:nth-child(2) {
              height: 24rpx;
              animation-delay: 0.2s;
            }
            
            &:nth-child(3) {
              height: 32rpx;
              animation-delay: 0.4s;
            }
          }
          
          &.playing {
            .wave {
              animation-play-state: running;
            }
          }
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
    
    .transport-fee {
      margin-bottom: 24rpx;
      background: #F7F8FC;
      padding: 20rpx;
      border-radius: 12rpx;
      
      .fee-title {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 16rpx;
      }
      
      .fee-display {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #fff;
        padding: 20rpx;
        border-radius: 8rpx;
        
        &.disabled {
          background: #F7F7F7;
          cursor: not-allowed;
        }
        
        text {
          font-size: 28rpx;
          color: #333;
        }
        
        image {
          width: 32rpx;
          height: 32rpx;
        }
      }
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

.fee-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;

  .popup-mask {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
  }

  .popup-content {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 640rpx;
    background: #fff;
    border-radius: 24rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .popup-header {
    width: 100%;
    position: relative;
    padding: 40rpx 0;
    text-align: center;
    font-size: 32rpx;
    color: #333;
    font-weight: 500;
    border-bottom: 1rpx solid #f5f5f5;

    .close-icon {
      position: absolute;
      right: 24rpx;
      top: 50%;
      transform: translateY(-50%);
      font-size: 44rpx;
      color: #999;
      padding: 10rpx;
      line-height: 1;
    }
  }

  .popup-body {
    width: 100%;
    padding: 80rpx 60rpx;
    display: flex;
    flex-direction: column;
    align-items: center;

    .fee-input-box {
      width: 100%;
      position: relative;
      padding: 0;

      .input-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40rpx 0;
        min-height: 160rpx;

        .currency {
          font-size: 80rpx;
          line-height: 80rpx;
          color: #333;
          font-family: DINAlternate-Bold, sans-serif;
          font-weight: 500;
          margin-right: 4rpx;
        }

        .fee-input {
          width: 200rpx;
          height: 80rpx;
          font-size: 80rpx !important;
          line-height: 80rpx;
          color: #333;
          font-family: DINAlternate-Bold, sans-serif;
          font-weight: 500;
          text-align: center;
          padding: 0;
          min-height: 0;
          background: transparent;

          &::placeholder {
            color: #ccc;
            font-size: 80rpx;
            text-align: center;
          }
        }
      }

      .input-line {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: 320rpx;
        bottom: 20rpx;
        height: 2rpx;
        background: linear-gradient(to right,
          rgba(255, 149, 0, 0) 0%,
          rgba(255, 149, 0, 0.3) 50%,
          rgba(255, 149, 0, 0) 100%
        );
      }
    }
  }

  .popup-footer {
    width: 100%;
    display: flex;
    padding: 0 40rpx 40rpx;
    gap: 24rpx;
    justify-content: center;

    button {
      flex: 0 0 220rpx;
      height: 80rpx;
      line-height: 80rpx;
      font-size: 32rpx;
      border-radius: 40rpx;
      border: none;
      transition: all 0.2s ease;

      &::after {
        border: none;
      }
    }

    .cancel-btn {
      margin-left: 80rpx;
      background: #F7F8FA;
      color: #666;
      font-weight: 500;

      &:active {
        background: #EBEDF0;
        transform: translateY(2rpx);
      }
    }

    .confirm-btn {
      margin-right: 80rpx;
      background: #CCCCCC;
      color: #fff;
      opacity: 0.8;

      &.active {
        opacity: 1;
        background: linear-gradient(135deg, #FF9500, #FF8100);
        box-shadow: 0 6rpx 16rpx rgba(255, 149, 0, 0.2);

        &:active {
          transform: translateY(2rpx);
          box-shadow: 0 2rpx 8rpx rgba(255, 149, 0, 0.15);
        }
      }
    }
  }
}

@keyframes waveAnimation {
  0% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.4);
  }
  100% {
    transform: scaleY(1);
  }
}
</style> 