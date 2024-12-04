<template>
	<view class="container">
		<!-- 商品详情 -->
		<view class="product-info">
			<image class="product-image" :src="product.image" mode="aspectFit" @error="handleImageError"></image>
			<view class="info-content">
				<view class="price">¥{{ product.price }}/件</view>
				<view class="title">{{ product.name }}</view>
			</view>
		</view>
		
		<!-- 商品详情 -->
		<view class="detail-section">
			<view class="section-title">商品详情</view>
			<rich-text :nodes="product.detail"></rich-text>
		</view>
		
		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<view class="cart-btn" @tap="goToCart">
				<text class="iconfont icon-cart"></text>
				购物车
				<text class="badge" v-if="cartCount">{{ cartCount }}</text>
			</view>
			<view class="right-btns">
				<view class="add-cart-btn" @tap="addToCart">加入购物车</view>
				<view class="buy-btn" @tap="buyNow">立即购买</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			product: {
				id: '',
				name: '',
				price: 0,
				image: '',
				detail: ''
			},
			cartCount: 0
		}
	},
	onLoad(options) {
		console.log('接收到的参数：', options);
		
		// 从本地存储获取商品详情
		const detail = uni.getStorageSync('currentProductDetail');
		
		this.product = {
			id: options.id,
			name: decodeURIComponent(options.name),
			price: Number(options.price),
			image: decodeURIComponent(options.image),
			detail: detail || '<div>暂无商品详情</div>' // 如果没有详情则显示默认内容
		};
		
		console.log('处理后的商品数据：', this.product);
		this.loadCartCount();
		
		// 清除本地存储的详情数据
		uni.removeStorageSync('currentProductDetail');
	},
	methods: {
		// 加载购物车数量
		loadCartCount() {
			const cartData = uni.getStorageSync('cartData')
			if (cartData) {
				const cartList = JSON.parse(cartData)
				this.cartCount = cartList.reduce((total, item) => total + item.quantity, 0)
			}
		},
		
		// 加入购物车
		addToCart() {
			let cartData = uni.getStorageSync('cartData')
			let cartList = cartData ? JSON.parse(cartData) : []
			
			const existItem = cartList.find(item => item.id === this.product.id)
			if (existItem) {
				existItem.quantity += 1
			} else {
				cartList.push({
					id: this.product.id,
					name: this.product.name,
					price: this.product.price,
					image: this.product.image,
					quantity: 1
				})
			}
			
			uni.setStorageSync('cartData', JSON.stringify(cartList))
			this.loadCartCount()
			
			uni.showToast({
				title: '已加入购物车',
				icon: 'success'
			})
		},
		
		// 立即购买
		buyNow() {
			// TODO: 跳转到结算页
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			})
		},
		
		// 跳转到购物车
		goToCart() {
			uni.switchTab({
				url: '/pages/shop/shop'
			})
		},
		
		handleImageError(e) {
			console.log('图片加载失败：', e);
			// 可以设置一个默认图片
			this.product.image = '/static/default-product.png'
		}
	}
}
</script>

<style>
.container {
	padding-bottom: 100rpx;
}

.product-info {
	background: #fff;
	padding: 20rpx;
}

.product-image {
	width: 100%;
	height: 400rpx;
}

.info-content {
	padding: 20rpx 0;
}

.price {
	font-size: 36rpx;
	color: #ff6b6b;
	font-weight: bold;
}

.title {
	font-size: 28rpx;
	margin-top: 10rpx;
}

.detail-section {
	margin-top: 20rpx;
	padding: 20rpx;
	background: #fff;
}

.section-title {
	font-size: 28rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
}

.bottom-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	height: 100rpx;
	background: #fff;
	display: flex;
	align-items: center;
	padding: 0 20rpx;
	border-top: 1rpx solid #eee;
}

.cart-btn {
	position: relative;
	font-size: 24rpx;
	color: #666;
	padding: 0 30rpx;
}

.badge {
	position: absolute;
	top: -10rpx;
	right: -10rpx;
	background: #ff6b6b;
	color: #fff;
	font-size: 20rpx;
	padding: 0 10rpx;
	border-radius: 20rpx;
}

.right-btns {
	flex: 1;
	display: flex;
	justify-content: flex-end;
}

.add-cart-btn,
.buy-btn {
	padding: 20rpx 40rpx;
	border-radius: 40rpx;
	font-size: 28rpx;
	margin-left: 20rpx;
}

.add-cart-btn {
	background: #fff5f5;
	color: #ff6b6b;
}

.buy-btn {
	background: #ff6b6b;
	color: #fff;
}

.detail-section {
	margin-top: 20rpx;
	padding: 20rpx;
	background: #fff;
}

.detail-content {
	padding: 20rpx;
}

.detail-content h3 {
	font-size: 28rpx;
	font-weight: bold;
	margin: 20rpx 0;
	color: #333;
}

.detail-content p {
	font-size: 26rpx;
	color: #666;
	line-height: 1.6;
	margin: 10rpx 0;
}

.detail-content ul {
	padding-left: 40rpx;
}

.detail-content li {
	font-size: 26rpx;
	color: #666;
	line-height: 1.6;
	margin: 6rpx 0;
}
</style> 