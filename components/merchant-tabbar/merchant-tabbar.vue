<template>
  <view class="custom-tabbar-wrapper">
    <view class="custom-tabbar">
      <view 
        v-for="(item, index) in tabList" 
        :key="index"
        class="tab-item"
        :class="{ active: currentTab === index }"
        @tap="switchTab(index)"
      >
        <image :src="currentTab === index ? item.selectedIcon : item.icon" class="tab-icon"></image>
        <text class="tab-text">{{ item.text }}</text>
      </view>
    </view>
    <view class="safe-area"></view>
  </view>
</template>

<script>
import { merchantTabList } from '../../config/tabList.js'

export default {
  name: 'merchant-tabbar',
  props: {
    current: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      tabList: merchantTabList,
      currentTab: this.current
    }
  },
  watch: {
    current: {
      handler(newVal) {
        this.currentTab = newVal
      },
      immediate: true
    }
  },
  methods: {
    switchTab(index) {
      if (this.currentTab === index) return
      this.currentTab = index
      this.$emit('change', index)
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-tabbar-wrapper {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 999;
}

.custom-tabbar {
  height: 100rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  
  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    
    .tab-icon {
      width: 48rpx;
      height: 48rpx;
      margin-bottom: 4rpx;
      transition: transform 0.2s ease;
    }
    
    .tab-text {
      font-size: 24rpx;
      color: #999;
      transition: color 0.2s ease;
    }
    
    &.active {
      .tab-icon {
        transform: scale(1.1);
      }
      .tab-text {
        color: #4080ff;
        font-weight: 500;
      }
    }
  }
}

.safe-area {
  height: env(safe-area-inset-bottom);
  background: #fff;
}
</style> 