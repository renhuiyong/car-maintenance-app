<template>
	<view class="container">
		<!-- 顶部地图区域 -->
		<map
			id="myMap"
			class="map"
			:latitude="latitude"
			:longitude="longitude"
			:markers="[]"
			:show-location="true"
		></map>
		<view class="location-btn" @click="moveToLocation">
			<image class="location-icon" src="/static/images/location_icon.png"></image>
		</view>
		
		<!-- 底部预约区域 -->
		<view class="bottom-area">
			<!-- 切换按钮 -->
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
				>
					<text>指定报修</text>
					<view class="tab-line"></view>
				</view>
			</view>

			<!-- 抢单报修内容 -->
			<view v-if="tabIndex === 0" class="repair-content" key="grab">
				<view class="repair-wrap">
					<view class="address-box" @click="chooseLocation">
						<image class="location-icon" src="/static/images/dingwei.png"></image>
						<view class="address-text">{{address || '选择位置'}}</view>
						<image class="arrow-icon" src="/static/images/youjiantou2.png"></image>
					</view>
					<button class="submit-btn" @click="handleSubmit">立即报修</button>
				</view>
			</view>
			
			<!-- 指定报修内容 -->
			<view v-else class="repair-content" key="assign">
				<view class="repair-tip">为您推荐最近的维修商家：</view>
				<scroll-view 
					scroll-y 
					class="repair-list"
					@scrolltolower="loadMore"
					:scroll-top="scrollTop"
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
								<button class="action-btn"><text class="iconfont">🔧</text></button>
								<button class="action-btn"><text class="iconfont">📞</text></button>
							</view>
						</view>
					</view>
					<view class="load-status">
						<view v-if="loading" class="loading">加载中...</view>
						<view v-if="finished" class="no-more">没有更多了</view>
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
						<checkbox value="1" :checked="isChecked" style="transform:scale(0.7)" color="#07c160"/>
						<text class="checkbox-text">已阅读并接受《电动车维修服务小程序隐私保护指引》</text>
					</checkbox-group>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tabIndex: 0,
				latitude: 33.954834,
				longitude: 116.794277,
				markers: [],
				showAuthModal: false,
				isChecked: false,
				repairShops: [
					{
						id: 1,
						name: '电动车维修店一',
						distance: '0.6KM',
						address: '安徽省淮北市濉溪县濉溪镇濉中路88号',
						businessHours: '08:00 - 18:00'
					},
					{
						id: 2,
						name: '土楼新村',
						distance: '1.2KM',
						address: '安徽省淮北市相山区渠沟镇土楼新村',
						businessHours: '07:30 - 19:00'
					},
					{
						id: 3,
						name: '老张电瓶车维修中心',
						distance: '1.8KM',
						address: '安徽省淮北市相山区长山路56号',
						businessHours: '08:30 - 18:30'
					}
				],
				loading: false,
				finished: false,
				scrollTop: 0,
				address: ''
			}
		},
		onLoad() {
			// 页面加载时只检查授权状态
			this.checkLocationAuth()
		},
		methods: {
			switchTab(index) {
				this.tabIndex = index
			},
			handleSubmit() {
				// 检查是否已选择位置
				if (!this.address) {
					uni.showModal({
						title: '提示',
						content: '请先选择维修位置',
						confirmText: '去选择',
						success: (res) => {
							if (res.confirm) {
								this.chooseLocation()
							}
						}
					})
					return
				}
				
				// 有位置信息时才跳转
				uni.navigateTo({
					url: '/pages/grabOrder/grabOrder'
				})
			},
			// 处理复选框变化
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
						title: '请先阅读并同意隐私保护指引',
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
						// 授权成功后获取位置
						this.getLocation()
					},
					fail: () => {
						uni.showModal({
							title: '提示',
							content: '需要获取您的位置信息，请在设置中打开位置权限',
							confirmText: '去设置',
							success: (res) => {
								if (res.confirm) {
									uni.openSetting({
										success: (settingRes) => {
											if (settingRes.authSetting['scope.userLocation']) {
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
			// 添加备用地址解析方法
			getAddressByLocation(latitude, longitude) {
				uni.request({
					url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=YOUR_KEY`,
					success: (res) => {
						if (res.data.status === 0) {
							this.address = res.data.result.address
						} else {
							this.address = '获取地址失败'
						}
					},
					fail: () => {
						this.address = '获取地址失败'
					}
				})
			},
			// 添加页面跳转方法
			switchPage(url) {
				uni.switchTab({
					url
				})
			},
			// 检查位置授权状态
			checkLocationAuth() {
				uni.getSetting({
					success: (res) => {
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
				if (this.loading || this.finished) return
				
				this.loading = true
				
				// 模拟异步加载数据
				setTimeout(() => {
					const newShops = [
						{
							id: this.repairShops.length + 1,
							name: `电动车维修店${this.repairShops.length + 1}`,
							distance: `${(this.repairShops.length * 0.8).toFixed(1)}KM`,
							address: '安徽省淮北市相山区示例路123号',
							businessHours: '08:00 - 18:00'
						},
						{
							id: this.repairShops.length + 2,
							name: `快修店${this.repairShops.length + 2}`,
							distance: `${(this.repairShops.length * 0.8 + 0.5).toFixed(1)}KM`,
							address: '安徽省淮北市相山区示例路456号',
							businessHours: '08:30 - 18:30'
						}
					]
					
					this.repairShops = [...this.repairShops, ...newShops]
					this.loading = false
					
					// 模拟数据加载完毕
					if (this.repairShops.length >= 10) {
						this.finished = true
					}
				}, 1000)
			},
			// 处理滚动事件
			handleScroll(e) {
				this.scrollTop = e.detail.scrollTop
			},
			// 选择位置
			chooseLocation() {
				uni.chooseLocation({
					success: (res) => {
						// 只要有name就更新位置，不需要检查address
						if (res.name) {
							// 更新地址显示，使用地点名称
							this.address = res.name
							this.latitude = res.latitude
							this.longitude = res.longitude
							
							// 更新地图中心点和标记
							const mapContext = uni.createMapContext('myMap', this)
							mapContext.moveToLocation({
								latitude: res.latitude,
								longitude: res.longitude
							})
						}
					},
					fail: (err) => {
						// 只有在真正的错误（非用户取消）时才提示
						if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
							if (err.errMsg.indexOf('auth deny') !== -1) {
								uni.showModal({
									title: '提示',
									content: '需要获取位置权限能选择地址',
									confirmText: '去设置',
									success: (res) => {
										if (res.confirm) {
											uni.openSetting()
										}
									}
								})
							} else {
								uni.showToast({
									title: '选择位置失败',
									icon: 'none'
								})
							}
						}
					}
				})
			},
			goToAssignRepair(shop) {
				uni.navigateTo({
					url: `/pages/assignRepair/assignRepair?shopInfo=${encodeURIComponent(JSON.stringify(shop))}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.map {
		flex: 1;
		width: 100%;
		height: 70vh;
		position: relative;
	}

	.bottom-area {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #fff;
		border-radius: 30rpx 30rpx 0 0;
		height: 30vh;
		z-index: 100;
		overflow: hidden;
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);

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
		padding: 20rpx;
		height: calc(30vh - 120rpx);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		background: #fff;
	}

	.repair-list {
		flex: 1;
		height: calc(100% - 60rpx);
	}

	.repair-item {
		background: #F7F8FC;
		border-radius: 12rpx;
		padding: 24rpx;
		margin: 0 20rpx 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		
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
			width: 60rpx;
			height: 60rpx;
			line-height: 60rpx;
			text-align: center;
			background: #fff;
			border-radius: 50%;
			border: none;
			font-size: 32rpx;
			
			&::after {
				border: none;
			}
		}
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
		text-align: center;
		padding: 20rpx 0;
		color: #999;
		font-size: 24rpx;
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		
		&::before {
			content: '';
			width: 30rpx;
			height: 30rpx;
			margin-right: 10rpx;
			border: 2rpx solid #999;
			border-top-color: transparent;
			border-radius: 50%;
			animation: rotate 0.8s linear infinite;
		}
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.no-more {
		color: #999;
		font-size: 24rpx;
		padding: 20rpx 0;
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
		justify-content: center;
		
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
		position: absolute;
		bottom: 32vh;
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
			border-radius: 0;
			padding: 36rpx 0;
			height: auto;
			line-height: 1;
		}
		
		.address-box {
			margin: 0;
			
			.location-icon {
				width: 46rpx;
				height: 46rpx;
				margin-right: 16rpx;
			}
			
			.arrow-icon {
				width: 24rpx;
				height: 24rpx;
				color: #999;
			}
		}
	}
</style>
