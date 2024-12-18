<template>
	<view class="container">
		<!-- 商品详情 -->
		<view class="product-info">
			<image class="product-image" :src="product.image" mode="aspectFit" @error="handleImageError"></image>
			<view class="info-content">
				<view class="info-header">
					<view class="info-left">
						<view class="title">{{ product.name }}</view>
						<view class="price">¥{{ product.price }}/件</view>
					</view>
					<view class="info-right">
						<view class="favorite-btn" @tap="toggleFavorite">
							<image class="favorite-icon" src="/static/products/shoucang.png"></image>
						</view>
						<text class="stock">库存88</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 商品详情 -->
		<view class="detail-section">
			<view class="section-title">商品详情</view>
			<view class="detail-content">
				<rich-text :nodes="product.detail || '暂无商品详情'" :style="{wordBreak: 'break-all'}"></rich-text>
			</view>
		</view>
		
		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<view class="left-btns">
				<view class="icon-btn" @tap="contactSeller">
					<image class="icon-image" src="/static/products/wenshangjai.png"></image>
					<text class="btn-text">问商家</text>
				</view>
				<view class="icon-btn" @tap="showCart">
					<image class="icon-image" src="/static/products/cart.png"></image>
					<text class="btn-text">购物车</text>
					<text class="badge" v-if="cartCount">{{ cartCount }}</text>
				</view>
			</view>
			<view class="right-btns">
				<view class="add-cart-btn" @tap="addToCart">加入购物车</view>
				<view class="buy-btn" @tap="buyNow">立即购买</view>
			</view>
		</view>
		
		<!-- 添加购物车弹出层 -->
		<view class="cart-popup" v-if="showCartPopup">
			<view class="cart-mask" @tap="hideCart"></view>
			<view class="cart-content">
				<view class="cart-header">
					<view class="header-left">
						<text class="title">购物车</text>
						<text class="cart-count" v-if="cartCount">(共{{ cartCount }}件商品)</text>
					</view>
					<text class="clear" v-if="cartList.length > 0" @tap="clearCart">清空购物车</text>
				</view>
				<view class="cart-empty" v-if="cartList.length === 0">
					<image src="/static/products/empty_cart.png" mode="aspectFit" class="empty-image"></image>
					<text class="empty-text">购物车还是空的</text>
				</view>
				<scroll-view scroll-y class="cart-list" v-else>
					<view class="cart-item" v-for="(item, index) in cartList" :key="item.id">
						<image :src="item.image" mode="aspectFit"></image>
						<view class="item-info">
							<text class="item-name">{{ item.name }}</text>
							<view class="item-bottom">
								<text class="item-price">￥{{ item.price }}</text>
								<view class="quantity-control">
									<text class="minus" @tap.stop="removeFromCart(item.categoryIndex, item.productIndex)">-</text>
									<text class="num">{{ item.quantity }}</text>
									<text class="plus" 
										:class="{ disabled: isStockLimit(item.categoryIndex, item.productIndex) }"
										@tap.stop="handleAddToCart(item.categoryIndex, item.productIndex)">+</text>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
				<!-- 添加底部结算 -->
				<view class="cart-footer" v-if="cartList.length > 0">
					<view class="total">
						<text>合计：</text>
						<text class="price">￥{{ totalPrice }}</text>
					</view>
					<view class="checkout-btn" @tap="goToCheckout">去结算</view>
				</view>
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
				detail: '',
				categoryIndex: 0,
				productIndex: 0,
				stock: 0
			},
			cartCount: 0,
			isFavorite: false,
			showCartPopup: false,
			cartList: [],
			totalPrice: 0
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
			detail: detail || '<div>暂无商品详情</div>',
			categoryIndex: Number(options.categoryIndex),
			productIndex: Number(options.productIndex),
			stock: Number(options.stock)
		};
		
		console.log('处理后的商品数据', this.product);
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
			
			const existItem = cartList.find(item => 
				item.categoryIndex === this.product.categoryIndex && 
				item.productIndex === this.product.productIndex
			);

			if (existItem) {
				if (existItem.quantity >= this.product.stock) {
					uni.showToast({
						title: '已达到库存上限',
						icon: 'none'
					});
					return;
				}
				existItem.quantity += 1;
			} else {
				cartList.push({
					id: this.product.id,
					categoryIndex: Number(this.product.categoryIndex),
					productIndex: Number(this.product.productIndex),
					name: this.product.name,
					price: this.product.price,
					image: this.product.image,
					stock: this.product.stock,
					quantity: 1
				});
			}
			
			uni.setStorageSync('cartData', JSON.stringify(cartList));
			this.loadCartCount();
			this.updateCartList();
			
			uni.showToast({
				title: '已加入购物车',
				icon: 'success'
			});
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
			uni.navigateTo({
				url: '/pages/shop/shop'  // 使用原来的shop页面路径
			})
		},
		
		handleImageError(e) {
			console.log('图片加载失败：', e);
			// 可以设置一个默认图片
			this.product.image = '/static/default-product.png'
		},
		
		// 换收藏状态
		toggleFavorite() {
			this.isFavorite = !this.isFavorite;
			uni.showToast({
				title: this.isFavorite ? '已收藏' : '已取消收藏',
				icon: 'success'
			})
		},
		
		// 添加联系商家方法
		contactSeller() {
			uni.showToast({
				title: '联系商家功能开发中',
				icon: 'none'
			})
		},
		
		// 显示购物车
		showCart() {
			// 从本地存储获取新的购物车数据
			const cartData = uni.getStorageSync('cartData')
			if (cartData) {
				this.cartList = JSON.parse(cartData)
				// 计��总价
				this.totalPrice = this.cartList.reduce((total, item) => total + item.price * item.quantity, 0)
			}
			this.showCartPopup = true
		},
		
		// 隐藏购物车
		hideCart() {
			this.showCartPopup = false
		},
		
		// 清空购物车
		clearCart() {
			uni.showModal({
				title: '提示',
				content: '确定要清空购物车吗？',
				success: (res) => {
					if (res.confirm) {
						this.cartList = []
						this.cartCount = 0
						this.totalPrice = 0
						uni.setStorageSync('cartData', '[]')
						this.hideCart()
					}
				}
			})
		},
		
		// 修改移除商品方法
		removeFromCart(categoryIndex, productIndex) {
			let cartData = uni.getStorageSync('cartData')
			let cartList = cartData ? JSON.parse(cartData) : []
			
			const index = cartList.findIndex(item => 
				item.categoryIndex === categoryIndex && 
				item.productIndex === productIndex
			);

			if (index > -1) {
				if (cartList[index].quantity > 1) {
					cartList[index].quantity--;
				} else {
					cartList.splice(index, 1);
				}
				uni.setStorageSync('cartData', JSON.stringify(cartList));
				this.loadCartCount();
				this.updateCartList();
			}
		},

		// ���改添加商品方法
		handleAddToCart(categoryIndex, productIndex) {
			let cartData = uni.getStorageSync('cartData')
			let cartList = cartData ? JSON.parse(cartData) : []
			
			const existItem = cartList.find(item => 
				item.categoryIndex === categoryIndex && 
				item.productIndex === productIndex
			);

			if (existItem) {
				if (existItem.quantity >= existItem.stock) {
					uni.showToast({
						title: '已达到库存上限',
						icon: 'none'
					});
					return;
				}
				existItem.quantity++;
				uni.setStorageSync('cartData', JSON.stringify(cartList));
				this.loadCartCount();
				this.updateCartList();
			}
		},

		// 添加库存限制检查方法
		isStockLimit(categoryIndex, productIndex) {
			const cartItem = this.cartList.find(item => 
				item.categoryIndex === categoryIndex && 
				item.productIndex === productIndex
			);
			return cartItem ? cartItem.quantity >= cartItem.stock : false;
		},

		// 处理数量输入
		handleQuantityInput(event, categoryIndex, productIndex) {
			const value = event.detail.value;
			const numValue = value.replace(/\D/g, '');
			
			let cartData = uni.getStorageSync('cartData')
			let cartList = cartData ? JSON.parse(cartData) : []
			
			const cartItem = cartList.find(item => 
				item.categoryIndex === categoryIndex && 
				item.productIndex === productIndex
			);
			
			if (!cartItem) return;
			
			if (numValue === '') {
				cartItem._tempValue = '';
				return;
			}
			
			const newQuantity = parseInt(numValue);
			
			if (newQuantity === 0) {
				cartList = cartList.filter(item => 
					!(item.categoryIndex === categoryIndex && 
						item.productIndex === productIndex)
				);
				uni.setStorageSync('cartData', JSON.stringify(cartList));
				this.loadCartCount();
				this.updateCartList();
				return;
			}
			
			if (newQuantity > cartItem.stock) {
				cartItem.quantity = cartItem.stock;
				uni.showToast({
					title: `已达到库存上限${cartItem.stock}件`,
					icon: 'none'
				});
			} else {
				cartItem.quantity = newQuantity;
			}
			
			delete cartItem._tempValue;
			uni.setStorageSync('cartData', JSON.stringify(cartList));
			this.loadCartCount();
			this.updateCartList();
		},

		// 处理输入框失焦
		handleQuantityBlur(categoryIndex, productIndex) {
			let cartData = uni.getStorageSync('cartData')
			let cartList = cartData ? JSON.parse(cartData) : []
			
			const cartItem = cartList.find(item => 
				item.categoryIndex === categoryIndex && 
				item.productIndex === productIndex
			);
			
			if (cartItem) {
				if (cartItem._tempValue === '' || cartItem.quantity === 0) {
					cartList = cartList.filter(item => 
						!(item.categoryIndex === categoryIndex && 
							item.productIndex === productIndex)
					);
				} else {
					cartItem.quantity = parseInt(cartItem.quantity) || 1;
				}
				delete cartItem._tempValue;
				uni.setStorageSync('cartData', JSON.stringify(cartList));
				this.loadCartCount();
				this.updateCartList();
			}
		},
		
		// 更新购物车列表
		updateCartList() {
			const cartData = uni.getStorageSync('cartData')
			if (cartData) {
				this.cartList = JSON.parse(cartData)
				// 更新总价
				this.totalPrice = this.cartList.reduce((total, item) => total + item.price * item.quantity, 0)
			}
		},
		
		// 处理收藏
		async handleFavorite() {
			try {
				if (this.isFavorited) {
					// 取消收藏
					const res = await api.favorite.cancel({
						type: 1,
						targetId: this.productId
					})
					if (res.code === 200) {
						this.isFavorited = false
						uni.showToast({
							title: '已取消收藏',
							icon: 'success'
						})
					}
				} else {
					// 添加收藏
					const res = await api.favorite.add({
						type: 1,
						targetId: this.productId
					})
					if (res.code === 200) {
						this.isFavorited = true
						uni.showToast({
							title: '收藏成功',
							icon: 'success'
						})
					}
				}
			} catch (err) {
				console.error('收藏操作失败:', err)
				uni.showToast({
					title: '操作失败，请重试',
					icon: 'none'
				})
			}
		},
		
		// 检查收藏状态
		async checkFavoriteStatus() {
			try {
				const res = await api.favorite.checkStatus({
					type: 1,
					targetId: this.productId
				})
				if (res.code === 200) {
					this.isFavorited = res.data
				}
			} catch (err) {
				console.error('检查收藏状态失败:', err)
			}
		}
	},
	onShow() {
		this.loadCartCount();
		this.updateCartList();
	}
}
</script>

<style>
.container {
	padding-bottom: 120rpx;
	background-color: #F6F6F6;
	min-height: 100vh;
}

.product-info {
	background: #fff;
	padding: 20rpx 40rpx;
	margin: 10rpx 20rpx;
}

.product-image {
	width: 100%;
	height: 400rpx;
}

.info-content {
	padding: 20rpx 0;
}

.info-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
}

.info-left {
	flex: 1;
}

.info-right {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 80rpx;
}

.favorite-btn {
	padding: 10rpx;
}

.favorite-icon {
	width: 40rpx;
	height: 40rpx;
}

.title {
	font-size: 32rpx;
	margin-bottom: 10rpx;
	font-weight: bold;
	color: #333;
	padding-right: 20rpx;
}

.price {
	font-size: 36rpx;
	color: #ff6b6b;
	font-weight: bold;
}

.stock {
	font-size: 24rpx;
	color: #999;
	margin-top: 4rpx;
	text-align: center;
}

.detail-section {
	margin: 10rpx 20rpx;
	padding: 20rpx 40rpx;
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
	height: 120rpx;
	background: #fff;
	display: flex;
	align-items: center;
	padding: 10rpx 40rpx;
	border-top: 1rpx solid #eee;
	z-index: 99;
}

.left-btns {
	display: flex;
	align-items: center;
	flex: 0 0 auto;
}

.icon-btn {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 0 20rpx;
	min-width: 80rpx;
}

.icon-image {
	width: 44rpx;
	height: 44rpx;
	margin-bottom: 4rpx;
}

.btn-text {
	font-size: 24rpx;
	color: #666;
	margin-top: 4rpx;
}

.badge {
	position: absolute;
	top: -10rpx;
	right: 10rpx;
	background: #ff6b6b;
	color: #fff;
	font-size: 20rpx;
	padding: 0 10rpx;
	border-radius: 20rpx;
	min-width: 28rpx;
	height: 28rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1;
}

.right-btns {
	flex: 1;
	display: flex;
	justify-content: flex-end;
	margin-left: 20rpx;
}

.add-cart-btn,
.buy-btn {
	padding: 20rpx 40rpx;
	border-radius: 40rpx;
	font-size: 28rpx;
	margin-left: 20rpx;
	white-space: nowrap;
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

/* 添加购物车弹出层样 */
.cart-popup {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	z-index: 999;
}

.cart-mask {
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
}

.cart-content {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	background: #fff;
	border-radius: 20rpx 20rpx 0 0;
	min-height: 300rpx;
	max-height: 70vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	padding: 0 40rpx;
}

.cart-header {
	padding: 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1rpx solid #eee;
}

.header-left {
	display: flex;
	align-items: center;
}

.cart-header .title {
	font-size: 32rpx;
	font-weight: bold;
}

.cart-header .cart-count {
	font-size: 24rpx;
	color: #666;
	margin-left: 10rpx;
	font-weight: normal;
}

.cart-header .clear {
	font-size: 28rpx;
	color: #999;
}

.cart-list {
	flex: 1;
	padding: 0 10rpx;
	max-height: calc(70vh - 200rpx);
	overflow-y: auto;
}

.cart-item {
	display: flex;
	padding: 20rpx;
	border-bottom: 1rpx solid #eee;
}

.cart-item image {
	width: 160rpx;
	height: 160rpx;
	margin-right: 20rpx;
	flex-shrink: 0;
}

.item-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.item-name {
	font-size: 28rpx;
	color: #333;
	line-height: 1.4;
}

.item-price {
	font-size: 32rpx;
	color: #ff6b6b;
	font-weight: bold;
}

.item-bottom {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 10rpx;
}

.quantity-control {
	display: flex;
	align-items: center;
	height: 48rpx;
}

.quantity-control .minus,
.quantity-control .plus {
	width: 44rpx;
	height: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
}

.quantity-control .minus {
	border: 1rpx solid #ddd;
	border-radius: 50%;
	color: #666;
}

.quantity-control .num {
	min-width: 60rpx;
	text-align: center;
	font-size: 28rpx;
	color: #333;
	margin: 0 10rpx;
}

.quantity-control .plus {
	background: #ff6b6b;
	color: #fff;
	border-radius: 50%;
}

.quantity-control .plus.disabled {
	background-color: #ccc;
	pointer-events: none;
}

.cart-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60rpx 0;
}

.empty-image {
	width: 200rpx;
	height: 200rpx;
	margin-bottom: 20rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #999;
}

/* 添加购物车部结算栏样式 */
.cart-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 30rpx;
	background: #fff;
	border-top: 1rpx solid #eee;
}

.cart-footer .total {
	font-size: 28rpx;
	color: #333;
}

.cart-footer .price {
	font-size: 36rpx;
	color: #ff6b6b;
	font-weight: bold;
}

.cart-footer .checkout-btn {
	background: #ff6b6b;
	color: #fff;
	padding: 20rpx 40rpx;
	border-radius: 40rpx;
	font-size: 28rpx;
}
</style> 