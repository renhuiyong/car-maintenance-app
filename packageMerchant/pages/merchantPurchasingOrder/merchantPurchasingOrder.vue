<template>
	<view class="container">
		<!-- 标签页 -->
		<view class="tabs">
			<view 
				class="tab-item" 
				v-for="(tab, index) in tabs" 
				:key="index"
				:class="{ active: currentTab === index }"
				@click="switchTab(index)"
			>
				{{ tab }}
				<view class="tab-line" v-if="currentTab === index"></view>
			</view>
		</view>
		
		<!-- 订单列表 -->
		<scroll-view 
			scroll-y 
			class="order-list"
			@scrolltolower="loadMore"
			:style="{ height: scrollHeight + 'px' }"
			refresher-enabled
			:refresher-triggered="isRefreshing"
			@refresherrefresh="onRefresh"
		>
			<view class="order-item" v-for="(order, index) in orderList" :key="index" @click="goToDetail(order)">
				<!-- 订单商品列表 -->
				<view class="product-list">
					<view class="product-item" v-for="(product, pIndex) in order.products" :key="pIndex">
						<view class="order-content">
							<image class="product-image" :src="product.image" mode="aspectFill"></image>
							<view class="product-info">
								<view class="product-name">{{ product.name }}</view>
							</view>
							<view class="product-quantity">
								<text>x{{ product.quantity }}</text>
							</view>
						</view>
						<!-- 分割线 -->
						<view class="divider" v-if="pIndex !== order.products.length - 1"></view>
					</view>
				</view>
			</view>
			
			<!-- 空状态 -->
			<view class="empty-state" v-if="orderList.length === 0">
				<image src="/static/images/empty.png" mode="aspectFit"></image>
				<text>暂无订单</text>
			</view>
			
			<!-- 加载更多提示 -->
			<view class="load-more" v-if="orderList.length > 0">
				<text v-if="loading">加载中...</text>
				<text v-else-if="!hasMore">没有更多了</text>
				<text v-else>上拉加载更多</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import api from '@/api/index.js'
import request from '@/utils/request.js'

export default {
	data() {
		return {
			tabs: ['未配送', '已配送', '已完成'],
			currentTab: 0,
			scrollHeight: 0,
			orderList: [],
			page: 1,
			loading: false,
			pageSize: 10,
			hasMore: true,
			isRefreshing: false
		}
	},
	onLoad() {
		// 计算scroll-view高度
		const systemInfo = uni.getSystemInfoSync()
		// 减去顶部标签页高度和状态栏高度
		this.scrollHeight = systemInfo.windowHeight - uni.upx2px(100) - systemInfo.statusBarHeight
		
		this.getOrderList()
		
		// 监听刷新订单列表事件
		uni.$on('refreshPurchaseOrderList', () => {
			this.getOrderList()
		})
	},
	
	// 页面显示时刷新列表
	onShow() {
		// 重置页码和列表
		this.page = 1
		this.orderList = []
		this.hasMore = true
		this.getOrderList()
	},
	
	onUnload() {
		// 页面卸载时移除事件监听
		uni.$off('refreshPurchaseOrderList')
	},
	methods: {
		// 切换标签页
		switchTab(index) {
			if (this.currentTab === index) return
			this.currentTab = index
			this.orderList = []
			this.page = 1
			this.hasMore = true
			this.getOrderList()
		},
		
		// 获取订单列表
		async getOrderList() {
			if (this.loading || !this.hasMore) return
			this.loading = true
			
			try {
				const res = await api.merchant.getDeliveryOrderList({
					status: this.currentTab,
					pageNum: this.page,
					pageSize: this.pageSize
				})
				
				if (res.code === 200) {
					const { rows, total } = res
					
					// 处理数据格式
					const formattedList = rows.map(order => ({
						id: order.id,
						status: order.status,
						products: order.accessoryNumList.map(item => ({
							name: item.accessoryName,
							quantity: item.num,
							image: request.BASE_URL_OSS + item.accessoryImage
						}))
					}))
					
					// 添加新数据
					this.orderList = this.page === 1 ? formattedList : [...this.orderList, ...formattedList]
					
					// 判断是否还有更多数据
					this.hasMore = this.orderList.length < total
				} else {
					uni.showToast({
						title: res.msg || '获取订单列表失败',
						icon: 'none'
					})
				}
			} catch (err) {
				console.error('Get order list error:', err)
				uni.showToast({
					title: '获取订单列表失败',
					icon: 'none'
				})
			} finally {
				this.loading = false
			}
		},
		
		// 加载更多
		loadMore() {
			if (this.loading || !this.hasMore) return
			this.page++
			this.getOrderList()
		},
            
		// 跳转到详情页面
		goToDetail(order) {
			uni.navigateTo({
				url: `/packageMerchant/pages/merchantPurchasingOrderDetail/merchantPurchasingOrderDetail?orderId=${order.id}`
			})
		},
		
		// 下拉刷新
		async onRefresh() {
			this.isRefreshing = true
			this.page = 1
			this.hasMore = true
			this.orderList = []
			await this.getOrderList()
			this.isRefreshing = false
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	background: #F7F8FC;
}

.tabs {
	display: flex;
	justify-content: space-around;
	align-items: center;
	height: 88rpx;
	background: #fff;
	position: relative;
	z-index: 1;
	
	.tab-item {
		position: relative;
		height: 100%;
		display: flex;
		align-items: center;
		font-size: 28rpx;
		color: #999;
		padding: 0 40rpx;
		
		&.active {
			color: #333;
			font-weight: bold;
			
			.tab-line {
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 60rpx;
				height: 4rpx;
				background: #4468E8;
				border-radius: 2rpx;
			}
		}
	}
}

.order-list {
	padding: 20rpx;
	box-sizing: border-box;
	
	/* 隐藏滚动条 */
	::-webkit-scrollbar {
		display: none;
		width: 0 !important;
		height: 0 !important;
		-webkit-appearance: none;
		background: transparent;
	}
	
	.order-item {
		background: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		position: relative;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
		
		.product-list {
			.product-item {
				.order-content {
					display: flex;
					align-items: center;
					padding: 24rpx 0;
					
					.product-image {
						width: 140rpx;
						height: 140rpx;
						border-radius: 8rpx;
						margin-right: 24rpx;
						background: #f5f5f5;
					}
					
					.product-info {
						flex: 1;
						
						.product-name {
							font-size: 26rpx;
							color: #333;
							margin-bottom: 12rpx;
							font-weight: 500;
						}
					}
					
					.product-quantity {
						font-size: 26rpx;
						color: #666;
						margin-left: 24rpx;
						font-weight: 500;
					}
				}
				
				.divider {
					height: 1rpx;
					background: #F5F5F5;
					margin: 0 -24rpx;
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
	padding-top: 200rpx;
	
	image {
		width: 240rpx;
		height: 240rpx;
		margin-bottom: 24rpx;
	}
	
	text {
		font-size: 30rpx;
		color: #999;
	}
}

.load-more {
	text-align: center;
	padding: 30rpx 0;
	
	text {
		font-size: 24rpx;
		color: #999;
	}
}
</style>
