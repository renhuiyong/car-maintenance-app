<template>
	<view class="container">
		<view class="tab-bar">
			<view 
				class="tab-item" 
				:class="{ active: currentTab === 'ongoing' }"
				@tap="switchTab('ongoing')"
			>
				进行中
				<view class="tab-line" v-show="currentTab === 'ongoing'"></view>
			</view>
			<view 
				class="tab-item" 
				:class="{ active: currentTab === 'completed' }"
				@tap="switchTab('completed')"
			>
				已完成
				<view class="tab-line" v-show="currentTab === 'completed'"></view>
			</view>
		</view>
		<view class="order-list">
			<view class="order-wrapper">
				<block v-for="(order, index) in currentOrderList" :key="order.orderId">
					<view class="order-item">
						<view class="order-header">
							<text class="status">{{getStatusText(order.status, order)}}</text>
							<text class="distance">{{formatDistance(order.distance)}}</text>
						</view>
						<view class="order-time">{{order.time}}</view>
						<view class="order-location">
							<image class="location-icon" src="/static/images/location_icon.png"></image>
							<text>{{order.location}}</text>
						</view>
						<view class="order-issue">
							<text>{{order.issue}}</text>
							<view v-if="order.voice" class="voice-message" @tap="playVoice(order.voice)">
								<view class="voice-waves" :class="{ 'playing': playingVoiceId === order.voice }">
									<view class="wave"></view>
									<view class="wave"></view>
									<view class="wave"></view>
								</view>
								<text class="voice-duration">{{order.voiceDuration}}s</text>
							</view>
						</view>
						<view class="merchant-response" v-if="order.merchantResponse">
							<view class="response-title">商家回复</view>
							<view class="response-content" v-html="order.merchantResponse"></view>
						</view>
						<view class="order-footer">
							<view class="fee-info">
								<text class="fee-label">托运金额</text>
								<text v-if="order.needTransport" class="fee-amount">¥{{order.transportFee.toFixed(2)}}</text>
								<text v-else class="fee-amount">不需要托运</text>
							</view>
							<button class="btn-reply" v-if="!order.merchantResponse" @tap="handleReply(order)">回复客户</button>
						</view>
					</view>
				</block>
			</view>
		</view>
	</view>
</template>

<script>
import api from '@/api/index.js'

export default {
	data() {
		return {
			currentTab: 'ongoing',
			isRefreshing: false,
			orderList: [],
			statusMap: {
				'0': '待接单',
				'1': '已完成',
				'2': '已取消'
			},
			playingVoiceId: '',
			currentLocation: {
				latitude: null,
				longitude: null
			}
		}
	},
	computed: {
		currentOrderList() {
			return this.orderList.filter(order => {
				if (this.currentTab === 'ongoing') {
					return order.status === '0'
				} else {
					return order.status !== '0'
				}
			})
		}
	},
	onPullDownRefresh() {
		if (this.isRefreshing) return
		this.isRefreshing = true
		
		this.fetchOrderList()
	},
	async onLoad() {
		// 设置下拉刷新的样式（仅小程序有效）
		const pages = getCurrentPages()
		const page = pages[pages.length - 1]
		if (page && page.$getAppWebview) {
			const webview = page.$getAppWebview()
			webview.setStyle({
				pullToRefresh: {
					support: true,
					style: '@color: #FF9500;'
				}
			})
		}
		
		// 获取当前位置
		await this.getCurrentLocation()
		// 初始加载数据
		this.fetchOrderList()
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
		
		async fetchOrderList() {
			try {
				const res = await api.merchant.getOrderList()
				
				if (res.code === 200) {
					const formattedData = res.data.map(order => {
						// 计算距离
						const distance = this.calculateDistance(
							this.currentLocation.latitude,
							this.currentLocation.longitude,
							order.contactLatitude,
							order.contactLongitude
						)
						
						return {
							...order,
							transportFee: parseFloat(order.transportFee) || 0,
							distance: distance
						}
					})
					
					this.orderList = formattedData
				} else {
					uni.showToast({
						title: res.msg || '获取订单列表失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('获取订单列表失败:', error)
				uni.showToast({
					title: '获取订单列表失败',
					icon: 'none'
				})
			} finally {
				this.isRefreshing = false
				uni.stopPullDownRefresh()
			}
		},
		switchTab(tab) {
			this.currentTab = tab
		},
		handleReply(order) {
			// 将对象转为字符串传递
			const params = encodeURIComponent(JSON.stringify({
				orderId: order.orderId,
				createTime: order.time,
				description: order.issue,
				images: order.images || '',
				voicePath: order.voice || '',
				voiceDuration: order.voiceDuration || 0
			}))
			uni.navigateTo({
				url: `/pages/merchantOrderReply/merchantOrderReply?params=${params}`
			})
		},
		getStatusText(status, order) {
			// 如果有商家回复且状态是待接单，显示为待购买配件
			if (status === '0' && order.merchantResponse) {
				return '待用户购买配件'
			}
			return this.statusMap[status] || '未知状态'
		},
		formatDistance(distance) {
			if (typeof distance !== 'number') return '未知距离'
			if (distance < 1) {
				return (distance * 1000).toFixed(0) + 'm'
			}
			return distance.toFixed(1) + 'km'
		},
		playVoice(voiceUrl) {
			if (!voiceUrl) return
			
			if (this.playingVoiceId === voiceUrl) {
				if (this.audioContext) {
					this.audioContext.stop()
					this.audioContext = null
				}
				this.playingVoiceId = ''
				return
			}
			
			if (this.audioContext) {
				this.audioContext.stop()
			}
			
			this.audioContext = uni.createInnerAudioContext()
			this.audioContext.src = voiceUrl
			this.audioContext.play()
			this.playingVoiceId = voiceUrl
			
			this.audioContext.onEnded(() => {
				this.playingVoiceId = ''
				this.audioContext = null
			})
			
			this.audioContext.onError(() => {
				uni.showToast({
					title: '语音播放失败',
					icon: 'none'
				})
				this.playingVoiceId = ''
				this.audioContext = null
			})
		}
	}
}
</script>

<style>
.container {
	min-height: 100vh;
	height: 100vh;
	background: #F8F9FC;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	position: relative;
}

.tab-bar {
	display: flex;
	background: #FFFFFF;
	padding: 24rpx 32rpx 32rpx;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 1;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.tab-item {
	flex: 1;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	color: #666;
	position: relative;
	transition: all 0.3s ease;
	margin: 0 20rpx;
}

.tab-item.active {
	color: #FF9500;
	font-weight: 600;
}

.tab-line {
	position: absolute;
	bottom: -16rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 48rpx;
	height: 6rpx;
	background: #FF9500;
	border-radius: 6rpx;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.order-list {
	flex: 1;
	padding: 24rpx;
	padding-top: 148rpx;
	padding-bottom: 24rpx;
	box-sizing: border-box;
	overflow-y: auto;
	-webkit-overflow-scrolling: touch;
	position: relative;
}

.order-item {
	background: #FFFFFF;
	border-radius: 16rpx;
	padding: 28rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	margin-bottom: 24rpx;
	border: 1px solid rgba(0, 0, 0, 0.02);
}

.order-item:last-child {
	margin-bottom: 0;
}

.order-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;
	padding-bottom: 24rpx;
	border-bottom: 1px solid #F0F2F5;
}

.status {
	font-size: 32rpx;
	font-weight: 600;
	color: #FF9500;
}

.distance {
	font-size: 26rpx;
	color: #666;
	background: #F8F9FC;
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
	border: 1px solid #F0F2F5;
}

.order-time {
	font-size: 26rpx;
	color: #666;
	margin-bottom: 24rpx;
}

.order-location {
	display: flex;
	align-items: flex-start;
	margin-bottom: 24rpx;
	padding: 0;
}

.location-icon {
	width: 28rpx;
	height: 28rpx;
	margin-right: 12rpx;
	margin-top: 8rpx;
}

.order-location text {
	font-size: 28rpx;
	color: #333;
	flex: 1;
	line-height: 1.4;
}

.order-issue {
	background: #F8F9FC;
	padding: 24rpx;
	border-radius: 12rpx;
	margin-bottom: 24rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12rpx;
	border: 1px solid #F0F2F5;
}

.order-issue text {
	flex: 1;
	font-size: 28rpx;
	color: #333;
	line-height: 1.4;
}

.voice-message {
	display: flex;
	align-items: center;
	padding: 6rpx 12rpx;
	border-radius: 20rpx;
	cursor: pointer;
	background: #FFFFFF;
	flex-shrink: 0;
	min-width: 90rpx;
	border: 1px solid #F0F2F5;
	transition: all 0.3s ease;
}

.voice-message:active {
	background: #F8F9FC;
}

.voice-waves {
	display: flex;
	align-items: center;
	gap: 3rpx;
	margin-right: 8rpx;
	height: 24rpx;
}

.wave {
	width: 3rpx;
	height: 12rpx;
	background-color: #999;
	border-radius: 3rpx;
}

.wave:nth-child(2) {
	height: 16rpx;
}

.wave:nth-child(3) {
	height: 10rpx;
}

.playing .wave {
	animation: waveAnimation 1s ease-in-out infinite;
	background-color: #FF9500;
}

.playing .wave:nth-child(1) {
	animation-delay: 0s;
}

.playing .wave:nth-child(2) {
	animation-delay: 0.2s;
}

.playing .wave:nth-child(3) {
	animation-delay: 0.4s;
}

@keyframes waveAnimation {
	0%, 100% {
		height: 12rpx;
	}
	50% {
		height: 24rpx;
	}
}

.order-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	padding-top: 24rpx;
	margin-top: 0;
	border-top: 1px solid #F0F2F5;
}

.fee-info {
	display: flex;
	align-items: center;
	gap: 8rpx;
	flex: 1;
}

.fee-label {
	font-size: 26rpx;
	color: #666;
}

.fee-amount {
	font-size: 32rpx;
	color: #FF9500;
	font-weight: 600;
}

.btn-reply {
	background: transparent;
	color: #FF9500;
	font-size: 26rpx;
	padding: 10rpx 28rpx;
	border-radius: 24rpx;
	border: 1px solid #FF9500;
	transition: all 0.3s ease;
}

.btn-reply:active {
	background: rgba(255, 149, 0, 0.08);
	transform: scale(0.98);
}

.btn-reply::after {
	border: none;
}

.order-wrapper {
	min-height: 200rpx;
	padding-bottom: 24rpx;
}

.merchant-response {
	margin-top: 24rpx;
	padding: 24rpx;
	border-radius: 12rpx;
	background: #F8F9FC;
	border: 1px solid #F0F2F5;
}

.response-title {
	font-size: 26rpx;
	font-weight: 600;
	color: #666;
	margin-bottom: 12rpx;
}

.response-content {
	font-size: 28rpx;
	color: #333;
	line-height: 1.4;
}
</style> 