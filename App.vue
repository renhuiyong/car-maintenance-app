<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */

	/* #ifdef MP-WEIXIN */
	page {
		height: 100%;
		overflow: hidden;
	}

	/* 移除所有输入框的默认样式 */
	input {
		outline: 0;
		border: 0;
		margin: 0;
		padding: 0;
		-webkit-appearance: none;
		background-color: transparent;
		font-size: 32rpx !important;
	}

	/* 统一设置输入框占位符样式 */
	input::placeholder,
	input::-webkit-input-placeholder {
		color: #999999 !important;
		font-size: 32rpx !important;
		font-family: inherit !important;
	}

	/* 兼容不同浏览器的占位符样式 */
	input::-moz-placeholder {
		color: #999999 !important;
		font-size: 32rpx !important;
		font-family: inherit !important;
	}

	input:-ms-input-placeholder {
		color: #999999 !important;
		font-size: 32rpx !important;
		font-family: inherit !important;
	}

	/* 移除输入框��击时的所有默认效果 */
	input,
	input:focus,
	input:active,
	input:hover {
		outline: 0 !important;
		border: 0 !important;
		box-shadow: none !important;
		-webkit-appearance: none !important;
		background-color: transparent !important;
		-webkit-tap-highlight-color: transparent !important;
	}

	/* 移除所有元素的点击高亮效果 */
	* {
		-webkit-tap-highlight-color: transparent;
	}
	/* #endif */

	/* #ifdef H5 */
	uni-page-wrapper {
		 overflow: hidden !important;
	}
	/* #endif */

	/* #ifdef APP-PLUS */
	.uni-page-wrapper {
		overflow: hidden !important;
	}
	/* #endif */

	/* 重置默认样式 */
	view, scroll-view {
		box-sizing: border-box;
	}
</style>
