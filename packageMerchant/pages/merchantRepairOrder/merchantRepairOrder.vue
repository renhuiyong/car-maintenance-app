<template>
	<view class="orders-container">
		<!-- 订单类型切换 -->
		<view class="order-type-bar">
			<view 
				v-for="(type, typeIndex) in orderTypes" 
				:key="typeIndex"
				:class="['type-item', currentOrderType === typeIndex ? 'active' : '']"
				@click="switchOrderType(typeIndex)"
			>
				{{ type }}
			</view>
		</view>

		<!-- 顶部标签切换 -->
		<view class="tab-bar">
			<view 
				v-for="(item, index) in currentTabs" 
				:key="index"
				:class="['tab-item', currentTab === index ? 'active' : '']"
				@click="switchTab(index)"
			>
				{{ item }}
			</view>
		</view>
		
		<!-- 订单列表 -->
		<scroll-view 
			scroll-y 
			class="order-list"
			@scrolltolower="loadMore"
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<!-- 维修订单 -->
			<template v-if="currentOrderType === 0">
				<view 
					class="order-item repair-order"
					v-for="(order, index) in orderList" 
					:key="index"
				>
					<!-- 订单状态 -->
					<view class="order-header" @tap="goToRepairOrderDetail(order)">
						<text class="status" v-if="order.status !== '2'">{{getStatusDetailText(order.statusDetail)}}</text>
						<text class="status" v-else>已取消</text>
					</view>
					
					<!-- 订单内容 -->
					<view class="order-content">
						<view class="content-wrapper" @tap="goToRepairOrderDetail(order)">
							<view class="order-time">{{order.time}}</view>
							<view class="order-location">
								<text class="location-text">位置：</text>
								<text>{{order.location}}</text>
							</view>
							<view class="order-issue">
								<text>{{order.issue}}</text>
								<view v-if="order.voice" class="voice-message" @tap.stop="playVoice(order.voice)">
									<view class="voice-waves" :class="{ 'has-animation': playingVoiceId === order.voice }" :style="{ '--play-state': isPlaying ? 'running' : 'paused' }">
										<view class="wave"></view>
										<view class="wave"></view>
										<view class="wave"></view>
									</view>
									<text class="voice-duration">{{order.voiceDuration}}s</text>
								</view>
							</view>
						</view>
						<view class="order-footer">
							<view class="fee-info">
								<text class="fee-label">托运金额</text>
								<text v-if="order.needTransport" class="fee-amount">¥{{order.transportFee.toFixed(2)}}</text>
								<text v-else class="fee-amount">不需要托运</text>
							</view>
							<view class="btn-group" v-if="order.statusDetail === '2' && order.status === '0'">
								<view class="btn btn-cancel" @tap.prevent.stop="handleCancelOrder(order)">取消订单</view>
								<view class="btn btn-reply" @tap.prevent.stop="handleStartRepair(order)">开始维修</view>
							</view>
							<button class="btn-reply" v-else-if="order.statusDetail === '0' && order.status === '0'" @tap.stop="handleReply(order)">回复客户</button>
							<button class="btn-reply" v-else-if="order.statusDetail === '3' && order.status === '0'" @tap.stop="handleFinishRepair(order)">维修完成</button>
						</view>
					</view>
				</view>
			</template>

			<!-- 商品订单 -->
			<template v-else>
				<view 
					class="order-item product-order"
					v-for="(order, index) in orderList" 
					:key="index"
				>
					<!-- 订单状态 -->
					<view class="order-status">
						<text>{{getProductStatusText(order)}}</text>
					</view>
					
					<!-- 订单内容 -->
					<view class="order-content">
						<view class="order-header">
							<text class="shop-name">{{order.shopName}}</text>
							<text class="order-no">订单号：{{order.orderNo}}</text>
						</view>
						<view class="time">{{order.createTime}}</view>
						<!-- 商品信息 -->
						<view class="product-info" v-for="(item, itemIndex) in order.shopOrderItems" :key="itemIndex">
							<image class="product-image" :src="baseUrl + item.goodsImage" mode="aspectFill"></image>
							<view class="product-detail">
								<view class="product-name">{{item.goodsName}}</view>
								<view class="product-price">
									<text class="price">¥{{item.price}}</text>
									<text class="quantity">x{{item.quantity}}</text>
								</view>
							</view>
						</view>
						<!-- 订单总价 -->
						<view class="order-total">
							<text>共{{getOrderItemCount(order)}}件商品</text>
							<text>合计：¥{{order.totalAmount}}</text>
						</view>
						<!-- 按钮区域 -->
						<view class="action-buttons">
							<view class="btn cancel" @tap="handleCancelOrder(order)">取消订单</view>
							<view class="btn confirm" @tap="handleDelivery(order)">确认提货</view>
						</view>
					</view>
				</view>
			</template>
			
			<!-- 空状态 -->
			<view v-if="orderList.length === 0" class="empty-state">
				<image class="empty-icon" src="/static/images/empty.png"></image>
				<text class="empty-text">暂无相关订单</text>
			</view>
			
			<!-- 加载更多 -->
			<view class="loading-more" v-if="loading && orderList.length > 0">加载中...</view>
			<view class="no-more" v-if="!hasMore && orderList.length > 0">没有更多了</view>
		</scroll-view>
	</view>
</template>

<script>
import api from '@/api/index.js'
import request from '@/utils/request'

export default {
	data() {
		return {
			baseUrl: request.BASE_URL_OSS,
			orderTypes: ['维修订单', '商品订单'],
			currentOrderType: 0, // 0: 维修订单, 1: 商品订单
			repairTabs: ['进行中', '已完成', '已取消'],
			productTabs: ['待提货', '已完成', '已取消'],
			currentTab: 0,
			orderList: [],
			page: 1,
			loading: false,
			hasMore: true,
			refreshing: false,
			pageSize: 10,
			total: 0,
			playingVoiceId: '',
			isPlaying: false,  // 新增：音频是否正在播放
			audioContext: null,
			currentLocation: {
				latitude: null,
				longitude: null
			}
		}
	},
	
	computed: {
		currentTabs() {
			return this.currentOrderType === 0 ? this.repairTabs : this.productTabs
		}
	},
	
	onLoad() {
		this.getCurrentLocation()
		this.getOrderList()
		
		// 添加订单刷新事件监听
		uni.$on('refreshRepairOrderList', this.refreshData)
	},
	
	onUnload() {
		// 移除事件监听
		uni.$off('refreshRepairOrderList', this.refreshData)
		// 销毁音频实例
		if (this.audioContext) {
			this.audioContext.destroy()
		}
	},
	
	methods: {
		// 添加刷新数据方法
		refreshData() {
			this.page = 1
			this.orderList = []
			this.hasMore = true
			this.getOrderList()
		},
		
		// 切换订单类型
		switchOrderType(typeIndex) {
			if (this.currentOrderType === typeIndex) return
			this.currentOrderType = typeIndex
			this.currentTab = 0
			this.page = 1
			this.orderList = []
			this.hasMore = true
			this.getOrderList()
		},

		// 切换标签
		switchTab(index) {
			if (this.currentTab === index) return
			this.currentTab = index
			this.page = 1
			this.orderList = []
			this.hasMore = true
			this.getOrderList()
		},
		
		// 获取订单列表
		async getOrderList() {
			if (this.loading || !this.hasMore) return
			this.loading = true
			
			try {
				const params = {
					pageNum: this.page,
					pageSize: this.pageSize
				}
				
				let res
				if (this.currentOrderType === 0) {
					// 维修订单
					const statusMap = {
						0: '0',  // 进行中
						1: '1',  // 已完成
						2: '2'   // 已取消
					}
					params.status = statusMap[this.currentTab]
					res = await api.merchant.getOrderList(params)
					
					if (res.code === 200) {
						const formattedData = (res.data || []).map(order => {
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
						
						if (this.page === 1) {
							this.orderList = formattedData
						} else {
							this.orderList = [...this.orderList, ...formattedData]
						}
						
						this.total = res.total || 0
					}
				} else {
					// 商品订单
					const statusMap = {
						0: '0',  // 进行中
						1: '1',  // 已完成
						2: '2'   // 已取消
					}
					params.status = statusMap[this.currentTab]
					res = await api.merchant.getMerchantShopOrderList(params)
					
					if (res.code === 200) {
						const { rows, total } = res
						this.total = total
						
						if (rows && rows.length > 0) {
							if (this.page === 1) {
								this.orderList = rows
							} else {
								this.orderList = [...this.orderList, ...rows]
							}
						}
					}
				}
				
				if (res.code === 200) {
					this.hasMore = this.orderList.length < (res.total || 0)
					if (this.hasMore) {
						this.page++
					}
				}
			} catch (err) {
				console.error('获取订单列表失败:', err)
				uni.showToast({
					title: '获取订单列表失败',
					icon: 'none'
				})
			} finally {
				this.loading = false
				if (this.refreshing) {
					this.refreshing = false
					uni.stopPullDownRefresh()
				}
			}
		},
		
		// 获取维修订单状态文本
		getStatusDetailText(statusDetail) {
			if (statusDetail === '0') return '等待商家回复'
			if (statusDetail === '1') return '商家已回复，待购买配件'
			if (statusDetail === '2') return '已购买配件，待维修'
			if (statusDetail === '3') return '已开始维修'
			if (statusDetail === '4') return '已维修完成'
			return '未知状态'
		},
		
		// 获取商品订单状态文本
		getProductStatusText(order) {
			const statusMap = {
				'0': '进行中',
				'1': '已完成',
				'2': '已取消'
			}
			return statusMap[order.status] || '未知状态'
		},
		
		// 获取商品订单商品总数
		getOrderItemCount(order) {
			return order.shopOrderItems.reduce((total, item) => total + item.quantity, 0)
		},
		
		// 获取当前位置
		async getCurrentLocation() {
			try {
				const authRes = await new Promise((resolve, reject) => {
					uni.getSetting({
						success: resolve,
						fail: reject
					})
				})
				
				// 如果未授权，先获取授权
				if (!authRes.authSetting['scope.userLocation']) {
					await new Promise((resolve, reject) => {
						uni.authorize({
							scope: 'scope.userLocation',
							success: resolve,
							fail: reject
						})
					})
				}
				
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
				// 打开设置页面让用户开启定位权限
				uni.showModal({
					title: '温馨提示',
					content: '需要获取您的地理位置才能为您提供更好的服务，是否前往设置打开定位权限？',
					success: (res) => {
						if (res.confirm) {
							uni.openSetting({
								success: (settingRes) => {
									if (settingRes.authSetting['scope.userLocation']) {
										// 用户在设置页面打开了定位权限，重新获取位置
										this.getCurrentLocation()
									}
								}
							})
						}
					}
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
		
		formatDistance(distance) {
			if (typeof distance !== 'number') return '未知距离'
			if (distance < 1) {
				return (distance * 1000).toFixed(0) + 'm'
			}
			return distance.toFixed(1) + 'km'
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
			this.audioContext.src = this.baseUrl + voiceUrl
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
		
		// 回复客户
		handleReply(order) {
			const params = encodeURIComponent(JSON.stringify({
				orderId: order.orderId,
				createTime: order.time,
				description: order.issue,
				images: order.images || '',
				voicePath: order.voice || '',
				voiceDuration: order.voiceDuration || 0,
				needTransport: order.needTransport,
				transportFee: order.transportFee,
				grabStatus: order.grabStatus
			}))
			uni.navigateTo({
				url: `/packageMerchant/pages/merchantOrderReply/merchantOrderReply?params=${params}`
			})
		},
		
		// 开始维修
		async handleStartRepair(order) {
			uni.showModal({
				title: '确认开始维修',
				content: '确定要开始维修该订单吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							const res = await api.merchant.startRepair(order.orderId)
							
							if (res.code === 200) {
								uni.showToast({
									title: '已开始维修',
									icon: 'success'
								})
								this.refreshOrderList()
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
		async handleFinishRepair(order) {
			uni.showModal({
				title: '确认完成维修',
				content: '确定已完成维修吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							const res = await api.merchant.finishRepair(order.orderId)
							
							if (res.code === 200) {
								uni.showToast({
									title: '维修已完成',
									icon: 'success'
								})
								this.refreshOrderList()
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
		
		// 确认提货
		async handleDelivery(order) {
			uni.showModal({
				title: '确认提货',
				content: '确定要确认该订单已提货吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							const res = await api.merchant.confirmDelivery({
								orderNo: order.orderNo
							})
							
							if (res.code === 200) {
								uni.showToast({
									title: '已确认提货',
									icon: 'success'
								})
								this.refreshOrderList()
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
		
		// 取消订单
		async handleCancelOrder(order) {
			uni.showModal({
				title: '取消订单',
				content: '确定要取消该订单吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							const res = await api.merchant.merchantCancelRepairOrder({
								orderId: order.orderId
							})
							
							if (res.code === 200) {
								uni.showToast({
									title: '订单已取消',
									icon: 'success'
								})
								this.refreshOrderList()
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
		
		// 刷新订单列表
		refreshOrderList() {
			this.page = 1
			this.hasMore = true
			this.orderList = []
			this.getOrderList()
		},
		
		// 下拉刷新
		async onRefresh() {
			this.refreshing = true
			this.refreshOrderList()
		},
		
		// 加载更多
		loadMore() {
			if (this.hasMore && !this.loading) {
				this.getOrderList()
			}
		},
		
		// 跳转到维修订单详情页
		goToRepairOrderDetail(order) {
			const params = encodeURIComponent(JSON.stringify({
				orderId: order.orderId,
				status: order.status,
				statusDetail: order.statusDetail,
				time: order.time,
				location: order.location,
				issue: order.issue,
				images: order.images || '',
				voice: order.voice || '',
				voiceDuration: order.voiceDuration || 0,
				merchantResponse: order.merchantResponse || '',
				needTransport: order.needTransport,
				transportFee: order.transportFee,
				distance: order.distance,
				contactLatitude: order.contactLatitude,
				contactLongitude: order.contactLongitude,
				contactName: order.contactName || '',
				contactPhone: order.contactPhone || '',
				contactAddress: order.contactAddress || '',
				grabStatus: order.grabStatus
			}))
			uni.navigateTo({
				url: `/packageMerchant/pages/merchantRepairOrderDetail/merchantRepairOrderDetail?params=${params}`
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.orders-container {
	min-height: 100vh;
	background-color: #f7f8fa;
	
	.order-type-bar {
		display: flex;
		background: #fff;
		padding: 0 32rpx;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		border-bottom: 1rpx solid #eee;
		
		.type-item {
			flex: 1;
			text-align: center;
			font-size: 32rpx;
			color: #999;
			position: relative;
			padding: 32rpx 0;
			
			&.active {
				color: #4468E8;
				font-weight: 500;
				
				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 40rpx;
					height: 4rpx;
					background: #4468E8;
					border-radius: 2rpx;
				}
			}
		}
	}

	.tab-bar {
		display: flex;
		background: #fff;
		padding: 0 32rpx;
		position: fixed;
		top: 96rpx;
		left: 0;
		right: 0;
		z-index: 100;
		
		.tab-item {
			flex: 1;
			text-align: center;
			font-size: 28rpx;
			color: #999;
			position: relative;
			padding: 32rpx 0;
			
			&.active {
				color: #4468E8;
				font-weight: 500;
				
				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 40rpx;
					height: 4rpx;
					background: #4468E8;
					border-radius: 2rpx;
				}
			}
		}
	}
	
	.order-list {
		padding: 216rpx 32rpx 32rpx;
		box-sizing: border-box;
		height: 100vh;
	}
	
	.order-item {
		background: #fff;
		border-radius: 16rpx;
		margin-bottom: 24rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.02);
		
		.order-header {
			padding: 24rpx 32rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1rpx solid #eee;
			min-height: 48rpx;
			
			.status {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
				
				&:only-child {
					margin: 0 auto;
				}
			}
			
			.distance {
				font-size: 28rpx;
				color: #666;
			}
		}
		
		.order-content {
			padding: 24rpx 0;
			
			.content-wrapper {
				margin-bottom: 16rpx;
				padding: 0 32rpx;
			}
			
			.order-time {
				font-size: 26rpx;
				color: #999;
				margin-bottom: 16rpx;
			}
			
			.order-location {
				display: flex;
				align-items: center;
				margin-bottom: 16rpx;
				
				.location-text {
					font-size: 28rpx;
					color: #333;
					margin-right: 8rpx;
					min-width: 84rpx;
				}
				
				text {
					font-size: 28rpx;
					color: #333;
				}
			}
			
			.order-issue {
				background: #f7f8fa;
				padding: 24rpx;
				border-radius: 12rpx;
				margin-bottom: 16rpx;
				margin: 0 32rpx 16rpx;
				
				text {
					font-size: 28rpx;
					color: #333;
					line-height: 1.5;
				}
				
				.voice-message {
					display: flex;
					align-items: center;
					margin-top: 16rpx;
					
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
							
							&:nth-child(2) {
								height: 24rpx;
							}
							
							&:nth-child(3) {
								height: 32rpx;
							}
						}
						
						&.has-animation {
							.wave {
								animation: waveAnimation 1s infinite;
								animation-play-state: var(--play-state, paused);
								
								&:nth-child(2) {
									animation-delay: 0.2s;
								}
								
								&:nth-child(3) {
									animation-delay: 0.4s;
								}
							}
						}
					}
					
					.voice-duration {
						font-size: 24rpx;
						color: #999;
					}
				}
			}
		}
		
		.order-footer {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-top: 32rpx;
			padding: 0;
			
			.fee-info {
				display: flex;
				align-items: center;
				margin-left: 32rpx;
				
				.fee-label {
					font-size: 28rpx;
					color: #666;
					margin-right: 8rpx;
				}
				
				.fee-amount {
					font-size: 40rpx;
					color: #FF9500;
					font-weight: 500;
				}
			}
			
			.btn-reply {
				margin-right: 32rpx;
				background: #4468E8;
				color: #fff;
				font-size: 28rpx;
				padding: 12rpx 24rpx;
				border-radius: 8rpx;
				border: none;
				line-height: 1.5;
				
				&::after {
					border: none;
				}
			}
		}
	}
	
	// 商品订单特有样式
	.product-order {
		.order-status {
			padding: 24rpx 32rpx;
			border-bottom: 1rpx solid #eee;
			
			text {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
			}
		}
		
		.order-content {
			padding: 0 32rpx;
			
			.order-header {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				padding: 20rpx 0;
				border-bottom: 1rpx solid #eee;
				
				.shop-name {
					font-size: 30rpx;
					color: #333;
					font-weight: 500;
					margin-bottom: 12rpx;
					text-align: left;
				}
				
				.order-no {
					font-size: 26rpx;
					color: #999;
					text-align: left;
				}
			}
			
			.time {
				font-size: 26rpx;
				color: #999;
				margin: 16rpx 0;
			}
			
			.product-info {
				display: flex;
				padding: 20rpx 0;
				border-bottom: 1rpx solid #eee;
				
				.product-image {
					width: 160rpx;
					height: 160rpx;
					border-radius: 8rpx;
					margin-right: 20rpx;
				}
				
				.product-detail {
					flex: 1;
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					
					.product-name {
						font-size: 28rpx;
						color: #333;
						line-height: 1.4;
					}
					
					.product-price {
						display: flex;
						justify-content: space-between;
						align-items: center;
						
						.price {
							font-size: 32rpx;
							color: #FF9500;
							font-weight: 500;
						}
						
						.quantity {
							font-size: 26rpx;
							color: #999;
						}
					}
				}
			}
			
			.order-total {
				display: flex;
				justify-content: flex-end;
				align-items: center;
				padding: 20rpx 0;
				font-size: 28rpx;
				border-bottom: 1rpx solid #eee;
				
				text {
					margin-left: 20rpx;
					&:last-child {
						color: #FF9500;
						font-weight: 500;
					}
				}
			}
			
			.action-buttons {
				display: flex;
				justify-content: flex-end;
				padding: 20rpx 0;
				gap: 20rpx;
				
				.btn {
					padding: 12rpx 32rpx;
					font-size: 28rpx;
					border-radius: 8rpx;
					
					&.confirm {
						background: #4468E8;
						color: #fff;
					}
					
					&.cancel {
						background: #fff;
						color: #666;
						border: 1rpx solid #ddd;
					}
					
					&:active {
						opacity: 0.8;
					}
				}
			}
			
			.btn-row {
				display: flex;
				justify-content: flex-end;
				margin-top: 24rpx;
				
				.btn {
					border-radius: 8rpx;
					padding: 16rpx 32rpx;
					font-size: 28rpx;
					min-width: 160rpx;
					text-align: center;
					margin-left: 16rpx;
					
					&::after {
						border: none;
					}
					
					&:active {
						opacity: 0.8;
					}
					
					&.primary {
						background: #4468E8;
						color: #fff;
					}
				}
			}
		}
	}
	
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
		
		.empty-icon {
			width: 200rpx;
			height: 200rpx;
			margin-bottom: 32rpx;
		}
		
		.empty-text {
			font-size: 28rpx;
			color: #999;
		}
	}
	
	.loading-more,
	.no-more {
		text-align: center;
		padding: 20rpx;
		color: #999;
		font-size: 24rpx;
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