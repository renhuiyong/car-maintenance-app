<template>
	<view class="loading-container" v-if="show">
		<view class="loading-dots">
			<view class="dot"></view>
			<view class="dot"></view>
			<view class="dot"></view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'loading-animation',
	props: {
		show: {
			type: Boolean,
			default: false
		}
	}
}
</script>

<style scoped>
.loading-container {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.12);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 9999;
	animation: fadeIn 0.15s ease-out;
}

.loading-dots {
	display: flex;
	align-items: center;
	gap: 18rpx;
	transform: scale(1.15);
}

.dot {
	width: 18rpx;
	height: 18rpx;
	background: linear-gradient(135deg, #4468E8, #6C8AFF);
	border-radius: 50%;
	animation: bounce 0.65s cubic-bezier(0.3, 0.1, 0.3, 1) infinite;
}

.dot:nth-child(1) {
	animation-delay: 0s;
	opacity: 0.95;
}

.dot:nth-child(2) {
	animation-delay: 0.15s;
	opacity: 0.85;
}

.dot:nth-child(3) {
	animation-delay: 0.3s;
	opacity: 0.75;
}

@keyframes bounce {
	0%, 100% {
		transform: translateY(0) scale(1);
	}
	50% {
		transform: translateY(-26rpx) scale(1.15);
		background: linear-gradient(135deg, #6C8AFF, #4468E8);
	}
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}
</style> 