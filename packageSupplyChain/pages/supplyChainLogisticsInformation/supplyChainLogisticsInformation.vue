<template>
	<view class="logistics-info">
		<!-- 标题 -->
		<view class="page-header">
			<view class="title">物流信息</view>
			<view class="subtitle">请填写物流发货信息</view>
		</view>
		
		<!-- 表单区域 -->
		<view class="form-container">
			<!-- 快递选择 -->
			<view class="input-item" @click="showExpressSelector">
				<view class="label">快递公司</view>
				<view class="picker-value">
					<text v-if="selectedExpress">{{selectedExpress}}</text>
					<text v-else class="placeholder">请选择快递公司</text>
					<image src="/static/images/youjiantou2.png" mode="widthFix" class="arrow"></image>
				</view>
			</view>
			
			<!-- 物流单号输入 -->
			<view class="input-item">
				<view class="label">物流单号</view>
				<input 
					type="text" 
					v-model="logisticsNumber" 
					placeholder="请输入详细物流单号" 
					placeholder-style="font-size: 28rpx; color: #999999;"
					class="input-field"
				/>
			</view>
		</view>
		
		<!-- 提示信息 -->
		<view class="tips">
			<text class="tips-text">请确保物流单号准确无误，以便买家查询物流信息</text>
		</view>
		
		<!-- 提交按钮 -->
		<view class="submit-btn" :class="{'submit-btn-active': canSubmit}" @click="submitLogistics">
			<text>提交</text>
		</view>

		<!-- 自定义快递选择器 -->
		<view class="express-selector" v-if="showSelector" @click.stop="hideExpressSelector">
			<view class="selector-mask"></view>
			<view class="selector-content" @click.stop>
				<view class="selector-header">
					<text>选择快递公司</text>
					<view class="close-btn" @click="hideExpressSelector">
						<text>✕</text>
					</view>
				</view>
				<scroll-view scroll-y class="express-list">
					<view 
						class="express-item" 
						v-for="(item, index) in expressList" 
						:key="index"
						@click="selectExpress(item)"
						:class="{'express-item-active': selectedExpressCode === item.comCode}"
					>
						<text class="express-name">{{item.name}}</text>
						<text class="express-type">{{item.nameType}}</text>
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
import api from '@/api/index.js'

export default {
	data() {
		return {
			orderId: '', // 订单ID
			selectedExpress: '', // 选中的快递公司名称
			selectedExpressCode: '', // 选中的快递公司代码
			logisticsNumber: '', // 物流单号
			expressList: [], // 快递公司列表
			showSelector: false, // 是否显示选择器
		}
	},
	computed: {
		// 判断是否可以提交
		canSubmit() {
			return this.selectedExpress && this.logisticsNumber
		}
	},
	onLoad(options) {
		if (options.orderId) {
			this.orderId = options.orderId
		}
		// 获取快递公司列表
		this.getExpressList()
	},
	methods: {
		// 显示快递选择器
		showExpressSelector() {
			if (!this.expressList || this.expressList.length === 0) {
				this.getExpressList()
				return
			}
			this.showSelector = true
		},
		
		// 隐藏快递选择器
		hideExpressSelector() {
			this.showSelector = false
		},
		
		// 选择快递公司
		selectExpress(item) {
			this.selectedExpress = item.name
			this.selectedExpressCode = item.comCode
			this.hideExpressSelector()
		},
		
		// 获取快递公司列表
		async getExpressList() {
			try {
				uni.showLoading({
					title: '加载中...'
				})
				
				const res = await api.supplyChain.getExpressList()
				console.log('快递公司列表接口返回：', res)
				
				if (res.code === 200 && res.data) {
					this.expressList = res.data
				} else {
					uni.showToast({
						title: res.msg || '获取快递公司列表失败',
						icon: 'none'
					})
				}
			} catch (err) {
				console.error('Get express list error:', err)
				uni.showToast({
					title: '获取快递公司列表失败',
					icon: 'none'
				})
			} finally {
				uni.hideLoading()
			}
		},
		
		// 提交物流信息
		async submitLogistics() {
			if (!this.selectedExpress) {
				uni.showToast({
					title: '请选择快递公司',
					icon: 'none'
				})
				return
			}
			if (!this.logisticsNumber) {
				uni.showToast({
					title: '请输入物流单号',
					icon: 'none'
				})
				return
			}
			
			// 显示确认弹窗
			uni.showModal({
				title: '确认发货',
				content: `是否确认使用${this.selectedExpress}发货？\n物流单号：${this.logisticsNumber}`,
				confirmText: '确认发货',
				confirmColor: '#FF6A00',
				cancelText: '取消',
				success: async (res) => {
					if (res.confirm) {
						try {
							uni.showLoading({
								title: '提交中...',
								mask: true
							})
							
							const res = await api.supplyChain.sendOrder({
								expressNumber: this.logisticsNumber,
								expressCompany: this.selectedExpressCode,
								id: this.orderId
							})
							
							if (res.code === 200) {
								uni.showToast({
									title: '发货成功',
									icon: 'success'
								})
								
								// 发送刷新订单列表事件
								uni.$emit('refreshPurchaseOrderList')
								
								// 延迟返回上上页
								setTimeout(() => {
									uni.navigateBack({
										delta: 2
									})
								}, 1500)
							} else {
								uni.showToast({
									title: res.msg || '发货失败',
									icon: 'none'
								})
							}
						} catch (err) {
							console.error('Submit logistics error:', err)
							uni.showToast({
								title: '发货失败',
								icon: 'none'
							})
						} finally {
							uni.hideLoading()
						}
					}
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.logistics-info {
	min-height: 100vh;
	background-color: #F7F8FC;
	padding-bottom: 160rpx;
	
	.page-header {
		padding: 40rpx 30rpx 30rpx;
		background: linear-gradient(135deg, #FF8F1F 0%, #FF6A00 100%);
		margin-bottom: 30rpx;
		position: relative;
		
		&::after {
			content: '';
			position: absolute;
			left: 0;
			right: 0;
			bottom: -20rpx;
			height: 40rpx;
			background: #F7F8FC;
			border-radius: 30rpx 30rpx 0 0;
		}
		
		.title {
			font-size: 40rpx;
			font-weight: 600;
			color: #FFFFFF;
			margin-bottom: 16rpx;
		}
		
		.subtitle {
			font-size: 26rpx;
			color: rgba(255, 255, 255, 0.9);
		}
	}
	
	.form-container {
		background-color: #FFFFFF;
		padding: 10rpx 30rpx;
		border-radius: 16rpx;
		margin: 0 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
		
		.input-item {
			display: flex;
			align-items: center;
			padding: 32rpx 0;
			border-bottom: 1rpx solid #F0F0F0;
			
			&:last-child {
				border-bottom: none;
			}
			
			.label {
				font-size: 28rpx;
				color: #333333;
				font-weight: 500;
				min-width: 140rpx;
				position: relative;
				padding-left: 16rpx;
				
				&::before {
					content: '';
					position: absolute;
					left: 0;
					top: 50%;
					transform: translateY(-50%);
					width: 6rpx;
					height: 24rpx;
					background: #FF6A00;
					border-radius: 4rpx;
				}
			}
			
			.picker-value {
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: space-between;
				font-size: 28rpx;
				color: #333333;
				padding: 4rpx 0;
				
				text {
					flex: 1;
				}
				
				.placeholder {
					font-size: 28rpx;
					color: #999999;
				}
				
				.arrow {
					width: 24rpx;
					height: 24rpx;
					margin-left: 12rpx;
					transition: all 0.3s;
				}
			}
			
			.input-field {
				flex: 1;
				font-size: 28rpx;
				height: 44rpx;
				line-height: 44rpx;
				padding: 0;
			}
			
			.placeholder {
				font-size: 28rpx;
				color: #999999;
			}
		}
	}
	
	.tips {
		margin: 30rpx 24rpx;
		padding: 24rpx 30rpx;
		background: rgba(255, 106, 0, 0.05);
		border-radius: 12rpx;
		border: 1rpx solid rgba(255, 106, 0, 0.1);
		
		.tips-text {
			font-size: 24rpx;
			color: #FF6A00;
			line-height: 1.6;
		}
	}
	
	.submit-btn {
		position: fixed;
		bottom: 40rpx;
		left: 30rpx;
		right: 30rpx;
		height: 90rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #FF8F1F, #FF6A00);
		color: #FFFFFF;
		font-size: 32rpx;
		font-weight: 600;
		border-radius: 10rpx;
		box-shadow: 0 8rpx 24rpx rgba(255, 106, 0, 0.25);
		transition: all 0.3s ease;
		opacity: 0.95;
		
		&-active {
			opacity: 1;
			transform: translateY(-2rpx);
			box-shadow: 0 12rpx 32rpx rgba(255, 106, 0, 0.3);
		}
		
		&:active {
			transform: translateY(0);
			opacity: 0.9;
			box-shadow: 0 6rpx 20rpx rgba(255, 106, 0, 0.2);
		}
	}
	
	.express-selector {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999;
		
		.selector-mask {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.4);
			backdrop-filter: blur(4rpx);
		}
		
		.selector-content {
			position: absolute;
			left: 0;
			right: 0;
			bottom: 0;
			background: #FFFFFF;
			border-radius: 24rpx 24rpx 0 0;
			padding-bottom: env(safe-area-inset-bottom);
			transform: translateY(0);
			transition: transform 0.3s ease-out;
			
			.selector-header {
				display: flex;
				align-items: center;
				justify-content: center;
				height: 110rpx;
				position: relative;
				font-size: 32rpx;
				font-weight: 600;
				color: #333333;
				border-bottom: 1rpx solid #F0F0F0;
				
				.close-btn {
					position: absolute;
					right: 20rpx;
					top: 50%;
					transform: translateY(-50%);
					padding: 20rpx;
					color: #999999;
					font-size: 36rpx;
				}
			}
			
			.express-list {
				max-height: 65vh;
				padding: 10rpx 30rpx;
				
				.express-item {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 32rpx 20rpx;
					border-bottom: 1rpx solid #F0F0F0;
					border-radius: 12rpx;
					margin: 6rpx 0;
					transition: all 0.2s ease;
					
					&:last-child {
						border-bottom: none;
					}
					
					&:active {
						background: #F7F8FC;
					}
					
					&-active {
						background: rgba(255, 106, 0, 0.05);
						border-bottom: none;
						
						.express-name {
							color: #FF6A00;
							font-weight: 500;
						}
						
						.express-type {
							color: #FF6A00;
							background: rgba(255, 106, 0, 0.1);
						}
					}
					
					.express-name {
						font-size: 28rpx;
						color: #333333;
					}
					
					.express-type {
						font-size: 24rpx;
						color: #666666;
						background: #F7F8FC;
						padding: 6rpx 16rpx;
						border-radius: 6rpx;
					}
				}
			}
		}
	}
	
	/* 全局placeholder样式 */
	::placeholder {
		font-size: 28rpx !important;
		color: #999999 !important;
	}
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
	.logistics-info {
		background-color: #1A1A1A;
		
		.page-header {
			&::after {
				background: #1A1A1A;
			}
		}
		
		.form-container {
			background-color: #242424;
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
			
			.input-item {
				border-bottom-color: #333333;
				
				.label {
					color: #FFFFFF;
				}
				
				.picker-value {
					color: #FFFFFF;
				}
				
				.input-field {
					color: #FFFFFF;
				}
			}
		}
		
		.tips {
			background: rgba(255, 106, 0, 0.1);
			border-color: rgba(255, 106, 0, 0.15);
		}
		
		.express-selector {
			.selector-content {
				background-color: #242424;
				
				.selector-header {
					color: #FFFFFF;
					border-bottom-color: #333333;
				}
				
				.express-list {
					.express-item {
						border-bottom-color: #333333;
						
						&:active {
							background: #2A2A2A;
						}
						
						&-active {
							background: rgba(255, 106, 0, 0.1);
						}
						
						.express-name {
							color: #FFFFFF;
						}
						
						.express-type {
							background: #333333;
							color: #999999;
						}
					}
				}
			}
		}
	}
}
</style>
