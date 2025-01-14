<template>
  <view class="assets-container">
    <!-- 顶部资产卡片 -->
    <view class="assets-card">
      <image class="bg-image" src="/static/my/wodezichanbg.png" mode="aspectFill"></image>
      <view class="content">
        <view class="title">佣金资产</view>
        <view class="amount">
          <text class="number">{{ commissionAmount }}</text>
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
              <text class="source-text">{{ getSourceText(item.source) }}</text>
              <text class="date">{{ item.date }}</text>
            </view>
          </view>
          <view class="right">
            <view class="amount" :class="[item.type, item.status === 0 ? 'invalid' : '']">
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
            <text class="label">交易来源</text>
            <text class="value">{{ getSourceText(currentDetail.source) }}</text>
          </view>
          <view class="detail-row">
            <text class="label">交易状态</text>
            <text class="value" :class="currentDetail.status === 0 ? 'invalid-text' : ''">
              {{ currentDetail.status === 1 ? '有效' : '无效' }}
            </text>
          </view>
          <view class="detail-row">
            <text class="label">交易金额</text>
            <text class="value" :class="[currentDetail.type, currentDetail.status === 0 ? 'invalid' : '']">
              {{ currentDetail.type === 'expense' ? '-' : '+' }}{{ currentDetail.amount }}
            </text>
          </view>
          <view class="detail-row">
            <text class="label">交易时间</text>
            <text class="value">{{ currentDetail.date }}</text>
          </view>
          <view class="detail-row">
            <text class="label">订单编号</text>
            <text class="value">{{ currentDetail.orderId || '无' }}</text>
          </view>
          <view class="detail-row remark-row">
            <text class="label">备注信息</text>
            <text class="value remark">{{ currentDetail.remark || '暂无备注' }}</text>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 添加提现弹窗 -->
    <uni-popup ref="withdrawPopup" type="bottom">
      <view class="withdraw-popup">
        <view class="popup-header">
          <text>提现</text>
          <text class="close-btn" @click="closeWithdraw">×</text>
        </view>
        <view class="popup-content">
          <view class="amount-input">
            <text class="currency">¥</text>
            <input 
              type="digit" 
              v-model="withdrawAmount"
              placeholder="请输入提现金额"
              :maxlength="10"
              @input="handleAmountInput"
            />
          </view>
          <view class="available-amount">
            可提现金额：¥{{ commissionAmount }}
          </view>
          <button 
            class="confirm-btn" 
            :disabled="!canWithdraw"
            :class="{ disabled: !canWithdraw }"
            @click="confirmWithdraw"
          >
            确认提现
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import api from '@/api/index.js'

export default {
  data() {
    return {
      commissionAmount: '0.00',
      transactions: [],
      currentDetail: {},
      loading: false,
      page: 1,
      pageSize: 10,
      hasMore: true,
      withdrawAmount: '', // 提现金额
      withdrawing: false // 提现中状态
    }
  },
  computed: {
    canWithdraw() {
      const amount = Number(this.withdrawAmount)
      return amount > 0 && amount <= Number(this.commissionAmount) && !this.withdrawing
    }
  },
  onLoad() {
    this.getCommissionAccount()
    this.getCommissionRecord()
  },
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.page++
      this.getCommissionRecord()
    }
  },
  methods: {
    // 获取佣金账户信息
    async getCommissionAccount() {
      try {
        const res = await api.commission.getCommissionAccount()
        if (res.code === 200) {
          this.commissionAmount = res.data ? Number(res.data.totalAmount).toFixed(2) : '0.00'
        }
      } catch (error) {
        console.error('获取佣金账户信息失败', error)
        this.commissionAmount = '0.00'
      }
    },
    // 获取佣金记录
    async getCommissionRecord() {
      if (this.loading) return
      this.loading = true
      try {
        const res = await api.commission.getCommissionRecord({
          pageNum: this.page,
          pageSize: this.pageSize
        })
        if (res.code === 200) {
          const records = (res.data || []).map(item => ({
            type: item.type === 1 ? 'income' : 'expense',
            amount: item.amount.toFixed(2),
            date: this.formatDate(item.createTime),
            remark: item.remark,
            orderId: item.orderId,
            status: item.status,
            source: item.source
          }))
          
          if (this.page === 1) {
            this.transactions = records
          } else {
            this.transactions = [...this.transactions, ...records]
          }
          
          this.hasMore = records.length === this.pageSize
        }
      } catch (error) {
        console.error('获取佣金记录失败', error)
      } finally {
        this.loading = false
      }
    },
    formatDate(timestamp) {
      const date = new Date(timestamp)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${month}月${day}日 ${hours}:${minutes}`
    },
    handleWithdraw() {
      this.$refs.withdrawPopup.open()
    },
    closeWithdraw() {
      this.$refs.withdrawPopup.close()
      this.withdrawAmount = ''
    },
    handleAmountInput(e) {
      let value = e.detail.value
      // 限制只能输入数字和小数点，且只能有两位小数
      value = value.replace(/[^\d.]/g, '')
      if (value.indexOf('.') > -1) {
        const parts = value.split('.')
        if (parts.length > 2) {
          value = parts[0] + '.' + parts[1]
        }
        if (parts[1] && parts[1].length > 2) {
          value = parts[0] + '.' + parts[1].slice(0, 2)
        }
      }
      this.withdrawAmount = value
    },
    async confirmWithdraw() {
      if (!this.canWithdraw || this.withdrawing) return
      
      // 显示确认弹窗
      uni.showModal({
        title: '提现确认',
        content: `确定要提现${this.withdrawAmount}元吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              this.withdrawing = true
              const res = await api.commission.withdraw({
                amount: Number(this.withdrawAmount)
              })
              
              if (res.code === 200) {
                uni.showToast({
                  title: '提现申请成功',
                  icon: 'success'
                })
                this.closeWithdraw()
                // 刷新佣金账户信息和记录
                this.getCommissionAccount()
                this.page = 1
                this.getCommissionRecord()
              } else {
                uni.showToast({
                  title: res.msg || '提现失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              console.error('提现失败', error)
              uni.showToast({
                title: '提现失败，请稍后重试',
                icon: 'none'
              })
            } finally {
              this.withdrawing = false
            }
          }
        }
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
    },
    getSourceText(source) {
      const sourceMap = {
        1: '推广订单',
        2: '提现',
        3: '系统调整'
      }
      return sourceMap[source] || '其他'
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

          .source-text {
            font-size: 24rpx;
            color: #666;
            margin-top: 4rpx;
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
          &.invalid {
            color: #999 !important;
            text-decoration: line-through;
          }
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
        &.invalid {
          color: #999;
          text-decoration: line-through;
        }
        
        &.invalid-text {
          color: #ff4d4f;
        }
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

.withdraw-popup {
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
    padding: 40rpx 20rpx;
    
    .amount-input {
      display: flex;
      align-items: center;
      border-bottom: 1rpx solid #eee;
      padding-bottom: 20rpx;
      margin-bottom: 20rpx;
      
      .currency {
        font-size: 40rpx;
        color: #333;
        margin-right: 20rpx;
      }
      
      input {
        flex: 1;
        font-size: 40rpx;
        height: 80rpx;
      }
    }
    
    .available-amount {
      font-size: 24rpx;
      color: #666;
      margin-bottom: 40rpx;
    }
    
    .confirm-btn {
      background-color: #4e7bea;
      color: #fff;
      border-radius: 45rpx;
      height: 90rpx;
      line-height: 90rpx;
      font-size: 32rpx;
      
      &.disabled {
        background-color: #ccc;
      }
    }
  }
}
</style> 