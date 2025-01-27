<template>
	<view class="container">
		<!-- 骨架屏 -->
		<view class="skeleton" v-if="loading">
			<!-- 搜索栏骨架 -->
			<view class="search-bar-skeleton">
				<view class="search-input-skeleton"></view>
			</view>
			
			<!-- 品牌筛选骨架 -->
			<view class="brand-filter-skeleton">
				<view class="brand-scroll-skeleton">
					<view class="brand-item-skeleton" v-for="i in 5" :key="i"></view>
				</view>
			</view>
			
			<!-- 商品列表骨架 -->
			<view class="main-content-skeleton">
				<view class="category-list-skeleton">
					<view class="category-item-skeleton" v-for="i in 8" :key="i"></view>
				</view>
				<view class="product-list-skeleton">
					<view class="product-item-skeleton" v-for="i in 6" :key="i">
						<view class="product-image-skeleton"></view>
						<view class="product-info-skeleton">
							<view class="product-name-skeleton"></view>
							<view class="product-price-skeleton"></view>
						</view>
					</view>
				</view>
			</view>
		</view>

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
				<view 
					class="product-item" 
					:class="{ selected: isProductSelected(item.id) }"
					v-for="item in searchResults" 
					:key="item.id"
				>
					<image :src="item.image" mode="aspectFit"></image>
					<view class="product-info">
						<view class="product-info-top">
							<text class="product-name">{{ item.name }}</text>
							<text class="product-stock">库存{{ item.stock }}</text>
						</view>
						<view class="product-price-wrap">
							<text class="price">￥{{ item.price.toFixed(2) }}/件</text>
							<view class="quantity-control" v-if="isProductSelected(item.id)">
								<text class="quantity-btn" @tap.stop="updateQuantity(item.id, -1)">-</text>
								<text class="quantity-value">{{ productQuantities[item.id] || 1 }}</text>
								<text class="quantity-btn" @tap.stop="updateQuantity(item.id, 1)">+</text>
							</view>
							<view class="add-btn" v-else @tap.stop="goToDetail(item, item.categoryIndex, item.productIndex)">
								<text class="icon-add">+</text>
							</view>
						</view>
					</view>
				</view>
				<view class="loading-more" v-if="loading">加载中...</view>
				<view class="no-more" v-if="!hasMore">没有更多了</view>
			</scroll-view>
		</view>
		
		<!-- 主体内容区 -->
		<view class="main-content" v-else>
			<!-- 左侧分类导航 -->
			<scroll-view scroll-y class="category-list">
				<view 
					class="category-item" 
					v-for="(category, index) in categories" 
					:key="category.id"
					:class="{ active: currentCategory === index }"
					@tap="switchCategory(index)"
				>
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
						<view 
							class="product-item" 
							:class="{ selected: isProductSelected(item.id) }"
							v-for="(item, index) in category.items" 
							:key="item.id"
						>
							<image :src="item.image" mode="aspectFit"></image>
							<view class="product-info">
								<view class="product-info-top">
									<text class="product-name">{{ item.name }}</text>
									<text class="product-stock">库存{{ item.stock }}</text>
								</view>
								<view class="product-price-wrap">
									<text class="price">￥{{ item.price.toFixed(2) }}/件</text>
									<view class="quantity-control" v-if="isProductSelected(item.id)">
										<text class="quantity-btn" @tap.stop="updateQuantity(item.id, -1)">-</text>
										<text class="quantity-value">{{ productQuantities[item.id] || 1 }}</text>
										<text class="quantity-btn" @tap.stop="updateQuantity(item.id, 1)">+</text>
									</view>
									<view class="add-btn" v-else @tap.stop="goToDetail(item, categoryIndex, index)">
										<text class="icon-add">+</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 底部确认栏 -->
		<view class="bottom-bar">
			<view class="selected-info" @tap="showSelectedDetails">
				<text>已选择 {{ getTotalQuantity() }} 件配件</text>
				<text class="total-amount" v-if="selectedProducts.length > 0">
					总计：￥{{ selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2) }}
				</text>
			</view>
			<button class="confirm-btn" @tap="confirmSelection">选择完成</button>
		</view>

		<!-- 选择详情弹窗 -->
		<view class="selected-details-popup" v-if="showPopup" @tap="hideSelectedDetails">
			<view class="popup-content" @tap.stop>
				<view class="popup-header">
					<text class="popup-title">已选配件 ({{ getTotalQuantity() }})</text>
					<view class="header-right">
						<text class="clear-all" @tap="clearAllProducts" v-if="selectedProducts.length > 0">清空</text>
						<text class="close-btn" @tap="hideSelectedDetails">×</text>
					</view>
				</view>
				<scroll-view scroll-y class="selected-list">
					<template v-if="selectedProducts.length > 0">
						<view class="selected-item" v-for="product in selectedProducts" :key="product.id">
							<image :src="product.image" mode="aspectFit"></image>
							<view class="item-info">
								<text class="item-name">{{ product.name }}</text>
								<view class="item-price-wrap">
									<text class="item-price">￥{{ product.price.toFixed(2) }}/件</text>
									<view class="quantity-control">
										<text class="quantity-btn" @tap="updateQuantity(product.id, -1)">-</text>
										<text class="quantity-value">{{ productQuantities[product.id] || 1 }}</text>
										<text class="quantity-btn" @tap="updateQuantity(product.id, 1)">+</text>
									</view>
								</view>
							</view>
						</view>
					</template>
					<view class="empty-state" v-else>
						<image src="/static/products/empty_cart.png" mode="aspectFit"></image>
						<text>暂无选择配件</text>
					</view>
				</scroll-view>
				<view class="popup-footer">
					<view class="total-info">
						<text>共 {{ getTotalQuantity() }} 件配件</text>
						<text class="total-price">￥{{ selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2) }}</text>
					</view>
				</view>
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
			scrollTop: 0,
			heightArr: [],
			searchKeyword: '',
			searchResults: [],
			isSearching: false,
			loading: true,
			refreshing: false,
			page: 1,
			hasMore: true,
			isManualSwitching: false,
			brands: [
				{ id: 'all', name: '全部' }
			],
			selectedBrand: 'all',
			// 添加选中商品数组
			selectedProducts: [],
			// 添加商品数量映射
			productQuantities: {},
			showPopup: false, // 添加弹窗显示状态
		}
	},
	computed: {
		currentProducts() {
			return this.categories[this.currentCategory] || []
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
	created() {
		console.log('merchantShop created')
		// 在组件创建时加载商品列表和品牌列表
		this.loadProducts()
		this.getBrandList()
		// 在组件建时应用节流
		this.switchCategory = throttle(this.switchCategory, 200);
	},
	mounted() {
		console.log('merchantShop mounted')
	},
	onShow() {
		console.log('merchantShop onShow')
	},
	onReady() {
		console.log('merchantShop onReady')
		this.calculateHeight()
	},
	onUnload() {
		// 移除事件监听
		uni.$off('refreshShop', this.handleShopChange)
	},
	methods: {
		// 计算高度的法
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
		
		// 修改获商品
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
			
			// 精确的高度算
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
			
			// 更确的动位置检测
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
				url: `/packageMerchant/pages/merchantDetails/merchantDetails?merchantId=${this.merchantId}`
			})
		},
		
		// 改搜索商法
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
		
		// 修改商品点击方法
		goToDetail(item, categoryIndex, productIndex) {
			const productInfo = this.isSearching ? item : this.categories[categoryIndex].items[productIndex];
			
			if (!productInfo) {
				uni.showToast({
					title: '商品信息不完整',
					icon: 'none'
				});
				return;
			}
			
			// 切换选中状态
			const index = this.selectedProducts.findIndex(p => p.id === productInfo.id);
			if (index === -1) {
				// 如果未选中，则添加到选中列表
				this.selectedProducts.push({
					...productInfo,
					quantity: this.productQuantities[productInfo.id] || 1
				});
				// 初始化数量为1
				if (!this.productQuantities[productInfo.id]) {
					this.$set(this.productQuantities, productInfo.id, 1);
				}
			} else {
				// 如果已选中，则从选中列表中移除
				this.selectedProducts.splice(index, 1);
				// 清除数量记录
				this.$delete(this.productQuantities, productInfo.id);
			}
		},
		
		// 修改更新商品数量方法
		updateQuantity(productId, delta) {
			const currentQuantity = this.productQuantities[productId] || 1;
			const newQuantity = currentQuantity + delta;
			
			// 如果数量为0，移除商品
			if (newQuantity <= 0) {
				// 从选中列表中移除
				const index = this.selectedProducts.findIndex(p => p.id === productId);
				if (index !== -1) {
					this.selectedProducts.splice(index, 1);
				}
				// 清除数量记录
				this.$delete(this.productQuantities, productId);
				return;
			}
			
			// 更新数量
			this.$set(this.productQuantities, productId, newQuantity);
			
			// 更新选中商品列表中的数量
			const product = this.selectedProducts.find(p => p.id === productId);
			if (product) {
				product.quantity = newQuantity;
			}
		},
		
		// 修改确认选择方法
		confirmSelection() {
			// 移除对空选择的检查，允许0个配件的确认
			const pages = getCurrentPages();
			const prevPage = pages[pages.length - 2];
			if (!prevPage) return;

			let originalContent = prevPage.$vm.replyContent || '';
			
			if (this.selectedProducts.length === 0) {
				// 如果没有选择配件，则清空回复页面的配件信息
				originalContent = originalContent.replace(/您此次维修需要购买以下配件[\s\S]*$/, '').trim();
				prevPage.$vm.replyContent = originalContent;
				uni.navigateBack();
				return;
			}
			
			// 计算总金额
			const totalAmount = this.selectedProducts.reduce((sum, product) => {
				return sum + (product.price * product.quantity);
			}, 0);
			
			// 构建配件信息文本
			let partsInfo = '您此次维修需要购买以下配件:\n';
			this.selectedProducts.forEach((product, index) => {
				partsInfo += `${index + 1}. ${product.name}\n`;
				partsInfo += `   数量：${product.quantity}件\n`;
				partsInfo += `   单价：￥${product.price.toFixed(2)}\n`;
				partsInfo += `   金额：￥${(product.price * product.quantity).toFixed(2)}\n`;
			});
			partsInfo += `\n总金额：￥${totalAmount.toFixed(2)}\n\n`;
			
			// 处理原有内容
			if (originalContent.includes('您此次维修需要购买以下配件')) {
				// 如果原有内容中已有配件信息，则替换掉
				originalContent = originalContent.replace(/您此次维修需要购买以下配件[\s\S]*$/, '').trim();
			}
			
			// 如果原有内容不为空，添加换行
			if (originalContent) {
				prevPage.$vm.replyContent = originalContent + '\n\n' + partsInfo;
			} else {
				prevPage.$vm.replyContent = partsInfo;
			}
			
			uni.navigateBack();
		},
		
		// 添加判断商品是否选中的方法
		isProductSelected(productId) {
			return this.selectedProducts.some(p => p.id === productId);
		},
		
		// 修改品牌选择方法
		selectBrand(brandId) {
			this.selectedBrand = brandId;
			
			// 重置滚动位置
			this.scrollTop = 0;
			// 清除选中的分类
			this.currentCategory = 0;
		},
		
		// 取品牌列表
		getBrandList() {
			api.merchant.selectModelsList().then(res => {
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
		// 添加禁用/启用滚方法
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
			this.page = 1
			this.hasMore = true
			this.loadProducts()
		},
		loadProducts() {
			console.log('开始加载商品列表')
			this.loading = true
			api.merchant.getProducts({
				shopId: -1,
				pageNum: this.page,
				pageSize: 10
			}).then(res => {
				console.log('获取商品列表响应:', res)
				if (res.code === 200) {
					const products = res.data || []
					if (products.length > 0) {
						this.categories = this.organizeProducts(products)
						console.log('商品列表更新:', this.categories)
					}
				} else {
					console.log('获取商品列表失败:', res.msg)
					uni.showToast({
						title: res.msg || '获取商品列表失败',
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
				console.log('商品列表加载完成')
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
					image: product.image ? request.BASE_URL_OSS + product.image : '/static/products/shangpin_default.png',
					brand: product.brand,
					categoryIndex: categories.length - 1,
					productIndex: category.items.length
				})
			})

			return categories
		},
		// 显示选择详情
		showSelectedDetails() {
			if (this.selectedProducts.length > 0) {
				this.showPopup = true;
			}
		},

		// 隐藏选择详情
		hideSelectedDetails() {
			this.showPopup = false;
		},

		// 修改清空方法
		clearAllProducts() {
			uni.showModal({
				title: '提示',
				content: '确定要清空所有已选配件吗？',
				success: (res) => {
					if (res.confirm) {
						// 清空选中商品数组
						this.selectedProducts = [];
						// 清空数量映射
						this.productQuantities = {};
						// 关闭弹窗
						this.hideSelectedDetails();
						
						uni.showToast({
							title: '已清空',
							icon: 'success'
						});
					}
				}
			});
		},
		
		// 添加计算总数量的方法
		getTotalQuantity() {
			return this.selectedProducts.reduce((sum, product) => {
				return sum + (product.quantity || 1);
			}, 0);
		},

		async initData() {
			// 在这里添加您的数据初始化逻辑
			// ... existing code ...
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

/* 修改搜索相关样式 */
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

/* 改滚动容器样式 */
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

/* 搜索结果为空的样式 */
.search-results:empty {
    display: none;
}

/* 搜索结果中的商品项样式 */
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
    padding-right: 0;
    margin-bottom: 10rpx;
}

.search-results-container {
	position: fixed;
	top: 200rpx;
	left: 0;
	right: 0;
	bottom: 0;
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

/* 添加选中状态样式 */
.product-item.selected {
    background-color: rgba(0, 122, 255, 0.05);
    border-radius: 12rpx;
}

.select-indicator {
    position: absolute;
    right: 20rpx;
    top: 20rpx;
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background-color: #007AFF;
    display: flex;
    align-items: center;
    justify-content: center;
}

.select-indicator .icon-check {
    color: #fff;
    font-size: 24rpx;
}

.quantity-control {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 8rpx;
    overflow: hidden;
    width: 150rpx;
}

.quantity-control .quantity-btn {
    width: 50rpx;
    height: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    color: #333;
    font-size: 28rpx;
}

.quantity-control .quantity-btn:active {
    background: #f0f0f0;
}

.quantity-control .quantity-value {
    width: 50rpx;
    text-align: center;
    font-size: 26rpx;
    color: #333;
}

.add-btn {
    width: 50rpx;
    height: 50rpx;
    background: #007AFF;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 20rpx;
}

.add-btn:active {
    opacity: 0.8;
}

.icon-add {
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    line-height: 1;
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
    justify-content: space-between;
    padding: 0 30rpx;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
    z-index: 100;
}

.bottom-bar .selected-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.bottom-bar .selected-info text {
    font-size: 26rpx;
    color: #666;
}

.bottom-bar .selected-info .total-amount {
    color: #FF9B49;
    font-size: 30rpx;
    font-weight: 500;
    margin-top: 4rpx;
}

.bottom-bar .confirm-btn {
    width: 200rpx;
    height: 72rpx;
    line-height: 72rpx;
    background: #007AFF;
    color: #fff;
    font-size: 28rpx;
    border-radius: 36rpx;
    margin: 0;
}

.bottom-bar .confirm-btn:active {
    opacity: 0.9;
}

/* 调整商品列表底部间距，避被底部栏遮挡 */
.product-list {
    padding-bottom: 120rpx;
}

/* 弹窗样式 */
.selected-details-popup {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 1000;
	display: flex;
	align-items: flex-end;
}

.popup-content {
	width: 100%;
	background-color: #fff;
	border-radius: 24rpx 24rpx 0 0;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
}

.popup-header {
	padding: 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1rpx solid #f5f5f5;
}

.popup-title {
	font-size: 32rpx;
	font-weight: 500;
	color: #333;
}

.close-btn {
	font-size: 40rpx;
	color: #999;
	padding: 0 20rpx;
}

.selected-list {
	flex: 1;
	max-height: 60vh;
	padding: 0 30rpx;
}

.selected-item {
	display: flex;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f5f5f5;
}

.selected-item image {
	width: 120rpx;
	height: 120rpx;
	margin-right: 20rpx;
}

.item-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	height: 120rpx;
}

.item-name {
	font-size: 28rpx;
	color: #333;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.item-price-wrap {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.item-price {
	font-size: 28rpx;
	color: #FF9B49;
}

.popup-footer {
	padding: 20rpx 30rpx;
	border-top: 1rpx solid #f5f5f5;
}

.total-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.total-info text {
	font-size: 28rpx;
	color: #666;
}

.total-info .total-price {
	font-size: 32rpx;
	color: #FF9B49;
	font-weight: 500;
}

/* 修改底部栏样式使其可点击 */
.selected-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 10rpx 0;
}

.selected-info:active {
	opacity: 0.8;
}

.popup-header .header-right {
	display: flex;
	align-items: center;
}

.popup-header .clear-all {
	font-size: 28rpx;
	color: #666;
	padding: 10rpx 20rpx;
	margin-right: 20rpx;
}

.popup-header .clear-all:active {
	opacity: 0.7;
}

/* 移除删除按钮相关样式 */
.delete-btn {
	display: none;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
}

.empty-state image {
	width: 240rpx;
	height: 240rpx;
	margin-bottom: 20rpx;
}

.empty-state text {
	font-size: 28rpx;
	color: #999;
}

/* 骨架屏样式 */
.skeleton {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: #fff;
	z-index: 100;
}

@keyframes shimmer {
	0% {
		background-position: -200% 0;
	}
	100% {
		background-position: 200% 0;
	}
}

.skeleton-base {
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
	background-size: 200% 100%;
	animation: shimmer 1.4s infinite;
}

.search-bar-skeleton {
	padding: 20rpx;
}

.search-input-skeleton {
	height: 72rpx;
	border-radius: 36rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
	background-size: 200% 100%;
	animation: shimmer 1.4s infinite;
}

.brand-filter-skeleton {
	padding: 20rpx;
}

.brand-scroll-skeleton {
	display: flex;
	overflow-x: hidden;
}

.brand-item-skeleton {
	width: 120rpx;
	height: 60rpx;
	margin-right: 20rpx;
	border-radius: 30rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
	background-size: 200% 100%;
	animation: shimmer 1.4s infinite;
}

.main-content-skeleton {
	display: flex;
	height: calc(100vh - 240rpx);
}

.category-list-skeleton {
	width: 180rpx;
	padding: 20rpx;
}

.category-item-skeleton {
	height: 80rpx;
	margin-bottom: 20rpx;
	border-radius: 8rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
	background-size: 200% 100%;
	animation: shimmer 1.4s infinite;
}

.product-list-skeleton {
	flex: 1;
	padding: 20rpx;
}

.product-item-skeleton {
	display: flex;
	margin-bottom: 30rpx;
}

.product-image-skeleton {
	width: 160rpx;
	height: 160rpx;
	border-radius: 8rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
	background-size: 200% 100%;
	animation: shimmer 1.4s infinite;
}

.product-info-skeleton {
	flex: 1;
	margin-left: 20rpx;
}

.product-name-skeleton {
	height: 40rpx;
	width: 70%;
	margin-bottom: 20rpx;
	border-radius: 4rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
	background-size: 200% 100%;
	animation: shimmer 1.4s infinite;
}

.product-price-skeleton {
	height: 32rpx;
	width: 40%;
	border-radius: 4rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
	background-size: 200% 100%;
	animation: shimmer 1.4s infinite;
}
</style> 