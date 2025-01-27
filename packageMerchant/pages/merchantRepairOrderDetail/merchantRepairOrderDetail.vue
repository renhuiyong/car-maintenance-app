<template>
	<view class="detail-container">
		<!-- 订单状态卡片 -->
		<view class="status-card">
			<view class="status-info">
				<text class="status">{{getStatusDetailText(orderInfo.statusDetail)}}</text>
				<text class="time">{{orderInfo.time}}</text>
			</view>
			<view class="location-info">
				<image class="location-icon" src="/static/images/location_icon.png"></image>
				<text class="location">{{orderInfo.location}}</text>
				<text class="distance" @tap="handleRetryLocation">{{formatDistance()}}</text>
			</view>
		</view>

		<!-- 订单内容卡片 -->
		<view class="content-card">
			<!-- 问题描述 -->
			<view class="section">
				<view class="section-header">
					<text class="title">问题描述</text>
					<text class="order-id">订单号：{{orderInfo.orderId}}</text>
				</view>
				<view class="issue-content">
					<text class="text">{{orderInfo.issue}}</text>
					<!-- 语音消息 -->
					<view v-if="orderInfo.voice" class="voice-message" @tap="playVoice(orderInfo.voice)">
						<view class="voice-waves" :class="{ 'has-animation': playingVoiceId === orderInfo.voice && isPlaying }" :style="{ '--play-state': isPlaying ? 'running' : 'paused' }">
							<view class="wave"></view>
							<view class="wave"></view>
							<view class="wave"></view>
						</view>
						<text class="voice-duration">{{orderInfo.voiceDuration}}s</text>
					</view>
					<!-- 图片列表 -->
					<scroll-view v-if="orderInfo.images" class="image-scroll" scroll-x>
						<view class="image-list">
							<image
								v-for="(img, index) in orderInfo.images.split(',')"
								:key="index"
								:src="getImageUrl(img)"
								mode="aspectFill"
								@tap="previewImage(getImageUrl(img), orderInfo.images.split(',').map(i => getImageUrl(i)))"
							></image>
						</view>
					</scroll-view>
				</view>
			</view>

			<!-- 联系人信息 -->
			<view class="section">
				<view class="section-header">
					<text class="title">联系人信息</text>
				</view>
				<view class="contact-info">
					<view class="info-item" v-if="orderInfo.contactName">
						<text class="label">姓名：</text>
						<text class="value">{{orderInfo.contactName}}</text>
					</view>
					<view class="info-item" v-if="orderInfo.contactPhone">
						<text class="label">电话：</text>
						<text class="value">{{orderInfo.contactPhone}}</text>
					</view>
					<view class="info-item" v-if="orderInfo.contactAddress">
						<text class="label">地址：</text>
						<text class="value">{{orderInfo.contactAddress}}</text>
					</view>
				</view>
			</view>

			<!-- 商家回复 -->
			<view class="section" v-if="orderInfo.merchantResponse">
				<view class="section-header">
					<text class="title">商家回复</text>
				</view>
				<view class="response-content" v-html="orderInfo.merchantResponse"></view>
			</view>

			<!-- 托运信息 -->
			<view class="section">
				<view class="section-header">
					<text class="title">托运信息</text>
				</view>
				<view class="transport-info">
					<view class="transport-status">
						<text class="transport-icon">{{ orderInfo.needTransport ? '✓' : '✗' }}</text>
						<text>{{orderInfo.needTransport ? '需要托运' : '不需要托运'}}</text>
					</view>
					<text v-if="orderInfo.needTransport" class="fee">托运费：¥{{orderInfo.transportFee.toFixed(2)}}</text>
				</view>
			</view>
		</view>

		<!-- 底部按钮 -->
		<view class="footer" v-if="orderInfo.status === '0'">
			<button
				class="btn-reply"
				v-if="orderInfo.statusDetail === '0'"
				@tap="handleReply"
			>回复客户</button>
			<button
				class="btn-reply"
				v-if="orderInfo.statusDetail === '2'"
				@tap="handleStartRepair"
			>开始维修</button>
			<button
				class="btn-reply"
				v-if="orderInfo.statusDetail === '3'"
				@tap="handleFinishRepair"
			>维修完成</button>
		</view>
	</view>
</template>

<script>
import api from '@/api/index.js'
import request from '@/utils/request.js'

export default {
	data() {
		return {
			orderInfo: {},
			playingVoiceId: '',
			isPlaying: false,
			audioContext: null,
			currentLocation: {
				latitude: null,
				longitude: null
			}
		}
	},

	onLoad(options) {
		if (options.params) {
			this.orderInfo = JSON.parse(decodeURIComponent(options.params))
		}
		// 获取当前位置
		this.getCurrentLocation()
	},

	onUnload() {
		// 页面卸载时销毁音频实例
		if (this.audioContext) {
			this.audioContext.destroy()
			this.audioContext = null
		}
	},

	methods: {
		// 获取当前位置
		async getCurrentLocation() {
			try {
				const res = await new Promise((resolve, reject) => {
					uni.getLocation({
						type: 'gcj02',
						success: resolve,
						fail: reject
					})
				})
				
				this.currentLocation = {
					latitude: res.latitude,
					longitude: res.longitude
				}
			} catch (error) {
				console.error('获取位置失败:', error)
				uni.showToast({
					title: '获取位置失败',
					icon: 'none'
				})
			}
		},
		
		// 计算两点之间的距离（使用Haversine公式）
		calculateDistance(lat1, lon1, lat2, lon2) {
			if (!lat1 || !lon1 || !lat2 || !lon2) return null
			
			const R = 6371 // 地球半径，单位km
			const dLat = this.toRad(lat2 - lat1)
			const dLon = this.toRad(lon2 - lon1)
			const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
					Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
					Math.sin(dLon/2) * Math.sin(dLon/2)
			const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
			return R * c
		},
		
		// 角度转弧度
		toRad(value) {
			return value * Math.PI / 180
		},

		// 格式化距离
		formatDistance() {
			if (!this.currentLocation.latitude || !this.currentLocation.longitude || 
				!this.orderInfo.contactLatitude || !this.orderInfo.contactLongitude) {
				return '未知距离'
			}
			
			const distance = this.calculateDistance(
				this.currentLocation.latitude,
				this.currentLocation.longitude,
				this.orderInfo.contactLatitude,
				this.orderInfo.contactLongitude
			)
			
			if (typeof distance !== 'number') return '未知距离'
			if (distance < 1) {
				return (distance * 1000).toFixed(0) + 'm'
			}
			return distance.toFixed(1) + 'km'
		},

		// 获取图片完整URL
		getImageUrl(path) {
			if (!path) return ''
			return path.startsWith('http') ? path : request.BASE_URL_OSS + path
		},

		// 获取状态文本
		getStatusDetailText(statusDetail) {
			if (statusDetail === '0') return '等待商家回复'
			if (statusDetail === '1') return '商家已回复，待购买配件'
			if (statusDetail === '2') return '已购买配件，待维修'
			if (statusDetail === '3') return '已开始维修'
			if (statusDetail === '4') return '已维修完成'
			return '未知状态'
		},

		// 播放语音
		playVoice(voiceUrl) {
			if (this.playingVoiceId === voiceUrl && this.audioContext) {
				// 如果是同一个音频，切换暂停/播放状态
				if (this.audioContext.paused) {
					this.audioContext.play()
					this.isPlaying = true
				} else {
					this.audioContext.pause()
					this.isPlaying = false
				}
				return
			}
			
			// 如果之前有播放的音频，先停止
			if (this.audioContext) {
				this.audioContext.stop()
				this.audioContext.destroy()
				this.audioContext = null
				this.isPlaying = false
			}
			
			// 创建新的音频实例
			this.audioContext = uni.createInnerAudioContext()
			this.audioContext.src = request.BASE_URL_OSS + voiceUrl
			this.playingVoiceId = voiceUrl
			this.isPlaying = true
			
			// 监听播放结束
			this.audioContext.onEnded(() => {
				this.playingVoiceId = ''
				this.isPlaying = false
				this.audioContext.destroy()
				this.audioContext = null
			})
			
			// 监听播放错误
			this.audioContext.onError((res) => {
				console.error('播放音频失败:', res)
				uni.showToast({
					title: '音频播放失败',
					icon: 'none'
				})
				this.playingVoiceId = ''
				this.isPlaying = false
				this.audioContext.destroy()
				this.audioContext = null
			})
			
			// 开始播放
			this.audioContext.play()
		},

		// 预览图片
		previewImage(current, urls) {
			uni.previewImage({
				current,
				urls
			})
		},

		// 回复客户
		handleReply() {
			const params = encodeURIComponent(JSON.stringify({
				orderId: this.orderInfo.orderId,
				createTime: this.orderInfo.time,
				description: this.orderInfo.issue,
				images: this.orderInfo.images || '',
				voicePath: this.orderInfo.voice || '',
				voiceDuration: this.orderInfo.voiceDuration || 0,
				needTransport: this.orderInfo.needTransport,
				transportFee: this.orderInfo.transportFee,
				grabStatus: this.orderInfo.grabStatus
			}))
			uni.navigateTo({
				url: `/packageMerchant/pages/merchantOrderReply/merchantOrderReply?params=${params}`
			})
		},

		// 开始维修
		async handleStartRepair() {
			uni.showModal({
				title: '确认开始维修',
				content: '确定要开始维修该订单吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							const res = await api.merchant.startRepair(this.orderInfo.orderId)

							if (res.code === 200) {
								uni.showToast({
									title: '已开始维修',
									icon: 'success'
								})
								// 发送刷新事件
								uni.$emit('refreshRepairOrderList')
								// 返回上一页并刷新列表
								uni.navigateBack()
							} else {
								uni.showToast({
									title: res.msg || '操作失败',
									icon: 'none'
								})
							}
						} catch (error) {
							console.error('操作失败:', error)
							uni.showToast({
								title: '操作失败',
								icon: 'none'
							})
						}
					}
				}
			})
		},

		// 完成维修
		async handleFinishRepair() {
			uni.showModal({
				title: '确认完成维修',
				content: '确定已完成维修吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							const res = await api.merchant.finishRepair(this.orderInfo.orderId)

							if (res.code === 200) {
								uni.showToast({
									title: '维修已完成',
									icon: 'success'
								})
								// 发送刷新事件
								uni.$emit('refreshRepairOrderList')
								// 返回上一页并刷新列表
								uni.navigateBack()
							} else {
								uni.showToast({
									title: res.msg || '操作失败',
									icon: 'none'
								})
							}
						} catch (error) {
							console.error('操作失败:', error)
							uni.showToast({
								title: '操作失败',
								icon: 'none'
							})
						}
					}
				}
			})
		},

		// 重新获取位置
		handleRetryLocation() {
			// 如果当前已有位置信息，直接返回
			if (this.currentLocation.latitude && this.currentLocation.longitude) {
				return
			}
			
			// 检查并请求位置权限
			uni.getSetting({
				success: (res) => {
					if (!res.authSetting['scope.userLocation']) {
						uni.showModal({
							title: '提示',
							content: '需要获取您的位置信息，请在设置中打开位置权限',
							confirmText: '去设置',
							success: (modalRes) => {
								if (modalRes.confirm) {
									uni.openSetting({
										success: (settingRes) => {
											if (settingRes.authSetting['scope.userLocation']) {
												this.getCurrentLocation()
											}
										}
									})
								}
							}
						})
					} else {
						this.getCurrentLocation()
					}
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.detail-container {
	min-height: 100vh;
	background-color: #f7f8fa;
	padding-bottom: 120rpx;

	.status-card {
		background: linear-gradient(135deg, #4468E8 0%, #5E7FFF 100%);
		padding: 32rpx;
		color: #fff;
		margin-bottom: 24rpx;

		.status-info {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 24rpx;

			.status {
				font-size: 36rpx;
				font-weight: 600;
			}

			.time {
				font-size: 26rpx;
				opacity: 0.9;
			}
		}

		.location-info {
			display: flex;
			align-items: center;

			.location-icon {
				width: 32rpx;
				height: 32rpx;
				margin-right: 12rpx;
			}

			.location {
				flex: 1;
				font-size: 28rpx;
				margin-right: 16rpx;
			}

			.distance {
				font-size: 24rpx;
				opacity: 0.9;
				background: rgba(255, 255, 255, 0.2);
				padding: 4rpx 12rpx;
				border-radius: 20rpx;
			}
		}
	}

	.content-card {
		background: #fff;
		border-radius: 16rpx;
		margin: 0 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
		overflow: hidden;

		.section {
			padding: 32rpx;
			border-bottom: 1rpx solid #eee;

			&:last-child {
				border-bottom: none;
			}

			.section-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 24rpx;

				.title {
					font-size: 32rpx;
					font-weight: 600;
					color: #333;
					position: relative;
					padding-left: 24rpx;

					&::before {
						content: '';
						position: absolute;
						left: 0;
						top: 50%;
						transform: translateY(-50%);
						width: 8rpx;
						height: 32rpx;
						background: #4468E8;
						border-radius: 4rpx;
					}
				}

				.order-id {
					font-size: 26rpx;
					color: #999;
				}
			}

			.issue-content {
				.text {
					font-size: 28rpx;
					color: #333;
					line-height: 1.6;
				}

				.voice-message {
					display: inline-flex;
					align-items: center;
					background: #f7f8fa;
					padding: 16rpx 32rpx;
					border-radius: 32rpx;
					margin-top: 24rpx;

					.voice-waves {
						display: flex;
						align-items: center;
						margin-right: 16rpx;

						.wave {
							width: 4rpx;
							height: 16rpx;
							background: #4468E8;
							margin: 0 4rpx;
							border-radius: 2rpx;
							animation: waveAnimation 1s infinite;
							animation-play-state: paused;

							&:nth-child(2) {
								height: 24rpx;
								animation-delay: 0.2s;
							}

							&:nth-child(3) {
								height: 32rpx;
								animation-delay: 0.4s;
							}
						}

						&.has-animation {
							.wave {
								animation-play-state: running;
							}
						}
					}

					.voice-duration {
						font-size: 24rpx;
						color: #999;
					}
				}

				.image-scroll {
					margin-top: 24rpx;
					white-space: nowrap;

					.image-list {
						display: inline-block;

						image {
							width: 200rpx;
							height: 200rpx;
							margin-right: 16rpx;
							border-radius: 12rpx;
							display: inline-block;
						}
					}
				}
			}

			.response-content {
				font-size: 28rpx;
				color: #333;
				line-height: 1.6;
			}

			.transport-info {
				display: flex;
				justify-content: space-between;
				align-items: center;

				.transport-status {
					display: flex;
					align-items: center;

					.transport-icon {
						font-size: 28rpx;
						color: #333;
						margin-right: 12rpx;
					}

					text {
						font-size: 28rpx;
						color: #333;
					}
				}

				.fee {
					font-size: 32rpx;
					color: #FF9500;
					font-weight: 500;
				}
			}

			.contact-info {
				.info-item {
					display: flex;
					margin-bottom: 16rpx;

					&:last-child {
						margin-bottom: 0;
					}

					.label {
						font-size: 28rpx;
						color: #666;
						width: 100rpx;
					}

					.value {
						flex: 1;
						font-size: 28rpx;
						color: #333;
					}
				}
			}
		}
	}

	.footer {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background: #fff;
		padding: 24rpx 32rpx;
		display: flex;
		justify-content: flex-end;
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);

		.btn-reply {
			background: linear-gradient(135deg, #4468E8 0%, #5E7FFF 100%);
			color: #fff;
			font-size: 30rpx;
			font-weight: 500;
			padding: 16rpx 128rpx;
			border-radius: 10rpx;
			min-width: 400rpx;
			box-shadow: 0 8rpx 16rpx rgba(68, 104, 232, 0.2);
			transition: all 0.3s ease;

			&::after {
				border: none;
			}

			&:active {
				transform: translateY(2rpx);
				box-shadow: 0 4rpx 8rpx rgba(68, 104, 232, 0.2);
				opacity: 0.9;
			}
		}
	}
}

@keyframes waveAnimation {
	0% {
		transform: scaleY(1);
	}
	50% {
		transform: scaleY(0.4);
	}
	100% {
		transform: scaleY(1);
	}
}
</style>
