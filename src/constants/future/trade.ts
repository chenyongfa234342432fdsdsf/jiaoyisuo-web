import { t } from '@lingui/macro'

export enum FutureTradeUnitEnum {
  usdt = 'usdt',
  /** 张 */
  a = 1,
  /** U */
  quote = 2,
  /** 标的币种 */
  indexBase = 3,
}

// 合约计算器 Tab 枚举
export enum TradeFuturesCalculatorTabsEnum {
  // 收益
  income = 'income',
  // 平仓
  close = 'close',
  // 强平
  force = 'force',
}

export const getTradeFuturesCalculatorTabsMap = () => {
  return {
    [TradeFuturesCalculatorTabsEnum.income]: t`features/orders/order-columns/future-2`,
    [TradeFuturesCalculatorTabsEnum.close]: t`constants_future_trade_gnxzwifca8p9gtn13j8uw`,
    [TradeFuturesCalculatorTabsEnum.force]: t`constants_future_trade_humnijaogq170dy24w8t7`,
  }
}

export enum FuturesGuideIdStepsEnum {
  none, // 初始化
  one,
  pair = 2,
  opening = 4,
  fixedNode = 6,
  accountMode,
  jump, // 跳转的临界点
  show, // 临时账户
  closing, // 平仓
  profit, // 收益
}

/** 新手教程节点步数 */
export enum FuturesGuideIdEnum {
  availableBalance = 'availableBalance', // 可用余额
  newAccount = 'newAccount', // 创建新账户
  contractCurrencyPair = 'contractCurrencyPair', // 选择合约币对
  leverageRatio = 'leverageRatio', // 选择杠杆倍数
  openingQuantity = 'openingQuantity', // 选择开仓数量
  marketPriceOpening = 'marketPriceOpening', // 市价开仓
  currentPosition = 'currentPosition', // 当前持仓
  accountMode = 'accountMode', // 账户模式
  accountDetails = 'accountDetails', // 账户详情
  temporaryAccount = 'temporaryAccount', // 临时账户
  closingPosition = 'closingPosition', // 平仓
  profitCurrency = 'profitCurrency', // 收益币种
}

/** 合约交易需要修复的引导节点 */
export const fixedNodeGuideIdIntroList = [
  FuturesGuideIdStepsEnum.none,
  FuturesGuideIdStepsEnum.one,
  FuturesGuideIdStepsEnum.pair,
  FuturesGuideIdStepsEnum.opening,
  FuturesGuideIdStepsEnum.fixedNode,
  FuturesGuideIdStepsEnum.accountMode,
  FuturesGuideIdStepsEnum.jump,
  FuturesGuideIdStepsEnum.show,
  FuturesGuideIdStepsEnum.closing,
  FuturesGuideIdStepsEnum.profit,
]

export const defaultLevel = 10
