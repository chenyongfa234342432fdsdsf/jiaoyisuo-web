import { t } from '@lingui/macro'
import { InputNumberProps, Select, Tooltip } from '@nbit/arco'
import {
  TradeOrderTypesEnum,
  getTradeMarketAmountTypesMap,
  TradeMarketAmountTypesEnum,
  TradeModeEnum,
  TradeFuturesOrderAssetsTypesEnum,
} from '@/constants/trade'
import { useFuturesStore } from '@/store/futures'
import { getTradeAmountByMarket, getTradeTotalByMarket } from '@/helper/trade'
import { memo, useRef, useState } from 'react'
import { FuturesGuideIdEnum } from '@/constants/future/trade'
import { formatCurrency, formatNumberDecimal } from '@/helper/decimal'
import CouponSelect from '@/features/welfare-center/common/coupon-select'
import { BusinessSceneEnum } from '@/constants/welfare-center/coupon-select'
import { onGetExpectedProfit } from '@/helper/assets/futures'
import { findFuturesPositionItem } from '@/helper/futures'
import { baseContractMarketStore } from '@/store/market/contract'
import { useIsMatchCoupon } from '@/hooks/features/welfare-center/coupon-select'
import { calculatorOrderAmount } from '@/helper/welfare-center/coupon-select'
import Styles from './index.module.css'
import TradeInputNumber from '../trade-input-number'

interface ITradeAmountInputProps extends InputNumberProps {
  tradeMode: TradeModeEnum
  tradeOrderType: TradeOrderTypesEnum
  isTradeTrailingMarketOrderType?: boolean
  amountType: string
  underlyingCoin: string
  denominatedCoin: string
  currentLeverage?: string | number
  orderAssetsTypes?: TradeFuturesOrderAssetsTypesEnum
  handleSelectChange?: (params: any) => void
  priceOffset?: number
  amountOffset?: number
  // 只减仓
  futuresDelOptionChecked?: boolean
  positionItemSize?: number
  // 仓位保证金
  initMargin?: number | string
  // 开仓数量
  initAmount?: number | string
  // 金额输入框
  inputPrice?: number | string
  initPrice?: number | string
  fee?: any
  setCoupons?: any
  setVoucherAmount?: any
  isModeBuy?: boolean
  /** 名义价值 */
  nominalPositionValue?: number | string
}

function TradeAmountMarketInput(props: ITradeAmountInputProps) {
  const {
    tradeMode,
    tradeOrderType,
    amountType,
    denominatedCoin,
    underlyingCoin,
    isTradeTrailingMarketOrderType,
    handleSelectChange,
    amountOffset,
    priceOffset,
    currentLeverage,
    orderAssetsTypes,
    min,
    futuresDelOptionChecked,
    positionItemSize,
    initMargin,
    initAmount,
    inputPrice,
    initPrice,
    nominalPositionValue,
    setCoupons,
    setVoucherAmount,
    isModeBuy,
    ...rest
  } = props
  let placeholder
  let tips
  const currentSelectRef = useRef<HTMLDivElement | null>(null)
  const { futureEnabled } = useFuturesStore()
  function _onSelectChange(params) {
    if (amountType !== params && handleSelectChange) {
      handleSelectChange(params)
    }
  }
  if (tradeMode === TradeModeEnum.spot) {
    let precision = 2
    const tradeMarketAmountTypesMap = getTradeMarketAmountTypesMap(denominatedCoin, underlyingCoin)

    if (amountType === TradeMarketAmountTypesEnum.funds) {
      precision = priceOffset ?? 2
      placeholder = t({
        id: 'features_trade_trade_amount_input_index_2437',
        values: { 0: min },
      })
      if (rest.value) {
        tips = t({
          id: 'features_trade_trade_amount_input_index_2605',
          values: {
            0: initPrice ? getTradeAmountByMarket(initPrice, rest.value, amountOffset ?? 2) : 0,
            1: underlyingCoin,
          },
        })
      }
    } else {
      precision = amountOffset ?? 2
      placeholder = t({
        id: 'features_trade_trade_amount_input_index_2438',
        values: { 0: min },
      })
      if (rest.value) {
        tips = t({
          id: 'features_trade_trade_amount_input_index_2601',
          values: {
            0: initPrice ? getTradeTotalByMarket(initPrice, rest.value, priceOffset ?? 2) : 0,
            1: denominatedCoin,
          },
        })
      }
    }
    const isTipsShow = rest.value && !Number.isNaN(rest.value)

    return (
      <div className={Styles.scoped}>
        <Tooltip className="trade-tips-wrap" position="tl" mini content={tips} popupVisible={!!isTipsShow}>
          <TradeInputNumber
            {...rest}
            precision={precision}
            min={min}
            prefix={amountType === TradeMarketAmountTypesEnum.funds ? t`constants/trade-4` : t`Amount`}
            // placeholder={placeholder}
            suffix={
              <div className="flex items-center" ref={currentSelectRef}>
                {tradeMarketAmountTypesMap[amountType]}
                <Select
                  getPopupContainer={() => currentSelectRef.current as Element}
                  onChange={_onSelectChange}
                  trigger="hover"
                  bordered={false}
                  style={{ width: 24 }}
                  triggerProps={{
                    autoAlignPopupWidth: false,
                    autoAlignPopupMinWidth: true,
                  }}
                >
                  {Object.keys(tradeMarketAmountTypesMap).map(key => (
                    <Select.Option key={key} value={key}>
                      {tradeMarketAmountTypesMap[key]}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            }
          />
        </Tooltip>
      </div>
    )
  }
  // 合约
  const tradeMarketAmountTypesMap = getTradeMarketAmountTypesMap(denominatedCoin, underlyingCoin)
  let precision = 2
  let isTipsShow
  if (futuresDelOptionChecked) {
    isTipsShow = true
    // 可减仓模式
    if (amountType === TradeMarketAmountTypesEnum.funds) {
      precision = priceOffset ?? 2
      placeholder = t({
        id: 'features_trade_trade_amount_input_index_2437',
        values: { 0: min },
      })
      tips = t({
        id: 'features_trade_trade_amount_input_index_2604',
        values: {
          0: initPrice
            ? formatCurrency(formatNumberDecimal(Number(positionItemSize) * Number(initPrice), precision))
            : 0,
          1: denominatedCoin,
        },
      })
    } else {
      precision = amountOffset ?? 2
      placeholder = t({
        id: 'features_trade_trade_amount_input_index_2438',
        values: { 0: min },
      })
      tips = t({
        id: 'features_trade_trade_amount_input_index_2604',
        values: {
          0: formatCurrency(formatNumberDecimal(positionItemSize, precision)),
          1: underlyingCoin,
        },
      })
    }
  } else {
    // 非可检仓模式
    if (amountType === TradeMarketAmountTypesEnum.funds) {
      precision = priceOffset ?? 2
      placeholder = t({
        id: 'features_trade_trade_amount_input_index_2437',
        values: { 0: min },
      })
      if (rest.value) {
        isTipsShow = rest.value && !Number.isNaN(rest.value)
        tips = t({
          id: 'features_trade_trade_amount_input_index_2603',
          values: {
            0: formatCurrency(formatNumberDecimal(initAmount, amountOffset)),
            1: underlyingCoin,
          },
        })
      }
    } else {
      precision = amountOffset ?? 2
      placeholder = t({
        id: 'features_trade_trade_amount_input_index_2438',
        values: { 0: min },
      })
      if (rest.value) {
        isTipsShow = rest.value && !Number.isNaN(rest.value)
        tips = t({
          id: 'features_trade_trade_amount_input_index_2602',
          values: {
            0: formatCurrency(formatNumberDecimal(initMargin, priceOffset)),
            1: denominatedCoin,
          },
        })
      }
    }
  }

  return (
    <div className={Styles.scoped} id={FuturesGuideIdEnum.openingQuantity}>
      <Tooltip className="trade-tips-wrap" position="tl" mini content={tips} popupVisible={!!isTipsShow}>
        <TradeInputNumber
          {...rest}
          precision={precision}
          min={min}
          prefix={
            futureEnabled
              ? t`Amount`
              : amountType === TradeMarketAmountTypesEnum.funds
              ? t`features_trade_trade_amount_input_index_5101476`
              : t`Amount`
          }
          placeholder={
            futureEnabled
              ? t`features_trade_trade_futures_calculator_trade_futures_calculator_modal_index_5hxz2a8ghwn8chagdlgtf`
              : futuresDelOptionChecked
              ? amountType === TradeMarketAmountTypesEnum.funds
                ? t`features_trade_trade_order_confirm_index_zacbtzhrmhlaly2ochhc2`
                : t`features_trade_trade_amount_input_index_jg8mwmipfphoevjnieu8t`
              : amountType === TradeMarketAmountTypesEnum.funds
              ? t`features_trade_trade_amount_input_index_d9hiiaadxfjrwqkxvqmv4`
              : t`features_trade_trade_futures_calculator_trade_futures_calculator_modal_index_5hxz2a8ghwn8chagdlgtf`
          }
          // placeholder={placeholder}
          suffix={
            <div className="flex items-center" ref={currentSelectRef}>
              {tradeMarketAmountTypesMap[futureEnabled ? TradeMarketAmountTypesEnum.amount : amountType]}
              <Select
                getPopupContainer={() => currentSelectRef.current as Element}
                onChange={_onSelectChange}
                trigger="hover"
                bordered={false}
                value={amountType}
                style={{ width: 24 }}
                triggerProps={{
                  autoAlignPopupWidth: false,
                  autoAlignPopupMinWidth: true,
                }}
              >
                {Object.keys(tradeMarketAmountTypesMap).map(key => (
                  <Select.Option key={key} value={key}>
                    {tradeMarketAmountTypesMap[key]}
                  </Select.Option>
                ))}
              </Select>
            </div>
          }
        />
      </Tooltip>
    </div>
  )
}

/**
 * -------------------------------------------------------------------------------------------
 */

function TradeAmountInput(props: ITradeAmountInputProps) {
  const {
    tradeMode,
    isModeBuy,
    tradeOrderType,
    amountType,
    denominatedCoin,
    underlyingCoin,
    priceOffset,
    amountOffset,
    isTradeTrailingMarketOrderType,
    min,
    setCoupons,
    setVoucherAmount,
    futuresDelOptionChecked,
    handleSelectChange,
    initPrice,
    initAmount,
    initMargin,
    nominalPositionValue,
    fee,
    ...rest
  } = props

  // 是否手动匹配
  const [isManual, setIsManual] = useState(false)
  // 是否需要自动匹配最优券
  const isMatch = useIsMatchCoupon(rest?.value, initPrice, isManual, tradeOrderType === TradeOrderTypesEnum.market)

  if (tradeMode === TradeModeEnum.spot) {
    /** 现货、杠杆交易的价格输入框 */
    /** 现货交易、限价交易、计划委托下，价格输入框会更具币种和档位变化 text 和 number */
    if (tradeOrderType === TradeOrderTypesEnum.limit) {
      return (
        <div className={Styles.scoped}>
          <TradeInputNumber
            min={min}
            {...rest}
            precision={amountOffset ?? 6}
            // placeholder={t({
            //   id: 'features_trade_trade_amount_input_index_2436',
            //   values: { 0: min },
            // })}
            suffix={underlyingCoin}
            prefix={t`Amount`}
          />
          <CouponSelect
            fee={fee}
            businessScene={BusinessSceneEnum.spot}
            amount={calculatorOrderAmount({
              amountType: amountType as TradeMarketAmountTypesEnum,
              orderAmount: rest?.value,
              orderPrice: initPrice,
            })}
            symbol={denominatedCoin}
            onChange={c => {
              setCoupons(c?.coupons)
            }}
          />
        </div>
      )
    }
    if (tradeOrderType === TradeOrderTypesEnum.market) {
      return (
        <>
          <TradeAmountMarketInput {...props} />
          <CouponSelect
            fee={fee}
            businessScene={BusinessSceneEnum.spot}
            amount={calculatorOrderAmount({
              amountType: amountType as TradeMarketAmountTypesEnum,
              orderAmount: rest?.value,
              orderPrice: initPrice,
            })}
            symbol={denominatedCoin}
            isMatch={isMatch}
            onChange={c => {
              setCoupons(c?.coupons)
              setIsManual(c?.isManual || false)
            }}
          />
        </>
      )
    }
    /** 计划委托 */
    if (tradeOrderType === TradeOrderTypesEnum.trailing || tradeOrderType === TradeOrderTypesEnum.stop) {
      if (isTradeTrailingMarketOrderType) {
        return (
          <>
            <TradeAmountMarketInput {...props} />
            <CouponSelect
              fee={fee}
              businessScene={BusinessSceneEnum.spot}
              amount={calculatorOrderAmount({
                amountType: amountType as TradeMarketAmountTypesEnum,
                orderAmount: rest?.value,
                orderPrice: initPrice,
              })}
              symbol={denominatedCoin}
              onChange={c => {
                setCoupons(c?.coupons)
              }}
            />
          </>
        )
      }
      return (
        <div className={Styles.scoped}>
          <TradeInputNumber
            {...rest}
            min={min}
            // placeholder={t({
            //   id: 'features_trade_trade_amount_input_index_2436',
            //   values: { 0: min },
            // })}
            suffix={underlyingCoin}
            precision={amountOffset ?? 6}
            prefix={t`Amount`}
          />
          <CouponSelect
            fee={fee}
            businessScene={BusinessSceneEnum.spot}
            amount={calculatorOrderAmount({
              amountType: amountType as TradeMarketAmountTypesEnum,
              orderAmount: rest?.value,
              orderPrice: initPrice,
            })}
            symbol={denominatedCoin}
            onChange={c => {
              setCoupons(c?.coupons)
            }}
          />
        </div>
      )
    }
  }
  let loss = 0
  if (futuresDelOptionChecked) {
    const getProfitLossAmount = () => {
      /** 委托价格 */
      const entrustPrice = Number(initPrice)
      const entrustAmount = Number(initAmount)
      if (!entrustAmount || (!isTradeTrailingMarketOrderType && !entrustPrice)) {
        return 0
      }

      // 计算价格
      let calculatePrice = entrustPrice
      const positionItem = findFuturesPositionItem(isModeBuy)
      const takerFeeRate = baseContractMarketStore.getState().currentCoin?.takerFeeRate
      const profitLossVal = Number(
        onGetExpectedProfit({
          price: String(calculatePrice),
          closeSize: String(entrustAmount),
          openPrice: positionItem?.openPrice,
          takerFeeRate: String(takerFeeRate),
          sideInd: positionItem?.sideInd,
        })
      )

      return profitLossVal
    }
    loss = getProfitLossAmount()
  }
  if (tradeMode === TradeModeEnum.futures) {
    /** 合约交易的价格输入框 */
    /** 现货交易、限价交易、计划委托下，价格输入框会更具币种和档位变化 text 和 number */
    if (tradeOrderType === TradeOrderTypesEnum.limit || tradeOrderType === TradeOrderTypesEnum.market) {
      return (
        <div>
          <TradeAmountMarketInput {...props} />
          <CouponSelect
            fee={fee}
            businessScene={BusinessSceneEnum.perpetual}
            amount={nominalPositionValue}
            loss={loss}
            margin={futuresDelOptionChecked ? '' : initMargin}
            symbol={denominatedCoin as any}
            isMatch={isMatch}
            onChange={c => {
              setCoupons(c?.coupons)
              !futuresDelOptionChecked && setVoucherAmount(c?.voucherAmount)
              setIsManual(c?.isManual || false)
            }}
          />
        </div>
      )
    }
    /** 计划委托 */
    if (tradeOrderType === TradeOrderTypesEnum.trailing) {
      return (
        <div>
          <TradeAmountMarketInput {...props} />
          <CouponSelect
            fee={fee}
            businessScene={BusinessSceneEnum.perpetual}
            amount={nominalPositionValue}
            loss={loss}
            margin={futuresDelOptionChecked ? '' : initMargin}
            symbol={denominatedCoin as any}
            onChange={c => {
              setCoupons(c?.coupons)
              !futuresDelOptionChecked && setVoucherAmount(c?.voucherAmount)
            }}
          />
        </div>
      )
    }
  }

  return null
}

export default memo(TradeAmountInput)
