<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="search-input">
				<text class="iconfont icon-search"></text>
				<input 
					type="text" 
					v-model="searchKeyword"
					@input="searchProducts"
					placeholder="搜索店内商品" 
				/>
				<text 
					v-if="searchKeyword" 
					class="clear-icon"
					@tap="clearSearch"
				>×</text>
			</view>
		</view>
		
		<!-- 在搜索栏下方添加品牌筛选 -->
		<view class="brand-filter">
			<scroll-view scroll-x class="brand-scroll">
				<view class="brand-list">
					<view 
						class="brand-item" 
						:class="{ active: selectedBrand === brand.id }"
						v-for="brand in brands" 
						:key="brand.id"
						@tap="selectBrand(brand.id)"
					>
						{{ brand.name }}
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 搜索结果列表 -->
		<view class="search-results-container" v-if="isSearching">
			<scroll-view 
				scroll-y 
				class="search-results"
				@scrolltolower="onReachBottom"
				:refresher-enabled="true"
				:refresher-triggered="refreshing"
				@refresherrefresh="onSearchRefresh"
				style="height: calc(100vh - 200rpx);"
			>
				<view class="product-item" 
					  v-for="(item, index) in searchResults" 
					  :key="item.id"
					  @tap="goToDetail(item, item.categoryIndex, item.productIndex)">
					<image :src="item.image" mode="aspectFit"></image>
					<view class="product-info">
						<view class="product-info-top">
							<text class="product-name">{{ item.name }}</text>
							<text class="product-stock">库存{{ item.stock }}</text>
						</view>
						<view class="product-price-wrap">
							<text class="price">￥{{ item.price.toFixed(2) }}/件</text>
							<block v-if="getCartQuantity(item.categoryIndex, item.productIndex)">
								<view class="quantity-control my-quantity-control">
									<text class="minus" @tap.stop="removeFromCart(item.categoryIndex, item.productIndex)">-</text>
									<input 
										class="num" 
										type="digit" 
										:value="getCartQuantity(item.categoryIndex, item.productIndex)"
										@input="handleQuantityInput($event, item.categoryIndex, item.productIndex)"
										@blur="handleQuantityBlur(item.categoryIndex, item.productIndex)"
										@tap.stop
									/>
									<text class="plus" 
										  :class="{ disabled: isStockLimit(item.categoryIndex, item.productIndex) }"
										  @tap.stop.prevent="handleAddToCart(item.categoryIndex, item.productIndex, $event)">+</text>
								</view>
							</block>
							<block v-else>
								<text v-if="item.stock > 0"
									class="add-btn"
									:class="{ disabled: isStockLimit(item.categoryIndex, item.productIndex) }"
									@tap.stop.prevent="handleAddToCart(item.categoryIndex, item.productIndex, $event)">+</text>
								<text v-else class="sold-out">已售罄</text>
							</block>
						</view>
					</view>
				</view>
				<view class="loading-more" v-if="loading">加载中...</view>
				<view class="no-more" v-if="!hasMore">更多了</view>
			</scroll-view>
		</view>
		
		<!-- 主体内容区 -->
		<view class="main-content" v-else>
			<!-- 左侧分类导航 -->
			<scroll-view scroll-y class="category-list">
				<view class="category-item" 
					  v-for="(category, index) in categories" 
					  :key="category.id"
					  :class="{ active: currentCategory === index }"
					  @tap="switchCategory(index)">
					{{ category.name }}
				</view>
			</scroll-view>
			
			<!-- 右侧商品列表 -->
			<scroll-view 
				scroll-y 
				class="product-list"
				@scroll="onProductScroll"
				:scroll-top="scrollTop"
				:scroll-with-animation="false"
				style="height: 100%;"
			>
				<view 
					v-for="(category, categoryIndex) in filteredCategories" 
					:key="category.id"
					class="category-wrapper"
				>
					<view class="category-section-title">
						{{ category.name }}
					</view>
					<view class="product-items">
						<view class="product-item" 
							  v-for="(item, index) in category.items" 
							  :key="item.id"
							  @tap="goToDetail(item, categoryIndex, index)">
							<image :src="item.image" mode="aspectFit"></image>
							<view class="product-info">
								<view class="product-info-top">
									<text class="product-name">{{ item.name }}</text>
									<text class="product-stock">库存{{ item.stock }}</text>
								</view>
								<view class="product-price-wrap">
									<text class="price">￥{{ item.price.toFixed(2) }}/件</text>
									<block v-if="getCartQuantity(categoryIndex, index)">
										<view class="quantity-control">
											<text class="minus" @tap.stop="removeFromCart(categoryIndex, index)">-</text>
											<input 
												class="num" 
												type="digit" 
												:value="getCartQuantity(categoryIndex, index)"
												@input="handleQuantityInput($event, categoryIndex, index)"
												@blur="handleQuantityBlur(categoryIndex, index)"
												@tap.stop
											/>
											<text class="plus" 
												  :class="{ disabled: isStockLimit(categoryIndex, index) }"
												  @tap.stop.prevent="handleAddToCart(categoryIndex, index, $event)">+</text>
										</view>
									</block>
									<block v-else>
										<text v-if="item.stock > 0"
											class="add-btn my-add-btn"
											:class="{ disabled: isStockLimit(categoryIndex, index) }"
											@tap.stop.prevent="handleAddToCart(categoryIndex, index, $event)">+</text>
										<text v-else class="sold-out">已售罄</text>
									</block>
								</view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 底部购车 -->
		<view class="cart-bar">
			<view class="cart-left">
				<view class="message-wrap">
					<image src="/static/products/wenshangjai.png" mode="aspectFit" class="message-image"></image>
					<text class="message-text">问商家</text>
				</view>
				<view class="cart-wrap" @tap="showCart">
					<view class="cart-icon" :animation="cartAnimation">
						<image src="/static/products/cart.png" mode="aspectFit" class="cart-image"></image>
						<text class="cart-badge" v-if="cartCount">{{ cartCount }}</text>
					</view>
					<text class="cart-text">购物车</text>
				</view>
			</view>
			<view class="cart-right">
				<text class="total-price">￥{{ totalPrice }}</text>
				<view class="checkout-btn" 
					  :class="{ disabled: cartCount === 0 }"
					  @tap="goToCheckout">
					去结算
				</view>
			</view>
		</view>
		
		<!-- 购物车弹出层 -->
		<view class="cart-popup" v-if="showCartPopup">
			<view class="cart-mask" @tap="hideCart"></view>
			<view class="cart-content">
				<view class="cart-header">
					<view class="header-left">
						<text class="title">购车</text>
						<text class="cart-count" v-if="cartCount">(共{{ cartCount }}件商品)</text>
					</view>
					<text class="clear" 
						  v-if="cartList.length > 0"
						  @tap="clearCart">清空购物车</text>
				</view>
				<view class="cart-empty" v-if="cartList.length === 0">
					<image src="/static/products/empty_cart.png" mode="aspectFit" class="empty-image"></image>
					<text class="empty-text">购物车还是空的</text>
				</view>
				<scroll-view scroll-y class="cart-list" v-else>
					<view class="cart-item" 
						  v-for="(item, index) in cartList" 
						  :key="item.id">
						<image :src="item.image" mode="aspectFit"></image>
						<view class="item-info">
							<text class="item-name">{{ item.name }}</text>
							<text class="item-price">￥{{ item.price.toFixed(2) }}</text>
						</view>
						<view class="quantity-control">
							<text class="minus" @tap.stop="removeFromCart(item.categoryIndex, item.productIndex)">-</text>
							<input 
								class="num" 
								type="digit" 
								:value="item.quantity"
								@input="handleQuantityInput($event, item.categoryIndex, item.productIndex)"
								@blur="handleQuantityBlur(item.categoryIndex, item.productIndex)"
								@tap.stop
							/>
							<text class="plus" 
								  :class="{ disabled: isStockLimit(item.categoryIndex, item.productIndex) }"
								  @tap.stop.prevent="handleAddToCart(item.categoryIndex, item.productIndex)">+</text>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>
		
		<!-- 添加购物车画 -->
		<view class="cart-dot-wrap" v-if="cartDot.show">
			<view class="cart-dot" 
				  :style="{
					  left: cartDot.x + 'px',
					  top: cartDot.y + 'px',
					  transform: `translate3d(${cartDot.translateX}px, ${cartDot.translateY}px, 0)`,
					  opacity: cartDot.opacity
				  }">
			</view>
		</view>
	</view>
</template>

<script>
import api from '@/api/index.js'
import request from '@/utils/request.js'

// 在 methods 外部定义节流函数
const throttle = function(fn, delay) {
	let timer = null;
	return function(...args) {
		if (timer) return;
		timer = setTimeout(() => {
			fn.apply(this, args);
			timer = null;
		}, delay);
	}
};

// 修改商品项的高度常量
const ITEM_HEIGHT = 200; // 实际商品项度，包内边距和框

export default {
	data() {
		return {
			categories: [],
			currentCategory: 0,
			cartList: [],
			cartCount: 0,
			totalPrice: 0,
			scrollTop: 0,
			heightArr: [],
			showCartPopup: false,
			searchKeyword: '',
			searchResults: [],
			isSearching: false,
			loading: false,
			refreshing: false,
			page: 1,
			hasMore: true,
			animation: null,
			showCartAnimation: false,
			cartAnimationStyle: {
				left: '0px',
				top: '0px'
			},
			cartDot: {
				show: false,
				x: 0,
				y: 0,
				translateX: 0,
				translateY: 0,
				opacity: 1
			},
			isManualSwitching: false,
			brands: [
				{ id: 'all', name: '全部' }
			],
			selectedBrand: 'all',
			shopId: '',
			merchantId: '',
			shopName: '',
			repairOrderId: ''
		}
	},
	computed: {
		currentProducts() {
			return this.categories[this.currentCategory] || []
		},
		// 获商品购物车中的数量
		getCartQuantity() {
			return (categoryIndex, productIndex) => {
				const cartItem = this.cartList.find(item => 
					item.categoryIndex === categoryIndex && 
					item.productIndex === productIndex
				)
				return cartItem ? cartItem.quantity : 0
			}
		},
		// 修改筛选逻辑，返回过滤后的分类数组
		filteredCategories() {
			if (this.selectedBrand === 'all') {
				return this.categories;
			}
			
			return this.categories.map(category => {
				return {
					...category,
					items: category.items.filter(item => {
						if (this.selectedBrand === 'all') {
							return true
						}
						const brandIds = item.brand ? item.brand.split(',') : []
						return brandIds.includes(this.selectedBrand.toString())
					})
				}
			}).filter(category => category.items.length > 0)
		}
	},
	onReady() {
		this.calculateHeight()
	},
	onLoad(options) {
		console.log(options)
		if (options.shopId) {
			this.shopId = options.shopId
			this.shopName = decodeURIComponent(options.shopName || '')
			this.repairOrderId = options.repairOrderId
			console.log(this.repairOrderId)
			// 加载该商家的商品
			this.loadProducts()
		} else {
			// 如果没有传入shopId，才从本地存储获取
			this.shopId = uni.getStorageSync('currentShopId')
			this.shopName = uni.getStorageSync('currentShopName')
		}
		
		// 加载本地存储的购物车数据
		const cartData = uni.getStorageSync('cartData')
		if (cartData) {
			this.cartList = JSON.parse(cartData)
			this.updateCartInfo()
		}
		
		// 监听商家切换事件
		uni.$on('refreshShop', this.handleShopChange)
		// 获取品牌列表
		this.getBrandList()
	},
	onUnload() {
		// 移除事件监听
		uni.$off('refreshShop', this.handleShopChange)
	},
	methods: {
		// 修改获取商品
		getProducts(categoryIndex) {
			return this.categories[categoryIndex]?.items || [];
		},

		// 在 methods 中修改 switchCategory 方法
		switchCategory(index) {
			if (this.currentCategory === index) return;
			
			this.currentCategory = index;
			this.isManualSwitching = true;
			
			// 计算目标滚动位置
			let targetScrollTop = 0;
			const pxRatio = uni.getSystemInfoSync().windowWidth / 750;
			
			// 精确的高度计算
			for (let i = 0; i < index; i++) {
				const category = this.filteredCategories[i];
				if (!category) continue;
				
				// 标题高度（不包含padding，为padding已经包含在商品列表）
				const titleHeight = 72 * pxRatio; // 小标题实际占用高度
				
				// 商品列表高度（包含内边距）
				const itemCount = category.items?.length || 0;
				const itemHeight = ITEM_HEIGHT * pxRatio;
				const itemsHeight = itemCount * itemHeight;
				
				// 每个分类的总高度
				targetScrollTop += titleHeight + itemsHeight;
			}
			
			// 确保目标位置是整数
			targetScrollTop = Math.floor(targetScrollTop);
			
			// 获取当前滚动置
			const startScrollTop = this.scrollTop;
			const distance = targetScrollTop - startScrollTop;
			
			// 动画参数
			const duration = 500;
			const steps = 15;
			const stepDuration = duration / steps;
			let currentStep = 0;
			
			// 缓动函数
			const easeInOutCubic = (t) => {
				return t < 0.5
					? 4 * t * t * t
					: 1 - Math.pow(-2 * t + 2, 3) / 2;
			};
			
			// 执行动画
			const animate = () => {
				if (currentStep >= steps) {
					this.scrollTop = targetScrollTop;
					this.isManualSwitching = false;
					return;
				}
				
				const progress = currentStep / steps;
				const easeProgress = easeInOutCubic(progress);
				this.scrollTop = Math.floor(startScrollTop + (distance * easeProgress));
				
				currentStep++;
				setTimeout(animate, stepDuration);
			};
			
			animate();
		},
		
		// 修滚动监听方法
		onProductScroll: throttle(function(e) {
			if (this.isManualSwitching) return;
			
			const scrollTop = e.detail.scrollTop;
			const pxRatio = uni.getSystemInfoSync().windowWidth / 750;
			let currentIndex = 0;
			let heightSum = 0;
			
			// 更确的滚动位置检测
			for (let i = 0; i < this.filteredCategories.length; i++) {
				const category = this.filteredCategories[i];
				if (!category) continue;
				
				const titleHeight = 88 * pxRatio;
				const itemsHeight = (category.items?.length || 0) * ITEM_HEIGHT * pxRatio;
				const categoryGap = 20 * pxRatio;
				
				heightSum += titleHeight + itemsHeight + categoryGap;
				
				// 使用阈值来判断当前分类
				const threshold = heightSum - (itemsHeight / 2);
				if (scrollTop < threshold) {
					currentIndex = i;
					break;
				}
			}
			
			if (this.currentCategory !== currentIndex) {
				this.currentCategory = currentIndex;
			}
		}, 100),
		
		goToMerchant() {
			uni.navigateTo({
				url: `/pages/merchantDetails/merchantDetails?merchantId=${this.merchantId}`
			})
		},
		
		// 修改加商品购物车方法
		addToCart(categoryIndex, productIndex) {
			// 如果是从购物车中直接操作
			if (typeof categoryIndex === 'object') {
				const item = categoryIndex;
				categoryIndex = item.categoryIndex;
					productIndex = item.productIndex;
			}

			const product = this.categories[categoryIndex]?.items[productIndex];
			if (!product) {
				console.error('商品不存在:', categoryIndex, productIndex);
				return;
			}

			let cartData = uni.getStorageSync('cartData')
			let cartList = cartData ? JSON.parse(cartData) : []
			
			const existItem = cartList.find(item => 
				item.categoryIndex === categoryIndex && 
				item.productIndex === productIndex
			);

			if (existItem) {
				if (existItem.quantity >= product.stock) {
					uni.showToast({
						title: '已达到库存上限',
						icon: 'none'
					});
					return;
				}
				
				// 计算剩余可购买
				const remainingStock = product.stock - existItem.quantity;
				
				// 如果剩余可购数量小于等于3，示提示
				if (remainingStock <= 3) {
					// 如果剩余库存为1（加入后为0），显示已达到库存上限
					if (remainingStock === 1) {
						setTimeout(() => {
							uni.showToast({
								title: '已达到库存上限',
								icon: 'none'
							});
						}, 100);
					} else {
						uni.showToast({
							title: `库仅剩${remainingStock - 1}件`,
							icon: 'none'
						});
					}
				}
				
				existItem.quantity++;
			} else {
				// 果库存小于等于3，提示
				if (product.stock <= 3) {
					// 如果库存1，显示已达到库存上限
					if (product.stock === 1) {
						setTimeout(() => {
							uni.showToast({
								title: '已达到库存上限',
								icon: 'none'
							});
						}, 100);
					} else {
						uni.showToast({
							title: `库存仅剩${product.stock - 1}件`,
							icon: 'none'
						});
					}
				}
				
				cartList.push({
					id: product.id,
					categoryIndex,
					productIndex,
					name: product.name,
					price: product.price,
					image: product.image,
					stock: product.stock,
					quantity: 1
				});
			}

			uni.setStorageSync('cartData', JSON.stringify(cartList));
			this.updateCartInfo();
			this.cartList = cartList;
		},
		
		// 从购物车移除商品
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
				this.updateCartInfo();
				this.cartList = cartList;
			}
		},
		
		// 更新购物信息
		updateCartInfo() {
			const cartData = uni.getStorageSync('cartData')
			if (cartData) {
				const cartList = JSON.parse(cartData)
				this.cartCount = cartList.reduce((total, item) => total + item.quantity, 0)
				this.totalPrice = cartList.reduce((total, item) => {
					const itemTotal = Math.round(item.price * item.quantity * 100) / 100
					return Math.round((total + itemTotal) * 100) / 100
				}, 0).toFixed(2)
			} else {
				this.cartCount = 0
				this.totalPrice = '0.00'
			}
		},
		
		// 显示购物车
		showCart() {
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
						this.cartList = [];
						uni.setStorageSync('cartData', '[]');
						this.updateCartInfo();
						this.hideCart();
					}
				}
			});
		},
		
		// 修改去结算按点击事
		goToCheckout() {
			console.log(this.shopId)

			if (this.cartCount === 0) {
				uni.showToast({
					title: '请先选择商品',
					icon: 'none'
				})
				return
			}
			const orderInfo = {
				shopId: this.shopId,
				shopName: this.shopName,
				orderGoods: this.cartList,
				totalAmount: this.totalPrice,
				finalAmount: this.totalPrice,
				repairOrderId: this.repairOrderId
			}
			
			// 将订单信息存储到本地
			uni.setStorageSync('orderInfo', JSON.stringify(orderInfo))
			
			uni.navigateTo({
				url: '/pages/checkout/checkout'
			})
		},
		
		// 将 isStockLimit 移到 methods 中
		isStockLimit(categoryIndex, productIndex) {
			const product = this.categories[categoryIndex]?.items[productIndex];
			if (!product) return true;

			const cartItem = this.cartList.find(item => 
				item.categoryIndex === categoryIndex && 
				item.productIndex === productIndex
			);

			return cartItem ? cartItem.quantity >= product.stock : false;
		},
		
		// 修改搜索商法
		searchProducts() {
			if (!this.searchKeyword.trim()) {
				this.isSearching = false;
				this.searchResults = [];
				this.enableScroll();
				return;
			}

			this.isSearching = true;
			this.searchResults = [];
			this.disableScroll();

			// 搜索逻辑，增加品牌筛选
			this.categories.forEach((category, categoryIndex) => {
				const filteredItems = category.items.filter(product => {
					// 同时满足搜索关键词和品牌筛选条件
					const matchesKeyword = product.name.toLowerCase().includes(this.searchKeyword.toLowerCase());
					const matchesBrand = this.selectedBrand === 'all' || product.brand === this.selectedBrand;
					return matchesKeyword && matchesBrand;
				});

				const results = filteredItems.map((product, productIndex) => ({
					...product,
					categoryIndex,
					productIndex
				}));
				this.searchResults.push(...results);
			});

			if (this.searchResults.length === 0) {
				uni.showToast({
					title: '暂无相关商品',
					icon: 'none'
				});
			}
		},
		
		// 修改清除搜索方法
		clearSearch() {
			this.searchKeyword = '';
			this.isSearching = false;
			this.searchResults = [];
			this.enableScroll();
		},
		
		// 拉加载更多
		onReachBottom() {
			if (this.loading || !this.hasMore) return
			this.loading = true
			
			// 模拟加载更多据
			setTimeout(() => {
				this.page++
				if (this.page >= 3) {
					this.hasMore = false
				}
				this.loading = false
			}, 1000)
		},
		
		// 储购物车数据本地储
		saveCartData() {
			uni.setStorageSync('cartData', JSON.stringify(this.cartList))
		},
		
		// 修改跳转到详情页方法
		goToDetail(item, categoryIndex, productIndex) {
			const productInfo = this.isSearching ? item : this.categories[categoryIndex].items[productIndex];
			
			if (!productInfo) {
				uni.showToast({
					title: '商品信息不完整',
					icon: 'none'
				});
				return;
			}
			
			// 将商品详情数据存储到本地
			uni.setStorageSync('currentProductDetail', productInfo.detail);
			
			// 构建查询参数
			const query = {
				id: productInfo.id,
				categoryIndex: categoryIndex,  // 确保递这个
				productIndex: productIndex,    // 确保传递这个
				name: productInfo.name,
				price: productInfo.price,
				stock: productInfo.stock,
				image: productInfo.image
			};
			
			const queryString = Object.keys(query)
				.map(key => `${key}=${encodeURIComponent(query[key])}`)
				.join('&');
			
			uni.navigateTo({
				url: `/pages/productDetail/productDetail?${queryString}`
			});
		},
		
		// 修改 handleAddToCart 方法
		handleAddToCart(categoryIndex, productIndex, event) {
			// 先检是否达到库存限
			if (this.isStockLimit(categoryIndex, productIndex)) {
				uni.showToast({
					title: '已达到库存上限',
					icon: 'none'
				});
				return;
			}

			// 如果是从购物车弹层点直接添加商品
			if (!event || !event.touches) {
				this.addToCart(categoryIndex, productIndex);
				return;
			}

			// 以下是带动画效果的添加商品逻辑
			const touch = event.touches[0];
			
			// 使用uni的API获取物车图标位置
			const query = uni.createSelectorQuery();
			query.select('.cart-icon').boundingClientRect(data => {
				if (!data) return;

				this.cartDot = {
					show: true,
					x: touch.clientX,
					y: touch.clientY,
					translateX: 0,
					translateY: 0,
					opacity: 1
				};

				const endX = data.left + data.width/2 - touch.clientX;
				const endY = data.top + data.height/2 - touch.clientY;

				setTimeout(() => {
					this.cartDot = {
						...this.cartDot,
						translateX: endX,
						translateY: endY,
						opacity: 0
					};

					setTimeout(() => {
						this.cartDot.show = false;
						this.addToCart(categoryIndex, productIndex);
					}, 500);
				}, 50);
			}).exec();
		},
		
		// 计算度的方法也需要修改
		calculateHeight() {
			let height = 0;
			this.heightArr = [];
			const pxRatio = uni.getSystemInfoSync().windowWidth / 750;
			
			this.filteredCategories.forEach((category, index) => {
				const titleHeight = 88 * pxRatio;
				const itemsHeight = (category.items?.length || 0) * ITEM_HEIGHT * pxRatio;
				const categoryGap = 20 * pxRatio;
				
				height += titleHeight + itemsHeight + categoryGap;
				this.heightArr.push(Math.round(height));
			});
		},
		
		// 修改处理数量输入的方法
		handleQuantityInput(event, categoryIndex, productIndex) {
			const value = event.detail.value;
			// 允许输入数字，去除小数点
			const numValue = value.replace(/\D/g, '');
			
			const cartItem = this.cartList.find(item => 
				item.categoryIndex === categoryIndex && 
				item.productIndex === productIndex
			);
			
			if (!cartItem) return;
			
			// 允许输入框为空，此时不更新购物车总价和数量
			if (numValue === '') {
				cartItem._tempValue = '';  // 用临时值存储空字符串
				return;
			}
			
			const newQuantity = parseInt(numValue);
			
			// 如果入0，直接删除商品
			if (newQuantity === 0) {
				const index = this.cartList.findIndex(item => 
					item.categoryIndex === categoryIndex && 
					item.productIndex === productIndex
				);
				if (index > -1) {
					this.cartList.splice(index, 1);
				}
				this.updateCartInfo();
				this.saveCartData();
				return;
			}
			
			const product = this.categories[categoryIndex].items[productIndex];
			const stock = product.stock;
			
			// 限制最大量不超过库存
			if (newQuantity > stock) {
				cartItem.quantity = stock;
				uni.showToast({
					title: `已达到库存上限${stock}件`,
					icon: 'none'
				});
			} else {
				cartItem.quantity = newQuantity;
			}
			
			delete cartItem._tempValue;  // 清除临时值
			this.updateCartInfo();
			this.saveCartData();
		},
		
		// 修改处理输入框失焦的方法
		handleQuantityBlur(categoryIndex, productIndex) {
			const cartItem = this.cartList.find(item => 
				item.categoryIndex === categoryIndex && 
				item.productIndex === productIndex
			);
			
			if (cartItem) {
				// 如果是空值或0，移除商品
				if (cartItem._tempValue === '' || cartItem.quantity === 0) {
					const index = this.cartList.findIndex(item => 
						item.categoryIndex === categoryIndex && 
						item.productIndex === productIndex
					);
					if (index > -1) {
						this.cartList.splice(index, 1);
					}
					this.updateCartInfo();
					this.saveCartData();
					return;
				}
				
				// 除临时
				delete cartItem._tempValue;
				
				// 确保数量是有效数字
				cartItem.quantity = parseInt(cartItem.quantity) || 1;
				this.updateCartInfo();
				this.saveCartData();
			}
		},
		
		// 修改品牌选择方法
		selectBrand(brandId) {
			this.selectedBrand = brandId;
			
			// 重置滚动位置
			this.scrollTop = 0;
			// 清除选中的分类
			this.currentCategory = 0;
		},
		
		// 获取品牌列表
		getBrandList() {
			api.shop.selectModelsList().then(res => {
				if (res.code === 200) {
					// 添加"全部"选项
					this.brands = [
						{ id: 'all', name: '全部' },
						...res.data.map(item => ({
							id: item.id.toString(), // 确保ID是字符串类型
							name: item.title
						}))
					]
				} else {
					uni.showToast({
						title: res.msg || '获取品牌列表失败',
						icon: 'none'
					})
				}
			}).catch(err => {
				console.error('获取品牌列表失败:', err)
				uni.showToast({
					title: '获取品牌列表失败',
					icon: 'none'
				})
			})
		},
		
		// 添加 loadCartCount 方法
		loadCartCount() {
			const cartData = uni.getStorageSync('cartData')
			if (cartData) {
				const cartList = JSON.parse(cartData)
				this.cartCount = cartList.reduce((total, item) => total + item.quantity, 0)
			} else {
				this.cartCount = 0
			}
		},
		
		// 添加 updateCartList 方法
		updateCartList() {
			const cartData = uni.getStorageSync('cartData')
			if (cartData) {
				this.cartList = JSON.parse(cartData)
			}
		},
		
		// 添加搜索结果的刷新方法
		onSearchRefresh() {
			if (this.refreshing) return;
			this.refreshing = true;
			
			// 重新执行搜索
			this.searchProducts();
			
			// 延迟关闭刷新状态
			setTimeout(() => {
				this.refreshing = false;
				uni.showToast({
					title: '刷新成功',
					icon: 'none'
				});
			}, 1000);
		},
		// 获取铺详情
		getShopDetail() {
			// 这里添加获取店铺详情的接口请求
			// 示例：
			// uni.request({
			//   url: '/api/shop/detail',
			//   data: { id: this.shopId },
			//   success: (res) => {
			//     this.merchantId = res.data.merchantId
			//   }
			// })
		},
		// 添加禁用/启用滚动方法
		disableScroll() {
			// 可以根据需要添加额外的滚动控制逻辑
			this.scrollTop = 0;
		},
		enableScroll() {
			// 可以根据需要添加额外的滚动控制逻辑
		},
		handleShopChange(data) {
			if (data.shopId) {
				this.shopId = data.shopId
				// 刷新商品列表
				this.refreshProducts()
			}
		},
		refreshProducts() {
			// 重置页面状
			this.pageNum = 1
			this.finished = false
			this.products = []
			// 重新加载商品
			this.loadProducts()
		},
		loadProducts() {
			this.loading = true
			api.shop.getProducts({
				shopId: this.shopId,
				pageNum: this.page,
				pageSize: 10
			}).then(res => {
				if (res.code === 200) {
					// 修改这里：使用 res.data 而不是 res.rows
					const products = res.data || []
					if (products.length > 0) {
						// 将商品数据按分类组织
						this.categories = this.organizeProducts(products)
					}
				} else {
					uni.showToast({
						title: res.msg || '获取商品列表败',
						icon: 'none'
					})
				}
			}).catch(err => {
				console.error('获取商品列表失败:', err)
				uni.showToast({
					title: '获取商品列表失败',
					icon: 'none'
				})
			}).finally(() => {
				this.loading = false
			})
		},
		// 修改数据组织方法
		organizeProducts(products) {
			const categories = []
			const categoryMap = new Map()

			products.forEach(product => {
				const categoryId = product.categoryId
				if (!categoryMap.has(categoryId)) {
					categoryMap.set(categoryId, {
						id: categoryId,
						name: product.categoryName,
						items: []
					})
					categories.push(categoryMap.get(categoryId))
				}
				
				const category = categoryMap.get(categoryId)
				category.items.push({
					id: product.id,
					name: product.name,
					price: product.price,
					stock: product.stock || 0,
					image: product.image ? request.BASE_URL + product.image : '/static/products/shangpin_default.png',
					brand: product.brand,
					categoryIndex: categories.length - 1,
					productIndex: category.items.length
				})
			})

			return categories
		}
	},
	created() {
		// 在组件建时应用节
		this.switchCategory = throttle(this.switchCategory, 200);
	},
	onShow() {
		// 每次显示页面时重新加载购物车数据
		const cartData = uni.getStorageSync('cartData')
		if (cartData) {
			this.cartList = JSON.parse(cartData)
			this.updateCartInfo()
		}
	},
	// 添加 onPullDownRefresh 生命周期方法（与 methods 同级）
	onPullDownRefresh() {
		// 如果正在搜索状态，刷新搜索结果
		if (this.isSearching) {
			this.searchProducts();
		}
		
		// 迟关闭下拉刷新
		setTimeout(() => {
				uni.stopPullDownRefresh();
				uni.showToast({
					title: '刷新成功',
						icon: 'none'
				});
			}, 1000);
	}
}
</script>

<style>
.container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.search-bar {
	padding: 20rpx;
	display: flex;
	align-items: center;
	background-color: #f0f2f7;
}

.search-input {
	flex: 1;
	height: 70rpx;
	background: #fff;
	border-radius: 35rpx;
	display: flex;
	align-items: center;
	padding: 0 30rpx;
}

.search-input .icon-search {
	font-size: 32rpx;
	color: #999;
	margin-right: 10rpx;
}

.search-input input {
	flex: 1;
	font-size: 28rpx;
}

.main-content {
	flex: 1;
	display: flex;
	overflow: hidden;
	background: #fff;
	height: 0;
	visibility: visible;
	margin-bottom: 110rpx;
}

.main-content.hidden {
	visibility: hidden;
}

.category-list {
	width: 180rpx;
	background: #f7f7f7;
	height: 100%;
	margin: 0;
	padding: 0;
}

.category-item {
	height: 100rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	color: #333;
}

.category-item.active {
	background: #fff;
	color: #007AFF;
	border-left: 4rpx solid #007AFF;
}

.product-list {
	flex: 1;
	height: 100%;
	background-color: #fff;
	position: relative;
}

.category-wrapper {
	background: #fff;
}

.category-section-title {
	height: 72rpx;
	line-height: 72rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	background-color: #fff;
	position: sticky;
	top: 0;
	z-index: 10;
	box-sizing: border-box;
	transform: translateZ(0);
	will-change: transform;
}

.product-items {
	padding: 0 20rpx;
}

.product-item {
	display: flex;
	height: 200rpx;
	padding: 20rpx 0;
	box-sizing: border-box;
	border-bottom: 1rpx solid #f5f5f5;
}

.product-item image {
	width: 160rpx;
	height: 160rpx;
	margin-right: 20rpx;
}

.product-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.product-info-top {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.product-name {
	font-size: 28rpx;
	color: #333;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	word-break: break-all;
}

.product-stock {
	font-size: 24rpx;
	color: #999;
}

.product-price-wrap {
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: relative;
	z-index: 1;
	width: 100%;
	padding-right: 20rpx;
	height: 56rpx;
	transform: translateZ(0);
}

.price {
	color: #FF9B49;
	font-size: 32rpx;
	position: relative;
	z-index: 1;
	flex-shrink: 0;
}

.add-btn,
.plus {
	width: 56rpx;
	height: 56rpx;
	min-width: 56rpx;
	min-height: 56rpx;
	background-color: transparent;
	color: #fff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	line-height: 1;
	padding: 0;
	text-align: center;
	position: relative;
	flex-shrink: 0;
	transform: translateZ(0);
	user-select: none;
	-webkit-user-select: none;
	touch-action: manipulation;
	margin-right: 11rpx;
	margin-bottom: 4rpx;
	z-index: 2;
	isolation: isolate;
}

.add-btn::before,
.plus::before {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	height: 56rpx;
	width: 56rpx;
	background: url('/static/products/jiahao.png') no-repeat center center;
	background-size: contain;
	display: flex;
	align-items: center;
	justify-content: center;
}

.add-btn:empty,
.plus:empty {
	font-size: 0;
}

.cart-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	height: 110rpx;
	background: #fff;
	border-top: 1rpx solid #eee;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8rpx 30rpx;
	z-index: 100;
}

.cart-left {
	display: flex;
	align-items: flex-start;
	gap: 30rpx;
}

.cart-icon {
	position: relative;
	margin: 0 30rpx;
	width: 50rpx;
	height: 50rpx;
}

.cart-image {
	width: 100%;
	height: 100%;
}

.cart-badge {
	position: absolute;
	top: -10rpx;
	right: -10rpx;
	background: #FF9B49;
	color: #fff;
	font-size: 20rpx;
	padding: 0 10rpx;
	border-radius: 20rpx;
	min-width: 28rpx;
	height: 28rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.cart-right {
	display: flex;
	align-items: center;
}

.total-price {
	color: #FF9B49;
	font-size: 36rpx;
	margin-right: 30rpx;
}

.checkout-btn {
	background: #FF9B49;
	color: #fff;
	padding: 20rpx 40rpx;
	border-radius: 40rpx;
}

.quantity-control {
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f5f5f5;
	border-radius: 24rpx;
	height: 56rpx;
	flex-shrink: 0;
	width: 160rpx;
	margin-right: 14rpx;
	position: relative;
	z-index: 2;
	isolation: isolate;
	transform: translateZ(0);
	-webkit-tap-highlight-color: transparent;
	padding-top: 4rpx;
	margin-left: 30rpx;
}

.quantity-control .minus,
.quantity-control .plus {
	width: 56rpx;
	height: 56rpx;
	min-width: 56rpx;
	min-height: 56rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #333;
	flex-shrink: 0;
	user-select: none;
	-webkit-user-select: none;
	touch-action: manipulation;
	font-size: 32rpx;
	position: relative;
	top: -2rpx;
}

.quantity-control .num {
	min-width: 48rpx;
	width: 48rpx;
	text-align: center;
	font-size: 28rpx;
	color: #333;
	margin: 0;
	flex-shrink: 0;
	background: transparent;
	border: none;
	padding: 0;
	height: 56rpx;
	line-height: 54rpx;
	position: relative;
	top: -2rpx;
}

/* 去除输框聚焦的默认样式 */
.quantity-control .num:focus {
	outline: none;
}

.add-btn.disabled,
.plus.disabled {
	background-color: transparent;
	pointer-events: none;
	opacity: 0.6;
	cursor: not-allowed;
}

/* 保留一个完���的用状态式 */
.add-btn.disabled,
.plus.disabled {
	background-color: transparent;
	pointer-events: none;
	opacity: 0.6;
	cursor: not-allowed;
}

/* 保留结算按钮的禁用样式 */
.checkout-btn.disabled {
	background-color: #ccc;
	pointer-events: none;
}

/* 购物车弹出层样式 */
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
	padding: 0 20rpx;
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
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #eee;
	width: 100%;
	box-sizing: border-box;
}

.cart-item image {
	width: 120rpx;
	height: 120rpx;
	margin-right: 20rpx;
	flex-shrink: 0;
}

.item-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-width: 0;
	margin-right: 20rpx;
	max-width: calc(100% - 280rpx);
}

.item-name {
	font-size: 28rpx;
	color: #333;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.item-price {
	font-size: 32rpx;
	color: #FF9B49;
	margin-top: 10rpx;
}

/* 修改购物车中的数量控器样式 */
.cart-item .quantity-control {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 48rpx;
	flex-shrink: 0;
	width: 140rpx;
	margin-left: auto;
	box-sizing: border-box;
}

.cart-item .quantity-control .minus,
.cart-item .quantity-control .plus {
	width: 48rpx;
	height: 48rpx;
	min-width: 48rpx;
	min-height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	font-size: 32rpx;
}

.cart-item .quantity-control .num {
	min-width: 44rpx;
	text-align: center;
	font-size: 28rpx;
	color: #333;
	margin: 0;
	flex-shrink: 0;
}

/* 修改物车样式 */
.cart-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0;
}

.cart-icon {
    position: relative;
    width: 50rpx;
    height: 50rpx;
}

.cart-text {
    font-size: 24rpx;
    color: #666;
    margin-top: 4rpx;
}

/* 添加问商家样式 */
.message-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.message-image {
    width: 50rpx;
    height: 50rpx;
}

.message-text {
    font-size: 24rpx;
    color: #666;
    margin-top: 4rpx;
}

/* 添加禁用态样式 */
.add-btn.disabled,
.plus.disabled {
	background-color: transparent;
	pointer-events: none;
	opacity: 0.6;
	cursor: not-allowed;
}

.checkout-btn.disabled {
	background-color: #ccc;
	pointer-events: none;
}

/* 修改库存显示样式 */
.product-stock {
	font-size: 24rpx;
	color: #999;
}

.product-stock.low {
	color: #ff6b6b;
}

/* 添加搜索相关样式 */
.clear-icon {
	font-size: 40rpx;
	color: #999;
	padding: 0 10rpx;
	height: 40rpx;
	line-height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.search-results {
	flex: 0 1 auto;
	background: #fff;
	padding: 0 20rpx;
	min-height: 0;
	height: auto;
}

.loading-more,
.no-more {
	text-align: center;
	padding: 20rpx;
	color: #999;
	font-size: 24rpx;
	margin: 0 20rpx;
}

/* 改动画样式 */
.add-to-cart-animation {
	position: fixed;
	z-index: 999;
	pointer-events: none;
}

.cart-dot {
	width: 20rpx;
	height: 20rpx;
	background: #ff6b6b;
	border-radius: 50%;
	box-shadow: 0 0 10rpx rgba(255, 107, 107, 0.5);
}

/* 购物车图标样式 */
.cart-icon {
	position: relative;
	width: 50rpx;
	height: 50rpx;
	transition: transform 0.3s ease-out;
}

/* 购物车动画样式 */
.cart-dot-wrap {
	position: fixed;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	pointer-events: none;
	z-index: 999;
}

.cart-dot {
	position: absolute;
	width: 20rpx;
	height: 20rpx;
	background: #ff6b6b;
	border-radius: 50%;
	box-shadow: 0 0 10rpx rgba(255, 107, 107, 0.5);
	transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 购物车标动画 */
.cart-icon {
	position: relative;
	width: 50rpx;
	height: 50rpx;
	transition: transform 0.3s ease-out;
}

.cart-icon.animate {
	animation: cartScale 0.3s ease-out;
}

@keyframes cartScale {
	0% { transform: scale(1); }
	50% { transform: scale(1.2); }
	100% { transform: scale(1); }
}

/* 添加购物车空状态样式 */
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

/* 添加全局重置 */
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

/* 修改滚动容器样式 */
::-webkit-scrollbar {
	width: 0;
	height: 0;
	background: transparent;
}

.brand-filter {
    display: flex;
    align-items: center;
    padding: 20rpx;
    background-color: #fff;
    border-bottom: 1rpx solid #f0f2f7;
}

.brand-scroll {
    flex: 1;
    white-space: nowrap;
    width: 100%;
    overflow-x: scroll;
}

.brand-list {
    display: inline-flex;
    padding-right: 40rpx;
}

.brand-item {
    display: inline-block;
    padding: 10rpx 30rpx;
    margin-right: 20rpx;
    font-size: 26rpx;
    color: #666;
    background: #f7f7f7;
    border-radius: 26rpx;
    transition: all 0.3s;
    flex-shrink: 0;
}

.brand-item:last-child {
    margin-right: 0;
}

.brand-item.active {
    color: #fff;
    background: #007AFF;
}

/* 修改搜索果中的 add-btn 样式 */
.search-results .product-price-wrap {
    padding-right: 20rpx;
}

.search-results .add-btn,
.search-results .quantity-control {
    margin-right: 20rpx;
}

/* 搜索结果为空��的样式 */
.search-results:empty {
    display: none;
}

/* 一搜索结果中的商品项样式 */
.search-results .product-item {
    display: flex;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;
    height: 200rpx;
    box-sizing: border-box;
}

.search-results .product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-right: 20rpx;
    position: relative;
}

.search-results .product-price-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
    width: 100%;
    padding-right: 0; /* 移除内边距，因为已经在 product-info 中设置了 */
    margin-bottom: 10rpx; /* 添加底部间距，使钮对齐 */
}

.search-results .add-btn,
.search-results .quantity-control {
    position: absolute; /* 使用绝对定位 */
    right: 20rpx; /* 右对齐 */
    bottom: 0; /* 底部对齐 */
}

.my-quantity-control {
	right: -36rpx !important
}

.my-add-btn {
	right: 10rpx !important
}

.search-results-container {
	position: fixed;
	top: 200rpx; /* 据顶部搜索栏和品牌筛选实际高度调整 */
	left: 0;
	right: 0;
	bottom: 110rpx; /* 与cart-bar高度保持一致 */
	z-index: 10;
	background: #fff;
}

.search-results {
	height: 100%;
	background: #fff;
	overflow-y: auto;
}

.main-content {
	flex: 1;
	display: flex;
	overflow: hidden;
	background: #fff;
	height: 0;
	visibility: visible;
	margin-bottom: 110rpx; /* 添加底部间距，防止内容被cart-bar遮挡 */
}

.main-content.hidden {
	visibility: hidden;
}

.sold-out {
	font-size: 24rpx;
	color: #999;
	padding: 6rpx 12rpx;
	background: #f5f5f5;
	border-radius: 4rpx;
}
</style> 