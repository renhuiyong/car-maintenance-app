<template>
	<view class="container">
		<form @submit="handleSubmit">
			<view class="form-wrapper">
				<!-- 名称 -->
				<view class="form-item">
					<text class="label">名称</text>
					<input type="text" v-model="formData.name" placeholder="请输入商品名称" placeholder-class="placeholder" class="input" />
				</view>
				
				<!-- 类别 -->
				<view class="form-item">
					<text class="label">类别</text>
					<picker @change="handleCategoryChange" :value="formData.categoryIndex" :range="categories" range-key="name" class="picker-wrapper">
						<view class="picker">
							<text :class="{'placeholder': formData.categoryIndex === -1}">
								{{formData.categoryIndex > -1 ? categories[formData.categoryIndex].name : '请选择配件类别'}}
							</text>
							<text class="picker-arrow">></text>
						</view>
					</picker>
				</view>
				
				<!-- 参数 -->
				<view class="form-item">
					<text class="label">参数</text>
					<input type="text" v-model="formData.param" placeholder="请输入配件参数" placeholder-class="placeholder" class="input" />
				</view>
				
				<!-- 型号 -->
				<view class="form-item">
					<text class="label">型号</text>
					<input type="text" v-model="formData.model" placeholder="请输入配件型号" placeholder-class="placeholder" class="input" />
				</view>
				
				<!-- 品牌（改为多选） -->
				<view class="form-item form-item-vertical">
					<text class="label">品牌</text>
					<view class="brand-select">
						<view 
							v-for="(brand, index) in brands" 
							:key="brand.id"
							class="brand-item"
							:class="{ active: selectedBrands.includes(brand.id) }"
							@tap="toggleBrand(brand.id)"
						>
							{{ brand.name }}
						</view>
					</view>
				</view>
				
				<!-- 价格 -->
				<view class="form-item">
					<text class="label">价格</text>
					<input type="digit" v-model="formData.price" placeholder="¥10" placeholder-class="placeholder" class="input" />
				</view>
				
				<!-- 商品详情 -->
				<view class="form-item form-item-vertical">
					<text class="label">商品详情</text>
					<view class="rich-text-preview" :class="{ 'placeholder': !formData.details }" @tap.stop="goToRichText">
						<text v-if="formData.details">已填写商品详情</text>
						<text v-else>请输入商品详情情况</text>
					</view>
				</view>
				
				<!-- 上传商品图片 -->
				<view class="form-item form-item-vertical">
					<text class="label">上传商品图片</text>
					<view class="upload-box" @tap="chooseImage">
						<image v-if="formData.image" :src="getImageUrl(formData.image)" mode="aspectFit" class="preview-image"></image>
						<image v-else src="/static/images/xiangji.png" mode="aspectFit" class="camera-icon"></image>
					</view>
				</view>
			</view>
			
			<!-- 提交按钮 -->
			<button form-type="submit" class="submit-btn">保存</button>
		</form>
	</view>
</template>

<script>
	import api from '@/api/index.js'
	import request from '@/utils/request.js'
	
	export default {
		data() {
			return {
				formData: {
					name: '',
					categoryIndex: -1,
					selectedBrands: [],
					param: '',
					model: '',
					price: '',
					details: '',
					image: ''
				},
				categories: [],
				brands: [],
				currentCategoryId: '',
				currentBrandId: '',
				selectedBrands: [],
				isEdit: false,
				editId: ''
			}
		},
		onLoad(options) {
			// 打印接收到的原始参数
			console.log('接收到的原始参数:', options)
			
			try {
				// 解析传入的数组数据
				if (options.categories) {
					const decodedCategories = decodeURIComponent(options.categories)
					console.log('解码后的类别数据:', decodedCategories)
					this.categories = JSON.parse(decodedCategories)
					console.log('解析后的类别数组:', this.categories)
				}
				if (options.brands) {
					const decodedBrands = decodeURIComponent(options.brands)
					console.log('解码后的品牌数据:', decodedBrands)
					this.brands = JSON.parse(decodedBrands)
					console.log('解析后的品牌数组:', this.brands)
				}
				
				// 保存当前选中的ID
				this.currentCategoryId = options.currentCategoryId || ''
				this.currentBrandId = options.currentBrandId || ''
				
				// 检查是否是编辑模式
				if (options.id) {
					this.isEdit = true
					this.editId = options.id
					this.fetchProductDetail(options.id)
				} else {
					// 如果是新增模式，设置初始选中状态
					this.setInitialSelection()
				}
				
			} catch (error) {
				console.error('解析参数出错:', error)
				uni.showToast({
					title: '参数解析失败',
					icon: 'none'
				})
			}
		},
		methods: {
			// 切换品牌选中状态
			toggleBrand(brandId) {
				const index = this.selectedBrands.indexOf(brandId)
				if (index === -1) {
					this.selectedBrands.push(brandId)
				} else {
					this.selectedBrands.splice(index, 1)
				}
				this.formData.selectedBrands = [...this.selectedBrands]
			},
			
			// 设置初始选中状态
			setInitialSelection() {
				// 设置类别选中状态
				if (this.currentCategoryId) {
					const index = this.categories.findIndex(cat => cat.id === this.currentCategoryId)
					if (index !== -1) {
						this.formData.categoryIndex = index
					}
				}
				
				// 设置品牌选中状态
				if (this.currentBrandId && this.currentBrandId !== 'all') {
					this.selectedBrands = [this.currentBrandId]
					this.formData.selectedBrands = [this.currentBrandId]
				}
			},
			
			handleCategoryChange(e) {
				this.formData.categoryIndex = e.detail.value
			},
			handleBrandChange(e) {
				this.formData.brandIndex = e.detail.value
			},
			chooseImage() {
				uni.chooseImage({
					count: 1,
					success: (res) => {
						uni.showLoading({
							title: '上传中...'
						})
						
						// 使用common.uploadFile上传图片
						api.common.uploadFile(res.tempFilePaths[0]).then(response => {
							console.log('上传图片返回:', response)
							if (response && response.fileName) {
								// 保存文件路径
								this.formData.image = response.fileName
								uni.hideLoading()
								uni.showToast({
									title: '上传成功',
									icon: 'success'
								})
							} else {
								uni.showToast({
									title: '图片上传失败',
									icon: 'none'
								})
								uni.hideLoading()
							}
						}).catch(err => {
							console.error('上传图片失败:', err)
							uni.showToast({
								title: '图片上传失败',
								icon: 'none'
							})
							uni.hideLoading()
						})
					}
				})
			},
			// 获取图片完整URL
			getImageUrl(path) {
				if (!path) return ''
				return path.startsWith('http') ? path : request.BASE_URL + path
			},
			handleSubmit() {
				// 表单验证
				if (!this.formData.name.trim()) {
					uni.showToast({
						title: '请输入商品名称',
						icon: 'none'
					})
					return
				}
				if (this.formData.categoryIndex === -1) {
					uni.showToast({
						title: '请选择配件类别',
						icon: 'none'
					})
					return
				}
				if (!this.formData.selectedBrands.length) {
					uni.showToast({
						title: '请选择品牌',
						icon: 'none'
					})
					return
				}
				if (!this.formData.price) {
					uni.showToast({
						title: '请输入价格',
						icon: 'none'
					})
					return
				}
				if (!this.formData.image) {
					uni.showToast({
						title: '请上传商品图片',
						icon: 'none'
					})
					return
				}

				// 准备提交的数据
				const selectedCategory = this.categories[this.formData.categoryIndex]
				const submitData = {
					name: this.formData.name,
					typeId: selectedCategory.id,
					typeName: selectedCategory.name,
					carmodelIds: this.formData.selectedBrands.join(','),
					parameter: this.formData.param,
					model: this.formData.model,
					costprice: Number(this.formData.price),
					details: this.formData.details,
					imageUrl: this.formData.image
				}

				// 如果是编辑模式，添加ID
				if (this.isEdit) {
					submitData.id = this.editId
				}

				console.log('准备提交的数据:', submitData)
				
				// 根据是否是编辑模式调用不同的接口
				const apiCall = this.isEdit ? 
					api.supplyChain.updateAccessory(submitData) : 
					api.supplyChain.addAccessory(submitData)
				
				apiCall.then(res => {
					if (res.code === 200) {
						uni.showToast({
							title: this.isEdit ? '修改成功' : '添加成功',
							icon: 'success'
						})
						setTimeout(() => {
							if (this.isEdit) {
								// 如果是修改，直接返回上一页
								uni.navigateBack()
							} else {
								// 如果是新增，发送刷新事件并返回
								uni.$emit('refreshShopList')
								uni.navigateBack()
							}
						}, 1500)
					} else {
						uni.showToast({
							title: res.msg || (this.isEdit ? '修改失败' : '添加失败'),
							icon: 'none'
						})
					}
				}).catch(err => {
					console.error(this.isEdit ? '修改配件失败:' : '添加配件失败:', err)
					uni.showToast({
						title: this.isEdit ? '修改失败' : '添加失败',
						icon: 'none'
					})
				})
			},
			// 跳转到富文本编辑页面
			goToRichText() {
				console.log('点击富文本编辑')
				uni.navigateTo({
					url: `/packageMerchant/pages/richTextEditor/richTextEditor?content=${encodeURIComponent(this.formData.details || '')}`
				})
			},
			// 更新商品详情内容
			updateDescription(content) {
				console.log('接收到富文本内容:', content)
				this.formData.details = content
			},
			// 获取商品详情
			fetchProductDetail(id) {
				uni.showLoading({
					title: '加载中...'
				})
				
				api.supplyChain.getAccessoryDetail({
					id: id
				}).then(res => {
					if (res.code === 200) {
						const data = res.data
						
						// 设置表单数据
						this.formData.name = data.name
						this.formData.param = data.parameter || ''
						this.formData.model = data.model || ''
						this.formData.price = data.price || ''
						this.formData.details = data.details || ''
						this.formData.image = data.image || ''
						
						// 设置分类
						const categoryIndex = this.categories.findIndex(cat => cat.id === data.categoryId)
						if (categoryIndex !== -1) {
							this.formData.categoryIndex = categoryIndex
						}
						
						// 设置品牌
						if (data.brand) {
							const brandIds = data.brand.split(',')
							this.selectedBrands = brandIds
							this.formData.selectedBrands = brandIds
						}
						
					} else {
						uni.showToast({
							title: res.msg || '获取商品详情失败',
							icon: 'none'
						})
					}
				}).catch(err => {
					console.error('获取商品详情失败:', err)
					uni.showToast({
						title: '获取商品详情失败',
						icon: 'none'
					})
				}).finally(() => {
					uni.hideLoading()
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
.container {
	padding: 0;
	background-color: #f5f5f5;
	min-height: 100vh;
	padding-bottom: 160rpx;
	position: relative;
}

.form-wrapper {
	margin: 20rpx;
	background-color: #fff;
	border-radius: 12rpx;
}

.form-item {
	display: flex;
	align-items: center;
	padding: 28rpx 24rpx;
	background-color: #fff;
	
	&:not(:last-child) {
		border-bottom: 1rpx solid #f5f5f5;
	}
	
	.label {
		width: 140rpx;
		font-size: 28rpx;
		color: #333;
		font-weight: 600;
	}
	
	.input {
		flex: 1;
		height: 44rpx;
		font-size: 28rpx;
		padding: 0 20rpx;
	}
	
	.picker-wrapper {
		flex: 1;
	}
	
	.picker {
		height: 44rpx;
		line-height: 44rpx;
		font-size: 28rpx;
		padding: 0 20rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		.picker-arrow {
			color: #ccc;
			font-size: 24rpx;
			transform: rotate(90deg);
		}
	}
}

.form-item-vertical {
	align-items: flex-start;
	flex-direction: column;
	
	.label {
		width: auto;
		margin-bottom: 16rpx;
	}
	
	.textarea {
		width: 100%;
		min-height: 60rpx;
		height: 60rpx;
		font-size: 28rpx;
		padding: 0;
		background-color: #fff;
	}
	
	.upload-box {
		margin-left: 0;
		width: 160rpx;
		height: 160rpx;
		border: 1rpx solid #eee;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #fff;
		
		.preview-image {
			width: 100%;
			height: 100%;
			border-radius: 8rpx;
		}
		
		.camera-icon {
			width: 48rpx;
			height: 48rpx;
		}
	}
}

.placeholder {
	color: #999;
}

.submit-btn {
	position: fixed;
	left: 20rpx;
	right: 20rpx;
	bottom: 40rpx;
	width: auto;
	height: 88rpx;
	line-height: 88rpx;
	background: linear-gradient(to right, #ff9933, #ff8833);
	color: #fff;
	border-radius: 44rpx;
	font-size: 32rpx;
	font-weight: 500;
	box-shadow: 0 4rpx 12rpx rgba(255, 153, 51, 0.3);
	z-index: 100;
	
	&:active {
		opacity: 0.9;
		transform: translateY(2rpx);
	}
}

.brand-select {
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
	padding: 10rpx 0;
}

.brand-item {
	padding: 12rpx 24rpx;
	background-color: #f5f5f5;
	border-radius: 8rpx;
	font-size: 28rpx;
	color: #666;
	transition: all 0.3s ease;
	
	&.active {
		background-color: #ff9933;
		color: #fff;
	}
	
	&:active {
		opacity: 0.8;
	}
}

.rich-text-preview {
	width: 100%;
	min-height: 60rpx;
	padding: 16rpx 20rpx;
	background-color: #fff;
	font-size: 28rpx;
	color: #333;
	position: relative;
	display: flex;
	align-items: center;
	border: 1rpx solid #eee;
	border-radius: 8rpx;
	
	&.placeholder {
		color: #999;
	}
	
	&:active {
		opacity: 0.7;
	}
}
</style>
