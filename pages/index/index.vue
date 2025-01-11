<template>
	<view class="container">
		<!-- 顶部地图区域 -->
		<map
			id="myMap"
			class="map"
			:latitude="latitude"
			:longitude="longitude"
			:markers="markers"
			:show-location="true"
			@markertap="onMarkerTap"
			@tap="onMapTap"
			@regionchange="onMapRegionChange"
		></map>
		<view class="location-btn" @click="moveToLocation">
			<image class="location-icon" src="/static/images/location_icon.png"></image>
		</view>
		
		<!-- 底部预约区域 -->
		<view class="bottom-area" :style="{ 
			height: bottomAreaHeight,
			transitionDuration: transitionDuration 
		}">
			<!-- 原有的 tab-box 内容 -->
			<view class="tab-box">
				<view 
					class="tab-item" 
					:class="{ active: tabIndex === 0 }" 
					@click="switchTab(0)"
				>
					<text>抢单报修</text>
					<view class="tab-line"></view>
				</view>
				<view 
					class="tab-item" 
					:class="{ active: tabIndex === 1 }" 
					@click="switchTab(1)"
					@touchstart="handleTouchStart"
					@touchmove="handleTouchMove"
					@touchend="handleTouchEnd"
				>
					<text>指定报修</text>
					<view class="tab-line"></view>
				</view>
			</view>

			<!-- 抢单报修内容 -->
			<view v-if="tabIndex === 0" class="repair-content" key="grab">
				<view class="repair-wrap">
					<view class="rule-box" @click="checkRules">
						<image class="rule-icon" src="/static/images/lusei.png"></image>
						<view class="rule-text">查看报修规则</view>
						<image class="arrow-icon" src="/static/images/youjiantou2.png"></image>
					</view>
					<button class="submit-btn" @click="handleSubmit">发起报修</button>
				</view>
			</view>
			
			<!-- 指定报修内容 -->
			<view v-else class="repair-content" key="assign">
				<view class="repair-tip">为您推荐最近的维修商家：</view>
				<scroll-view 
					scroll-y 
					class="repair-list"
					@scrolltolower="onLoadMore"
					:scroll-top="scrollTop"
					:show-scrollbar="false"
					refresher-enabled
					@refresherrefresh="onRefresh"
					:refresher-triggered="isRefreshing"
					:style="{
						height: isExpanded ? 'calc(80vh - 180rpx)' : 'calc(30vh - 180rpx)',
						transitionDuration: transitionDuration
					}"
				>
					<view 
						v-for="(shop, index) in repairShops" 
						:key="shop.id"
						class="repair-item"
						@click="goToAssignRepair(shop)"
					>
						<view class="repair-title">
							<text>{{shop.name}}</text>
							<text class="distance">{{shop.distance}}</text>
						</view>
						<view class="repair-address">{{shop.address}}</view>
						<view class="repair-time-actions">
							<view class="repair-time">营业时间：{{shop.businessHours}}</view>
							<view class="repair-actions">
								<button class="action-btn"><image src="/static/products/weixiu.png" class="action-icon"></image></button>
								<button class="action-btn"><image src="/static/images/dianhua.png" class="action-icon"></image></button>
							</view>
						</view>
					</view>
					<view class="load-status">
						<view v-if="loading" class="loading">
							<view class="loading-spinner"></view>
							<text>加载中...</text>
						</view>
						<view v-if="finished && repairShops.length > 0" class="no-more">
							<text>已经到底啦</text>
						</view>
						<view v-if="finished && repairShops.length === 0" class="empty">
							<image src="/static/images/empty.png" mode="aspectFit" class="empty-icon"></image>
							<text>暂无维修商家</text>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>

		<!-- 授权弹窗 -->
		<view class="auth-modal" v-if="showAuthModal">
			<view class="auth-mask" @click="handleAuthCancel"></view>
			<view class="auth-content">
				<view class="auth-header">
					<image class="auth-icon" src="/static/location.png"></image>
					<view class="auth-title">电动车维修服务 申请</view>
					<view class="auth-desc">获取您的位置信息，用于电动车维修服务</view>
				</view>
				<view class="auth-btns">
					<button class="auth-btn cancel" @click="handleAuthCancel">拒绝</button>
					<button class="auth-btn confirm" @click="handleAuthConfirm">允许</button>
				</view>
				<view class="auth-checkbox">
					<checkbox-group @change="handleCheckboxChange">
						<checkbox :value="isChecked" :checked="isChecked" style="transform:scale(0.7)" color="#07c160"/>
						<text class="checkbox-text">已阅读并接受《电动车维修服务小程序隐私保护指引》</text>
					</checkbox-group>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import api from '@/api/index.js'

	export default {
		data() {
			return {
				tabIndex: 0,
				latitude: 33.954834,
				longitude: 116.794277,
				markers: [],
				showAuthModal: false,
				isChecked: false,
				repairShops: [],
				pageNum: 1,
				pageSize: 5,
				loading: false,
				finished: false,
				scrollTop: 0,
				promotionCode: '',
				isExpanded: false,
				startY: 0,
				bottomAreaHeight: '30vh',
				minHeight: '30vh',
				maxHeight: '80vh',
				windowHeight: 0,
				lastMoveTime: 0,
				transitionDuration: '0.6s',
				selectedShopId: null,
				isMapMoving: false,
				isRefreshing: false,
				loadMoreThrottle: null,
				hasLocationAuth: false,
				isLogin: false,
			}
		},
		computed: {
			repairContentHeight() {
				return this.isExpanded ? 
					`calc(${this.maxHeight} - 110rpx)` : 
					`calc(${this.minHeight} - 110rpx)`
			}
		},
		onLoad(query) {
			// 获取系统信息
			const { windowHeight } = uni.getSystemInfoSync()
			this.windowHeight = windowHeight
			
			// 检查授权状态
			this.checkLocationAuth()
			
			// 处理小程序二数
			this.handleSceneCode(query)
		},
		watch: {
			repairShops: {
				handler(shops) {
					this.updateMarkers(shops)
				},
				immediate: true
			}
		},
		onShow() {
			// 检查登录状态
			this.checkLoginStatus()
		},
		methods: {
			switchTab(index) {
				this.tabIndex = index
				if (index === 0) {
					// 抢单报修 - 收起底部区域
					this.clearSelectedShop()
					this.transitionDuration = '0.3s'
					this.isExpanded = false
					this.bottomAreaHeight = this.minHeight
				} else {
					// 指定报修 - 展开底部区域
					// 重置列表状态
					this.scrollTop = 0
					this.pageNum = 1
					this.finished = false
					this.repairShops = []
					this.loading = false
					
					this.$nextTick(() => {
						setTimeout(() => {
							this.transitionDuration = '0.6s'
							this.isExpanded = true
							this.bottomAreaHeight = this.maxHeight
							// 切换后立即加载数据
							this.loadMore()
						}, 150)
					})
				}
			},
			
			setTransitionDuration(duration) {
				const bottomArea = document.querySelector('.bottom-area')
				const repairContent = document.querySelector('.repair-content[key="assign"]')
				
				if (bottomArea) {
					bottomArea.style.transitionDuration = duration
				}
				if (repairContent) {
					repairContent.style.transitionDuration = duration
				}
			},
			
			checkLoginStatus() {
				const token = uni.getStorageSync('token')
				const userInfo = uni.getStorageSync('userInfo')
				this.isLogin = !!(token && userInfo)
			},
			
			handleSubmit() {
				// 先检查登录状态
				if (!this.isLogin) {
					uni.showModal({
						title: '提示',
						content: '请先登录后再发起报修',
						confirmText: '去登录',
						success: (res) => {
							if (res.confirm) {
								uni.switchTab({
									url: '/pages/my/my'
								})
							}
						}
					})
					return
				}

				if (!this.hasLocationAuth) {
					uni.showModal({
						title: '提示',
						content: '需要获取您的位置信息才能发起报修，是否去授权？',
						confirmText: '去授权',
						success: (res) => {
							if (res.confirm) {
								this.showAuthModal = true
							}
						}
					})
					return
				}

				uni.navigateTo({
					url: '/pages/grabOrder/grabOrder'
				})
			},
			// 处理复框变化
			handleCheckboxChange(e) {
				this.isChecked = e.detail.value.length > 0
			},
			// 处理取消授权
			handleAuthCancel() {
				this.showAuthModal = false
				uni.showToast({
					title: '您拒绝了位置授权',
					icon: 'none'
				})
			},
			// 处理确认授权
			handleAuthConfirm() {
				if (!this.isChecked) {
					uni.showToast({
						title: '请阅读并同意隐私保护指引',
						icon: 'none'
					})
					return
				}
				
				// 先关闭自定义授权弹窗
				this.showAuthModal = false
				
				// 然后请求小程序位置授权
				uni.authorize({
					scope: 'scope.userLocation',
					success: () => {
						this.hasLocationAuth = true
						this.getLocation()
					},
					fail: () => {
						this.hasLocationAuth = false
						uni.showModal({
							title: '提示',
							content: '需要获取您的位置信息，请设置中打开位置权限',
							confirmText: '去设置',
							success: (res) => {
								if (res.confirm) {
									uni.openSetting({
										success: (settingRes) => {
											if (settingRes.authSetting['scope.userLocation']) {
												this.hasLocationAuth = true
												this.getLocation()
											}
										}
									})
								}
							}
						})
					}
				})
			},
			// 获取位置信息
			getLocation() {
				uni.getLocation({
					type: 'gcj02',
					isHighAccuracy: true,
					geocode: true, // 开启地址解析
					success: (res) => {
						this.latitude = res.latitude
						this.longitude = res.longitude
						
						// 获取��置成功后立即加载家列表
						this.repairShops = []
						this.pageNum = 1
						this.finished = false
						this.loadMore()
						
						// 使用地址信息
						if (res.address) {
							// 优先使用地址名称
							if (res.name) {
								this.address = res.name
							} else {
								// 使用格式化的地址
								const address = res.address
								this.address = address
							}
						}
					},
					fail: (err) => {
						console.error('获取位置失败：', err)
						uni.showToast({
							title: '获取位置失败，请检查定位权限',
							icon: 'none',
							duration: 2000
						})
					}
				})
			},
			// 添加页面跳转方法
			switchPage(url) {
				uni.switchTab({
					url
				})
			},
			// 检查位置权限状态
			checkLocationAuth() {
				uni.getSetting({
					success: (res) => {
						this.hasLocationAuth = !!res.authSetting['scope.userLocation']
						if (!res.authSetting['scope.userLocation']) {
							// 未授权，显示授权弹窗
							this.showAuthModal = true
						} else {
							// 已授权，直接获取位置
							this.getLocation()
						}
					}
				})
			},
			// 修改moveToLocation方法
			moveToLocation() {
				const mapContext = uni.createMapContext('myMap', this)
				
				uni.getLocation({
					type: 'gcj02',
					isHighAccuracy: true,
					geocode: true, // 开启地址解析
					success: (res) => {
						this.latitude = res.latitude
						this.longitude = res.longitude
						
						// 移动地图到当前位置
						mapContext.moveToLocation({
							latitude: res.latitude,
							longitude: res.longitude
						})
						
						// 更新地址显示
						if (res.address) {
							if (res.name) {
								this.address = res.name
							} else {
								this.address = res.address
							}
							
							uni.showToast({
								title: '已定位到当前位置',
								icon: 'success',
								duration: 1500
							})
						}
					},
					fail: (err) => {
						uni.showToast({
							title: '获取当前位置失败',
							icon: 'none',
							duration: 2000
						})
					}
				})
			},
			// 加载更多数据
			loadMore() {
				if (this.loading || this.finished) return Promise.resolve()
				
				this.loading = true
				
				return api.shop.getShopList({
					longitude: this.longitude,
					latitude: this.latitude, 
					pageNum: this.pageNum,
					pageSize: this.pageSize
				}).then(res => {
					if (res.code === 200) {
						const { rows, total } = res
						
						if (!rows || rows.length === 0) {
							this.finished = true
							return
						}
						
						// 使用接口返回的 distance
						const shopsWithDistance = rows.map(shop => ({
							...shop,
							distanceValue: parseFloat(shop.distance) // 将距离字符串转为数字用于排序
						}))
						
						// 按距离排序
						shopsWithDistance.sort((a, b) => a.distanceValue - b.distanceValue)
						
						// 追加新数据
						this.repairShops = this.repairShops.concat(shopsWithDistance)
						
						this.pageNum++
						
						if (rows.length < this.pageSize) {
							this.finished = true
						}
					} else {
						throw new Error(res.msg || '获取商家列表失败')
					}
				}).catch(error => {
					console.error('加载更多数据失败:', error)
					uni.showToast({
						title: error.message || '获取商家列表失败',
						icon: 'none'
					})
				}).finally(() => {
					this.loading = false
				})
			},
			// 处理滚动事件
			handleScroll(e) {
				this.scrollTop = e.detail.scrollTop
			},
			goToAssignRepair(shop) {
				// 先检查登录状态
				if (!this.isLogin) {
					uni.showModal({
						title: '提示',
						content: '请先登录后再查看商家详情',
						confirmText: '去登录',
						success: (res) => {
							if (res.confirm) {
								uni.switchTab({
									url: '/pages/my/my'
								})
							}
						}
					})
					return
				}

				if (!this.hasLocationAuth) {
					uni.showModal({
						title: '提示',
						content: '需要获取您的位置信息才能发起报修，是否去授权？',
						confirmText: '去授权',
						success: (res) => {
							if (res.confirm) {
								this.showAuthModal = true
							}
						}
					})
					return
				}
				
				// 设置选中的商家 ID 并立即更新标记
				this.selectedShopId = shop.id
				this.updateMarkers(this.repairShops)
				
				// 使用 nextTick 确保视图更新后再导航
				this.$nextTick(() => {
					setTimeout(() => {
						uni.navigateTo({
							url: `/packageMerchant/pages/merchantDetails/merchantDetails?shopId=${shop.id}&latitude=${this.latitude}&longitude=${this.longitude}`
						})
					}, 300)
				})
			},
			// 添加取消选中的方法
			clearSelectedShop() {
				this.selectedShopId = null
				this.updateMarkers(this.repairShops)
			},
			// 添加查看规则方法
			checkRules() {
				uni.navigateTo({
					url: '/pages/repairRules/repairRules'
				})
			},
			/**
			 * 处理小程序二维码中的场景值
			 * @param {Object} query - 页面参数对象
			 * @param {string} [query.scene] - 小程序码场景值
			 */
			handleSceneCode(query) {
				if (!query.scene) return
				
				try {
					// scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 scene
					const scene = decodeURIComponent(query.scene)
					console.log('解码后的scene:', scene)
					
					// 解析 scene 中的邀请码
					const [key, value] = scene.split('=')
					if (key === 'promotionCode' && value) {
						this.promotionCode = value
						// 存储邀请码到本地存储，以便后续使用
						uni.setStorageSync('promotionCode', value)
						console.log('功设置邀请码:', value)
					}
				} catch (error) {
					console.error('解析请码失败:', error)
				}
			},
			handleTouchStart(e) {
				this.startY = e.touches[0].clientY
			},
			
			handleTouchMove(e) {
				// 只有在指定报修时才允许动
				if (this.tabIndex !== 1) return
				
				// 添加简单的节流
				const now = Date.now()
				if (now - this.lastMoveTime < 16) {
					return
				}
				this.lastMoveTime = now
				
				// 其他辑保持不变
				const currentY = e.touches[0].clientY
				const diff = this.startY - currentY
				
				const vh = (diff / this.windowHeight) * 100
				const currentHeight = parseInt(this.bottomAreaHeight)
				let newHeight = currentHeight + vh
				
				newHeight = Math.max(parseInt(this.minHeight), Math.min(parseInt(this.maxHeight), newHeight))
				
				this.bottomAreaHeight = `${newHeight}vh`
				this.startY = currentY
			},
			
			handleTouchEnd() {
				if (this.tabIndex !== 1) return
				
				const currentHeight = parseInt(this.bottomAreaHeight)
				const threshold = (parseInt(this.maxHeight) + parseInt(this.minHeight)) / 2
				
				if (currentHeight > threshold) {
					this.transitionDuration = '0.6s'
					this.bottomAreaHeight = this.maxHeight
					this.isExpanded = true
				} else {
					this.transitionDuration = '0.3s'
					this.bottomAreaHeight = this.minHeight
					this.isExpanded = false
				}
			},
			// 更新地图标记点
			updateMarkers(shops) {
				if (!shops || !shops.length) {
					this.markers = []
					return
				}
				
				this.markers = shops.map(shop => ({
					id: shop.id,
					latitude: shop.latitude,
					longitude: shop.longitude,
					width: 40,
					height: 40,
					joinCluster: true, // 支持聚合效果
					iconPath: this.selectedShopId === shop.id ? 
						'/static/images/marker_active.png' : 
						'/static/images/marker.png',
					anchor: {
						x: 0.5,
						y: 1
					},
					callout: {
						content: shop.name,
						color: '#333333',
						fontSize: 12,
						borderWidth: 1,
						borderColor: '#FFFFFF',
						borderRadius: 2,
						bgColor: '#FFFFFF',
						padding: 4,
						display: this.selectedShopId === shop.id ? 'ALWAYS' : 'BYCLICK',
						textAlign: 'center'
					}
				}))
			},
			// 添加标记点击事件处理
			onMarkerTap(e) {
				const markerId = e.markerId
				const shop = this.repairShops.find(shop => shop.id === markerId)
				if (shop) {
					// 新地图中心点到选的商家
					this.latitude = shop.latitude
					this.longitude = shop.longitude
					
					// 设置选中的商家 ID
					this.selectedShopId = shop.id
					
					// 更新标记
					this.updateMarkers(this.repairShops)

					// 阻止地图点击事件的冒泡
					e.stopPropagation && e.stopPropagation()
				}
			},
			// 添加地图点击事件处理
			onMapTap() {
				if (this.tabIndex === 1 && this.isExpanded) {
					this.collapseBottomArea()
				}
			},

			// 添加地图区域变化事件处理
			onMapRegionChange(e) {
				if (e.type === 'begin') {
					this.isMapMoving = true
				} else if (e.type === 'end') {
					this.isMapMoving = false
					// 如果是指定报修且展开状态，则收起
					if (this.tabIndex === 1 && this.isExpanded) {
						this.collapseBottomArea()
					}
				}
			},

			// 添加收起底部区域的方法
			collapseBottomArea() {
				this.transitionDuration = '0.3s'
				this.bottomAreaHeight = this.minHeight
				this.isExpanded = false
			},

			deg2rad(deg) {
				return deg * (Math.PI/180)
			},

			// 添加下拉刷新方法
			onRefresh() {
				if (this.isRefreshing) return
				
				this.isRefreshing = true
				this.pageNum = 1
				this.finished = false
				
				// 调用接口获取数据
				api.shop.getShopList({
					longitude: this.longitude,
					latitude: this.latitude, 
					pageNum: 1,
					pageSize: this.pageSize
				}).then(res => {
					if (res.code === 200) {
						const { rows } = res
						
						// 使用接口返回的 distance
						const shopsWithDistance = rows.map(shop => ({
							...shop,
							distanceValue: parseFloat(shop.distance) // 将距离字符串转为数字用于排序
						}))
						
						// 按距离排序
						shopsWithDistance.sort((a, b) => a.distanceValue - b.distanceValue)
						
						// 重置数据
						this.repairShops = shopsWithDistance
						
						// 只有当获取的数据条数小于 pageSize 时，才标记为加载完成
						if (rows.length < this.pageSize) {
							this.finished = true
						}
						
						uni.showToast({
							title: '刷新成功',
							icon: 'success',
							duration: 1500
						})
					} else {
						uni.showToast({
							title: res.msg || '刷新失败',
							icon: 'none',
							duration: 2000
						})
					}
				}).catch(error => {
					console.error('刷新失败:', error)
					uni.showToast({
						title: '刷新失败',
						icon: 'none',
						duration: 2000
					})
				}).finally(() => {
					this.isRefreshing = false
				})
			},

			// 添加上拉加载更多方法
			onLoadMore() {
				console.log('触发上拉加载')
				if (this.loading || this.finished) {
					console.log('正在加载或已加载完成，不触发加载', {
						loading: this.loading,
						finished: this.finished,
						pageNum: this.pageNum,
						total: this.repairShops.length
					})
					return
				}
				
				// 直接调用 loadMore
				this.loadMore()
			},
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		position: relative;
		overflow: hidden;
	}

	.map {
		flex: 1;
		width: 100%;
		height: 70vh;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
	}

	.bottom-area {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #fff;
		border-radius: 30rpx 30rpx 0 0;
		height: 30vh;
		z-index: 100;
		overflow: hidden;
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
		transition-property: height;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	}

	.tab-box {
		display: flex;
		justify-content: space-between;
		margin: 0;
		position: relative;
		height: 110rpx;
		background: linear-gradient(180deg, #D3DEFC 0%, #F2F5FE 100%);
		overflow: hidden;
		
		.tab-item {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 0;
			font-size: 32rpx;
			color: #666;
			position: relative;
			font-weight: bold;
			height: 110rpx;
			
			&.active {
				color: #4468E8;
				font-weight: bold;
				background: #fff;
			}
		}
	}

	.address-box {
		display: flex;
		align-items: center;
		padding: 16rpx;
		background-color: #f8f8f8;
		border-radius: 12rpx;
		margin-bottom: 16rpx;
		padding: 20rpx 0;
		
		.location-icon {
			margin-right: 16rpx;
			font-size: 36rpx;
		}
		
		.address-text {
			flex: 1;
			font-size: 28rpx;
			color: #333;
		}
		
		.arrow-icon {
			width: 32rpx;
			height: 32rpx;
			color: #999;
		}
	}

	.submit-btn {
		width: 100%;
		height: 90rpx;
		line-height: 90rpx;
		text-align: center;
		background-color: #4468E8;
		color: #fff;
		border-radius: 45rpx;
		font-size: 32rpx;
		margin-top: 40rpx;
		border: none;

		&::after {
			border: none;
		}

		&:active {
			opacity: 0.9;
		}
	}

	.auth-modal {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		z-index: 999;
	}

	.auth-mask {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
	}

	.auth-content {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		background: #fff;
		border-radius: 24rpx 24rpx 0 0;
		padding: 30rpx 30rpx;
		transform: translateY(0);
		transition: transform 0.3s;
	}

	.auth-header {
		text-align: center;
		margin-bottom: 60rpx;
	}

	.auth-icon {
		width: 80rpx;
		height: 80rpx;
		margin-bottom: 20rpx;
	}

	.auth-title {
		font-size: 34rpx;
		font-weight: 500;
		margin-bottom: 16rpx;
	}

	.auth-desc {
		font-size: 28rpx;
		color: #666;
	}

	.auth-btns {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
		padding: 0 20rpx;
	}

	.auth-btn {
		flex: 1;
		margin: 0 15rpx;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		border-radius: 44rpx;
		font-size: 32rpx;
		border: none;
		
		&.cancel {
			background: #f2f2f2;
			color: #333;
		}
		
		&.confirm {
			background: #07c160;
			color: #fff;
		}

		&::after {
			border: none;
		}
	}

	.auth-checkbox {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 30rpx;
		
		.checkbox-text {
			font-size: 24rpx;
			color: #666;
		}
	}

	.repair-tip {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 20rpx;
		padding: 0 24rpx;
	}

	.repair-content {
		padding: 20rpx 0 0;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		background: #fff;
		height: 100%;
	}

	.repair-list {
		position: relative;
		-webkit-overflow-scrolling: touch;
		transition-property: height;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	}

	.repair-item {
		background: #F7F8FC;
		border-radius: 12rpx;
		padding: 24rpx;
		margin: 0 20rpx 20rpx;
		
		&:active {
			transform: scale(0.98);
		}
	}

	.repair-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12rpx;
		
		text {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			-webkit-font-smoothing: antialiased;
			
			&.distance {
				font-size: 26rpx;
				color: #666;
				font-weight: normal;
			}
		}
	}

	.repair-address {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 12rpx;
	}

	.repair-time-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.repair-time {
		font-size: 26rpx;
		color: #999;
	}

	.repair-actions {
		display: flex;
		gap: 20rpx;
		
		.action-btn {
			padding: 0;
			margin: 0;
			width: 64rpx;
			height: 64rpx;
			line-height: 1;
			background: transparent;
			border: none;
			
			&::after {
				display: none;
			}
		}
	}

	.action-icon {
		width: 64rpx;
		height: 64rpx;
		display: block;
	}

	@keyframes slideIn {
		from {
			transform: translateX(-100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.load-status {
		padding: 20rpx;
		text-align: center;
		color: #999;
		font-size: 24rpx;
		
		.loading {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 80rpx;
			
			.loading-spinner {
				width: 36rpx;
				height: 36rpx;
				margin-right: 12rpx;
				border: 3rpx solid #4468E8;
				border-top-color: transparent;
				border-radius: 50%;
				animation: rotate 0.8s linear infinite;
			}
			
			text {
				font-size: 26rpx;
				color: #666;
			}
		}
		
		.no-more {
			position: relative;
			padding: 30rpx 0;
			color: #999;
			font-size: 26rpx;
			
			&::before,
			&::after {
				content: '';
				position: absolute;
				top: 50%;
				width: 80rpx;
				height: 1rpx;
				background: #e5e5e5;
			}
			
			&::before {
				left: 50%;
				margin-left: -120rpx;
			}
			
			&::after {
				right: 50%;
				margin-right: -120rpx;
			}
		}
		
		.empty {
			padding: 40rpx 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			
			.empty-icon {
				width: 200rpx;
				height: 200rpx;
				margin-bottom: 20rpx;
			}
			
			text {
				color: #999;
				font-size: 28rpx;
			}
		}
	}

	@keyframes rotate {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	// 加底部导航样式
	.tabbar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100rpx;
		background: #FFFFFF;
		display: flex;
		align-items: center;
		justify-content: space-around;
		border-top: 1rpx solid #f5f5f5;
		padding-bottom: env(safe-area-inset-bottom); // 适配iPhone底部安全区
	}

	.tabbar-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		
		&.active {
			.tabbar-text {
				color: #4468E8;
			}
		}
	}

	.tabbar-icon {
		width: 48rpx;
		height: 48rpx;
		margin-bottom: 4rpx;
	}

	.tabbar-text {
		font-size: 24rpx;
		color: #999;
	}

	.location-btn {
		position: fixed;
		bottom: calc(30vh + 20rpx);
		right: 30rpx;
		width: 80rpx;
		height: 80rpx;
		background: #fff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		z-index: 100;
		
		.location-icon {
			width: 40rpx;
			height: 40rpx;
		}
	}

	.repair-wrap {
		background: #F7F8FC;
		padding: 20rpx 20rpx 40rpx;
		margin: 0 20rpx 20rpx;
		
		.submit-btn {
			margin: 20rpx 0 0;
			width: 100%;
			border-radius: 45rpx;
			padding: 36rpx 0;
			height: auto;
			line-height: 1;
			background-color: #4468E8;
			color: #fff;
			font-size: 32rpx;
			
			&:active {
				opacity: 0.9;
			}
		}
	}

	.rule-box {
		display: flex;
		align-items: center;
		padding: 20rpx 0;
		background-color: #f8f8f8;
		border-radius: 12rpx;
		
		.rule-icon {
			width: 46rpx;
			height: 46rpx;
			margin: 0 16rpx;
		}
		
		.rule-text {
			flex: 1;
			font-size: 28rpx;
			color: #333;
		}
		
		.arrow-icon {
			width: 24rpx;
			height: 24rpx;
			margin: 0 16rpx;
			color: #999;
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	// 添加下拉刷新的动画样式
	@keyframes refreshRotate {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>
