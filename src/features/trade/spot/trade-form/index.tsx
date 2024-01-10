import { forwardRef, PropsWithChildren, useImperativeHandle, useMemo, useRef, useState } from 'react'
import classnames from 'classnames'
import { Form, Button, Message, FormInstance, Modal } from '@nbit/arco'
import { t } from '@lingui/macro'
import { useMarketStore } from '@/store/market'
import {
  TradePriceTypeEnum,
  TradeModeEnum,
  getTradePriceTypeLabelMap,
  TradeOrderTypesEnum,
  TradeMarketAmountTypesEnum,
  getTradeMarginTypesMap,
  TradeMarginTypesEnum,
  TradeFuturesTypesEnum,
  ITradeSpotTabs,
  TradeMarginEnum,
  TradeStopSideTypeEnum,
} from '@/constants/trade'
import {
  checkSpotStrategyPrice,
  getPriceField,
  getTotalByPercent,
  getTradeAmount,
  getTradeAmountByPercent,
  getTradeFormSubmitBtnText,
  getTradeOrderParams,
  getTradePriceByOrderBook,
  getTradeSpotStopOrderParams,
  getTradeSpotTrailingOrderParams,
  getTradeTotalPrice,
} from '@/helper/trade'
import { useAssetsStore } from '@/store/assets'
import { postTradeOrderPlace, postSplSaveStrategy, postV1ProfitLossOrdersPlaceApiRequest } from '@/apis/trade'
import { useTradeStore } from '@/store/trade'
import { useUpdateEffect, useUpdateLayoutEffect } from 'ahooks'
import { MarketIsShareEnum, SpotStopStatusEnum } from '@/constants/market'
import { formatCurrency, formatNumberDecimal } from '@/helper/decimal'
import { useUserStore } from '@/store/user'
import Link from '@/components/link'
import { link } from '@/helper/link'
import { getDefaultTradeUrl } from '@/helper/market'
import { getCanOrderMore } from '@/helper/order/spot'
import { EntrustTypeEnum, OrderDirectionEnum } from '@/constants/order'
import { UserSpotTradeStatus } from '@/constants/user'
import { decimalUtils } from '@nbit/utils'
import Icon from '@/components/icon'
import { getMergeModeStatus } from '@/features/user/utils/common'
import { DepositModal } from '@/features/assets/main/deposit-modal'
import { ICoupons } from '@/typings/api/welfare-center/coupons-select'
import { calculatorFeeAmount, sendRefreshCouponSelectApiNotify } from '@/helper/welfare-center/coupon-select'
import Styles from './index.module.css'
import TradeOrderConfirm from '../../trade-order-confirm'
import TradeSpotMarket from './trade-spot-market'
import TradeSpotLimit from './trade-spot-limit'
import TradeSpotTrailing from './trade-spot-trailing'
import TradeSpotStop from './trade-spot-stop'

const FormItem = Form.Item
interface ITradeFormProps {
  isModeBuy: boolean
  tradeMode: TradeModeEnum
  tradeTabType: ITradeSpotTabs | TradeFuturesTypesEnum
  tradeOrderType: TradeOrderTypesEnum
}
function formatTooltip(val) {
  return <span>{val}%</span>
}
export interface ITradeFormRef {
  form: FormInstance
}
function TradeForm({ isModeBuy, tradeMode, tradeTabType, tradeOrderType }: PropsWithChildren<ITradeFormProps>, ref) {
  // 预估手续费
  const [fee, setFee] = useState('')
  // 已选优惠券列表
  const [coupons, setCoupons] = useState<ICoupons[]>([])
  const [form] = Form.useForm()
  const userStore = useUserStore()
  const { userInfo } = userStore
  const isMergeMode = getMergeModeStatus()
  const marketState = useMarketStore()
  const assetsStore = useAssetsStore()
  const tradeStore = useTradeStore()
  const { setting } = tradeStore
  const userAssetsSpot = assetsStore?.userAssetsSpot || {}
  const { currentCoin, currentInitPrice } = marketState
  const amountOffset = Number(currentCoin.amountOffset) || 0
  const priceOffset = Number(currentCoin.priceOffset) || 0

  const maxFunds = Number(currentCoin.maxAmount) || 9999999999
  const minFunds = Number(currentCoin.minAmount) || 10
  const maxAmount = Number(currentCoin.maxCount) || 9999999999
  const minAmount = Number(currentCoin.minCount) || 0.01
  const isMarketTrade = currentCoin.marketStatus === SpotStopStatusEnum.trading
  const isModeTrade = isModeBuy
    ? userInfo.spotStatusInd === UserSpotTradeStatus.all || userInfo.spotStatusInd === UserSpotTradeStatus.buy
    : userInfo.spotStatusInd === UserSpotTradeStatus.all || userInfo.spotStatusInd === UserSpotTradeStatus.sell
  const isTrading = isMarketTrade && isModeTrade
  const [isTradeTrailingMarketOrderType, setIsTradeTrailingMarketOrderType] = useState(false)
  const [isStopLossTradeTrailingMarketOrderType, setIsStopLossTradeTrailingMarketOrderType] = useState(false)
  const [isTakeProfitTradeTrailingMarketOrderType, setIsTakeProfitTradeTrailingMarketOrderType] = useState(false)
  const [stopSideType, setStopSideType] = useState(TradeStopSideTypeEnum.single)
  // 实际按照市价处理
  const _isTradeTrailingMarketOrderType = useMemo(() => {
    if (tradeOrderType === TradeOrderTypesEnum.stop) {
      if (stopSideType === TradeStopSideTypeEnum.double) {
        return isStopLossTradeTrailingMarketOrderType && isTakeProfitTradeTrailingMarketOrderType
      }
      return isTradeTrailingMarketOrderType
    }
    return isTradeTrailingMarketOrderType
  }, [
    isTradeTrailingMarketOrderType,
    stopSideType,
    isStopLossTradeTrailingMarketOrderType,
    isTakeProfitTradeTrailingMarketOrderType,
    tradeOrderType,
  ])
  const depthQuotePrice = isModeBuy
    ? Number(currentInitPrice.sellPrice || currentCoin.last)
    : Number(currentInitPrice.buyPrice || currentCoin.last)
  const formTriggerPrice = Form.useWatch('triggerPrice', form)
  const formStopLossTriggerPrice = Form.useWatch('stopLossTriggerPrice', form)
  const formTakeProfitTriggerPrice = Form.useWatch('takeProfitTriggerPrice', form)
  const hasDepthPrice = isModeBuy ? !!currentInitPrice.sellPrice : !!currentInitPrice.buyPrice
  const currentInitPriceQuotePrice = isModeBuy ? currentInitPrice.sellPrice : currentInitPrice.buyPrice
  const inputPrice = Form.useWatch('price', form)
  const inputAmount = Form.useWatch(TradeMarketAmountTypesEnum.amount, form)
  const inputFounds = Form.useWatch(TradeMarketAmountTypesEnum.funds, form)
  const isMarketPriceMode = useMemo(() => {
    if (
      TradeOrderTypesEnum.market === tradeOrderType ||
      ([TradeOrderTypesEnum.trailing, TradeOrderTypesEnum.stop].includes(tradeOrderType) &&
        _isTradeTrailingMarketOrderType)
    ) {
      return true
    }
    return false
  }, [tradeOrderType, _isTradeTrailingMarketOrderType])

  const initPrice = useMemo(() => {
    // 如果是触发价并且市价优先
    if ([TradeOrderTypesEnum.trailing].includes(tradeOrderType) && _isTradeTrailingMarketOrderType) {
      return formTriggerPrice || depthQuotePrice
    }
    if (!isMarketPriceMode) {
      return inputPrice
    }
    return depthQuotePrice
  }, [
    depthQuotePrice,
    _isTradeTrailingMarketOrderType,
    formTriggerPrice,
    tradeOrderType,
    isMarketPriceMode,
    inputPrice,
  ])

  const high = formatNumberDecimal(
    decimalUtils.SafeCalcUtil.add(1, currentCoin.priceFloatRatio).mul(initPrice || 1) || 9999999999,
    priceOffset
  )
  const low = formatNumberDecimal(
    decimalUtils.SafeCalcUtil.sub(1, currentCoin.priceFloatRatio).mul(initPrice || 1) || 0,
    priceOffset
  )
  const denominatedCoin = currentCoin.buySymbol || 'USDT'
  const underlyingCoin = currentCoin.sellSymbol || 'BTC'
  const isMarginTrade = [(TradeMarginEnum.isolated, TradeMarginEnum.margin)].includes(tradeTabType as any)
  const [loading, setLoading] = useState(false)
  const [percent, setPercent] = useState(0)
  const [tradePriceType, setTradePriceType] = useState(TradePriceTypeEnum.coinType)
  const [stopLossTradePriceType, setStopLossTradePriceType] = useState(TradePriceTypeEnum.coinType)
  const [takeProfitTradePriceType, setTakeProfitTradePriceType] = useState(TradePriceTypeEnum.coinType)
  const tradeMarginTypesMap = getTradeMarginTypesMap()
  const tradeMarginTypes = Object.keys(tradeMarginTypesMap).map(key => {
    return {
      title: tradeMarginTypesMap[key],
      id: key,
    }
  })
  /** 输入框下拉计价单位金额还是数量 eg usdt / btc */
  const [amountType, setAmountType] = useState(
    isModeBuy ? TradeMarketAmountTypesEnum.funds : TradeMarketAmountTypesEnum.amount
  )

  /** 交易成交额 input 显示策略，市价隐藏 */
  const totalPriceShow =
    TradeOrderTypesEnum.limit === tradeOrderType ||
    ([TradeOrderTypesEnum.trailing, TradeOrderTypesEnum.stop].includes(tradeOrderType) &&
      !_isTradeTrailingMarketOrderType)
  /** 委托输入框 */
  const trailingPriceShow = [TradeOrderTypesEnum.trailing, TradeOrderTypesEnum.stop].includes(tradeOrderType)
  const tradePriceTypeLabelMap = getTradePriceTypeLabelMap(isModeBuy)
  const onTradePriceSelectChange = params => {
    setTradePriceType(params)
  }
  const [tradeMarginType, setTradeMarginType] = useState(TradeMarginTypesEnum.normal)
  const msgRef = useRef<Record<string, any>>({})
  const inputAmountField = useMemo(() => {
    if (tradeOrderType === TradeOrderTypesEnum.limit) {
      return TradeMarketAmountTypesEnum.amount
    }
    if (tradeOrderType === TradeOrderTypesEnum.market) {
      return amountType
    }
    return _isTradeTrailingMarketOrderType ? amountType : TradeMarketAmountTypesEnum.amount
  }, [amountType, _isTradeTrailingMarketOrderType, tradeOrderType])
  /** 用户总资产 */
  const userCoinTotal = isModeBuy
    ? Number(userAssetsSpot.buyCoin?.availableAmount || 0)
    : Number(userAssetsSpot.sellCoin?.availableAmount || 0)
  /** 转换资产，统一资产的计价比，用来比对是否有钱下单 */
  const userCoinTotalDenominatedCoin = useMemo(() => {
    if (isModeBuy) {
      return userCoinTotal
    }
    return userCoinTotal * initPrice
  }, [userCoinTotal, initPrice, isModeBuy])

  const onAmountSelectChange = params => {
    setAmountType(params)
    onSliderChange(percent)
  }
  /** 重置 form 校验不然爆红 */
  useUpdateLayoutEffect(() => {
    resetForm()
  }, [inputAmountField, form, _isTradeTrailingMarketOrderType])

  // 切换 tab 刷新交易额校验
  useUpdateLayoutEffect(() => {
    form.resetFields(['totalPrice', 'triggerPrice', 'takeProfitTriggerPrice', 'stopLossTriggerPrice'])
    setPercent(0)
  }, [tradeOrderType, form, currentCoin.symbolName])

  /** 当前价格，更具档位、币种等类型获取价格 */
  const getCurrentPrice = () => {
    if (TradePriceTypeEnum.coinType === tradePriceType) {
      return form.getFieldsValue().price || 0
    }
    return getTradePriceByOrderBook(tradePriceType) || 0
  }
  /** 拖动 slide 计算交易数量、交易总额 */
  function onSliderChange(_percent) {
    setPercent(_percent)
    // 限价
    if (
      TradeOrderTypesEnum.limit === tradeOrderType ||
      ([TradeOrderTypesEnum.trailing, TradeOrderTypesEnum.stop].includes(tradeOrderType) &&
        !_isTradeTrailingMarketOrderType)
    ) {
      // 统一货币计算
      const userCoinCurrent = userCoinTotalDenominatedCoin / initPrice
      const _price = getCurrentPrice()
      if (_price > 0) {
        const amount = getTradeAmountByPercent(_percent, userCoinCurrent, amountOffset)
        const totalPrice = getTradeTotalPrice(_price, amount, priceOffset)
        form.setFieldsValue({
          amount,
          totalPrice,
        })
        return
      }
    }
    // 市价
    if (isMarketPriceMode) {
      // 统一货币计算
      if (inputAmountField === TradeMarketAmountTypesEnum.funds) {
        const funds = getTotalByPercent(_percent, userCoinTotalDenominatedCoin, priceOffset)
        form.setFieldsValue({
          [inputAmountField]: funds,
        })
      }
      if (inputAmountField === TradeMarketAmountTypesEnum.amount) {
        const amount = getTradeAmountByPercent(_percent, userCoinTotalDenominatedCoin / initPrice, amountOffset)
        form.setFieldsValue({
          [inputAmountField]: amount,
        })
      }
    }
  }
  const onFormChange = (currentVal, params) => {
    // 市价
    if (isMarketPriceMode) {
      let val = currentVal[inputAmountField]
      val = inputAmountField === TradeMarketAmountTypesEnum.amount ? val * initPrice : val
      let _percent = (100 * val) / userCoinTotalDenominatedCoin
      _percent = _percent >= 0 ? _percent : 0
      if (_percent > 100) {
        _percent = 0
      }
      setPercent(_percent)
      return
    }

    if (
      tradeOrderType === TradeOrderTypesEnum.limit ||
      ([TradeOrderTypesEnum.trailing, TradeOrderTypesEnum.stop].includes(tradeOrderType) &&
        !_isTradeTrailingMarketOrderType)
    ) {
      const currentKeys = Object.keys(currentVal)
      const updateVal = { ...params }
      if (currentKeys.includes('amount')) {
        updateVal.totalPrice = getTradeTotalPrice(updateVal.price, updateVal.amount || 0, priceOffset)
      } else if (currentKeys.includes('totalPrice')) {
        updateVal.amount = getTradeAmount(updateVal.totalPrice || 0, updateVal.price, amountOffset)
      } else if (currentKeys.includes('price')) {
        updateVal.amount = getTradeAmount(updateVal.totalPrice || 0, updateVal.price, amountOffset)
      }
      let _percent = (100 * updateVal.totalPrice) / userCoinTotalDenominatedCoin
      if (_percent > 100) {
        _percent = 0
      }
      if (_percent >= 0) {
        setPercent(_percent)
      }
      form.setFieldsValue(updateVal)
    }
  }

  function resetForm() {
    form.resetFields(['totalPrice', inputAmountField])
    msgRef.current = {}
    setPercent(0)
  }

  function resetFormAfterSubmit() {
    sendRefreshCouponSelectApiNotify()
    resetForm()
    form.resetFields(['triggerPrice', 'takeProfitTriggerPrice', 'stopLossTriggerPrice'])
  }

  function formatFormParams(params) {
    // amountOffset
    if (params.price) {
      params.price = formatNumberDecimal(params.price, priceOffset)
    }
    if (params.totalPrice) {
      params.totalPrice = formatNumberDecimal(params.totalPrice, priceOffset)
    }
    if (params.triggerPrice) {
      params.triggerPrice = formatNumberDecimal(params.triggerPrice, priceOffset)
    }
    if (params.stopLossTriggerPrice) {
      params.stopLossTriggerPrice = formatNumberDecimal(params.stopLossTriggerPrice, priceOffset)
    }
    if (params.takeProfitTriggerPrice) {
      params.takeProfitTriggerPrice = formatNumberDecimal(params.takeProfitTriggerPrice, priceOffset)
    }
    return params
  }

  const onFormSubmit = formParams => {
    if (currentCoin.isShare === MarketIsShareEnum.close) {
      Message.error(t`features_trade_spot_trade_form_index_5101315`)
      return
    }
    if (!hasDepthPrice && TradeOrderTypesEnum.market === tradeOrderType) {
      Message.error(t`features_trade_spot_trade_form_index_5101316`)
      return
    }
    const msg = Object.values(msgRef.current).find(v => !!v)
    if (msg) {
      Message.error({ id: 'tradeSubmit', content: msg })
      return
    }
    /**
     * 校验止盈止损规则
     */
    const checkStrategyRes = checkSpotStrategyPrice(
      tradeOrderType,
      formParams,
      isModeBuy,
      currentCoin.last,
      stopSideType
    )
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

      return
    }
    formParams = formatFormParams(formParams)
    const params = getTradeOrderParams(
      formParams,
      currentCoin,
      tradeMode,
      tradeTabType,
      tradeOrderType,
      tradeMarginType,
      tradePriceType,
      isModeBuy,
      inputAmountField,
      coupons
    ) as any
    if (tradeMode === TradeModeEnum.spot) {
      if (
        !getCanOrderMore(
          [TradeOrderTypesEnum.trailing, TradeOrderTypesEnum.stop].includes(tradeOrderType)
            ? EntrustTypeEnum.plan
            : EntrustTypeEnum.normal,
          isModeBuy ? OrderDirectionEnum.buy : OrderDirectionEnum.sell
        )
      ) {
        Message.error(t`features_trade_spot_trade_form_index_5101342`)
        return
      }
      // 下单时是否开启二次确认 仅仅现货计划单（默认必须打开），合约需要用户配置
      /** 现货委托交易需要弹窗 */
      if ([TradeOrderTypesEnum.stop].includes(tradeOrderType) && tradeTabType === TradeModeEnum.spot) {
        const getIsDialogSettingOpen = () => {
          if (tradeOrderType === TradeOrderTypesEnum.stop) {
            return setting.trailing.stop.spot
          }
          if (_isTradeTrailingMarketOrderType) {
            return setting.trailing.market.spot
          }
          return setting.trailing.limit.spot
        }
        openTradeOrderPreviewDialog(formParams, getIsDialogSettingOpen(), () => {
          setLoading(true)
          postV1ProfitLossOrdersPlaceApiRequest(
            getTradeSpotStopOrderParams(
              formParams,
              currentCoin,
              isModeBuy,
              inputAmountField,
              _isTradeTrailingMarketOrderType,
              currentCoin.last,
              stopSideType,
              isStopLossTradeTrailingMarketOrderType,
              isTakeProfitTradeTrailingMarketOrderType,
              coupons
            ) as any
          )
            .then(res => {
              if (res.isOk) {
                Message.success(t`features/orders/details/modify-stop-limit-0`)
                resetFormAfterSubmit()
              }
            })
            .finally(() => setLoading(false))
        })
        return
      }
      if ([TradeOrderTypesEnum.trailing].includes(tradeOrderType) && tradeTabType === TradeModeEnum.spot) {
        const getIsDialogSettingOpen = () => {
          if (tradeOrderType === TradeOrderTypesEnum.stop) {
            return setting.trailing.stop.spot
          }
          if (_isTradeTrailingMarketOrderType) {
            return setting.trailing.market.spot
          }
          return setting.trailing.limit.spot
        }
        openTradeOrderPreviewDialog(formParams, getIsDialogSettingOpen(), () => {
          setLoading(true)
          postSplSaveStrategy(
            getTradeSpotTrailingOrderParams(
              formParams,
              currentCoin,
              isModeBuy,
              inputAmountField,
              _isTradeTrailingMarketOrderType,
              currentCoin.last,
              coupons
            )
          )
            .then(res => {
              if (res.isOk) {
                Message.success(t`features/orders/details/modify-stop-limit-0`)
                resetFormAfterSubmit()
              }
            })
            .finally(() => setLoading(false))
        })
        return
      }
      /** 市价限价 */
      const getIsDialogSettingOpen = () => {
        if (tradeOrderType === TradeOrderTypesEnum.market) {
          return setting.common.market.spot
        }
        return setting.common.limit.spot
      }
      openTradeOrderPreviewDialog(formParams, getIsDialogSettingOpen(), () => {
        setLoading(true)
        postTradeOrderPlace(params)
          .then(res => {
            if (res.isOk) {
              Message.success(t`features/orders/details/modify-stop-limit-0`)
              resetFormAfterSubmit()
            }
          })
          .finally(() => setLoading(false))
      })
      return
    }
    return null
  }

  function openTradeOrderPreviewDialog(formParams, isDialogSettingOpen, onOk, onCancel?: any) {
    if (isDialogSettingOpen) {
      return Modal.confirm({
        closable: true,
        icon: null,
        maskClosable: false,
        title: t`features/trade/trade-form/index-5`,
        style: { width: '444px' },
        className: 'trade-order-confirm-wrap',
        content: (
          <TradeOrderConfirm
            coin={currentCoin}
            isModeBuy={isModeBuy}
            formParams={formParams}
            tradeOrderType={tradeOrderType}
            tradeMode={tradeMode}
            amountType={inputAmountField}
            stopSideType={stopSideType}
            isTradeTrailingMarketOrderType={isTradeTrailingMarketOrderType}
            isStopLossTradeTrailingMarketOrderType={isStopLossTradeTrailingMarketOrderType}
            isTakeProfitTradeTrailingMarketOrderType={isTakeProfitTradeTrailingMarketOrderType}
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
      form.setFieldsValue({ price: currentInitPriceQuotePrice })
    } else {
      form.setFieldsValue({ priceText: tradePriceTypeLabelMap[tradePriceType] })
    }
  }, [tradePriceType, currentInitPriceQuotePrice, tradeOrderType])

  function getInitFormValue() {
    if (tradeOrderType === TradeOrderTypesEnum.market) {
      return { priceText: t`features_trade_trade_price_input_index_2447` }
    }
    if (tradeOrderType === TradeOrderTypesEnum.limit) {
      return {
        price: initPrice,
      }
    }
    if ([TradeOrderTypesEnum.trailing, TradeOrderTypesEnum.stop].includes(tradeOrderType)) {
      return { price: initPrice }
    }
    return {}
  }
  const priceField = getPriceField(tradeOrderType, tradePriceType)
  const [modalVisible, setModalVisible] = useState(false)

  const openModal = () => setModalVisible(true)
  const hideModal = () => setModalVisible(false)

  useUpdateEffect(() => {
    const price = initPrice
    let amount = 0
    if (inputAmountField === TradeMarketAmountTypesEnum.funds) {
      amount = Number(formatNumberDecimal(decimalUtils.SafeCalcUtil.div(inputFounds, initPrice), amountOffset))
    } else {
      amount = inputAmount
    }
    setFee(
      calculatorFeeAmount({
        price,
        amount,
        feeRate: isModeBuy ? currentCoin.buyFee : currentCoin.sellFee,
      })
    )
  }, [initPrice, inputAmountField, currentCoin.buyFee, inputFounds, inputAmount])

  return (
    <div className={classnames(Styles.scoped, `trade-${tradeMode}`, isModeBuy ? `mode-buy` : 'mode-sell')}>
      {modalVisible && (
        <DepositModal
          visible={modalVisible}
          onClose={hideModal}
          coinId={!isModeBuy ? currentCoin.sellCoinId : currentCoin.buyCoinId}
        />
      )}
      <Form form={form} initialValues={getInitFormValue()} onChange={onFormChange} onSubmit={onFormSubmit}>
        {/* 市价 */}
        {tradeOrderType === TradeOrderTypesEnum.market && (
          <TradeSpotMarket
            priceField={priceField}
            tradeOrderType={tradeOrderType}
            msgRef={msgRef}
            high={high}
            low={low}
            denominatedCoin={denominatedCoin}
            tradeMode={tradeMode}
            priceOffset={priceOffset}
            tradePriceType={tradePriceType}
            isTradeTrailingMarketOrderType={isTradeTrailingMarketOrderType}
            onTradePriceSelectChange={onTradePriceSelectChange}
            setIsTradeTrailingMarketOrderType={setIsTradeTrailingMarketOrderType}
            isMarketPriceMode={isMarketPriceMode}
            inputAmountField={inputAmountField}
            initPrice={initPrice}
            userCoinTotalDenominatedCoin={userCoinTotalDenominatedCoin}
            maxAmount={maxAmount}
            underlyingCoin={underlyingCoin}
            minAmount={minAmount}
            form={form}
            maxFunds={maxFunds}
            minFunds={minFunds}
            amountOffset={amountOffset}
            onAmountSelectChange={onAmountSelectChange}
            percent={percent}
            onSliderChange={onSliderChange}
            formatTooltip={formatTooltip}
            setCoupons={setCoupons}
            fee={fee}
            isModeBuy={isModeBuy}
          />
        )}
        {/* 限价 */}
        {tradeOrderType === TradeOrderTypesEnum.limit && (
          <TradeSpotLimit
            priceField={priceField}
            tradeOrderType={tradeOrderType}
            msgRef={msgRef}
            high={high}
            low={low}
            denominatedCoin={denominatedCoin}
            tradeMode={tradeMode}
            priceOffset={priceOffset}
            tradePriceType={tradePriceType}
            isTradeTrailingMarketOrderType={isTradeTrailingMarketOrderType}
            onTradePriceSelectChange={onTradePriceSelectChange}
            setIsTradeTrailingMarketOrderType={setIsTradeTrailingMarketOrderType}
            isMarketPriceMode={isMarketPriceMode}
            inputAmountField={inputAmountField}
            initPrice={initPrice}
            userCoinTotalDenominatedCoin={userCoinTotalDenominatedCoin}
            maxAmount={maxAmount}
            underlyingCoin={underlyingCoin}
            minAmount={minAmount}
            form={form}
            maxFunds={maxFunds}
            minFunds={minFunds}
            amountOffset={amountOffset}
            onAmountSelectChange={onAmountSelectChange}
            percent={percent}
            onSliderChange={onSliderChange}
            formatTooltip={formatTooltip}
            setCoupons={setCoupons}
            fee={fee}
            isModeBuy={isModeBuy}
          />
        )}
        {/* 计划 */}
        {tradeOrderType === TradeOrderTypesEnum.trailing && (
          <TradeSpotTrailing
            priceField={priceField}
            tradeOrderType={tradeOrderType}
            msgRef={msgRef}
            high={high}
            low={low}
            denominatedCoin={denominatedCoin}
            tradeMode={tradeMode}
            priceOffset={priceOffset}
            tradePriceType={tradePriceType}
            isTradeTrailingMarketOrderType={isTradeTrailingMarketOrderType}
            onTradePriceSelectChange={onTradePriceSelectChange}
            setIsTradeTrailingMarketOrderType={setIsTradeTrailingMarketOrderType}
            isMarketPriceMode={isMarketPriceMode}
            inputAmountField={inputAmountField}
            initPrice={initPrice}
            userCoinTotalDenominatedCoin={userCoinTotalDenominatedCoin}
            maxAmount={maxAmount}
            underlyingCoin={underlyingCoin}
            minAmount={minAmount}
            form={form}
            maxFunds={maxFunds}
            minFunds={minFunds}
            amountOffset={amountOffset}
            onAmountSelectChange={onAmountSelectChange}
            percent={percent}
            onSliderChange={onSliderChange}
            formatTooltip={formatTooltip}
            trailingPriceShow={trailingPriceShow}
            totalPriceShow={totalPriceShow}
            setCoupons={setCoupons}
            fee={fee}
            isModeBuy={isModeBuy}
          />
        )}
        {/* 止盈止损的单向双向选择 */}
        {tradeOrderType === TradeOrderTypesEnum.stop && (
          <TradeSpotStop
            tradeOrderType={tradeOrderType}
            msgRef={msgRef}
            high={high}
            low={low}
            denominatedCoin={denominatedCoin}
            tradeMode={tradeMode}
            priceOffset={priceOffset}
            tradePriceType={tradePriceType}
            onTradePriceSelectChange={onTradePriceSelectChange}
            stopLossTradePriceType={stopLossTradePriceType}
            onStopLossTradePriceSelectChange={params => {
              setStopLossTradePriceType(params)
            }}
            takeProfitTradePriceType={takeProfitTradePriceType}
            onTakeProfitTradePriceSelectChange={params => {
              setTakeProfitTradePriceType(params)
            }}
            isTradeTrailingMarketOrderType={isTradeTrailingMarketOrderType}
            setIsTradeTrailingMarketOrderType={setIsTradeTrailingMarketOrderType}
            isStopLossTradeTrailingMarketOrderType={isStopLossTradeTrailingMarketOrderType}
            setIsStopLossTradeTrailingMarketOrderType={setIsStopLossTradeTrailingMarketOrderType}
            isTakeProfitTradeTrailingMarketOrderType={isTakeProfitTradeTrailingMarketOrderType}
            setIsTakeProfitTradeTrailingMarketOrderType={setIsTakeProfitTradeTrailingMarketOrderType}
            isMarketPriceMode={isMarketPriceMode}
            inputAmountField={inputAmountField}
            initPrice={initPrice}
            userCoinTotalDenominatedCoin={userCoinTotalDenominatedCoin}
            maxAmount={maxAmount}
            underlyingCoin={underlyingCoin}
            minAmount={minAmount}
            form={form}
            maxFunds={maxFunds}
            minFunds={minFunds}
            amountOffset={amountOffset}
            onAmountSelectChange={onAmountSelectChange}
            percent={percent}
            onSliderChange={onSliderChange}
            formatTooltip={formatTooltip}
            trailingPriceShow={trailingPriceShow}
            totalPriceShow={totalPriceShow}
            setStopSideType={setStopSideType}
            stopSideType={stopSideType}
            setCoupons={setCoupons}
            fee={fee}
            isModeBuy={isModeBuy}
          />
        )}
        <div className="assets-wrap" style={{ paddingTop: '0' }}>
          <div className="label">
            {t`Avbl`}
            <span className="assets-text">
              {isModeBuy ? userAssetsSpot.buyCoin?.availableAmountText : userAssetsSpot.sellCoin?.availableAmountText}{' '}
              {isModeBuy ? denominatedCoin : underlyingCoin}
            </span>
          </div>
          <div className="num">
            {!isMergeMode && <Icon className="text-sm" onClick={openModal} name="a-spot_available" />}
          </div>
        </div>
        <div className="assets-wrap" style={{ marginTop: '-14px', marginBottom: '12px' }}>
          <div className="label">
            {isModeBuy
              ? t`features_trade_spot_trade_form_index_qxdljq0pz8`
              : t`features_trade_spot_trade_form_index_q9cylqpjvb`}
            <span className="assets-text">
              {isModeBuy
                ? formatCurrency(userCoinTotal / Number(currentCoin.last), amountOffset)
                : formatCurrency(userCoinTotal * Number(currentCoin.last), priceOffset)}{' '}
              {!isModeBuy ? denominatedCoin : underlyingCoin}
            </span>
          </div>
        </div>
        <FormItem labelAlign="left">
          {!userStore.isLogin && (
            <Button
              type="primary"
              onClick={() => {
                link(`/login?redirect=${getDefaultTradeUrl()}`)
              }}
              long
              className="submit-btn login-btn-wrap"
            >
              {/* {t`features_trade_spot_trade_form_index_5101270`} */}
              <Link href={`/login?redirect=${getDefaultTradeUrl()}`}> {t`user.field.reuse_07`} </Link>
              {t`user.third_party_01`}
              <Link href="/register"> {t`user.validate_form_11`} </Link>
            </Button>
          )}
          {userStore.isLogin && (
            <Button
              loading={loading}
              type="primary"
              disabled={!isTrading}
              htmlType="submit"
              long
              className="submit-btn"
            >
              {getTradeFormSubmitBtnText(
                false,
                tradeMode,
                isTrading,
                userInfo.spotStatusInd,
                isModeBuy,
                underlyingCoin
              )}
            </Button>
          )}
        </FormItem>
      </Form>
    </div>
  )
}

export default forwardRef(TradeForm)
