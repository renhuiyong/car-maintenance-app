<template>
	<view class="favorites-container">
		<!-- 顶部标签栏 -->
		<view class="tab-bar">
			<view 
				class="tab-item" 
				:class="{ active: activeTab === 'goods' }"
				@click="switchTab('goods')"
			>
				商品
			</view>
			<view 
				class="tab-item"
				:class="{ active: activeTab === 'shops' }"
				@click="switchTab('shops')"
			>
				商家
			</view>
		</view>

		<!-- 商品列表 -->
		<view class="goods-list" v-if="activeTab === 'goods'">
			<view class="goods-item" v-for="(item, index) in goodsList" :key="index">
				<image class="goods-image" :src="item.image" mode="aspectFill"></image>
				<view class="goods-info">
					<view class="goods-name">{{ item.name }}</view>
					<view class="goods-price">
						<text class="symbol">¥</text>
						<text class="amount">{{ item.price }}</text>
						<text class="unit">/件</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 商家列表 -->
		<view class="shops-list" v-if="activeTab === 'shops'">
			<view class="shop-item" v-for="(item, index) in shopsList" :key="item.id" @click="goToMerchantDetails(item)">
				<view class="shop-main">
					<view class="shop-info">
						<view class="shop-name">
							<text class="dot">•</text>
							<text>{{ item.name }}</text>
						</view>
						<view class="shop-address">{{ item.address }}</view>
						<view class="business-hours">营业时间: {{ item.businessHours }}</view>
					</view>
					<view class="shop-actions">
						<view class="action-btn" @click="handleCall(item.phone)">
							<image src="/static/products/weixiu.png" mode="aspectFit"></image>
						</view>
						<view class="action-btn" @click="handleNavigate(item)">
							<image src="/static/images/dianhua.png" mode="aspectFit"></image>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 空状态 -->
		<view class="empty-state" v-if="showEmpty">
			<image class="empty-icon" src="/static/products/empty_cart.png"></image>
			<text class="empty-text">暂无收藏内容</text>
		</view>
	</view>
</template>

<script>
import api from '@/api/index.js'
import request from '@/utils/request.js'

export default {
	data() {
		return {
			activeTab: 'goods', // 当前激活的标签页
			goodsList: [],
			shopsList: [],
			loading: false
		}
	},
	// 启用下拉刷新
	onPullDownRefresh() {
		this.loadFavorites().then(() => {
			uni.stopPullDownRefresh()
		})
	},
	computed: {
		showEmpty() {
			return (this.activeTab === 'goods' && this.goodsList.length === 0) || 
				   (this.activeTab === 'shops' && this.shopsList.length === 0)
		}
	},
	onLoad() {
		this.loadFavorites()
	},
	methods: {
		// 切换标签页 - 直接切换显示，不重新加载数据
		switchTab(tab) {
			if (this.activeTab !== tab) {
				this.activeTab = tab
				// 移除 this.loadFavorites() 调用
			}
		},
		
		// 跳转到商家详情页
		goToMerchantDetails(shop) {
			uni.getLocation({
				type: 'gcj02',
				success: (res) => {
					uni.navigateTo({
						url: `/pages/merchantDetails/merchantDetails?shopId=${shop.id}&latitude=${res.latitude}&longitude=${res.longitude}`
					})
				},
				fail: () => {
					// 如果获取位置失败，使用默认值0
					uni.navigateTo({
						url: `/pages/merchantDetails/merchantDetails?shopId=${shop.id}&latitude=0&longitude=0`
					})
				}
			})
		},
		
		// 加载收藏数据 - 只在页面加载时调用一次
		async loadFavorites() {
			try {
				this.loading = true
				const res = await api.favorite.getList()
				
				if (res.code === 200) {
					const data = res.data || []
					
					// 处理商品数据 (type === 1)
					this.goodsList = data
						.filter(item => item.type === 1)
						.map(item => ({
							id: item.target_id,
							name: item.NAME,
							price: item.saleprice || 0,
							image: item.image_url ? request.BASE_URL + item.image_url : '/static/products/shangpin_default.png'
						}))
					
					// 处理店铺数据 (type === 2)
					this.shopsList = data
						.filter(item => item.type === 2)
						.map(item => ({
							id: item.target_id,
							name: item.NAME,
							address: item.detail_address || '',
							businessHours: item.business_hours || '',
							latitude: Number(item.latitude) || 0,
							longitude: Number(item.longitude) || 0,
							favoriteTime: item.favorite_time
						}))
				} else {
					throw new Error(res.msg)
				}
			} catch (err) {
				console.error('Load favorites failed:', err)
					uni.showToast({
						title: '加载收藏失败',
						icon: 'none'
					})
			} finally {
				this.loading = false
			}
		},
		
		// 处理电话拨打
		handleCall(phone) {
			if (!phone) return
			uni.makePhoneCall({
				phoneNumber: phone
			})
		},
		
		// 处理导航
		handleNavigate(shop) {
			// 这里可以根据需要实现导航功能
			uni.openLocation({
				latitude: shop.latitude || 0,
				longitude: shop.longitude || 0,
				name: shop.name,
				address: shop.address
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.favorites-container {
	min-height: 100vh;
	background: #F7F8FC;
	padding-bottom: env(safe-area-inset-bottom);
}

.tab-bar {
	display: flex;
	background: #fff;
	padding: 20rpx 60rpx;
	position: sticky;
	top: 0;
	z-index: 100;
	
	.tab-item {
		flex: 1;
		text-align: center;
		font-size: 28rpx;
		color: #999;
		position: relative;
		padding: 20rpx 0;
		
		&.active {
			color: #333;
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

.goods-list {
	padding: 20rpx;
	
	.goods-item {
		background: #fff;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		display: flex;
		padding: 20rpx;
		
		.goods-image {
			width: 160rpx;
			height: 160rpx;
			border-radius: 8rpx;
			margin-right: 20rpx;
		}
		
		.goods-info {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
            padding: 20rpx 0;
			
			.goods-name {
				font-size: 28rpx;
				color: #333;
				line-height: 1.4;
				margin-bottom: 10rpx;
			}
			
			.goods-price {
				color: #FF5B5B;
				
				.symbol {
					font-size: 24rpx;
				}
				
				.amount {
					font-size: 32rpx;
					font-weight: bold;
					margin: 0 4rpx;
				}
				
				.unit {
					font-size: 24rpx;
					color: #999;
				}
			}
		}
	}
}

.shops-list {
	padding: 20rpx;
	
	.shop-item {
		background: #fff;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		padding: 30rpx;
		
		.shop-main {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
		}
		
		.shop-info {
			flex: 1;
			margin-right: 20rpx;
			
			.shop-name {
				font-size: 32rpx;
				color: #333;
				font-weight: bold;
				margin-bottom: 16rpx;
				display: flex;
				
				.dot {
					width: 32rpx;
					display: inline-block;
					flex-shrink: 0;
				}
				
				text:last-child {
					flex: 1;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}
			
			.shop-address {
				font-size: 24rpx;
				color: #666;
				line-height: 1.4;
				margin-bottom: 12rpx;
				padding-left: 32rpx;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			
			.business-hours {
				font-size: 24rpx;
				color: #999;
				padding-left: 32rpx;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
		
		.shop-actions {
			display: flex;
			gap: 20rpx;
			
			.action-btn {
				width: 64rpx;
				height: 64rpx;
				background: #F5F6FA;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				
				image {
					width: 64rpx;
					height: 64rpx;
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
	
	.empty-icon {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 20rpx;
	}
	
	.empty-text {
		font-size: 28rpx;
		color: #999;
	}
}
</style> 