/**
 * 合约 - 平仓弹框组件
 */
import { Button, Form, Message } from '@nbit/arco'
import { t } from '@lingui/macro'
import React, { useState, useEffect, useRef } from 'react'
import {
  EntrustTypeEnum,
  EntrustPlaceUnit,
  EntrustOrderTypeInd,
  TradePairMarketStatus,
  FuturePositionDirectionEnum,
} from '@/constants/assets/futures'
import AssetsPopUp from '@/features/assets/common/assets-popup'
import styles from '@/features/assets/common/assets-popup/asset-popup-form/index.module.css'
import AssetsInputNumber from '@/features/assets/common/assets-input-number'
import {
  getFuturesMarketDepthApi,
  getAmountByPercent,
  getPercentByAmount,
  onGetExpectedProfit,
  onGetGroupPurchasingPower,
  calculatorInitMargin,
  checkOpenMarginInfo,
} from '@/helper/assets/futures'
import { useLockFn, useMemoizedFn, useUnmount, useUpdateEffect } from 'ahooks'
import { postPerpetualOrdersPlace } from '@/apis/assets/futures/position'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import { postPositionCheckExist, getTradePairDetailApi } from '@/apis/assets/futures/common'
import { IPositionListData, ITradePairDetailData } from '@/typings/api/assets/futures/position'
import { decimalUtils } from '@nbit/utils'
import { WsBizEnum, WsTypesEnum } from '@/constants/ws'
import AssetsPopupTips from '@/features/assets/common/assets-popup/assets-popup-tips'
import { YapiGetPerpetualMarketRestV1MarketDepthApiResponse } from '@/typings/yapi/PerpetualMarketRestMarketDepthV1GetApi'
import { formatNonExponential, formatNumberDecimal } from '@/helper/decimal'
import classNames from 'classnames'
import CouponSelect, { ICouponResult } from '@/features/welfare-center/common/coupon-select'
import { ICoupons } from '@/typings/api/welfare-center/coupons-select'
import {
  calculatorFeeAmount,
  calculatorOrderAmount,
  sendRefreshCouponSelectApiNotify,
} from '@/helper/welfare-center/coupon-select'
import { useGetCouponSelectList, useIsMatchCoupon } from '@/hooks/features/welfare-center/coupon-select'
import { BusinessSceneEnum } from '@/constants/welfare-center/coupon-select'
import PositionPrice from '../position-price'
import SliderBar from '../slider'
import { EntrustTypeSelect } from '../entrust-select'
import { PlanPrice } from '../position-price/footer-position-price'
import { PositionModalHeader } from '../position-modal-header'

const SafeCalcUtil = decimalUtils.SafeCalcUtil
interface ClosePositionModalProps {
  visible: boolean
  setVisible: (val: boolean) => void
  /** 仓位信息 */
  positionData: IPositionListData
  onSuccess?: (val?: any) => void
}

export function ClosePositionModal(props: ClosePositionModalProps) {
  const { visible, setVisible, positionData, onSuccess } = props || {}
  /** 仓位基本信息 */
  const {
    groupId = '',
    symbol = '',
    tradeId,
    positionId = '',
    size = 0,
    lockSize = 0,
    sideInd = '',
    openPrice = '',
    markPrice = '',
    entrustFrozenSize = 0,
    latestPrice = '',
    symbolWassName = '',
    lever,
    voucherAmount = 0,
  } = positionData || {}
  /** 初始化我的卡券列表 */
  useGetCouponSelectList(BusinessSceneEnum.perpetual)
  /** positionDealPrice 最新成交价 */
  const {
    wsDealSubscribe,
    wsDealUnSubscribe,
    wsMarkPriceSubscribe,
    wsMarkPriceUnSubscribe,
    positionDealPrice,
    updatePositionDealPrice,
    positionMarkPrice,
    updatePositionMarkPrice,
    positionModule: { strategyInfo, updateStrategyInfo },
    wsDepthSubscribe,
    wsDepthUnSubscribe,
    positionDepthPrice,
    updatePositionDepthPrice,
  } = useAssetsFuturesStore()

  /** 合约币对详情 */
  const [tradePairDetailData, setTradePairDetailData] = useState<ITradePairDetailData | undefined>()
  const {
    /** 数量精度位 */
    amountOffset = 0,
    priceOffset = 0,
    /** 计价币名 */
    quoteSymbolName = '',
    /** 标的币名 */
    baseSymbolName = '',
    /** taker 费率 */
    takerFeeRate = 0,
    /** 最小下单数量 */
    minCount = 0,
    /** 最大下单数量 */
    maxCount = 0,
    /** marketStatus：合约交易状态 - 1 开盘中、2 停盘中、3 预约开盘 */
    marketStatus = TradePairMarketStatus.open,
  } = tradePairDetailData || {}

  const FormItem = Form.Item
  const [form] = Form.useForm()
  const amountWatch = Form.useWatch('amount', form)
  const priceWatch = Form.useWatch('price', form)
  const [loading, setLoading] = useState(false)

  /** 预计盈亏 */
  const [profitLossAmount, setProfitLossAmount] = useState<string | number>('--')
  /** 检测仓位亏损过高，保证金不足 */
  const [visibleCheckOpenMarginPrompt, setVisibleCheckOpenMarginPrompt] = useState(false)

  /** 仓位占比 */
  const [positionPercent, setPositionPercent] = useState(0)
  const [buttonDisable, setButtonDisable] = useState(true)
  const [entrustType, setEntrustType] = useState<EntrustTypeEnum>(strategyInfo.closeEntrustType)
  const [isMarketPrice, setIsMarketPrice] = useState(entrustType === EntrustTypeEnum.market)

  // 预估下单金额，用于匹配手续费卡券门槛
  const [amount, setAmount] = useState('')
  // 预估手续费
  const [fee, setFee] = useState('')
  // 已选优惠券列表
  const [couponData, setCouponData] = useState<ICouponResult>({
    coupons: [] as ICoupons[],
    isManual: false,
  })
  // 是否需要自动匹配最优券
  const isMatch = useIsMatchCoupon(
    amountWatch,
    priceWatch,
    couponData?.isManual,
    entrustType === EntrustTypeEnum.market
  )

  /**
   * 最大平仓数量
   * 限价 - 可平仓数量：持仓数量 - 委托订单冻结数量
   * 市价 - 可平仓数量：持仓数量
   */
  const getMaxCloseSize = () => {
    if (isMarketPrice) {
      return Number(SafeCalcUtil.sub(size, lockSize))
    }
    return Number(SafeCalcUtil.sub(SafeCalcUtil.sub(size, entrustFrozenSize), lockSize))
  }
  /** 平仓 - 预计盈亏计算公式
   * 限价：（委托价格 - 开仓均价）*平仓数量 - 委托价格*平仓数量*taker 费率
   * 市价：（最新价格 - 开仓均价）*平仓数量 - 最新价格*平仓数量*taker 费率
   */
  const getProfitLossAmount = () => {
    /** 委托价格 */
    const entrustPrice = Number(form.getFieldValue('price'))
    const entrustAmount = Number(form.getFieldValue('amount'))
    if (!entrustAmount || (!isMarketPrice && !entrustPrice)) {
      setProfitLossAmount('--')
      return
    }

    // 计算价格
    let calculatePrice = entrustPrice
    // 市价
    if (isMarketPrice) {
      // calculatePrice = Number(positionDepthPrice)
      calculatePrice = Number(positionDealPrice)
    }

    const profitLossVal = Number(
      onGetExpectedProfit({
        price: String(calculatePrice),
        closeSize: String(entrustAmount),
        openPrice,
        takerFeeRate: String(takerFeeRate),
        sideInd,
      })
    )

    // !isNaN(profitLossVal) ? setProfitLossAmount(profitLossVal) : setProfitLossAmount(0)
    setProfitLossAmount(profitLossVal)
    return profitLossVal
  }

  /** 按钮可用状态 */
  const setButtonDisableState = val => {
    if (isMarketPrice) {
      val ? setButtonDisable(false) : setButtonDisable(true)
    }

    if (!isMarketPrice) {
      const entrustPrice = form.getFieldValue('price')
      val && entrustPrice ? setButtonDisable(false) : setButtonDisable(true)
    }
  }

  /** 拖动 slide 计算数量 */
  const onSliderChange = _percent => {
    setPositionPercent(_percent)
    /** 通过持仓数量的百分比计算委托数量 */
    const _amount = getAmountByPercent(_percent, Number(getMaxCloseSize()), amountOffset)
    form.setFieldValue('amount', _amount)
    getProfitLossAmount()
    setButtonDisableState(_amount)
  }

  /** 输入数值，计算百分比 */
  const onInputChange = useLockFn(async val => {
    const maxCloseSize = getMaxCloseSize()
    const _percent = getPercentByAmount(val, maxCloseSize)
    if (_percent >= 0) {
      maxCloseSize === 0 ? setPositionPercent(100) : setPositionPercent(_percent)
    }
    getProfitLossAmount()
    setButtonDisableState(val)
  })

  /** 委托类型 change */
  const onEntrustTypeChange = (type: EntrustTypeEnum) => {
    setEntrustType(type)
    setIsMarketPrice(type === EntrustTypeEnum.market)
    const entrustPrice = Number(form.getFieldValue('price'))
    const entrustAmount = Number(form.getFieldValue('amount'))
    // 市价不需要传 price
    if (type === EntrustTypeEnum.market) {
      form.resetFields('price')
      if (!entrustAmount) setProfitLossAmount('--')
    } else {
      if (!entrustPrice || !entrustAmount) setProfitLossAmount('--')
    }
    updateStrategyInfo({ ...strategyInfo, closeEntrustType: type })
  }

  // 委托价格输入框
  const inputWrapperRef = useRef<HTMLDivElement>(null)
  /** 点击市价输入框切换为限价 */
  const onClickMarketPriceInput = () => {
    if (entrustType === EntrustTypeEnum.market) {
      onEntrustTypeChange(EntrustTypeEnum.limit)
    }
    setTimeout(() => {
      if (inputWrapperRef.current) {
        inputWrapperRef.current.querySelector('input')?.focus()
      }
    }, 10)
  }

  /** form 表单内容改变 */
  const onFormChange = useLockFn(async () => {
    try {
      await form.validate()
      setButtonDisable(false)
    } catch (e) {
      setButtonDisable(true)
    }
  })

  /** 检测是否小于最小下单 or 超过最大下单 */
  const checkMinOrMaxInput = () => {
    const entrustAmount = form.getFieldValue('amount')
    /** 下单数量<=最大下单数量/交易额 */
    if (entrustAmount > Number(maxCount)) {
      Message.error(t`features_assets_futures_common_close_position_modal_index_5101491`)
      return false
    }
    return true
  }

  /** 检测仓位是否存在 */
  const checkExistPosition = async () => {
    const params = { groupId: String(groupId), positionId: String(positionId) }
    const res = await postPositionCheckExist(params)
    const { isOk, data: { exist = false } = {} } = res || {}

    if (!isOk) {
      return false
    }

    if (!exist) {
      Message.error(t`features_assets_futures_common_close_position_modal_index_5101494`)
      return false
    }
    return true
  }

  /** 提交方法 */
  const onFormSubmit = useLockFn(async () => {
    try {
      // 合约交易状态是否开启
      if (marketStatus !== TradePairMarketStatus.open) {
        Message.error(t`features_assets_futures_common_close_position_modal_index_5101495`)
        return
      }

      const entrustAmount = form.getFieldValue('amount')
      if (Number(voucherAmount) > 0 && +entrustAmount < +size) {
        Message.error(t`features_assets_futures_common_close_position_modal_index_ofu32los8s`)
        return
      }

      /**
       * 计算仓位预计亏损
       * 多 - 限价：（委托价格 - 开仓均价）*平仓数量 - 委托价格*平仓数量*taker 费率;
       * 多 - 市价：（第五档价格 - 开仓均价）*平仓数量 - 第五档价格*平仓数量*taker 费率
       * 空 - 限价：（开仓均价 - 委托价格）*平仓数量 - 委托价格*平仓数量*taker 费率
       * 空 -  市价：（开仓均价 - 第五档价格）*平仓数量 - 第五档价格*平仓数量*taker 费率
       */
      const marketDepth: YapiGetPerpetualMarketRestV1MarketDepthApiResponse['data'] =
        (await getFuturesMarketDepthApi(symbol, 5)) || {}
      const bidsLength = marketDepth?.bids?.length || 0
      const asksLength = marketDepth?.asks?.length || 0
      const maxBids = marketDepth?.bids?.[bidsLength - 1]?.[0] || '' // 最大买 5 价
      const maxAsks = marketDepth?.asks?.[asksLength - 1]?.[0] || '' // 最大卖 5 价

      const max = sideInd === FuturePositionDirectionEnum.openBuy ? maxAsks : maxBids
      const entrustPrice = Number(form.getFieldValue('price'))

      // 仓位预计亏损
      const positionEstimatedProfit = Number(
        onGetExpectedProfit({
          price: entrustType === EntrustTypeEnum.limit ? String(entrustPrice) : max,
          closeSize: String(entrustAmount),
          openPrice,
          takerFeeRate: String(takerFeeRate),
          sideInd,
        })
      )

      /**
       * 预计亏损<0 且 仓位预计亏损绝对值>=仓位初始保证金 + 合约组可用，提示保证金不足
       * 平仓数量的仓位初始保证金 = 开仓均价 * 平仓数量 / 杠杆倍数
       */
      const groupAvailableMargin = await onGetGroupPurchasingPower(groupId)
      const positionInitMargin = calculatorInitMargin(openPrice, entrustAmount, lever)
      if (checkOpenMarginInfo(positionEstimatedProfit, positionInitMargin, groupAvailableMargin)) {
        setVisibleCheckOpenMarginPrompt(true)
        return
      }

      // 合约交易状态是否开启
      if (form.getFieldValue('amount') > getMaxCloseSize()) {
        Message.error(t`features_assets_futures_common_close_position_modal_index_5101562`)
        return
      }

      // 最小下单数量/交易额=<下单数量/交易额<=最大下单数量/交易额
      if (!checkMinOrMaxInput()) return

      // 检测仓位是否存在
      if (!checkExistPosition()) return

      setLoading(true)
      const params = {
        groupId,
        /**  仓位 id ,减仓单，平仓单必传 */
        positionId,
        /** 交易对 id */
        tradeId,
        /** 订单类型    limit_order 限价委托单  market_order 市价委托单 forced_liquidation_order 强平委托单 forced_lighten_order 强减委托单 */
        typeInd:
          entrustType === EntrustTypeEnum.limit ? EntrustOrderTypeInd.limitOrder : EntrustOrderTypeInd.marketOrder,
        /** 委托价格类型 limit 限价 market 市价 */
        entrustTypeInd: entrustType,
        /**  TODO 后端枚举值有修改，暂时写死，方向类型 open_long 开多 , open_short 开空 ,close_long 平多，close_short 平空 */
        sideInd: `close_${sideInd}`, // TODO 仓位方向和订单方向值有变更 - FutureOrderDirectionEnum.closeBuy,
        /** 委托价格;限价单必传，市价单不传 */
        price: entrustPrice as any,
        /** 委托数量;限价单市价单必传 */
        size: formatNonExponential(entrustAmount),
        /** 下单选择的币种是标的币还是计价币；如果是标的币传 BASE，如果是计价币传 QUOTE */
        placeUnit: EntrustPlaceUnit.base,
        /** 市价单单位 amount 按金额 quantity 按数量 */
        marketUnit: 'quantity', // TODO 持仓的平仓市价单固定按数量？
        coupons: couponData?.coupons || [],
        // voucherAmount: Number(voucherAmount),
      }
      // 市价按数量下单不需要传 price 字段
      if (entrustType === EntrustTypeEnum.market) {
        delete params.price
      }

      const res = await postPerpetualOrdersPlace(params)
      const { isOk, data = {}, message = '' } = res || {}
      setLoading(false)
      if (!isOk) {
        // setVisible(false)
        return false
      }

      if (!data) {
        Message.error(message || t`features_assets_futures_common_close_position_modal_index_ihpnbxkzbwwg749boqes_`)
        setVisible(false)
        return false
      }

      /** 通知刷新卡券选择接口 */
      sendRefreshCouponSelectApiNotify()
      form.clearFields()
      Message.success(t`features_assets_futures_common_close_position_modal_index_5101384`)
      setVisible(false)
      onSuccess && onSuccess()
      return true
    } catch (error) {
      Message.error(t`features_assets_main_assets_detail_trade_pair_index_2562`)
    }
  })

  const initData = async () => {
    /** 获取币对详情接口 */
    const tradePairDetailRes = await getTradePairDetailApi({ symbol })
    if (tradePairDetailRes.isOk) {
      setTradePairDetailData(tradePairDetailRes.data)
    }
  }

  /** 最新价订阅入参 */
  const subs = {
    biz: WsBizEnum.perpetual,
    type: WsTypesEnum.perpetualDeal,
    base: baseSymbolName,
    quote: quoteSymbolName,
    contractCode: symbolWassName,
  }

  const markSubs = { biz: WsBizEnum.perpetual, type: WsTypesEnum.perpetualIndex, contractCode: symbolWassName }

  /** 打开弹框时默认填入 100% 持仓数量 */
  const setDefaultAmount = () => {
    form.setFieldValue('amount', getMaxCloseSize())
    onInputChange(getMaxCloseSize())
  }

  /**
   * 最新价格推送回调
   */
  const onDepthWsCallBack = useMemoizedFn(data => {
    if (!data || data.length === 0) return
    const depthData = data[0]
    if (symbolWassName !== depthData?.symbolWassName) return

    const maxBids = depthData?.bids?.[0]?.price || '' // 买 1 价
    const maxAsks = depthData?.asks?.[0]?.price || '' // 卖 1 价
    const newDepthPrice = sideInd === FuturePositionDirectionEnum.openSell ? maxBids : maxAsks

    updatePositionDepthPrice(newDepthPrice)
  })

  useEffect(() => {
    initData()
    wsDealSubscribe(subs)
    wsMarkPriceSubscribe(markSubs)
    updatePositionDealPrice(latestPrice)
    updatePositionMarkPrice(markPrice)
    // wsDepthSubscribe(symbolWassName, onDepthWsCallBack)

    setDefaultAmount()
  }, [symbol])

  useEffect(() => {
    if (entrustType === EntrustTypeEnum.limit) {
      wsDepthUnSubscribe(symbolWassName, onDepthWsCallBack)
    } else {
      wsDepthSubscribe(symbolWassName, onDepthWsCallBack)
    }
  }, [entrustType])

  useUnmount(() => {
    wsDealUnSubscribe(subs)
    wsMarkPriceUnSubscribe(markSubs)
    wsDepthUnSubscribe(symbolWassName, onDepthWsCallBack)
  })

  useUpdateEffect(() => {
    getProfitLossAmount()
  }, [positionDealPrice, entrustType, priceWatch])

  useUpdateEffect(() => {
    const entrustAmount = form.getFieldValue('amount')
    setButtonDisableState(entrustAmount)
    onInputChange(entrustAmount)
  }, [entrustType])

  useUpdateEffect(() => {
    const price = entrustType === EntrustTypeEnum.limit ? Number(priceWatch) : positionDealPrice
    const _amount = calculatorOrderAmount({ orderAmount: amountWatch, orderPrice: price })
    setAmount(_amount)
  }, [amountWatch, entrustType, priceWatch, positionDealPrice])

  useUpdateEffect(() => {
    const price = entrustType === EntrustTypeEnum.limit ? Number(form.getFieldValue('price')) : positionDealPrice
    const amount = Number(form.getFieldValue('amount'))
    const feeVal = calculatorFeeAmount({
      price,
      amount,
      feeRate: takerFeeRate,
    })
    setFee(feeVal)
  }, [form.getFieldValue('amount'), entrustType, form.getFieldValue('price'), positionDealPrice, takerFeeRate])

  return (
    <div>
      <AssetsPopUp
        isResetCss
        title={null}
        visible={visible}
        footer={null}
        unmountOnExit
        onCancel={() => {
          setVisible(false)
        }}
      >
        <PositionModalHeader title={t`constants/assets/common-1`} positionData={positionData} />
        <div className="px-8">
          <PositionPrice
            openPrice={openPrice}
            markPrice={positionMarkPrice}
            latestPrice={positionDealPrice}
            baseCoin={quoteSymbolName}
            priceOffset={priceOffset}
            onSelectLatestPrice={() => {
              onClickMarketPriceInput()
              form.setFieldsValue({ price: formatNumberDecimal(positionDealPrice, priceOffset) })
              onFormChange()
            }}
            cssLatestPrice="lates-price-item"
          />
        </div>
        <Form form={form} className={classNames(styles['asset-popup-form'], 'px-8')} onChange={onFormChange}>
          <div className="form-item">
            <div className="form-labels">
              <span>{t`features/trade/trade-order-confirm/index-1`}</span>
              <span>{t`order.columns.entrustType`}</span>
            </div>
            <div className="form-input form-input-between">
              <div
                className="w-full"
                onClick={() => {
                  onClickMarketPriceInput()
                }}
                ref={inputWrapperRef}
              >
                {entrustType === EntrustTypeEnum.limit && (
                  <FormItem
                    field="price"
                    rules={[
                      {
                        required: true,
                        validator: (value, cb) => {
                          if (!value) {
                            return cb(t`features/trade/trade-form/index-4`)
                          }
                          return cb()
                        },
                      },
                    ]}
                    requiredSymbol={false}
                  >
                    <AssetsInputNumber
                      precision={priceOffset}
                      placeholder={t({
                        id: 'features_assets_futures_common_stop_limit_modal_index_5101376',
                        values: { 0: quoteSymbolName },
                      })}
                      onChange={getProfitLossAmount}
                    />
                  </FormItem>
                )}
                {entrustType === EntrustTypeEnum.market && (
                  <FormItem field="markPrice">
                    <AssetsInputNumber
                      placeholder={t`features_assets_futures_common_close_position_modal_index_5101385`}
                      disabled
                    />
                  </FormItem>
                )}
              </div>
              <div className={'right-item'}>
                <FormItem>
                  <EntrustTypeSelect value={entrustType} onChange={onEntrustTypeChange} />
                </FormItem>
              </div>
            </div>
          </div>
          {/* 数量输入框 */}
          <div className="form-item">
            <div className="form-labels">
              <span>{t`Amount`}</span>
            </div>
            <div className="form-input coupon-form-input">
              <FormItem
                field="amount"
                rules={[
                  {
                    required: true,
                    validator: (value, cb) => {
                      if (!value) {
                        return cb(t`features_assets_futures_common_close_position_modal_index_5101571`)
                      }
                      return cb()
                    },
                  },
                ]}
                requiredSymbol={false}
              >
                <AssetsInputNumber
                  className="assets-input form-amount"
                  placeholder={t({
                    id: 'features_assets_futures_common_stop_limit_modal_index_5101377',
                    values: { 0: baseSymbolName },
                  })}
                  suffix={<div className="text-text_color_01">{baseSymbolName}</div>}
                  precision={amountOffset}
                  onChange={onInputChange}
                />
              </FormItem>
              <CouponSelect
                className="z-0 -top-3 !pt-4"
                fee={fee}
                amount={amount}
                loss={+profitLossAmount > 0 ? '' : profitLossAmount}
                isMatch={isMatch}
                symbol={quoteSymbolName}
                onChange={setCouponData}
              />
            </div>
          </div>
          {/* 仓位比例 */}
          <div className="mt-3 mb-4">
            <div className="form-item">
              <div className="form-slider">
                <SliderBar
                  value={positionPercent}
                  onChange={val => {
                    onSliderChange(val)
                  }}
                  marks={{
                    0: '0',
                    25: '25',
                    50: '50',
                    75: '75',
                    100: '100',
                  }}
                />
              </div>
            </div>
          </div>
          <PlanPrice
            profitLossAmount={profitLossAmount}
            quoteSymbolName={quoteSymbolName}
            baseSymbolName={baseSymbolName}
            size={getMaxCloseSize()}
            positionAmountText={t`features_assets_futures_common_close_position_modal_index_5101561`}
            planPriceText={t`constants_order_5101075`}
          />

          <div className="footer">
            <Button
              type="secondary"
              onClick={() => {
                setVisible(false)
              }}
            >
              {t`trade.c2c.cancel`}
            </Button>
            <Button type="primary" disabled={buttonDisable} onClick={onFormSubmit} loading={loading}>
              {t`user.field.reuse_10`}
            </Button>
          </div>
        </Form>
      </AssetsPopUp>
      {/* 当前仓位亏损过高，保证金不足 */}
      {visibleCheckOpenMarginPrompt && (
        <AssetsPopupTips
          visible={visibleCheckOpenMarginPrompt}
          setVisible={setVisibleCheckOpenMarginPrompt}
          slotContent={<div>{t`features_assets_futures_common_close_position_modal_index_5101574`}</div>}
          onOk={() => {
            setVisibleCheckOpenMarginPrompt(false)
          }}
          okText={t`features_trade_spot_index_2510`}
        />
      )}
    </div>
  )
}
