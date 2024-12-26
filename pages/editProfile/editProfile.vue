<template>
	<view class="container">
		<!-- 编辑表单 -->
		<view class="form-content">
			<!-- 头像 -->
			<view class="form-item avatar-item">
				<text class="label">头像</text>
				<button 
					class="avatar-wrapper"
					open-type="chooseAvatar" 
					@chooseavatar="onChooseAvatar"
				>
					<image 
						class="avatar" 
						:src="userInfo.avatar ? 
							(userInfo.avatar.startsWith('http') ? userInfo.avatar : request.BASE_URL + userInfo.avatar) 
							: '/static/my/default-avatar.png'"
					></image>
					<image class="arrow" src="/static/images/youjiantou2.png"></image>
				</button>
			</view>
			
			<!-- 昵称 -->
			<view class="form-item">
				<text class="label">昵称</text>
				<input 
					type="text"
					v-model="userInfo.name"
					placeholder="请输入昵称"
					placeholder-class="input-placeholder"
					maxlength="32"
					@input="handleNameInput"
				/>
				<image class="arrow" src="/static/images/youjiantou2.png"></image>
			</view>
			
			<!-- 手机号 -->
			<view class="form-item">
				<text class="label">手机号</text>
				<button 
					class="phone-text-btn" 
					open-type="getPhoneNumber" 
					@getphonenumber="getPhoneNumber"
				>
					{{ userInfo.phone || '未绑定' }}
				</button>
				<button 
					class="bind-btn" 
					open-type="getPhoneNumber" 
					@getphonenumber="getPhoneNumber"
				>
					{{ userInfo.phone ? '重新获取' : '绑定手机号' }}
				</button>
				<image class="arrow" src="/static/images/youjiantou2.png"></image>
			</view>
		</view>
		
		<!-- 保存按钮 -->
		<button class="save-btn" @click="saveProfile">保存</button>
	</view>
</template>

<script>
import api from '../../api/index.js'
import request from '../../utils/request.js'

export default {
	data() {
		return {
			userInfo: {
				name: '',
				phone: '',
				avatar: ''
			},
			request
		}
	},
	
	onLoad() {
		const userInfo = uni.getStorageSync('userInfo')
		if (userInfo) {
			this.userInfo = JSON.parse(userInfo)
		}
	},
	
	methods: {
		async onChooseAvatar(e) {
			try {
				const uploadUrl = request.BASE_URL + '/web/user/upload'

				// 先上传图片
				const uploadRes = await new Promise((resolve, reject) => {
					uni.uploadFile({
						url: uploadUrl.startsWith('http') ? uploadUrl : 'http://' + uploadUrl,
						filePath: e.detail.avatarUrl,
						name: 'file',
						header: {
							'WaAuthorization': uni.getStorageSync('token')
						},
						success: (uploadFileRes) => {
							try {
								const res = JSON.parse(uploadFileRes.data)
								resolve(res)
							} catch (err) {
								reject(new Error('上传失败'))
							}
						},
						fail: (err) => {
							reject(err)
						}
					})
				})

				if (uploadRes.code !== 200) {
					throw new Error(uploadRes.msg || '上传失败')
				}

				if (!uploadRes.fileName) {
					throw new Error('上传成功但未返回图片地址')
				}

				this.userInfo.avatar = uploadRes.fileName

			} catch (err) {
				uni.showToast({
					title: typeof err === 'string' ? err : (err.errMsg || err.message || '更新头像失败'),
					icon: 'none'
				})
			}
		},
		
		async getPhoneNumber(e) {
			try {
				// 用户拒绝授权的情况
				if (e.detail.errMsg && e.detail.errMsg.includes('deny')) {
					throw new Error('用户拒绝授权')
				}
				
				// 检查是否有code
				if (!e.detail.code) {
					throw new Error('获取手机号失败')
				}
				
				// 调用后端接口绑定手机号
				const res = await api.common.decryptPhoneNumber({
					code: e.detail.code
				})
				
				if (res.code === 200) {
					// 更新本地用户信息
					this.userInfo.phone = res.msg
					uni.setStorageSync('userInfo', JSON.stringify(this.userInfo))

				} else {
					throw new Error(res.msg || '绑定失败')
				}
			} catch (err) {
				uni.showToast({
					title: err.message || '绑定失败',
					icon: 'none'
				})
			}
		},
		
		handleNameInput(e) {
			const value = e.detail.value
			if (value && value.length > 32) {
				uni.showToast({
					title: '昵称最多32个字符',
					icon: 'none'
				})
				this.userInfo.name = value.slice(0, 32)
			}
		},
		
		async saveProfile() {
			try {
				// 验证昵称长度
				if (this.userInfo.name && this.userInfo.name.length > 32) {
					throw new Error('昵称最多32个字符')
				}
				
				// 构造要提交的数据，添加头像为空的判断
				const updateData = {
					name: this.userInfo.name,
					avatar: this.userInfo.avatar ? (
						this.userInfo.avatar.startsWith('/profile') ? 
						this.userInfo.avatar : 
						'/profile' + this.userInfo.avatar
					) : '',
					phone: this.userInfo.phone
				}
				
				const res = await api.user.updateProfile(updateData)
				if (res.code === 200) {
					// 更新本地存储时保持前端使用的字段名
					uni.setStorageSync('userInfo', JSON.stringify(this.userInfo))
					
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					})
					
					setTimeout(() => {
						const pages = getCurrentPages()
						const prevPage = pages[pages.length - 2]
						if (prevPage && typeof prevPage.checkLoginStatus === 'function') {
							prevPage.checkLoginStatus()
						}
						uni.navigateBack()
					}, 1500)
				} else {
					throw new Error(res.msg || '保存失败')
				}
			} catch (err) {
				uni.showToast({
					title: err.message || '保存失败',
					icon: 'none'
				})
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	background: #F7F8FC;
}

.form-content {
	margin-top: 20rpx;
	background: #fff;
	
	.form-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #eee;
		
		.label {
			font-size: 28rpx;
			color: #333;
			width: 140rpx;
		}
		
		input {
			flex: 1;
			font-size: 28rpx;
			color: #333;
		}
		
		.input-placeholder {
			color: #999;
		}
		
		.arrow {
			width: 24rpx;
			height: 24rpx;
			margin-left: 10rpx;
		}
		
		.phone-text {
			flex: 1;
			font-size: 28rpx;
			color: #333;
		}
		
		.phone-text-btn {
			flex: 1;
			font-size: 28rpx;
			color: #333;
			text-align: left;
			background: none;
			padding: 0;
			margin: 0;
			line-height: 1;
			
			&::after {
				border: none;
			}
		}
		
		.bind-btn {
			font-size: 24rpx;
			color: #4468E8;
			background: none;
			padding: 0;
			margin: 0;
			line-height: 1;
			
			&::after {
				border: none;
			}
		}
		
		&.avatar-item {
			.avatar-wrapper {
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: space-between;
				background: none;
				padding: 0;
				margin: 0;
				line-height: 1;
				
				&::after {
					border: none;
				}
				
				.avatar {
					width: 100rpx;
					height: 100rpx;
					border-radius: 50%;
				}
			}
		}
	}
}

.save-btn {
	width: 90%;
	height: 88rpx;
	line-height: 88rpx;
	background: #4468E8;
	color: #fff;
	font-size: 32rpx;
	border-radius: 44rpx;
	margin-top: 60rpx;
	
	&::after {
		border: none;
	}
}
</style> 