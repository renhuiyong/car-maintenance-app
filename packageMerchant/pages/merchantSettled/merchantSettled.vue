<template>
  <view class="merchant-settled">
    <scroll-view scroll-y class="page-container">
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

          <view class="form-item services-item">
            <text class="label">配套服务</text>
            <view class="services-list">
              <view 
                v-for="(item, index) in servicesList" 
                :key="index"
                :class="['service-item', formData.services.includes(item.id) ? 'active' : '']"
                @tap="toggleService(item.id)"
              >
                <text class="service-name">{{item.title}}</text>
                <text class="check-icon" v-if="formData.services.includes(item.id)">✓</text>
              </view>
            </view>
            <text class="error-tip" v-if="showServicesError">请至少选择一项配套服务</text>
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
    </scroll-view>

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
      isUploading: false,
      hasShownRejectMessage: false,
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
        },
        services: []
      },
      isChoosing: false,
      servicesList: [],
      showServicesError: false
    }
  },
  
  onLoad() {
    this.checkExamineStatus()
    this.getServicesList()
  },
  
  onShow() {
    if (!this.isUploading) {
      this.checkExamineStatus()
    }
  },
  
  methods: {
    switchTab(index) {
      if (this.isUploading) {
        return
      }
      
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
    
    validateForm() {
      const formData = this.formData
      
      if (!formData.shopName.trim()) {
        this.showToast('请输入店铺名称')
        return false
      }
      if (this.getStrLength(formData.shopName.trim()) > 16) {
        this.showToast('店铺名称最多16个字符')
        return false
      }
      if (/[<>?\\\\/:*?"<>|]/.test(formData.shopName)) {
        this.showToast('店铺名称不能包含特殊字符')
        return false
      }
      
      if (!formData.contact.trim()) {
        this.showToast('请输入联系人姓名')
        return false
      }
      if (this.getStrLength(formData.contact.trim()) > 10) {
        this.showToast('联系人姓名最多10个字符')
        return false
      }
      if (!/^[\u4e00-\u9fa5a-zA-Z\s]+$/.test(formData.contact)) {
        this.showToast('联系人姓名只能包含中文和英文')
        return false
      }
      
      if (!formData.phone) {
        this.showToast('请输入联系电话')
        return false
      }
      if (!/^1[3456789]\d{9}$/.test(formData.phone)) {
        this.showToast('请输入正确的手机号')
        return false
      }
      
      if (!this.validateBusinessHours()) {
        return false
      }
      
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
      
      if (formData.shopImages.length === 0) {
        this.showToast('请上传门头图')
        return false
      }
      if (formData.shopImages.length > 1) {
        this.showToast('只能上传1张门头图')
        return false
      }

      if (formData.services.length === 0) {
        this.showToast('请至少选择一项配套服务')
        this.showServicesError = true
        return false
      }
      
      return true
    },
    
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
    
    nextStep() {
      if (!this.validateForm()) {
        return;
      }
      
      setTimeout(() => {
        this.currentTab = 1;
      }, 250);
    },
    
    validatePhone(e) {
      let value = e.detail.value.replace(/\D/g, '')
      
      if (value.length > 11) {
        value = value.slice(0, 11)
      }
      
      if (value.length === 1 && value !== '1') {
        value = ''
        this.showToast('手机号必须以1开头')
      }
      
      if (value.length === 2 && !['3','4','5','6','7','8','9'].includes(value[1])) {
        value = '1'
        this.showToast('请输入正确的手机号')
      }
      
      this.formData.phone = value
    },
    
    previewImage(index) {
      uni.previewImage({
        urls: this.formData.shopImages,
        current: index
      })
    },
    
    deleteImage(index) {
      this.formData.shopImages.splice(index, 1)
    },
    
    chooseLicense() {
      this.isUploading = true;
      
      uni.chooseImage({
        count: 2 - this.formData.businessLicenses.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.$nextTick(() => {
            this.formData.businessLicenses = [...this.formData.businessLicenses, ...res.tempFilePaths];
            if (this.formData.businessLicenses.length > 2) {
              this.formData.businessLicenses = this.formData.businessLicenses.slice(0, 2);
              uni.showToast({
                title: '最多上传2张营业执照',
                icon: 'none'
              });
            }
          });
        },
        fail: (err) => {
          console.log('选择图片失败:', err);
          if (err.errMsg !== 'chooseImage:fail cancel') {
            uni.showToast({
              title: '选择图片失败',
              icon: 'none'
            });
          }
        },
        complete: () => {
          setTimeout(() => {
            this.isUploading = false;
          }, 500);
        }
      });
    },
    
    chooseIdCard(side) {
      this.isUploading = true;
      
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
        },
        fail: (err) => {
          console.log('选择图片失败:', err);
          if (err.errMsg !== 'chooseImage:fail cancel') {
            uni.showToast({
              title: '选择图片失败',
              icon: 'none'
            });
          }
        },
        complete: () => {
          setTimeout(() => {
            this.isUploading = false;
          }, 500);
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

          const submitData = {
            shopName: this.formData.shopName,
            contacts: this.formData.contact,
            tel: this.formData.phone,
            businessHours: this.formData.openTime + '-' + this.formData.closeTime,
            logoUrl: shopImage.fileName,
            latitude: this.formData.locationInfo.latitude,
            longitude: this.formData.locationInfo.longitude,
            detailAddress: this.formData.address,
            qualificationsUrl: businessLicenses.map(img => img.fileName).join(','),
            cardFrontUrl: idCardFront.fileName,
            cardReverseUrl: idCardBack.fileName,
            serviceIds: this.formData.services.join(','),
            cityaddress: this.formData.locationInfo.address
          };

          console.log('submitData', submitData)
          return api.merchant.submitSettled(submitData);
        })
        .then(res => {
            if(res.code === 200) {
              this.examineStatus = 0
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
    
    validateBusinessHours() {
      const { openTime, closeTime } = this.formData
      
      const openMinutes = this.timeToMinutes(openTime)
      const closeMinutes = this.timeToMinutes(closeTime)
      
      if (openMinutes >= closeMinutes) {
        this.showToast('营业结束时间必须晚于开始时间')
        return false
      }
      
      if (closeMinutes - openMinutes < 60) {
        this.showToast('营业时间不能少于1小时')
        return false
      }
      
      return true
    },
    
    timeToMinutes(time) {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    },
    
    showToast(title) {
      uni.showToast({
        title,
        icon: 'none'
      })
    },
    
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
    
    previewPaymentImage(index) {
      uni.previewImage({
        urls: this.formData.paymentProofs,
        current: index
      })
    },
    
    deletePaymentImage(index) {
      this.formData.paymentProofs.splice(index, 1)
    },
    
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
    
    uploadImage(filePath) {
      return new Promise((resolve, reject) => {
        api.merchant.uploadFile(filePath)
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    
    backToHome() {
      uni.redirectTo({
        url: '/pages/merchant/merchant'
      })
    },
    
    async checkExamineStatus() {
      if (this.isUploading) {
        return;
      }
      
      try {
        const res = await api.merchant.getShopSelfExamineStatus()
        if (res.code === 200) {
          this.examineStatus = res.data.examineStatus
          
          switch(this.examineStatus) {
            case 0:
              this.currentTab = 2
              this.auditStatus = 0
              break
            case 1:
              this.currentTab = 2
              this.auditStatus = 1
              break
            case 2:
              this.currentTab = 2
              this.auditStatus = 2
              break
            case 3:
              uni.redirectTo({
                url: '/pages/merchant/merchant'
              })
              break
            case 4:
              this.currentTab = 0
              if (!this.hasShownRejectMessage) {
                uni.showModal({
                  title: '提示',
                  content: '您的入驻申请审核未通过，请重新提交',
                  showCancel: false
                })
                this.hasShownRejectMessage = true
              }
              break
            case 5:
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
        const uploadPromises = this.formData.paymentProofs.map(path => this.uploadImage(path))
        const results = await Promise.all(uploadPromises)
        
        const submitData = {
          paymentProofs: results.map(img => img.fileName).join(',')
        }

        const res = await api.merchant.submitPaymentProof(submitData)
        if (res.code === 200) {
          uni.showToast({
            title: '提交成功',
            icon: 'success'
          })
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
    },
    
    toggleService(id) {
      if (this.formData.services.includes(id)) {
        this.formData.services = this.formData.services.filter(i => i !== id)
      } else {
        this.formData.services.push(id)
      }
      this.showServicesError = this.formData.services.length === 0
    },

    // 获取配套服务列表
    async getServicesList() {
      try {
        const res = await api.merchant.getServicesList()
        if(res.code === 200) {
          this.servicesList = res.data.map(item => ({
            id: item.id,
            title: item.title
          }))
        }
      } catch(error) {
        uni.showToast({
          title: error.message || '获取配套服务列表失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.merchant-settled {
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  
  .page-container {
    flex: 1;
    overflow-y: scroll;
    padding-bottom: 200rpx;
    box-sizing: border-box;
  }
  
  .nav-tabs {
    background: #fff;
    position: sticky;
    top: 0;
    z-index: 99;
    display: flex;
    padding: 0 40rpx;
    
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
    margin-bottom: 30rpx;
    
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

      &.services-item {
        flex-direction: column;
        align-items: flex-start;
        padding: 30rpx;
        
        .label {
          margin-bottom: 20rpx;
        }
        
        .services-list {
          display: flex;
          flex-wrap: wrap;
          gap: 20rpx;
          width: 100%;
          
          .service-item {
            position: relative;
            padding: 16rpx 30rpx;
            background: #f5f5f5;
            border-radius: 32rpx;
            transition: all 0.3s ease;
            
            &.active {
              background: #4080ff;
              
              .service-name {
                color: #fff;
              }
              
              .check-icon {
                display: block;
              }
            }
            
            .service-name {
              font-size: 28rpx;
              color: #666;
              transition: all 0.3s ease;
            }
            
            .check-icon {
              display: none;
              position: absolute;
              top: -10rpx;
              right: -10rpx;
              width: 32rpx;
              height: 32rpx;
              line-height: 32rpx;
              text-align: center;
              background: #fff;
              color: #4080ff;
              border-radius: 50%;
              font-size: 24rpx;
              box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
            }
          }
        }
        
        .error-tip {
          font-size: 24rpx;
          color: #ff4d4f;
          margin-top: 16rpx;
        }
      }
    }
  }
  
  .bottom-btn {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 20rpx 30rpx calc(20rpx + env(safe-area-inset-bottom));
    background: #fff;
    box-shadow: 0 -2rpx 8rpx rgba(0,0,0,0.05);
    z-index: 100;
    
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

.fade-slide-leave-active.prev {
  transform: translateX(30rpx);
}

.fade-slide-enter-from.prev {
  transform: translateX(-30rpx);
}

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