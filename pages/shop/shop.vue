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
					placeholder="搜索店内商品、型号、品牌" 
				/>
				<text 
					v-if="searchKeyword" 
					class="clear-icon"
					@tap="clearSearch"
				>×</text>
			</view>
			<view class="merchant-entry" @tap="goToMerchant">
				<text>商家</text>
				<text class="iconfont icon-shop"></text>
			</view>
		</view>
		
		<!-- 搜索结果列表 -->
		<scroll-view 
			v-if="isSearching"
			scroll-y 
			class="search-results"
			@scrolltolower="onReachBottom"
			refresher-enabled
			:refresher-triggered="refreshing"
			@refresherrefresh="onPullDownRefresh"
		>
			<view class="product-item" 
				  v-for="(item, index) in searchResults" 
				  :key="item.id"
				  @tap="goToDetail(item, item.categoryIndex, item.productIndex)">
				<image :src="item.image" mode="aspectFit"></image>
				<view class="product-info">
					<text class="product-name">{{ item.name }}</text>
					<text class="product-stock">库存{{ item.stock }}</text>
					<view class="product-price-wrap">
						<text class="price">￥{{ item.price }}/件</text>
						<view class="quantity-control" v-if="getCartQuantity(item.categoryIndex, item.productIndex)">
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
						<text v-else 
							  class="add-btn"
							  :class="{ disabled: isStockLimit(item.categoryIndex, item.productIndex) }"
							  @tap.stop.prevent="handleAddToCart(item.categoryIndex, item.productIndex, $event)">+</text>
					</view>
				</view>
			</view>
			<view class="loading-more" v-if="loading">加载中...</view>
			<view class="no-more" v-if="!hasMore">更多了</view>
		</scroll-view>
		
		<!-- 主体内容区 -->
		<view class="main-content">
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
				:scroll-with-animation="true"
				style="height: 100%;"
			>
				<view 
					v-for="(category, categoryIndex) in categories" 
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
								<text class="product-name">{{ item.name }}</text>
								<text class="product-stock">库存{{ item.stock }}</text>
								<view class="product-price-wrap">
									<text class="price">￥{{ item.price }}/件</text>
									<view class="quantity-control" v-if="getCartQuantity(categoryIndex, index)">
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
									<text v-else 
										  class="add-btn"
										  :class="{ disabled: isStockLimit(categoryIndex, index) }"
										  @tap.stop.prevent="handleAddToCart(categoryIndex, index, $event)">+</text>
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
					<text class="title">购物车</text>
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
							<text class="item-price">￥{{ item.price }}</text>
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
const ITEM_HEIGHT = 200; // 实际商品项度，包括内边距和框

export default {
	data() {
		return {
			categories: [
				{
					id: 0,
					name: '刹车系统',
					items: [
						{
							id: '1001',
							image: '/static/products/shangpin_default.png',
							name: '电动车刹车片',
							stock: 5,
							price: 20,
							detail: `<div class="detail-content">
								<h3>产品参数</h3>
								<p>材质：高密陶瓷复材料</p>
								<p>适用车型：通用型</p>
								<p>规格：标准规格</p>
								<p>包装：1对装（2片）</p>
								<h3>产品特点</h3>
								<ul>
									<li>高性能陶瓷配方，制动力强</li>
									<li>低噪音，不伤制盘</li>
									<li>耐高温，寿命长</li>
									<li>安装便捷，通用性强</li>
								</ul>
								<h3>使用说明</h3>
								<p>1. 检查原刹车片磨损情况</p>
								<p>2. 更换前请清理刹车片座</p>
								<p>3. 对准卡槽安装新刹车片</p>
								<p>4. 测试制动效果</p>
							</div>`
						},
						// ... 其他刹车系统商品
					]
				},
				{
					id: 1,
					name: '传感系统',
					items: [
						{
							id: '2001',
							image: '/static/products/shangpin_default.png',
							name: '传感系统1速度传感器',
							stock: 50,
							price: 45,
							detail: `<div class="detail-content">
								<h3>产品参数</h3>
								<p>工作电压：DC 12V</p>
								<p>感应距离：3-8mm可调</p>
								<p>防水等级：IP65</p>
								<p>线长：50cm</p>
								<h3>产品特点</h3>
								<ul>
									<li>精准感应，反应灵敏</li>
									<li>防水防尘</li>
									<li>安装便捷</li>
									<li>使用寿命长</li>
								</ul>
								<h3>适用范围</h3>
								<p>适用于各类电动车速度检测系统</p>
							</div>`
						}
					]
				},
				// ... 其他分类
				{
					id: 2,
					name: '照明系统',
					items: [
						{
							id: '3001',
							image: '/static/products/shangpin_default.png',
							name: '照明系统LED大灯',
							stock: 45,
							price: 40,
							detail: `<div class="detail-content">
								<h3>品参数</h3>
								<p>功率：12W</p>
								<p>电压：12V</p>
								<p>亮度：1200流明</p>
								<p>防等：IP65</p>
								<h3>产品特点</h3>
								<ul>
									<li>超高亮度LED</li>
									<li>低耗设</li>
									<li>防水防尘</li>
									<li>寿命长达50000小时</li>
								</ul>
							</div>`
						},
						{
							id: '3002',
							image: '/static/products/shangpin_default.png',
							name: '转向灯组',
							stock: 60,
							price: 25,
							detail: `<div class="detail-content">
								<h3>产品参数</h3>
								<p>电压：12V</p>
								<p>功率：5W</p>
								<p>颜色：琥珀色</p>
								<h3>产品特点</h3>
								<ul>
									<li>高亮LED灯珠</li>
									<li>闪烁频率稳定</li>
									<li>安装简便</li>
								</ul>
							</div>`
						}
					]
				},
				{
					id: 3,
					name: '充电系统',
					items: [
						{
							id: '4001',
							image: '/static/products/shangpin_default.png',
							name: '快速充电器',
							stock: 30,
							price: 65,
							detail: `<div class="detail-content">
								<h3>产品数</h3>
								<p>输入电压：220V</p>
								<p>输出电压：48V</p>
								<p>充电电流：2A</p>
								<h3>产品点</h3>
								<ul>
									<li>智能充电保护</li>
									<li>快速充电技术</li>
									<li>多重安全保护</li>
								</ul>
							</div>`
						},
						{
							id: '4002',
							image: '/static/products/shangpin_default.png',
							name: '充电口',
							stock: 80,
							price: 15,
							detail: `<div class="detail-content">
								<h3>产品参数</h3>
								<p>材质：铜合金</p>
								<p>适配：通用型</p>
								<h3>品特点</h3>
								<ul>
									<li>接触良好</li>
									<li>耐用防腐</li>
									<li>安装方便</li>
								</ul>
							</div>`
						}
					]
				},
				{
					id: 4,
					name: '控制系统',
					items: [
						{
							id: '5001',
							image: '/static/products/shangpin_default.png',
							name: '控制器',
							stock: 40,
							price: 120,
							detail: `<div class="detail-content">
								<h3>品参数</h3>
								<p>工作电压：48V</p>
								<p>最大电流：30A</p>
								<p>防水等级：IP54</p>
								<h3>产品特点</h3>
								<ul>
									<li>智能控制系统</li>
									<li>过载保护</li>
									<li>防水设计</li>
								</ul>
							</div>`
						},
						{
							id: '5002',
							image: '/static/products/shangpin_default.png',
							name: '调速器',
							stock: 55,
							price: 85,
							detail: `<div class="detail-content">
								<h3>产品参数</h3>
								<p>调速范围：1-5档</p>
								<p>适配电压：48V</p>
								<h3>产品特点</h3>
								<ul>
									<li>平稳调速</li>
									<li>防水设计</li>
									<li>安装便捷</li>
								</ul>
							</div>`
						}
					]
				},
				{
					id: 5,
					name: '车身件',
					items: [
						{
							id: '6001',
							image: '/static/products/shangpin_default.png',
							name: '后视镜',
							stock: 88,
							price: 20,
							detail: `<div class="detail-content">
								<h3>产品数</h3>
								<p>材质：ABS+玻璃</p>
								<p>尺寸：标准型</p>
								<h3>产品特点</h3>
								<ul>
									<li>视野清晰</li>
									<li>防震计</li>
									<li>安装方便</li>
								</ul>
							</div>`
						},
						{
							id: '6002',
							image: '/static/products/shangpin_default.png',
							name: '泥板',
							stock: 100,
							price: 15,
							detail: `<div class="detail-content">
								<h3>产品参数</h3>
								<p>材质：PP塑料</p>
								<p>颜色：黑色</p>
								<h3>产品特点</h3>
								<ul>
									<li>防水耐用</li>
									<li>安装简单</li>
									<li>防泥效果好</li>
								</ul>
							</div>`
						}
					]
				}
			],
			currentCategory: 0,
			cartList: [], // 购物车列表
			cartCount: 0, // 购物车数量
			totalPrice: 0, // 总价
			scrollTop: 0,
			heightArr: [], // 存储每个分类品列表的高度
			showCartPopup: false, // 控制购物车弹出层显示
			searchKeyword: '', // 搜索关键词
			searchResults: [], // 搜索结果
			isSearching: false, // 是否在搜索状态
			loading: false, // 加载状态
			refreshing: false, // 刷新状态
			page: 1, // 当前页码
			hasMore: true, // 是否有更多数据
			animation: null, // 添加动画实例
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
			isManualSwitching: false, // 添加手动切换标记
		}
	},
	computed: {
		currentProducts() {
			return this.categories[this.currentCategory] || []
		},
		// 获取商品购物车中的数量
		getCartQuantity() {
			return (categoryIndex, productIndex) => {
				const cartItem = this.cartList.find(item => 
					item.categoryIndex === categoryIndex && 
					item.productIndex === productIndex
				)
				return cartItem ? cartItem.quantity : 0
			}
		}
	},
	onReady() {
		this.calculateHeight()
	},
	onLoad() {
		// 加载本地存储的购物车数据
		const cartData = uni.getStorageSync('cartData')
		if (cartData) {
			this.cartList = JSON.parse(cartData)
			this.updateCartInfo()
		}
	},
	methods: {
		// 修改获取商品的方法
		getProducts(categoryIndex) {
			return this.categories[categoryIndex]?.items || [];
		},

		// 修改切换分类方法
		switchCategory(index) {
			if (this.currentCategory === index) return;
			
			this.currentCategory = index;
			this.isManualSwitching = true;
			
			// 计算目标分类的滚动位置
			let targetScrollTop = 0;
			const pxRatio = uni.getSystemInfoSync().windowWidth / 750;
			
			for (let i = 0; i < index; i++) {
				const categoryItems = this.categories[i].items || [];
				// 每个分类的总高 = 标题高度(88rpx) + 商品总高度(每个商品200rpx)
				targetScrollTop += (88 + categoryItems.length * 200) * pxRatio;
			}
			
			// 设置滚动位置
			this.$nextTick(() => {
				this.scrollTop = targetScrollTop + 1;
				
				setTimeout(() => {
					this.isManualSwitching = false;
				}, 300);
			});
		},
		
		// 修改滚动监听方法
		onProductScroll: throttle(function(e) {
			if (this.isManualSwitching) return;
			
			const scrollTop = e.detail.scrollTop;
			const pxRatio = uni.getSystemInfoSync().windowWidth / 750;
			let currentIndex = 0;
			let heightSum = 0;
			
			for (let i = 0; i < this.categories.length; i++) {
				const categoryItems = this.categories[i].items || [];
				const categoryHeight = (88 + categoryItems.length * 200) * pxRatio;
				heightSum += categoryHeight;
				
				if (scrollTop < heightSum) {
					currentIndex = i;
					break;
				}
			}
			
			if (this.currentCategory !== currentIndex) {
				this.currentCategory = currentIndex;
			}
		}, 100),
		
		goToMerchant() {
			// 跳转到商家页面
			uni.navigateTo({
				url: '/pages/merchant/merchant'
			})
		},
		
		// 修改加商品到购物车方法
		addToCart(categoryIndex, productIndex) {
			// 从 categories[categoryIndex].items 中获取品
			const product = this.categories[categoryIndex].items[productIndex];
			
			if (!product) {
				uni.showToast({
					title: '商品信息不完整',
					icon: 'none'
				});
				return;
			}
			
			const cartItem = this.cartList.find(item => 
				item.categoryIndex === categoryIndex && 
				item.productIndex === productIndex
			);
			
			// 检查库存
			const currentQuantity = cartItem ? cartItem.quantity : 0;
			if (currentQuantity >= product.stock) {
				uni.showToast({
					title: `已达到库存限${product.stock}件`,
					icon: 'none',
					duration: 2000
				});
				return;
			}
			
			if (cartItem) {
				cartItem.quantity++;
				// 当快到达库存上限时给出提示
				if (cartItem.quantity === product.stock) {
					uni.showToast({
						title: '已达到库存上限',
						icon: 'none',
						duration: 2000
					});
				} else if (product.stock - cartItem.quantity <= 2) {
					uni.showToast({
						title: `仅剩${product.stock - cartItem.quantity}件`,
						icon: 'none',
						duration: 2000
					});
				}
			} else {
				this.cartList.push({
					categoryIndex,
					productIndex,
					quantity: 1,
					...product
				});
				// 如果商品库存较少，首次添加时也给出提示
				if (product.stock <= 3) {
					uni.showToast({
						title: `库存仅剩${product.stock}件`,
						icon: 'none',
						duration: 2000
					});
				}
			}
			
			this.updateCartInfo();
			// 更新后保存到本地存储
			this.saveCartData();
		},
		
		// 从购物车移除商品
		removeFromCart(categoryIndex, productIndex) {
			const cartItem = this.cartList.find(item => 
				item.categoryIndex === categoryIndex && 
				item.productIndex === productIndex
			);
			
			if (cartItem && cartItem.quantity > 1) {
				cartItem.quantity--;
			} else {
				const index = this.cartList.findIndex(item => 
					item.categoryIndex === categoryIndex && 
					item.productIndex === productIndex
				);
				if (index > -1) {
					this.cartList.splice(index, 1);
				}
			}
			
			this.updateCartInfo();
			this.saveCartData();
		},
		
		// 更新物车信息
		updateCartInfo() {
			this.cartCount = this.cartList.reduce((total, item) => total + item.quantity, 0)
			this.totalPrice = this.cartList.reduce((total, item) => total + item.price * item.quantity, 0)
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
						this.cartList = []
						this.updateCartInfo()
						this.hideCart()
						// 清除本地存储
						this.saveCartData()
					}
				}
			})
		},
		
		// 修改去结按钮点击事
		goToCheckout() {
			if (this.cartCount === 0) {
				uni.showToast({
					title: '请先选择商品',
					icon: 'none'
				})
				return
			}
			
			// TODO: 跳转结算页面
			uni.navigateTo({
				url: '/pages/checkout/checkout'
			})
		},
		
		// 将 isStockLimit 移到 methods 中
		isStockLimit(categoryIndex, productIndex) {
			const product = this.categories[categoryIndex].items[productIndex];
			if (!product) return false;
			
			const cartItem = this.cartList.find(item => 
				item.categoryIndex === categoryIndex && 
				item.productIndex === productIndex
			);
			const currentQuantity = cartItem ? cartItem.quantity : 0;
			return currentQuantity >= product.stock;
		},
		
		// 修改搜索商品方法
		searchProducts() {
			if (!this.searchKeyword.trim()) {
				this.isSearching = false;
				return;
			}
			
			this.isSearching = true;
			this.searchResults = [];
			
			// 遍历所有分类的商品
			this.categories.forEach((category, categoryIndex) => {
				const results = category.items.filter(product => 
					product.name.toLowerCase().includes(this.searchKeyword.toLowerCase())
				).map((product, productIndex) => ({
					...product,
					categoryIndex,
					productIndex
				}));
				this.searchResults.push(...results);
			});
		},
		
		// 清除搜索
		clearSearch() {
			this.searchKeyword = ''
			this.isSearching = false
			this.searchResults = []
		},
		
		// 下拉刷新
		onPullDownRefresh() {
			if (this.refreshing) return
			this.refreshing = true
			
			// 模拟刷新数据
			setTimeout(() => {
				this.refreshing = false
				uni.stopPullDownRefresh()
				uni.showToast({
					title: '刷新成功',
					icon: 'success'
				})
			}, 1000)
		},
		
		// 拉加载更多
		onReachBottom() {
			if (this.loading || !this.hasMore) return
			this.loading = true
			
			// 模拟加载更多数据
			setTimeout(() => {
				this.page++
				if (this.page >= 3) {
					this.hasMore = false
				}
				this.loading = false
			}, 1000)
		},
		
		// 保存购车数到本地存储
		saveCartData() {
			uni.setStorageSync('cartData', JSON.stringify(this.cartList))
		},
		
		// 修改跳转到详情页方法
		goToDetail(product, categoryIndex, productIndex) {
			const productInfo = this.isSearching ? product : this.categories[categoryIndex].items[productIndex];
			
			if (!productInfo) {
				uni.showToast({
					title: '商品信息不完整',
					icon: 'none'
				});
				return;
			}
			
			// 将商品详情数据存储到本地
			uni.setStorageSync('currentProductDetail', productInfo.detail);
			
			// 构建其他查询参数
			const query = {
				id: productInfo.id,
				categoryIndex,
				productIndex,
				name: productInfo.name,
				price: productInfo.price,
				stock: productInfo.stock,
				image: productInfo.image
			};
			
			// 将对象转换为查询字符串
			const queryString = Object.keys(query)
				.map(key => `${key}=${encodeURIComponent(query[key])}`)
				.join('&');
			
			uni.navigateTo({
				url: `/pages/productDetail/productDetail?${queryString}`
			});
		},
		
		// 修改 handleAddToCart 方法
		handleAddToCart(categoryIndex, productIndex, event) {
			// 先检查是否达到库存限制
			if (this.isStockLimit(categoryIndex, productIndex)) {
				uni.showToast({
					title: '已达到库存上限',
					icon: 'none'
				});
				return;
			}

			// 如果是从购物车弹出层点击，直接添加商品
			if (!event || !event.touches) {
				this.addToCart(categoryIndex, productIndex);
				return;
			}

			// 以下是带动画效果的添商品逻辑
			const touch = event.touches[0];
			
			// 使用uni的API获取购物车图标位置
			const query = uni.createSelectorQuery();
			query.select('.cart-icon').boundingClientRect(data => {
				if (!data) return;

				// 置球初始位和式
				this.cartDot = {
					show: true,
					x: touch.clientX,
					y: touch.clientY,
					translateX: 0,
					
					translateY: 0,
					opacity: 1
				};

				// 计算位移距离
				const endX = data.left + data.width/2 - touch.clientX;
				const endY = data.top + data.height/2 - touch.clientY;

				// 延迟一帧设置终点位置，触发动画
				setTimeout(() => {
					this.cartDot = {
						...this.cartDot,
						translateX: endX,
						translateY: endY,
						opacity: 0
					};

					// 动画结束后处理
					setTimeout(() => {
						this.cartDot.show = false;
						this.addToCart(categoryIndex, productIndex);
					}, 500);
				}, 50);
			}).exec();
		},
		
		// 计算高度的方法也需要修改
		calculateHeight() {
			let height = 0;
			this.heightArr = [];
			
			this.categories.forEach((category, index) => {
				const categoryHeight = (category.items?.length || 0) * 200;
				height += categoryHeight;
				this.heightArr.push(height);
			});
		},
		
		// 修改处理数量输入的方法
		handleQuantityInput(event, categoryIndex, productIndex) {
			const value = event.detail.value;
			// 只允许输入数字，去除小数点
			const numValue = value.replace(/\D/g, '');
			
			const cartItem = this.cartList.find(item => 
				item.categoryIndex === categoryIndex && 
				item.productIndex === productIndex
			);
			
			if (!cartItem) return;
			
			// 允许输入框为空，此时不更新购物车总价和数量
			if (numValue === '') {
				cartItem._tempValue = '';  // 使用临时值存储空字符串
				return;
			}
			
			const newQuantity = parseInt(numValue);
			
			// 如果输入0，直接移除商品
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
			
			// 限制最大数量不超过库存
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
				
				// 清除临时值
				delete cartItem._tempValue;
				
				// 确保数量是有效数字
				cartItem.quantity = parseInt(cartItem.quantity) || 1;
				this.updateCartInfo();
				this.saveCartData();
			}
		}
	},
	created() {
		// 在组件创时应用节流
		this.switchCategory = throttle(this.switchCategory, 200);
	}
}
</script>

<style>
.container {
	height: 100vh;
	display: flex;
	flex-direction: column;
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
	margin-right: 20rpx;
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

.merchant-entry {
	display: flex;
	align-items: center;
	font-size: 28rpx;
	color: #333;
}

.merchant-entry .icon-shop {
	font-size: 40rpx;
	margin-left: 6rpx;
}

.main-content {
	flex: 1;
	display: flex;
	overflow: hidden;
	background: #fff;
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
	height: 88rpx;
	line-height: 88rpx;
	padding: 8rpx 20rpx;
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	background-color: #fff;
	position: sticky;
	top: 0;
	z-index: 10;
	box-sizing: border-box;
	transition: transform 0.3s ease-out;
	transform: translateZ(0);
	will-change: transform;
}

.product-items {
	padding: 0 20rpx;
}

.product-item {
	display: flex;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f5f5f5;
	height: 200rpx;
	box-sizing: border-box;
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

.product-name {
	font-size: 28rpx;
	color: #333;
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
}

.price {
	color: #ff6b6b;
	font-size: 32rpx;
}

.add-btn,
.plus {
	width: 48rpx;
	height: 48rpx;
	min-width: 48rpx;
	min-height: 48rpx;
	background-color: #ff6b6b;
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
}

.add-btn::before,
.plus::before {
	content: '+';
	position: absolute;
	top: 46%;
	left: 50%;
	transform: translate(-50%, -50%);
	font-size: 32rpx;
	line-height: 1;
	height: 32rpx;
	width: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.add-btn:empty,
.plus:empty {
	font-size: 0;
}

.cart-bar {
	height: 100rpx;
	background: #fff;
	border-top: 1rpx solid #eee;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 30rpx;
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
}

.cart-right {
	display: flex;
	align-items: center;
}

.total-price {
	color: #ff6b6b;
	font-size: 36rpx;
	margin-right: 30rpx;
}

.checkout-btn {
	background: #ff6b6b;
	color: #fff;
	padding: 20rpx 40rpx;
	border-radius: 40rpx;
}

.quantity-control {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	background: #f5f5f5;
	border-radius: 24rpx;
	padding: 0 12rpx;
	height: 48rpx;
	flex-shrink: 0;
	width: 140rpx;
}

.quantity-control .minus,
.quantity-control .plus {
	width: 48rpx;
	height: 48rpx;
	min-width: 48rpx;
	min-height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #f5f5f5;
	color: #333;
	flex-shrink: 0;
	user-select: none;
	-webkit-user-select: none;
	touch-action: manipulation;
	border-radius: 24rpx;
	font-size: 32rpx;
}

.quantity-control .num {
	min-width: 44rpx;
	width: 44rpx;
	text-align: center;
	font-size: 28rpx;
	color: #333;
	margin: 0 12rpx;
	flex-shrink: 0;
	background: transparent;
	border: none;
	padding: 0;
}

/* 去除输入框聚焦时的默认样式 */
.quantity-control .num:focus {
	outline: none;
}

.add-btn.disabled,
.plus.disabled {
	width: 48rpx;
	height: 48rpx;
	min-width: 48rpx;
	min-height: 48rpx;
	background-color: #ccc;
	pointer-events: none;
	opacity: 0.6;
	cursor: not-allowed;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	line-height: 1;
	padding: 0;
	pointer-events: auto;
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

.cart-header .title {
	font-size: 32rpx;
	font-weight: bold;
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
	color: #ff6b6b;
	margin-top: 10rpx;
}

/* 修改购物车中的数量控制器样式 */
.cart-item .quantity-control {
	display: flex;
	align-items: center;
	background: #f5f5f5;
	border-radius: 24rpx;
	padding: 0 12rpx;
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
	margin: 0 12rpx;
	flex-shrink: 0;
}

/* 修改购物车样式 */
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

/* 添加禁用状态样式 */
.add-btn.disabled,
.plus.disabled {
	background-color: #ccc;
	pointer-events: none;
	opacity: 0.6;
	cursor: not-allowed;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	line-height: 1;
	padding: 0;
	pointer-events: auto;
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

/* 添加搜索相样式 */
.clear-icon {
	font-size: 32rpx;
	color: #999;
	padding: 0 10rpx;
}

.search-results {
	flex: 1;
	background: #fff;
}

.loading-more,
.no-more {
	text-align: center;
	padding: 20rpx;
	color: #999;
	font-size: 24rpx;
}

/* 修改动画样式 */
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

/* 购物车图标动画 */
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

/* 添加购物车空状态式 */
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

/* 修改滚动容样式 */
::-webkit-scrollbar {
	width: 0;
	height: 0;
	background: transparent;
}
</style> 