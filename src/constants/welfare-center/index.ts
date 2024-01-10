import { oss_svg_image_domain_address } from '@/constants/oss'

export const welfareCenterImgUrl = `${oss_svg_image_domain_address}welfarecenter`

export enum WelfareCenterEnum {
  /**
   * 我的任务
   */
  MyTasks = 'MyTasks',
  /**
   * 我的活动
   */
  MyActivities = 'MyActivities',
  /**
   * 卡券中心
   */
  CardVoucherCenter = 'CardVoucherCenter',
}

export enum CardCouponCenterEnum {
  /**
   * 全部卡券
   */
  AllCoupons = 'AllCoupons',
  /**
   * 兑换中心
   */
  RedemptionCenter = 'RedemptionCenter',
}

export enum CouponStatus {
  /**
   * 已使用 已失效
   */
  usedandexpired = 0,
  /**
   * 可用
   */
  available = 1,
  /**
   * 已使用
   */
  used = 2,
  /**
   * 已失效
   */
  expired = 3,
}

/**
 * 卡券中心 - 筛选 - 时间类型
 */
export enum CardCouponDateTypeEnum {
  /** 最近 1 天 */
  day = 1,
  /** 最近 1 周 */
  week = 7,
  /** 最近 1 月 */
  month = 30,
  /** 最近 3 月 */
  threeMonths = 90,
}

/**
 * 是否支持和会员叠加使用
 */
export enum OverlayVipStatus {
  /** 是 */
  enable = 'enable',
  /** 否 */
  disable = 'disable',
}

/**
 * 抵扣方式
 */
export enum DiscountRule {
  /** 直接抵扣 */
  direct = 'direct',
  /** 比例折扣 */
  rate = 'rate',
}

/**
 * 券的使用场景
 */
export enum BusinessScene {
  /** 现货 */
  spot = 'spot',
  /** 合约 */
  perpetual = 'perpetual',
  /** 三元期权 */
  option = 'option',
}

/**
 * 有效期类型
 */
export enum ValidityType {
  /** 领取后 N 天有效 */
  AfterReceive = 'after_receive',
  /**  时间段  */
  TimePeriod = 'time_period',
}

/**
 * 优惠券错误码
 */
export enum CouponErrorCode {
  /** 系统错误 */
  SystemError = 10151001,
  /**  参数错误  */
  ParameterError = 10151002,
  /**  优惠券不存在  */
  CouponDoesNotExist = 10151003,
  /**  优惠券已过期  */
  CouponHasExpired = 10151004,
  /**  超过优惠券领取上限  */
  ExceededTheCouponClaimLimit = 10151004,
  /**  优惠券已领完  */
  CouponHasBeenFullyClaimed = 10151006,
  /**  优惠券领取失败  */
  FailedToClaimTheCoupon = 10151006,
}

export enum CouponTypeIconUrlName {
  /** 合约保险金 */
  contractInsuranceCoupon = 'contract_insurance_coupon',

  /** 空投币 */
  airdropCoinsCoupon = 'airdrop_coins_coupon',

  /** 现货手续费抵扣券 */
  spotFeeDeductionCoupon = 'spot_fee_deduction_coupon',

  /** 现货手续费折扣券 */
  spotFeeDiscountCoupon = 'spot_fee_discount_coupon',

  /** 合约手续费抵扣券 */
  contractFeeDeductionCoupon = 'contract_fee_deduction_coupon',

  /** 合约手续费折扣券 */
  contractFeeDiscountCoupon = 'contract_fee_discount_coupon',

  /** 代金券 */
  voucherCoupon = 'voucher_coupon',

  /** 杠杆免息券 */
  leveragedInterestFreeCoupon = 'leveraged_interest_free_coupon',

  /** VIP 升级券 */
  vipUpgradeCoupon = 'vip_upgrade_coupon',

  /** 理财产品 */
  financialProductCoupon = 'financial_product_coupon',

  /** 三元期权体验金 */
  option_voucher_coupon = 'option_voucher_coupon',
}

export enum CouponTypeAccount {
  /** 交易账户 */
  ASSET = 'ASSET',
}

export enum CouponType {
  /** 合约保险金 */
  insurance = 'insurance',
  /** 手续费抵扣券 */
  fee = 'fee',
  /** 体验金券 */
  voucher = 'voucher',
}

export const ruleHomeColumnCd = {
  [WelfareCenterEnum.MyTasks]: 'activity_center',
  [WelfareCenterEnum.MyActivities]: 'mission_center',
}

export enum WelfareType {
  //  活动类
  activity = 'activity',
  // 任务类
  mission = 'mission',
  // 手动发放类
  manual = 'manual',
}

export const welfareCenterPageType = {
  // 任务
  mission: WelfareCenterEnum.MyTasks,
  // 活动
  activity: WelfareCenterEnum.MyActivities,
  // 卡券
  coupon: WelfareCenterEnum.CardVoucherCenter,
}

export const couponItemType = {
  // 全部卡劵
  all: CardCouponCenterEnum.AllCoupons,
  // 领取中心
  claim: CardCouponCenterEnum.RedemptionCenter,
}
