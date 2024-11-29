<template>
	<view class="login-container">
		<!-- 登录内容区 -->
		<view class="login-content">
			<!-- 标题区域 -->
			<view class="title-area">
				<text class="welcome">欢迎登录</text>
				<text class="subtitle">您好，欢迎登录电动车供配修服务</text>
			</view>
			
			<!-- 表单区域 -->
			<view class="form-area">
				<!-- 手机号输入框 -->
				<view class="input-box">
					<text class="iconfont">📱</text>
					<input 
						class="custom-input"
						type="number" 
						v-model="phone" 
						placeholder="请输入手机号码" 
						maxlength="11"
					/>
				</view>
				
				<!-- 密码输入框 -->
				<view class="input-box">
					<text class="iconfont">🔒</text>
					<input 
						class="custom-input"
						:type="showPassword ? 'text' : 'password'" 
						v-model="password" 
						placeholder="请输入密码"
						:hold-keyboard="true"
						:adjust-position="false"
					/>
					<view class="eye-box" @click="togglePasswordVisibility">
						<text class="iconfont eye">👁️</text>
					</view>
				</view>
				
				<!-- 注册入口 -->
				<view class="register-link">
					<text @click="goToRegister">注册账号</text>
				</view>
				
				<!-- 登录按钮 -->
				<button class="login-btn" @click="handleLogin">登录</button>
				
				<!-- 验证码登录入口 -->
				<view class="verify-login">
					<text @click="switchToVerifyLogin">验证码登录</text>
				</view>
			</view>
			
			<!-- 底部协议 -->
			<view class="agreement">
				<text class="agreement-text">
					登录代表您已经同意
					<text class="link">《用户协议》</text>
					和
					<text class="link">《隐私权政策》</text>
				</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				phone: '',
				password: '',
				showPassword: false,
				nickName: '',
				avatarUrl: '',
				code: ''
			}
		},
		onLoad(options) {
			// 获取页面传递的参数
			if (options.code) {
				this.code = options.code
			}
			if (options.nickName) {
				this.nickName = decodeURIComponent(options.nickName)
			}
			if (options.avatarUrl) {
				this.avatarUrl = decodeURIComponent(options.avatarUrl)
			}
		},
		methods: {
			togglePasswordVisibility() {
				this.showPassword = !this.showPassword
			},
			handleLogin() {
				if (!this.phone || !this.password) {
					uni.showToast({
						title: '请输入手机号和密码',
						icon: 'none'
					})
					return
				}
				
				// 这里应该调用后端接口，发送 code 获取 openid
				// 示例请求:
				uni.request({
					url: 'YOUR_API_URL/login',
					method: 'POST',
					data: {
						code: this.code,
						phone: this.phone,
						password: this.password,
						nickName: this.nickName,
						avatarUrl: this.avatarUrl
					},
					success: (res) => {
						if (res.data.success) {
							// 保存用户信息和token
							const userInfo = {
								name: this.nickName || '用户',
								phone: this.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
								avatar: this.avatarUrl || '/static/my/default-avatar.png',
								openid: res.data.openid, // 保存openid
								token: res.data.token // 保存token
							}
							
							uni.setStorageSync('userInfo', JSON.stringify(userInfo))
							uni.setStorageSync('token', res.data.token)
							
							uni.showToast({
								title: '登录成功',
								icon: 'success',
								duration: 1500,
								success: () => {
									setTimeout(() => {
										uni.navigateBack({
											delta: 1
										})
									}, 1500)
								}
							})
						} else {
							uni.showToast({
								title: res.data.message || '登录失败',
								icon: 'none'
							})
						}
					},
					fail: (err) => {
						console.log('登录失败', err)
						uni.showToast({
							title: '登录失败，请重试',
							icon: 'none'
						})
					}
				})
			},
			switchToVerifyLogin() {
				uni.navigateTo({
					url: '/pages/login/verify'
				})
			},
			goToRegister() {
				uni.navigateTo({
					url: '/pages/register/register'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
.login-container {
	min-height: 100vh;
	background: linear-gradient(180deg, #EEF3FF 0%, #FFFFFF 100%);
	padding-top: var(--status-bar-height);
}

.custom-input {
	flex: 1;
	font-size: 32rpx;
	color: #333;
	height: 108rpx;
	line-height: 108rpx;
	background-color: transparent !important;
	outline: none !important;
	border: none !important;
	margin: 0;
	padding: 0;
}

.login-content {
	padding: 0 40rpx;
	min-height: calc(100vh - var(--status-bar-height));
	display: flex;
	flex-direction: column;
}

.title-area {
	margin-top: 15vh;
	
	.welcome {
		font-size: 48rpx;
		font-weight: 600;
		color: #333;
		display: block;
		margin-bottom: 16rpx;
	}
	
	.subtitle {
		font-size: 28rpx;
		color: #666;
	}
}

.form-area {
	margin-top: 240rpx;
}

.input-box {
	background: #FFFFFF;
	border-radius: 16rpx;
	height: 108rpx;
	display: flex;
	align-items: center;
	padding: 0 32rpx;
	margin-bottom: 32rpx;
	
	.iconfont {
		font-size: 44rpx;
		color: #999;
		margin-right: 24rpx;
	}
	
	.eye-box {
		width: 44rpx;
		height: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		
		.eye {
			font-size: 44rpx;
			color: #999;
		}
	}
}

.register-link {
	text-align: right;
	margin: 20rpx 0 60rpx;
	padding-right: 32rpx;
	
	text {
		font-size: 28rpx;
		color: #999;
		padding: 10rpx;
	}
}

.login-btn {
	background: #4468E8;
	color: #FFFFFF;
	height: 96rpx;
	line-height: 96rpx;
	border-radius: 48rpx;
	font-size: 32rpx;
	font-weight: 500;
	margin-bottom: 40rpx;
	
	&::after {
		border: none;
	}
}

.verify-login {
	text-align: center;
	
	text {
		font-size: 28rpx;
		color: #4468E8;
		padding: 20rpx;
	}
}

.agreement {
	margin-top: auto;
	padding: 40rpx;
	text-align: center;
	
	.agreement-text {
		font-size: 24rpx;
		color: #999;
		
		.link {
			color: #4468E8;
		}
	}
}
</style> 