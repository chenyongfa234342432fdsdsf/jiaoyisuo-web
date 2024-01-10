import {
  ITradeFuturesTabs,
  ITradeSpotTabs,
  TradeFuturesOptionEnum,
  TradeFuturesTypesEnum,
  TradeMarginEnum,
  TradeMarginTypesEnum,
  TradeMarketAmountTypesEnum,
  TradeModeEnum,
  TradeOrderTypesEnum,
  TradePriceTypeEnum,
  TradePriceTypesEnum,
  TradeStopSideTypeEnum,
} from '@/constants/trade'

import { t } from '@lingui/macro'
import { decimalUtils } from '@nbit/utils'
import Decimal from 'decimal.js'
import { YapiGetV1PerpetualTradePairDetailData } from '@/typings/yapi/PerpetualTradePairDetailV1GetApi'
import { UserFuturesTradeStatus, UserSpotTradeStatus } from '@/constants/user'
import { defaultLevel } from '@/constants/future/trade'
import { ICoupons } from '@/typings/api/welfare-center/coupons-select'
import { formatNumberDecimal } from './decimal'
import { getBusinessName } from './common'

/**
 * @description: 更具币种价格和数量计算交易额
 * 公式 price * amount
 */
export function getTradeTotalPrice(price, amount, precision, isRound?: boolean | Decimal.Rounding) {
  return Number(
    formatNumberDecimal(decimalUtils.getSafeDecimal(price).mul(decimalUtils.getSafeDecimal(amount)), precision, isRound)
  )
}
/**
 * @description: 更具币种价格和交易额计算数量
 * 公式 totalPrice / price
 * @param {*} price
 * @param {*} amount
 */
export function getTradeAmount(totalPrice, price, precision, isRound?: boolean | Decimal.Rounding) {
  return Number(
    formatNumberDecimal(
      decimalUtils.getSafeDecimal(totalPrice).div(decimalUtils.getSafeDecimal(price)),
      precision,
      isRound
    )
  )
}

/**
 * @description:
 * 1: 更具用户总筹码除以价格算出最大购买数量，公式 maxAmount=userCoinTotal/price
 * 2: 更具拖动百分比数字来计算交易数量，公式 maxAmount*percent/100
 * @param {*} percent
 * @param {*} userCoinTotal 用户拥有的筹码
 * @param {*} precision
 */
export function getTradeAmountByPercent(percent, userCoinTotal, precision) {
  return getValueByPercent(percent, userCoinTotal, precision)
}
/**
 * @description:
 * 更具拖动百分比数字来计算数量，公式 value*percent/100
 * @param {*} percent
 * @param {*} value 用户拥有的筹码
 * @param {*} precision
 */
export function getValueByPercent(percent, value, precision) {
  return formatNumberDecimal(
    decimalUtils.getSafeDecimal(percent).mul(decimalUtils.getSafeDecimal(value)).div(100),
    precision
  )
}
/**
 * @description: 更具用户持仓获取百分比金额
 * 公式 userCoinTotal*percent/100
 * @param {*} percent
 * @param {*} userCoinTotal
 */
export function getTotalByPercent(percent, userCoinTotal, precision) {
  return formatNumberDecimal(
    decimalUtils.getSafeDecimal(percent).mul(decimalUtils.getSafeDecimal(userCoinTotal)).div(100),
    precision
  )
}
export const getTradePriceByOrderBook = type => {
  // TODO:待实现 orderBook
  if (type === TradePriceTypeEnum.lastPrice) {
    return 300
  }
  if (type === TradePriceTypeEnum.fivePrice) {
    return 300
  }
  if (type === TradePriceTypeEnum.tenPrice) {
    return 300
  }
  if (type === TradePriceTypeEnum.twentyPrice) {
    return 300
  }
  return 0
}

export function getTradeOrderParams(
  tradeParams: any,
  currentCoin: any,
  tradeMode: TradeModeEnum,
  tradeTabType: ITradeSpotTabs | TradeFuturesTypesEnum | ITradeFuturesTabs,
  tradeOrderType: TradeOrderTypesEnum,
  tradeMarginType: TradeMarginTypesEnum,
  tradePriceType: TradePriceTypeEnum,
  isModeBuy: boolean,
  amountType: TradeMarketAmountTypesEnum,
  coupons?: ICoupons[]
) {
  if (tradeMode === TradeModeEnum.spot) {
    // https://yapi.admin-devops.com/project/44/interface/api/2660
    if (tradeOrderType === TradeOrderTypesEnum.market) {
      const _params =
        amountType === TradeMarketAmountTypesEnum.amount
          ? { placeCount: tradeParams.amount, marketUnit: 'amount' }
          : { funds: tradeParams.funds, marketUnit: 'funds' }
      return {
        coupons,
        orderType: 2,
        side: isModeBuy ? 1 : 2,
        tradeId: currentCoin.tradeId,
        ..._params,
      }
    }
    if (tradeOrderType === TradeOrderTypesEnum.limit) {
      return {
        coupons,
        orderType: 1,
        optimalLimitOrder: 1,
        side: isModeBuy ? 1 : 2,
        tradeId: currentCoin.tradeId,
        placeCount: tradeParams.amount,
        placePrice: tradeParams.price,
      }
    }
  }
  if (tradeMode === TradeModeEnum.margin) {
    if (tradeOrderType === TradeOrderTypesEnum.trailing) {
      return {
        /** 0-买入 1-卖出 */
        direction: isModeBuy ? 0 : 1,
        marginMode: tradeTabType === TradeMarginEnum.margin ? 'cross' : 'isolated',
        marginTradeMode: tradeMarginType,
        tradeId: currentCoin.tradeId,
        type: isModeBuy ? 'buy' : 'sell',
      }
    }
    return {
      marginMode: tradeTabType === TradeMarginEnum.margin ? 'cross' : 'isolated',
      marginTradeMode: tradeMarginType,
      tradeId: currentCoin.tradeId,
      type: isModeBuy ? 'buy' : 'sell',
    }
  }
  return {}
}

/** 获取交易计划委托传参 */
export function getTradeSpotTrailingOrderParams(
  tradeParams: any,
  currentCoin: any,
  isModeBuy: boolean,
  amountType: TradeMarketAmountTypesEnum,
  isTradeTrailingMarketOrderType: boolean,
  lastPrice: string | number,
  coupons?: ICoupons[]
) {
  // yapi.admin-devops.com/project/44/interface/api/2666
  if (isTradeTrailingMarketOrderType) {
    const trailingParams =
      amountType === TradeMarketAmountTypesEnum.funds
        ? {
            orderPrice: Number(tradeParams.funds),
          }
        : {
            orderAmount: Number(tradeParams.amount),
          }
    return {
      ...trailingParams,
      coupons,
      tradeId: currentCoin.tradeId,
      triggerTypeInd: 2,
      triggerPrice: tradeParams.triggerPrice,
      matchType: isTradeTrailingMarketOrderType ? 2 : 1,
      side: isModeBuy ? 1 : 2,
      triggerDirectionInd: tradeParams.triggerPrice <= lastPrice ? 2 : 1,
    }
  }
  return {
    coupons,
    tradeId: currentCoin.tradeId,
    triggerTypeInd: 2,
    triggerPrice: tradeParams.triggerPrice,
    matchType: isTradeTrailingMarketOrderType ? 2 : 1,
    side: isModeBuy ? 1 : 2,
    triggerDirectionInd: tradeParams.triggerPrice <= lastPrice ? 2 : 1,
    orderAmount: Number(tradeParams.amount),
    orderPrice: Number(tradeParams.price),
  }
}
/** 获取交易止盈止损委托传参 */
export function getTradeSpotStopOrderParams(
  tradeParams: any,
  currentCoin: any,
  isModeBuy: boolean,
  amountType: TradeMarketAmountTypesEnum,
  isTradeTrailingMarketOrderType: boolean,
  lastPrice: string | number,
  stopSideType: TradeStopSideTypeEnum,
  isStopLossTradeTrailingMarketOrderType,
  isTakeProfitTradeTrailingMarketOrderType,
  coupons?: ICoupons[]
) {
  // yapi.nbttfc365.com/project/44/interface/api/18649
  if (stopSideType === TradeStopSideTypeEnum.single) {
    const isUp = tradeParams.triggerPrice > tradeParams.price
    const side = isModeBuy ? 1 : 2
    const profitPlacePrice = isTradeTrailingMarketOrderType ? {} : { profitPlacePrice: tradeParams?.price }
    const profitTriggerPrice = tradeParams?.triggerPrice
    const lossPlacePrice = isTradeTrailingMarketOrderType ? {} : { lossPlacePrice: tradeParams?.price }

    const lossTriggerPrice = tradeParams?.triggerPrice
    if (isUp) {
      const _params =
        amountType === TradeMarketAmountTypesEnum.amount
          ? { profitPlaceCount: tradeParams.amount, marketUnit: 'amount' }
          : { profitFunds: tradeParams.funds, marketUnit: 'funds' }

      return {
        coupons,
        ..._params,
        side,
        tradeId: currentCoin.tradeId,
        // 止盈
        ...profitPlacePrice,
        profitTriggerPrice,
        profitOrderType: isTradeTrailingMarketOrderType ? 2 : 1,
      }
    }

    const _params =
      amountType === TradeMarketAmountTypesEnum.amount
        ? { lossPlaceCount: tradeParams.amount, marketUnit: 'amount' }
        : { lossFunds: tradeParams.funds, marketUnit: 'funds' }

    return {
      coupons,
      ..._params,
      side,
      tradeId: currentCoin.tradeId,
      // 止损
      ...lossPlacePrice,
      lossTriggerPrice,
      lossOrderType: isTradeTrailingMarketOrderType ? 2 : 1,
    }
  }
  const side = isModeBuy ? 1 : 2
  const _params =
    amountType === TradeMarketAmountTypesEnum.amount
      ? { profitPlaceCount: tradeParams.amount, lossPlaceCount: tradeParams.amount, marketUnit: 'amount' }
      : { profitFunds: tradeParams.funds, lossFunds: tradeParams.funds, marketUnit: 'funds' }

  const profitPlacePrice = isTakeProfitTradeTrailingMarketOrderType
    ? {}
    : { profitPlacePrice: tradeParams?.takeProfitPrice }
  const profitTriggerPrice = tradeParams?.takeProfitTriggerPrice
  const lossPlacePrice = isStopLossTradeTrailingMarketOrderType ? {} : { lossPlacePrice: tradeParams?.stopLossPrice }
  const lossTriggerPrice = tradeParams?.stopLossTriggerPrice
  return {
    coupons,
    ..._params,
    profitOrderType: isTakeProfitTradeTrailingMarketOrderType ? 2 : 1,
    lossOrderType: isStopLossTradeTrailingMarketOrderType ? 2 : 1,
    side,
    tradeId: currentCoin.tradeId,
    // 止盈
    ...profitPlacePrice,
    profitTriggerPrice,
    // 止损
    ...lossPlacePrice,
    lossTriggerPrice,
  }
}

/**
 * @description: 更具下单类型、交易价格类型判断是否需要数字输入框
 */
export function getIsPriceNumberTradePriceType(
  tradeOrderType: TradeOrderTypesEnum,
  tradePriceType: TradePriceTypeEnum
) {
  if (
    tradeOrderType === TradeOrderTypesEnum.limit ||
    tradeOrderType === TradeOrderTypesEnum.trailing ||
    tradeOrderType === TradeOrderTypesEnum.stop
  ) {
    return tradePriceType === TradePriceTypeEnum.coinType
  }
  if (tradeOrderType === TradeOrderTypesEnum.market) {
    return false
  }
  return true
}

/**
 * @description: 校验 value 是否有值、合法
 * @param {*} value
 */
export const validatorTradeNumber = value => {
  /** 校验 0 undefined null */
  if (!value) {
    return false
  }
  /** 文字字符串允许通过校验 */
  const _val = Number(value)
  if (Number.isNaN(_val)) {
    return true
  }
  /** "0.000" */
  if (!_val) {
    return false
  }
  return true
}

/**
 * @description: 获取交易表单提交按钮文案
 * @param {*} tradeMode
 * @param {*} isModeBuy
 * @param {*} underlyingCoin
 * @param {*} futuresDelOptionChecked 是否合约减仓单
 */
export function getTradeFormSubmitBtnText(
  isFutures: boolean,
  tradeMode: string,
  isTrading,
  contractStatusInd,
  isModeBuy?: boolean,
  underlyingCoin?: string,
  futuresDelOptionChecked?: boolean
) {
  if (isFutures) {
    if (contractStatusInd !== UserFuturesTradeStatus.open) {
      return t`helper_trade_xzelwd2yoj`
    }
  } else {
    if (contractStatusInd !== UserSpotTradeStatus.all) {
      if (isModeBuy) {
        if (contractStatusInd !== UserSpotTradeStatus.buy) {
          return t`helper_trade_xzelwd2yoj`
        }
      } else {
        if (contractStatusInd !== UserSpotTradeStatus.sell) {
          return t`helper_trade_xzelwd2yoj`
        }
      }
    }
  }

  if (!isTrading) {
    return t`helper_trade_5101064`
  }
  if (tradeMode === TradeModeEnum.spot) {
    return isModeBuy
      ? t({ id: `features_trade_spot_index-0`, values: { underlyingCoin } })
      : t({ id: `features_trade_spot_index-1`, values: { underlyingCoin } })
  }
  if (TradeModeEnum.margin === tradeMode) {
    return isModeBuy
      ? t({ id: `features_trade_spot_index-2`, values: { underlyingCoin } })
      : t({ id: `features_trade_spot_index-3`, values: { underlyingCoin } })
  }
  if (TradeModeEnum.futures === tradeMode) {
    if (futuresDelOptionChecked) {
      return isModeBuy ? t`helper_trade_5101513` : t`helper_trade_5101514`
    }
    return isModeBuy ? t`helper/trade-2` : t`helper/trade-3`
  }
  return null
}

/**
 * @description:
 * 更具币对价格、数量获取交易额  price*amount
 * 1 BTC = 10000 USDT
 * @param {*} price
 * @param {*} amount
 * @param {*} precision
 * @param {*} currentLeverage 杠杆倍数
 */
export function getTradeTotalByMarket(price: any, amount: any, precision: any, currentLeverage?: any) {
  if (currentLeverage) {
    return formatNumberDecimal(decimalUtils.getSafeDecimal(price).mul(amount).div(currentLeverage), precision)
  }
  return formatNumberDecimal(decimalUtils.getSafeDecimal(price).mul(amount), precision)
}
/**
 * @description:
 * 更具币对价格、交易额获取数量  total/price
 * 1 BTC = 10000 USDT
 * @param {*} price
 * @param {*} total
 * @param {*} precision
 */
export function getTradeAmountByMarket(price, total, precision) {
  return formatNumberDecimal(decimalUtils.getSafeDecimal(total).div(price), precision)
}

/**
 * Parse leverage input value - remove unit 'X'
 * @param val formatted leverage value
 * @returns leverage value
 */
export function leverageInputParser(val) {
  let newVal = val
  if (newVal.toString().includes('.')) {
    newVal = newVal.split('.')[0]
  }
  if (newVal.toString().includes('x')) {
    newVal = newVal.split('x')[0]
  }
  return newVal
}

/**
 * Format leverage input value - add unit 'X'
 * @param val leverage value
 * @returns formatted leverage value
 */
export function leverageInputFormatter(val) {
  if (!val.toString().includes('x')) return `${val}x`
  return val.toString()
}

/** 按最大杠杆数分割 */
export function getLeverSliderPoints(maxLever: number) {
  const points = [1]
  const step = Math.floor(maxLever / 5)
  for (let i = 1; i < 5; i += 1) {
    points.push(step * i)
  }
  points.push(maxLever)
  return points
}

export function getIsMarketTrade(tradeOrderType, isTradeTrailingMarketOrderType) {
  if (
    tradeOrderType === TradeOrderTypesEnum.market ||
    (tradeOrderType === TradeOrderTypesEnum.trailing && isTradeTrailingMarketOrderType)
  ) {
    return true
  }
  if (tradeOrderType === TradeOrderTypesEnum.limit) {
    return false
  }
  if (tradeOrderType === TradeOrderTypesEnum.stop) {
    return false
  }
  return false
}

export type ITradePairLever = Required<YapiGetV1PerpetualTradePairDetailData>['tradePairLeverList'][0]

/** 获取当前杠杆配置 */
export function getCurrentLeverConfig(lever: number, leverList: ITradePairLever[]) {
  const currentLeverConfig =
    leverList
      .slice()
      .reverse()
      .find(item => item.maxLever! >= lever) || ({} as ITradePairLever)

  return currentLeverConfig
}
/**  重置默认杠杆 */
export function getResetLever(tradePairLeverList?: any) {
  const maxLever = tradePairLeverList ? tradePairLeverList?.[0]?.maxLever || 1 : 1
  const max = maxLever >= defaultLevel ? defaultLevel : 1
  return max
}

export function generateTradeDefaultSeoMeta({ title }, values: { symbol?: string; businessName?: string }) {
  const businessName = getBusinessName()
  values.businessName = businessName

  return {
    title,
    description: t({
      id: `modules_trade_index_page_hssvdouaqa`,
      values,
    }),
  }
}
/**
 * 获取委托价的 form key
 */
export const getPriceField = (tradeOrderType, tradePriceType, stopOptionType?: TradeFuturesOptionEnum) => {
  if (!stopOptionType) {
    const priceField = getIsPriceNumberTradePriceType(tradeOrderType, tradePriceType)
      ? TradePriceTypesEnum.price
      : TradePriceTypesEnum.priceText
    return priceField
  }
  if (tradeOrderType === TradeOrderTypesEnum.stop) {
    if (stopOptionType === TradeFuturesOptionEnum.takeProfit) {
      if (tradePriceType === TradePriceTypeEnum.coinType) {
        return TradePriceTypesEnum.takeProfitPrice
      }
      return TradePriceTypesEnum.takeProfitPriceText
    }
    if (tradePriceType === TradePriceTypeEnum.coinType) {
      return TradePriceTypesEnum.stopLossPrice
    }
    return TradePriceTypesEnum.stopLossPriceText
  }
  return 'unknownPriceField'
}

/**
 * 校验止盈止损规则
 * @return boolean tree 校验通过
 * https://products.admin-devops.com/result/nb%20global%20web/#g=1&p=%E5%90%88%E7%BA%A6%E6%AD%A2%E7%9B%88%E6%AD%A2%E6%8D%9F%E8%A7%84%E5%88%99
 */
export function checkSpotStrategyPrice(
  tradeOrderType,
  tradeParams,
  isModeBuy,
  lastPrice,
  stopSideType: TradeStopSideTypeEnum
) {
  if (stopSideType === TradeStopSideTypeEnum.single) {
    return true
  }
  const stopProfitPrice = tradeParams.takeProfitTriggerPrice
  const stopLossPrice = tradeParams.stopLossTriggerPrice
  if (!stopProfitPrice && !stopLossPrice) {
    return true
  }
  if (isModeBuy) {
    /**
     * 市价委托 - 开多
     * 止盈大于卖 1 价
     * 止损小于卖 1 价
     */
    if (!stopProfitPrice) {
      return stopLossPrice > lastPrice
    }
    if (!stopLossPrice) {
      return stopProfitPrice < lastPrice
    }
    return stopProfitPrice < lastPrice && stopLossPrice > lastPrice
  }
  /**
   * 市价委托 - 开空
   * 止盈小于买 1 价
   * 止损大于买 1
   */
  if (!stopProfitPrice) {
    return stopLossPrice < lastPrice
  }
  if (!stopLossPrice) {
    return stopProfitPrice > lastPrice
  }
  return stopProfitPrice > lastPrice && stopLossPrice < lastPrice
}
