<template>
	<view class="container">
		<loading-animation :show="isLoading"></loading-animation>
		<image class="bg-image" src="/static/images/my_bg.png" mode="aspectFill"></image>
		<!-- 用户信息区域 -->
		<view class="user-info">
			<view class="user-left">
				<image class="avatar" :src="userInfo.avatar ? (request.BASE_URL + userInfo.avatar) : '/static/my/default-avatar.png'"></image>
				<button 
					v-if="!isLogin"
					class="login-btn"
					@click="getUserProfile"
				>
					<view class="user-detail">
						<view class="name">点击登录</view>
						<view class="phone">登录后查看更多信息</view>
					</view>
				</button>
				<view v-else class="user-detail">
					<view class="name">{{ userInfo.name }}</view>
					<view class="phone" @click="goToEditProfile">{{ userInfo.phone || '绑定微信手机号' }}</view>
				</view>
			</view>
			<view class="edit-btn" v-if="isLogin" @click="goToEditProfile">
				<view class="text-wrapper">
					<text>修改</text>
					<text>资料</text>
				</view>
				<image class="arrow-icon" src="/static/images/youjiantou.png"></image>
			</view>
		</view>
		
		<!-- 功能菜单 -->
		<view class="menu-grid">
			<view class="menu-item" @click="goToMyOrders">
				<image class="menu-icon" src="/static/images/wddd.png"></image>
				<text>我的订单</text>
			</view>
			<image class="divider" src="/static/images/shuxian.png"></image>
			<view class="menu-item" @click="goToMyFavorites">
				<image class="menu-icon" src="/static/images/sc.png"></image>
				<text>我的收藏</text>
			</view>
			<image class="divider" src="/static/images/shuxian.png"></image>
			<view class="menu-item" @click="goToMyCoupons">
				<image class="menu-icon" src="/static/images/yhq.png"></image>
				<text>优惠券</text>
			</view>
			<image class="divider" src="/static/images/shuxian.png"></image>
			<button class="menu-item contact-btn" open-type="contact">
				<image class="menu-icon" src="/static/images/kf.png"></image>
				<text>联系客服</text>
			</button>
		</view>
		
		<!-- 佣金卡片 -->
		<view class="commission-card">
			<view class="card-content">
				<view class="header">
					<image class="header-bg" src="/static/images/tg.png" mode="aspectFill"></image>
					<text class="title">推广得佣金</text>
					<button class="promote-btn" @click="goToInvite">立即推广</button>
				</view>
				<view class="body" @click="goToMyAssets">
					<view class="amount-info">
						<text class="label">佣金资产</text>
						<text class="amount">23,0000</text>
						<text class="check">查看领取 ></text>
					</view>
					<image class="coins-img" src="/static/my/coins.png"></image>
				</view>
			</view>
		</view>
		
		<!-- 消息列表 -->
		<view class="message-section">
			<view class="section-title" @click="goToMyMessage">我的消息</view>
			<view class="message-list" v-if="messageList.length > 0">
				<view 
					class="message-item" 
					v-for="(item, index) in messageList.slice(0, 5)" 
					:key="index"
					@click="goToMessageDetail(item)"
				>
					<text class="unread" v-if="!item.isRead">未读</text>
					<text class="content">{{ item.title }}</text>
					<image class="arrow" src="/static/images/youjiantou2.png"></image>
				</view>
			</view>
			<view class="empty-message" v-else>
				<text>暂无消息</text>
			</view>
		</view>
	</view>
</template>

<script>
import api from '../../api/index.js'
import request from '../../utils/request.js'
import loadingAnimation from '../../components/loading-animation/loading-animation.vue'

export default {
	components: {
		loadingAnimation
	},
	data() {
		return {
			isLogin: false,
			userInfo: {
				name: '',
				phone: '',
				avatar: ''
			},
			
			request,
			messageList: [],
			isLoading: false,
			messageTimer: null
		}
	},
	onShow() {
		this.checkLoginStatus()
		if (this.isLogin) {
			this.getMessageList()
			this.startMessageTimer()
		}
	},
	onHide() {
		this.clearMessageTimer()
	},
	onUnload() {
		this.clearMessageTimer()
	},
	methods: {
		checkLoginStatus() {
			const userInfo = uni.getStorageSync('userInfo')
			if (userInfo) {
				this.isLogin = true
				this.userInfo = JSON.parse(userInfo)
			} else {
				this.isLogin = false
				this.userInfo = {
					name: '',
					phone: '',
					avatar: ''
				}
			}
		},
		getUserProfile() {
			this.isLoading = true
			uni.getUserProfile({
				desc: '用于完善用户资料',
				success: (res) => {
					this.login(res.userInfo)
				},
				fail: (err) => {
					this.isLoading = false
					uni.showToast({
						title: '获取用户信息失败',
						icon: 'none'
					})
				}
			})
		},
		async login(userInfo) {
			try {
				const loginRes = await new Promise((resolve, reject) => {
					uni.login({
						provider: 'weixin',
						success: resolve,
						fail: reject
					})
				})

				// 获取存储的promotionCode
				const promotionCode = uni.getStorageSync('promotionCode') || ''
				
				// 在登录请求中带上promotionCode
				const res = await api.user.wxLogin({
					code: loginRes.code,
					userInfo: userInfo,
					promotionCode: promotionCode
				})
				
				if (res.code === 200) {
					uni.clearStorageSync()
					const userData = {
						name: res.data.nickname,
						phone: res.data.phone || '',
						avatar: res.data.avatar,
						token: res.data.token
					}
					
					uni.setStorageSync('userInfo', JSON.stringify(userData))
					uni.setStorageSync('token', res.data.token)
					uni.setStorageSync('roleFlag', 1)
					
					// 登录成功后清除promotionCode
					uni.removeStorageSync('promotionCode')
					
					this.isLogin = true
					this.userInfo = userData
					
					// 登录成功后获取消息列表并启动定时器
					this.getMessageList()
					this.startMessageTimer()
					
					uni.showToast({
						title: '登录成功',
						icon: 'success'
					})
				} else {
					throw new Error(res.message || '登录失败')
				}
			} catch (err) {
				console.error('Login error:', err)
				uni.showToast({
					title: JSON.stringify(err),
					icon: 'none'
				})
			} finally {
				this.isLoading = false
			}
		},
		goToEditProfile() {
			uni.navigateTo({
				url: '/packageUser/pages/editProfile/editProfile'
			})
		},
		goToInvite() {
			if (!this.isLogin) {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				})
				return
			}
			uni.navigateTo({
				url: '/packageUser/pages/invite/invite',
				fail: (err) => {
					console.error('Navigation failed:', err)
					uni.showToast({
						title: '页面跳转失败',
						icon: 'none'
					})
				}
			})
		},
		goToMyFavorites() {
			if (!this.isLogin) {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				})
				return
			}
			uni.navigateTo({
				url: '/packageUser/pages/myFavorites/myFavorites',
				fail: (err) => {
					console.error('Navigation failed:', err)
					uni.showToast({
						title: '页面跳转失败',
						icon: 'none'
					})
				}
			})
		},
		goToMyCoupons() {
			if (!this.isLogin) {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				})
				return
			}
			uni.navigateTo({
				url: '/packageUser/pages/myCoupons/myCoupons',
				fail: (err) => {
					console.error('Navigation failed:', err)
					uni.showToast({
						title: '页面跳转失败',
						icon: 'none'
					})
				}
			})
		},
		goToMyAssets() {
			if (!this.isLogin) {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				})
				return
			}
			uni.navigateTo({
				url: '/packageUser/pages/myAssets/myAssets'
			})
		},
		goToMyMessage() {
			if (!this.isLogin) {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				})
				return
			}
			uni.navigateTo({
				url: '/packageUser/pages/myMessage/myMessage'
			})
		},
		goToMessageDetail(message) {
			if (!this.isLogin) {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				})
				return
			}
			
			// 将消息数据存储到本地，以便在消息列表页面使用
			uni.setStorageSync('selectedMessage', JSON.stringify({
				title: message.title,
				content: message.content,
				time: message.time,
				isRead: message.isRead
			}))
			
			// 跳转到消息列表页面
			uni.navigateTo({
				url: '/packageUser/pages/myMessage/myMessage?autoOpen=true'
			})
		},
		goToMyOrders() {
			if (!this.isLogin) {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				})
				return
			}
			uni.navigateTo({
				url: '/packageOrder/pages/myOrders/myOrders',
				fail: (err) => {
					console.error('Navigation failed:', err)
					uni.showToast({
						title: '页面跳转失败',
						icon: 'none'
					})
				}
			})
		},
		async getMessageList() {
			try {
				const res = await api.user.getNotificationList({
					pageNum: 1,
					pageSize: 5
				})
				if (res.code === 200 && res.rows) {
					this.messageList = res.rows.map(item => ({
						title: item.title,
						content: item.content,
						isRead: item.status === 1,
						time: item.createTime,
						id: item.id,
						businessId: item.businessId,
						businessType: item.businessType,
						status: item.status
					}))
				}
			} catch (err) {
				console.error('Get message list error:', err)
				this.messageList = []
			}
		},
		startMessageTimer() {
			this.clearMessageTimer()
			this.messageTimer = setInterval(() => {
				if (this.isLogin) {
					this.getMessageList()
				}
			}, 10000)
		},
		clearMessageTimer() {
			if (this.messageTimer) {
				clearInterval(this.messageTimer)
				this.messageTimer = null
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	background: #F7F8FC;
	position: relative;
	padding-bottom: env(safe-area-inset-bottom);
}

.bg-image {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 0;
}

.user-info {
	position: relative;
	z-index: 1;
	padding: 5vh 30rpx 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	
	.user-left {
		display: flex;
		align-items: center;
		transform: scale(1.1);
		transform-origin: left center;
		
		.avatar {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			margin-right: 20rpx;
		}
		
		.user-detail {
			position: relative;
			z-index: 2;
			.name {
				font-size: 32rpx;
				font-weight: 500;
				margin-bottom: 12rpx;
				max-width: 420rpx;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			.phone {
				font-size: 24rpx;
				color: #999;
				margin-top: 4rpx;
				margin-bottom: 2rpx;
				line-height: 1.2;
				cursor: pointer;
			}
		}
	}
	
	.edit-btn {
		position: absolute;
		right: 0;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: #fff;
		background-color: #B2C4FD;
		border-radius: 32rpx 0px 0px 32rpx;
		padding: 12rpx 20rpx 12rpx 30rpx;
		
		.arrow-icon {
			width: 20rpx;
			height: 20rpx;
			margin-left: 12rpx;
		}
		
		.text-wrapper {
			color: #000;
			display: flex;
			flex-direction: column;
			font-size: 20rpx;
			line-height: 1.2;
			text-align: center;
			min-width: 50rpx;
		}
	}
}

.menu-grid {
	position: relative;
	z-index: 1;
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding: 30rpx 0;
	margin: 2rpx 20rpx 0;
	border-radius: 16rpx;
	
	.menu-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		
		.menu-icon {
			width: 44rpx;
			height: 44rpx;
			margin-bottom: 20rpx;
			vertical-align: middle;
		}
		
		text {
			font-size: 26rpx;
			color: #333;
			line-height: 1;
		}
	}

	.divider {
		width: 2rpx;
		height: 40rpx;
		margin: 0 4rpx;
	}
}

.commission-card {
	position: relative;
	z-index: 1;
	margin: 20rpx;
	border-radius: 16rpx;
	overflow: hidden;
	background: #2B2B2B;
	padding: 30rpx;
	
	.card-content {
		display: flex;
		flex-direction: column;

		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx;
			height: 90rpx;
			position: relative;
			border-radius: 30rpx 30rpx 0 0;
			overflow: hidden;
			margin-bottom: 20rpx;
			
			.header-bg {
				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				height: 100%;
				z-index: 0;
			}
			
			.title {
				position: relative;
				z-index: 1;
				font-size: 28rpx;
				margin-left: 20rpx;
			}
			
			.promote-btn {
				position: relative;
				z-index: 1;
				min-width: 160rpx;
				height: 56rpx;
				line-height: 56rpx;
				padding: 0 30rpx;
				font-size: 24rpx;
				color: #333;
				background: #fff;
				border-radius: 26rpx;
				border: none;
				box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
				margin-right: 20rpx;
				
				&::after {
					border: none;
				}
			}
		}
		
		.body {
			display: flex;
			justify-content: space-between;
			cursor: pointer;
			
			.amount-info {
				.label {
					font-size: 24rpx;
					color: rgba(255,255,255,0.8);
					display: block;
					margin-bottom: 8rpx;
				}
				
				.amount {
					font-size: 44rpx;
					color: #fff;
					font-weight: bold;
					display: block;
					margin-bottom: 8rpx;
				}
				
				.check {
					font-size: 22rpx;
					color: rgba(255,255,255,0.8);
				}
			}
			
			.coins-img {
				width: 140rpx;
				height: 140rpx;
			}
		}
	}
}

.message-section {
	position: relative;
	z-index: 1;
	background: #F7FAFF;
	margin-top: 20rpx;
	margin-left: 20rpx;
	margin-right: 20rpx;
	border-radius: 16rpx;
	overflow: hidden;
	
	.section-title {
		font-size: 30rpx;
		padding: 30rpx;
		font-weight: bold;
		border-bottom: 1rpx solid #eee;
	}
	
	.message-list {
		.message-item {
			padding: 30rpx;
			display: flex;
			align-items: center;
			border-bottom: 1rpx solid #eee;
			
			.unread {
				font-size: 22rpx;
				color: #fff;
				background: #4468E8;
				padding: 4rpx 12rpx;
				border-radius: 4rpx;
				margin-right: 10rpx;
				padding-bottom: 6rpx;
			}
			
			.content {
				flex: 1;
				font-size: 28rpx;
				color: #333;
			}
			
			.arrow {
				width: 24rpx;
				height: 24rpx;
				margin-left: 10rpx;
			}
		}
	}

	.empty-message {
		padding: 40rpx;
		text-align: center;
		color: #999;
		font-size: 28rpx;
	}
}

.login-btn {
	background: none;
	padding: 0;
	margin: 0;
	line-height: 1;
	border: none;
	outline: none;
	
	&::after {
		border: none;
	}
	
	.user-detail {
		text-align: left;
	}
}

.contact-btn {
	background: none;
	padding: 0;
	margin: 0;
	line-height: 1;
	border: none;
	outline: none;
	
	&::after {
		border: none;
	}
}
</style> 