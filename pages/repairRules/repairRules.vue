<template>
	<view class="rules-container">
		<view class="rules-content">
			<view class="rules-section">
				<view class="section-title">一、报修流程</view>
				<view class="section-item">1. 选择报修方式（抢单报修/指定报修）</view>
				<view class="section-item">2. 填写故障信息</view>
				<view class="section-item">3. 等待维修人员接单</view>
				<view class="section-item">4. 维修完成后支付费用</view>
			</view>
			
			<view class="rules-section">
				<view class="section-title">二、服务说明</view>
				<view class="section-item">1. 抢单报修：系统将为您匹配附近的维修人员</view>
				<view class="section-item">2. 指定报修：您可以自主选择维修商家</view>
				<view class="section-item">3. 维修费用由维修人员根据实际情况确定</view>
				<view class="section-item">4. 服务时间：7:00-22:00</view>
			</view>
			
			<view class="rules-section">
				<view class="section-title">三、注意事项</view>
				<view class="section-item">1. 请确保填写的故障信息准确</view>
				<view class="section-item">2. 维修过程中请保持电话畅通</view>
				<view class="section-item">3. 如需取消订单，请提前与维修人员沟通</view>
				<view class="section-item">4. 如遇到问题可联系客服处理</view>
			</view>
			
			<view class="rules-section">
				<view class="section-title">四、服务保障</view>
				<view class="section-item">1. 专业维修人员，持证上岗</view>
				<view class="section-item">2. 明码标价，费用透明</view>
				<view class="section-item">3. 售后保修30天</view>
				<view class="section-item">4. 全程订单监督</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			
		}
	}
</script>

<style lang="scss" scoped>
	.rules-container {
		min-height: 100vh;
		background-color: #f8f8f8;
		padding: 20rpx;
	}
	
	.rules-content {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 30rpx;
	}
	
	.rules-section {
		margin-bottom: 40rpx;
		
		&:last-child {
			margin-bottom: 0;
		}
	}
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		position: relative;
		padding-left: 24rpx;
		
		&::before {
			content: '';
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
			width: 6rpx;
			height: 28rpx;
			background-color: #4468E8;
			border-radius: 3rpx;
		}
	}
	
	.section-item {
		font-size: 28rpx;
		color: #666;
		line-height: 1.8;
		padding-left: 24rpx;
		position: relative;
		margin-bottom: 16rpx;
		
		&:last-child {
			margin-bottom: 0;
		}
	}
</style> 