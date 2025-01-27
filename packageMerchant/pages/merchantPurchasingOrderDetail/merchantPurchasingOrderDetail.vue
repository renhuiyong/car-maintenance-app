<template>
	<view class="container">
		<!-- 商品列表 -->
		<view class="product-list">
			<view class="section-title">商品信息</view>
			<view class="product-item" v-for="(product, index) in orderInfo.products" :key="index">
				<image class="product-image" :src="product.image" mode="aspectFill"></image>
				<view class="product-info">
					<view class="product-name">{{product.name}}</view>
					<view class="product-quantity">x{{product.quantity}}</view>
				</view>
			</view>
		</view>
		<!-- 配送信息 -->
		<view class="delivery-info" v-if="orderInfo.status && orderInfo.status !== 0">
			<view class="section-title">配送信息</view>
			<view class="info-item">
				<text class="label">配送员：</text>
				<text class="value">{{orderInfo.nickName}}</text>
			</view>
			<view class="info-item">
				<text class="label">联系电话：</text>
				<text class="value">{{orderInfo.phonenumber}}</text>
			</view>
			<view class="info-item">
				<text class="label">配送时间：</text>
				<text class="value">{{orderInfo.deliveryTime}}</text>
			</view>
			<view class="info-item" v-if="orderInfo.finishTime">
				<text class="label">完成时间：</text>
				<text class="value">{{orderInfo.finishTime || '-'}}</text>
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
				products: []
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
				const res = await api.merchant.getDeliveryOrderInfo(this.orderId)
				
				if (res.code === 200) {
					// 处理订单数据
					this.orderInfo = {
						products: res.data.accessoryNumList.map(item => ({
							name: item.accessoryName,
							quantity: item.num,
							image: request.BASE_URL_OSS + item.accessoryImage
						})),
						status: res.data.status,
						nickName: res.data.nickName,
						phonenumber: res.data.phonenumber,
						deliveryTime: res.data.deliveryTime,
						finishTime: res.data.finishTime
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

.product-list {
	background: #FFFFFF;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
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
		
		.product-quantity {
			font-size: 26rpx;
			color: #666;
		}
	}
}

.delivery-info {
	background: #FFFFFF;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
	
	.info-item {
		display: flex;
		padding: 16rpx 0;
		font-size: 28rpx;
		
		.label {
			color: #666;
			width: 160rpx;
		}
		
		.value {
			color: #333;
			flex: 1;
		}
	}
}
</style>
