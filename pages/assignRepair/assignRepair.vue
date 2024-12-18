<template>
	<view class="container">
		<!-- 维修店信息 -->
		<view class="repair-shop">
			<image class="shop-bg" src="/static/images/beijing.png" mode="aspectFill"></image>
			<view class="shop-content">
				<view class="shop-info">
					<text class="shop-name">{{ shopInfo.name }}</text>
					<text class="shop-distance">{{ shopInfo.distance }}</text>
				</view>
				<view class="shop-address">
					<text>{{ shopInfo.address }}</text>
				</view>
				<view class="shop-time">
					<text>营业时间: {{ shopInfo.businessHours }}</text>
				</view>
				<image 
					class="arrow-icon" 
					src="/static/images/youshang.png" 
					mode="aspectFit"
					@tap="openLocation"
				></image>
			</view>
		</view>

		<!-- 问题描述 -->
		<view class="form-item">
			<view class="label">问题描述</view>
			<view class="input-wrapper">
				<textarea 
					class="problem-input"
					v-model="description"
					placeholder="车辆故障无法移动"
					maxlength="200"
					user-select
					@longpress="showVoicePopup"
				></textarea>
				<view class="voice-icon" @tap="showVoicePopup">
					<image src="/static/images/yuyin.png" mode="aspectFit"></image>
				</view>
			</view>
			<view class="voice-record" v-if="voicePath" @click="playVoice">
				<view class="voice-duration">
					<image src="/static/images/yuyin.png" mode="aspectFit"></image>
					<text>{{ duration }}″</text>
				</view>
				<view class="play-status" :class="{ 'playing': isPlaying }">
					<view class="play-icon-wrapper">
						<view class="play-dot"></view>
						<view class="play-dot"></view>
						<view class="play-dot"></view>
					</view>
				</view>
			</view>
		</view>

		<!-- 图片上传 -->
		<view class="form-item">
			<view class="label">上传图像</view>
			<view class="upload-area" :style="{ height: uploadAreaHeight }">
				<view class="image-grid">
					<view 
						class="image-item" 
						v-for="(image, index) in uploadedImages" 
						:key="index"
					>
						<image 
							:src="image" 
							mode="aspectFill" 
							class="uploaded-image"
							@click="previewImage(index)"
						></image>
						<view class="delete-btn" @click.stop="deleteImage(index)">×</view>
					</view>
				</view>
				<view class="upload-box" :class="{ 'hidden': uploadedImages.length >= 9 }">
					<image 
						src="/static/images/xiangji.png" 
						mode="aspectFit"
						class="upload-icon"
						@click="chooseImage"
					></image>
				</view>
			</view>
		</view>

		<!-- 托运选项 -->
		<view class="transport-option">
			<radio :checked="needTransport" @click="toggleTransport" color="#FF9500" />
			<text>需要托运</text>
			<view class="transport-fee" @click="editTransportFee">
				<text>托运金额 ¥{{transportFee || '0.00'}}</text>
				<image src="/static/images/bianji.png" mode="aspectFit"></image>
			</view>
		</view>

		<!-- 联系人信息 -->
		<view class="contact-info">
			<view class="contact-details">
				<view class="contact-name">
					<input 
						type="text" 
						v-model="contactInfo.name" 
						placeholder="请输入姓名" 
						class="contact-input"
						maxlength="6"
						@click.stop
					/>
					<view class="phone-input-wrapper">
						<input 
							type="number" 
							v-model="contactInfo.phone" 
								placeholder="请输入手机号" 
								maxlength="11"
								class="contact-input"
								@click.stop
								@blur="validatePhone"
							/>
						<button 
							class="get-phone-btn"
							open-type="getPhoneNumber"
							@getphonenumber="getPhoneNumber"
						>快速获取</button>
					</view>
				</view>
				<view class="location-text" @click="chooseLocation">
					<image src="/static/images/dingwei.png" class="location-icon" mode="aspectFit"></image>
					<text>{{ contactInfo.address || '点击选择地址' }}</text>
					<image src="/static/images/youshang.png" class="arrow-right" mode="aspectFit"></image>
				</view>
			</view>
		</view>

		<!-- 底部按钮区域 -->
		<view class="bottom-area">
			<button class="submit-btn" @click="submitOrder">提交报修</button>
			<view class="float-call-btn" @click="makeCall">
				<image src="/static/images/dianhua.png" mode="aspectFit"></image>
			</view>
		</view>

		<!-- 添加自定义金额输入弹窗 -->
		<view class="fee-popup" v-if="showFeePopup">
			<view class="popup-mask" @click="showFeePopup = false"></view>
			<view class="popup-content">
				<view class="popup-header">
					<text>修改托运金额</text>
					<text class="close-icon" @click="showFeePopup = false">×</text>
				</view>
				<view class="popup-body">
					<view class="fee-input-box">
						<view class="input-wrapper">
							<text class="currency">¥</text>
							<input 
								type="digit"
								v-model="tempFee"
								class="fee-input"
								placeholder="0.00"
								@input="onFeeInput"
							/>
						</view>
						<view class="input-line"></view>
					</view>
				</view>
				<view class="popup-footer">
					<button 
						class="cancel-btn"
						@click="showFeePopup = false"
					>取消</button>
					<button 
						class="confirm-btn" 
						:class="{ 'active': isValidFee }"
						@click="confirmFee"
					>确定</button>
				</view>
			</view>
		</view>

		<!-- 添加语音识别提示弹窗 -->
		<view class="voice-popup" v-if="isRecording" @touchstart.stop="startVoice" @touchend.stop="endVoice" @touchmove.stop="onTouchMove">
			<view class="voice-popup-content">
				<view class="voice-icon-large">
					<image src="/static/images/yuyin.png" mode="aspectFit"></image>
					<view class="wave-circle"></view>
				</view>
				<view class="voice-status">
					<text class="voice-tip">{{ recordTip }}</text>
					<text class="voice-time">{{ currentSeconds }}″</text>
					<text class="voice-cancel" :class="{ 'cancel-active': isCanceled }">上取消录音</text>
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
			description: '',
			needTransport: false,
			uploadedImages: [],
			transportFee: 0,
			showFeePopup: false,
			tempFee: '',
			isValidFee: false,
			isRecording: false,
			startY: 0,
			isCanceled: false,
			recorderManager: null, // 录音管理器
			innerAudioContext: null, // 音频播放器
			voicePath: '', // 录音文件路径
			duration: 0, // 录音时长
			isPlaying: false, // 是否正在播放
			recordTip: '按住说话', // 修改默认提示文字
			startTime: 0, // 开始录音的时间戳
			currentSeconds: 0, // 当前录音秒数
			recordTimer: null, // 记录实时秒数的定时器
			shopInfo: {
				id: '',
				name: '',
				distance: '',
				address: '',
				businessHours: '',
				phone: ''
			},
			address: {
				name: '',
				address: '',
				latitude: 0, // 要填入实际的纬度
				longitude: 0, // 需要填入实际的经度
			},
			contactInfo: {
				name: '',
				phone: '',
				address: '',
				latitude: 0,
				longitude: 0
			},
		}
	},
	onLoad(options) {
		if (options.shopInfo) {
			const shopInfo = JSON.parse(decodeURIComponent(options.shopInfo))
			this.shopInfo = shopInfo
			// 确保地址信息中的经纬度为数字类型
			this.address = {
				name: shopInfo.name,
				address: shopInfo.address,
				latitude: Number(shopInfo.latitude) || 0,
				longitude: Number(shopInfo.longitude) || 0
			}
		}

		// 初始化录音管理器
		this.recorderManager = uni.getRecorderManager()
		// 初始化音频播放器
		this.innerAudioContext = uni.createInnerAudioContext()

		// 监听录音开始事件
		this.recorderManager.onStart(() => {
			this.startTime = Date.now()
			this.recordTip = '松开结束录音'
		})

		// 监听录音结束事件
		this.recorderManager.onStop((res) => {
			if (!this.isCanceled && this.currentSeconds >= 3) {
				this.voicePath = res.tempFilePath
				this.duration = this.currentSeconds
			} else {
				this.voicePath = ''
				this.duration = 0
				// 如果正在播放，停止播放
				if (this.isPlaying) {
					this.innerAudioContext.stop()
					this.isPlaying = false
				}
			}
		})

		// 监听播放结束
		this.innerAudioContext.onEnded(() => {
			this.isPlaying = false
		})
	},
	methods: {
		toggleTransport() {
			this.needTransport = !this.needTransport
			if (!this.needTransport) {
				this.transportFee = 0
			}
		},
		chooseImage() {
			uni.chooseImage({
				count: 9 - this.uploadedImages.length, // 改回最多9张
				success: (res) => {
					this.uploadedImages = [...this.uploadedImages, ...res.tempFilePaths]
				}
			})
		},
		editContact() {
			// 编辑联系人信息
		},
		makeCall() {
			if (this.shopInfo.phone) {
				uni.makePhoneCall({
					phoneNumber: this.shopInfo.phone,
					fail: (err) => {
						console.error('拨打电话失败:', err)
						uni.showToast({
							title: '拨打电话失败',
							icon: 'none'
						})
					}
				})
			} else {
				uni.showToast({
					title: '暂无联系电话',
					icon: 'none'
				})
			}
		},
		async submitOrder() {
			// 表单验证
			if (!this.description && !this.voicePath) {
				uni.showToast({
					title: '请填写问题描述或录制语音',
					icon: 'none'
				})
				return
			}
			
			if (!this.contactInfo.name) {
				uni.showToast({
					title: '请填写联系人姓名',
					icon: 'none'
				})
				return
			}
			
			if (!this.contactInfo.phone) {
				uni.showToast({
					title: '请填写联系电话',
					icon: 'none'
				})
				return
			}
			
			if (!this.contactInfo.address) {
				uni.showToast({
					title: '请选择联系地址',
					icon: 'none'
				})
				return
			}

			// 显示loading
			uni.showLoading({
				title: '提交中...',
				mask: true
			})

			try {
				// 上传语音文件
				let voiceUrl = ''
				if (this.voicePath) {
					const voiceRes = await api.common.uploadFile(this.voicePath)
					voiceUrl = voiceRes.fileName
				}

				// 上传图片文件
				let imageUrls = []
				if (this.uploadedImages.length > 0) {
					const uploadPromises = this.uploadedImages.map(imagePath => 
						api.common.uploadFile(imagePath)
					)
					const imageResults = await Promise.all(uploadPromises)
					imageUrls = imageResults.map(res => res.fileName)
				}

				// 构造提交数据
				const submitData = {
					// 订单类型(1-指定维修)
					orderType: 1,
					
					// 维修店铺信息
					shopId: this.shopInfo.id,
					shopName: this.shopInfo.name,
					shopAddress: this.shopInfo.address,
					
					// 问题描述
					description: this.description,
					voicePath: voiceUrl,  // 现在是 fileName
					voiceDuration: this.duration,
					images: imageUrls.join(','),  // 现在是 fileName 数组的拼接
					
					// 托运信息
					needTransport: this.needTransport ? 1 : 0,
					transportFee: this.transportFee,
					
					// 联系人信息
					contactName: this.contactInfo.name,
					contactPhone: this.contactInfo.phone,
					contactAddress: this.contactInfo.address,
					contactLatitude: this.contactInfo.latitude,
					contactLongitude: this.contactInfo.longitude
				}

				console.log(submitData)

				// 调用提交接口
				const res = await api.repair.submitRepairOrder(submitData)
				if (res.code === 200) {
					uni.showToast({
						title: '提��成功',
						icon: 'success'
					})
					// 提交成功后跳转到订单详情页
					setTimeout(() => {
						uni.redirectTo({
							url: `/pages/orderDetail/orderDetail?orderId=${res.data}`
						})
					}, 1500)
				} else {
					uni.showToast({
						title: res.msg || '提交失败',
						icon: 'none'
					})
				}
			} catch (err) {
				console.error('提交维修工单失败:', err)
				uni.showToast({
					title: '提交失败，请重试',
					icon: 'none'
				})
			} finally {
				// 隐藏loading
				uni.hideLoading()
			}
		},
		editTransportFee() {
			this.tempFee = this.transportFee === 0 ? '' : this.transportFee.toString()
			this.showFeePopup = true
			this.isValidFee = this.transportFee > 0
		},
		onFeeInput(e) {
			const value = e.detail.value
			this.isValidFee = /^\d+(\.\d{0,2})?$/.test(value) && Number(value) > 0
		},
		confirmFee() {
			if (!this.isValidFee) {
				uni.showToast({
					title: '请输入有金额',
					icon: 'none'
				})
				return
			}
			this.transportFee = Number(this.tempFee)
			if (this.transportFee > 0) {
				this.needTransport = true
			}
			this.showFeePopup = false
		},
		showVoicePopup() {
			this.isRecording = true
			this.isCanceled = false
		},
		startVoice(e) {
			this.startY = e.touches[0].clientY
			this.isRecording = true
			this.currentSeconds = 0
			this.recordTip = '松开结束录音'
			
			// 开始录音
			this.recorderManager.start({
				duration: 60000,
				sampleRate: 16000,
				numberOfChannels: 1,
				encodeBitRate: 96000,
				format: 'mp3'
			})

			// 动定时器，每秒更新录音时长
			this.recordTimer = setInterval(() => {
				this.currentSeconds++
				if (this.currentSeconds >= 60) {
					this.endVoice()
				}
			}, 1000)
		},
		endVoice() {
			// 先停止定时器
			if (this.recordTimer) {
				clearInterval(this.recordTimer)
				this.recordTimer = null
			}

			if (this.isCanceled) {
				this.recorderManager.stop()
				uni.showToast({
					title: '已取消录音',
					icon: 'none'
				})
			} else if (this.currentSeconds < 3) {
				this.recorderManager.stop()
				uni.showToast({
					title: '说话时间太短',
					icon: 'none'
				})
			} else {
				// 先记录当前秒数，再停止录音
				const finalDuration = this.currentSeconds
				this.recorderManager.stop()
				this.duration = finalDuration
				uni.showToast({
					title: '录音完成',
					icon: 'success'
				})
			}

			this.isRecording = false
			this.recordTip = '按住说话'
		},
		onTouchMove(e) {
			const moveY = e.touches[0].clientY
			const moveDistance = this.startY - moveY

			if (moveDistance > 50) {
				this.isCanceled = true
				this.recordTip = '松开手指，取消发送'
			} else {
				this.isCanceled = false
				this.recordTip = '松开结束录音'
			}
		},
		playVoice() {
			if (this.isPlaying) {
				this.innerAudioContext.stop()
				this.isPlaying = false
				return
			}

			this.innerAudioContext.src = this.voicePath
			this.innerAudioContext.play()
			this.isPlaying = true
		},
		// 预览图片
		previewImage(index) {
			uni.previewImage({
				urls: this.uploadedImages,
				current: index
			})
		},
		// 删除图片
		deleteImage(index) {
			this.uploadedImages.splice(index, 1)
		},
		// 组件销毁清理资源
		onUnload() {
			if (this.recordTimer) {
				clearInterval(this.recordTimer)
				this.recordTimer = null
			}
			if (this.innerAudioContext) {
				this.innerAudioContext.destroy()
			}
		},
		// 打开��航
		openLocation() {
			// 确保经纬度为数字类型
			const latitude = Number(this.address.latitude)
			const longitude = Number(this.address.longitude)
			
			// 验证经纬度是否有效
			if (isNaN(latitude) || isNaN(longitude)) {
				uni.showToast({
					title: '位置信息无效',
					icon: 'none'
				})
				return
			}

			uni.openLocation({
				latitude: latitude,
				longitude: longitude,
				name: this.address.name,
				address: this.address.address,
				success: () => {
					console.log('导航开成功')
				},
				fail: (err) => {
					console.error('导航打开失败', err)
					uni.showToast({
						title: '导航打开失败',
						icon: 'none'
					})
				}
			})
		},
		chooseLocation() {
			uni.chooseLocation({
				success: (res) => {
					// 只更新地址相关信息，不更新联系人姓名
					this.contactInfo.address = res.address
					this.contactInfo.latitude = res.latitude
					this.contactInfo.longitude = res.longitude
				},
				fail: (err) => {
					console.error('选择位置失败', err)
					uni.showToast({
						title: '选择位置失败',
						icon: 'none'
					})
				}
			})
		},
		getPhoneNumber(e) {
			if (e.detail.errMsg === 'getPhoneNumber:ok') {
				// 这里需要调用后端接口解密获取手机号
				// 示例中直接使用假数据
				const phone = '13888888888'
				// 验证获取到的手机号
				const phoneReg = /^1[3-9]\d{9}$/
				if (phoneReg.test(phone)) {
					this.contactInfo.phone = phone
				} else {
					uni.showToast({
						title: '获取手机号失败',
						icon: 'none'
					})
				}
			} else {
				uni.showToast({
					title: '获取手机号失败',
					icon: 'none'
				})
			}
		},
		validatePhone() {
			if (this.contactInfo.phone) {
				const phoneReg = /^1[3-9]\d{9}$/
				if (!phoneReg.test(this.contactInfo.phone)) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					})
					this.contactInfo.phone = ''
				}
			}
		}
	},
	computed: {
		// 计算上传区域的高度
		uploadAreaHeight() {
			const rows = Math.ceil(this.uploadedImages.length / 3)
			const baseHeight = 160 // 基础高度
			const rowHeight = 160 // 每行高度
			const gap = 20 // 行间距
			// 最多3行（9张图片）
			return rows > 0 ? `${Math.min(baseHeight + (rows - 1) * (rowHeight + gap), baseHeight + 2 * (rowHeight + gap))}rpx` : `${baseHeight}rpx`
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	background-color: #F6F6F6;
	padding: 0 20rpx;
}

.repair-shop {
	position: relative;
	background-color: #fff;
	padding: 20rpx 30rpx;
	border-radius: 12rpx;
	margin-bottom: 20rpx;
	overflow: hidden;

	.shop-bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
	}

	.shop-content {
		position: relative;
		z-index: 1;
		padding: 20rpx 0;

		.arrow-icon {
			position: absolute;
			right: 0;
			bottom: 20rpx;
			width: 56rpx;
			height: 56rpx;
		}
	}

	.shop-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;

		.shop-name {
			font-size: 30rpx;
			font-weight: bold;
			color: #333;
		}

		.shop-distance {
			font-size: 26rpx;
			color: #666;
			font-weight: bold;
		}
	}

	.shop-address {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 16rpx;
	}

	.shop-time {
		font-size: 26rpx;
		color: #666;
	}
}

.form-item {
	padding: 20rpx 30rpx;
	border-bottom: 1rpx solid #eee;
	background-color: #fff;
	border-radius: 12rpx;
	margin-bottom: 20rpx;

	.label {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 20rpx;
        font-weight: bold;
	}
}

.input-wrapper {
	position: relative;
	
	.problem-input {
		width: 100%;
		height: 160rpx;
		font-size: 28rpx;
		color: #333;
		padding-right: 80rpx;
		padding-bottom: 40rpx;
		box-sizing: border-box;
	}
	
	.voice-icon {
		position: absolute;
		right: 20rpx;
		bottom: 20rpx;
		width: 60rpx;
		height: 60rpx;
		z-index: 1;
		
		image {
			width: 100%;
			height: 100%;
		}
	}
}

.upload-area {
	position: relative;
	min-height: 160rpx;
	background-color: #fff;
	border-radius: 8rpx;
	transition: height 0.3s ease;

	.image-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
		padding-right: 100rpx; // 为上传按钮留出空间
		box-sizing: border-box;

		.image-item {
			width: calc((100% - 40rpx) / 3); // 减去两距后分
			height: 160rpx;
			position: relative;
			overflow: hidden;

			.uploaded-image {
				width: 100%;
				height: 100%;
				border-radius: 8rpx;
			}

			.delete-btn {
				position: absolute;
				right: 0;
				top: 0;
				width: 32rpx;
				height: 32rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 24rpx;
				color: #fff;
				background: rgba(0, 0, 0, 0.4);
				backdrop-filter: blur(4px);
				border-radius: 0 8rpx 0 8rpx;
				transform: translate(0, 0);
				transition: all 0.2s ease;

				&::before {
					content: '';
					position: absolute;
					width: 16rpx;
					height: 2rpx;
					background: #fff;
					transform: rotate(45deg);
				}

				&::after {
					content: '';
					position: absolute;
					width: 16rpx;
					height: 2rpx;
					background: #fff;
					transform: rotate(-45deg);
				}

				&:active {
					background: rgba(0, 0, 0, 0.6);
					transform: scale(0.9);
				}
			}

			&:active {
				.delete-btn {
					background: rgba(0, 0, 0, 0.6);
				}
			}
		}
	}

	.upload-box {
		position: absolute;
		right: 20rpx;
		bottom: 20rpx; // 改为固定在底部
		z-index: 2;

		.upload-icon {
			width: 60rpx;
			height: 60rpx;
		}

		// 当图片达到9张时隐藏上传按钮
		&.hidden {
			display: none;
		}
	}
}

.transport-option {
	margin-top: 20rpx;
	padding: 20rpx 30rpx;
	display: flex;
	align-items: center;
	font-size: 28rpx;
	background: #fff;
	font-weight: bold;
	border-radius: 12rpx;

	.transport-fee {
		margin-left: auto;
		color: #666;
		display: flex;
		align-items: center;
		cursor: pointer;

		image {
			width: 30rpx;
			height: 30rpx;
			margin-left: 10rpx;
		}
	}
}

.contact-info {
	padding: 30rpx 30rpx;
	display: flex;
	align-items: center;
	background-color: #fff;
	margin-top: 20rpx;
	border-radius: 12rpx;
	border-top: none;

	.contact-details {
		flex: 1;
		font-size: 32rpx;

		.contact-name {
			display: flex;
			gap: 20rpx;
			margin-bottom: 40rpx;

			.contact-input {
				font-size: 34rpx;
				color: #333;
				font-weight: bold;
				padding: 0;
				height: 44rpx;
				margin-left: 38rpx;
				
				&:first-child {
					width: 200rpx;
				}
				
				&:last-child {
					flex: 1;
				}

				&::placeholder {
					color: #999;
					font-weight: normal;
				}
			}
		}

		.location-text {
			display: flex;
			align-items: center;
			color: #999;
			font-size: 30rpx;
			position: relative;
			padding-right: 52rpx;
			
			.location-icon {
				width: 32rpx;
				height: 32rpx;
				margin-right: 20rpx;
				flex-shrink: 0;
			}

			text {
				flex: 1;
				max-width: 460rpx;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.arrow-right {
				position: absolute;
				right: 0;
				top: 50%;
				transform: translateY(-50%);
				width: 32rpx;
				height: 32rpx;
				flex-shrink: 0;
			}
		}
	}
}

.bottom-area {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 20rpx 50rpx;
	background-color: #fff;
	display: flex;
	align-items: center;
	border-top: 1rpx solid #eee;

	.submit-btn {
		flex: 1;
		height: 88rpx;
		line-height: 88rpx;
		background-color: #FF9500;
		color: #fff;
		font-size: 32rpx;
		margin-right: 20rpx;
	}

	.float-call-btn {
		width: 88rpx;
		height: 88rpx;
		background-color: #fff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1rpx solid #eee;

		image {
			width: 80rpx;
			height: 80rpx;
		}
	}
}

.fee-popup {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 999;

	.popup-mask {
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.6);
	}

	.popup-content {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 640rpx;
		background: #fff;
		border-radius: 24rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.popup-header {
		width: 100%;
		position: relative;
		padding: 40rpx 0;
		text-align: center;
		font-size: 32rpx;
		color: #333;
		font-weight: 500;
		border-bottom: 1rpx solid #f5f5f5;

		.close-icon {
			position: absolute;
			right: 24rpx;
			top: 50%;
			transform: translateY(-50%);
			font-size: 44rpx;
			color: #999;
			padding: 10rpx;
			line-height: 1;
		}
	}

	.popup-body {
		width: 100%;
		padding: 80rpx 60rpx;
		display: flex;
		flex-direction: column;
		align-items: center;

		.fee-input-box {
			width: 100%;
			position: relative;
			padding: 0;

			.input-wrapper {
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 40rpx 0;
				min-height: 160rpx;

				.currency {
					font-size: 80rpx;
					line-height: 80rpx;
					color: #333;
					font-family: DINAlternate-Bold, sans-serif;
					font-weight: 500;
					margin-right: 4rpx;
				}

				.fee-input {
					width: 200rpx;
					height: 80rpx;
					font-size: 80rpx !important;
					line-height: 80rpx;
					color: #333;
					font-family: DINAlternate-Bold, sans-serif;
					font-weight: 500;
					text-align: center;
					padding: 0;
					min-height: 0;
					background: transparent;

					&::placeholder {
						color: #ccc;
						font-size: 80rpx;
						text-align: center;
					}
				}
			}

			.input-line {
				position: absolute;
				left: 50%;
				transform: translateX(-50%);
				width: 320rpx;
				bottom: 20rpx;
				height: 2rpx;
				background: linear-gradient(to right,
					rgba(255, 149, 0, 0) 0%,
						rgba(255, 149, 0, 0.3) 50%,
					rgba(255, 149, 0, 0) 100%
				);
			}
		}
	}

	.popup-footer {
		width: 100%;
		display: flex;
		padding: 0 40rpx 40rpx;
		gap: 24rpx;
		justify-content: center;

		button {
			flex: 0 0 220rpx;
			height: 80rpx;
			line-height: 80rpx;
			font-size: 32rpx;
			border-radius: 40rpx;
			border: none;
			transition: all 0.2s ease;

			&::after {
				border: none;
			}
		}

		.cancel-btn {
			margin-left: 80rpx;
			background: #F7F8FA;
			color: #666;
			font-weight: 500;

			&:active {
				background: #EBEDF0;
				transform: translateY(2rpx);
			}
		}

		.confirm-btn {
			margin-right: 80rpx;
			background: #CCCCCC;
			color: #fff;
			opacity: 0.8;

			&.active {
				opacity: 1;
				background: linear-gradient(135deg, #FF9500, #FF8100);
				box-shadow: 0 6rpx 16rpx rgba(255, 149, 0, 0.2);

				&:active {
					transform: translateY(2rpx);
					box-shadow: 0 2rpx 8rpx rgba(255, 149, 0, 0.15);
				}
			}
		}
	}
}

.voice-icon {
	position: relative;
	
	.voice-wave {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		align-items: flex-end;
		height: 20rpx;
		width: 30rpx;
		
		.wave-item {
			width: 4rpx;
			background-color: #FF9500;
			margin: 0 2rpx;
			animation: waveAnim 1s ease-in-out infinite;
			
			&:nth-child(1) { animation-delay: 0s; }
			&:nth-child(2) { animation-delay: 0.2s; }
			&:nth-child(3) { animation-delay: 0.4s; }
			&:nth-child(4) { animation-delay: 0.6s; }
		}
	}
}

.voice-popup {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.6);
	z-index: 999;
	display: flex;
	align-items: center;
	justify-content: center;

	.voice-popup-content {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 40rpx;
		width: 400rpx;
		display: flex;
		flex-direction: column;
		align-items: center;

		.voice-icon-large {
			position: relative;
			width: 120rpx;
			height: 120rpx;
			margin-bottom: 40rpx;

			image {
				width: 100%;
				height: 100%;
				position: relative;
				z-index: 2;
			}

			.wave-circle {
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
				width: 120rpx;
				height: 120rpx;
				border-radius: 50%;
				background: rgba(255, 149, 0, 0.1);
				animation: waveScale 1.5s ease-in-out infinite;

				&::after {
					content: '';
					position: absolute;
					left: 50%;
					top: 50%;
					transform: translate(-50%, -50%);
					width: 80rpx;
					height: 80rpx;
					border-radius: 50%;
					background: rgba(255, 149, 0, 0.2);
					animation: waveScale 1.5s ease-in-out infinite 0.5s;
				}
			}
		}

		.voice-status {
			display: flex;
			flex-direction: column;
			align-items: center;

			.volume-bars {
				display: flex;
				align-items: flex-end;
				height: 60rpx;
				margin-bottom: 30rpx;
				gap: 6rpx;

				.volume-bar {
					width: 6rpx;
					background: #FF9500;
					border-radius: 3rpx;
					transition: height 0.1s ease-out; // 优化过渡效果
				}
			}

			.voice-tip {
				font-size: 28rpx;
				color: #333;
				margin-bottom: 20rpx;
			}

			.voice-time {
				font-size: 32rpx;
				color: #FF9500;
				margin: 10rpx 0;
			}

			.voice-cancel {
				font-size: 24rpx;
				color: #999;
				transition: color 0.2s ease;

				&.cancel-active {
					color: #FF5151;
				}
			}
		}
	}
}

@keyframes waveAnim {
	0%, 100% { height: 4rpx; }
	50% { height: 20rpx; }
}

@keyframes waveScale {
	0% {
		transform: translate(-50%, -50%) scale(0.8);
		opacity: 0.8;
	}
	100% {
		transform: translate(-50%, -50%) scale(1.5);
		opacity: 0;
	}
}

.voice-record {
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: #F7F7F7;
	padding: 20rpx 30rpx;
	border-radius: 8rpx;
	margin-top: 20rpx;

	.voice-duration {
		display: flex;
		align-items: center;
		
		image {
			width: 40rpx;
			height: 40rpx;
			margin-right: 10rpx;
		}

		text {
			color: #666;
			font-size: 28rpx;
		}
	}

	.play-status {
		width: 60rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		.play-icon-wrapper {
			display: flex;
			align-items: flex-end;
			height: 100%;
			gap: 6rpx;

			.play-dot {
				width: 6rpx;
				height: 6rpx;
				background-color: #FF9500;
				border-radius: 3rpx;
				transition: height 0.2s ease;
			}
		}

		&.playing {
			.play-dot {
				animation: playingAnimation 1s ease infinite;

				&:nth-child(1) {
					animation-delay: 0s;
				}
				&:nth-child(2) {
					animation-delay: 0.2s;
				}
				&:nth-child(3) {
					animation-delay: 0.4s;
				}
			}
		}
	}
}

@keyframes playingAnimation {
	0%, 100% {
		height: 6rpx;
	}
	50% {
		height: 20rpx;
	}
}

.phone-input-wrapper {
	position: relative;
	flex: 1;

	.contact-input {
		width: 100%;
		padding-right: 180rpx; // 增加右侧内边距，为更宽的按钮留出空间
	}

	.get-phone-btn {
		position: absolute;
		right: 0;
		top: 50%;
		transform: translateY(-50%);
		font-size: 24rpx;
		color: #FFAC3A;
		background: #FFF4E5;
		border: none;
		border-radius: 22rpx;
		padding: 0 30rpx; // 增加水平内边距
		height: 44rpx;
		line-height: 44rpx;
		min-width: auto; // 移除最小宽度限制，让按���宽度自适应内容
		white-space: nowrap; // 防止文字换行
		text-align: center;
		
		&::after {
			border: none;
		}
	}
}
</style> 