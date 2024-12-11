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
			<view class="shop-item" v-for="(item, index) in shopsList" :key="item.id">
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
			<image class="empty-icon" src="/static/images/empty-favorites.png"></image>
			<text class="empty-text">暂无收藏内容</text>
		</view>
	</view>
</template>

<script>
import api from '@/api/index.js'

export default {
	data() {
		return {
			activeTab: 'goods', // 当前激活的标签页
			goodsList: [
				{
					id: 1,
					image: '/static/products/shangpin_default.png',
					name: '电动车外置对灯大灯开关',
					price: '20'
				},
				{
					id: 2,
					image: '/static/products/shangpin_default.png',
					name: '电动车后视镜',
					price: '20'
				}
			],
			shopsList: [
				{
					id: 1,
					name: '电动车维修店一',
					address: '安徽省淮北市濉溪县濉溪镇资源路8号',
					businessHours: '08:00 - 18:00',
					phone: '12345678901',
					// 如果有经纬度信息，可以添加以下字段
					latitude: 0,
					longitude: 0
				}
			],
			loading: false
		}
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
		// 切换标签页
		switchTab(tab) {
			if (this.activeTab !== tab) {
				this.activeTab = tab
				this.loadFavorites()
			}
		},
		
		// 加载收藏数据
		async loadFavorites() {
			// 暂时注释掉 API 调用，使用静态数据进行测试
			/*
			try {
				this.loading = true
				const type = this.activeTab === 'goods' ? 1 : 2 // 1:商品 2:商家
				const res = await api.user.getFavorites({ type })
				
				if (res.code === 200) {
					if (this.activeTab === 'goods') {
						this.goodsList = res.data
					} else {
						this.shopsList = res.data
					}
				} else {
					throw new Error(res.message)
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
			*/
			
			// 使用静态数据，不需要做任何操作
			this.loading = false
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