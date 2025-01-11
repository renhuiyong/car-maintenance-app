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
              v-if="formData.shopImages.length < 1"
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
                <image src="/static/images/weizhi.png" mode="aspectFit"></image>
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
          <view class="id-card-upload">
            <!-- 身份证正面 -->
            <view class="id-card-side">
              <text class="side-label">身份证正面</text>
              <view class="upload-wrap">
                <view v-if="formData.idCardFront" class="upload-item-wrap">
                  <image 
                    :src="formData.idCardFront" 
                    class="preview-image"
                    mode="aspectFill"
                    @tap="previewIdCard('front')"
                  />
                  <text class="delete-btn" @tap="deleteIdCard('front')">×</text>
                </view>
                <view 
                  v-else
                  class="camera-icon"
                  @tap="chooseIdCard('front')"
                >
                  <image 
                    src="/static/images/xiangji.png" 
                    mode="aspectFit"
                  ></image>
                </view>
              </view>
            </view>
            
            <!-- 身份证反面 -->
            <view class="id-card-side">
              <text class="side-label">身份证反面</text>
              <view class="upload-wrap">
                <view v-if="formData.idCardBack" class="upload-item-wrap">
                  <image 
                    :src="formData.idCardBack" 
                    class="preview-image"
                    mode="aspectFill"
                    @tap="previewIdCard('back')"
                  />
                  <text class="delete-btn" @tap="deleteIdCard('back')">×</text>
                </view>
                <view 
                  v-else
                  class="camera-icon"
                  @tap="chooseIdCard('back')"
                >
                  <image 
                    src="/static/images/xiangji.png" 
                    mode="aspectFit"
                  ></image>
                </view>
              </view>
            </view>
          </view>
          <text class="upload-tip">请上传清晰的身份证正反面照片</text>
        </view>
      </view>
    </transition>

    <!-- 审核验证模块 -->
    <transition name="fade-slide">
      <view class="verify-section" v-if="currentTab === 2">
        <!-- 审核中状态 -->
        <view class="verify-content" v-if="examineStatus === 0">
          <view class="success-wrapper">
            <image src="/static/images/success.png" class="verify-icon" mode="aspectFit"></image>
            <text class="verify-title">提交成功，请等待审核验证</text>
            <button class="back-home-btn" @tap="backToHome">返回首页</button>
          </view>
        </view>
        
        <!-- 已审核未付保证金状态 -->
        <view class="verify-content" v-if="examineStatus === 1">
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
            <button class="submit-btn" @tap="submitPaymentProof">提交凭证</button>
          </view>
        </view>

        <!-- 已付保证金状态 -->
        <view class="verify-content" v-if="examineStatus === 2">
          <view class="success-wrapper">
            <image src="/static/images/success.png" class="verify-icon" mode="aspectFit"></image>
            <text class="verify-title">保证金已提交，请等待最终审核</text>
            <button class="back-home-btn" @tap="backToHome">返回首页</button>
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
import api from '@/api/index.js'

export default {
  data() {
    return {
      tabs: ['店铺信息', '资质信息', '审核验证'],
      currentTab: 0,
      auditStatus: 0,
      examineStatus: 5,
      formData: {
        shopName: '',
        contact: '',
        phone: '',
        openTime: '8:00',
        closeTime: '18:30',
        address: '',
        shopImages: [],
        businessLicenses: [],
        idCardFront: '',
        idCardBack: '',
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
  
  onShow() {
    // 检查商家审核状态
    this.checkExamineStatus()
  },
  
  methods: {
    switchTab(index) {
      // 只有未申请和审核失败状态可以切换tab
      if (this.examineStatus !== 5 && this.examineStatus !== 4) {
        return
      }
      
      if (index < this.currentTab) {
        this.currentTab = index
      } else if (index === 1 && this.currentTab === 0) {
        if (!this.validateForm()) {
          return
        }
        this.currentTab = index
      }
    },
    
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.formData.shopImages = [res.tempFilePaths[0]]
          if (this.formData.shopImages.length > 1) {
            uni.showToast({
              title: '只能上传1张门头图',
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
      if (formData.shopImages.length > 1) {
        this.showToast('只能上传1张门头图')
        return false
      }
      
      return true
    },
    
    // 计算字符串长度（中文算2个字）
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
    
    // 修改下一步方
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
    
    chooseIdCard(side) {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          if(side === 'front') {
            this.formData.idCardFront = res.tempFilePaths[0];
          } else {
            this.formData.idCardBack = res.tempFilePaths[0];
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
    
    previewIdCard(side) {
      const url = side === 'front' ? this.formData.idCardFront : this.formData.idCardBack;
      if(url) {
        uni.previewImage({
          urls: [url]
        })
      }
    },
    
    deleteLicense(index) {
      this.formData.businessLicenses.splice(index, 1)
    },
    
    deleteIdCard(side) {
      if(side === 'front') {
        this.formData.idCardFront = '';
      } else {
        this.formData.idCardBack = '';
      }
    },
    
    validateQualification() {
      if (this.formData.businessLicenses.length === 0) {
        this.showToast('请上传营业执照')
        return false
      }
      
      if (!this.formData.idCardFront) {
        this.showToast('请上传身份证正面照片')
        return false
      }
      
      if (!this.formData.idCardBack) {
        this.showToast('请上传身份证反面照片')
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

      // 修改上传图片数组
      const uploadPromises = [
        this.uploadImage(this.formData.shopImages[0]),
        ...this.formData.businessLicenses.map(path => this.uploadImage(path)),
        this.uploadImage(this.formData.idCardFront),
        this.uploadImage(this.formData.idCardBack)
      ];

      Promise.all(uploadPromises)
        .then(results => {
          const [
            shopImage
          ] = results.slice(0, 1);
          
          const [
            ...businessLicenses
          ] = results.slice(
            this.formData.shopImages.length,
            this.formData.shopImages.length + this.formData.businessLicenses.length
          );
          
          const [idCardFront, idCardBack] = results.slice(
            this.formData.shopImages.length + this.formData.businessLicenses.length
          );

          // 构建提交数据，移除 locationName 字段
          const submitData = {
            // 店铺基本信息
            // shopName: this.formData.shopName,
            // contact: this.formData.contact,
            // phone: this.formData.phone,
            // openTime: this.formData.openTime,
            // closeTime: this.formData.closeTime,
            // // 门头图片文件名，用逗号分隔
            // shopImage: shopImage.fileName,
            // // 位置信息
            // latitude: this.formData.locationInfo.latitude,
            // longitude: this.formData.locationInfo.longitude,
            // address: this.formData.address,
            // // 资质信息
            // businessLicenses: businessLicenses.map(img => img.fileName).join(','),
            // idCardFront: idCardFront.fileName,
            // idCardBack: idCardBack.fileName
            shopName: this.formData.shopName,
            contacts: this.formData.contact,
            tel: this.formData.phone,
            businessHours: this.formData.openTime + '-' + this.formData.closeTime,
            // 门头图片文件名，用逗号分隔
            logoUrl: shopImage.fileName,
            // 位置信息
            latitude: this.formData.locationInfo.latitude,
            longitude: this.formData.locationInfo.longitude,
            detailAddress: this.formData.address,
            // 资质信息
            qualificationsUrl: businessLicenses.map(img => img.fileName).join(','),
            cardFrontUrl: idCardFront.fileName,
            cardReverseUrl: idCardBack.fileName
          };

          console.log('submitData', submitData)
          // 调用提交接口
          return api.merchant.submitSettled(submitData);
        })
        .then(res => {
            if(res.code === 200) {
                this.currentTab = 2;
                uni.showToast({
                    title: '提交成功',
                    icon: 'success'
                });
            } else {
                throw new Error(res.message || '提交失败');
            }
        })
        .catch(err => {
            uni.showToast({
                title: err.message || '网络错误，请稍后重试',
                icon: 'none'
            });
        })
        .finally(() => {
            uni.hideLoading();
        });
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
    
    // 选择付款凭证
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
              content: '需要获取您的地理位置请在设置中打开定位权限',
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
    
    // 上传单张图片的方法
    uploadImage(filePath) {
      return new Promise((resolve, reject) => {
        api.common.uploadFile(filePath)
          .then(res => {
            resolve(res); // res 已包含 fileName 和 url
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    
    // 添加返回商家首页方法
    backToHome() {
      uni.redirectTo({
        url: '/pages/merchant/merchant'
      })
    },
    
    // 添加检查状态方法
    async checkExamineStatus() {
      try {
        const res = await api.merchant.getShopSelfExamineStatus()
        if (res.code === 200) {
          this.examineStatus = res.data.examineStatus
          
          // 根据状态设置页面显示
          switch(this.examineStatus) {
            case 0: // 未审核
              this.currentTab = 2
              this.auditStatus = 0
              break
            case 1: // 已审核未付保证金
              this.currentTab = 2
              this.auditStatus = 1
              break
            case 2: // 已付保证金
              this.currentTab = 2
              this.auditStatus = 2
              break
            case 3: // 已通过
              uni.redirectTo({
                url: '/pages/merchant/merchant'
              })
              break
            case 4: // 审核失败
              this.currentTab = 0
              uni.showModal({
                title: '提示',
                content: '您的入驻申请审核未通过，请重新提交',
                showCancel: false
              })
              break
            case 5: // 未申请
              this.currentTab = 0
              break
          }
        }
      } catch (error) {
        uni.showToast({
          title: error.message || '获取状态失败',
          icon: 'none'
        })
      }
    },
    
    // 提交付款凭证
    async submitPaymentProof() {
      if (this.formData.paymentProofs.length === 0) {
        this.showToast('请上传付款凭证')
        return
      }

      uni.showLoading({
        title: '提交中...',
        mask: true
      })

      try {
        // 上传付款凭证图片
        const uploadPromises = this.formData.paymentProofs.map(path => this.uploadImage(path))
        const results = await Promise.all(uploadPromises)
        
        // 构建提交数据
        const submitData = {
          paymentProofs: results.map(img => img.fileName).join(',')
        }

        // 调用提交接口
        const res = await api.merchant.submitPaymentProof(submitData)
        if (res.code === 200) {
          uni.showToast({
            title: '提交成功',
            icon: 'success'
          })
          // 重新检查状态
          setTimeout(() => {
            this.checkExamineStatus()
          }, 1500)
        } else {
          throw new Error(res.message || '提交失败')
        }
      } catch (error) {
        uni.showToast({
          title: error.message || '提交失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    }
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
                width: 42rpx;
                height: 42rpx;
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
    background: #fff;
    margin: 20rpx;
    border-radius: 12rpx;
    overflow: hidden;
    
    .success-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60rpx 40rpx;
      
      .verify-icon {
        width: 120rpx;
        height: 120rpx;
        margin-bottom: 30rpx;
      }
      
      .verify-title {
        font-size: 32rpx;
        color: #333;
        font-weight: 500;
      }
      
      .back-home-btn {
        margin-top: 60rpx;
        width: 240rpx;
        height: 80rpx;
        line-height: 80rpx;
        text-align: center;
        background: #ff6b00;
        color: #fff;
        font-size: 28rpx;
        border-radius: 40rpx;
        border: none;
        
        &:active {
          opacity: 0.8;
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
        
        image {
          width: 100rpx;
          height: 100rpx;
        }
        
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

// 修改身份证上传样式
.id-card-upload {
  width: 100%;
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
  
  .id-card-side {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .side-label {
      font-size: 26rpx;
      color: #666;
      margin-bottom: 16rpx;
      display: block;
      width: 240rpx;
      text-align: center;
    }
    
    .upload-wrap {
      width: 240rpx;
      height: 160rpx;
      
      .upload-item-wrap {
        width: 100%;
        height: 100%;
        position: relative;
        
        .preview-image {
          width: 240rpx;
          height: 160rpx;
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
        width: 240rpx;
        height: 160rpx;
        border: 4rpx dashed #ddd;
        border-radius: 8rpx;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        
        image {
          width: 100rpx;
          height: 100rpx;
        }
        
        &:active {
          background-color: #f8f8f8;
        }
      }
    }
  }
}

.verify-content {
  .upload-payment {
    padding: 30rpx;
    
    .upload-title {
      font-size: 32rpx;
      color: #333;
      font-weight: bold;
      margin-bottom: 20rpx;
    }
    
    .upload-content {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;
      margin-bottom: 40rpx;
      
      .upload-item-wrap {
        position: relative;
        width: 240rpx;
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
        width: 240rpx;
        height: 160rpx;
        border: 4rpx dashed #ddd;
        border-radius: 8rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .camera-icon {
          width: 48rpx;
          height: 48rpx;
        }
        
        &:active {
          background-color: #f8f8f8;
        }
      }
    }
    
    .submit-btn {
      width: 100%;
      height: 88rpx;
      line-height: 88rpx;
      text-align: center;
      background: #ff6b00;
      color: #fff;
      font-size: 32rpx;
      border-radius: 44rpx;
      margin-top: 40rpx;
      
      &:active {
        opacity: 0.8;
      }
    }
  }
}
</style> 