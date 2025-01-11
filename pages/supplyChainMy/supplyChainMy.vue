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
		
		<!-- 供应商入住按钮 -->
		<view class="supplier-register" @click="goToSupplierRegister">
			<view class="register-content">
				<view class="left">
					<text class="title">供应商入驻</text>
					<text class="desc">成为供应商，开启您的生意</text>
				</view>
				<image class="arrow-icon" src="/static/images/youjiantou.png"></image>
			</view>
		</view>
		
		<!-- 功能菜单 -->
		<view class="menu-grid">
			<view class="menu-item" @click="goToMyFavorites">
				<image class="menu-icon" src="/static/images/jinhuodingdan.png"></image>
				<text>进货订单</text>
			</view>
			<image class="divider" src="/static/images/shuxian.png"></image>
			<button class="menu-item contact-btn" open-type="contact">
				<image class="menu-icon" src="/static/images/kf.png"></image>
				<text>联系客服</text>
			</button>
		</view>
		
		<!-- 消息列表 -->
		<view class="message-section">
			<view class="section-title" @click="goToMyMessage">我的消息</view>
			<view class="message-list">
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
		</view>
		
		<!-- 使用merchant-tabbar组件 -->
		<merchant-tabbar :current="3"></merchant-tabbar>
		
		<!-- 添加悬浮扫描按钮 -->
		<view 
			class="float-scan-btn"
			:style="{ left: buttonPosition.left + 'px', top: buttonPosition.top + 'px' }"
			@touchstart="touchStart"
			@touchmove="touchMove"
			@touchend="touchEnd"
			@tap="handleScan"
		>
			<image src="/static/images/scan.png" mode="aspectFit"></image>
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
			messageList: [
				{ 
					title: '您的订单已收货',
					isRead: false,
					content: '尊敬的用户您好，您的维修订单已完成配送，感谢您的使用。如有任何问题，请及时联系客服。'
				},
				{ 
					title: '您的订单未付款',
					isRead: false,
					content: '您的维修订单尚未支付，请及时完成支付，以免订单自动取消。'
				},
				{ 
					title: '最新活动通知，请查看活动详情',
					isRead: false,
					content: '亲爱的用户，平台正在开展新一轮优惠活动，点击查看详情了解更多优惠信息。'
				},
				{ 
					title: '您收到一笔推广佣金',
					isRead: false,
					content: '恭您获得推广佣金奖励，可以在"我的资产"中查看详情。'
				},
				{ 
					title: '您的维修订单已完成',
					isRead: true,
					content: '您的维修订单已完成服务，如对服务不满意，请及时反馈。'
				}
			],
			// 添加按钮位置相关数据
			buttonPosition: {
				left: uni.getSystemInfoSync().windowWidth - 80, // 默认靠右
				top: uni.getSystemInfoSync().windowHeight - 240 // 默认距底部 240px
			},
			isDragging: false,
			startPosition: {
				x: 0,
				y: 0
			},
			isLoading: false
		}
	},
	created() {
		this.checkLoginStatus()
	},
	onShow() {
		this.checkLoginStatus()
		// 获取本地存储的消息列表
		const storedMessages = uni.getStorageSync('messageList')
		if (storedMessages) {
			this.messageList = JSON.parse(storedMessages)
		}
	},
	methods: {
		checkLoginStatus() {
			try {
				const token = uni.getStorageSync('token')
				const userInfo = uni.getStorageSync('userInfo')
				
				if (token && userInfo) {
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
			} catch (err) {
				console.error('Check login status error:', err)
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
				desc: '用于完用户资料',
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
				
				const res = await api.supplyChain.wxSupplyChainLogin({
					code: loginRes.code,
					userInfo: userInfo
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
					uni.setStorageSync('roleFlag', 3)
					
					this.isLogin = true
					this.userInfo = userData
					
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
				url: '/packageSupplyChain/pages/supplyChainEditProfile/supplyChainEditProfile',
				events: {
					// 监听编辑页面传回的数据
					updateUserInfo: (userInfo) => {
						this.userInfo = userInfo
						this.isLogin = true
					}
				}
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
				url: '/pages/merchantPromotion/merchantPromotion',
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
				url: '/pages/myFavorites/myFavorites',
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
				url: '/pages/myAssets/myAssets'
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
			
			// 将当前消息列表保存到本地存储
			uni.setStorageSync('messageList', JSON.stringify(this.messageList))
			
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
					time: '2024-03-21 14:30', // 这里可以是实际的时间
					isRead: message.isRead
			}))
			
			// 将当前消息列表保存到本地存储
			uni.setStorageSync('messageList', JSON.stringify(this.messageList))
			
			// 跳转到消息列表页面
			uni.navigateTo({
				url: '/packageUser/pages/myMessage/myMessage?autoOpen=true'
			})
		},
		// 添加供应商入驻跳转方法
		goToSupplierRegister() {
			if (!this.isLogin) {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				})
				return
			}
			uni.navigateTo({
				url: '/packageSupplyChain/pages/supplyChainEntry/supplyChainEntry',
				fail: (err) => {
					console.error('Navigation failed:', err)
					uni.showToast({
						title: '页面跳转失败',
						icon: 'none'
					})
				}
			})
		},
		// 添加拖动相关方法
		touchStart(e) {
			this.isDragging = true
			this.startPosition = {
				x: e.touches[0].clientX - this.buttonPosition.left,
				y: e.touches[0].clientY - this.buttonPosition.top
			}
		},
		
		touchMove(e) {
			if (!this.isDragging) return
			
			const systemInfo = uni.getSystemInfoSync()
			const buttonSize = 100 // 按钮的大小（包括内边距）
			
			// 计算新位置
			let newLeft = e.touches[0].clientX - this.startPosition.x
			let newTop = e.touches[0].clientY - this.startPosition.y
			
			// 限按钮不超出屏幕边界
			newLeft = Math.max(0, Math.min(newLeft, systemInfo.windowWidth - buttonSize))
			newTop = Math.max(0, Math.min(newTop, systemInfo.windowHeight - buttonSize))
			
			// 更新位置
			this.buttonPosition = {
				left: newLeft,
				top: newTop
			}
		},
		
		touchEnd() {
			this.isDragging = false
			
			// 靠边吸附
			const systemInfo = uni.getSystemInfoSync()
			const buttonSize = 100
			const threshold = 50 // 吸附阈值
			
			if (this.buttonPosition.left < threshold) {
				this.buttonPosition.left = 0
			} else if (this.buttonPosition.left > systemInfo.windowWidth - buttonSize - threshold) {
				this.buttonPosition.left = systemInfo.windowWidth - buttonSize
			}
		},
		
		handleScan() {
			if (this.isDragging) return // 如果是拖动状态，不触发扫描
			
			// 检查是否登录
			if (!this.isLogin) {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				})
				return
			}
			
			// 请求相机权限并进行扫码
			uni.authorize({
				scope: 'scope.camera',
				success: () => {
					// 相机权限获取成功，开始扫码
					uni.scanCode({
						onlyFromCamera: true, // 只允许相机扫码
						scanType: ['qrCode', 'barCode'], // 支持二维码和条形码
						success: (res) => {
							console.log('扫码结果：', res)
							// 处理扫码结果
							if (res.result) {
								try {
									// 这里以根实际求处理扫码结果
									// 比如解析二维码内容，跳转到相应页面等
									uni.showToast({
										title: '扫描成功',
											icon: 'success'
									})
								} catch (error) {
									uni.showToast({
										title: '无效的二维码',
											icon: 'none'
									})
								}
							} else {
								uni.showToast({
									title: '未识别到内容',
										icon: 'none'
								})
							}
						},
						fail: (err) => {
							console.error('扫码失败：', err)
							// 根据错误类型显示不同提示
							if (err.errMsg.includes('cancel')) {
								uni.showToast({
									title: '已取消扫码',
										icon: 'none'
								})
							} else {
								uni.showToast({
									title: '扫码失败，请重试',
										icon: 'none'
								})
							}
						}
					})
				},
				fail: () => {
					// 用户拒绝相机权限
					uni.showModal({
						title: '提示',
						content: '需要相机权限才能进行扫码，是否去开？',
						success: (res) => {
							if (res.confirm) {
								// 引导用户去设置页开启权限
								uni.openSetting({
									success: (settingRes) => {
										console.log('设置页返回：', settingRes)
									}
								})
							}
						}
					})
				}
			})
		},
	
	}
}
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	background: #F7F8FC;
	position: relative;
	padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
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

.supplier-register {
	position: relative;
	z-index: 1;
	margin: 20rpx;
	border-radius: 16rpx;
	padding: 30rpx;
	background: #F7F8FC;
	
	.register-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		.left {
			display: flex;
			flex-direction: column;
			
			.title {
				font-size: 32rpx;
				font-weight: 500;
				color: #333;
				margin-bottom: 8rpx;
			}
			
			.desc {
				font-size: 24rpx;
				color: #999;
			}
		}
		
		.arrow-icon {
			width: 32rpx;
			height: 32rpx;
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

.float-scan-btn {
	position: fixed;
	z-index: 999;
	width: 100rpx;
	height: 100rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: transform 0.2s;
	
	image {
		width: 100rpx;
		height: 100rpx;
	}
	
	&:active {
		transform: scale(0.95);
	}
}
</style> 