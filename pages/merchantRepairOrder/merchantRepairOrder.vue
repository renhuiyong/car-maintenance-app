<template>
	<view class="container">
		<view class="tab-bar">
			<view 
				class="tab-item" 
				:class="{ active: currentTab === 'ongoing' }"
				@tap="switchTab('ongoing')"
			>
				进行中
				<view class="tab-line" v-show="currentTab === 'ongoing'"></view>
			</view>
			<view 
				class="tab-item" 
				:class="{ active: currentTab === 'completed' }"
				@tap="switchTab('completed')"
			>
				已完成
				<view class="tab-line" v-show="currentTab === 'completed'"></view>
			</view>
		</view>
		<view class="order-list">
			<view class="order-wrapper">
				<block v-for="(order, index) in currentOrderList" :key="order.orderId">
					<view class="order-item">
						<view class="order-header">
							<text class="status">{{order.status}}</text>
							<text class="distance">{{order.distance}}</text>
						</view>
						<view class="order-time">{{order.time}}</view>
						<view class="order-location">
							<image class="location-icon" src="/static/images/location_icon.png"></image>
							<text>{{order.location}}</text>
						</view>
						<view class="order-issue">{{order.issue}}</view>
						<view class="order-footer">
							<view class="fee-info">
								<text class="fee-label">托运金额</text>
								<text class="fee-amount">¥{{order.fee}}</text>
							</view>
							<button class="btn-reply" @tap="handleReply(order)">回复客户</button>
						</view>
					</view>
				</block>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			currentTab: 'ongoing',
			isRefreshing: false,
			
			ongoingList: [
				{
					orderId: 'on1',
					status: '待维修',
					distance: '0.6KM',
					time: '24-08-08 11:00',
					location: '淮北市中医院附近',
					issue: '车辆故障无法移动',
					fee: 10
				},
				{
					orderId: 'on2',
					status: '待接单',
					distance: '1.2KM',
					time: '24-08-08 10:30',
					location: '淮北市人民广场东门',
					issue: '轮胎漏气需要更换',
					fee: 15
				},
				{
					orderId: 'on3',
					status: '维修中',
					distance: '2.5KM',
					time: '24-08-08 09:45',
					location: '淮北市第一中学',
					issue: '发动机启动困难需要检查',
					fee: 20
				}
			],
			completedList: [
				{
					orderId: 'cp1',
					status: '已完成',
					distance: '3.1KM',
					time: '24-08-08 09:15',
					location: '淮北市火车站北广场',
					issue: '车辆电瓶没电需要救援',
					fee: 25
				},
				{
					orderId: 'cp2',
					status: '已完成',
					distance: '1.8KM',
					time: '24-08-07 16:30',
					location: '淮北市政府大楼',
					issue: '更换机油和机油滤芯',
					fee: 30
				}
			]
		}
	},
	onPullDownRefresh() {
		if (this.isRefreshing) return
		this.isRefreshing = true
		
		console.log('刷新订单列表...')
		// 模拟获取最新订单数据
		setTimeout(() => {
			// TODO: 这里添加实际的数据刷新逻辑
			// 示例：在进行中列表前面添加一个新订单
			if (this.currentTab === 'ongoing') {
				const newOrder = {
					orderId: 'on' + (this.ongoingList.length + 1),
					status: '待接单',
					distance: '0.8KM',
					time: '24-08-08 11:30',
					location: '淮北市第二人民医院',
					issue: '车辆无法启动',
					fee: 35
				}
				this.ongoingList.unshift(newOrder)
			}
			
			this.isRefreshing = false
			uni.stopPullDownRefresh()
			uni.showToast({
				title: '刷新成功',
				icon: 'success',
				duration: 1000
			})
		}, 1000)
	},
	// 页面配置
	onLoad() {
		// 设置下拉刷新的样式（仅小程序有效）
		const pages = getCurrentPages()
		const page = pages[pages.length - 1]
		if (page && page.$getAppWebview) {
			const webview = page.$getAppWebview()
			webview.setStyle({
				pullToRefresh: {
					support: true,
					style: '@color: #FF9500;'
				}
			})
		}
	},
	computed: {
		currentOrderList() {
			return this.currentTab === 'ongoing' ? this.ongoingList : this.completedList
		}
	},
	methods: {
		switchTab(tab) {
			this.currentTab = tab
			// 切换标签时也刷新数据
			uni.startPullDownRefresh()
		},
		handleReply(order) {
			uni.navigateTo({
				url: `/pages/merchantOrderReply/merchantOrderReply?orderId=${order.orderId}`
			})
		}
	}
}
</script>

<style>
.container {
	min-height: 100vh;
	height: 100vh;
	background: #F6F6F6;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	position: relative;
}

.tab-bar {
	display: flex;
	background: #FFFFFF;
	padding: 20rpx 32rpx;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 1;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
	flex: 1;
	height: 72rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30rpx;
	color: #999;
	position: relative;
	transition: all 0.3s ease;
	margin: 0 20rpx;
}

.tab-item.active {
	color: #FF9500;
	font-weight: 600;
}

.tab-line {
	position: absolute;
	bottom: -20rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 60rpx;
	height: 6rpx;
	background: #FF9500;
	border-radius: 6rpx;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.order-list {
	flex: 1;
	padding: 24rpx;
	padding-top: 132rpx;
	padding-bottom: 24rpx;
	box-sizing: border-box;
	overflow-y: auto;
	-webkit-overflow-scrolling: touch;
	position: relative;
}

.order-item {
	background: #FFFFFF;
	border-radius: 16rpx;
	padding: 32rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	margin-bottom: 24rpx;
}

.order-item:last-child {
	margin-bottom: 0;
}

.order-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;
	padding-bottom: 24rpx;
	border-bottom: 1px solid #EEEEEE;
}

.status {
	font-size: 32rpx;
	font-weight: 600;
	color: #FF9500;
}

.distance {
	font-size: 28rpx;
	color: #666;
	background: #F8F9FC;
	padding: 4rpx 16rpx;
	border-radius: 20rpx;
}

.order-time {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 24rpx;
}

.order-location {
	display: flex;
	align-items: center;
	margin-bottom: 24rpx;
	padding: 16rpx 0;
}

.location-icon {
	width: 28rpx;
	height: 28rpx;
	margin-right: 12rpx;
}

.order-location text {
	font-size: 28rpx;
	color: #333;
	flex: 1;
}

.order-issue {
	background: #F8F9FC;
	padding: 24rpx;
	border-radius: 12rpx;
	font-size: 28rpx;
	color: #333;
	margin-bottom: 0;
}

.order-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	padding-top: 24rpx;
	margin-top: 24rpx;
	border-top: 1px solid #EEEEEE;
}

.fee-info {
	display: flex;
	align-items: center;
	gap: 12rpx;
	flex: 1;
}

.fee-label {
	font-size: 28rpx;
	color: #666;
}

.fee-amount {
	font-size: 32rpx;
	color: #FF9500;
	font-weight: 600;
}

.btn-reply {
	background: transparent;
	color: #FF9500;
	font-size: 28rpx;
	padding: 6rpx 30rpx;
	border-radius: 20rpx;
	border: 1px solid #FF9500;
	transition: all 0.3s;
}

.btn-reply:active {
	background: rgba(255, 149, 0, 0.1);
}

.btn-reply::after {
	border: none;
}

.order-wrapper {
	min-height: 200rpx;
	padding-bottom: 24rpx;
}
</style> 