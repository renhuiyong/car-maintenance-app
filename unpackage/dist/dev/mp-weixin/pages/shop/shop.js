(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["pages/shop/shop"],{

/***/ 42:
/*!**************************************************************************************!*\
  !*** D:/HBuilderProjects/car-maintenance-app/main.js?{"page":"pages%2Fshop%2Fshop"} ***!
  \**************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(wx, createPage) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
__webpack_require__(/*! uni-pages */ 26);
var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 25));
var _shop = _interopRequireDefault(__webpack_require__(/*! ./pages/shop/shop.vue */ 43));
// @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__;
createPage(_shop.default);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["createPage"]))

/***/ }),

/***/ 43:
/*!*******************************************************************!*\
  !*** D:/HBuilderProjects/car-maintenance-app/pages/shop/shop.vue ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _shop_vue_vue_type_template_id_71bf3ec6___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./shop.vue?vue&type=template&id=71bf3ec6& */ 44);
/* harmony import */ var _shop_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./shop.vue?vue&type=script&lang=js& */ 46);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _shop_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _shop_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _shop_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shop.vue?vue&type=style&index=0&lang=css& */ 48);
/* harmony import */ var _HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../HBuilderX.3.7.9.20230324/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/runtime/componentNormalizer.js */ 32);

var renderjs





/* normalize component */

var component = Object(_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _shop_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _shop_vue_vue_type_template_id_71bf3ec6___WEBPACK_IMPORTED_MODULE_0__["render"],
  _shop_vue_vue_type_template_id_71bf3ec6___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  null,
  null,
  false,
  _shop_vue_vue_type_template_id_71bf3ec6___WEBPACK_IMPORTED_MODULE_0__["components"],
  renderjs
)

component.options.__file = "pages/shop/shop.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 44:
/*!**************************************************************************************************!*\
  !*** D:/HBuilderProjects/car-maintenance-app/pages/shop/shop.vue?vue&type=template&id=71bf3ec6& ***!
  \**************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_shop_vue_vue_type_template_id_71bf3ec6___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../HBuilderX.3.7.9.20230324/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../HBuilderX.3.7.9.20230324/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!../../../../HBuilderX.3.7.9.20230324/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!../../../../HBuilderX.3.7.9.20230324/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!../../../../HBuilderX.3.7.9.20230324/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../HBuilderX.3.7.9.20230324/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./shop.vue?vue&type=template&id=71bf3ec6& */ 45);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_shop_vue_vue_type_template_id_71bf3ec6___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_shop_vue_vue_type_template_id_71bf3ec6___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return _HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_shop_vue_vue_type_template_id_71bf3ec6___WEBPACK_IMPORTED_MODULE_0__["recyclableRender"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "components", function() { return _HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_shop_vue_vue_type_template_id_71bf3ec6___WEBPACK_IMPORTED_MODULE_0__["components"]; });



/***/ }),

/***/ 45:
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/HBuilderProjects/car-maintenance-app/pages/shop/shop.vue?vue&type=template&id=71bf3ec6& ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return recyclableRender; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "components", function() { return components; });
var components
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  var l0 = _vm.isSearching
    ? _vm.__map(_vm.searchResults, function (item, index) {
        var $orig = _vm.__get_orig(item)
        var m0 = _vm.getCartQuantity(item.categoryIndex, item.productIndex)
        var m1 = m0
          ? _vm.getCartQuantity(item.categoryIndex, item.productIndex)
          : null
        var m2 = m0
          ? _vm.isStockLimit(item.categoryIndex, item.productIndex)
          : null
        var m3 = !m0
          ? _vm.isStockLimit(item.categoryIndex, item.productIndex)
          : null
        return {
          $orig: $orig,
          m0: m0,
          m1: m1,
          m2: m2,
          m3: m3,
        }
      })
    : null
  var l2 = _vm.__map(_vm.categories, function (category, categoryIndex) {
    var $orig = _vm.__get_orig(category)
    var l1 = _vm.__map(category.items, function (item, index) {
      var $orig = _vm.__get_orig(item)
      var m4 = _vm.getCartQuantity(categoryIndex, index)
      var m5 = m4 ? _vm.getCartQuantity(categoryIndex, index) : null
      var m6 = m4 ? _vm.isStockLimit(categoryIndex, index) : null
      var m7 = !m4 ? _vm.isStockLimit(categoryIndex, index) : null
      return {
        $orig: $orig,
        m4: m4,
        m5: m5,
        m6: m6,
        m7: m7,
      }
    })
    return {
      $orig: $orig,
      l1: l1,
    }
  })
  var g0 = _vm.showCartPopup ? _vm.cartList.length : null
  var g1 = _vm.showCartPopup ? _vm.cartList.length : null
  var l3 =
    _vm.showCartPopup && !(g1 === 0)
      ? _vm.__map(_vm.cartList, function (item, index) {
          var $orig = _vm.__get_orig(item)
          var m8 = _vm.isStockLimit(item.categoryIndex, item.productIndex)
          return {
            $orig: $orig,
            m8: m8,
          }
        })
      : null
  _vm.$mp.data = Object.assign(
    {},
    {
      $root: {
        l0: l0,
        l2: l2,
        g0: g0,
        g1: g1,
        l3: l3,
      },
    }
  )
}
var recyclableRender = false
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 46:
/*!********************************************************************************************!*\
  !*** D:/HBuilderProjects/car-maintenance-app/pages/shop/shop.vue?vue&type=script&lang=js& ***!
  \********************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_shop_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../HBuilderX.3.7.9.20230324/HBuilderX/plugins/uniapp-cli/node_modules/babel-loader/lib!../../../../HBuilderX.3.7.9.20230324/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!../../../../HBuilderX.3.7.9.20230324/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!../../../../HBuilderX.3.7.9.20230324/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../HBuilderX.3.7.9.20230324/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./shop.vue?vue&type=script&lang=js& */ 47);
/* harmony import */ var _HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_shop_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_shop_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_shop_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_shop_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_shop_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 47:
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/HBuilderProjects/car-maintenance-app/pages/shop/shop.vue?vue&type=script&lang=js& ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ 18));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ 11));
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

// 在 methods 外部定义节流函数
var throttle = function throttle(fn, delay) {
  var timer = null;
  return function () {
    var _this = this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (timer) return;
    timer = setTimeout(function () {
      fn.apply(_this, args);
      timer = null;
    }, delay);
  };
};

// 修改商品项的高度常量
var ITEM_HEIGHT = 200; // 实际商品项度，包括内边距和框
var _default = {
  data: function data() {
    return {
      categories: [{
        id: 0,
        name: '刹车系统',
        items: [{
          id: '1001',
          image: '/static/products/shangpin_default.png',
          name: '电动车刹车片',
          stock: 5,
          price: 20,
          detail: "<div class=\"detail-content\">\n\t\t\t\t\t\t\t\t<h3>\u4EA7\u54C1\u53C2\u6570</h3>\n\t\t\t\t\t\t\t\t<p>\u6750\u8D28\uFF1A\u9AD8\u5BC6\u9676\u74F7\u590D\u6750\u6599</p>\n\t\t\t\t\t\t\t\t<p>\u9002\u7528\u8F66\u578B\uFF1A\u901A\u7528\u578B</p>\n\t\t\t\t\t\t\t\t<p>\u89C4\u683C\uFF1A\u6807\u51C6\u89C4\u683C</p>\n\t\t\t\t\t\t\t\t<p>\u5305\u88C5\uFF1A1\u5BF9\u88C5\uFF082\u7247\uFF09</p>\n\t\t\t\t\t\t\t\t<h3>\u4EA7\u54C1\u7279\u70B9</h3>\n\t\t\t\t\t\t\t\t<ul>\n\t\t\t\t\t\t\t\t\t<li>\u9AD8\u6027\u80FD\u9676\u74F7\u914D\u65B9\uFF0C\u5236\u52A8\u529B\u5F3A</li>\n\t\t\t\t\t\t\t\t\t<li>\u4F4E\u566A\u97F3\uFF0C\u4E0D\u4F24\u5236\u76D8</li>\n\t\t\t\t\t\t\t\t\t<li>\u8010\u9AD8\u6E29\uFF0C\u5BFF\u547D\u957F</li>\n\t\t\t\t\t\t\t\t\t<li>\u5B89\u88C5\u4FBF\u6377\uFF0C\u901A\u7528\u6027\u5F3A</li>\n\t\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t\t<h3>\u4F7F\u7528\u8BF4\u660E</h3>\n\t\t\t\t\t\t\t\t<p>1. \u68C0\u67E5\u539F\u5239\u8F66\u7247\u78E8\u635F\u60C5\u51B5</p>\n\t\t\t\t\t\t\t\t<p>2. \u66F4\u6362\u524D\u8BF7\u6E05\u7406\u5239\u8F66\u7247\u5EA7</p>\n\t\t\t\t\t\t\t\t<p>3. \u5BF9\u51C6\u5361\u69FD\u5B89\u88C5\u65B0\u5239\u8F66\u7247</p>\n\t\t\t\t\t\t\t\t<p>4. \u6D4B\u8BD5\u5236\u52A8\u6548\u679C</p>\n\t\t\t\t\t\t\t</div>"
        }
        // ... 其他刹车系统商品
        ]
      }, {
        id: 1,
        name: '传感系统',
        items: [{
          id: '2001',
          image: '/static/products/shangpin_default.png',
          name: '传感系统1速度传感器',
          stock: 50,
          price: 45,
          detail: "<div class=\"detail-content\">\n\t\t\t\t\t\t\t\t<h3>\u4EA7\u54C1\u53C2\u6570</h3>\n\t\t\t\t\t\t\t\t<p>\u5DE5\u4F5C\u7535\u538B\uFF1ADC 12V</p>\n\t\t\t\t\t\t\t\t<p>\u611F\u5E94\u8DDD\u79BB\uFF1A3-8mm\u53EF\u8C03</p>\n\t\t\t\t\t\t\t\t<p>\u9632\u6C34\u7B49\u7EA7\uFF1AIP65</p>\n\t\t\t\t\t\t\t\t<p>\u7EBF\u957F\uFF1A50cm</p>\n\t\t\t\t\t\t\t\t<h3>\u4EA7\u54C1\u7279\u70B9</h3>\n\t\t\t\t\t\t\t\t<ul>\n\t\t\t\t\t\t\t\t\t<li>\u7CBE\u51C6\u611F\u5E94\uFF0C\u53CD\u5E94\u7075\u654F</li>\n\t\t\t\t\t\t\t\t\t<li>\u9632\u6C34\u9632\u5C18</li>\n\t\t\t\t\t\t\t\t\t<li>\u5B89\u88C5\u4FBF\u6377</li>\n\t\t\t\t\t\t\t\t\t<li>\u4F7F\u7528\u5BFF\u547D\u957F</li>\n\t\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t\t<h3>\u9002\u7528\u8303\u56F4</h3>\n\t\t\t\t\t\t\t\t<p>\u9002\u7528\u4E8E\u5404\u7C7B\u7535\u52A8\u8F66\u901F\u5EA6\u68C0\u6D4B\u7CFB\u7EDF</p>\n\t\t\t\t\t\t\t</div>"
        }]
      },
      // ... 其他分类
      {
        id: 2,
        name: '照明系统',
        items: [{
          id: '3001',
          image: '/static/products/shangpin_default.png',
          name: '照明系统LED大灯',
          stock: 45,
          price: 40,
          detail: "<div class=\"detail-content\">\n\t\t\t\t\t\t\t\t<h3>\u54C1\u53C2\u6570</h3>\n\t\t\t\t\t\t\t\t<p>\u529F\u7387\uFF1A12W</p>\n\t\t\t\t\t\t\t\t<p>\u7535\u538B\uFF1A12V</p>\n\t\t\t\t\t\t\t\t<p>\u4EAE\u5EA6\uFF1A1200\u6D41\u660E</p>\n\t\t\t\t\t\t\t\t<p>\u9632\u7B49\uFF1AIP65</p>\n\t\t\t\t\t\t\t\t<h3>\u4EA7\u54C1\u7279\u70B9</h3>\n\t\t\t\t\t\t\t\t<ul>\n\t\t\t\t\t\t\t\t\t<li>\u8D85\u9AD8\u4EAE\u5EA6LED</li>\n\t\t\t\t\t\t\t\t\t<li>\u4F4E\u8017\u8BBE</li>\n\t\t\t\t\t\t\t\t\t<li>\u9632\u6C34\u9632\u5C18</li>\n\t\t\t\t\t\t\t\t\t<li>\u5BFF\u547D\u957F\u8FBE50000\u5C0F\u65F6</li>\n\t\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t</div>"
        }, {
          id: '3002',
          image: '/static/products/shangpin_default.png',
          name: '转向灯组',
          stock: 60,
          price: 25,
          detail: "<div class=\"detail-content\">\n\t\t\t\t\t\t\t\t<h3>\u4EA7\u54C1\u53C2\u6570</h3>\n\t\t\t\t\t\t\t\t<p>\u7535\u538B\uFF1A12V</p>\n\t\t\t\t\t\t\t\t<p>\u529F\u7387\uFF1A5W</p>\n\t\t\t\t\t\t\t\t<p>\u989C\u8272\uFF1A\u7425\u73C0\u8272</p>\n\t\t\t\t\t\t\t\t<h3>\u4EA7\u54C1\u7279\u70B9</h3>\n\t\t\t\t\t\t\t\t<ul>\n\t\t\t\t\t\t\t\t\t<li>\u9AD8\u4EAELED\u706F\u73E0</li>\n\t\t\t\t\t\t\t\t\t<li>\u95EA\u70C1\u9891\u7387\u7A33\u5B9A</li>\n\t\t\t\t\t\t\t\t\t<li>\u5B89\u88C5\u7B80\u4FBF</li>\n\t\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t</div>"
        }]
      }, {
        id: 3,
        name: '充电系统',
        items: [{
          id: '4001',
          image: '/static/products/shangpin_default.png',
          name: '快速充电器',
          stock: 30,
          price: 65,
          detail: "<div class=\"detail-content\">\n\t\t\t\t\t\t\t\t<h3>\u4EA7\u54C1\u6570</h3>\n\t\t\t\t\t\t\t\t<p>\u8F93\u5165\u7535\u538B\uFF1A220V</p>\n\t\t\t\t\t\t\t\t<p>\u8F93\u51FA\u7535\u538B\uFF1A48V</p>\n\t\t\t\t\t\t\t\t<p>\u5145\u7535\u7535\u6D41\uFF1A2A</p>\n\t\t\t\t\t\t\t\t<h3>\u4EA7\u54C1\u70B9</h3>\n\t\t\t\t\t\t\t\t<ul>\n\t\t\t\t\t\t\t\t\t<li>\u667A\u80FD\u5145\u7535\u4FDD\u62A4</li>\n\t\t\t\t\t\t\t\t\t<li>\u5FEB\u901F\u5145\u7535\u6280\u672F</li>\n\t\t\t\t\t\t\t\t\t<li>\u591A\u91CD\u5B89\u5168\u4FDD\u62A4</li>\n\t\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t</div>"
        }, {
          id: '4002',
          image: '/static/products/shangpin_default.png',
          name: '充电口',
          stock: 80,
          price: 15,
          detail: "<div class=\"detail-content\">\n\t\t\t\t\t\t\t\t<h3>\u4EA7\u54C1\u53C2\u6570</h3>\n\t\t\t\t\t\t\t\t<p>\u6750\u8D28\uFF1A\u94DC\u5408\u91D1</p>\n\t\t\t\t\t\t\t\t<p>\u9002\u914D\uFF1A\u901A\u7528\u578B</p>\n\t\t\t\t\t\t\t\t<h3>\u54C1\u7279\u70B9</h3>\n\t\t\t\t\t\t\t\t<ul>\n\t\t\t\t\t\t\t\t\t<li>\u63A5\u89E6\u826F\u597D</li>\n\t\t\t\t\t\t\t\t\t<li>\u8010\u7528\u9632\u8150</li>\n\t\t\t\t\t\t\t\t\t<li>\u5B89\u88C5\u65B9\u4FBF</li>\n\t\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t</div>"
        }]
      }, {
        id: 4,
        name: '控制系统',
        items: [{
          id: '5001',
          image: '/static/products/shangpin_default.png',
          name: '控制器',
          stock: 40,
          price: 120,
          detail: "<div class=\"detail-content\">\n\t\t\t\t\t\t\t\t<h3>\u54C1\u53C2\u6570</h3>\n\t\t\t\t\t\t\t\t<p>\u5DE5\u4F5C\u7535\u538B\uFF1A48V</p>\n\t\t\t\t\t\t\t\t<p>\u6700\u5927\u7535\u6D41\uFF1A30A</p>\n\t\t\t\t\t\t\t\t<p>\u9632\u6C34\u7B49\u7EA7\uFF1AIP54</p>\n\t\t\t\t\t\t\t\t<h3>\u4EA7\u54C1\u7279\u70B9</h3>\n\t\t\t\t\t\t\t\t<ul>\n\t\t\t\t\t\t\t\t\t<li>\u667A\u80FD\u63A7\u5236\u7CFB\u7EDF</li>\n\t\t\t\t\t\t\t\t\t<li>\u8FC7\u8F7D\u4FDD\u62A4</li>\n\t\t\t\t\t\t\t\t\t<li>\u9632\u6C34\u8BBE\u8BA1</li>\n\t\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t</div>"
        }, {
          id: '5002',
          image: '/static/products/shangpin_default.png',
          name: '调速器',
          stock: 55,
          price: 85,
          detail: "<div class=\"detail-content\">\n\t\t\t\t\t\t\t\t<h3>\u4EA7\u54C1\u53C2\u6570</h3>\n\t\t\t\t\t\t\t\t<p>\u8C03\u901F\u8303\u56F4\uFF1A1-5\u6863</p>\n\t\t\t\t\t\t\t\t<p>\u9002\u914D\u7535\u538B\uFF1A48V</p>\n\t\t\t\t\t\t\t\t<h3>\u4EA7\u54C1\u7279\u70B9</h3>\n\t\t\t\t\t\t\t\t<ul>\n\t\t\t\t\t\t\t\t\t<li>\u5E73\u7A33\u8C03\u901F</li>\n\t\t\t\t\t\t\t\t\t<li>\u9632\u6C34\u8BBE\u8BA1</li>\n\t\t\t\t\t\t\t\t\t<li>\u5B89\u88C5\u4FBF\u6377</li>\n\t\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t</div>"
        }]
      }, {
        id: 5,
        name: '车身件',
        items: [{
          id: '6001',
          image: '/static/products/shangpin_default.png',
          name: '后视镜',
          stock: 88,
          price: 20,
          detail: "<div class=\"detail-content\">\n\t\t\t\t\t\t\t\t<h3>\u4EA7\u54C1\u6570</h3>\n\t\t\t\t\t\t\t\t<p>\u6750\u8D28\uFF1AABS+\u73BB\u7483</p>\n\t\t\t\t\t\t\t\t<p>\u5C3A\u5BF8\uFF1A\u6807\u51C6\u578B</p>\n\t\t\t\t\t\t\t\t<h3>\u4EA7\u54C1\u7279\u70B9</h3>\n\t\t\t\t\t\t\t\t<ul>\n\t\t\t\t\t\t\t\t\t<li>\u89C6\u91CE\u6E05\u6670</li>\n\t\t\t\t\t\t\t\t\t<li>\u9632\u9707\u8BA1</li>\n\t\t\t\t\t\t\t\t\t<li>\u5B89\u88C5\u65B9\u4FBF</li>\n\t\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t</div>"
        }, {
          id: '6002',
          image: '/static/products/shangpin_default.png',
          name: '泥板',
          stock: 100,
          price: 15,
          detail: "<div class=\"detail-content\">\n\t\t\t\t\t\t\t\t<h3>\u4EA7\u54C1\u53C2\u6570</h3>\n\t\t\t\t\t\t\t\t<p>\u6750\u8D28\uFF1APP\u5851\u6599</p>\n\t\t\t\t\t\t\t\t<p>\u989C\u8272\uFF1A\u9ED1\u8272</p>\n\t\t\t\t\t\t\t\t<h3>\u4EA7\u54C1\u7279\u70B9</h3>\n\t\t\t\t\t\t\t\t<ul>\n\t\t\t\t\t\t\t\t\t<li>\u9632\u6C34\u8010\u7528</li>\n\t\t\t\t\t\t\t\t\t<li>\u5B89\u88C5\u7B80\u5355</li>\n\t\t\t\t\t\t\t\t\t<li>\u9632\u6CE5\u6548\u679C\u597D</li>\n\t\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t</div>"
        }]
      }],
      currentCategory: 0,
      cartList: [],
      // 购物车列表
      cartCount: 0,
      // 购物车数量
      totalPrice: 0,
      // 总价
      scrollTop: 0,
      heightArr: [],
      // 存储每个分类品列表的高度
      showCartPopup: false,
      // 控制购物车弹出层显示
      searchKeyword: '',
      // 搜索关键词
      searchResults: [],
      // 搜索结果
      isSearching: false,
      // 是否在搜索状态
      loading: false,
      // 加载状态
      refreshing: false,
      // 刷新状态
      page: 1,
      // 当前页码
      hasMore: true,
      // 是否有更多数据
      animation: null,
      // 添加动画实例
      showCartAnimation: false,
      cartAnimationStyle: {
        left: '0px',
        top: '0px'
      },
      cartDot: {
        show: false,
        x: 0,
        y: 0,
        translateX: 0,
        translateY: 0,
        opacity: 1
      },
      isManualSwitching: false // 添加手动切换标记
    };
  },

  computed: {
    currentProducts: function currentProducts() {
      return this.categories[this.currentCategory] || [];
    },
    // 获取商品购物车中的数量
    getCartQuantity: function getCartQuantity() {
      var _this2 = this;
      return function (categoryIndex, productIndex) {
        var cartItem = _this2.cartList.find(function (item) {
          return item.categoryIndex === categoryIndex && item.productIndex === productIndex;
        });
        return cartItem ? cartItem.quantity : 0;
      };
    }
  },
  onReady: function onReady() {
    this.calculateHeight();
  },
  onLoad: function onLoad() {
    // 加载本地存储的购物车数据
    var cartData = uni.getStorageSync('cartData');
    if (cartData) {
      this.cartList = JSON.parse(cartData);
      this.updateCartInfo();
    }
  },
  methods: {
    // 修改获取商品的方法
    getProducts: function getProducts(categoryIndex) {
      var _this$categories$cate;
      return ((_this$categories$cate = this.categories[categoryIndex]) === null || _this$categories$cate === void 0 ? void 0 : _this$categories$cate.items) || [];
    },
    // 修改切换分类方法
    switchCategory: function switchCategory(index) {
      var _this3 = this;
      if (this.currentCategory === index) return;
      this.currentCategory = index;
      this.isManualSwitching = true;

      // 计算目标分类的滚动位置
      var targetScrollTop = 0;
      var pxRatio = uni.getSystemInfoSync().windowWidth / 750;
      for (var i = 0; i < index; i++) {
        var categoryItems = this.categories[i].items || [];
        // 每个分类的总高 = 标题高度(88rpx) + 商品总高度(每个商品200rpx)
        targetScrollTop += (88 + categoryItems.length * 200) * pxRatio;
      }

      // 设置滚动位置
      this.$nextTick(function () {
        _this3.scrollTop = targetScrollTop + 1;
        setTimeout(function () {
          _this3.isManualSwitching = false;
        }, 300);
      });
    },
    // 修改滚动监听方法
    onProductScroll: throttle(function (e) {
      if (this.isManualSwitching) return;
      var scrollTop = e.detail.scrollTop;
      var pxRatio = uni.getSystemInfoSync().windowWidth / 750;
      var currentIndex = 0;
      var heightSum = 0;
      for (var i = 0; i < this.categories.length; i++) {
        var categoryItems = this.categories[i].items || [];
        var categoryHeight = (88 + categoryItems.length * 200) * pxRatio;
        heightSum += categoryHeight;
        if (scrollTop < heightSum) {
          currentIndex = i;
          break;
        }
      }
      if (this.currentCategory !== currentIndex) {
        this.currentCategory = currentIndex;
      }
    }, 100),
    goToMerchant: function goToMerchant() {
      // 跳转到商家页面
      uni.navigateTo({
        url: '/pages/merchant/merchant'
      });
    },
    // 修改加商品到购物车方法
    addToCart: function addToCart(categoryIndex, productIndex) {
      // 从 categories[categoryIndex].items 中获取品
      var product = this.categories[categoryIndex].items[productIndex];
      if (!product) {
        uni.showToast({
          title: '商品信息不完整',
          icon: 'none'
        });
        return;
      }
      var cartItem = this.cartList.find(function (item) {
        return item.categoryIndex === categoryIndex && item.productIndex === productIndex;
      });

      // 检查库存
      var currentQuantity = cartItem ? cartItem.quantity : 0;
      if (currentQuantity >= product.stock) {
        uni.showToast({
          title: "\u5DF2\u8FBE\u5230\u5E93\u5B58\u9650".concat(product.stock, "\u4EF6"),
          icon: 'none',
          duration: 2000
        });
        return;
      }
      if (cartItem) {
        cartItem.quantity++;
        // 当快到达库存上限时给出提示
        if (cartItem.quantity === product.stock) {
          uni.showToast({
            title: '已达到库存上限',
            icon: 'none',
            duration: 2000
          });
        } else if (product.stock - cartItem.quantity <= 2) {
          uni.showToast({
            title: "\u4EC5\u5269".concat(product.stock - cartItem.quantity, "\u4EF6"),
            icon: 'none',
            duration: 2000
          });
        }
      } else {
        this.cartList.push(_objectSpread({
          categoryIndex: categoryIndex,
          productIndex: productIndex,
          quantity: 1
        }, product));
        // 如果商品库存较少，首次添加时也给出提示
        if (product.stock <= 3) {
          uni.showToast({
            title: "\u5E93\u5B58\u4EC5\u5269".concat(product.stock, "\u4EF6"),
            icon: 'none',
            duration: 2000
          });
        }
      }
      this.updateCartInfo();
      // 更新后保存到本地存储
      this.saveCartData();
    },
    // 从购物车移除商品
    removeFromCart: function removeFromCart(categoryIndex, productIndex) {
      var cartItem = this.cartList.find(function (item) {
        return item.categoryIndex === categoryIndex && item.productIndex === productIndex;
      });
      if (cartItem && cartItem.quantity > 1) {
        cartItem.quantity--;
      } else {
        var index = this.cartList.findIndex(function (item) {
          return item.categoryIndex === categoryIndex && item.productIndex === productIndex;
        });
        if (index > -1) {
          this.cartList.splice(index, 1);
        }
      }
      this.updateCartInfo();
      this.saveCartData();
    },
    // 更新物车信息
    updateCartInfo: function updateCartInfo() {
      this.cartCount = this.cartList.reduce(function (total, item) {
        return total + item.quantity;
      }, 0);
      this.totalPrice = this.cartList.reduce(function (total, item) {
        return total + item.price * item.quantity;
      }, 0);
    },
    // 显示购物车
    showCart: function showCart() {
      this.showCartPopup = true;
    },
    // 隐藏购物车
    hideCart: function hideCart() {
      this.showCartPopup = false;
    },
    // 清空购物车
    clearCart: function clearCart() {
      var _this4 = this;
      uni.showModal({
        title: '提示',
        content: '确定要清空购物车吗？',
        success: function success(res) {
          if (res.confirm) {
            _this4.cartList = [];
            _this4.updateCartInfo();
            _this4.hideCart();
            // 清除本地存储
            _this4.saveCartData();
          }
        }
      });
    },
    // 修改去结按钮点击事
    goToCheckout: function goToCheckout() {
      if (this.cartCount === 0) {
        uni.showToast({
          title: '请先选择商品',
          icon: 'none'
        });
        return;
      }

      // TODO: 跳转结算页面
      uni.navigateTo({
        url: '/pages/checkout/checkout'
      });
    },
    // 将 isStockLimit 移到 methods 中
    isStockLimit: function isStockLimit(categoryIndex, productIndex) {
      var product = this.categories[categoryIndex].items[productIndex];
      if (!product) return false;
      var cartItem = this.cartList.find(function (item) {
        return item.categoryIndex === categoryIndex && item.productIndex === productIndex;
      });
      var currentQuantity = cartItem ? cartItem.quantity : 0;
      return currentQuantity >= product.stock;
    },
    // 修改搜索商品方法
    searchProducts: function searchProducts() {
      var _this5 = this;
      if (!this.searchKeyword.trim()) {
        this.isSearching = false;
        return;
      }
      this.isSearching = true;
      this.searchResults = [];

      // 遍历所有分类的商品
      this.categories.forEach(function (category, categoryIndex) {
        var _this5$searchResults;
        var results = category.items.filter(function (product) {
          return product.name.toLowerCase().includes(_this5.searchKeyword.toLowerCase());
        }).map(function (product, productIndex) {
          return _objectSpread(_objectSpread({}, product), {}, {
            categoryIndex: categoryIndex,
            productIndex: productIndex
          });
        });
        (_this5$searchResults = _this5.searchResults).push.apply(_this5$searchResults, (0, _toConsumableArray2.default)(results));
      });
    },
    // 清除搜索
    clearSearch: function clearSearch() {
      this.searchKeyword = '';
      this.isSearching = false;
      this.searchResults = [];
    },
    // 下拉刷新
    onPullDownRefresh: function onPullDownRefresh() {
      var _this6 = this;
      if (this.refreshing) return;
      this.refreshing = true;

      // 模拟刷新数据
      setTimeout(function () {
        _this6.refreshing = false;
        uni.stopPullDownRefresh();
        uni.showToast({
          title: '刷新成功',
          icon: 'success'
        });
      }, 1000);
    },
    // 拉加载更多
    onReachBottom: function onReachBottom() {
      var _this7 = this;
      if (this.loading || !this.hasMore) return;
      this.loading = true;

      // 模拟加载更多数据
      setTimeout(function () {
        _this7.page++;
        if (_this7.page >= 3) {
          _this7.hasMore = false;
        }
        _this7.loading = false;
      }, 1000);
    },
    // 保存购车数到本地存储
    saveCartData: function saveCartData() {
      uni.setStorageSync('cartData', JSON.stringify(this.cartList));
    },
    // 修改跳转到详情页方法
    goToDetail: function goToDetail(product, categoryIndex, productIndex) {
      var productInfo = this.isSearching ? product : this.categories[categoryIndex].items[productIndex];
      if (!productInfo) {
        uni.showToast({
          title: '商品信息不完整',
          icon: 'none'
        });
        return;
      }

      // 将商品详情数据存储到本地
      uni.setStorageSync('currentProductDetail', productInfo.detail);

      // 构建其他查询参数
      var query = {
        id: productInfo.id,
        categoryIndex: categoryIndex,
        productIndex: productIndex,
        name: productInfo.name,
        price: productInfo.price,
        stock: productInfo.stock,
        image: productInfo.image
      };

      // 将对象转换为查询字符串
      var queryString = Object.keys(query).map(function (key) {
        return "".concat(key, "=").concat(encodeURIComponent(query[key]));
      }).join('&');
      uni.navigateTo({
        url: "/pages/productDetail/productDetail?".concat(queryString)
      });
    },
    // 修改 handleAddToCart 方法
    handleAddToCart: function handleAddToCart(categoryIndex, productIndex, event) {
      var _this8 = this;
      // 先检查是否达到库存限制
      if (this.isStockLimit(categoryIndex, productIndex)) {
        uni.showToast({
          title: '已达到库存上限',
          icon: 'none'
        });
        return;
      }

      // 如果是从购物车弹出层点击，直接添加商品
      if (!event || !event.touches) {
        this.addToCart(categoryIndex, productIndex);
        return;
      }

      // 以下是带动画效果的添商品逻辑
      var touch = event.touches[0];

      // 使用uni的API获取购物车图标位置
      var query = uni.createSelectorQuery();
      query.select('.cart-icon').boundingClientRect(function (data) {
        if (!data) return;

        // 置球初始位和式
        _this8.cartDot = {
          show: true,
          x: touch.clientX,
          y: touch.clientY,
          translateX: 0,
          translateY: 0,
          opacity: 1
        };

        // 计算位移距离
        var endX = data.left + data.width / 2 - touch.clientX;
        var endY = data.top + data.height / 2 - touch.clientY;

        // 延迟一帧设置终点位置，触发动画
        setTimeout(function () {
          _this8.cartDot = _objectSpread(_objectSpread({}, _this8.cartDot), {}, {
            translateX: endX,
            translateY: endY,
            opacity: 0
          });

          // 动画结束后处理
          setTimeout(function () {
            _this8.cartDot.show = false;
            _this8.addToCart(categoryIndex, productIndex);
          }, 500);
        }, 50);
      }).exec();
    },
    // 计算高度的方法也需要修改
    calculateHeight: function calculateHeight() {
      var _this9 = this;
      var height = 0;
      this.heightArr = [];
      this.categories.forEach(function (category, index) {
        var _category$items;
        var categoryHeight = (((_category$items = category.items) === null || _category$items === void 0 ? void 0 : _category$items.length) || 0) * 200;
        height += categoryHeight;
        _this9.heightArr.push(height);
      });
    },
    // 修改处理数量输入的方法
    handleQuantityInput: function handleQuantityInput(event, categoryIndex, productIndex) {
      var value = event.detail.value;
      // 只允许输入数字，去除小数点
      var numValue = value.replace(/\D/g, '');
      var cartItem = this.cartList.find(function (item) {
        return item.categoryIndex === categoryIndex && item.productIndex === productIndex;
      });
      if (!cartItem) return;

      // 允许输入框为空，此时不更新购物车总价和数量
      if (numValue === '') {
        cartItem._tempValue = ''; // 使用临时值存储空字符串
        return;
      }
      var newQuantity = parseInt(numValue);

      // 如果输入0，直接移除商品
      if (newQuantity === 0) {
        var index = this.cartList.findIndex(function (item) {
          return item.categoryIndex === categoryIndex && item.productIndex === productIndex;
        });
        if (index > -1) {
          this.cartList.splice(index, 1);
        }
        this.updateCartInfo();
        this.saveCartData();
        return;
      }
      var product = this.categories[categoryIndex].items[productIndex];
      var stock = product.stock;

      // 限制最大数量不超过库存
      if (newQuantity > stock) {
        cartItem.quantity = stock;
        uni.showToast({
          title: "\u5DF2\u8FBE\u5230\u5E93\u5B58\u4E0A\u9650".concat(stock, "\u4EF6"),
          icon: 'none'
        });
      } else {
        cartItem.quantity = newQuantity;
      }
      delete cartItem._tempValue; // 清除临时值
      this.updateCartInfo();
      this.saveCartData();
    },
    // 修改处理输入框失焦的方法
    handleQuantityBlur: function handleQuantityBlur(categoryIndex, productIndex) {
      var cartItem = this.cartList.find(function (item) {
        return item.categoryIndex === categoryIndex && item.productIndex === productIndex;
      });
      if (cartItem) {
        // 如果是空值或0，移除商品
        if (cartItem._tempValue === '' || cartItem.quantity === 0) {
          var index = this.cartList.findIndex(function (item) {
            return item.categoryIndex === categoryIndex && item.productIndex === productIndex;
          });
          if (index > -1) {
            this.cartList.splice(index, 1);
          }
          this.updateCartInfo();
          this.saveCartData();
          return;
        }

        // 清除临时值
        delete cartItem._tempValue;

        // 确保数量是有效数字
        cartItem.quantity = parseInt(cartItem.quantity) || 1;
        this.updateCartInfo();
        this.saveCartData();
      }
    }
  },
  created: function created() {
    // 在组件创时应用节流
    this.switchCategory = throttle(this.switchCategory, 200);
  }
};
exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"]))

/***/ }),

/***/ 48:
/*!****************************************************************************************************!*\
  !*** D:/HBuilderProjects/car-maintenance-app/pages/shop/shop.vue?vue&type=style&index=0&lang=css& ***!
  \****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_shop_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../HBuilderX.3.7.9.20230324/HBuilderX/plugins/uniapp-cli/node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!../../../../HBuilderX.3.7.9.20230324/HBuilderX/plugins/uniapp-cli/node_modules/css-loader/dist/cjs.js??ref--6-oneOf-1-1!../../../../HBuilderX.3.7.9.20230324/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!../../../../HBuilderX.3.7.9.20230324/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-2!../../../../HBuilderX.3.7.9.20230324/HBuilderX/plugins/uniapp-cli/node_modules/postcss-loader/src??ref--6-oneOf-1-3!../../../../HBuilderX.3.7.9.20230324/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../HBuilderX.3.7.9.20230324/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./shop.vue?vue&type=style&index=0&lang=css& */ 49);
/* harmony import */ var _HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_shop_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_shop_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_shop_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_shop_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_3_7_9_20230324_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_shop_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 49:
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--6-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-2!./node_modules/postcss-loader/src??ref--6-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/HBuilderProjects/car-maintenance-app/pages/shop/shop.vue?vue&type=style&index=0&lang=css& ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ })

},[[42,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/shop/shop.js.map