<template>
	<view class="page-container">
		<scroll-view scroll-y class="container">
			<!-- 商品详情 -->
			<view class="product-info">
				<image class="product-image" :src="product.image" mode="aspectFit" @error="handleImageError"></image>
				<view class="info-content">
					<view class="info-header">
						<view class="info-left">
							<view class="title">{{ product.name }}</view>
							<view class="price">¥{{ product.price }}/件</view>
							<view class="product-params">
								<view class="param-item" v-if="product.brand">
									<text class="param-label">品牌：</text>
									<text class="param-value">{{ product.brand }}</text>
								</view>
								<view class="param-item" v-if="product.model">
									<text class="param-label">型号：</text>
									<text class="param-value">{{ product.model }}</text>
								</view>
								<view class="param-item" v-if="product.parameter">
									<text class="param-label">参数：</text>
									<text class="param-value">{{ product.parameter }}</text>
								</view>
							</view>
						</view>
						<view class="info-right">
							<view class="favorite-btn" @tap="toggleFavorite">
								<image class="favorite-icon" :src="isFavorite ? '/static/products/shoucang_active.png' : '/static/products/shoucang.png'"></image>
							</view>
							<text class="stock">库存{{ product.stock }}</text>
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
			
			<!-- 底部占位，防止内容被底部操作栏遮挡 -->
			<view style="height: 120rpx;"></view>
		</scroll-view>
		
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
									<text class="minus" @tap.stop="removeFromCart(item.id)">-</text>
									<input 
										class="num" 
										type="digit" 
										:value="item.quantity"
										@input="handleQuantityInput($event, item.id)"
										@blur="handleQuantityBlur(item.id)"
										@tap.stop
									/>
									<text class="plus" 
										:class="{ disabled: isStockLimit(item.id) }"
										@tap.stop="handleAddToCart(item.id)">+</text>
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
import api from '@/api/index.js'
import request from '@/utils/request.js'

export default {
	data() {
		return {
			product: {
				id: '',
				name: '',
				price: 0,
				image: '',
				detail: '',
				stock: 0,
				brand: '',
				model: '',
				parameter: ''
			},
			cartCount: 0,
			isFavorite: false,
			showCartPopup: false,
			cartList: [],
			totalPrice: 0,
			productId: '',
			brandList: [],
			favoriteLoading: false
		}
	},
	onLoad(options) {
		console.log('接收到的参数：', options);
		if (options.id) {
			this.productId = options.id;
			this.getBrandList();
		}
		this.loadCartCount();
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
			
			const existItem = cartList.find(item => item.id === this.product.id);

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
		
		// 跳转到购物车
		goToCart() {
			uni.navigateTo({
				url: '/packageUser/pages/shop/shop'  // 使用新的shop页面路径
			})
		},
		
		handleImageError(e) {
			console.log('图片加载失败：', e);
			// 可以设置一个默认图片
			this.product.image = '/static/default-product.png'
		},
		
		// 换收藏状态
		toggleFavorite() {
			this.handleFavorite();
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
				// 计算总价
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
		removeFromCart(id) {
			let cartData = uni.getStorageSync('cartData')
			let cartList = cartData ? JSON.parse(cartData) : []
			
			const index = cartList.findIndex(item => item.id === id);

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

		// 修改添加商品方法
		handleAddToCart(id) {
			let cartData = uni.getStorageSync('cartData')
			let cartList = cartData ? JSON.parse(cartData) : []
			
			const existItem = cartList.find(item => item.id === id);

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

		// 修改库存限制检查方法
		isStockLimit(id) {
			const cartItem = this.cartList.find(item => item.id === id);
			return cartItem ? cartItem.quantity >= cartItem.stock : false;
		},

		// 修改处理数量输入方法
		handleQuantityInput(event, id) {
			const value = event.detail.value;
			const numValue = value.replace(/\D/g, '');
			
			let cartData = uni.getStorageSync('cartData')
			let cartList = cartData ? JSON.parse(cartData) : []
			
			const cartItem = cartList.find(item => item.id === id);
			
			if (!cartItem) return;
			
			if (numValue === '') {
				cartItem._tempValue = '';
				return;
			}
			
			const newQuantity = parseInt(numValue);
			
			if (newQuantity === 0) {
				cartList = cartList.filter(item => item.id !== id);
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

		// 修改处理输入框失焦方法
		handleQuantityBlur(id) {
			let cartData = uni.getStorageSync('cartData')
			let cartList = cartData ? JSON.parse(cartData) : []
			
			const cartItem = cartList.find(item => item.id === id);
			
			if (cartItem) {
				if (cartItem._tempValue === '' || cartItem.quantity === 0) {
					cartList = cartList.filter(item => item.id !== id);
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
		
		// 修改收藏处理方法
		async handleFavorite() {
			// 如果正在处理中，直接返回
			if (this.favoriteLoading) return;
			
			// 设置处理中状态
			this.favoriteLoading = true;
			
			try {
				if (this.isFavorite) {
					// 取消收藏
					const res = await api.favorite.cancel({
						type: 1,
						targetId: this.productId
					})
					if (res.code === 200) {
						this.isFavorite = false
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
						this.isFavorite = true
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
			} finally {
				// 500ms 后重置状态
				setTimeout(() => {
					this.favoriteLoading = false;
				}, 500);
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
					this.isFavorite = res.data
				}
			} catch (err) {
				console.error('检查收藏状态失败:', err)
			}
		},
		
		// 获取品牌列表
		async getBrandList() {
			try {
				const res = await api.shop.selectModelsList();
				if (res.code === 200) {
					console.log('获取品牌列表成功:', res.data);
					this.brandList = res.data || [];
					await this.getProductDetail(); // 等待品牌列表获取完成后再获取商品详情
				} else {
					uni.showToast({
						title: res.msg || '获取品牌列表失败',
						icon: 'none'
					});
				}
			} catch (err) {
				console.error('获取品牌列表失败:', err);
				uni.showToast({
					title: '获取品牌列表失败',
					icon: 'none'
				});
			}
		},

		// 获取品牌名称的方法
		getBrandName(brandIds) {
			if (!brandIds) return '';
			console.log('当前品牌ID:', brandIds);
			console.log('品牌列表:', this.brandList);
			
			// 将品牌ID字符串分割成数组
			const brandIdArray = brandIds.split(',');
			
			// 获取每个品牌ID对应的名称
			const brandNames = brandIdArray.map(brandId => {
				const brand = this.brandList.find(item => item.id.toString() === brandId.toString());
				return brand ? brand.title : '';
			}).filter(name => name); // 过滤掉空值
			
			console.log('找到的品牌:', brandNames);
			// 用逗号连接所有品牌名称
			return brandNames.join('、');
		},

		// 修改获取商品详情方法
		async getProductDetail() {
			try {
				const res = await api.shop.getAccessory({
					id: this.productId
				});
				
				if (res.code === 200 && res.data) {
					// 处理商品详情中的图片URL
					let details = res.data.details;
					if (details) {
						details = details.replace(/src="(uploads\/[^"]+)"/g, (match, p1) => {
							return `src="${request.BASE_URL_OSS}${p1}"`;
						});
					}
					
					this.product = {
						id: res.data.id,
						name: res.data.name,
						price: res.data.price,
						image: res.data.image ? request.BASE_URL_OSS + res.data.image : '/static/products/shangpin_default.png',
						detail: details || '<div>暂无商品详情</div>',
						stock: res.data.stock || 0,
						brand: this.getBrandName(res.data.brand),
						model: res.data.model,
						parameter: res.data.parameter
					};
					
					// 检查收藏状态
					this.checkFavoriteStatus();
				} else {
					uni.showToast({
						title: res.msg || '获取商品详情失败',
						icon: 'none'
					});
				}
			} catch (err) {
				console.error('获取商品详情失败:', err);
				uni.showToast({
					title: '获取商品详情失败',
					icon: 'none'
				});
			}
		},
	},
	onShow() {
		this.loadCartCount();
		this.updateCartList();
	}
}
</script>

<style>
.page-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: #F6F6F6;
}

.container {
	flex: 1;
	height: 100%;
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
	margin-bottom: 20rpx;
}

.product-params {
	margin-top: 20rpx;
}

.param-item {
	display: flex;
	align-items: center;
	margin-bottom: 10rpx;
	font-size: 26rpx;
}

.param-label {
	color: #666;
	margin-right: 10rpx;
}

.param-value {
	color: #333;
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

.add-cart-btn {
	padding: 20rpx 40rpx;
	border-radius: 40rpx;
	font-size: 28rpx;
	background: #FF9B49;
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
	padding: 30rpx 20rpx;
	border-bottom: 1rpx solid #f5f5f5;
	background: #fff;
}

.cart-item image {
	width: 140rpx;
	height: 140rpx;
	margin-right: 20rpx;
	border-radius: 8rpx;
}

.cart-item .item-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-width: 0;
}

.cart-item .item-name {
	font-size: 28rpx;
	color: #333;
	line-height: 1.4;
	margin-bottom: 10rpx;
}

.item-bottom {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 20rpx;
}

.item-price {
	font-size: 32rpx;
	color: #FF9B49;
	font-weight: bold;
}

.quantity-control {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	height: 56rpx;
	background: #f7f7f7;
	border-radius: 28rpx;
	padding: 0 6rpx;
	width: 180rpx;
}

.quantity-control .minus,
.quantity-control .plus {
	width: 44rpx;
	height: 44rpx;
	min-width: 44rpx;
	min-height: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 36rpx;
	color: #333;
	background: #fff;
	border-radius: 50%;
	padding: 0;
	line-height: 1;
	position: relative;
}

.quantity-control .minus::after,
.quantity-control .plus::after {
	content: '';
	position: absolute;
	width: 100%;
	height: 100%;
	left: 0;
	top: 0;
	border-radius: 50%;
	box-sizing: border-box;
}

.quantity-control .minus {
	font-size: 40rpx;
	line-height: 40rpx;
}

.quantity-control .plus {
	background: #FF9B49;
	color: #fff;
	font-size: 40rpx;
	line-height: 40rpx;
}

.quantity-control .plus.disabled {
	background-color: #ccc;
	pointer-events: none;
}

.quantity-control .num {
	min-width: 60rpx;
	text-align: center;
	font-size: 28rpx;
	color: #333;
	margin: 0 10rpx;
	background: transparent;
	height: 56rpx;
	line-height: 56rpx;
	padding: 0;
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