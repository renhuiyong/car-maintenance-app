<template>
  <view class="merchant-settled">
    <!-- 顶部标题栏 -->
    <view class="nav-tabs">
      <view 
        v-for="(item, index) in tabs" 
        :key="index"
        :class="['tab-item', currentTab === index ? 'active' : '']"
        @tap="switchTab(index)"
      >
        {{item}}
      </view>
    </view>
    
    <!-- 店铺信息表单 -->
    <transition name="fade-slide">
      <view class="form-section" v-if="currentTab === 0">
        <view class="form-item">
          <text class="label">店铺名称</text>
          <input 
            class="input" 
            v-model="formData.shopName"
            placeholder="请输入店铺名称"
            placeholder-class="placeholder"
            maxlength="16"
          />
        </view>
        
        <view class="form-item">
          <text class="label">联系人</text>
          <input 
            class="input" 
            v-model="formData.contact"
            placeholder="请输入联系人姓名"
            placeholder-class="placeholder"
            maxlength="10"
          />
        </view>
        
        <view class="form-item">
          <text class="label">联系电话</text>
          <input 
            class="input" 
            v-model="formData.phone"
            type="number"
            maxlength="11"
            placeholder="请输入联系人电话"
            placeholder-class="placeholder"
            @input="validatePhone"
          />
        </view>
        
        <view class="form-item">
          <text class="label">营业时间</text>
          <view class="time-wrapper">
            <view class="time-row">
              <picker 
                mode="time" 
                :value="formData.openTime"
                @change="onOpenTimeChange"
              >
                <text class="time-value">{{formData.openTime}}</text>
              </picker>
              <text class="separator">~</text>
              <picker 
                mode="time" 
                :value="formData.closeTime"
                @change="onCloseTimeChange"
              >
                <text class="time-value">{{formData.closeTime}}</text>
              </picker>
            </view>
          </view>
        </view>

        <view class="form-item upload-item">
          <text class="label">上传门头图</text>
          <view class="upload-list">
            <view 
              v-for="(img, index) in formData.shopImages" 
              :key="index" 
              class="upload-item-wrap"
            >
              <image 
                :src="img" 
                class="preview-image"
                mode="aspectFill"
                @tap="previewImage(index)"
              />
              <text class="delete-btn" @tap="deleteImage(index)">×</text>
            </view>
            <image 
              v-if="formData.shopImages.length < 5"
              src="/static/images/xiangji.png" 
              class="camera-icon"
              @tap="chooseImage"
            />
          </view>
        </view>

        <view class="form-item textarea-item">
          <text class="label">店铺地址</text>
          <view class="address-wrapper">
            <view class="location-select" @tap="chooseLocation">
              <text class="location-text">{{ formData.location || '点击选择位置' }}</text>
              <view class="location-icon">
                <image src="/static/images/location.png" mode="aspectFit"></image>
              </view>
            </view>
            <textarea 
              class="textarea" 
              v-model="formData.address"
              placeholder="请输入详细地址信息"
              placeholder-class="placeholder"
            />
          </view>
        </view>
      </view>
    </transition>

    <!-- 资质信息表单 -->
    <transition name="fade-slide">
      <view class="form-section" v-if="currentTab === 1">
        <view class="form-item upload-item">
          <text class="label">上传营业执照</text>
          <view class="upload-list">
            <view 
              v-for="(img, index) in formData.businessLicenses" 
              :key="index"
              class="upload-item-wrap"
            >
              <image 
                :src="img" 
                class="preview-image"
                mode="aspectFill"
                @tap="previewLicense(index)"
              />
              <text class="delete-btn" @tap="deleteLicense(index)">×</text>
            </view>
            <image 
              v-if="formData.businessLicenses.length < 2"
              src="/static/images/xiangji.png" 
              class="camera-icon"
              @tap="chooseLicense"
            />
          </view>
          <text class="upload-tip">上传营业执照、相关行业许可等资质文件</text>
        </view>

        <view class="form-item upload-item">
          <text class="label">上传身份证照片</text>
          <view class="upload-list">
            <view 
              v-for="(img, index) in formData.idCardImages" 
              :key="index"
              class="upload-item-wrap"
            >
              <image 
                :src="img" 
                class="preview-image"
                mode="aspectFill"
                @tap="previewIdCard(index)"
              />
              <text class="delete-btn" @tap="deleteIdCard(index)">×</text>
            </view>
            <image 
              v-if="formData.idCardImages.length < 2"
              src="/static/images/xiangji.png" 
              class="camera-icon"
              @tap="chooseIdCard"
            />
          </view>
          <text class="upload-tip">上传最新身份证正反面照片</text>
        </view>
      </view>
    </transition>

    <!-- 审核验证模块 -->
    <transition name="fade-slide">
      <view class="verify-section" v-if="currentTab === 2">
        <!-- 审核中状态 -->
        <view class="verify-content" v-if="auditStatus === 0">
          <image src="/static/images/success.png" class="verify-icon" mode="aspectFit"></image>
          <text class="verify-title">提交成功，请等待审核验证</text>
        </view>
        
        <!-- 审核通过状态 -->
        <view class="verify-content" v-else>
          <view class="verify-header">
            <text>审核验证已完成，恭喜入驻电动车供配修服务。请上传店铺押金付款凭证</text>
          </view>
          
          <!-- 上传付款凭证 -->
          <view class="upload-payment">
            <text class="upload-title">上传付款凭证</text>
            <view class="upload-content">
              <view 
                v-for="(img, index) in formData.paymentProofs" 
                :key="index"
                class="upload-item-wrap"
              >
                <image 
                  :src="img" 
                  class="preview-image"
                  mode="aspectFill"
                  @tap="previewPaymentImage(index)"
                />
                <text class="delete-btn" @tap="deletePaymentImage(index)">×</text>
              </view>
              <view 
                v-if="formData.paymentProofs.length < 3"
                class="upload-btn"
                @tap="choosePayment"
              >
                <image src="/static/images/xiangji.png" class="camera-icon"></image>
              </view>
            </view>
          </view>
        </view>
      </view>
    </transition>

    <!-- 底部按钮 -->
    <view class="bottom-btn" v-if="currentTab !== 2">
      <view class="btn-wrapper">
        <button 
          v-if="currentTab === 1"
          class="prev-btn" 
          @tap="prevStep"
        >
          上一步
        </button>
        <button 
          class="next-btn" 
          :class="{'full-width': currentTab === 0}"
          @tap="currentTab === 1 ? submitAudit() : nextStep()"
        >
          {{currentTab === 1 ? '提交审核' : '下一步'}}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      tabs: ['店铺信息', '资质信息', '审核验证'],
      currentTab: 0,
      auditStatus: 0,
      formData: {
        shopName: '',
        contact: '',
        phone: '',
        openTime: '8:00',
        closeTime: '18:30',
        address: '',
        shopImages: [],
        businessLicenses: [],
        idCardImages: [],
        paymentProofs: [],
        latitude: '',
        longitude: '',
        location: '',
        locationInfo: {
          latitude: '',
          longitude: '',
          address: '',
          name: ''
        }
      }
    }
  },
  
  methods: {
    switchTab(index) {
      return
    },
    
    chooseImage() {
      uni.chooseImage({
        count: 5 - this.formData.shopImages.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.formData.shopImages = [...this.formData.shopImages, ...res.tempFilePaths]
          if (this.formData.shopImages.length > 5) {
            this.formData.shopImages = this.formData.shopImages.slice(0, 5)
            uni.showToast({
              title: '最多上传5张图片',
              icon: 'none'
            })
          }
        }
      })
    },
    
    onOpenTimeChange(e) {
      this.formData.openTime = e.detail.value
    },
    
    onCloseTimeChange(e) {
      this.formData.closeTime = e.detail.value
    },
    
    // 表单验证方法
    validateForm() {
      const formData = this.formData
      
      // 店铺名称验证
      if (!formData.shopName.trim()) {
        this.showToast('请输入店铺名称')
        return false
      }
      if (this.getStrLength(formData.shopName.trim()) > 16) {
        this.showToast('店铺名称最多16个字符')
        return false
      }
      // 过滤特殊字符
      if (/[<>?\\\\/:*?"<>|]/.test(formData.shopName)) {
        this.showToast('店铺名称不能包含特殊字符')
        return false
      }
      
      // 联系人验证
      if (!formData.contact.trim()) {
        this.showToast('请输入联系人姓名')
        return false
      }
      if (this.getStrLength(formData.contact.trim()) > 10) {
        this.showToast('联系人姓名最多10个字符')
        return false
      }
      // 只允许中文和英文
      if (!/^[\u4e00-\u9fa5a-zA-Z\s]+$/.test(formData.contact)) {
        this.showToast('联系人姓名只能包含中文和英文')
        return false
      }
      
      // 手机号验证
      if (!formData.phone) {
        this.showToast('请输入联系电话')
        return false
      }
      if (!/^1[3456789]\d{9}$/.test(formData.phone)) {
        this.showToast('请输入正确的手机号')
        return false
      }
      
      // 营业时间验证
      if (!this.validateBusinessHours()) {
        return false
      }
      
      // 位置和地址验证
      if (!formData.location) {
        this.showToast('请选择店铺位置')
        return false
      }
      
      if (!formData.address.trim()) {
        this.showToast('请输入详细地址')
        return false
      }
      
      if (this.getStrLength(formData.address.trim()) > 100) {
        this.showToast('详细地址最多100个字符')
        return false
      }
      
      // 门头图验证
      if (formData.shopImages.length === 0) {
        this.showToast('请上传门头图')
        return false
      }
      if (formData.shopImages.length > 5) {
        this.showToast('最多上传5张门头图')
        return false
      }
      
      return true
    },
    
    // 计算字符串长度（中文算2个字符）
    getStrLength(str) {
      let len = 0
      for (let i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 127 || str.charCodeAt(i) === 94) {
          len += 2
        } else {
          len++
        }
      }
      return len
    },
    
    // 修改下一步方法
    nextStep() {
      if (!this.validateForm()) {
        return;
      }
      
      // 减少过渡时间
      setTimeout(() => {
        this.currentTab = 1;
      }, 250);
    },
    
    // 添加手机号实时验证方法
    validatePhone(e) {
      let value = e.detail.value.replace(/\D/g, '')
      
      // 限制长度
      if (value.length > 11) {
        value = value.slice(0, 11)
      }
      
      // 验证第一位
      if (value.length === 1 && value !== '1') {
        value = ''
        this.showToast('手机号必须以1开头')
      }
      
      // 验证第二位
      if (value.length === 2 && !['3','4','5','6','7','8','9'].includes(value[1])) {
        value = '1'
        this.showToast('请输入正确的手机号')
      }
      
      this.formData.phone = value
    },
    
    // 预览图片
    previewImage(index) {
      uni.previewImage({
        urls: this.formData.shopImages,
        current: index
      })
    },
    
    // 删除图片
    deleteImage(index) {
      this.formData.shopImages.splice(index, 1)
    },
    
    chooseLicense() {
      uni.chooseImage({
        count: 2 - this.formData.businessLicenses.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.formData.businessLicenses = [...this.formData.businessLicenses, ...res.tempFilePaths]
          if (this.formData.businessLicenses.length > 2) {
            this.formData.businessLicenses = this.formData.businessLicenses.slice(0, 2)
            this.showToast('最多上传2张营业执照')
          }
        }
      })
    },
    
    chooseIdCard() {
      uni.chooseImage({
        count: 2 - this.formData.idCardImages.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.formData.idCardImages = [...this.formData.idCardImages, ...res.tempFilePaths]
          if (this.formData.idCardImages.length > 2) {
            this.formData.idCardImages = this.formData.idCardImages.slice(0, 2)
            this.showToast('最多上传2张身份证照片')
          }
        }
      })
    },
    
    previewLicense(index) {
      uni.previewImage({
        urls: this.formData.businessLicenses,
        current: index
      })
    },
    
    previewIdCard(index) {
      uni.previewImage({
        urls: this.formData.idCardImages,
        current: index
      })
    },
    
    deleteLicense(index) {
      this.formData.businessLicenses.splice(index, 1)
    },
    
    deleteIdCard(index) {
      this.formData.idCardImages.splice(index, 1)
    },
    
    validateQualification() {
      if (this.formData.businessLicenses.length === 0) {
        this.showToast('请上传营业执照')
        return false
      }
      
      if (this.formData.idCardImages.length === 0) {
        this.showToast('请上传身份证照片')
        return false
      }
      
      return true
    },
    
    submitAudit() {
      if (!this.validateQualification()) {
        return;
      }
      
      uni.showLoading({
        title: '提交中...',
        mask: true
      });
      
      setTimeout(() => {
        this.currentTab = 2;
        uni.hideLoading();
      }, 1000);
    },
    
    prevStep() {
      setTimeout(() => {
        this.currentTab = 0;
      }, 250);
    },
    
    // 添加营业时间验证方法
    validateBusinessHours() {
      const { openTime, closeTime } = this.formData
      
      // 转换为分钟进行比较
      const openMinutes = this.timeToMinutes(openTime)
      const closeMinutes = this.timeToMinutes(closeTime)
      
      // 验证营业时间是否合理
      if (openMinutes >= closeMinutes) {
        this.showToast('营业结束时间必须晚于开始时间')
        return false
      }
      
      // 验证营业时间是否过短
      if (closeMinutes - openMinutes < 60) {
        this.showToast('营业时间不能少于1小时')
        return false
      }
      
      return true
    },
    
    // 时间转换为分钟数
    timeToMinutes(time) {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    },
    
    // 统一的提示方法
    showToast(title) {
      uni.showToast({
        title,
        icon: 'none'
      })
    },
    
    // 选���付款凭证
    choosePayment() {
      uni.chooseImage({
        count: 3 - this.formData.paymentProofs.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.formData.paymentProofs = [...this.formData.paymentProofs, ...res.tempFilePaths]
          if (this.formData.paymentProofs.length > 3) {
            this.formData.paymentProofs = this.formData.paymentProofs.slice(0, 3)
            this.showToast('最多上传3张图片')
          }
        }
      })
    },
    
    // 预览付款凭证
    previewPaymentImage(index) {
      uni.previewImage({
        urls: this.formData.paymentProofs,
        current: index
      })
    },
    
    // 删除付款凭证
    deletePaymentImage(index) {
      this.formData.paymentProofs.splice(index, 1)
    },
    
    // 修改选择位置方法
    chooseLocation() {
      uni.chooseLocation({
        success: (res) => {
          this.formData.location = res.name || res.address
          this.formData.locationInfo = {
            latitude: res.latitude,
            longitude: res.longitude,
            address: res.address,
            name: res.name
          }
        },
        fail: (err) => {
          if (err.errMsg.indexOf('auth deny') !== -1) {
            uni.showModal({
              title: '提示',
              content: '需要获取您的地理位置，请在设置中打开定位权限',
              confirmText: '去设置',
              success: (res) => {
                if (res.confirm) {
                  uni.openSetting()
                }
              }
            })
          } else {
            uni.showToast({
              title: '选择地址失败',
              icon: 'none'
            })
          }
        }
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.merchant-settled {
  min-height: 100vh;
  background: #f5f5f5;
  
  .nav-tabs {
    display: flex;
    padding: 0 40rpx;
    background: #fff;
    position: relative;
    
    .tab-item {
      flex: 1;
      text-align: center;
      font-size: 32rpx;
      color: #999;
      position: relative;
      padding: 30rpx 0;
      transition: all 0.3s ease;
      pointer-events: none;
      user-select: none;
      
      &.active {
        color: #333;
        font-weight: 500;
        
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 120rpx;
          height: 4rpx;
          background: #4080ff;
          border-radius: 2rpx;
          transition: all 0.3s ease;
        }
      }
    }
  }
  
  .form-section {
    margin: 20rpx 30rpx;
    background: #fff;
    border-radius: 12rpx;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 1;
    transform: translateX(0);
    will-change: transform, opacity;
    
    .form-item {
      display: flex;
      padding: 30rpx;
      min-height: 110rpx;
      border-bottom: 2rpx solid #f5f5f5;
      box-sizing: border-box;
      
      .label {
        width: 300rpx;
        font-size: 32rpx;
        color: #333;
        font-weight: bold;
      }
      
      .input {
        flex: 1;
        height: 50rpx;
        line-height: 50rpx;
        font-size: 28rpx;
        padding: 0;
      }
      
      &.time-item {
        flex-direction: column;
        
        .time-content {
          margin-top: 20rpx;
          
          .time-label {
            font-size: 28rpx;
            color: #666;
            margin-right: 20rpx;
          }
          
          .picker-text {
            display: inline-block;
            font-size: 32rpx;
            color: #333;
            margin-right: 40rpx;
          }
        }
      }
      
      .textarea {
        flex: 1;
        height: 160rpx;
        font-size: 28rpx;
        padding: 0;
      }
      
      .upload-wrapper {
        width: 120rpx;
        height: 120rpx;
        border: 2rpx solid #eee;
        border-radius: 8rpx;
        
        .preview-image {
          width: 100%;
          height: 100%;
          border-radius: 8rpx;
        }
        
        .upload-btn {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .camera-icon {
            width: 40rpx;
            height: 40rpx;
          }
        }
      }
      
      .time-wrapper {
        flex: 1;
        
        .time-row {
          display: flex;
          align-items: center;
          
          .time-value {
            font-size: 28rpx;
            color: #333;
          }
          
          .separator {
            margin: 0 20rpx;
            color: #999;
            font-size: 28rpx;
          }
        }
      }
      
      &.textarea-item {
        flex-direction: column;
        align-items: flex-start;
        padding: 30rpx;
        min-height: 260rpx;
        
        .label {
          margin-bottom: 20rpx;
        }
        
        .address-wrapper {
          width: 100%;
          position: relative;
          
          .location-select {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20rpx;
            background: #f8f8f8;
            border-radius: 8rpx;
            margin-bottom: 20rpx;
            
            .location-text {
              flex: 1;
              font-size: 28rpx;
              color: #333;
              margin-right: 20rpx;
              
              &:empty::before {
                content: '点击选择位置';
                color: #999;
              }
            }
            
            .location-icon {
              width: 40rpx;
              height: 40rpx;
              display: flex;
              align-items: center;
              justify-content: center;
              
              image {
                width: 32rpx;
                height: 32rpx;
              }
            }
          }
          
          .textarea {
            width: 100%;
            height: 160rpx;
            font-size: 28rpx;
            padding: 20rpx;
            background: #f8f8f8;
            border-radius: 8rpx;
            box-sizing: border-box;
          }
        }
      }
      
      &.upload-item {
        flex-direction: column;
        align-items: flex-start;
        padding: 30rpx;
        min-height: 260rpx;
        
        .label {
          margin-bottom: 20rpx;
        }
        
        .upload-list {
          display: flex;
          flex-wrap: wrap;
          margin-top: 20rpx;
          
          .upload-item-wrap {
            position: relative;
            margin-right: 20rpx;
            margin-bottom: 20rpx;
            
            .preview-image {
              width: 100rpx;
              height: 100rpx;
              border-radius: 8rpx;
              border: 2rpx solid #eee;
            }
            
            .delete-btn {
              position: absolute;
              top: -16rpx;
              right: -16rpx;
              width: 32rpx;
              height: 32rpx;
              line-height: 32rpx;
              text-align: center;
              background: rgba(0,0,0,0.5);
              color: #fff;
              border-radius: 50%;
              font-size: 24rpx;
            }
          }
          
          .camera-icon {
            width: 100rpx;
            height: 100rpx;
          }
        }
      }
    }
  }
  
  .bottom-btn {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 20rpx 30rpx;
    background: #fff;
    
    .btn-wrapper {
      display: flex;
      gap: 20rpx;
      
      .prev-btn,
      .next-btn {
        flex: 1;
        height: 88rpx;
        line-height: 88rpx;
        text-align: center;
        font-size: 32rpx;
        border-radius: 44rpx;
      }
      
      .prev-btn {
        color: #666;
        background: #f5f5f5;
      }
      
      .next-btn {
        color: #fff;
        background: #ff6b00;
        
        &.full-width {
          width: 100%;
        }
      }
    }
  }
}

.placeholder {
  color: #999;
  font-size: 28rpx;
}

.upload-tip {
  font-size: 24rpx;
  color: #999;
  margin-top: 20rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.verify-section {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 20rpx;
  box-sizing: border-box;
  
  .verify-content {
    background: transparent;
    padding: 0 30rpx;
    
    .verify-header {
      padding: 30rpx;
      border-radius: 12rpx;
      margin-bottom: 20rpx;
      width: 100%;
      box-sizing: border-box;
      background: #fff;
      
      text {
        font-size: 28rpx;
        color: #666;
        line-height: 1.6;
        font-weight: 400;
        letter-spacing: 1rpx;
        display: block;
      }
    }
    
    .upload-payment {
      width: 100%;
      height: auto;
      background: #fff;
      border-radius: 12rpx;
      margin-top: 20rpx;
      padding: 30rpx;
      box-sizing: border-box;
      
      .upload-title {
        font-size: 32rpx;
        color: #333;
        font-weight: bold;
        margin-bottom: 30rpx;
        display: block;
      }
      
      .upload-content {
        display: flex;
        flex-wrap: wrap;
        gap: 20rpx;
        
        .upload-item-wrap {
          position: relative;
          width: 160rpx;
          height: 160rpx;
          
          .preview-image {
            width: 100%;
            height: 100%;
            border-radius: 8rpx;
            border: 2rpx solid #eee;
          }
          
          .delete-btn {
            position: absolute;
            top: -16rpx;
            right: -16rpx;
            width: 32rpx;
            height: 32rpx;
            line-height: 32rpx;
            text-align: center;
            background: rgba(0,0,0,0.5);
            color: #fff;
            border-radius: 50%;
            font-size: 24rpx;
          }
        }
        
        .upload-btn {
          width: 160rpx;
          height: 160rpx;
          border: 2rpx dashed #ddd;
          border-radius: 8rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          
          .camera-icon {
            width: 48rpx;
            height: 48rpx;
          }
          
          &:active {
            background-color: #f8f8f8;
          }
        }
      }
    }
  }
}

.form-item {
  &.upload-item {
    .upload-list {
      .upload-item-wrap {
        .preview-image {
          width: 240rpx;
          height: 160rpx;
          border-radius: 8rpx;
        }
      }
      
      .camera-icon {
        width: 240rpx;
        height: 160rpx;
        border: 2rpx dashed #ddd;
        border-radius: 8rpx;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &:active {
          background-color: #f8f8f8;
        }
      }
    }
  }
}

.form-section {
  .form-item.upload-item {
    .upload-list {
      .upload-item-wrap {
        .preview-image {
          width: 160rpx;
          height: 160rpx;
          object-fit: cover;
        }
      }
      
      .camera-icon {
        width: 160rpx;
        height: 160rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        
        image {
          width: 48rpx;
          height: 48rpx;
        }
      }
    }
  }
}

// 添加新的过渡动画样式
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  width: calc(100% - 60rpx);
  left: 30rpx;
  right: 30rpx;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30rpx);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30rpx);
}

// 返回时的动画
.fade-slide-leave-active.prev {
  transform: translateX(30rpx);
}

.fade-slide-enter-from.prev {
  transform: translateX(-30rpx);
}
</style> 