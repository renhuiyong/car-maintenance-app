<template>
  <view class="merchant-entry" @click="goToMerchantDetails">
    <!-- 商家入口的其他内容 -->
  </view>
</template>

<script>
export default {
  name: 'merchant-entry',
  props: {
    merchantId: {
      type: [String, Number],
      default: ''
    }
  },
  methods: {
    goToMerchantDetails() {
      uni.navigateTo({
        url: `/packageMerchant/pages/merchantDetails/merchantDetails?id=${this.merchantId}`
      })
    }
  }
}
</script> 