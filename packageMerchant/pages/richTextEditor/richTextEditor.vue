<template>
	<view class="container">
		<editor
			id="editor"
			class="editor"
			:placeholder="placeholder"
			@ready="onEditorReady"
			@input="onEditorInput"
		></editor>
		
		<view class="toolbar" :style="{ bottom: keyboardHeight + 'px' }">
			<!-- 格式工具栏 -->
			<scroll-view scroll-x class="format-toolbar">
                <view class="toolbar-item" @tap="removeFormat">
					<text>清除样式</text>
				</view>
                <view class="toolbar-item" @tap="insertImage">
					<text>图片</text>
				</view>
				<view class="toolbar-item" @tap="undo">
					<text>撤销</text>
				</view>
				<view class="toolbar-item" @tap="clearContent">
					<text>清空</text>
				</view>
                <view class="toolbar-item" @tap="format('align', 'left')">
					<text :class="{ active: formats.align === 'left' }">左</text>
				</view>
				<view class="toolbar-item" @tap="format('align', 'center')">
					<text :class="{ active: formats.align === 'center' }">中</text>
				</view>
				<view class="toolbar-item" @tap="format('align', 'right')">
					<text :class="{ active: formats.align === 'right' }">右</text>
				</view>
                <view class="toolbar-item" @tap="insertDivider">
					<text>—</text>
				</view>
				<view class="toolbar-item" @tap="format('bold')">
					<text :class="{ active: formats.bold }">B</text>
				</view>
				<view class="toolbar-item" @tap="format('italic')">
					<text :class="{ active: formats.italic }">I</text>
				</view>
				<view class="toolbar-item" @tap="format('underline')">
					<text :class="{ active: formats.underline }">U</text>
				</view>
				<view class="toolbar-item" @tap="format('strike')">
					<text :class="{ active: formats.strike }">S</text>
				</view>
			</scroll-view>
			
			<!-- 底部操作栏 -->
			<view class="bottom-bar">
				<button class="btn cancel" @tap="handleCancel">取消</button>
				<button class="btn confirm" @tap="handleConfirm">完成</button>
			</view>
		</view>
	</view>
</template>

<script>
import api from '@/api/index.js'
import request from '@/utils/request.js'

export default {
	data() {
		return {
			placeholder: '请输入商品详情...',
			editorCtx: null,
			keyboardHeight: 0,
			content: '',
			formats: {} // 当前格式状态
		}
	},
	onLoad(options) {
		// 直接从options中获取内容
		if (options.content) {
			this.content = decodeURIComponent(options.content)
		}
		
		uni.onKeyboardHeightChange(res => {
			this.keyboardHeight = res.height
		})
	},
	methods: {
		onEditorReady() {
			uni.createSelectorQuery().select('#editor').context((res) => {
				this.editorCtx = res.context
				if (this.content) {
					// 处理内容中的图片路径，添加BASE_URL_OSS
					const processedContent = this.content.replace(
						/src="([^"]+)"/g, 
						(match, fileName) => {
							if (fileName.startsWith('http')) return match
							return `src="${request.BASE_URL_OSS}${fileName}"`
						}
					)
					this.editorCtx.setContents({
						html: processedContent
					})
				}
			}).exec()
		},
		
		onEditorInput(e) {
			this.content = e.detail.html
		},
		
		// 格式化文本
		format(name, value) {
			this.editorCtx.format(name, value)
		},
		
		// 插入分割线
		insertDivider() {
			this.editorCtx.insertDivider({
				success: () => {
					console.log('插入分割线成功')
				}
			})
		},
		
		// 清除格式
		removeFormat() {
			this.editorCtx.removeFormat()
		},
		
		// 清空内容
		clearContent() {
			uni.showModal({
				title: '提示',
				content: '确定要清空所有内容吗？',
				success: (res) => {
					if (res.confirm) {
						this.editorCtx.clear({
							success: (res) => {
								this.content = ''
								uni.showToast({
									title: '已清空',
									icon: 'none'
								})
							}
						})
					}
				}
			})
		},
		
		// 插入图片
		insertImage() {
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
							// 插入图片到编辑器，显示时使用完整URL
							this.editorCtx.insertImage({
								src: request.BASE_URL_OSS + response.fileName,
								width: '100%',
								success: () => {
									console.log('插入图片成功')
									// 手动获取编辑器内容
									this.editorCtx.getContents({
										success: (res) => {
											console.log('获取内容成功:', res.html)
											this.content = res.html
										}
									})
									uni.hideLoading()
								}
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
		
		// 撤销
		undo() {
			this.editorCtx.undo()
		},
		
		handleConfirm() {
			// 在保存内容时，将完整URL转换回相对路径
			const processedContent = this.content.replace(
				new RegExp(`src="${request.BASE_URL_OSS}([^"]+)"`, 'g'),
				'src="$1"'
			)
			
			// 使用页面返回传参
			const pages = getCurrentPages()
			const prevPage = pages[pages.length - 2]  // 获取上一个页面
			// 调用上一个页面的方法，传递处理后的内容
			prevPage.$vm.updateDescription(processedContent)
			uni.navigateBack()
		},
		
		handleCancel() {
			uni.navigateBack()
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #fff;
}

.editor {
	flex: 1;
	padding: 20rpx;
	overflow-y: auto;
}

.toolbar {
	background-color: #f8f8f8;
	border-top: 1rpx solid #eee;
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
}

.format-toolbar {
	padding: 10rpx;
	white-space: nowrap;
	border-bottom: 1rpx solid #eee;
	
	.toolbar-item {
		display: inline-block;
		padding: 16rpx 20rpx;
		text-align: center;
		font-size: 28rpx;
		color: #666;
		
		text {
			display: inline-block;
			min-width: 48rpx;
			
			&.active {
				color: #ff9933;
			}
		}
	}
}

.bottom-bar {
	display: flex;
	padding: 20rpx;
	justify-content: space-between;
	
	.btn {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		font-size: 32rpx;
		border-radius: 8rpx;
		margin: 0 10rpx;
		
		&.cancel {
			background-color: #f5f5f5;
			color: #666;
		}
		
		&.confirm {
			background: linear-gradient(to right, #ff9933, #ff8833);
			color: #fff;
		}
	}
}
</style> 