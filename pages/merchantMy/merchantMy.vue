<template>
	<view class="page-container">
		<scroll-view scroll-y class="scroll-container">
			<loading-animation :show="isLoading"></loading-animation>
			<image class="bg-image" src="/static/images/my_bg.png" mode="aspectFill"></image>
			<!-- 原有内容 -->
			<view class="content-wrapper">
				<!-- 用户信息区域 -->
				<view class="user-info">
					<view class="user-left">
						<image class="avatar" :src="userInfo.avatar ? (request.BASE_URL_OSS + userInfo.avatar) : '/static/my/default-avatar.png'"></image>
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
							<view class="subscribe-btn" @click="requestSubscription" v-if="needSubscription">
								<text>订阅消息通知</text>
							</view>
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
				
				<!-- 商家入驻入口 -->
				<view class="merchant-entry" @click="goToMerchantSettled" v-if="isLogin && examineStatus !== null && examineStatus !== 3">
					<image class="entry-bg" src="/static/images/merchant_entry_bg.png" mode="aspectFill"></image>
					<view class="entry-content">
						<view class="entry-left">
							<view class="entry-icon-wrapper">
								<image class="entry-icon" src="/static/images/shop.png"></image>
							</view>
							<view class="entry-text">
								<text class="entry-title">商家入驻</text>
								<text class="entry-desc">加入我们，开启您的商家之旅</text>
							</view>
						</view>
						<view class="entry-right">
							<view class="entry-btn">
								<text>立即入驻</text>
								<image class="entry-arrow" src="/static/images/youjiantou.png"></image>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 功能菜单 -->
				<view class="menu-grid">
					<view class="menu-item" @click="goToMyOrders">
						<image class="menu-icon" src="/static/images/wddd.png"></image>
						<text>维修订单</text>
					</view>
					<image class="divider" src="/static/images/shuxian.png"></image>
					<view class="menu-item" @click="goToPurchasingOrder">
						<image class="menu-icon" src="/static/images/jinhuodingdan.png"></image>
						<text>进货订单</text>
					</view>
					<image class="divider" src="/static/images/shuxian.png"></image>
					<view class="menu-item" @click="goToMerchantAccount">
						<image class="menu-icon" src="/static/images/jinhuodingdan.png"></image>
						<text>收入结算</text>
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
								<text class="amount">{{ commissionAmount }}</text>
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
							<text class="unread" v-if="item.status === 0">未读</text>
							<text class="content">{{ item.title }}</text>
							<image class="arrow" src="/static/images/youjiantou2.png"></image>
						</view>
					</view>
					<view class="empty-message" v-else>
						<text>暂无消息</text>
					</view>
				</view>
			</view>
			
			<!-- merchant-tabbar放在scroll-view外部 -->
		</scroll-view>
		<merchant-tabbar :current="3"></merchant-tabbar>
		
		<!-- 添加商家上下线悬浮按钮 -->
		<view v-if="isLogin && examineStatus === 3"
			class="float-status-btn"
			:style="{ left: buttonPosition.left + 'px', top: buttonPosition.top + 'px' }"
			@touchstart="touchStart"
			@touchmove="touchMove"
			@touchend="touchEnd"
			@tap="handleShopStatus"
		>
			<image :src="shopStatus ? '/static/images/online.png' : '/static/images/offline.png'" mode="aspectFit"></image>
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
		const systemInfo = uni.getSystemInfoSync()
		const cachedPosition = uni.getStorageSync('floatButtonPosition')
		return {
			isLogin: false,
			examineStatus: 3,
			userInfo: {
				name: '',
				phone: '',
				avatar: ''
			},
			request,
			messageList: [],
			// 修改按钮位置相关数据，从缓存中获取，如果没有则使用默认值
			buttonPosition: cachedPosition || {
				left: systemInfo.windowWidth - (140 * systemInfo.windowWidth / 750),
				top: 80,
			},
			isDragging: false,
			startPosition: {
				x: 0,
				y: 0
			},
			isLoading: false,
			hasCheckedSubscription: false, // 添加标记，避免重复检查
			needSubscription: false,
			messageTimer: null, // 添加定时器变量
			commissionTimer: null, // 添加佣金定时器
			// 添加佣金数据
			commissionAmount: '0.00',
			shopStatus: false, // 商家状态：true为上线，false为下线
			lastClickTime: 0, // 添加最后点击时间记录
		}
	},
	created() {
		setInterval(() => {
			this.checkLoginStatus()
		}, 3000)
		this.checkLoginStatus()
		if (this.isLogin) {
			this.checkShopExamineStatus()
			this.checkSubscriptionStatus()
			this.getMessageList()
			// this.startMessageTimer()
			this.getCommissionAccount()
			this.getShopBusinessStatus()
			// this.startCommissionTimer() // 启动佣金定时器
		}
	},
	onShow() {
		this.checkLoginStatus()
		if (this.isLogin) {
			this.checkShopExamineStatus()
			this.getMessageList()
			// this.startMessageTimer()
			this.getCommissionAccount()
			this.getShopBusinessStatus()
			// this.startCommissionTimer() // 启动佣金定时器
		}
	},
	onHide() {
		// 页面隐藏时清除定时器
		this.clearMessageTimer()
		this.clearCommissionTimer() // 清除佣金定时器
	},
	onUnload() {
		// 页面卸载时清除定时器
		this.clearMessageTimer()
		this.clearCommissionTimer() // 清除佣金定时器
	},
	methods: {
		checkLoginStatus() {
			try {
				const merchantToken = uni.getStorageSync('merchantToken')
				const userInfo = uni.getStorageSync('userInfo')
				
				if (merchantToken && userInfo) {
					this.isLogin = true
					this.userInfo = JSON.parse(userInfo)
					// 检查是否需要订阅
					this.checkNeedSubscription()
				} else {
					this.isLogin = false
					this.userInfo = {
						name: '',
						phone: '',
						avatar: ''
					}
				uni.removeStorageSync('roleFlag')
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

				// 获取存储的promotionCode
				const promotionCode = getApp().globalData.promotionCode || ''
				// 在登录请求中带上promotionCode
				const res = await api.merchant.wxMerchantLogin({
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
						merchantToken: res.data.token
					}
					
					uni.setStorageSync('userInfo', JSON.stringify(userData))
					uni.setStorageSync('merchantToken', res.data.token)
					uni.setStorageSync('roleFlag', 2)
					
					// 登录成功后清除promotionCode
					uni.removeStorageSync('promotionCode')
					
					this.isLogin = true
					this.userInfo = userData
					
					// 登录成功后检查订阅状态和商家状态
					this.checkSubscriptionStatus()
					this.checkShopExamineStatus()
					
					// 获取消息列表
					this.getMessageList()
					this.startMessageTimer()
					
					// 获取佣金信息
					this.getCommissionAccount()
					this.startCommissionTimer()
					
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
				url: '/packageMerchant/pages/editMerchantProfile/editMerchantProfile',
				events: {
					// 监听编辑页面传回的数据
					updateUserInfo: (userInfo) => {
						this.userInfo = userInfo
						this.isLogin = true
					}
				},
				fail: (err) => {
					console.error('Navigation failed:', err)
					uni.showToast({
						title: '页面跳转失败',
						icon: 'none'
					})
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
				url: '/packageMerchant/pages/merchantPromotion/merchantPromotion',
				fail: (err) => {
					console.error('Navigation failed:', err)
					uni.showToast({
						title: '页面跳转失败',
						icon: 'none'
					})
				}
			})
		},
		goToPurchasingOrder() {
			if (!this.isLogin) {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				})
				return
			}
			uni.navigateTo({
				url: '/packageMerchant/pages/merchantPurchasingOrder/merchantPurchasingOrder',
				fail: (err) => {
					console.error('Navigation failed:', err)
					uni.showToast({
						title: '页面跳转失败',
						icon: 'none'
					})
				}
			})
		},
		goToMerchantAccount() {
			if (!this.isLogin) {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				})
				return
			}
			uni.navigateTo({
				url: '/packageMerchant/pages/merchantAccount/merchantAccount',
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
				url: '/packageUser/pages/myAssets/myAssets',
				fail: (err) => {
					console.error('Navigation failed:', err)
					uni.showToast({
						title: '页面跳转失败',
						icon: 'none'
					})
				}
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
				url: '/packageUser/pages/myMessage/myMessage',
				events: {
					// 监听消息页面返回时的刷新事件
					refreshMessages: () => {
						this.getMessageList()
					}
				}
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
				isRead: message.status === 1,
				id: message.id,
				businessId: message.businessId,
				businessType: message.businessType,
				status: message.status
			}))
			
			// 跳转到消息列表页面
			uni.navigateTo({
				url: '/packageUser/pages/myMessage/myMessage?autoOpen=true&messageStatus=' + (message.status === 1 ? 'read' : 'unread'),
				events: {
					// 监听消息页面返回时的刷新事件
					refreshMessages: () => {
						this.getMessageList()
					}
				}
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
				url: '/packageMerchant/pages/merchantRepairOrder/merchantRepairOrder',
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
			const buttonSize = 140 // 按钮的实际大小（单位：rpx），与样式中定义的大小保持一致
			
			// 将rpx转换为px
			const pxButtonSize = buttonSize * systemInfo.windowWidth / 750
			
			// 计算新位置
			let newLeft = e.touches[0].clientX - this.startPosition.x
			let newTop = e.touches[0].clientY - this.startPosition.y
			
			// 限制按钮不超出屏幕边界，允许完全贴边
			newLeft = Math.max(0, Math.min(newLeft, systemInfo.windowWidth - pxButtonSize))
			newTop = Math.max(0, Math.min(newTop, systemInfo.windowHeight - pxButtonSize))
			
			// 更新位置
			this.buttonPosition = {
				left: newLeft,
				top: newTop
			}
		},
		
		touchEnd() {
			this.isDragging = false
			
			// 靠右吸附
			const systemInfo = uni.getSystemInfoSync()
			const buttonSize = 140 // 按钮的实际大小（单位：rpx）
			const pxButtonSize = buttonSize * systemInfo.windowWidth / 750
			
			// 直接设置为右侧位置
			this.buttonPosition.left = systemInfo.windowWidth - pxButtonSize
			
			// 保存位置到本地缓存
			uni.setStorageSync('floatButtonPosition', {
				left: this.buttonPosition.left,
				top: this.buttonPosition.top
			})
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
									// 这里以根实际需求处理扫码结果
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
		goToMerchantSettled() {
			uni.navigateTo({
				url: '/packageMerchant/pages/merchantSettled/merchantSettled',
				fail: (err) => {
					console.error('Navigation failed:', err)
					uni.showToast({
						title: '页面跳转失败',
						icon: 'none'
					})
				}
			})
		},
		async checkShopExamineStatus() {
			try {
				const res = await api.merchant.getShopSelfExamineStatus()
				if (res.code === 200) {
					this.examineStatus = res.data.examineStatus || res.data
				}
			} catch (err) {
				console.error('Get shop examine status error:', err)
			}
		},
		async checkSubscriptionStatus() {
			// 只在用户登录状态下检查
			if (!this.isLogin || this.hasCheckedSubscription) {
				return
			}
			
			this.hasCheckedSubscription = true
			this.checkNeedSubscription()
		},
		
		checkNeedSubscription() {
			const lastAuthTime = uni.getStorageSync('lastSubscriptionAuthTime')
			const now = new Date().getTime()
			const sixDaysInMs = 6 * 24 * 60 * 60 * 1000
			
			this.needSubscription = !lastAuthTime || (now - lastAuthTime) >= sixDaysInMs
		},
		
		requestSubscription() {
			uni.requestSubscribeMessage({
				tmplIds: ['vBH-SeYDCAdDDRFb0sMPHlqJWaYZ4s7ycHI-sTjVpN4'],
				success: (res) => {
					if (res['vBH-SeYDCAdDDRFb0sMPHlqJWaYZ4s7ycHI-sTjVpN4'] === 'accept') {
						// 用户同意授权，记录授权时间
						const now = new Date().getTime()
						uni.setStorageSync('lastSubscriptionAuthTime', now)
						this.needSubscription = false
						uni.showToast({
							title: '订阅成功',
							icon: 'success'
						})
					}
				},
				fail: (err) => {
					console.error('订阅消息授权失败：', err)
					uni.showToast({
						title: '订阅失败',
						icon: 'none'
					})
				}
			})
		},
		async getMessageList() {
			try {
				const res = await api.merchant.getNotificationList({
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
		// 添加启动定时器的方法
		startMessageTimer() {
			// 先清除可能存在的定时器
			this.clearMessageTimer()
			// 设置新的定时器，每10秒执行一次
			this.messageTimer = setInterval(() => {
				if (this.isLogin) {
					this.getMessageList()
				}
			}, 10000)
		},
		// 添加清除定时器的方法
		clearMessageTimer() {
			if (this.messageTimer) {
				clearInterval(this.messageTimer)
				this.messageTimer = null
			}
		},
		async getCommissionAccount() {
			try {
				const res = await api.merchant.getCommissionAccount()
				if (res.code === 200) {
					this.commissionAmount = res.data.totalAmount?.toFixed(2) || '0.00'
				}
			} catch (err) {
				console.error('Get commission error:', err)
				this.commissionAmount = '0.00'
			}
		},
		startCommissionTimer() {
			this.clearCommissionTimer()
			this.commissionTimer = setInterval(() => {
				if (this.isLogin) {
					this.getCommissionAccount()
				}
			}, 20000) // 20秒刷新一次
		},
		clearCommissionTimer() {
			if (this.commissionTimer) {
				clearInterval(this.commissionTimer)
				this.commissionTimer = null
			}
		},
		// 获取商家状态
		async getShopStatus() {
			try {
				const res = await api.merchant.getShopSelf()
				if (res.code === 200) {
					this.shopStatus = res.data.status === 1
				}
			} catch (err) {
				console.error('Get shop status error:', err)
			}
		},
		// 获取商家营业状态
		async getShopBusinessStatus() {
			try {
				const res = await api.merchant.getShopBusinessStatus()
				if (res.code === 200) {
					this.shopStatus = res.data.businessStatus === 1
				}
			} catch (err) {
				console.error('Get shop business status error:', err)
			}
		},
		// 处理商家上下线
		async handleShopStatus() {
			if (!this.isLogin) {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				})
				return
			}
			
			// 检查点击间隔
			const now = Date.now()
			if (now - this.lastClickTime < 1000) {
				return
			}
			this.lastClickTime = now
			
			try {
				const res = await (this.shopStatus ? api.merchant.shopOffline() : api.merchant.shopOnline())
				if (res.code === 200) {
					this.shopStatus = !this.shopStatus
					uni.showToast({
						title: this.shopStatus ? '已上线' : '已下线',
						icon: 'success'
					})
				} else {
					throw new Error(res.message || '操作失败')
				}
			} catch (err) {
				console.error('Shop status change error:', err)
				uni.showToast({
					title: err.message || '操作失败',
					icon: 'none'
				})
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.page-container {
	height: 100vh;
	background: #F7F8FC;
	position: relative;
	display: flex;
	flex-direction: column;
}

.scroll-container {
	flex: 1;
	height: calc(100vh - 120rpx - env(safe-area-inset-bottom));
}

.content-wrapper {
	position: relative;
	min-height: 100%;
	z-index: 1;
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
			.subscribe-btn {
				margin-top: 10rpx;
				background: rgba(68, 104, 232, 0.1);
				color: #4468E8;
				font-size: 24rpx;
				padding: 6rpx 16rpx;
				border-radius: 24rpx;
				display: inline-block;
				
				&:active {
					opacity: 0.8;
				}
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

.merchant-entry {
	position: relative;
	z-index: 1;
	margin: 20rpx;
	height: 160rpx;
	border-radius: 20rpx;
	background: linear-gradient(135deg, #4468E8, #6C8EFF);
	box-shadow: 0 8rpx 16rpx rgba(68, 104, 232, 0.15);
	overflow: hidden;
	
	.entry-bg {
		position: absolute;
		right: 0;
		bottom: 0;
		width: 200rpx;
		height: 160rpx;
		opacity: 0.1;
	}
	
	.entry-content {
		position: relative;
		z-index: 2;
		height: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 40rpx;
		
		.entry-left {
			display: flex;
			align-items: center;
			
			.entry-icon-wrapper {
				width: 80rpx;
				height: 80rpx;
				background: rgba(255, 255, 255, 0.2);
				border-radius: 20rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-right: 24rpx;
				
				.entry-icon {
					width: 48rpx;
					height: 48rpx;
				}
			}
			
			.entry-text {
				display: flex;
				flex-direction: column;
				
				.entry-title {
					font-size: 36rpx;
					color: #fff;
					font-weight: bold;
					margin-bottom: 8rpx;
					letter-spacing: 2rpx;
				}
				
				.entry-desc {
					font-size: 24rpx;
					color: rgba(255, 255, 255, 0.9);
				}
			}
		}
		
		.entry-right {
			.entry-btn {
				display: flex;
				align-items: center;
				background: #fff;
				padding: 16rpx 32rpx;
				border-radius: 40rpx;
				box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
				
				text {
					font-size: 28rpx;
					color: #4468E8;
					font-weight: 500;
					margin-right: 8rpx;
				}
				
				.entry-arrow {
					width: 24rpx;
					height: 24rpx;
					opacity: 0.8;
				}
			}
		}
	}
	
	&:active {
		transform: scale(0.98);
		transition: transform 0.2s ease;
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
			height: 80rpx;
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

.float-status-btn {
	position: fixed;
	z-index: 999;
	width: 140rpx;
	height: 140rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: transform 0.2s;
	margin-top: -10rpx;
	
	image {
		width: 140rpx;
		height: 140rpx;
	}
	
	&:active {
		transform: scale(0.95);
	}
}
</style> 