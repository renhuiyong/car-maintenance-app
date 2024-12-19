<template>
	<view class="order-grabbing-hall">
		<!-- 订单列表 -->
		<scroll-view 
			scroll-y 
			class="order-list" 
			@scrolltolower="loadMore" 
			refresher-enabled
			:refresher-triggered="isRefreshing" 
			@refresherrefresh="onRefresh"
		>
			<view class="order-item" v-for="(item, index) in orderList" :key="index">
				<view class="time-distance">
					<text class="time">{{ item.time }}</text>
					<text class="distance">{{ item.distance }}</text>
				</view>
				<view class="location">
					<text>{{ item.location }}</text>
				</view>
				<view class="description">
					<text>{{ item.description }}</text>
				</view>
				<view class="price-action">
					<view class="price-wrapper">
						<text class="label">托运金额  </text>
						<text class="price">¥{{ item.price }}</text>
					</view>
					<button class="grab-btn" @tap="grabOrder(item)" :style="{ opacity: item.grabbed ? 0.5 : 1 }">
						{{ item.grabbed ? '已抢单' : '马上抢' }}
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
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				orderList: [
					{
						id: 1,
						time: '24-08-08 11:00',
						location: '淮北市中医院附近',
						distance: '0.6KM',
						description: '车辆无法启动，需要现场维修',
						price: '180',
						grabbed: false
					},
					{
						id: 2,
						time: '24-08-08 10:45',
						location: '淮北市人民医院东门',
						distance: '1.2KM',
						description: '轮胎漏气，需要更换备胎',
						price: '120',
						grabbed: false
					},
					{
						id: 3,
						time: '24-08-08 10:30',
						location: '淮北市第一中学',
						distance: '2.1KM',
						description: '发动机故障灯亮起，需要检查',
						price: '150',
						grabbed: true
					},
					{
						id: 4,
						time: '24-08-08 10:15',
						location: '淮北市政府大楼',
						distance: '2.8KM',
						description: '空调不制冷，需要加制冷剂',
						price: '200',
						grabbed: false
					},
					{
						id: 5,
						time: '24-08-08 10:00',
						location: '淮北火车站',
						distance: '3.5KM',
						description: '刹车系统异响，需要检查维修',
						price: '160',
						grabbed: false
					}
				],
				page: 1,
				hasMore: true,
				isRefreshing: false
			}
		},
		onLoad() {
			this.loadOrders()
		},
		methods: {
			// 加载订单列表
			async loadOrders() {
				try {
					// TODO: 调用后端接口获取订单列表
					const res = await this.$http.get('/repair/order/grab/list', {
						params: {
							page: this.page,
							pageSize: 10
						}
					})
					
					if (this.page === 1) {
						this.orderList = res.data.rows || this.orderList
					} else {
						this.orderList = [...this.orderList, ...(res.data.rows || [])]
					}
					
					this.hasMore = res.data.rows?.length === 10
				} catch (e) {
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					})
				}
			},
			
			// 加载更多
			loadMore() {
				if (!this.hasMore) return
				this.page++
				this.loadOrders()
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
				if (item.grabbed) {
					uni.showToast({
						title: '该订单已被抢',
						icon: 'none'
					})
					return
				}
				
				try {
					await this.$http.post('/repair/order/grab', {
						orderId: item.id
					})
					
					// 更新本地状态
					const index = this.orderList.findIndex(order => order.id === item.id)
					if (index !== -1) {
						this.orderList[index].grabbed = true
					}
					
					uni.showToast({
						title: '抢单成功',
						icon: 'success'
					})
				} catch (e) {
					uni.showToast({
						title: e.message || '抢单失败',
						icon: 'none'
					})
				}
			}
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
				
				.time-distance {
					display: flex;
					justify-content: space-between;
					margin-bottom: 20rpx;
					
					.time {
						font-size: 28rpx;
						color: #333;
						font-weight: 500;
					}
					
					.distance {
						font-size: 28rpx;
						color: #999;
					}
				}
				
				.location {
					margin-bottom: 20rpx;
					
					text {
						font-size: 28rpx;
						color: #666;
						position: relative;
						padding-left: 24rpx;
						
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
					
					text {
						font-size: 28rpx;
						color: #666;
						line-height: 1.5;
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
							line-height: 1;
						}
						
						.price {
							font-size: 32rpx;
							color: #333;
							font-weight: bold;
							line-height: 1;
						}
					}
					
					.grab-btn {
						margin: 0;
						padding: 16rpx 48rpx;
						background-color: #FF6B00;
						color: #fff;
						font-size: 28rpx;
						border-radius: 30rpx;
						border: none;
						line-height: 1.5;
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
			}
			
			.empty-state {
				padding-top: 200rpx;
				text-align: center;
				
				image {
					width: 240rpx;
					height: 240rpx;
					margin-bottom: 30rpx;
				}
				
				text {
					font-size: 28rpx;
					color: #999;
				}
			}
		}
	}
</style> 