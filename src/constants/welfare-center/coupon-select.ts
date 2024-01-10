/**
 * 卡券使用场景
 */
export enum BusinessSceneEnum {
  /** 现货 */
  spot = 'spot',
  /** 合约 */
  perpetual = 'perpetual',
  /** 期权 */
  option = 'option',
}

/**
 * 卡券类型 - 数据字典
 */
export enum CouponTypeEnum {
  /** 合约保险金 */
  insurance = 'insurance',
  /** 手续费抵扣券 */
  fee = 'fee',
  /** 体验金券 */
  voucher = 'voucher',
}

/**
 * 卡券选择 - 数据字典
 */
export enum CouponSelectEnum {
  /** 卡券使用场景 */
  businessScene = 'business_scene',
  /** 卡券分类 */
  couponTypeCd = 'coupon_type_cd',
  /** 卡券名称 */
  couponNameCd = 'coupon_name_cd',
}

/**
 * 福利中心 - 卡劵类型对应图片映射
 */
export const DictionaryTypeMap = {
  // 合约保险金
  contract_insurance_coupon: 'contract',
  // 空投币
  airdrop_coins_coupon: 'airdrop',
  // 现货手续费抵扣券
  spot_fee_deduction_coupon: 'spot',
  // 现货手续费折扣券
  spot_fee_discount_coupon: 'spot',
  // 合约手续费抵扣券
  contract_fee_deduction_coupon: 'contract',
  // 合约手续费折扣券
  contract_fee_discount_coupon: 'contract',
  // 代金券
  voucher_coupon: 'voucher',
  // 杠杆免息券
  leveraged_interest_free_coupon: 'free',
  // vip 升级券
  vip_upgrade_coupon: 'vip',
  // 理财产品
  financial_product_coupon: 'financial',
}
