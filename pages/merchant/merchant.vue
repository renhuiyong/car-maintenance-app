<template>
  <view class="merchant-container">
    <!-- 页面内容区域 -->
    <view class="content-wrapper">
      <my-shop v-if="currentTab === 0" />
      <merchant-shop v-if="currentTab === 1" />
      <order-grabbing-hall v-if="currentTab === 2" />
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
import MerchantShop from '../merchantShop/merchantShop.vue'
import OrderGrabbingHall from '../orderGrabbingHall/orderGrabbingHall.vue'
import MerchantMy from '../merchantMy/merchantMy.vue'
import MerchantTabbar from '../../components/merchant-tabbar/merchant-tabbar.vue'

export default {
  name: 'merchant',
  components: {
    MyShop,
    MerchantShop,
    OrderGrabbingHall,
    MerchantMy,
    MerchantTabbar
  },
  data() {
    return {
      currentTab: 3
    }
  },
  created() {
    console.log('merchant created')
  },
  mounted() {
    console.log('merchant mounted')
  },
  onLoad() {
    console.log('merchant page loaded, currentTab:', this.currentTab)
  },
  onShow() {
    // 每次显示页面时检查当前tab
    console.log('merchant onShow, currentTab:', this.currentTab)
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