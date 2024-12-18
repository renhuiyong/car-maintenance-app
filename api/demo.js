// 指定维修提交数据
const assignRepairOrder = {
    orderType: 1, // 指定维修
    shopId: '',
    shopName: '',
    shopAddress: '',
    description: this.description,
    voicePath: this.voicePath,
    voiceDuration: this.duration,
    images: this.uploadedImages.join(','),
    needTransport: this.needTransport ? 1 : 0,
    transportFee: this.transportFee,
    contactName: this.contactInfo.name,
    contactPhone: this.contactInfo.phone,
    contactAddress: this.contactInfo.address,
    contactLatitude: this.contactInfo.latitude,
    contactLongitude: this.contactInfo.longitude
  }
  
  // 抢单维修提交数据
  const grabRepairOrder = {
    orderType: 2, // 抢单维修
    description: this.description,
    voicePath: this.voicePath,
    voiceDuration: this.duration,
    images: this.uploadedImages.join(','),
    needTransport: this.needTransport ? 1 : 0,
    transportFee: this.transportFee,
    contactName: this.contactName,
    contactPhone: this.contactPhone,
    contactAddress: this.address,
    contactLatitude: this.latitude,
    contactLongitude: this.longitude
  }