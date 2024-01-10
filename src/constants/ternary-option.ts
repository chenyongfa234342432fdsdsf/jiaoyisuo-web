import { t } from '@lingui/macro'

export enum TernaryTabTypeEnum {
  position = 'position',
  plan = 'plan',
  history = 'history',
}
export function getTernaryOptionEnumName(value: TernaryTabTypeEnum) {
  return {
    [TernaryTabTypeEnum.position]: t`order.tabs.holdings`,
    [TernaryTabTypeEnum.plan]: t`order.constants.placeOrderType.plan`,
    [TernaryTabTypeEnum.history]: t`constants_ternary_option_h4mbix7qqi`,
  }[value]
}

export enum OrderStatusEnum {
  processing = 'processing',
  complete = 'complete',
  fail = 'fail',
  revoke = 'revoke',
}

export function getOrderStatus(value: OrderStatusEnum) {
  return {
    [OrderStatusEnum.fail]: t`features_assets_futures_common_position_list_index_lvbcplbiwpirlz_zo1evb`,
    [OrderStatusEnum.revoke]: t`order.table-cell.action.cancel`,
    [OrderStatusEnum.complete]: t`constants/assets/index-21`,
    [OrderStatusEnum.processing]: t`constants/assets/index-20`,
  }[value]
}

export enum PlanDelegationHeaderEnum {
  intelligence = 1, // 智能委托
  senior, // 高级委托
}

export function getPlanDelegationHeaderList() {
  return [
    { value: PlanDelegationHeaderEnum.senior, name: t`features_ternary_option_trade_form_index_m6azpdbxcz` },
    { value: PlanDelegationHeaderEnum.intelligence, name: t`constants_ternary_option_zo0ww6xiau` },
  ]
}

/** 时间筛选* */
export enum TimeFilteringListEnum {
  custom = 1,
  day = 2,
  week = 7,
  month = 30,
  threeMonth = 90,
}

export function timeFilteringList() {
  return [
    { value: TimeFilteringListEnum.day, name: t`features_orders_filters_spot_5101182` },
    { value: TimeFilteringListEnum.week, name: t`features_orders_filters_spot_5101183` },
    { value: TimeFilteringListEnum.month, name: t`features_orders_filters_spot_5101184` },
    { value: TimeFilteringListEnum.threeMonth, name: t`features_orders_filters_spot_5101185` },
    { value: TimeFilteringListEnum.custom, name: t`features_agent_ta_activity_index_hqwgu9hxda` },
  ]
}

export function timeFilteringType(type: TimeFilteringListEnum) {
  return {
    [TimeFilteringListEnum.day]: 'day',
    [TimeFilteringListEnum.week]: 'week',
    [TimeFilteringListEnum.month]: 'months',
    [TimeFilteringListEnum.threeMonth]: 'three_months',
  }[type]
}

export type HistoricalTypeEnum = {
  [key in HistoricalEnum]: string | number
}

export enum HistoricalEnum {
  time = 'time', // 时间筛选
  name = 'name', // 期权名称
  direction = 'direction', // 方向
  cycle = 'cycle', // 周期
}

export type HistoricalPageinationType = {
  total: number
  pageSize: number
  current: number
}

export enum DirectionType {
  call = 'call', // 买涨
  put = 'put', // 买跌
  overCall = 'over_call', // 买涨超
  overPut = 'over_put', // 买跌超
}
/**
 * 三元期权 - 数据字典
 */
export enum TernaryOptionDictionaryEnum {
  /** 三元期权 - 价格取值来源 */
  optionsPriceSource = 'options_price_source',
  /** 三元期权 - 结算周期 */
  productPeriodCd = 'product_period_cd',
  /** 三元期权 - 涨跌方向 */
  optionsSideInd = 'options_side_ind',
  /** 三元期权 - 数据来源 */
  optionsSource = 'options_source',
}

/** 三元期权 - 结算周期单位 */
export enum OptionProductPeriodUnitEnum {
  /** 秒 */
  seconds = 'SECONDS',
  /** 分钟 */
  minutes = 'MINUTES',
}

/**
 * 获取结算周期单位
 */
export function getOptionProductPeriodUnit(type: OptionProductPeriodUnitEnum) {
  return {
    [OptionProductPeriodUnitEnum.seconds]: t`constants_ternary_option_izccphph3g`,
    [OptionProductPeriodUnitEnum.minutes]: t`features/c2c-trade/creates-advertisements/index-3`,
  }[type]
}

/** 三元期权 - 涨跌方向 */
export enum OptionSideIndEnum {
  /** 买涨 */
  call = 'call',
  /** 买跌 */
  put = 'put',
  /** 买涨超 */
  overCall = 'over_call',
  /** 买跌超 */
  overPut = 'over_put',
}

/** 三元期权 - 涨方向 */
export const OptionSideIndCallEnum: OptionSideIndEnum[] = [OptionSideIndEnum.call, OptionSideIndEnum.overCall]

/** 三元期权 - 跌方向 */
export const OptionsSideIndPutEnum: OptionSideIndEnum[] = [OptionSideIndEnum.put, OptionSideIndEnum.overPut]

export enum OPTION_GUIDE_ELEMENT_IDS_ENUM {
  binary = 'OPTION_GUIDE_ELEMENT_IDS_ENUM_BINARY',
  binaryPlan = 'OPTION_GUIDE_ELEMENT_IDS_ENUM_BINARY_PLAN',
  binaryDir = 'OPTION_GUIDE_ELEMENT_IDS_ENUM_BINARY_DIR',

  advance = 'OPTION_GUIDE_ELEMENT_IDS_ENUM_ADVANCE',
  advanceMaxSum = 'OPTION_GUIDE_ELEMENT_IDS_ENUM_ADVANCE_MAX_SUM',
  advanceMaxAmount = 'OPTION_GUIDE_ELEMENT_IDS_ENUM_ADVANCE_MAX_AMOUNT',
  advanceAuto = 'OPTION_GUIDE_ELEMENT_IDS_ENUM_ADVANCE_AUTO',

  ternary = 'OPTION_GUIDE_ELEMENT_IDS_ENUM_TERNARY',
  ternaryPercent = 'OPTION_GUIDE_ELEMENT_IDS_ENUM_TERNARY_PERCENT',
  ternaryPlan = 'OPTION_GUIDE_ELEMENT_IDS_ENUM_TERNARY_PLAN',
  ternaryDir = 'OPTION_GUIDE_ELEMENT_IDS_ENUM_TERNARY_DIR',
}

export const initOptionMainIndicator = {
  ma: {
    name: 'ma',
    select: false,
    hide: false,
    expand: false,
    init: [
      {
        checked: true,
        select: true,
        strip: 5,
        type: 'close',
        color: '#7F4E86',
      },
      {
        checked: true,
        select: true,
        strip: 10,
        type: 'close',
        color: '#ECC581',
      },
      {
        checked: true,
        select: true,
        strip: 20,
        type: 'close',
        color: '#D057E4',
      },
      {
        checked: true,
        select: false,
        strip: '',
        type: 'close',
        color: '#6F92EE',
      },
      {
        checked: true,
        select: false,
        strip: '',
        type: 'close',
        color: '#BE775B',
      },
      {
        checked: true,
        select: false,
        strip: '',
        type: 'close',
        color: '#A1DB5E',
      },
    ],
    cur: [
      {
        checked: true,
        select: true,
        strip: 5,
        type: 'close',
        color: '#7F4E86',
      },
      {
        checked: true,
        select: true,
        strip: 10,
        type: 'close',
        color: '#ECC581',
      },
      {
        checked: true,
        select: true,
        strip: 20,
        type: 'close',
        color: '#D057E4',
      },
      {
        checked: true,
        select: false,
        strip: '',
        type: 'close',
        color: '#6F92EE',
      },
      {
        checked: true,
        select: false,
        strip: '',
        type: 'close',
        color: '#BE775B',
      },
      {
        checked: true,
        select: false,
        strip: '',
        type: 'close',
        color: '#A1DB5E',
      },
    ],
  },
  boll: {
    name: 'boll',
    select: false,
    hide: false,
    expand: false,
    init: {
      mid: {
        select: true,
        value: 20,
        color: '#7F4E86',
      },
      std: {
        select: true,
        value: 2,
        color: '#F2B446',
      },
    },
    cur: {
      mid: {
        select: true,
        value: 20,
        color: '#7F4E86',
      },
      std: {
        select: true,
        value: 2,
        color: '#F2B446',
      },
    },
    initLine: [
      {
        select: true,
        name: 'BOLL',
        color: '#7F4E86',
      },
      {
        select: true,
        name: 'UB',
        color: '#F2B446',
      },
      {
        select: true,
        name: 'LB',
        color: '#D057E4',
      },
    ],
    curLine: [
      {
        select: true,
        name: 'BOLL',
        color: '#7F4E86',
      },
      {
        select: true,
        name: 'UB',
        color: '#F2B446',
      },
      {
        select: true,
        name: 'LB',
        color: '#D057E4',
      },
    ],
  },
}

export const initOptionSubIndicator = {
  vol: {
    name: 'vol',
    select: false,
    hide: false,
    expand: false,
  },
  macd: {
    name: 'macd',
    select: false,
    hide: false,
    expand: false,
    init: {
      fast: {
        select: true,
        value: 12,
        color: '#7F4E86',
      },
      slow: {
        select: true,
        value: 26,
        color: '#F2B446',
      },
      signal: {
        select: true,
        value: 9,
        color: '#D057E4',
      },
    },
    cur: {
      fast: {
        select: true,
        value: 12,
        color: '#7F4E86',
      },
      slow: {
        select: true,
        value: 26,
        color: '#F2B446',
      },
      signal: {
        select: true,
        value: 9,
        color: '#D057E4',
      },
    },
    initLine: [
      {
        select: true,
        name: 'DIF',
        color: '#7F4E86',
      },
      {
        select: true,
        name: 'DEA',
        color: '#F2B446',
      },
      {
        select: true,
        name: 'MACD',
        color: '#D057E4',
      },
    ],
    curLine: [
      {
        select: true,
        name: 'DIF',
        color: '#7F4E86',
      },
      {
        select: true,
        name: 'DEA',
        color: '#F2B446',
      },
      {
        select: true,
        name: 'MACD',
        color: '#D057E4',
      },
    ],
  },
  kdj: {
    name: 'kdj',
    select: false,
    hide: false,
    expand: false,
    init: {
      k: {
        select: true,
        value: 14,
        color: '#7F4E86',
      },
      d: {
        select: true,
        value: 3,
        color: '#F2B446',
      },
      j: {
        select: true,
        value: 3,
        color: '#D057E4',
      },
    },
    cur: {
      k: {
        select: true,
        value: 14,
        color: '#7F4E86',
      },
      d: {
        select: true,
        value: 3,
        color: '#F2B446',
      },
      j: {
        select: true,
        value: 3,
        color: '#D057E4',
      },
    },
    initLine: [
      {
        select: true,
        name: 'K',
        color: '#7F4E86',
      },
      {
        select: true,
        name: 'D',
        color: '#F2B446',
      },
      {
        select: true,
        name: 'J',
        color: '#D057E4',
      },
    ],
    curLine: [
      {
        select: true,
        name: 'K',
        color: '#7F4E86',
      },
      {
        select: true,
        name: 'D',
        color: '#F2B446',
      },
      {
        select: true,
        name: 'J',
        color: '#D057E4',
      },
    ],
  },
  rsi: {
    name: 'rsi',
    select: false,
    expand: false,
    hide: false,
    init: [
      {
        value: 6,
        select: true,
        color: '#7F4E86',
      },
      {
        value: 12,
        select: true,
        color: '#ECC581',
      },
      {
        value: 24,
        select: true,
        color: '#D057E4',
      },
    ],
    cur: [
      {
        value: 6,
        select: true,
        color: '#7F4E86',
      },
      {
        value: 12,
        select: true,
        color: '#ECC581',
      },
      {
        value: 24,
        select: true,
        color: '#D057E4',
      },
    ],
  },
  wr: {
    name: 'wr',
    select: false,
    expand: false,
    hide: false,
    init: [
      {
        value: 14,
        select: true,
        color: '#7F4E86',
      },
    ],
    cur: [
      {
        value: 14,
        select: true,
        color: '#7F4E86',
      },
    ],
  },
}

export const OptionGuideCache = {
  optionBinaryStep: 'optionBinaryStep',
  optionTernaryStep: 'optionTernaryStep',
  optionAdvancedStep: 'optionAdvancedStep',
  optionAmountList: 'optionAmountList',
}

/** 三元期权交易方向 */
export enum TernaryOptionTradeDirectionEnum {
  /** 买涨 */
  call = 'call',
  /** 买跌 */
  put = 'put',
  /** 涨超 */
  overCall = 'over_call',
  /** 跌超 */
  overPut = 'over_put',
}

/** 二元期权、三元期权 id */
export enum TernaryOptionIdEnum {
  binaryOption = 1,
  ternaryOption = 2,
}

/** 二元期权、三元期权 id */
export enum TernaryBuyTypeEnum {
  Normal = 'normal',
  Advance = 'advance',
}

/**
 * 三元期权 - 订单盈亏类型
 */
export enum OptionsOrderProfitTypeEnum {
  /** 盈利 */
  profit = 1,
  /** 亏损 */
  loss,
  /** 未盈利 */
  notProfit,
}

export enum OptionGuideType {
  binaryOption = 'binaryOption',
  ternaryOption = 'ternaryOption',
  advance = 'advance',
  binaryOptionAndAdvance = 'binaryOptionAndAdvance',
}
