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
					<image class="avatar" :src="userInfo.avatar || '/static/my/default-avatar.png'"></image>
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
				/>
				<image class="arrow" src="/static/images/youjiantou2.png"></image>
			</view>
			
			<!-- 手机号 -->
			<view class="form-item">
				<text class="label">手机号</text>
				<text class="phone-text">{{ userInfo.phone || '未绑定' }}</text>
				<view v-if="!userInfo.phone" class="bind-btn" @click="bindPhone">
					绑定手机号
				</view>
				<image v-else class="arrow" src="/static/images/youjiantou2.png"></image>
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
			}
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
				// 先上传图片
				const uploadRes = await new Promise((resolve, reject) => {
					uni.uploadFile({
						url: request.baseUrl + '/api/upload/file',
						filePath: e.detail.avatarUrl,
						name: 'file',
						header: {
							'token': uni.getStorageSync('token')
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
					throw new Error(uploadRes.message || '上传失败')
				}

				this.userInfo.avatar = uploadRes.data.url
			} catch (err) {
                uni.showToast({
					title: JSON.stringify(err),
					icon: 'none'
				})
				// uni.showToast({
				// 	title: err.message || '更新头像失败',
				// 	icon: 'none'
				// })
			}
		},
		
		bindPhone() {
			// 跳转到手机号绑定页面
			uni.navigateTo({
				url: '/pages/bindPhone/bindPhone'
			})
		},
		
		async saveProfile() {
			try {
				console.log(api.user.updateProfile)
				const res = await api.user.updateProfile(this.userInfo)
				if (res.code === 200) {
					// 更新本地存储
					uni.setStorageSync('userInfo', JSON.stringify(this.userInfo))
					
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					})
					
					// 返回上一页并刷新
					setTimeout(() => {
						const pages = getCurrentPages()
						const prevPage = pages[pages.length - 2]
						prevPage.checkLoginStatus()
						uni.navigateBack()
					}, 1500)
				} else {
					throw new Error(res.message || '保存失败')
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
		
		.bind-btn {
			font-size: 24rpx;
			color: #4468E8;
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