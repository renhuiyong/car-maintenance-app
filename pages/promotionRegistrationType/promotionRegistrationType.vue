<template>
	<view class="container">
		<view class="content">
			<view class="header">
				<text class="title">选择身份</text>
				<text class="subtitle">开启您的专属服务</text>
			</view>
			
			<view class="cards">
				<view class="type-card user-card" :class="{'card-active': activeCard === 'user'}" @click="handleCardClick('user')">
					<view class="card-inner">
						<view class="card-header">
							<view class="icon-box">
								<uni-icons type="person-filled" size="36" color="#4468E8"></uni-icons>
							</view>
							<view class="header-text">
								<text class="type-title">用户</text>
								<text class="type-badge">USER</text>
							</view>
						</view>
						
						<view class="card-body">
							<text class="type-desc">注册成为用户，享受便捷的维修服务</text>
							<view class="features">
								<view class="feature-item">
									<uni-icons type="checkbox-filled" size="16" color="#4468E8"></uni-icons>
									<text>在线预约维修</text>
								</view>
								<view class="feature-item">
									<uni-icons type="checkbox-filled" size="16" color="#4468E8"></uni-icons>
									<text>查找附近门店</text>
								</view>
								<view class="feature-item">
									<uni-icons type="checkbox-filled" size="16" color="#4468E8"></uni-icons>
									<text>一键呼叫救援</text>
								</view>
							</view>
						</view>
						
						<view class="card-footer">
							<view class="select-btn" :animation="userScaleAnim" @click.stop="handleTypeSelect('user')">
								<text>选择注册</text>
								<uni-icons type="right" size="14" color="#FFFFFF"></uni-icons>
							</view>
						</view>
					</view>
				</view>
				
				<view class="type-card merchant-card" :class="{'card-active': activeCard === 'merchant'}" @click="handleCardClick('merchant')">
					<view class="card-inner">
						<view class="card-header">
							<view class="icon-box">
								<uni-icons type="shop-filled" size="36" color="#4468E8"></uni-icons>
							</view>
							<view class="header-text">
								<text class="type-title">商家</text>
								<text class="type-badge">MERCHANT</text>
							</view>
						</view>
						
						<view class="card-body">
							<text class="type-desc">注册成为商家，拓展您的业务</text>
							<view class="features">
								<view class="feature-item">
									<uni-icons type="checkbox-filled" size="16" color="#4468E8"></uni-icons>
									<text>店铺管理</text>
								</view>
								<view class="feature-item">
									<uni-icons type="checkbox-filled" size="16" color="#4468E8"></uni-icons>
									<text>订单管理</text>
								</view>
								<view class="feature-item">
									<uni-icons type="checkbox-filled" size="16" color="#4468E8"></uni-icons>
									<text>商家入驻</text>
								</view>
							</view>
						</view>
						
						<view class="card-footer">
							<view class="select-btn" :animation="merchantScaleAnim" @click.stop="handleTypeSelect('merchant')">
								<text>选择注册</text>
								<uni-icons type="right" size="14" color="#FFFFFF"></uni-icons>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<view class="footer">
			<text class="footer-text">注册即代表同意《用户协议》和《隐私政策》</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				activeCard: '',
				userScaleAnim: null,
				merchantScaleAnim: null,
				promotionCode: ''
			}
		},
		onLoad(options) {
			console.log('options:', options)
			// 处理场景值
			if(options.scene) {
				try {
					// 对scene参数进行解码
					const scene = decodeURIComponent(options.scene)
					// 解析scene中的参数
					const params = {}
					scene.split('&').forEach(item => {
						const [key, value] = item.split('=')
						params[key] = value
					})
					// 获取promotionCode
					if(params.promotionCode) {
						this.promotionCode = params.promotionCode
                        getApp().globalData.promotionCode = this.promotionCode;
					}
				} catch(e) {
					console.error('Scene解析错误:', e)
				}
			} else if(options.promotionCode) {
				this.promotionCode = options.promotionCode
			}
		},
		onReady() {
			this.userScaleAnim = uni.createAnimation({
				duration: 150,
				timingFunction: 'ease',
			})
			this.merchantScaleAnim = uni.createAnimation({
				duration: 150,
				timingFunction: 'ease',
			})
		},
		methods: {
			handleCardClick(type) {
				this.activeCard = type;
			},
			handleTypeSelect(type) {
				// 如果没有选中身份，先选中当前点击的身份
				if(!this.activeCard) {
					this.activeCard = type;
					// 延迟执行跳转，让用户看到选中效果
					setTimeout(() => {
						this.executeTypeSelect(type);
					}, 300);
					return;
				}
				
				this.executeTypeSelect(type);
			},
			// 抽取跳转逻辑到单独的方法
			executeTypeSelect(type) {
				// 执行按钮动画
				const anim = type === 'user' ? this.userScaleAnim : this.merchantScaleAnim;
				anim.scale(0.9).step()
				anim.scale(1).step()
				
				setTimeout(() => {
					if(type === 'user') {
						uni.switchTab({
							url: '/pages/index/index'
						})
					} else {
						uni.reLaunch({
							url: `/pages/merchant/merchant`
						})
					}
				}, 300);
			}
		}
	}
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	background: linear-gradient(to bottom, #F6F7FF, #FFFFFF);
	display: flex;
	flex-direction: column;
	padding: 40rpx;
	
	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 40rpx 0;
		
		.header {
			text-align: center;
			margin-bottom: 60rpx;
			
			.title {
				font-size: 52rpx;
				font-weight: 600;
				color: #333;
				margin-bottom: 16rpx;
				letter-spacing: 2rpx;
			}
			
			.subtitle {
				font-size: 28rpx;
				color: #666;
			}
		}
		
		.cards {
			display: flex;
			flex-direction: column;
			gap: 40rpx;
			
			.type-card {
				background: #FFFFFF;
				border-radius: 28rpx;
				overflow: hidden;
				transition: all 0.3s ease;
				border: 2rpx solid #F0F0F0;
				
				&.card-active {
					border-color: #4468E8;
					transform: translateY(-6rpx);
					box-shadow: 0 20rpx 40rpx rgba(68, 104, 232, 0.1);
					
					.select-btn {
						background: #4468E8;
						color: #FFFFFF;
					}
				}
				
				.card-inner {
					padding: 40rpx;
					
					.card-header {
						display: flex;
						align-items: center;
						margin-bottom: 40rpx;
						
						.icon-box {
							width: 96rpx;
							height: 96rpx;
							background: rgba(68, 104, 232, 0.1);
							border-radius: 48rpx;
							display: flex;
							align-items: center;
							justify-content: center;
							margin-right: 24rpx;
						}
						
						.header-text {
							flex: 1;
							
							.type-title {
								font-size: 44rpx;
								font-weight: 600;
								color: #333;
								margin-bottom: 8rpx;
								display: block;
							}
							
							.type-badge {
								font-size: 20rpx;
								color: #4468E8;
								background: rgba(68, 104, 232, 0.1);
								padding: 4rpx 16rpx;
								border-radius: 20rpx;
							}
						}
					}
					
					.card-body {
						margin-bottom: 40rpx;
						
						.type-desc {
							font-size: 28rpx;
							color: #666;
							margin-bottom: 32rpx;
							display: block;
						}
						
						.features {
							display: flex;
							flex-direction: column;
							gap: 20rpx;
							
							.feature-item {
								display: flex;
								align-items: center;
								gap: 12rpx;
								
								text {
									font-size: 28rpx;
									color: #333;
								}
							}
						}
					}
					
					.card-footer {
						display: flex;
						justify-content: flex-end;
						
						.select-btn {
							display: flex;
							align-items: center;
							gap: 8rpx;
							background: #4468E8;
							padding: 16rpx 32rpx;
							border-radius: 32rpx;
							transition: all 0.3s ease;
							
							&:active {
								transform: scale(0.95);
								opacity: 0.9;
							}
							
							text {
								font-size: 26rpx;
								color: #FFFFFF;
							}
						}
					}
				}
			}
		}
	}
	
	.footer {
		padding: 40rpx 0;
		text-align: center;
		
		.footer-text {
			font-size: 24rpx;
			color: #999;
		}
	}
}
</style>
