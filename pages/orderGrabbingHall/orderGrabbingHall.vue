<template>
	<view class="order-grabbing-hall">
		<!-- 订单列表 -->
		<scroll-view 
			v-if="showContent"
			scroll-y 
			class="order-list" 
			@scrolltolower="loadMore" 
			refresher-enabled
			:refresher-triggered="isRefreshing" 
			@refresherrefresh="onRefresh"
		>
			<!-- 骨架屏 -->
			<template v-if="loading">
				<view class="skeleton-item" v-for="i in 3" :key="i">
					<view class="skeleton-header">
						<view class="skeleton-time"></view>
						<view class="skeleton-distance"></view>
					</view>
					<view class="skeleton-location"></view>
					<view class="skeleton-description"></view>
					<view class="skeleton-footer">
						<view class="skeleton-price"></view>
						<view class="skeleton-button"></view>
					</view>
				</view>
			</template>

			<!-- 订单列表内容 -->
			<template v-else>
				<view class="order-item" v-for="(item, index) in orderList" :key="index" @tap="goToDetail(item)">
					<view class="time-distance">
						<text class="time">{{ item.createTime }}</text>
						<text class="distance">{{ formatDistance(item.distance) }}</text>
					</view>
					<view class="location">
						<text>{{ item.contactAddress }}</text>
					</view>
					<view class="description">
						<text>{{ item.description }}</text>
					</view>
					<view class="price-action">
						<view class="price-wrapper">
							<text class="label">是否托运  </text>
							<text class="price">{{ item.needTransport === 1 ? '需要' : '不需要' }}</text>
						</view>
						<button class="grab-btn" @tap.stop="grabOrder(item)" :style="{ opacity: item.grabStatus === 1 ? 0.5 : 1 }">
							{{ item.grabStatus === 1 ? '已抢单' : '马上抢' }}
						</button>
					</view>
				</view>
				
				<!-- 加载更多 -->
				<view class="loading-more" v-if="orderList.length > 0">
					{{ hasMore ? '加载中...' : '没有更多了' }}
				</view>
				
				<!-- 空状态 -->
				<view class="empty-state" v-if="orderList.length === 0">
					<image src="/static/images/empty.png" mode="aspectFit"></image>
					<text>暂无可抢订单</text>
				</view>
			</template>
		</scroll-view>
		
		<!-- 未通过审核时的状态页面 -->
		<view v-else class="status-page">
			<image class="status-icon" src="/static/images/empty.png" mode="aspectFit"></image>
			<text class="status-text">{{ getStatusMessage() }}</text>
		</view>
	</view>
</template>

<script>
	import api from '../../api/index.js'
	import request from '../../utils/request.js'
	
	export default {
		data() {
			return {
				orderList: [],
				page: 1,
				hasMore: true,
				isRefreshing: false,
				examineStatus: null,
				showContent: true,
				latitude: '',
				longitude: '',
				loading: true
			}
		},
		created() {
			// 先检查位置权限
			this.checkLocationAuth()
		},
		onLoad() {
			// 移除这里的加载，统一由checkShopStatus来控制
		},
		methods: {
			// 检查位置权限
			checkLocationAuth() {
				uni.getSetting({
					success: (res) => {
						if (!res.authSetting['scope.userLocation']) {
							// 未授权，显示授权弹窗
							uni.authorize({
								scope: 'scope.userLocation',
								success: () => {
									// 授权成功，获取位置并检查商家状态
									this.getLocation().then(() => {
										this.checkShopStatus()
									})
								},
								fail: () => {
									// 拒绝授权，引导用户去设置页面开启
									uni.showModal({
										title: '提示',
										content: '需要获取您的位置信息，请在设置中打开位置权限',
										confirmText: '去设置',
										success: (res) => {
											if (res.confirm) {
												uni.openSetting({
													success: (settingRes) => {
														if (settingRes.authSetting['scope.userLocation']) {
															// 设置页面开启后，获取位置并检查商家状态
															this.getLocation().then(() => {
																this.checkShopStatus()
															})
														} else {
															uni.showToast({
																title: '获取位置权限失败',
																icon: 'none',
																duration: 2000
															})
															setTimeout(() => {
																uni.navigateBack()
															}, 2000)
														}
													}
												})
											} else {
												uni.showToast({
													title: '需要位置权限才能抢单',
													icon: 'none',
													duration: 2000
												})
												setTimeout(() => {
													uni.navigateBack()
												}, 2000)
											}
										}
									})
								}
							})
						} else {
							// 已授权，直接获取位置并检查商家状态
							this.getLocation().then(() => {
								this.checkShopStatus()
							})
						}
					},
					fail: () => {
						uni.showToast({
							title: '获取授权信息失败',
							icon: 'none',
							duration: 2000
						})
						setTimeout(() => {
							uni.navigateBack()
						}, 2000)
					}
				})
			},
			// 检查商家状态
			async checkShopStatus() {
				try {
					const res = await api.merchant.getShopSelfExamineStatus()
					if (res.code === 200) {
						const status = res.data.examineStatus
						this.examineStatus = status
						this.showContent = status === 3
						// 只有状态为3(已通过)才能查看抢单大厅
						if (status !== 3) {
							let message = ''
							switch (status) {
								case 0:
									message = '您的入驻申请正在审核中'
									break
								case 1:
									message = '请先缴纳保证金'
									break
								case 2:
									message = '等待平台审核保证金'
									break
								case 4:
									message = '很抱歉，您的入驻申请未通过'
									break
								case 5:
									message = '请先完成商家入驻申请'
									break
								default:
									message = '暂时无法抢单'
							}
							
							uni.showToast({
								title: message,
								icon: 'none',
								duration: 2000
							})
						} else {
							// 状态为3时加载订单
							this.loadOrders()
						}
					}
				} catch (e) {
					uni.showToast({
						title: '获取商家状态失败',
						icon: 'none'
					})
					setTimeout(() => {
							uni.navigateBack()
					}, 2000)
				} finally {
					// 如果不是已通过状态，关闭loading
					if (this.examineStatus !== 3) {
						this.loading = false
					}
				}
			},
			// 获取当前位置
			getLocation() {
				return new Promise((resolve, reject) => {
					uni.getLocation({
						type: 'gcj02',
						success: (res) => {
							this.latitude = res.latitude
							this.longitude = res.longitude
							resolve()
						},
						fail: (err) => {
							uni.showToast({
								title: '获取位置失败，请检查定位权限',
								icon: 'none',
								duration: 2000
							})
							reject(err)
						}
					})
				})
			},
			// 加载订单列表
			async loadOrders() {
				// 如果没有经纬度，重新获取位置
				if (!this.latitude || !this.longitude) {
					try {
						await this.getLocation()
					} catch (e) {
						uni.showToast({
							title: '无法获取位置信息，请检查定位权限',
							icon: 'none',
							duration: 2000
						})
						return
					}
				}
				
				// 第一页时显示骨架屏
				if (this.page === 1) {
					this.loading = true
				}
				
				try {
					const res = await api.merchant.getGrabOrderList({
						pageNum: this.page,
						pageSize: 10,
						latitude: this.latitude,
						longitude: this.longitude
					})
					
					if (res.code === 200) {
						if (this.page === 1) {
							this.orderList = res.data || []
						} else {
							this.orderList = [...this.orderList, ...(res.data || [])]
						}
						
						this.hasMore = res.data?.length === 10
					} else {
						uni.showToast({
							title: res.msg || '加载失败',
							icon: 'none'
						})
					}
				} catch (e) {
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					})
				} finally {
					this.loading = false
				}
			},
			
			// 加载更多
			loadMore() {
				if (!this.hasMore) return
				this.page++
				this.loadOrders()
			},
			
			// 格式化距离显示
			formatDistance(distance) {
				const meters = distance * 1000;
				if (meters >= 1000) {
					// 大于等于1000米时显示千米，保留一位小数
					return `${(meters / 1000).toFixed(1)}km`;
				} else {
					// 小于1000米时显示米，不带小数
					return `${Math.round(meters)}m`;
				}
			},
			
			// 下拉刷新
			async onRefresh() {
				this.isRefreshing = true
				this.page = 1
				await this.loadOrders()
				this.isRefreshing = false
			},
			
			// 抢单
			async grabOrder(item) {
				if (item.grabStatus === 1) {
					uni.showToast({
						title: '该订单已被抢',
						icon: 'none'
					})
					return
				}
				
				// 显示确认弹窗
				uni.showModal({
					title: '确认抢单',
					content: '确定要抢这个订单吗？',
					success: async (res) => {
						if (res.confirm) {
							try {
								const res = await api.merchant.grabOrder({
									orderId: item.orderId
								})
								
								if (res.code === 200) {
									// 更新本地状态
									const index = this.orderList.findIndex(order => order.orderId === item.orderId)
									if (index !== -1) {
										this.orderList[index].grabStatus = 1
									}
									
									uni.showToast({
										title: '抢单成功',
										icon: 'success'
									})
								} else if (res.code === 500) {
									uni.showToast({
										title: res.msg ,
										icon: 'none'
									})
								} else {
									uni.showToast({
										title: res.msg || '抢单失败',
										icon: 'none'
									})
								}
							} catch (e) {
								uni.showToast({
									title: e.msg || e.message || '抢单失败',
									icon: 'none'
								})
							}
						}
					}
				})
			},
			
			// 获取状态信息
			getStatusMessage() {
				switch (this.examineStatus) {
					case 0:
						return '您的入驻申请正在审核中'
					case 1:
						return '请先缴纳保证金'
					case 2:
						return '等待平台审核保证金'
					case 4:
						return '很抱歉，您的入驻申请未通过'
					case 5:
						return '请先完成商家入驻申请'
					default:
						return '暂时无法抢单'
				}
			},
			
			// 跳转到详情页
			goToDetail(item) {
				uni.navigateTo({
					url: `/packageOrder/pages/orderGrabbingHallDetail/orderGrabbingHallDetail?orderId=${item.orderId}`
				})
			},
		}
	}
</script>

<style lang="scss">
	.order-grabbing-hall {
		min-height: 100vh;
		background-color: #F5F6FA;
		
		.order-list {
			height: 100vh;
			padding: 20rpx;
			box-sizing: border-box;
			
			.order-item {
				margin-bottom: 20rpx;
				padding: 30rpx;
				background-color: #fff;
				border-radius: 16rpx;
				box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
				position: relative;
				
				&:active {
					opacity: 0.7;
				}
				
				.time-distance {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 20rpx;
					
					.time {
						font-size: 28rpx;
						color: #333;
						font-weight: 500;
						line-height: 40rpx;
					}
					
					.distance {
						font-size: 28rpx;
						color: #999;
						line-height: 40rpx;
					}
				}
				
				.location {
					margin-bottom: 20rpx;
					display: flex;
					align-items: center;
					
					text {
						font-size: 28rpx;
						color: #666;
						position: relative;
						padding-left: 24rpx;
						line-height: 40rpx;
						display: flex;
						align-items: center;
						
						&::before {
							content: '';
							position: absolute;
							left: 0;
							top: 50%;
							transform: translateY(-50%);
							width: 10rpx;
							height: 10rpx;
							background-color: #999;
							border-radius: 50%;
						}
					}
				}
				
				.description {
					margin-bottom: 24rpx;
					padding: 24rpx;
					background-color: #F8F9FC;
					border-radius: 12rpx;
					display: flex;
					align-items: center;
					
					text {
						font-size: 28rpx;
						color: #666;
						line-height: 40rpx;
					}
				}
				
				.price-action {
					display: flex;
					justify-content: space-between;
					align-items: center;
					
					.price-wrapper {
						display: flex;
						align-items: center;
						
						.label {
							font-size: 26rpx;
							color: #999;
							margin-right: 16rpx;
							line-height: 40rpx;
						}
						
						.price {
							font-size: 32rpx;
							color: #333;
							font-weight: bold;
							line-height: 40rpx;
						}
					}
					
					.grab-btn {
						margin: 0;
						padding: 0 48rpx;
						height: 72rpx;
						background-color: #FF6B00;
						color: #fff;
						font-size: 28rpx;
						border-radius: 36rpx;
						border: none;
						display: flex;
						align-items: center;
						justify-content: center;
						transition: all 0.3s ease;
						
						&::after {
							border: none;
						}
						
						&:active {
							transform: scale(0.98);
							opacity: 0.9;
						}
					}
				}
			}
			
			.loading-more {
				text-align: center;
				font-size: 24rpx;
				color: #999;
				padding: 30rpx 0;
				line-height: 40rpx;
			}
			
			.empty-state {
				padding-top: 200rpx;
				text-align: center;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				
				image {
					width: 240rpx;
					height: 240rpx;
					margin-bottom: 30rpx;
				}
				
				text {
					font-size: 28rpx;
					color: #999;
					line-height: 40rpx;
				}
			}
			
			// 骨架屏样式
			.skeleton-item {
				margin-bottom: 20rpx;
				padding: 30rpx;
				background-color: #fff;
				border-radius: 16rpx;
				box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
				
				.skeleton-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 20rpx;
					
					.skeleton-time {
						width: 200rpx;
						height: 32rpx;
						background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
						background-size: 400% 100%;
						animation: skeleton-loading 1.4s ease infinite;
						border-radius: 4rpx;
					}
					
					.skeleton-distance {
						width: 100rpx;
						height: 32rpx;
						background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
						background-size: 400% 100%;
						animation: skeleton-loading 1.4s ease infinite;
						border-radius: 4rpx;
					}
				}
				
				.skeleton-location {
					width: 60%;
					height: 32rpx;
					background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
						background-size: 400% 100%;
						animation: skeleton-loading 1.4s ease infinite;
						margin-bottom: 20rpx;
						border-radius: 4rpx;
				}
				
				.skeleton-description {
					width: 100%;
					height: 120rpx;
					background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
					background-size: 400% 100%;
					animation: skeleton-loading 1.4s ease infinite;
					margin-bottom: 24rpx;
					border-radius: 12rpx;
				}
				
				.skeleton-footer {
					display: flex;
					justify-content: space-between;
					align-items: center;
					
					.skeleton-price {
						width: 200rpx;
						height: 32rpx;
						background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
						background-size: 400% 100%;
						animation: skeleton-loading 1.4s ease infinite;
						border-radius: 4rpx;
					}
					
					.skeleton-button {
						width: 160rpx;
						height: 72rpx;
						background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
						background-size: 400% 100%;
						animation: skeleton-loading 1.4s ease infinite;
						border-radius: 36rpx;
					}
				}
			}
		}
		
		.status-page {
			height: 100vh;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 0 40rpx;
			box-sizing: border-box;
			background-color: #fff;
			
			.status-icon {
				width: 240rpx;
				height: 240rpx;
				margin-bottom: 40rpx;
			}
			
			.status-text {
				font-size: 32rpx;
				color: #666;
				text-align: center;
				line-height: 40rpx;
				margin-bottom: 60rpx;
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
</style> 