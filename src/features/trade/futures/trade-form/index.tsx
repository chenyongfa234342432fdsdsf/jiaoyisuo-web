import { forwardRef, PropsWithChildren, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { Form, Button, Slider, Message, FormInstance, Modal, Checkbox, Tooltip } from '@nbit/arco'
import { t } from '@lingui/macro'
import {
  TradePriceTypeEnum,
  TradeModeEnum,
  getTradePriceTypeLabelMap,
  TradeOrderTypesEnum,
  TradeMarketAmountTypesEnum,
  getTradeMarginTypesMap,
  TradeMarginTypesEnum,
  TradeFuturesTypesEnum,
  ITradeFuturesTabs,
  TradeMarginEnum,
  TradeFuturesOptionEnum,
  TradeFuturesOptionUnitEnum,
  TradeFuturesOrderAssetsTypesEnum,
} from '@/constants/trade'
import {
  getIsPriceNumberTradePriceType,
  getTotalByPercent,
  getTradeAmountByPercent,
  getTradeFormSubmitBtnText,
  getValueByPercent,
  getIsMarketTrade,
  validatorTradeNumber,
} from '@/helper/trade'
import {
  postTradeMarginPlace,
  postTradePerpetualBatchOrder,
  postV1PerpetualOrdersPlaceApiRequest,
  postV1PerpetualPlanOrdersPlaceApiRequest,
} from '@/apis/trade'
import Tabs from '@/components/tabs'
import { useTradeStore } from '@/store/trade'
import { useMount, useUpdateEffect, useUpdateLayoutEffect } from 'ahooks'
import { MarketIsShareEnum, SpotStopStatusEnum } from '@/constants/market'
import { formatCurrency, formatLessZero, formatNumberDecimal, formatObjectNumberByKeys } from '@/helper/decimal'
import { useUserStore } from '@/store/user'
import Link from '@/components/link'
import { link } from '@/helper/link'
import { FuturesGuideIdEnum } from '@/constants/future/trade'
import { getHasDepthFirstPrice, useDefaultFuturesUrl } from '@/helper/market'
import { getCanOrderMore } from '@/helper/order/spot'
import { EntrustTypeEnum, OrderDirectionEnum } from '@/constants/order'
import { useContractPreferencesStore } from '@/store/user/contract-preferences'
import {
  UserContractVersionEnum,
  UserEnableEnum,
  UserFuturesTradeStatus,
  UserMarginSourceEnum,
  UserOrderUnit,
} from '@/constants/user'
import { useContractMarketStore } from '@/store/market/contract'
import { useFuturesStore } from '@/store/futures'
import {
  checkFuturesDelValue,
  checkFuturesDelValueSupplement,
  checkFuturesGroupAmount,
  checkFuturesValueLocked,
  checkStrategyPrice,
  getAdditionalMarginPriceMax,
  getDelMarginValue,
  getInitAmount,
  getInitMargin,
  getInitPrice,
  getNominalPositionValue,
  getTradeFuturesOrderParams,
  useFindFuturesPositionItemSize,
  validateMarkPrice,
  validatorFuturesAmount,
} from '@/helper/futures'
import Icon from '@/components/icon'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import { decimalUtils } from '@nbit/utils'
import { useOrderBookStore } from '@/store/order-book'
import { postSetOrderUnit } from '@/helper/user'
import { ICoupons } from '@/typings/api/welfare-center/coupons-select'
import { calculatorFeeAmount, sendRefreshCouponSelectApiNotify } from '@/helper/welfare-center/coupon-select'
import { useCommonStore } from '@/store/common'
import Styles from './index.module.css'
import TradeInputNumber from '../../trade-input-number'
import TradePriceInput from '../../trade-price-input'
import TradeAmountInput from '../../trade-amount-input'
import TradeOrderConfirm from '../../trade-order-confirm'
import TradeTrailingMarketTag from '../../trade-trailing-market-tag'
import TradeFuturesOptionInput from '../../trade-futures-option-input'
import TradeFuturesTriggerInput from '../../trade-futures-trigger-input'
import { OpenFuture } from '../open-future'

const FormItem = Form.Item
interface ITradeFormProps {
  isModeBuy: boolean
  tradeMode: TradeModeEnum
  tradeTabType: ITradeFuturesTabs | TradeFuturesTypesEnum
  tradeOrderType: TradeOrderTypesEnum
  futuresStopOptionChecked: boolean
  /** 只减仓 */
  futuresDelOptionChecked: boolean
  additionalMarginPriceShow: boolean
  setAdditionalMarginPriceShow: any
}
function formatTooltip(val) {
  return <span>{val}%</span>
}
export interface ITradeFormRef {
  form: FormInstance
}
function TradeForm(
  {
    isModeBuy,
    tradeMode,
    tradeTabType,
    tradeOrderType,
    futuresStopOptionChecked,
    futuresDelOptionChecked,
    additionalMarginPriceShow,
    setAdditionalMarginPriceShow,
  }: PropsWithChildren<ITradeFormProps>,
  ref
) {
  // 预估手续费
  const [fee, setFee] = useState('')
  // 已选优惠券列表
  const [coupons, setCoupons] = useState<ICoupons[]>([])
  // 已选体验金，合约和期权的开仓需要
  const [voucherAmount, setVoucherAmount] = useState('')
  const defaultFuturesUrl = useDefaultFuturesUrl()
  const [form] = Form.useForm()
  const userStore = useUserStore()
  const { contractPreference } = useContractPreferencesStore()
  const { userInfo, isLogin } = userStore
  const marketState = useContractMarketStore()
  const assetsStore = useAssetsFuturesStore()
  const tradeStore = useTradeStore()
  const {
    currentLeverage,
    currentGroupOrderAssetsTypes,
    selectedContractGroup,
    setIsClickOrderBook,
    isClickOrderBook,
    tradePanel,
  } = useFuturesStore()
  const { isMergeMode } = useCommonStore()
  const selectedContractGroupId = selectedContractGroup?.groupId
  const { setting, layout } = tradeStore
  // marginSource 额外保证金模式
  const { perpetualVersion, marginSource } = contractPreference
  const isProfessionalVersion = perpetualVersion === UserContractVersionEnum.professional
  const isOpenFutures = userInfo.isOpenContractStatus === UserFuturesTradeStatus.open
  const { userAssetsFutures, futuresCurrencySettings } = assetsStore
  const { currentCoin, currentInitPrice } = marketState
  const amountOffset = Number(currentCoin.amountOffset) || 0
  const priceOffset = Number(currentCoin.priceOffset) || 0
  let coinOffset = Number(futuresCurrencySettings.offset) || 0
  // const maxFunds = Number(currentCoin.maxAmount) || 9999999999
  // let minFunds = Number(currentCoin.minAmount) || 10
  const maxAmount = Number(currentCoin.maxCount) || 9999999999
  const minAmount = Number(currentCoin.minCount) || 0.00001
  const isTrading =
    currentCoin.marketStatus === SpotStopStatusEnum.trading &&
    userInfo.contractStatusInd === UserFuturesTradeStatus.open
  const [isTradeTrailingMarketOrderType, setIsTradeTrailingMarketOrderType] = useState(false)
  const [futuresTakeProfitUnit, setFuturesTakeProfitUnit] = useState(TradeFuturesOptionUnitEnum.last)
  const [futuresStopLossUnit, setFuturesStopLossUnit] = useState(TradeFuturesOptionUnitEnum.last)
  const { bidsList, asksList } = useOrderBookStore()
  const depthSellQuotePrice = decimalUtils.getSafeDecimal(asksList?.[0]?.price).toNumber() || currentCoin.last
  const depthBuyQuotePrice = decimalUtils.getSafeDecimal(bidsList?.[0]?.price).toNumber() || currentCoin.last
  const initDepthQuotePrice = isModeBuy ? depthSellQuotePrice : depthBuyQuotePrice
  const currentInitPriceQuotePrice = isModeBuy ? currentInitPrice.sellPrice : currentInitPrice.buyPrice
  const formTriggerPrice = Form.useWatch('triggerPrice', form)
  const inputAmount = Form.useWatch(TradeMarketAmountTypesEnum.amount, form)
  const inputFounds = Form.useWatch(TradeMarketAmountTypesEnum.funds, form)
  const isMarketPriceMode = useMemo(() => {
    return getIsMarketTrade(tradeOrderType, isTradeTrailingMarketOrderType)
  }, [tradeOrderType, isTradeTrailingMarketOrderType])

  const denominatedCoin: string = currentCoin.quoteSymbolName || 'USD'
  const underlyingCoin = currentCoin.baseSymbolName || 'BTC'
  const USDT_SYMBOL = 'USDT'

  if (denominatedCoin === USDT_SYMBOL) {
    coinOffset = 2
  }
  const isMarginTrade = [(TradeMarginEnum.isolated, TradeMarginEnum.margin)].includes(tradeTabType as any)
  const [futuresOptionUnit, setFuturesOptionUnit] = useState(TradeFuturesOptionUnitEnum.mark)
  const [loading, setLoading] = useState(false)
  const [percent, setPercent] = useState(0)
  const [additionalMarginPercent, setAdditionalMarginPercent] = useState(selectedContractGroupId ? 0 : 100)
  const [isAdditionalMarginFullPercent, setIsAdditionalMarginFullPercent] = useState(additionalMarginPercent === 100)
  const [isAdditionalMarginFullTipShow, setIsAdditionalMarginFullTipShow] = useState(false)
  const [tradePriceType, setTradePriceType] = useState(TradePriceTypeEnum.coinType)
  const tradeMarginTypesMap = getTradeMarginTypesMap()
  const tradeMarginTypes = Object.keys(tradeMarginTypesMap).map(key => {
    return {
      title: tradeMarginTypesMap[key],
      id: key,
    }
  })
  /** 输入框下拉计价单位金额还是数量 eg usdt / btc */
  const inputPrice = Form.useWatch('price', form)
  const additionalMarginPrice = Form.useWatch('additionalMarginPrice', form) || 0

  const amountType = tradePanel.tradeUnit
  /** 交易成交额 input 显示策略，市价隐藏 */
  const tradePriceTypeLabelMap = getTradePriceTypeLabelMap(isModeBuy)
  const onTradePriceSelectChange = params => {
    setTradePriceType(params)
  }
  const [tradeMarginType, setTradeMarginType] = useState(TradeMarginTypesEnum.normal)
  const [isAutoAssets, setIsAutoAssets] = useState(false)
  const msgRef = useRef<Record<string, any>>({})
  const inputAmountField = useMemo(() => {
    return amountType
  }, [amountType])
  const positionItemSize = useFindFuturesPositionItemSize(isModeBuy, futuresDelOptionChecked)
  /** 用户总资产 */
  /** 合约 - 可用资产 - 根据设置的保证金币种折算 */
  const userCoinTotal = useMemo(() => {
    if (currentGroupOrderAssetsTypes === TradeFuturesOrderAssetsTypesEnum.assets) {
      return userAssetsFutures.availableBalanceValue
    }
    return selectedContractGroup.marginAvailable
  }, [
    userAssetsFutures.availableBalanceValue,
    currentGroupOrderAssetsTypes,
    selectedContractGroup,
    selectedContractGroup?.groupId,
    selectedContractGroup?.marginAvailable,
  ])

  // 更具市价限价计划获取买一、触发、输入价，用作校验，计算
  const initPrice = useMemo(() => {
    if (isTradeTrailingMarketOrderType && TradeOrderTypesEnum.trailing === tradeOrderType) {
      return formTriggerPrice || initDepthQuotePrice
    }
    if (!isMarketPriceMode) {
      return inputPrice
    }
    return initDepthQuotePrice
  }, [
    initDepthQuotePrice,
    isTradeTrailingMarketOrderType,
    formTriggerPrice,
    tradeOrderType,
    inputPrice,
    isMarketPriceMode,
  ])
  /** 转换资产，统一资产的计价比，用来比对是否有钱下单 */
  const userCoinTotalDenominatedCoin = useMemo(() => {
    // 非可减仓，普通模式
    if (!futuresDelOptionChecked) {
      return userCoinTotal
    }
    // 可减仓模式下校验放到 弹窗
    return decimalUtils.SafeCalcUtil.mul(positionItemSize, initPrice).toString()
  }, [userCoinTotal, futuresDelOptionChecked, positionItemSize, initPrice])

  useEffect(() => {
    if (isClickOrderBook && tradeOrderType === TradeOrderTypesEnum.market) {
      const _val = formatNumberDecimal(currentInitPrice.total, coinOffset)
      const userTotal = formatNumberDecimal(
        getInitAmount(
          TradeMarketAmountTypesEnum.funds,
          currentLeverage,
          null,
          userCoinTotalDenominatedCoin,
          initPrice,
          marginSource,
          additionalMarginPrice,
          futuresDelOptionChecked
        ),
        coinOffset
      )
      let val =
        decimalUtils.getSafeDecimal(_val).comparedTo(decimalUtils.getSafeDecimal(userTotal)) === 1 ? userTotal : _val
      form.setFieldsValue({
        [TradeMarketAmountTypesEnum.amount]: val,
      })
      const _initPrice = getInitPrice(
        isModeBuy,
        tradeOrderType,
        isTradeTrailingMarketOrderType,
        inputPrice,
        formTriggerPrice
      )
      val = futuresDelOptionChecked
        ? decimalUtils.SafeCalcUtil.mul(val, _initPrice).toString()
        : decimalUtils.SafeCalcUtil.mul(val, _initPrice).div(currentLeverage).toString()

      let _percent = Math.floor((100 * Number(val)) / Number(userCoinTotalDenominatedCoin))
      _percent = _percent >= 0 ? _percent : 0
      setPercent(_percent)
      const _initMargin = getInitMargin(
        TradeMarketAmountTypesEnum.amount,
        currentLeverage,
        val,
        null,
        _initPrice,
        marginSource,
        additionalMarginPrice,
        futuresDelOptionChecked
      )
      form.setFieldsValue({
        [TradeMarketAmountTypesEnum.funds]: formatNumberDecimal(_initMargin, coinOffset),
      })
    }
  }, [isClickOrderBook, currentInitPrice.total])
  const high = formatNumberDecimal(
    decimalUtils.SafeCalcUtil.add(1, currentCoin.priceFloatRatio).mul(currentCoin.last || 1) || 9999999999,
    priceOffset
  )
  const low = formatNumberDecimal(
    decimalUtils.SafeCalcUtil.sub(1, currentCoin.priceFloatRatio).mul(currentCoin.last || 1) || 0,
    priceOffset
  )
  const inputAmountAmountFieldVal = Form.useWatch(TradeMarketAmountTypesEnum.amount, form)
  const inputAmountFundsFieldVal = Form.useWatch(TradeMarketAmountTypesEnum.funds, form)
  const inputAmountFieldVal =
    inputAmountField === TradeMarketAmountTypesEnum.funds ? inputAmountFundsFieldVal : inputAmountAmountFieldVal

  useUpdateLayoutEffect(() => {
    if (isAdditionalMarginFullPercent && !futuresDelOptionChecked) {
      const _initMargin = getInitMargin(
        inputAmountField,
        currentLeverage,
        inputAmountAmountFieldVal,
        inputAmountFundsFieldVal,
        initPrice,
        marginSource,
        additionalMarginPrice,
        futuresDelOptionChecked
      )
      form.setFieldsValue({
        additionalMarginPrice: formatLessZero(
          formatNumberDecimal(decimalUtils.SafeCalcUtil.sub(userCoinTotalDenominatedCoin, _initMargin), coinOffset),
          0
        ),
      })
    }
  }, [userCoinTotalDenominatedCoin, isAdditionalMarginFullPercent])

  // 仓位保证金
  const initMargin = useMemo(() => {
    return getInitMargin(
      inputAmountField,
      currentLeverage,
      inputAmountAmountFieldVal,
      inputAmountFundsFieldVal,
      initPrice,
      marginSource,
      additionalMarginPrice,
      futuresDelOptionChecked
    )
  }, [
    inputAmountField,
    currentLeverage,
    inputAmountFundsFieldVal,
    inputAmountAmountFieldVal,
    initPrice,
    marginSource,
    additionalMarginPrice,
    futuresDelOptionChecked,
  ])
  // 开仓数量
  const initAmount = useMemo(() => {
    return getInitAmount(
      inputAmountField,
      currentLeverage,
      inputAmountAmountFieldVal,
      inputAmountFundsFieldVal,
      initPrice,
      marginSource,
      additionalMarginPrice,
      futuresDelOptionChecked
    )
  }, [
    inputAmountField,
    currentLeverage,
    inputAmountFundsFieldVal,
    inputAmountAmountFieldVal,
    initPrice,
    marginSource,
    additionalMarginPrice,
    futuresDelOptionChecked,
  ])

  // 减仓保证金价值
  const delMarginValue = useMemo(() => {
    return getDelMarginValue(
      inputAmountField,
      currentLeverage,
      inputAmountAmountFieldVal,
      inputAmountFundsFieldVal,
      initPrice,
      coinOffset
    )
  }, [inputAmountField, currentLeverage, inputAmountAmountFieldVal, inputAmountFundsFieldVal, initPrice, coinOffset])
  // 仓位名义价值
  const nominalPositionValue = useMemo(() => {
    return getNominalPositionValue(
      inputAmountField,
      currentLeverage,
      additionalMarginPrice,
      marginSource,
      initPrice,
      inputAmountFundsFieldVal,
      inputAmountAmountFieldVal
    )
  }, [
    inputAmountField,
    currentLeverage,
    additionalMarginPrice,
    marginSource,
    initPrice,
    inputAmountFundsFieldVal,
    inputAmountAmountFieldVal,
  ])
  /** 重置 form 校验不然爆红 */
  useUpdateLayoutEffect(() => {
    resetForm()
  }, [isTradeTrailingMarketOrderType, futuresDelOptionChecked, tradeOrderType, currentCoin.symbolName])
  useUpdateLayoutEffect(() => {
    form.resetFields(['triggerPrice'])
  }, [currentCoin.symbolName])
  useUpdateLayoutEffect(() => {
    if (!isAdditionalMarginFullPercent) {
      resetAdditionalMarginPrice()
    }
  }, [currentCoin.symbolName, futuresDelOptionChecked])
  /** 重置止盈止损 */
  useUpdateLayoutEffect(() => {
    form.resetFields([TradeFuturesOptionEnum.stopLoss, TradeFuturesOptionEnum.takeProfit])
  }, [currentCoin.symbolName, futuresDelOptionChecked])

  const additionalMarginPriceMax = useMemo(() => {
    return Number(formatNumberDecimal(getAdditionalMarginPriceMax(marginSource, userCoinTotal, initMargin), coinOffset))
  }, [marginSource, userCoinTotal, initMargin, coinOffset])

  function onAmountSelectChange(params: TradeMarketAmountTypesEnum) {
    postSetOrderUnit(
      params === TradeMarketAmountTypesEnum.funds ? UserOrderUnit.priceCurrency : UserOrderUnit.targetCurrency
    )
  }
  function effectAdditionalMarginFullPercent(userFullFunds, currentFunds) {
    if (!futuresDelOptionChecked) {
      if (isAdditionalMarginFullPercent) {
        // 反推
        form.setFieldsValue({
          additionalMarginPrice: formatLessZero(
            formatNumberDecimal(decimalUtils.SafeCalcUtil.sub(userFullFunds, currentFunds), coinOffset),
            0
          ),
        })
      } else {
        setAdditionalMarginPercent(0)
      }
    }
  }
  function onAdditionalMarginSliderChange(_percent, isReverse?: boolean) {
    if (_percent === additionalMarginPercent && !isReverse) {
      // 反转
      _percent = 0
    }
    const isFull = _percent === 100
    if (!isReverse) {
      setIsClickOrderBook(false)
      setIsAdditionalMarginFullTipShow(isFull)
    }
    if (isFull !== isAdditionalMarginFullPercent) {
      setTimeout(() => {
        setIsAdditionalMarginFullPercent(isFull)
      }, 200)
    }
    setAdditionalMarginPercent(_percent)
    setPercent(0)
    // 额外保证金来源
    const _additionalMarginPriceMax = getAdditionalMarginPriceMax(marginSource, userCoinTotal, initMargin)
    const _additionalMarginPrice = getValueByPercent(_percent, _additionalMarginPriceMax, coinOffset)
    let resAdditionalMarginPrice = formatLessZero(_additionalMarginPrice, 0)
    form.setFieldsValue({
      additionalMarginPrice: resAdditionalMarginPrice,
    })
    if (_percent === 0) {
      resetAdditionalMarginPrice()
    }
  }

  /** 拖动 slide 计算交易数量、交易总额 */
  function onSliderChange(_percent) {
    setIsClickOrderBook(false)
    setPercent(_percent)
    // 统一货币计算
    // 只减仓
    const _initPrice = getInitPrice(
      isModeBuy,
      tradeOrderType,
      isTradeTrailingMarketOrderType,
      inputPrice,
      formTriggerPrice
    )
    let _userCoinTotalDenominatedCoin

    if (futuresDelOptionChecked) {
      _userCoinTotalDenominatedCoin = decimalUtils.SafeCalcUtil.mul(positionItemSize, _initPrice).toString()
    } else {
      if (isAdditionalMarginFullPercent) {
        // 需要做联动
        _userCoinTotalDenominatedCoin = userCoinTotalDenominatedCoin
      } else {
        _userCoinTotalDenominatedCoin = decimalUtils.SafeCalcUtil.sub(
          userCoinTotalDenominatedCoin,
          additionalMarginPrice
        ).toString()
      }
    }

    if (inputAmountField === TradeMarketAmountTypesEnum.funds) {
      const funds = getTotalByPercent(_percent, _userCoinTotalDenominatedCoin, coinOffset)
      form.setFieldsValue({
        [inputAmountField]: funds,
      })
      const _initAmount = getInitAmount(
        inputAmountField,
        currentLeverage,
        0,
        funds,
        _initPrice,
        marginSource,
        additionalMarginPrice,
        futuresDelOptionChecked
      )
      const amount = formatNumberDecimal(_initAmount, amountOffset)
      if (Number(amount) === 0) {
        form.resetFields([TradeMarketAmountTypesEnum.amount])
      } else {
        form.setFieldsValue({
          [TradeMarketAmountTypesEnum.amount]: amount,
        })
      }
      effectAdditionalMarginFullPercent(_userCoinTotalDenominatedCoin, funds)
      return
    }
    if (inputAmountField === TradeMarketAmountTypesEnum.amount) {
      const _val = futuresDelOptionChecked
        ? decimalUtils.SafeCalcUtil.div(_userCoinTotalDenominatedCoin, _initPrice).toString()
        : decimalUtils.SafeCalcUtil.mul(currentLeverage, _userCoinTotalDenominatedCoin).div(_initPrice).toString()
      const amount = getTradeAmountByPercent(_percent, _val, amountOffset)
      form.setFieldsValue({
        [inputAmountField]: amount,
      })

      const _initMargin = getInitMargin(
        inputAmountField,
        currentLeverage,
        amount,
        0,
        _initPrice,
        marginSource,
        additionalMarginPrice,
        futuresDelOptionChecked
      )
      const funds = formatNumberDecimal(_initMargin, coinOffset)
      if (Number(funds) === 0) {
        form.resetFields([TradeMarketAmountTypesEnum.funds])
      } else {
        form.setFieldsValue({
          [TradeMarketAmountTypesEnum.funds]: funds,
        })
      }
      effectAdditionalMarginFullPercent(_userCoinTotalDenominatedCoin, _initMargin)
    }
  }

  function onAdditionalMarginPriceChange(_additionalMarginPrice) {
    _additionalMarginPrice = Number(_additionalMarginPrice || 0)
    const _p =
      Math.floor(
        (additionalMarginPriceMax ? (100 * _additionalMarginPrice) / Number(additionalMarginPriceMax) : 0) / 25
      ) * 25
    setAdditionalMarginPercent(_p)
  }

  function onFormChange(currentVal, params) {
    setIsClickOrderBook(false)
    const changeKeys = Object.keys(currentVal)
    // 额外保证金值变动会联动两个滚动条、开仓数量
    if (changeKeys.includes('additionalMarginPrice')) {
      const _additionalMarginPrice = currentVal.additionalMarginPrice
      onAdditionalMarginPriceChange(_additionalMarginPrice)
      return
    }
    // 开仓数量/开仓保证金 变化联动滚动条，不关联额外保证金数量，但是要设置反向 form 值
    if (changeKeys.includes(inputAmountField)) {
      let _userCoinTotalDenominatedCoin
      if (futuresDelOptionChecked) {
        _userCoinTotalDenominatedCoin = userCoinTotalDenominatedCoin
      } else {
        if (isAdditionalMarginFullPercent) {
          _userCoinTotalDenominatedCoin = userCoinTotalDenominatedCoin
        } else {
          _userCoinTotalDenominatedCoin = decimalUtils.SafeCalcUtil.sub(
            userCoinTotalDenominatedCoin,
            additionalMarginPrice
          ).toString()
        }
      }
      const _inputAmountFieldVal = currentVal[inputAmountField] || 0
      if (typeof _inputAmountFieldVal === 'undefined') {
        return
      }
      const _initPrice = getInitPrice(
        isModeBuy,
        tradeOrderType,
        isTradeTrailingMarketOrderType,
        inputPrice,
        formTriggerPrice
      )
      let val = _inputAmountFieldVal
      if (inputAmountField === TradeMarketAmountTypesEnum.amount) {
        val = futuresDelOptionChecked
          ? decimalUtils.SafeCalcUtil.mul(val, _initPrice).toString()
          : decimalUtils.SafeCalcUtil.mul(val, _initPrice).div(currentLeverage).toString()

        let _percent = Math.floor((100 * val) / Number(_userCoinTotalDenominatedCoin))
        _percent = _percent >= 0 ? _percent : 0
        setPercent(_percent)
        const _initMargin = getInitMargin(
          inputAmountField,
          currentLeverage,
          currentVal[inputAmountField],
          currentVal[inputAmountField],
          _initPrice,
          marginSource,
          additionalMarginPrice,
          futuresDelOptionChecked
        )
        // 规避同步推算的 0
        const funds = formatNumberDecimal(_initMargin, coinOffset)
        if (Number(funds) === 0) {
          form.resetFields([TradeMarketAmountTypesEnum.funds])
        } else {
          form.setFieldsValue({
            [TradeMarketAmountTypesEnum.funds]: funds,
          })
        }

        effectAdditionalMarginFullPercent(userCoinTotalDenominatedCoin, _initMargin)
        return
      }
      let _percent = Math.floor((100 * val) / Number(_userCoinTotalDenominatedCoin))
      _percent = _percent >= 0 ? _percent : 0
      const _initAmount = getInitAmount(
        inputAmountField,
        currentLeverage,
        currentVal[inputAmountField],
        currentVal[inputAmountField],
        _initPrice,
        marginSource,
        additionalMarginPrice,
        futuresDelOptionChecked
      )
      const amount = formatNumberDecimal(_initAmount, amountOffset)

      if (Number(amount) === 0) {
        form.resetFields([TradeMarketAmountTypesEnum.amount])
      } else {
        form.setFieldsValue({
          [TradeMarketAmountTypesEnum.amount]: amount,
        })
      }
      setPercent(_percent)
      effectAdditionalMarginFullPercent(userCoinTotalDenominatedCoin, currentVal[inputAmountField])
    }
  }

  function resetForm() {
    form.resetFields([TradeMarketAmountTypesEnum.amount, TradeMarketAmountTypesEnum.funds])
    setPercent(0)
    msgRef.current = {}
  }
  function resetAdditionalMarginPrice() {
    form.resetFields('additionalMarginPrice')
  }

  function resetFormAfterSubmit() {
    sendRefreshCouponSelectApiNotify()
    resetForm()
    form.resetFields([
      'triggerPrice',
      TradeFuturesOptionEnum.stopLoss,
      TradeFuturesOptionEnum.takeProfit,
      'additionalMarginPrice',
    ])
  }

  function formatFormParams(params) {
    params = formatObjectNumberByKeys(params, ['price'], priceOffset)
    params = formatObjectNumberByKeys(params, ['funds', 'additionalMarginPrice'], coinOffset)
    return formatObjectNumberByKeys(params, ['amount'], amountOffset)
  }

  const onFormSubmit = async formParams => {
    setLoading(true)
    if (currentCoin.isShare === MarketIsShareEnum.close) {
      Message.error({
        id: 'futuresSubmit',
        content: t`features_assets_futures_common_close_position_modal_index_5101495`,
      })
      setLoading(false)
      return
    }
    if (!getHasDepthFirstPrice(isModeBuy) && TradeOrderTypesEnum.market === tradeOrderType) {
      Message.error({ id: 'futuresSubmit', content: t`features_trade_spot_trade_form_index_5101316` })

      setLoading(false)

      return
    }
    const resValidateMarkPrice = await validateMarkPrice(futuresDelOptionChecked)
    if (!resValidateMarkPrice) {
      setLoading(false)
      return
    }
    const msg = Object.values(msgRef.current).find(v => !!v)
    if (msg) {
      Message.error({ id: 'futuresSubmit', content: msg })
      setLoading(false)

      return
    }
    const resValidatorFuturesAmount = validatorFuturesAmount(
      inputAmountFieldVal,
      inputAmountField,
      futuresDelOptionChecked,
      initMargin,
      userCoinTotalDenominatedCoin,
      additionalMarginPrice,
      marginSource,
      maxAmount,
      minAmount,
      underlyingCoin,
      denominatedCoin,
      currentCoin,
      currentLeverage,
      !futuresDelOptionChecked ? nominalPositionValue : delMarginValue,
      amountOffset,
      coinOffset
    )
    if (resValidatorFuturesAmount) {
      Message.error({ id: 'futuresSubmit', content: resValidatorFuturesAmount })
      setLoading(false)
      return
    }
    const _initPrice = getInitPrice(
      isModeBuy,
      tradeOrderType,
      isTradeTrailingMarketOrderType,
      inputPrice,
      formTriggerPrice
    )
    /**
     * 校验止盈止损规则
     */
    const checkStrategyRes = checkStrategyPrice(tradeOrderType, formParams, isModeBuy, _initPrice)
    if (!checkStrategyRes) {
      Modal?.warning?.({
        icon: null,
        closable: true,
        title: (
          <div className="flex justify-center">
            <Icon name="tips_icon" style={{ fontSize: '78px' }} />
          </div>
        ),
        style: { width: '360px' },
        content: <div>{t`features_trade_futures_trade_form_index_5101481`}</div>,
        okText: t`features_trade_spot_index_2510`,
      })
      setLoading(false)

      return
    }
    /**
     * 勾选只减仓时目标下单合约是否存在正向同倍数合约锁仓场景
     */
    const isFuturesValueLocked = checkFuturesValueLocked(isModeBuy, futuresDelOptionChecked)
    if (!isFuturesValueLocked) {
      Message.error({ id: 'futuresSubmit', content: t`features_trade_futures_trade_form_index_sj9mln8ybc9op0vlabd1k` })
      setLoading(false)

      return
    }
    /**
     * 判断是否需要补充只减仓的保证金或者先平盈利仓位
     */
    const checkFuturesDelValueSupplementRes = await checkFuturesDelValueSupplement(
      isModeBuy,
      futuresDelOptionChecked,
      currentCoin,
      formParams,
      _initPrice,
      initAmount,
      isMarketPriceMode
    )
    if (!checkFuturesDelValueSupplementRes) {
      Modal?.warning?.({
        icon: null,
        closable: true,
        title: (
          <div className="flex justify-center">
            <Icon name="tips_icon" style={{ fontSize: '78px' }} />
          </div>
        ),
        style: { width: '360px' },
        content: <div>{t`features_assets_futures_common_close_position_modal_index_5101574`}</div>,
        okText: t`features_trade_spot_index_2510`,
      })
      setLoading(false)

      return
    }

    /**
     * 勾选只减仓时目标下单合约是否存在反向同倍数合约
     */
    const [checkHasFuturesDelValueRes, checkFuturesDelValueRes] = checkFuturesDelValue(
      inputAmountField,
      inputAmountFieldVal,
      isModeBuy,
      futuresDelOptionChecked,
      _initPrice,
      formParams,
      tradeOrderType,
      isTradeTrailingMarketOrderType
    )
    if (!checkHasFuturesDelValueRes) {
      Modal?.warning?.({
        icon: null,
        closable: true,
        title: (
          <div className="flex justify-center">
            <Icon name="tips_icon" style={{ fontSize: '78px' }} />
          </div>
        ),
        style: { width: '360px' },
        content: <div>{t`features_trade_futures_trade_form_index_5101482`}</div>,
        okText: t`features_trade_spot_index_2510`,
      })
      setLoading(false)

      return
    }
    if (!checkFuturesDelValueRes) {
      Message.error({ id: 'futuresSubmit', content: t`features_trade_futures_trade_form_index_5101581` })

      setLoading(false)
      return
    }
    /**
     * 校验合约组超过 26
     */
    if (!selectedContractGroupId) {
      const checkFuturesGroupAmountRes = await checkFuturesGroupAmount()
      if (!checkFuturesGroupAmountRes) {
        Modal?.warning?.({
          icon: null,
          closable: true,
          title: (
            <div className="flex justify-center">
              <Icon name="tips_icon" style={{ fontSize: '78px' }} />
            </div>
          ),
          style: { width: '360px' },
          content: <div>{t`features_trade_futures_trade_form_index_5101549`}</div>,
          okText: t`features_trade_spot_index_2510`,
        })
        setLoading(false)
        return
      }
    }
    formParams = formatFormParams(formParams)
    const params = getTradeFuturesOrderParams(
      formParams,
      currentCoin,
      tradeMode,
      tradeTabType,
      tradeOrderType,
      tradeMarginType,
      tradePriceType,
      isModeBuy,
      inputAmountField,
      futuresDelOptionChecked,
      isAutoAssets,
      futuresOptionUnit,
      isTradeTrailingMarketOrderType,
      futuresTakeProfitUnit,
      futuresStopLossUnit,
      coinOffset,
      amountOffset,
      _initPrice,
      isAdditionalMarginFullPercent,
      coupons,
      voucherAmount
    ) as any

    if (tradeMode === TradeModeEnum.futures) {
      if (
        !getCanOrderMore(
          tradeOrderType === TradeOrderTypesEnum.trailing ? EntrustTypeEnum.plan : EntrustTypeEnum.normal,
          isModeBuy ? OrderDirectionEnum.buy : OrderDirectionEnum.sell
        )
      ) {
        Message.error({ id: 'futuresSubmit', content: t`features_trade_spot_trade_form_index_5101342` })

        setLoading(false)
        return
      }
      // 下单时是否开启二次确认 仅仅现货计划单（默认必须打开），合约需要用户配置
      /** 现货委托交易需要弹窗 */
      if (TradeOrderTypesEnum.trailing === tradeOrderType && tradeTabType === TradeModeEnum.futures) {
        const getIsDialogSettingOpen = () => {
          const hasTakeProfitOrStopLoss = formParams.stopLoss || formParams.takeProfit
          if (hasTakeProfitOrStopLoss) {
            return isMarketPriceMode
              ? setting.trailing.marketStopLimit.futures
              : setting.trailing.limitStopLimit.futures
          }
          return isMarketPriceMode ? setting.trailing.market.futures : setting.trailing.limit.futures
        }
        openTradeOrderPreviewDialog(
          formParams,
          getIsDialogSettingOpen(),
          () => {
            setLoading(true)
            postV1PerpetualPlanOrdersPlaceApiRequest(params)
              .then(res => {
                if (res.isOk) {
                  Message.success(t`features/orders/details/modify-stop-limit-0`)
                  resetFormAfterSubmit()
                }
              })
              .finally(() => setLoading(false))
          },
          () => {
            setLoading(false)
          }
        )
        return
      }
      /** 市价限价 */
      const getIsDialogSettingOpen = () => {
        const hasTakeProfitOrStopLoss = formParams.stopLoss || formParams.takeProfit
        if (tradeOrderType === TradeOrderTypesEnum.market) {
          return hasTakeProfitOrStopLoss ? setting.common.marketStopLimit.futures : setting.common.market.futures
        }
        return hasTakeProfitOrStopLoss ? setting.common.limitStopLimit.futures : setting.common.limit.futures
      }
      openTradeOrderPreviewDialog(
        formParams,
        getIsDialogSettingOpen(),
        () => {
          setLoading(true)
          postV1PerpetualOrdersPlaceApiRequest(params)
            .then(res => {
              if (res.isOk) {
                Message.success(t`features/orders/details/modify-stop-limit-0`)
                resetFormAfterSubmit()
              }
            })
            .finally(() => setLoading(false))
        },
        () => {
          setLoading(false)
        }
      )
      return
    }

    if (tradeMode === TradeModeEnum.margin) {
      // 下单时是否开启二次确认 仅仅现货计划单（默认必须打开），合约需要用户配置
      /** 现货委托交易需要弹窗 */
      if (TradeOrderTypesEnum.trailing === tradeOrderType) {
        const getIsDialogSettingOpen = () => {
          const hasTakeProfitOrStopLoss = formParams.stopLoss || formParams.takeProfit
          return hasTakeProfitOrStopLoss ? setting.common.limitStopLimit.futures : setting.trailing.limit.futures
        }
        openTradeOrderPreviewDialog(
          formParams,
          getIsDialogSettingOpen(),
          () => {
            setLoading(true)
            postTradePerpetualBatchOrder({ code: currentCoin.id, params })
              .then(res => {
                if (res.isOk) {
                  Message.success(t`features/orders/details/modify-stop-limit-0`)
                  resetFormAfterSubmit()
                }
              })
              .finally(() => setLoading(false))
          },
          () => {
            setLoading(false)
          }
        )
        return
      }

      setLoading(true)
      return postTradeMarginPlace(params)
        .then(res => {
          if (res.isOk) {
            Message.success(t`features/orders/details/modify-stop-limit-0`)
            resetFormAfterSubmit()
          }
        })
        .finally(() => setLoading(false))
    }
    return null
  }

  function openTradeOrderPreviewDialog(formParams, isDialogSettingOpen, onOk, onCancel?: any) {
    if (isDialogSettingOpen) {
      return Modal.confirm({
        icon: null,
        closable: true,
        maskClosable: false,
        title: t`features/trade/trade-form/index-5`,
        style: { width: '444px' },
        content: (
          <TradeOrderConfirm
            coin={currentCoin}
            isModeBuy={isModeBuy}
            nominalPositionValue={formatCurrency(nominalPositionValue, coinOffset, false)}
            formParams={formParams}
            tradeOrderType={tradeOrderType}
            tradeMode={tradeMode}
            futuresDelOptionChecked={futuresDelOptionChecked}
            amountType={inputAmountField}
            futuresOptionUnit={futuresOptionUnit}
            futuresStopLossUnit={futuresStopLossUnit}
            futuresTakeProfitUnit={futuresTakeProfitUnit}
          />
        ),
        onOk: () => {
          onOk && onOk()
        },
        onCancel: () => {
          onCancel && onCancel()
        },
      })
    }
    onOk && onOk()
  }
  function onTradeMarginTypeChange(item) {
    const type = item.id as TradeMarginTypesEnum
    setTradeMarginType(type)
  }
  useImperativeHandle(ref, () => ({
    form,
  }))
  /** 交易价格档位、币种类型切换需要覆盖数字或者文案 */
  useUpdateLayoutEffect(() => {
    if (tradePriceType === TradePriceTypeEnum.coinType) {
      // 初始化填充价格
      form.setFieldsValue({ price: currentInitPriceQuotePrice })
    } else {
      form.setFieldsValue({ priceText: tradePriceTypeLabelMap[tradePriceType] })
    }
  }, [tradePriceType, tradeOrderType, currentCoin.symbolName, currentInitPriceQuotePrice])
  useUpdateLayoutEffect(() => {
    if (!selectedContractGroupId && !isMergeMode) {
      onAdditionalMarginSliderChange(100, true)
    } else {
      onAdditionalMarginSliderChange(0, true)
    }
  }, [selectedContractGroupId])

  // TODO: 等资产异步更新后刷
  useMount(() => {
    if (isLogin) {
      if (!selectedContractGroupId && !isMergeMode) {
        onAdditionalMarginSliderChange(100, true)
      } else {
        onAdditionalMarginSliderChange(0, true)
      }
    }
  })
  function getInitFormValue() {
    if (tradeOrderType === TradeOrderTypesEnum.market) {
      return { priceText: t`features_trade_trade_price_input_index_2447` }
    }
    if (tradeOrderType === TradeOrderTypesEnum.limit) {
      return {
        price: initPrice,
      }
    }
    if (tradeOrderType === TradeOrderTypesEnum.trailing) {
      return { price: initPrice }
    }
    return {}
  }
  const priceField = getIsPriceNumberTradePriceType(tradeOrderType, tradePriceType) ? 'price' : 'priceText'

  useUpdateEffect(() => {
    const price = initPrice
    const amount = initAmount
    setFee(
      calculatorFeeAmount({
        price,
        amount,
        feeRate: currentCoin.takerFeeRate,
      })
    )
  }, [initPrice, initAmount, currentCoin.takerFeeRate])

  return (
    <div className={classNames(Styles.scoped, `trade-${tradeMode}`, isModeBuy ? `mode-buy` : 'mode-sell')}>
      <Form form={form} initialValues={getInitFormValue()} onChange={onFormChange} onSubmit={onFormSubmit}>
        {/* 一级 Tabs 用作杠杆交易类型切换 */}
        {isMarginTrade && (
          <Tabs
            size="small"
            tabList={tradeMarginTypes}
            mode="button"
            value={tradeMarginType}
            onChange={onTradeMarginTypeChange}
            classNames="mb-2"
          />
        )}
        {/* 计划委托的触发价格 */}
        {TradeOrderTypesEnum.trailing === tradeOrderType && (
          <div>
            <FormItem
              field="triggerPrice"
              className="trigger-price-show"
              rules={[
                {
                  validator(value, cb) {
                    value = Number(value)
                    if (!validatorTradeNumber(value)) {
                      const msg = t`features_trade_spot_trade_form_index_2558`
                      msgRef.current.triggerPrice = msg
                      return cb()
                    }
                    msgRef.current.triggerPrice = ''
                    return cb()
                  },
                },
              ]}
            >
              <TradeFuturesTriggerInput
                denominatedCoin={denominatedCoin}
                futuresOptionUnit={futuresOptionUnit}
                setFuturesOptionUnit={setFuturesOptionUnit}
                precision={priceOffset}
                hideControl={false}
                prefix={t`features_trade_spot_trade_form_index_2560`}
                suffix={denominatedCoin}
              />
            </FormItem>
          </div>
        )}
        {/* 普通价格输入 */}
        <div
          className={classNames('trigger-price-show', {
            'price-text': priceField === 'priceText',
          })}
        >
          <FormItem
            labelAlign="left"
            field={priceField}
            rules={[
              {
                validator(value, cb) {
                  value = Number(value)
                  if (isMarketPriceMode) {
                    msgRef.current.price = ''
                    return cb()
                  }
                  if (!validatorTradeNumber(value)) {
                    const msg = t`features/trade/trade-form/index-0`
                    msgRef.current.price = msg
                    return cb()
                  }
                  if (value > high) {
                    const msg = t({
                      id: 'features_trade_spot_trade_form_index_2614',
                      values: { 0: high, 1: denominatedCoin },
                    })
                    msgRef.current.price = msg
                    return cb()
                  }
                  if (value < low) {
                    const msg = t({
                      id: 'features_trade_spot_trade_form_index_2615',
                      values: { 0: low, 1: denominatedCoin },
                    })
                    msgRef.current.price = msg
                    return cb()
                  }
                  msgRef.current.price = ''
                  return cb()
                },
              },
            ]}
          >
            <TradePriceInput
              inputSuffix={denominatedCoin}
              tradeMode={tradeMode}
              precision={priceOffset}
              tradeOrderType={tradeOrderType}
              tradePriceType={tradePriceType}
              isTradeTrailingMarketOrderType={isTradeTrailingMarketOrderType}
              handleSelectChange={onTradePriceSelectChange}
              suffixExt={
                <TradeTrailingMarketTag
                  checked={isTradeTrailingMarketOrderType}
                  onChange={() => {
                    setIsTradeTrailingMarketOrderType(!isTradeTrailingMarketOrderType)
                  }}
                />
              }
            />
          </FormItem>
        </div>
        {/* 保证金、数量输入框 */}
        <FormItem
          className={classNames({
            'trade-amount-market-wrap': isMarketPriceMode,
          })}
          field={inputAmountField}
        >
          <TradeAmountInput
            priceOffset={coinOffset}
            amountOffset={amountOffset}
            isTradeTrailingMarketOrderType={isTradeTrailingMarketOrderType}
            handleSelectChange={onAmountSelectChange}
            tradeOrderType={tradeOrderType}
            underlyingCoin={underlyingCoin}
            denominatedCoin={denominatedCoin}
            currentLeverage={currentLeverage}
            tradeMode={tradeMode}
            amountType={inputAmountField}
            inputPrice={inputPrice}
            orderAssetsTypes={currentGroupOrderAssetsTypes}
            futuresDelOptionChecked={futuresDelOptionChecked}
            positionItemSize={positionItemSize}
            initPrice={initPrice}
            initMargin={initMargin}
            initAmount={initAmount}
            setCoupons={setCoupons}
            fee={fee}
            setVoucherAmount={setVoucherAmount}
            isModeBuy={isModeBuy}
            nominalPositionValue={nominalPositionValue}
          />
        </FormItem>
        <Slider
          className="slider-wrap position-margin-slider"
          disabled={!isLogin}
          marks={{
            0: '0',
            25: '25',
            50: '50',
            75: '75',
            100: '100',
          }}
          value={percent}
          onChange={onSliderChange}
          defaultValue={0}
          formatTooltip={formatTooltip}
        />
        {/* 合约止盈 */}
        {futuresStopOptionChecked && (
          <FormItem field="takeProfit">
            <TradeFuturesOptionInput
              precision={priceOffset}
              type={TradeFuturesOptionEnum.takeProfit}
              handleSelectChange={setFuturesTakeProfitUnit}
              unitType={futuresTakeProfitUnit}
            />
          </FormItem>
        )}
        {/* 合约止损 */}
        {futuresStopOptionChecked && (
          <FormItem field="stopLoss">
            <TradeFuturesOptionInput
              precision={priceOffset}
              handleSelectChange={setFuturesStopLossUnit}
              type={TradeFuturesOptionEnum.stopLoss}
              unitType={futuresStopLossUnit}
            />
          </FormItem>
        )}
        {[TradeMarginTypesEnum.borrow, TradeMarginTypesEnum.repay].includes(tradeMarginType) && (
          <div className="assets-wrap">
            <div className="label">
              {tradeMarginType === TradeMarginTypesEnum.borrow
                ? t`features/trade/index-4`
                : t`features/trade/trade-form/index-6`}
            </div>
            <div className="num">
              {/* TODO: tradeMarginType */}
              {/* {buyCoin.availableAmountText} {denominatedCoin} */}
            </div>
          </div>
        )}
        {/* 合约内容 */}
        <div className="assets-wrap">
          {!futuresDelOptionChecked ? (
            <>
              <Tooltip mini content={t`features_trade_futures_trade_form_index_5101426`}>
                <div className="label dashed-border cursor-pointer">
                  {t`features_trade_futures_trade_form_index_5101429`} ({denominatedCoin})
                </div>
              </Tooltip>
              <div className="num">
                {Number(nominalPositionValue) ? formatCurrency(nominalPositionValue, coinOffset, false) : '--'}
              </div>
            </>
          ) : (
            <>
              <div className="label">
                {t`features_trade_futures_trade_form_index_5101441`} ({denominatedCoin})
              </div>
              <div className="num">
                {Number(delMarginValue) ? formatCurrency(delMarginValue, coinOffset, false) : '--'}
              </div>
            </>
          )}
        </div>
        {/* 额外保证金数量 */}
        {!isMergeMode &&
          !futuresDelOptionChecked &&
          currentGroupOrderAssetsTypes === TradeFuturesOrderAssetsTypesEnum.assets && (
            <>
              <div className="mb-1">
                <span className="label text-text_color_02 text-xs flex justify-between">
                  <Tooltip
                    mini
                    content={
                      marginSource === UserMarginSourceEnum.wallet
                        ? t`features_trade_futures_trade_form_index_5101427`
                        : t`features_trade_futures_trade_form_index_wzaksdq2xbeui5_qrbbj4`
                    }
                  >
                    <span className="dashed-border cursor-pointer">
                      {t`features_trade_futures_trade_form_index_5_rjki8air`} ({denominatedCoin})
                    </span>
                  </Tooltip>
                  <Icon
                    onClick={() => setAdditionalMarginPriceShow(!additionalMarginPriceShow)}
                    style={{ fontSize: '8px' }}
                    className={classNames('icon-arrow -mt-0.5 text-xs p-0.5', {
                      'rotate-180': additionalMarginPriceShow,
                    })}
                    name="arrow_open"
                    hasTheme
                  />
                </span>
              </div>
              {!isMergeMode && additionalMarginPriceShow && (
                <>
                  <FormItem field="additionalMarginPrice">
                    <TradeInputNumber
                      disabled={isAdditionalMarginFullPercent}
                      max={additionalMarginPriceMax}
                      precision={coinOffset}
                      // suffix={denominatedCoin}
                      prefix={t`features_trade_trade_amount_input_index_5101476`}
                    />
                  </FormItem>
                  <Tooltip
                    position="bottom"
                    className={`futures-trade-panel-${isModeBuy ? 'buy' : 'sell'}-${layout.tradeFormPosition}-tip`}
                    content="100%"
                    trigger="click"
                    onVisibleChange={() => {
                      if (isAdditionalMarginFullTipShow) {
                        setTimeout(() => {
                          setIsAdditionalMarginFullTipShow(false)
                        }, 2500)
                      }
                    }}
                    popupVisible={isAdditionalMarginFullTipShow}
                  >
                    <Slider
                      className={`slider-wrap ext-assets-slider-wrap is-mode-buy${isModeBuy}`}
                      disabled={!isLogin}
                      value={additionalMarginPercent}
                      onChange={onAdditionalMarginSliderChange}
                      defaultValue={0}
                      step={25}
                      onlyMarkValue
                      marks={{
                        25: '25%',
                        50: '50%',
                        75: '75%',
                        100: t`constants/order-5`,
                      }}
                    />
                  </Tooltip>
                </>
              )}
            </>
          )}

        {isProfessionalVersion &&
          !futuresDelOptionChecked &&
          currentGroupOrderAssetsTypes === TradeFuturesOrderAssetsTypesEnum.assets && (
            <div className="mt-0 mb-3">
              {selectedContractGroup?.isAutoAdd === UserEnableEnum.yes ? (
                <Tooltip mini content={t`features_trade_futures_trade_form_index_qbubf-eh3ocgj4j3xij89`}>
                  <span className="label dashed-border text-text_color_02 text-xs cursor-pointer">
                    {t`features_trade_futures_trade_form_index_5101580`}
                  </span>
                </Tooltip>
              ) : (
                <Checkbox
                  checked={isAutoAssets}
                  onChange={params => {
                    setIsAutoAssets(params)
                  }}
                >
                  <Tooltip mini content={t`features_trade_futures_trade_form_index_5101428`}>
                    <span className="label dashed-border text-text_color_02 text-xs cursor-pointer">{t`features/trade/trade-order/base-7`}</span>
                  </Tooltip>
                </Checkbox>
              )}
            </div>
          )}

        <FormItem labelAlign="left" id={FuturesGuideIdEnum.marketPriceOpening}>
          {!isLogin && (
            <Button
              type="primary"
              onClick={() => {
                link(`/login?redirect=${defaultFuturesUrl}`)
              }}
              long
              className="submit-btn login-btn-wrap"
            >
              {/* {t`features_trade_spot_trade_form_index_5101270`} */}
              <Link href={`/login?redirect=${defaultFuturesUrl}`}> {t`user.field.reuse_07`} </Link>
              {t`user.third_party_01`}
              <Link href="/register"> {t`user.validate_form_11`} </Link>
            </Button>
          )}
          <OpenFuture
            triggerButtonProps={{
              loading,
              long: true,
              className: 'submit-btn',
            }}
          />
          {isLogin && isOpenFutures && (
            <Button
              loading={loading}
              type="primary"
              disabled={!isTrading}
              htmlType="submit"
              long
              className="submit-btn"
            >
              {getTradeFormSubmitBtnText(
                true,
                tradeMode,
                isTrading,
                userInfo.contractStatusInd,
                isModeBuy,
                underlyingCoin,
                futuresDelOptionChecked
              )}
            </Button>
          )}
        </FormItem>
      </Form>
    </div>
  )
}

export default forwardRef(TradeForm)
