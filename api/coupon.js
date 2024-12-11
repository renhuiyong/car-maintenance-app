// 优惠券状态枚举
export const COUPON_STATUS = {
  UNUSED: 0,    // 未使用
  USED: 1,      // 已使用
  EXPIRED: 2    // 已过期
}

// 模拟优惠券数据
const couponData = {
  [COUPON_STATUS.UNUSED]: [
    {
      id: 1,
      amount: 20,
      minAmount: 100,
      name: '满减优惠券',
      startDate: '2021-09-01',
      endDate: '2021-09-30',
      description: '仅限商城商品使用'
    },
    {
      id: 2,
      amount: 50,
      minAmount: 200,
      name: '满减优惠券',
      startDate: '2021-09-01',
      endDate: '2021-09-30',
      description: '仅限商城商品使用'
    }
  ],
  [COUPON_STATUS.USED]: [
    {
      id: 3,
      amount: 30,
      minAmount: 150,
      name: '满减优惠券',
      startDate: '2021-08-01',
      endDate: '2021-08-30',
      description: '仅限商城商品使用'
    }
  ],
  [COUPON_STATUS.EXPIRED]: [
    {
      id: 4,
      amount: 40,
      minAmount: 180,
      name: '满减优惠券',
      startDate: '2021-07-01',
      endDate: '2021-07-30',
      description: '仅限商城商品使用'
    }
  ]
}

/**
 * 获取优惠券列表
 * @param {number} status - 优惠券状态
 * @returns {Promise} 返回优惠券列表
 */
export function getCoupons(status) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(couponData[status] || [])
    }, 500) // 模拟网络请求延迟
  })
}

/**
 * 使用优惠券
 * @param {number} couponId - 优惠券ID
 * @returns {Promise} 返回使用结果
 */
export function useCoupon(couponId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 500)
  })
}

/**
 * 查询可用优惠券
 * @param {number} totalAmount - 订单总金额
 * @returns {Promise} 返回可用优惠券列表
 */
export function getAvailableCoupons(totalAmount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 从未使用的优惠券中筛选出可用的优惠券
      const availableCoupons = couponData[COUPON_STATUS.UNUSED].filter(
        coupon => totalAmount >= coupon.minAmount
      );
      
      // 按优惠金额从大到小排序
      availableCoupons.sort((a, b) => b.amount - a.amount);
      
      resolve(availableCoupons);
    }, 500);
  });
}

/**
 * 获取最优优惠券
 * @param {number} totalAmount - 订单总金额
 * @returns {Promise} 返回最优惠券
 */
export function getBestCoupon(totalAmount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const availableCoupons = couponData[COUPON_STATUS.UNUSED].filter(
        coupon => totalAmount >= coupon.minAmount
      );
      
      // 获取优惠金额最大的优惠券
      const bestCoupon = availableCoupons.reduce((best, current) => {
        return (!best || current.amount > best.amount) ? current : best;
      }, null);
      
      resolve(bestCoupon);
    }, 500);
  });
} 