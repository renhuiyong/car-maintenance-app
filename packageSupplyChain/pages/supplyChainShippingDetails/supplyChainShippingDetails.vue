<template>
	<view class="container">
		<!-- 订单信息 -->
		<view class="order-info">
			<view class="order-header">
				<text class="order-title">订单信息</text>
				<text class="order-status">已发货</text>
			</view>
			<view class="order-content">
				<view class="info-item">
					<text class="label">下单时间：</text>
					<text class="value">{{orderInfo.createTime || '--'}}</text>
				</view>
				<view class="info-item">
					<text class="label">发货时间：</text>
					<text class="value">{{orderInfo.deliveryTime || '--'}}</text>
				</view>
			</view>
		</view>
		
		<!-- 商品列表 -->
		<view class="product-list">
			<view class="section-title">商品信息</view>
			<view class="product-item" v-for="(product, index) in orderInfo.products" :key="index">
				<image class="product-image" :src="product.image" mode="aspectFill"></image>
				<view class="product-info">
					<view class="product-name">{{product.name}}</view>
					<view class="product-price">
						<text class="price-symbol">¥</text>
						<text class="price-value">{{product.price}}</text>
						<text class="price-unit">/件</text>
					</view>
					<view class="product-quantity">x{{product.quantity}}</view>
				</view>
			</view>
		</view>
		
		<!-- 物流信息 -->
		<view class="logistics-info">
			<view class="section-title">物流信息</view>
			<view class="logistics-content">
				<view class="info-item">
					<text class="label">物流公司：</text>
					<text class="value">{{(orderInfo.logistics && orderInfo.logistics.company) || '--'}}</text>
				</view>
				<view class="info-item">
					<text class="label">物流单号：</text>
					<text class="value">{{(orderInfo.logistics && orderInfo.logistics.trackingNumber) || '--'}}</text>
				</view>
			</view>
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
			orderInfo: {
				id: '',
				createTime: '',
				deliveryTime: '',
				products: [],
				logistics: {
					company: '',
					trackingNumber: ''
				}
			}
		}
	},
	onLoad(options) {
		if (options.orderId) {
			this.orderId = options.orderId
			this.getOrderDetail()
		}
	},
	methods: {
		// 获取订单详情
		async getOrderDetail() {
			try {
				const res = await api.supplyChain.getPurchaseOrderDetail(this.orderId)
				
				if (res.code === 200) {
					// 处理订单数据
					this.orderInfo = {
						id: this.orderId,
						createTime: res.data.createTime,
						deliveryTime: res.data.expressTime,
						products: res.data.accessoryNumList.map(item => ({
							name: item.accessoryName,
							price: item.price,
							quantity: item.num,
							image: request.BASE_URL_OSS + item.accessoryImage
						})),
						logistics: {
							company: res.data.expressCompany,
							trackingNumber: res.data.expressNumber
						}
					}
				} else {
					uni.showToast({
						title: res.msg || '获取订单详情失败',
						icon: 'none'
					})
				}
			} catch (err) {
				console.error('Get order detail error:', err)
				uni.showToast({
					title: '获取订单详情失败',
					icon: 'none'
				})
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	background: #F7F8FC;
	padding: 20rpx;
}

.order-info, .product-list, .logistics-info {
	background: #FFFFFF;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
}

.order-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
	
	.order-title {
		font-size: 32rpx;
		color: #333;
		font-weight: bold;
	}
	
	.order-status {
		font-size: 28rpx;
		color: #4468E8;
	}
}

.info-item {
	display: flex;
	margin-bottom: 16rpx;
	
	.label {
		font-size: 26rpx;
		color: #666;
		width: 160rpx;
	}
	
	.value {
		font-size: 26rpx;
		color: #333;
		flex: 1;
	}
}

.section-title {
	font-size: 32rpx;
	color: #333;
	font-weight: bold;
	margin-bottom: 24rpx;
}

.product-item {
	display: flex;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #F5F5F5;
	
	&:last-child {
		border-bottom: none;
	}
	
	.product-image {
		width: 140rpx;
		height: 140rpx;
		border-radius: 8rpx;
		margin-right: 20rpx;
	}
	
	.product-info {
		flex: 1;
		
		.product-name {
			font-size: 28rpx;
			color: #333;
			margin-bottom: 12rpx;
		}
		
		.product-price {
			display: flex;
			align-items: baseline;
			margin-bottom: 12rpx;
			
			.price-symbol {
				font-size: 24rpx;
				color: #FF4B4B;
			}
			
			.price-value {
				font-size: 32rpx;
				color: #FF4B4B;
				font-weight: bold;
				margin: 0 4rpx;
			}
			
			.price-unit {
				font-size: 24rpx;
				color: #999;
			}
		}
		
		.product-quantity {
			font-size: 26rpx;
			color: #666;
		}
	}
}

.logistics-content {
	background: #F8F9FC;
	border-radius: 8rpx;
	padding: 20rpx;
}
</style>
