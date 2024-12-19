<template>
	<view class="container">
		<!-- 商品详情 -->
		<view class="product-info">
			<image class="product-image" :src="product.image" mode="aspectFit" @error="handleImageError"></image>
			<view class="info-content">
				<view class="info-header">
					<view class="info-left">
						<view class="title">{{ product.name }}</view>
						<view class="price">¥{{ product.price }}/件</view>
					</view>
					<view class="info-right">
						<text class="stock">库存{{ product.stock }}</text>
						<button class="share-btn" open-type="share">
							<image class="share-icon" src="/static/images/share.png" mode="aspectFit"></image>
						</button>
					</view>
				</view>
				<view class="product-params">
					<view class="param-item">
						<text class="param-label">型号：</text>
						<text class="param-value">{{ product.model }}</text>
					</view>
					<view class="param-item">
						<text class="param-label">参数：</text>
						<text class="param-value">{{ product.parameter }}</text>
					</view>
					<view class="param-item">
						<text class="param-label">适用品牌：</text>
						<text class="param-value">{{ brandNames || '暂无品牌信息' }}</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 商品详情 -->
		<view class="detail-section">
			<view class="section-title">商品详情</view>
			<view class="detail-content">
				<rich-text :nodes="product.details || '暂无商品详情'" :style="{wordBreak: 'break-all'}"></rich-text>
			</view>
		</view>
	</view>
</template>

<script>
import request from '@/utils/request.js'
import api from '@/api/index.js'

export default {
	data() {
		return {
			product: {
				id: '',
				name: '',
				price: 0,
				image: '',
				details: '',
				stock: 0,
				model: '',
				parameter: '',
				brand: ''
			},
			brandList: [],
			brandNames: ''
		}
	},
	// 添加分享配置
	onShareAppMessage() {
		return {
			title: this.product.name,
			path: `/pages/merchantProductDetail/merchantProductDetail?id=${this.product.id}`,
			imageUrl: this.product.image
		}
	},
	onLoad(options) {
		console.log('接收到的参数：', options);
		// 先获取品牌列��
		this.getBrandList();
		if (options.id) {
			this.getProductDetail(options.id);
		}
	},
	methods: {
		// 获取品牌列表
		getBrandList() {
			api.shop.selectModelsList().then(res => {
				if (res.code === 200) {
					this.brandList = res.data || [];
					// 如果已经有商品数据，更新品牌名称
					if (this.product.brand) {
						this.updateBrandNames();
					}
				} else {
					console.error('获取品牌列表失败:', res.msg);
				}
			}).catch(err => {
				console.error('获取品牌列表失败:', err);
			});
		},
		
		// 更新品牌名称
		updateBrandNames() {
			if (!this.product.brand || !this.brandList.length) return;
			
			const brandIds = this.product.brand.split(',');
			const names = brandIds.map(id => {
				const brand = this.brandList.find(item => item.id.toString() === id.toString());
				return brand ? brand.title : '';
			}).filter(Boolean);
			
			this.brandNames = names.length ? names.join('、') : '暂无品牌信息';
		},
		
		// 获取商品详情
		getProductDetail(id) {
			uni.showLoading({
				title: '加载中...'
			});
			
			api.shop.getAccessory({
				id: id
			}).then(res => {
				if (res.code === 200) {
					const data = res.data;
					this.product = {
						id: data.id,
						name: data.name,
						price: data.price,
						image: data.image ? request.BASE_URL + data.image : '/static/products/shangpin_default.png',
						details: data.details || '暂无商品详情',
						stock: data.stock || 0,
						model: data.model || '暂无型号',
						parameter: data.parameter || '暂无参数',
						brand: data.brand || ''
					};
					// 更新品牌名称
					this.updateBrandNames();
				} else {
					uni.showToast({
						title: res.msg || '获取商品详情失败',
						icon: 'none'
					});
				}
			}).catch(err => {
				console.error('获取商品详情失败:', err);
				uni.showToast({
					title: '获取商品详情失败',
					icon: 'none'
				});
			}).finally(() => {
				uni.hideLoading();
			});
		},
		
		handleImageError(e) {
			console.log('图片加载失败：', e);
			this.product.image = '/static/products/shangpin_default.png'
		}
	}
}
</script>

<style>
.container {
	padding-bottom: 20rpx;
	background-color: #F6F6F6;
	min-height: 100vh;
}

.product-info {
	background: #fff;
	padding: 30rpx;
	margin: 20rpx;
	border-radius: 16rpx;
}

.product-image {
	width: 100%;
	height: 500rpx;
	border-radius: 12rpx;
}

.info-content {
	padding: 30rpx 0;
}

.info-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 30rpx;
}

.info-left {
	flex: 1;
}

.info-right {
	text-align: right;
	padding-left: 30rpx;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}

.title {
	font-size: 36rpx;
	margin-bottom: 16rpx;
	font-weight: bold;
	color: #333;
	padding-right: 20rpx;
	line-height: 1.4;
}

.price {
	font-size: 40rpx;
	color: #ff6b6b;
	font-weight: bold;
}

.stock {
	font-size: 28rpx;
	color: #999;
	margin-top: 8rpx;
}

.product-params {
	padding: 30rpx 0;
	border-top: 1rpx solid #eee;
}

.param-item {
	display: flex;
	margin-bottom: 20rpx;
	font-size: 30rpx;
	line-height: 48rpx;
}

.param-item:last-child {
	margin-bottom: 0;
}

.param-label {
	color: #666;
	width: 160rpx;
	flex-shrink: 0;
}

.param-value {
	color: #333;
	flex: 1;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.detail-section {
	margin: 20rpx;
	padding: 30rpx;
	background: #fff;
	border-radius: 16rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
	position: relative;
	padding-left: 20rpx;
}

.section-title::before {
	content: '';
	position: absolute;
	left: 0;
	top: 50%;
	transform: translateY(-50%);
	width: 6rpx;
	height: 28rpx;
	background: #ff6b6b;
	border-radius: 3rpx;
}

.detail-content {
	font-size: 28rpx;
	line-height: 1.6;
	color: #666;
}

.share-btn {
	margin-top: 16rpx;
	background: none;
	border: none;
	padding: 0;
	line-height: 1;
	width: 56rpx;
	height: 56rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.share-btn::after {
	border: none;
}

.share-icon {
	width: 56rpx;
	height: 56rpx;
}
</style> 