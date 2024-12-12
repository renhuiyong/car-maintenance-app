<template>
	<view class="invite-container">
		<!-- 背景图 -->
		<view class="bg-wrapper">
			<image class="bg-image" src="/static/images/yaoqing.png" mode="widthFix"></image>
		</view>
		
		<!-- 二维码区域 -->
		<view class="content">
			<view class="main-content">
				<view class="qrcode-box">
					<view class="qrcode-wrapper">
						<image 
							class="qrcode" 
							:src="qrCodeUrl" 
							show-menu-by-longpress
							@longpress="saveQrCode"
						></image>
						<!-- 骨架屏 -->
						<view class="skeleton" :class="{ 'hide': qrCodeLoaded }">
							<view class="skeleton-animation"></view>
						</view>
					</view>
					<text class="tip">面对面扫码注册邀请好友</text>
				</view>
				<view class="invite-info-container">
					<view class="invite-code-box">
						<text class="label">邀请码：</text>
						<text class="code">{{inviteCode}}</text>
					</view>
					<button class="copy-btn" @click="copyInviteCode">一键复制</button>
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
			inviteCode: '',
			qrCodeUrl: '',
			qrCodeLoaded: false
		}
	},
	onLoad() {
		this.getQrCode()
	},
	methods: {
		getQrCode() {
			this.qrCodeLoaded = false
			api.merchant.getMerchantPromotionCode().then(res => {
				if (res.code === 200) {
					const { qrCode, promotionCode } = res.data
					this.qrCodeUrl = 'data:image/png;base64,' + qrCode
					this.inviteCode = promotionCode
					this.qrCodeLoaded = true
				} else {
					this.qrCodeLoaded = true
					uni.showToast({
						title: res.msg || '获取二维码失败',
						icon: 'none'
					})
				}
			}).catch((err) => {
				this.qrCodeLoaded = true
				uni.showToast({
					title: err.msg || '网络错误，请稍后重试',
					icon: 'none'
				})
			})
		},
		copyInviteCode() {
			uni.setClipboardData({
				data: this.inviteCode,
				success: () => {
					uni.showToast({
						title: '邀请码已复制',
						icon: 'success'
					})
				}
			})
		},
		saveQrCode() {
			const base64Data = this.qrCodeUrl.split(',')[1]
			const filePath = `${wx.env.USER_DATA_PATH}/qrcode_${Date.now()}.png`
			
			wx.getFileSystemManager().writeFile({
				filePath: filePath,
				data: base64Data,
				encoding: 'base64',
				success: () => {
					uni.saveImageToPhotosAlbum({
						filePath: filePath,
						success: () => {
							uni.showToast({
								title: '保存成功',
								icon: 'success'
							})
						},
						fail: (err) => {
							if (err.errMsg.includes('auth deny')) {
								uni.showModal({
									title: '提示',
									content: '需要您授权保存图片',
									success: (res) => {
										if (res.confirm) {
											uni.openSetting()
										}
									}
								})
							} else {
								uni.showToast({
									title: '保存失败',
									icon: 'none'
								})
							}
						},
						complete: () => {
							wx.getFileSystemManager().unlink({
								filePath: filePath,
								fail: () => {}
							})
						}
					})
				},
				fail: () => {
					uni.showToast({
						title: '图片处理失败',
						icon: 'none'
					})
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.invite-container {
	width: 100vw;
	height: 100vh;
	position: relative;
	overflow: hidden;
	background: #FF4B4B;
	padding-top: calc(44px + var(--status-bar-height));
}

.bg-wrapper {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 1;
	overflow: hidden;
	display: flex;
	align-items: flex-start;
	justify-content: center;
}

.bg-image {
	width: 100%;
	min-height: 100%;
	position: absolute;
	top: 0;
	left: 0;
}

.content {
	position: relative;
	z-index: 2;
	display: flex;
	flex-direction: column;
	height: 100%;
	box-sizing: border-box;
	padding: 5vh 20rpx;
	
	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 15vh;
		gap: 8vh;
		position: relative;
	}
}

.qrcode-box {
	background: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 80%;
	max-width: 360rpx;
	margin: 0 auto;
	
	.qrcode-wrapper {
		position: relative;
		width: 300rpx;
		height: 300rpx;
		margin-bottom: 20rpx;
	}
	
	.qrcode {
		width: 100%;
		height: 100%;
	}
	
	.tip {
		font-size: 24rpx;
		color: #999;
	}
}

.invite-info-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20rpx;
	width: 100%;
	position: absolute;
	bottom: 12%;
	left: 0;
	right: 0;
}

.invite-code-box {
	padding: 12rpx 30rpx;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	
	.label {
		font-size: 28rpx;
		color: #FFFFFF;
	}
	
	.code {
		font-size: 32rpx;
		color: #FFFFFF;
		font-weight: bold;
	}
}

.copy-btn {
	width: 240rpx;
	height: 70rpx;
	line-height: 70rpx;
	text-align: center;
	background: #FFB23E;
	color: #FFFFFF;
	font-size: 28rpx;
	border: none;
	padding: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	
	&::after {
		border: none;
	}
	
	&:active {
		opacity: 0.8;
	}
}

.skeleton {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: #f5f5f5;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: opacity 0.3s;
	
	&.hide {
		opacity: 0;
		pointer-events: none;
	}
}

.skeleton-animation {
	width: 60%;
	height: 60%;
	background: linear-gradient(90deg, #f5f5f5 25%, #e8e8e8 50%, #f5f5f5 75%);
	background-size: 200% 100%;
	animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}
</style> 