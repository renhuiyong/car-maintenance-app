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
						</view>
					</view>
				</view>
				<view class="loading-more" v-if="loading">加载中...</view>
				<view class="no-more" v-if="!hasMore">更多了</view>
			</scroll-view>
		</view>
		
		<!-- 骨架屏 -->
		<view class="skeleton-screen" v-if="loading && !isSearching">
			<!-- 左侧分类导航骨架 -->
			<view class="skeleton-category-list">
				<view class="skeleton-category-item" v-for="i in 6" :key="i"></view>
			</view>
			
			<!-- 右侧商品列表骨架 -->
			<view class="skeleton-product-list">
				<view class="skeleton-category-section" v-for="i in 2" :key="i">
					<view class="skeleton-section-title"></view>
					<view class="skeleton-product-items">
						<view class="skeleton-product-item" v-for="j in 3" :key="j">
							<view class="skeleton-image"></view>
							<view class="skeleton-content">
								<view class="skeleton-text-lg"></view>
								<view class="skeleton-text-sm"></view>
								<view class="skeleton-price"></view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 主体内容区 -->
		<view class="main-content" v-else-if="!isSearching">
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
								</view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
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
			loading: false,
			refreshing: false,
			page: 1,
			hasMore: true,
			isManualSwitching: false,
			brands: [
				{ id: 'all', name: '全部' }
			],
			selectedBrand: 'all',
			examineStatus: null // 添加审核状态
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
		// 检查商家审核状态
		api.merchant.getShopSelfExamineStatus().then(res => {
			if (res.code === 200) {
				const status = res.data.examineStatus
				this.examineStatus = status
				switch(status) {
					case 0:
						uni.showModal({
							title: '提示',
							content: '您的店铺正在审核中',
							showCancel: false
						})
						break
					case 1:
						uni.showModal({
							title: '提示',
							content: '请先缴纳保证金',
							showCancel: false
						})
						break
					case 2:
						uni.showModal({
							title: '提示',
							content: '等待平台审核',
							showCancel: false
						})
						break
					case 3:
						// 审核通过，加载所有信息
						this.loadProducts()
						this.getBrandList()
						break
					case 4:
						uni.showModal({
							title: '提示',
							content: '您的店铺审核未通过',
							showCancel: false
						})
						break
					case 5:
						uni.showModal({
							title: '提示',
							content: '请先申请店铺入驻',
							showCancel: false
						})
						break
					default:
						uni.showToast({
							title: '未知状态',
							icon: 'none'
						})
						uni.navigateBack()
				}
			} else {
				uni.showToast({
					title: res.msg || '获取店铺状态失败',
					icon: 'none'
				})
				uni.navigateBack()
			}
		}).catch(err => {
			console.error('获取店铺状态失败:', err)
			uni.showToast({
				title: '获取店铺状态失败',
				icon: 'none'
			})
			uni.navigateBack()
		})
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
		// 计算高度的方法
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
				url: `/pages/merchantDetails/merchantDetails?merchantId=${this.merchantId}`
			})
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
			
			// 构建查询参数
			const query = {
				id: productInfo.id,
				stock: productInfo.stock || 0  // 添加库存参数
			};
			
			const queryString = Object.keys(query)
				.map(key => `${key}=${encodeURIComponent(query[key])}`)
				.join('&');
			
			uni.navigateTo({
				url: `/pages/merchantProductDetail/merchantProductDetail?${queryString}`
			});
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
			this.page = 1
			this.hasMore = true
			this.loadProducts()
		},
		loadProducts() {
			console.log('开始加载商品列表')
			this.loading = true
			api.shop.getProducts({
				shopId: -1,
				pageNum: this.page,
				pageSize: 10
			}).then(res => {
				console.log('获取商品列表应:', res)
				if (res.code === 200) {
					const products = res.data || []
					if (products.length > 0) {
						this.categories = this.organizeProducts(products)
						console.log('商品列表已更新:', this.categories)
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
					image: product.image ? request.BASE_URL + product.image : '/static/products/shangpin_default.png',
					brand: product.brand,
					categoryIndex: categories.length - 1,
					productIndex: category.items.length
				})
			})

			return categories
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
	padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
	box-sizing: border-box;
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
	bottom: calc(100rpx + env(safe-area-inset-bottom));
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

/* 骨架屏样式 */
.skeleton-screen {
	flex: 1;
	display: flex;
	background: #fff;
	height: calc(100vh - 200rpx);
}

.skeleton-category-list {
	width: 180rpx;
	background: #f7f7f7;
	padding: 20rpx 0;
}

.skeleton-category-item {
	height: 60rpx;
	margin: 20rpx;
	background: #eeeeee;
	border-radius: 4rpx;
}

.skeleton-product-list {
	flex: 1;
	padding: 20rpx;
}

.skeleton-category-section {
	margin-bottom: 40rpx;
}

.skeleton-section-title {
	height: 40rpx;
	width: 200rpx;
	background: #eeeeee;
	margin-bottom: 20rpx;
	border-radius: 4rpx;
}

.skeleton-product-items {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.skeleton-product-item {
	display: flex;
	height: 160rpx;
	padding: 20rpx 0;
}

.skeleton-image {
	width: 160rpx;
	height: 160rpx;
	background: #eeeeee;
	margin-right: 20rpx;
	border-radius: 8rpx;
}

.skeleton-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.skeleton-text-lg {
	height: 32rpx;
	width: 80%;
	background: #eeeeee;
	margin-bottom: 16rpx;
	border-radius: 4rpx;
}

.skeleton-text-sm {
	height: 24rpx;
	width: 40%;
	background: #eeeeee;
	margin-bottom: 16rpx;
	border-radius: 4rpx;
}

.skeleton-price {
	height: 40rpx;
	width: 120rpx;
	background: #eeeeee;
	border-radius: 4rpx;
}

@keyframes skeleton-loading {
	0% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0 50%;
	}
}

.skeleton-category-item,
.skeleton-section-title,
.skeleton-image,
.skeleton-text-lg,
.skeleton-text-sm,
.skeleton-price {
	background: linear-gradient(
		90deg,
		#eeeeee 25%,
		#f5f5f5 37%,
		#eeeeee 63%
	);
	background-size: 400% 100%;
	animation: skeleton-loading 1.4s ease infinite;
}
</style> 