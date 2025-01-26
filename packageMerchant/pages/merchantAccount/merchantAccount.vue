<template>
    <view class="assets-container">
      <scroll-view scroll-y class="scroll-container" :style="{ height: scrollHeight + 'px' }">
        <!-- 顶部资产卡片 -->
        <view class="assets-cards">
          <view class="assets-card">
            <image class="bg-image" src="/static/images/account1.png" mode="aspectFill"></image>
            <view class="content">
              <view class="title">今日收入</view>
              <view class="amount">
                <text class="number">{{ todayIncome }}</text>
              </view>
            </view>
          </view>

          <view class="assets-card">
            <image class="bg-image" src="/static/images/account2.png" mode="aspectFill"></image>
            <view class="content">
              <view class="title">可提现金额</view>
              <view class="amount">
                <text class="number">{{ commissionAmount }}</text>
              </view>
            </view>
          </view>
        </view>
  
        <!-- 资产明细 -->
        <view class="assets-detail">
          <view class="detail-title">资产明细</view>
          <view class="detail-list">
            <!-- 添加空状态展示 -->
            <view v-if="transactions.length === 0" class="empty-state">
              <image src="/static/images/empty.png" mode="aspectFit" class="empty-image"></image>
              <text class="empty-text">暂无资产明细</text>
            </view>
            <view class="detail-item" v-else v-for="(item, index) in transactions" :key="index" @click="showDetail(item)">
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
                <view class="amount-info">
                  <view class="amount" :class="[item.type, item.status === 0 ? 'invalid' : '']">
                    {{ item.type === 'expense' ? '-' : '+' }}{{ item.amount }}
                  </view>
                  <text v-if="item.source === 2" class="status-text">{{ getWithdrawStatusText(item.state) }}</text>
                </view>
                <image src="/static/images/youjiantou2.png" class="arrow-icon"></image>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
  
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
            <!-- 添加重新确认按钮 -->
            <button 
              v-if="showReconfirmButton(currentDetail)" 
              class="reconfirm-btn" 
              @click="handleReconfirm(currentDetail)"
            >
              重新确认
            </button>
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
        scrollHeight: 0,
        commissionAmount: '0.00',
        transactions: [],
        currentDetail: {},
        loading: false,
        page: 1,
        pageSize: 10,
        hasMore: true,
        withdrawAmount: '', // 提现金额
        withdrawing: false, // 提现中状态
        todayIncome: '0.00',
        currentDate: ''
      }
    },
    computed: {
      canWithdraw() {
        const amount = Number(this.withdrawAmount)
        return amount > 0 && amount <= Number(this.commissionAmount) && !this.withdrawing
      }
    },
    onLoad() {
      // 计算scroll-view高度
      const systemInfo = uni.getSystemInfoSync()
      // 减去底部按钮区域高度（180rpx）和顶部padding（20rpx）
      this.scrollHeight = systemInfo.windowHeight - uni.upx2px(200)
      
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
          const res = await api.merchant.getShopAccount()
          if (res.code === 200) {
            this.commissionAmount = res.data ? Number(res.data.totalAmount).toFixed(2) : '0.00'
            this.todayIncome = res.data ? Number(res.data.todayAmount).toFixed(2) : '0.00'
            this.currentDate = this.formatDate(new Date().getTime())
          }
        } catch (error) {
          console.error('获取佣金账户信息失败', error)
          this.commissionAmount = '0.00'
          this.todayIncome = '0.00'
        }
      },
      // 获取佣金记录
      async getCommissionRecord() {
        if (this.loading) return
        this.loading = true
        try {
          const res = await api.merchant.getShopAccountRecord({
            pageNum: this.page,
            pageSize: this.pageSize
          })
          if (res.code === 200) {
            // 处理返回的数据
            const records = (res.rows || []).map(item => ({
              type: item.type === 1 ? 'income' : 'expense',  // 1收入 2支出
              amount: Number(item.amount).toFixed(2),        // 金额保留2位小数
              date: this.formatDate(item.createTime),        // 格式化日期
              remark: item.remark || '',                     // 备注
              orderId: item.orderId || '',                   // 订单编号
              status: item.status,                           // 状态 1有效 0无效
              source: item.source,                           // 来源 1推广订单 2提现 3系统调整
              state: item.state || '',                         // 提现状态
              package: item.package || null,
              mchId: item.mchId || null
            }))
            
            if (this.page === 1) {
              this.transactions = records
            } else {
              this.transactions = [...this.transactions, ...records]
            }
            
            // 判断是否还有更多数据
            this.hasMore = records.length === this.pageSize
          } else {
            uni.showToast({
              title: res.msg || '获取记录失败',
              icon: 'none'
            })
          }
        } catch (error) {
          uni.showToast({
            title: '获取记录失败',
            icon: 'none'
          })
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
        
        // 限制金额范围，但允许输入过程中的"0"
        const numValue = parseFloat(value)
        if (!isNaN(numValue) && value !== '0' && value !== '0.') {
          if (numValue > 2000) {
            value = '2000'
            uni.showToast({
              title: '单次提现最多2000元',
              icon: 'none'
            })
          } else if (numValue < 0.1 && value.indexOf('.') !== -1 && value.split('.')[1]) {
            // 只有当输入了小数点且小数部分有值时才进行最小值验证
            value = '0.1'
            uni.showToast({
              title: '单次提现最少0.1元',
              icon: 'none'
            })
          }
        }
        
        this.withdrawAmount = value
      },
      async confirmWithdraw() {
        if (!this.canWithdraw || this.withdrawing) return
        
        uni.showModal({
          title: '提现确认',
          content: `确定要提现${this.withdrawAmount}元吗？`,
          success: async (res) => {
            if (res.confirm) {
              try {
                this.withdrawing = true
                // 1. 先调用后端提现接口
                const withdrawRes = await api.merchant.shopAccountWithdraw({
                  amount: this.withdrawAmount
                })
                if (withdrawRes.code === 200) {
                  if (wx.canIUse('requestMerchantTransfer')) {
                    wx.requestMerchantTransfer({
                      mchId: withdrawRes.data.mchId,
                      appId: wx.getAccountInfoSync().miniProgram.appId,
                      package: withdrawRes.data.package,
                      success: (res) => {
                        console.log('success:', res);
                        if (res.errMsg === 'requestMerchantTransfer:ok') {
                          uni.showToast({
                            title: '提现申请成功',
                            icon: 'success'
                          })
                        }else if (res.errMsg === 'requestMerchantTransfer:fail') {
                          uni.showToast({
                            title: '提现申请失败，请稍后重试',
                            icon: 'none'
                          })
                        } else if (res.errMsg === 'requestMerchantTransfer:cancel') {
                          uni.showToast({
                            title: '提现已取消,可在提现记录中重新申请',
                            icon: 'none'
                          })
                        }
                        // 无论成功失败都关闭弹窗并重置状态
                        this.closeWithdraw()
                        this.withdrawing = false
                        // 刷新佣金账户信息
                        this.getCommissionAccount()
                        this.getCommissionRecord()
                      }
                    });
                  } else {
                    wx.showModal({
                      content: '你的微信版本过低，请更新至最新版本。',
                      showCancel: false,
                    });
                    this.withdrawing = false
                  }
                }
              } catch (error) {
                console.error('提现失败', error)
                uni.showToast({
                  title: error.message || '提现失败，请稍后重试',
                  icon: 'none'
                })
                this.closeWithdraw()
                this.withdrawing = false
              }
            }
          }
        })
      },
      showRules() {
        // 显示规则说明
        // uni.showToast({
        //   title: '规则说明开发中',
        //   icon: 'none'
        // })
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
      },
      getWithdrawStatusText(state) {
        const statusMap = {
          'ACCEPTED': '已受理',
          'PROCESSING': '处理中',
          'WAIT_USER_CONFIRM': '待确认',
          'TRANSFERING': '转账中',
          'SUCCESS': '已完成',
          'FAIL': '已失败',
          'CANCELING': '撤销中',
          'CANCELLED': '已撤销'
        }
        return statusMap[state] || ''
      },
      // 判断是否显示重新确认按钮
      showReconfirmButton(item) {
        if (item.source !== 2) return false // 不是提现记录不显示
        const reconfirmStates = ['WAIT_USER_CONFIRM', 'TRANSFERING', 'FAIL', 'PROCESSING']
        return reconfirmStates.includes(item.state)
      },
      // 处理重新确认
      async handleReconfirm(item) {
        if (wx.canIUse('requestMerchantTransfer')) {
          wx.requestMerchantTransfer({
            mchId: item.mchId,
            appId: wx.getAccountInfoSync().miniProgram.appId,
            package: item.package,
            success: async (res) => {
              console.log('success:', res);
              if (res.errMsg === 'requestMerchantTransfer:ok') {
                uni.showToast({
                  title: '确认成功',
                  icon: 'success'
                })
              } else if (res.errMsg === 'requestMerchantTransfer:fail') {
                uni.showToast({
                  title: '确认失败，请稍后重试',
                  icon: 'none'
                })
              } else if (res.errMsg === 'requestMerchantTransfer:cancel') {
                uni.showToast({
                  title: '已取消确认',
                  icon: 'none'
                })
              }
              // 先关闭详情弹窗
              this.closeDetail()
              // 重置页码并刷新数据
              setTimeout(() => {
                this.page = 1
                this.transactions = []
                this.getCommissionRecord()
                // 同时刷新账户余额
                this.getCommissionAccount()
              }, 1000)
            }
          });
        } else {
          wx.showModal({
            content: '你的微信版本过低，请更新至最新版本。',
            showCancel: false,
          });
        }
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .assets-container {
    height: 100vh;
    background-color: #f5f6fa;
    position: relative;
  }
  
  .scroll-container {
    padding: 20rpx;
    box-sizing: border-box;
  }
  
  .assets-cards {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;
    gap: 20rpx;
  }
  
  .assets-card {
    position: relative;
    border-radius: 20rpx;
    overflow: hidden;
    width: calc(50% - 10rpx);
    height: 180rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  
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
      padding: 30rpx;
      color: #fff;
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  
    .title {
      font-size: 28rpx;
      margin-bottom: 16rpx;
      opacity: 0.9;
    }
  
    .amount {
      .number {
        font-size: 44rpx;
        font-weight: bold;
      }
    }
  }
  
  .assets-detail {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 20rpx;
    margin-bottom: 180rpx;
  
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
          
          .amount-info {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            margin-right: 20rpx;
            
            .amount {
              font-size: 32rpx;
              &.expense { color: #333; }
              &.income { color: #4e7bea; }
              &.invalid {
                color: #999 !important;
                text-decoration: line-through;
              }
            }
            
            .status-text {
              font-size: 24rpx;
              color: #666;
              margin-top: 4rpx;
            }
          }
  
          .arrow-icon {
            width: 32rpx;
            height: 32rpx;
          }
        }
      }
      
      // 添加空状态样式
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 100rpx 0;
        
        .empty-image {
          width: 200rpx;
          height: 200rpx;
          margin-bottom: 20rpx;
        }
        
        .empty-text {
          font-size: 28rpx;
          color: #999;
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
    z-index: 10;
  
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
      
      .reconfirm-btn {
        background-color: #4e7bea;
        color: #fff;
        border-radius: 45rpx;
        height: 90rpx;
        line-height: 90rpx;
        font-size: 32rpx;
        margin-top: 40rpx;
        
        &:active {
          opacity: 0.8;
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