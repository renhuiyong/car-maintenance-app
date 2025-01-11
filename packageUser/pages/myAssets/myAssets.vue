<template>
  <view class="assets-container">
    <!-- 顶部资产卡片 -->
    <view class="assets-card">
      <image class="bg-image" src="/static/my/wodezichanbg.png" mode="aspectFill"></image>
      <view class="content">
        <view class="title">佣金资产</view>
        <view class="amount">
          <text class="number">23.0000</text>
        </view>
      </view>
    </view>

    <!-- 资产明细 -->
    <view class="assets-detail">
      <view class="detail-title">资产明细</view>
      <view class="detail-list">
        <view class="detail-item" v-for="(item, index) in transactions" :key="index" @click="showDetail(item)">
          <view class="left">
            <image :src="item.type === 'expense' ? '/static/my/zhichu.png' : '/static/my/shouru.png'" 
                   class="type-icon"></image>
            <view class="info">
              <text class="type-text">{{ item.type === 'expense' ? '支出' : '收入' }}</text>
              <text class="date">{{ item.date }}</text>
            </view>
          </view>
          <view class="right">
            <view class="amount" :class="item.type">
              {{ item.type === 'expense' ? '-' : '+' }}{{ item.amount }}
            </view>
            <image src="/static/images/youjiantou2.png" class="arrow-icon"></image>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部提现按钮 -->
    <view class="bottom-section">
      <button class="withdraw-btn" @click="handleWithdraw">提现</button>
      <view class="rules-text" @click="showRules">查看佣金资产及资产提现规则</view>
    </view>

    <!-- 添加详情弹窗 -->
    <uni-popup ref="detailPopup" type="bottom">
      <view class="detail-popup">
        <view class="popup-header">
          <text>交易详情</text>
          <text class="close-btn" @click="closeDetail">×</text>
        </view>
        <view class="popup-content">
          <view class="detail-row">
            <text class="label">交易类型</text>
            <text class="value">{{ currentDetail.type === 'expense' ? '支出' : '收入' }}</text>
          </view>
          <view class="detail-row">
            <text class="label">交易金额</text>
            <text class="value" :class="currentDetail.type">
              {{ currentDetail.type === 'expense' ? '-' : '+' }}{{ currentDetail.amount }}
            </text>
          </view>
          <view class="detail-row">
            <text class="label">交易时间</text>
            <text class="value">{{ currentDetail.date }}</text>
          </view>
          <view class="detail-row remark-row">
            <text class="label">备注信息</text>
            <text class="value remark">{{ currentDetail.remark || '暂无备注' }}</text>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      transactions: [
        { type: 'expense', amount: '8.0', date: '8月1日 12:00', remark: '维修费用支出' },
        { type: 'income', amount: '7.0', date: '8月1日 12:00', remark: '维修订单收入' },
        { type: 'expense', amount: '6.0', date: '8月1日 12:00', remark: '系统服务费' }
      ],
      currentDetail: {}
    }
  },
  methods: {
    handleWithdraw() {
      // 处理提现逻辑
      uni.showToast({
        title: '提现功能开发中',
        icon: 'none'
      })
    },
    showRules() {
      // 显示规则说明
      uni.showToast({
        title: '规则说明开发中',
        icon: 'none'
      })
    },
    showDetail(item) {
      this.currentDetail = item;
      this.$refs.detailPopup.open();
    },
    closeDetail() {
      this.$refs.detailPopup.close();
    }
  }
}
</script>

<style lang="scss" scoped>
.assets-container {
  min-height: 100vh;
  background-color: #f5f6fa;
  padding: 20rpx;
}

.assets-card {
  position: relative;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  height: 300rpx;

  .bg-image {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 1;
  }

  .content {
    position: relative;
    z-index: 2;
    padding: 40rpx;
    color: #fff;
    height: 100%;
    box-sizing: border-box;
  }

  .title {
    font-size: 28rpx;
    margin-bottom: 20rpx;
  }

  .amount {
    .number {
      font-size: 60rpx;
      font-weight: bold;
    }
  }
}

.assets-detail {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;

  .detail-title {
    font-size: 32rpx;
    font-weight: bold;
    padding: 20rpx;
    border-bottom: 1rpx solid #eee;
  }

  .detail-list {
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx 20rpx;
      border-bottom: 1rpx solid #f5f5f5;

      .left {
        display: flex;
        align-items: center;

        .type-icon {
          width: 80rpx;
          height: 80rpx;
          margin-right: 20rpx;
        }

        .info {
          display: flex;
          flex-direction: column;

          .type-text {
            font-size: 28rpx;
            color: #333;
          }

          .date {
            font-size: 24rpx;
            color: #999;
            margin-top: 6rpx;
          }
        }
      }

      .right {
        display: flex;
        align-items: center;
        
        .amount {
          font-size: 32rpx;
          margin-right: 50rpx;
          &.expense { color: #333; }
          &.income { color: #4e7bea; }
        }

        .arrow-icon {
          width: 32rpx;
          height: 32rpx;
        }
      }
    }
  }
}

.bottom-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background-color: #fff;

  .withdraw-btn {
    background-color: #4e7bea;
    color: #fff;
    border-radius: 45rpx;
    height: 90rpx;
    line-height: 90rpx;
    font-size: 32rpx;
    margin-bottom: 20rpx;
  }

  .rules-text {
    text-align: center;
    font-size: 24rpx;
    color: #666;
    padding-bottom: env(safe-area-inset-bottom);
  }
}

.detail-popup {
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx;
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 30rpx;
    border-bottom: 1rpx solid #eee;
    font-size: 32rpx;
    font-weight: bold;
    
    .close-btn {
      font-size: 40rpx;
      color: #999;
      padding: 0 20rpx;
    }
  }
  
  .popup-content {
    padding: 30rpx 0;
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30rpx;
      
      .label {
        color: #666;
        font-size: 28rpx;
      }
      
      .value {
        font-size: 28rpx;
        &.expense { color: #333; }
        &.income { color: #4e7bea; }
      }
      
      &.remark-row {
        align-items: flex-start;
        
        .remark {
          text-align: right;
          flex: 1;
          margin-left: 20rpx;
          word-break: break-all;
        }
      }
    }
  }
}
</style> 