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
			<view class="merchant-entry" @tap="goToMerchant">
				<text>商家</text>
				<image src="/static/products/fangzi.png" mode="aspectFit" class="merchant-icon"></image>
			</view>
		</view>
		
		<!-- 在搜索栏下方添加品牌筛选 -->
		<view class="brand-filter">
			<view class="brand-label">品牌：</view>
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
		<scroll-view 
			v-if="isSearching"
			scroll-y 
			class="search-results"
			@scrolltolower="onReachBottom"
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onSearchRefresh"
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
						<view class="quantity-control my-quantity-control" v-if="getCartQuantity(item.categoryIndex, item.productIndex)">
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
										  class="add-btn my-add-btn"
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
					<view class="header-left">
						<text class="title">购物车</text>
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
							brand: 'brand1',
							detail: `<div class="detail-content">
								<h3>产品参数</h3>
								<p>材质：高密陶瓷复材料</p>
								<p>适用车型：</p>
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
						// ... 其他车系统商品
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
							brand: 'brand2',
							detail: `<div class="detail-content">
								<h3>产品参数</h3>
								<p>���电压：DC 12V</p>
								<p>感应距离：3-8mm可调</p>
								<p>防水等级：IP65</p>
								<p>线长50cm</p>
								<h3>产品</h3>
								<ul>
									<li>精准感应，反应灵敏</li>
									<li>防水防尘</li>
									<li>安装便捷</li>
									<li>用寿命长</li>
								</ul>
								<h3>适范围</h3>
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
									<li>装简便</li>
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
									<li>快速充电术</li>
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
								<p>材质铜合金</p>
								<p>适配：通用型</p>
								<h3>品特点</h3>
								<ul>
									<li>接触良好</li>
									<li>耐用防腐</li>
									<li>安方便</li>
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
								<p>大电流：30A</p>
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
								<p>调速围：1-5档</p>
								<p>适配电压：48V</p>
								<h3>产品特点</h3>
								<ul>
									<li>平稳调速</li>
									<li>水设计</li>
									<li>安装便</li>
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
								<p>寸：标准型</p>
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
								<p>颜色黑色</p>
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
			loading: false, // 加载态
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
			brands: [
				{ id: 'all', name: '全部' },
				{ id: 'brand1', name: '品牌1' },
				{ id: 'brand2', name: '牌2' },
				{ id: 'brand3', name: '品牌3' },
				{ id: 'brand4', name: '品牌4' },
				{ id: 'brand5', name: '品牌5' },
				{ id: 'brand6', name: '品牌6' },
				// 可以添加更多品牌
			],
			selectedBrand: 'all', // 当前选中的品牌
			shopId: '', // 添加shopId存储
			merchantId: '' // 添加merchantId存储
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
			
			return this.categories.map(category => ({
				...category,
				items: category.items.filter(product => product.brand === this.selectedBrand)
			})).filter(category => category.items.length > 0);
		}
	},
	onReady() {
		this.calculateHeight()
	},
	onLoad(options) {
		if (options.id) {
			this.shopId = options.id
			// 可以在这里获取店铺详情，包括商家ID
			this.getShopDetail()
		}
		// 加载本地存储的购物车数据
		const cartData = uni.getStorageSync('cartData')
		if (cartData) {
			this.cartList = JSON.parse(cartData)
			this.updateCartInfo()
		}
	},
	methods: {
		// 修改获取商方法
		getProducts(categoryIndex) {
			return this.categories[categoryIndex]?.items || [];
		},

		// 修改切换分类方法
		switchCategory(index) {
			if (this.currentCategory === index) return;
			
			this.currentCategory = index;
			this.isManualSwitching = true;
			
			// 计目标分类滚动位
			let targetScrollTop = 0;
			const pxRatio = uni.getSystemInfoSync().windowWidth / 750;
			
			for (let i = 0; i < index; i++) {
				const categoryItems = this.categories[i].items || [];
				// 每个分类的总高 = 标题高度(88rpx) + 商品总高度(每个商品200rpx)
				targetScrollTop += (88 + categoryItems.length * 200) * pxRatio;
			}
			
			// 设置滚位置
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
				existItem.quantity++;
			} else {
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
		
		// 更物车信息
		updateCartInfo() {
			const cartData = uni.getStorageSync('cartData')
			if (cartData) {
				const cartList = JSON.parse(cartData)
				this.cartCount = cartList.reduce((total, item) => total + item.quantity, 0)
				this.totalPrice = cartList.reduce((total, item) => total + item.price * item.quantity, 0)
			} else {
				this.cartCount = 0
				this.totalPrice = 0
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
			const product = this.categories[categoryIndex]?.items[productIndex];
			if (!product) return true;

			const cartItem = this.cartList.find(item => 
				item.categoryIndex === categoryIndex && 
				item.productIndex === productIndex
			);

			return cartItem ? cartItem.quantity >= product.stock : false;
		},
		
		// 修改搜索商品方法
		searchProducts() {
			if (!this.searchKeyword.trim()) {
				this.isSearching = false;
				this.searchResults = [];
				return;
			}

			this.isSearching = true;
			this.searchResults = [];
			this.selectedBrand = 'all';

			// 搜索逻辑
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
				categoryIndex: categoryIndex,  // 确保传递这个
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
			// 先检查是否达到库存限制
			if (this.isStockLimit(categoryIndex, productIndex)) {
				uni.showToast({
					title: '已达到库存上',
					icon: 'none'
				});
				return;
			}

			// 如果是从购物车弹层点直接添加商品
			if (!event || !event.touches) {
				this.addToCart(categoryIndex, productIndex);
				return;
			}

			// 以下是带动画效果的添商逻辑
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
				
				// 清除临时值
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
			// 如果正在搜索，则清除搜索状态
			if (this.isSearching) {
				this.isSearching = false;
				this.searchKeyword = '';
				this.searchResults = [];
			}
			
			// 重置当前分类索引
			this.currentCategory = 0;
			this.scrollTop = 0;
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
		// 获取店铺详情
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
		}
	},
	created() {
		// 在组件创时应用节流
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
	// 添加 onPullDownRefresh 生命周期方法（与 methods 级）
	onPullDownRefresh() {
		// 果正在搜索状态，刷新搜索结果
		if (this.isSearching) {
			this.searchProducts();
		}
		
		// 延迟关闭下拉刷新
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
	padding-bottom: 110rpx;
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
	font-size: 32rpx;
	color: #333;
	gap: 10rpx;
}

.merchant-entry .merchant-icon {
	width: 44rpx;
	height: 44rpx;
	margin-left: 0;
}

.main-content {
	flex: 1;
	display: flex;
	overflow: hidden;
	background: #fff;
	height: 0;
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
	padding-right: 20rpx;
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
	margin-right: 10rpx;
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
	height: 110rpx;
	background: #fff;
	border-top: 1rpx solid #eee;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8rpx 30rpx;
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
	border-radius: 0 24rpx 24rpx 0;
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
	border-radius: 24rpx 0 0 24rpx;
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
	color: #ff6b6b;
	margin-top: 10rpx;
}

/* 修改购物车中的数量控制器样式 */
.cart-item .quantity-control {
	display: flex;
	align-items: center;
	background: #f5f5f5;
	border-radius: 0 24rpx 24rpx 0;
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

/* 修改库存显样式 */
.product-stock {
	font-size: 24rpx;
	color: #999;
}

.product-stock.low {
	color: #ff6b6b;
}

/* 添加搜索相样式 */
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

.brand-filter {
    display: flex;
    align-items: center;
    padding: 20rpx;
    background-color: #fff;
    border-bottom: 1rpx solid #f0f2f7;
}

.brand-label {
    font-size: 28rpx;
    color: #333;
    margin: 0 20rpx;
    white-space: nowrap;
}

.brand-scroll {
    flex: 1;
    white-space: nowrap;
}

.brand-list {
    display: inline-flex;
    padding-right: 20rpx;
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
}

.brand-item.active {
    color: #fff;
    background: #007AFF;
}

/* 修改搜果中的 add-btn 样式 */
.search-results .product-price-wrap {
    padding-right: 20rpx;
}

.search-results .add-btn,
.search-results .quantity-control {
    margin-right: 20rpx;
}

/* 搜索结为空时的样式 */
.search-results:empty {
    display: none;
}

/* 统一搜索结果中的商品项样式 */
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
    margin-bottom: 10rpx; /* 添加底部间距，使按钮对齐 */
}

.search-results .add-btn,
.search-results .quantity-control {
    position: absolute; /* 使用绝对定位 */
    right: 20rpx; /* 右对齐 */
    bottom: 0; /* 底部对齐 */
}

.my-quantity-control {
	right: 0rpx !important
}

.my-add-btn {
	right: 10rpx !important
}
</style> 