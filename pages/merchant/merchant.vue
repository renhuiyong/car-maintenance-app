<template>
  <view class="merchant-container">
    <!-- 页面内容区域 -->
    <view class="content-wrapper">
      <my-shop v-if="currentTab === 0" />
      <shop v-if="currentTab === 1" />
      <grab-order v-if="currentTab === 2" />
      <merchant-my v-if="currentTab === 3" />
    </view>
    
    <!-- 自定义tabbar -->
    <merchant-tabbar 
      :current="currentTab" 
      @change="handleChange"
    />
  </view>
</template>

<script>
import MyShop from '../myShop/myShop.vue'
import Shop from '../shop/shop.vue'
import GrabOrder from '../grabOrder/grabOrder.vue'
import MerchantMy from '../merchantMy/merchantMy.vue'
import MerchantTabbar from '../../components/merchant-tabbar/merchant-tabbar.vue'

export default {
  name: 'merchant',
  components: {
    MyShop,
    Shop,
    GrabOrder,
    MerchantMy,
    MerchantTabbar
  },
  data() {
    return {
      currentTab: 3
    }
  },
  onShow() {
    // 每次显示页面时检查当前tab
    console.log('当前tab:', this.currentTab)
  },
  methods: {
    handleChange(index) {
      console.log('切换到tab:', index)
      this.currentTab = index
    }
  }
}
</script>

<style lang="scss">
.merchant-container {
  width: 100%;
  min-height: 100vh;
  background: #F7F8FC;
  position: relative;
}

.content-wrapper {
  width: 100%;
  min-height: 100vh;
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
</style>