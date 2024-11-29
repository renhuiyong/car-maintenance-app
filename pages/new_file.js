wx.login({
  success: res => {
    if (res.code) {
      // 发送 res.code 到后台换取 openId, sessionKey
      wx.request({
        url: 'your_backend_url/wx/mini/login',
        method: 'POST',
        data: {
          code: res.code
        },
        success: response => {
          // 处理登录成功响应
          console.log(response.data);
        }
      })
    }
  }
})


wx.request({
  url: 'https://your-backend-api.com/api/image/generatePromotionalImage',
  method: 'GET',
  data: {
    promotionCode: 'your-promotion-code',  // 传入推广码
  },
  success(res) {
    if (res.statusCode === 200) {
      const imgUrl = res.data;  // 图片的二进制数据
      // 将二进制数据转换为 base64 格式的图片 URL
      const base64Image = wx.arrayBufferToBase64(imgUrl);
      const imageUrl = 'data:image/png;base64,' + base64Image;
      
      // 在页面中展示合成后的图片
      wx.previewImage({
        urls: [imageUrl]
      });
    }
  }
});
