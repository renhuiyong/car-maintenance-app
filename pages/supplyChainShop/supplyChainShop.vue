<template>
	<view class="container">
		<!-- 状态提示 -->
		<view class="status-tip" v-if="examineStatus !== 1">
			<text class="tip-text">{{statusText}}</text>
		</view>
		
		<!-- 只有当状态为3时才显示页面内容 -->
		<template v-if="examineStatus === 1">
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
								<text v-if="item.status === 0" class="status-tag">待审核</text>
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
										<text v-if="item.status === 0" class="status-tag">待审核</text>
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
			
			<!-- 添加悬浮按钮 -->
			<view class="float-btn" 
				@touchstart="touchStart" 
				@touchmove="touchMove"
				@touchend="touchEnd"
				:style="{ 
					left: buttonLeft + 'px',
					top: buttonTop + 'px',
					right: 'auto',
					bottom: 'auto'
				}"
				@tap.stop="addAccessory">
				<image src="/static/images/add.png" mode="aspectFit" class="add-icon"></image>
			</view>
		</template>
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
			// 添加按钮位置相关数据
			buttonLeft: 0,
			buttonTop: 0,
			startX: 0,
			startY: 0,
			windowWidth: 0,
			windowHeight: 0,
			isDragging: false,
			examineStatus: null, // 审核状态
			statusText: '' // 状态提示文字
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
		let token = uni.getStorageSync('token')
		if (token) {
		// 先检查供应商状态
		this.checkSupplyChainStatus()
		// 在组件创建时加载商品列表和品牌列表
		this.loadProducts()
		this.getBrandList()
		// 在组件建时应用节流
		this.switchCategory = throttle(this.switchCategory, 200);
		
		// 获取屏幕尺寸
		const systemInfo = uni.getSystemInfoSync()
		this.windowWidth = systemInfo.windowWidth
		this.windowHeight = systemInfo.windowHeight
		// 设置初始位置在右下角，使用与吸附相同的距离
		this.buttonLeft = this.windowWidth - 60
		this.buttonTop = this.windowHeight - 180 // 确保在tabbar上方

		// 添加刷新事件监听
		uni.$on('refreshShopList', this.loadProducts)
		}else{
			uni.showToast({
				title: '请登录后查看',
				icon: 'none'
			})
		}
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
		uni.$off('refreshShopList', this.loadProducts)
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

		// 在 methods 中改 switchCategory 方法
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
			
			// 行动动画
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
			
			// 更确的位置
			for (let i = 0; i < this.filteredCategories.length; i++) {
				const category = this.filteredCategories[i];
				if (!category) continue;
				
				const titleHeight = 88 * pxRatio;
				const itemsHeight = (category.items?.length || 0) * ITEM_HEIGHT * pxRatio;
				const categoryGap = 20 * pxRatio;
				
				heightSum += titleHeight + itemsHeight + categoryGap;
				
				// 用阈值来判断当前分类
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
		
		// 修改搜索商品方法
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
					const matchesBrand = this.selectedBrand === 'all' || 
						(product.brand && product.brand.split(',').includes(this.selectedBrand.toString()));
					return matchesKeyword && matchesBrand;
				});

				const results = filteredItems.map(product => ({
					...product,
					categoryIndex,
					productIndex: category.items.findIndex(item => item.id === product.id)
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
		goToDetail(item) {
			if (!item || !item.id) {
				uni.showToast({
					title: '商品信息不完整',
					icon: 'none'
				});
				return;
			}
			
			// 构建查询参数，添加分类和品牌数组
			const query = {
				id: item.id,
				categories: encodeURIComponent(JSON.stringify(this.categories.map(cat => ({
					id: cat.id,
					name: cat.name
				})))),
				brands: encodeURIComponent(JSON.stringify(this.brands.filter(brand => brand.id !== 'all')))
			};
			
			const queryString = Object.keys(query)
				.map(key => `${key}=${query[key]}`)
				.join('&');
			
			uni.navigateTo({
				url: `/packageSupplyChain/pages/supplyChainProductDetail/supplyChainProductDetail?${queryString}`
			});
		},
		
		// 修改品牌选择方法
		selectBrand(brandId) {
			this.selectedBrand = brandId;
			
			// 如果正在搜索，重新执行搜索
			if (this.isSearching && this.searchKeyword) {
				this.searchProducts();
			}
			
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
			
			// 重新执行索
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
			api.supplyChain.getMyAccessoryList({
				shopId: -1,
				pageNum: this.page,
				pageSize: 10
			}).then(res => {
				console.log('获取商品列表响应:', res)
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
					image: product.image ? request.BASE_URL_OSS + product.image : '/static/products/shangpin_default.png',
					brand: product.brand,
					status: product.status,
					categoryIndex: categories.length - 1,
					productIndex: category.items.length
				})
			})

			return categories
		},
		// 添加触摸开始事件处理
		touchStart(e) {
			this.isDragging = false
			this.startX = e.touches[0].clientX - this.buttonLeft
			this.startY = e.touches[0].clientY - this.buttonTop
		},
		
		// 添加触摸移动事件处理
		touchMove(e) {
			this.isDragging = true
			// 计算新位置
			let newLeft = e.touches[0].clientX - this.startX
			let newTop = e.touches[0].clientY - this.startY
			
			// 限制按钮不超出屏幕边界，同时避开tabbar区域
			const btnSize = 80 // 按钮大小（rpx）
			const btnSizePx = btnSize * this.windowWidth / 750 // 转换为px
			const tabbarHeight = 100 // tabbar的高度（预估值，根据实际调整）
			
			// 限制左右边界
			newLeft = Math.max(0, Math.min(this.windowWidth - btnSizePx, newLeft))
			// 限制上下边界，底部预留tabbar的高度
			newTop = Math.max(0, Math.min(this.windowHeight - tabbarHeight - btnSizePx, newTop))
			
			this.buttonLeft = newLeft
			this.buttonTop = newTop
		},
		
		// 添加触摸结束事件处理
		touchEnd(e) {
			// 如果是拖动作才执行吸附逻辑
			if (this.isDragging) {
				e.stopPropagation()
				
				// 自动吸附到最近的边缘
				const halfWidth = this.windowWidth / 2
				const tabbarHeight = 100 // tabbar的高度（预估值，根据实际调整）
				
				// 判断是否需要吸附到右边，并调整右侧吸附位置
				if (this.buttonLeft + 40 > halfWidth) {
					this.buttonLeft = this.windowWidth - 60  // 改为距离右边60px
				} else {
					this.buttonLeft = 20
				}
				
				// 确保不会太靠近底部
				if (this.buttonTop > this.windowHeight - tabbarHeight - 100) {
					this.buttonTop = this.windowHeight - tabbarHeight - 100
				}
			}
			
			this.isDragging = false
		},
		
		// 修改添加配件方法，传递数组数据
		addAccessory() {
			if (this.isDragging) return
			// 获取当前选中的分类和品牌信息
			// const currentCategory = this.categories[this.currentCategory]
			// 构建参数，过滤掉"全部"选项
			const params = {
				// categories: encodeURIComponent(JSON.stringify(this.categories.map(cat => ({
				// 	id: cat.id,
				// 	name: cat.name
				// })))),
				brands: encodeURIComponent(JSON.stringify(this.brands.filter(brand => brand.id !== 'all'))),
				// currentCategoryId: currentCategory?.id || '',
				currentBrandId: this.selectedBrand !== 'all' ? this.selectedBrand : ''
			}
			
			// 将参数转换为查询字符串
			const query = Object.keys(params)
				.map(key => `${key}=${params[key]}`)
				.join('&')
			
			uni.navigateTo({
				url: `/packageSupplyChain/pages/supplyChainShopAccessoryAdd/supplyChainShopAccessoryAdd?${query}`
			})
		},
		// 检查供应商状态
		async checkSupplyChainStatus() {
			try {
				const res = await api.supplyChain.getSupplyChainDetail()
				if (res.code === 200) {
					this.examineStatus = res.data.examineStatus
					
					// 设置状态提示文字
					switch(this.examineStatus) {
						case 0:
							this.statusText = '您的入驻申请正在审核中'
							break
						case 1:
							// 已通过，加载商品列表
							this.loadProducts()
							break
						case 2:
							this.statusText = '很抱歉，您的入驻申请未通过审核'
							break
						case 5:
							this.statusText = '您还未申请入驻，请先完成入驻申请'
							break
						default:
							this.statusText = '系统繁忙，请稍后再试'
					}
				} else {
					uni.showToast({
						title: res.msg || '获取状态失败',
						icon: 'none'
					})
				}
			} catch (err) {
				console.error('获取供应商状态失败:', err)
				uni.showToast({
					title: '获取状态失败',
					icon: 'none'
				})
			}
		}
	},
	// 添加 onPullDownRefresh 生命周期方法（与 methods 同级
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
	height: calc(100vh - 100rpx);
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
	padding-bottom: env(safe-area-inset-bottom);
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
	bottom: 100rpx;
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
	height: calc(100vh - 300rpx);
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

/* 悬浮按钮样式 */
.float-btn {
	position: fixed;
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 100;
	touch-action: none;
}

.float-btn .add-icon {
	width: 80rpx;
	height: 80rpx;
}

.float-btn:active {
	transform: scale(0.95);
}

.status-tag {
	display: inline-block;
	font-size: 24rpx;
	color: #FF9933;
	background-color: rgba(255, 153, 51, 0.1);
	padding: 2rpx 8rpx;
	border-radius: 4rpx;
	margin-left: 12rpx;
	line-height: 1.2;
	white-space: nowrap;
	width: fit-content;
}

/* 添加状态提示样式 */
.status-tip {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #fff;
	z-index: 999;
}

.tip-text {
	font-size: 32rpx;
	color: #666;
	text-align: center;
	padding: 40rpx;
}
</style> 