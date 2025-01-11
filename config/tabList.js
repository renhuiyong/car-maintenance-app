export const merchantTabList = [
    {
      text: '我的店铺',
      icon: '/static/tabbar/wddp.png',
      selectedIcon: '/static/tabbar/wddp-active.png',
      path: '/packageUser/pages/myShop/myShop'
    },
    {
      text: '配件商城',
      icon: '/static/tabbar/shop.png',
      selectedIcon: '/static/tabbar/shop-active.png',
      path: '/packageMerchant/pages/merchantShop/merchantShop'
    },
    {
      text: '抢单大厅',
      icon: '/static/tabbar/shop.png',
      selectedIcon: '/static/tabbar/shop-active.png',
      path: '/packageOrder/pages/orderGrabbingHall/orderGrabbingHall'
    },
    {
      text: '我的',
      icon: '/static/tabbar/my.png',
      selectedIcon: '/static/tabbar/my-active.png',
      path: '/packageMerchant/pages/merchantMy/merchantMy'
    }
  ]

  export const supplyChainTabList = [
    {
      text: '我的店铺',
      icon: '/static/tabbar/wddp.png',
      selectedIcon: '/static/tabbar/wddp-active.png',
      path: '/packageSupplyChain/pages/supplyChainIndex/supplyChainIndex'
    },
    {
      text: '我的配件',
      icon: '/static/tabbar/shop.png',
      selectedIcon: '/static/tabbar/shop-active.png',
      path: '/packageSupplyChain/pages/supplyChainShop/supplyChainShop'
    },
    {
      text: '我的',
      icon: '/static/tabbar/my.png',
      selectedIcon: '/static/tabbar/my-active.png',
      path: '/packageSupplyChain/pages/supplyChainMy/supplyChainMy'
    }
  ]


export default {
    merchantTabList,
    supplyChainTabList
}