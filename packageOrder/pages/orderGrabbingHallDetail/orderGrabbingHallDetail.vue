<template>
	<view class="order-detail">
		<!-- 骨架屏 -->
		<template v-if="loading">
			<view class="skeleton-card">
				<view class="skeleton-title"></view>
				<view class="skeleton-item" v-for="j in 3" :key="j">
					<view class="skeleton-label"></view>
					<view class="skeleton-value"></view>
				</view>
			</view>
		</template>

		<template v-else>
			<!-- 维修信息卡片 -->
			<view class="info-card">
				<view class="card-title">维修信息</view>
				<view class="info-item">
					<text class="label">联系地址</text>
					<text class="value">{{ orderInfo.contactAddress || '--' }}</text>
				</view>
				<view class="description-item">
					<text class="label">故障描述</text>
					<view class="description-content">
						{{ orderInfo.description || '--' }}
					</view>
					<!-- 语音播放器 -->
					<view class="voice-player" v-if="orderInfo.voicePath" @tap="playVoice">
						<view class="voice-icon" :class="{ 'playing': isPlaying }">
							<view class="line line1"></view>
							<view class="line line2"></view>
							<view class="line line3"></view>
							<view class="line line4"></view>
						</view>
						<text class="voice-duration">{{ orderInfo.voiceDuration }}s</text>
					</view>
				</view>
				<view class="image-list" v-if="orderInfo.images">
					<text class="label">故障图片</text>
					<view class="image-grid">
						<image 
							v-for="(img, index) in imageList" 
							:key="index" 
							:src="img" 
							mode="aspectFill"
							@tap="previewImage(index)"
						></image>
					</view>
				</view>
			</view>
		</template>
		
		<!-- 底部操作栏 -->
		<view class="bottom-action" v-if="!loading">
			<button 
				class="grab-btn" 
				@tap="grabOrder" 
				:disabled="orderInfo.grabStatus === 1"
				:style="{ opacity: orderInfo.grabStatus === 1 ? 0.5 : 1 }"
			>
				{{ orderInfo.grabStatus === 1 ? '已抢单' : '马上抢' }}
			</button>
		</view>
	</view>
</template>

<script>
	import api from '@/api/index.js'
	import request from '@/utils/request.js'
	
	export default {
		data() {
			return {
				orderId: '',
				orderInfo: {},
				loading: true,
				imageList: [],
				isPlaying: false,
				audioContext: null
			}
		},
		onLoad(options) {
			if (options.orderId) {
				this.orderId = options.orderId
				this.getOrderDetail()
			}
			// 初始化音频上下文
			this.audioContext = uni.createInnerAudioContext()
			this.audioContext.onEnded(() => {
				this.isPlaying = false
			})
			this.audioContext.onError(() => {
				this.isPlaying = false
				uni.showToast({
					title: '语音播放失败',
					icon: 'none'
				})
			})
		},
		onUnload() {
			// 页面卸载时销毁音频上下文
			if (this.audioContext) {
				this.audioContext.destroy()
			}
		},
		methods: {
			// 获取订单详情
			async getOrderDetail() {
				try {
					const res = await api.merchant.getGrabOrderDetail({
						orderId: this.orderId
					})
					
					if (res.code === 200) {
						this.orderInfo = res.data || {}
						// 处理图片列表，加上BASE_URL
						if (this.orderInfo.images) {
							this.imageList = this.orderInfo.images.split(',').map(img => request.BASE_URL + img)
						}
						// 处理语音路径
						if (this.orderInfo.voicePath) {
							this.orderInfo.voicePath = request.BASE_URL + this.orderInfo.voicePath
						}
					} else {
						uni.showToast({
							title: res.msg || '获取订单详情失败',
							icon: 'none'
						})
					}
				} catch (e) {
					uni.showToast({
						title: '获取订单详情失败',
						icon: 'none'
					})
				} finally {
					this.loading = false
				}
			},
			
			// 播放语音
			playVoice() {
				if (!this.orderInfo.voicePath) return
				
				if (this.isPlaying) {
					this.audioContext.stop()
					this.isPlaying = false
					return
				}
				
				this.isPlaying = true
				this.audioContext.src = this.orderInfo.voicePath
				this.audioContext.play()
			},
			
			// 预览图片
			previewImage(current) {
				uni.previewImage({
					urls: this.imageList,
					current: current
				})
			},
			
			// 抢单
			grabOrder() {
				if (this.orderInfo.grabStatus === 1) {
					uni.showToast({
						title: '该订单已被抢',
						icon: 'none'
					})
					return
				}
				
				uni.showModal({
					title: '确认抢单',
					content: '确定要抢这个订单吗？',
					success: async (res) => {
						if (res.confirm) {
							try {
								const res = await api.merchant.grabOrder({
									orderId: this.orderId
								})
								
								if (res.code === 200) {
									this.orderInfo.grabStatus = 1
									uni.showToast({
										title: '抢单成功',
										icon: 'success'
									})
									// 延迟返回，让用户看到抢单成功的状态
									setTimeout(() => {
										uni.navigateBack()
									}, 1500)
								} else {
									uni.showToast({
										title: res.msg || '抢单失败',
										icon: 'none'
									})
								}
							} catch (e) {
								uni.showToast({
									title: e.message || '抢单失败',
									icon: 'none'
								})
							}
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	.order-detail {
		min-height: 100vh;
		background-color: #F5F6FA;
		padding: 20rpx;
		box-sizing: border-box;
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
		
		// 骨架屏样式
		.skeleton-card {
			background-color: #fff;
			border-radius: 16rpx;
			padding: 30rpx;
			margin-bottom: 20rpx;
			
			.skeleton-title {
				width: 120rpx;
				height: 36rpx;
				background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
				background-size: 400% 100%;
				animation: skeleton-loading 1.4s ease infinite;
				margin-bottom: 30rpx;
				border-radius: 4rpx;
			}
			
			.skeleton-item {
				display: flex;
				justify-content: space-between;
				margin-bottom: 20rpx;
				
				.skeleton-label {
					width: 160rpx;
					height: 32rpx;
					background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
					background-size: 400% 100%;
					animation: skeleton-loading 1.4s ease infinite;
					border-radius: 4rpx;
				}
				
				.skeleton-value {
					width: 200rpx;
					height: 32rpx;
					background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
					background-size: 400% 100%;
					animation: skeleton-loading 1.4s ease infinite;
					border-radius: 4rpx;
				}
			}
		}
		
		.info-card {
			background-color: #fff;
			border-radius: 16rpx;
			padding: 30rpx;
			margin-bottom: 20rpx;
			
			.card-title {
				font-size: 32rpx;
				color: #333;
				font-weight: bold;
				margin-bottom: 30rpx;
				line-height: 44rpx;
			}
			
			.info-item {
				display: flex;
				justify-content: space-between;
				align-items: flex-start;
				margin-bottom: 20rpx;
				line-height: 40rpx;
				
				.label {
					font-size: 28rpx;
					color: #999;
					width: 140rpx;
					flex-shrink: 0;
				}
				
				.value {
					font-size: 28rpx;
					color: #333;
					flex: 1;
					text-align: right;
				}
			}
			
			.description-item {
				margin-bottom: 20rpx;
				
				.label {
					font-size: 28rpx;
					color: #999;
					margin-bottom: 16rpx;
					display: block;
				}
				
				.description-content {
					background-color: #F8F9FC;
					padding: 24rpx;
					border-radius: 12rpx;
					font-size: 28rpx;
					color: #666;
					line-height: 40rpx;
					margin-bottom: 16rpx;
				}
				
				.voice-player {
					display: flex;
					align-items: center;
					background-color: #F8F9FC;
					padding: 16rpx 24rpx;
					border-radius: 12rpx;
					width: fit-content;
					
					.voice-icon {
						width: 40rpx;
						height: 40rpx;
						margin-right: 16rpx;
						display: flex;
						align-items: center;
						justify-content: space-between;
						
						.line {
							width: 4rpx;
							background-color: #666;
							border-radius: 2rpx;
							
							&.line1 {
								height: 16rpx;
							}
							&.line2 {
								height: 24rpx;
							}
							&.line3 {
								height: 32rpx;
							}
							&.line4 {
								height: 20rpx;
							}
						}
						
						&.playing {
							.line {
								animation: voiceLine 1s ease infinite;
								
								&.line1 {
									animation-delay: 0s;
								}
								&.line2 {
									animation-delay: 0.2s;
								}
								&.line3 {
									animation-delay: 0.4s;
								}
								&.line4 {
									animation-delay: 0.6s;
								}
							}
						}
					}
					
					.voice-duration {
						font-size: 24rpx;
						color: #666;
					}
					
					&:active {
						opacity: 0.7;
					}
				}
			}
			
			.image-list {
				.label {
					font-size: 28rpx;
					color: #999;
					margin-bottom: 16rpx;
					display: block;
				}
				
				.image-grid {
					display: flex;
					flex-wrap: wrap;
					margin: -10rpx;
					
					image {
						width: calc(33.33% - 20rpx);
						height: 180rpx;
						margin: 10rpx;
						border-radius: 8rpx;
						background-color: #F8F9FC;
					}
				}
			}
		}
		
		.bottom-action {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: #fff;
			padding: 20rpx 40rpx;
			padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
			box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.04);
			
			.grab-btn {
				width: 100%;
				height: 80rpx;
				background-color: #FF6B00;
				color: #fff;
				font-size: 32rpx;
				border-radius: 40rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				border: none;
				margin: 0;
				transition: all 0.3s ease;
				
				&::after {
					border: none;
				}
				
				&:active {
					transform: scale(0.98);
					opacity: 0.9;
				}
				
				&[disabled] {
					background-color: #ccc;
				}
			}
		}
	}
	
	@keyframes skeleton-loading {
		0% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0 50%;
		}
	}
	
	@keyframes voiceLine {
		0%, 100% {
			transform: scaleY(1);
		}
		50% {
			transform: scaleY(0.4);
		}
	}
</style> 