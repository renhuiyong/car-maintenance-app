<template>
    <view class="merchant-container">
      <!-- 页面内容区域 -->
      <view class="content-wrapper">
        <supply-chain-index  v-if="currentTab === 0" />
        <supply-chain-shop  v-if="currentTab === 1" />
        <supply-chain-my  v-if="currentTab === 2" />
      </view>
      
      <!-- 自定义tabbar -->
      <supply-chain-tabbar
        :current="currentTab" 
        @change="handleChange"
      />
    </view>
  </template>
  
  <script>
  import SupplyChainIndex from '../supplyChainIndex/supplyChainIndex.vue'
  import SupplyChainShop from '../supplyChainShop/supplyChainShop.vue'
  import SupplyChainMy from '../supplyChainMy/supplyChainMy.vue'
  import SupplyChainTabbar from '../../components/supply-chain-tabbar/supply-chain-tabbar.vue'
  
  export default {
    name: 'merchant',
    components: {
      SupplyChainIndex,
      SupplyChainShop,
      SupplyChainMy,
      SupplyChainTabbar
    },
    data() {
      return {
        currentTab: 2
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