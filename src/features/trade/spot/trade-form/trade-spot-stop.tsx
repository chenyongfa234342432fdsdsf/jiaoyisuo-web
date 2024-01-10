import {
  TradeFuturesOptionEnum,
  TradeMarketAmountTypesEnum,
  TradeOrderTypesEnum,
  TradePriceTypesEnum,
  TradeStopSideTypeEnum,
  getTradeFuturesOptionMap,
} from '@/constants/trade'
import { getPriceField, validatorTradeNumber } from '@/helper/trade'
import { t } from '@lingui/macro'
import { Form, Slider } from '@nbit/arco'
import classNames from 'classnames'
import { useUserStore } from '@/store/user'
import TradePriceInput from '../../trade-price-input'
import TradeTrailingMarketTag from '../../trade-trailing-market-tag'
import TradeInputNumber from '../../trade-input-number'
import TradeAmountInput from '../../trade-amount-input'
import TradeStopSideSelect from '../../trade-stop-side-select'

const FormItem = Form.Item

function TradeSpotStop({
  tradeOrderType,
  msgRef,
  high,
  low,
  denominatedCoin,
  tradeMode,
  priceOffset,
  tradePriceType,
  onTradePriceSelectChange,
  isTradeTrailingMarketOrderType,
  setIsTradeTrailingMarketOrderType,
  isMarketPriceMode,
  inputAmountField,
  initPrice,
  userCoinTotalDenominatedCoin,
  maxAmount,
  underlyingCoin,
  minAmount,
  form,
  maxFunds,
  minFunds,
  amountOffset,
  onAmountSelectChange,
  percent,
  onSliderChange,
  formatTooltip,
  trailingPriceShow,
  totalPriceShow,
  setStopSideType,
  stopSideType,
  stopLossTradePriceType,
  takeProfitTradePriceType,
  onStopLossTradePriceSelectChange,
  onTakeProfitTradePriceSelectChange,
  isStopLossTradeTrailingMarketOrderType,
  setIsStopLossTradeTrailingMarketOrderType,
  isTakeProfitTradeTrailingMarketOrderType,
  setIsTakeProfitTradeTrailingMarketOrderType,
  setCoupons,
  fee,
  isModeBuy,
}) {
  const userStore = useUserStore()
  const tradeFuturesOptionMap = getTradeFuturesOptionMap()
  return (
    <>
      {/* 止盈止损的单向双向选择 */}
      <FormItem>
        <TradeStopSideSelect
          onChange={params => {
            setStopSideType(params)
          }}
          value={stopSideType}
        />
      </FormItem>
      {/* 单向 */}
      {stopSideType === TradeStopSideTypeEnum.single && (
        <>
          {/* 计划委托的触发价格 */}
          {trailingPriceShow && (
            <div className="trigger-price-show">
              <FormItem
                field="triggerPrice"
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
                <TradeInputNumber
                  precision={priceOffset}
                  hideControl={false}
                  // mode="button"
                  prefix={t`features_trade_spot_trade_form_index_2560`}
                  suffix={denominatedCoin}
                  // placeholder={t({
                  //   id: 'features_trade_spot_trade_form_index_2560',
                  //   values: { 0: denominatedCoin },
                  // })}
                />
              </FormItem>
            </div>
          )}
          {/* 普通价格输入 */}
          <div
            className={classNames('trigger-price-show', {
              'price-text': getPriceField(tradeOrderType, tradePriceType) === 'priceText',
            })}
          >
            <FormItem
              labelAlign="left"
              field={getPriceField(tradeOrderType, tradePriceType)}
              rules={[
                {
                  validator(value, cb) {
                    value = Number(value)
                    if (isTradeTrailingMarketOrderType) {
                      msgRef.current[getPriceField(tradeOrderType, tradePriceType)] = ''
                      return cb()
                    }
                    if (!validatorTradeNumber(value)) {
                      const msg = t`features/trade/trade-form/index-0`
                      msgRef.current[getPriceField(tradeOrderType, tradePriceType)] = msg
                      return cb()
                    }
                    if (value > high) {
                      const msg = t({
                        id: 'features_trade_spot_trade_form_index_2614',
                        values: { 0: high, 1: denominatedCoin },
                      })
                      msgRef.current[getPriceField(tradeOrderType, tradePriceType)] = msg
                      return cb()
                    }
                    if (value < low) {
                      const msg = t({
                        id: 'features_trade_spot_trade_form_index_2615',
                        values: { 0: low, 1: denominatedCoin },
                      })
                      msgRef.current[getPriceField(tradeOrderType, tradePriceType)] = msg
                      return cb()
                    }
                    msgRef.current[getPriceField(tradeOrderType, tradePriceType)] = ''
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
          {/* --------- */}
          {/* 数量输入框 */}
          <FormItem
            className={classNames({
              'trade-amount-market-wrap': isMarketPriceMode,
            })}
            field={inputAmountField}
            rules={[
              {
                validator(value, cb) {
                  value = Number(value)
                  if (inputAmountField === TradeMarketAmountTypesEnum.amount) {
                    if (!validatorTradeNumber(value)) {
                      const msg = t`features/trade/trade-form/index-2`
                      msgRef.current[inputAmountField] = msg
                      return cb()
                    }
                    if (value * initPrice > userCoinTotalDenominatedCoin) {
                      const msg = t`features/trade/trade-form/index-1`
                      msgRef.current[inputAmountField] = msg
                      return cb()
                    }
                    if (value > maxAmount) {
                      const msg = t({
                        id: 'features_trade_spot_trade_form_index_2612',
                        values: { 0: maxAmount, 1: underlyingCoin },
                      })
                      msgRef.current[inputAmountField] = msg
                      return cb()
                    }

                    if (value < minAmount) {
                      const msg = t({
                        id: 'features_trade_spot_trade_form_index_2613',
                        values: { 0: minAmount, 1: underlyingCoin },
                      })
                      msgRef.current[inputAmountField] = msg
                      return cb()
                    }
                    msgRef.current[inputAmountField] = ''
                    return cb()
                  }
                  if (!validatorTradeNumber(value)) {
                    const msg = t`features_trade_spot_trade_form_index_2603`
                    msgRef.current[inputAmountField] = msg
                    return cb()
                  }
                  if (tradeOrderType === TradeOrderTypesEnum.limit) {
                    const totalPrice = Number(form.getFieldsValue().totalPrice)
                    if (totalPrice > userCoinTotalDenominatedCoin) {
                      const msg = t`features/trade/trade-form/index-1`
                      msgRef.current[inputAmountField] = msg
                      return cb()
                    }
                    msgRef.current[inputAmountField] = ''
                    return cb()
                  }
                  if (value > userCoinTotalDenominatedCoin) {
                    const msg = t`features/trade/trade-form/index-1`
                    msgRef.current[inputAmountField] = msg
                    return cb()
                  }

                  if (value > maxFunds) {
                    const msg = t({
                      id: 'features_trade_spot_trade_form_index_2616',
                      values: { 0: maxFunds },
                    })
                    msgRef.current[inputAmountField] = msg
                    return cb()
                  }
                  if (value < minFunds) {
                    const msg = t({
                      id: 'features_trade_spot_trade_form_index_2617',
                      values: { 0: minFunds },
                    })
                    msgRef.current[inputAmountField] = msg
                    return cb()
                  }
                  msgRef.current[inputAmountField] = ''
                  return cb()
                },
              },
            ]}
          >
            <TradeAmountInput
              priceOffset={priceOffset}
              amountOffset={amountOffset}
              isTradeTrailingMarketOrderType={isTradeTrailingMarketOrderType}
              handleSelectChange={onAmountSelectChange}
              tradeOrderType={tradeOrderType}
              underlyingCoin={underlyingCoin}
              denominatedCoin={denominatedCoin}
              tradeMode={tradeMode}
              amountType={inputAmountField}
              initPrice={initPrice}
              setCoupons={setCoupons}
              fee={fee}
              isModeBuy={isModeBuy}
            />
          </FormItem>
          <Slider
            className="slider-wrap"
            disabled={!userStore.isLogin}
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
          {/* 成交额 */}
          {totalPriceShow && (
            <FormItem
              field="totalPrice"
              rules={[
                {
                  validator(value, cb) {
                    value = Number(value)
                    if (!validatorTradeNumber(value)) {
                      const msg = t`features/trade/trade-form/index-3`
                      msgRef.current.totalPrice = msg
                      return cb()
                    }
                    if (value > maxFunds) {
                      const msg = t({
                        id: 'features_trade_spot_trade_form_index_2616',
                        values: { 0: maxFunds },
                      })
                      msgRef.current.totalPrice = msg
                      return cb()
                    }

                    if (value < minFunds) {
                      const msg = t({
                        id: 'features_trade_spot_trade_form_index_2617',
                        values: { 0: minFunds },
                      })
                      msgRef.current.totalPrice = msg
                      return cb()
                    }
                    msgRef.current.totalPrice = ''
                    return cb()
                  },
                },
              ]}
            >
              <TradeInputNumber precision={priceOffset} suffix={denominatedCoin} prefix={t`constants/trade-4`} />
            </FormItem>
          )}
          {/* --------- */}
        </>
      )}
      {/* 双向 */}
      {/* 双向 */}
      {/* 双向 */}
      {stopSideType === TradeStopSideTypeEnum.double && (
        <>
          {/* 止盈触发价格 */}
          {trailingPriceShow && (
            <div className="trigger-price-show">
              <FormItem
                field="takeProfitTriggerPrice"
                rules={[
                  {
                    validator(value, cb) {
                      value = Number(value)
                      if (!validatorTradeNumber(value)) {
                        const msg = t`features_trade_spot_trade_form_index_2558`
                        msgRef.current.takeProfitTriggerPrice = msg
                        return cb()
                      }
                      msgRef.current.takeProfitTriggerPrice = ''
                      return cb()
                    },
                  },
                ]}
              >
                <TradeInputNumber
                  precision={priceOffset}
                  hideControl={false}
                  // mode="button"
                  prefix={
                    tradeFuturesOptionMap[TradeFuturesOptionEnum.takeProfit] +
                    t`features_trade_spot_trade_form_index_2560`
                  }
                  suffix={denominatedCoin}
                  // placeholder={t({
                  //   id: 'features_trade_spot_trade_form_index_2560',
                  //   values: { 0: denominatedCoin },
                  // })}
                />
              </FormItem>
            </div>
          )}
          {/* 止盈普通价格输入 */}
          <div
            className={classNames('trigger-price-show', {
              'price-text':
                getPriceField(tradeOrderType, tradePriceType, TradeFuturesOptionEnum.takeProfit) === 'priceText',
            })}
          >
            <FormItem
              labelAlign="left"
              field={getPriceField(tradeOrderType, tradePriceType, TradeFuturesOptionEnum.takeProfit)}
              rules={[
                {
                  validator(value, cb) {
                    value = Number(value)
                    if (isTakeProfitTradeTrailingMarketOrderType) {
                      msgRef.current[getPriceField(tradeOrderType, tradePriceType, TradeFuturesOptionEnum.takeProfit)] =
                        ''
                      return cb()
                    }
                    if (!validatorTradeNumber(value)) {
                      const msg = t`features/trade/trade-form/index-0`
                      msgRef.current[getPriceField(tradeOrderType, tradePriceType, TradeFuturesOptionEnum.takeProfit)] =
                        msg
                      return cb()
                    }
                    if (value > high) {
                      const msg = t({
                        id: 'features_trade_spot_trade_form_index_2614',
                        values: { 0: high, 1: denominatedCoin },
                      })
                      msgRef.current[getPriceField(tradeOrderType, tradePriceType, TradeFuturesOptionEnum.takeProfit)] =
                        msg
                      return cb()
                    }
                    if (value < low) {
                      const msg = t({
                        id: 'features_trade_spot_trade_form_index_2615',
                        values: { 0: low, 1: denominatedCoin },
                      })
                      msgRef.current[getPriceField(tradeOrderType, tradePriceType, TradeFuturesOptionEnum.takeProfit)] =
                        msg
                      return cb()
                    }
                    msgRef.current[getPriceField(tradeOrderType, tradePriceType, TradeFuturesOptionEnum.takeProfit)] =
                      ''
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
                tradePriceType={takeProfitTradePriceType}
                isTradeTrailingMarketOrderType={isTakeProfitTradeTrailingMarketOrderType}
                handleSelectChange={onTakeProfitTradePriceSelectChange}
                suffixExt={
                  <TradeTrailingMarketTag
                    checked={isTakeProfitTradeTrailingMarketOrderType}
                    onChange={() => {
                      setIsTakeProfitTradeTrailingMarketOrderType(!isTakeProfitTradeTrailingMarketOrderType)
                    }}
                  />
                }
              />
            </FormItem>
          </div>
          {/* 止损触发价格 */}
          {trailingPriceShow && (
            <div className="trigger-price-show">
              <FormItem
                field="stopLossTriggerPrice"
                rules={[
                  {
                    validator(value, cb) {
                      value = Number(value)
                      if (!validatorTradeNumber(value)) {
                        const msg = t`features_trade_spot_trade_form_index_2558`
                        msgRef.current.stopLossTriggerPrice = msg
                        return cb()
                      }
                      msgRef.current.stopLossTriggerPrice = ''
                      return cb()
                    },
                  },
                ]}
              >
                <TradeInputNumber
                  precision={priceOffset}
                  hideControl={false}
                  // mode="button"
                  prefix={
                    tradeFuturesOptionMap[TradeFuturesOptionEnum.stopLoss] +
                    t`features_trade_spot_trade_form_index_2560`
                  }
                  suffix={denominatedCoin}
                  // placeholder={t({
                  //   id: 'features_trade_spot_trade_form_index_2560',
                  //   values: { 0: denominatedCoin },
                  // })}
                />
              </FormItem>
            </div>
          )}
          {/* 止损普通价格输入 */}
          <div
            className={classNames('trigger-price-show', {
              'price-text':
                getPriceField(tradeOrderType, tradePriceType, TradeFuturesOptionEnum.stopLoss) === 'priceText',
            })}
          >
            <FormItem
              labelAlign="left"
              field={getPriceField(tradeOrderType, tradePriceType, TradeFuturesOptionEnum.stopLoss)}
              rules={[
                {
                  validator(value, cb) {
                    value = Number(value)
                    if (isStopLossTradeTrailingMarketOrderType) {
                      msgRef.current[getPriceField(tradeOrderType, tradePriceType, TradeFuturesOptionEnum.stopLoss)] =
                        ''
                      return cb()
                    }
                    if (!validatorTradeNumber(value)) {
                      const msg = t`features/trade/trade-form/index-0`
                      msgRef.current[getPriceField(tradeOrderType, tradePriceType, TradeFuturesOptionEnum.stopLoss)] =
                        msg
                      return cb()
                    }
                    if (value > high) {
                      const msg = t({
                        id: 'features_trade_spot_trade_form_index_2614',
                        values: { 0: high, 1: denominatedCoin },
                      })
                      msgRef.current[getPriceField(tradeOrderType, tradePriceType, TradeFuturesOptionEnum.stopLoss)] =
                        msg
                      return cb()
                    }
                    if (value < low) {
                      const msg = t({
                        id: 'features_trade_spot_trade_form_index_2615',
                        values: { 0: low, 1: denominatedCoin },
                      })
                      msgRef.current[getPriceField(tradeOrderType, tradePriceType, TradeFuturesOptionEnum.stopLoss)] =
                        msg
                      return cb()
                    }
                    msgRef.current[getPriceField(tradeOrderType, tradePriceType, TradeFuturesOptionEnum.stopLoss)] = ''
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
                tradePriceType={stopLossTradePriceType}
                isTradeTrailingMarketOrderType={isStopLossTradeTrailingMarketOrderType}
                handleSelectChange={onStopLossTradePriceSelectChange}
                suffixExt={
                  <TradeTrailingMarketTag
                    checked={isStopLossTradeTrailingMarketOrderType}
                    onChange={() => {
                      setIsStopLossTradeTrailingMarketOrderType(!isStopLossTradeTrailingMarketOrderType)
                    }}
                  />
                }
              />
            </FormItem>
          </div>
          {/* 数量输入框 */}
          <FormItem
            className={classNames({
              'trade-amount-market-wrap': isMarketPriceMode,
            })}
            field={inputAmountField}
            rules={[
              {
                validator(value, cb) {
                  value = Number(value)
                  if (inputAmountField === TradeMarketAmountTypesEnum.amount) {
                    if (!validatorTradeNumber(value)) {
                      const msg = t`features/trade/trade-form/index-2`
                      msgRef.current[inputAmountField] = msg
                      return cb()
                    }
                    if (value * initPrice > userCoinTotalDenominatedCoin) {
                      const msg = t`features/trade/trade-form/index-1`
                      msgRef.current[inputAmountField] = msg
                      return cb()
                    }
                    if (value > maxAmount) {
                      const msg = t({
                        id: 'features_trade_spot_trade_form_index_2612',
                        values: { 0: maxAmount, 1: underlyingCoin },
                      })
                      msgRef.current[inputAmountField] = msg
                      return cb()
                    }

                    if (value < minAmount) {
                      const msg = t({
                        id: 'features_trade_spot_trade_form_index_2613',
                        values: { 0: minAmount, 1: underlyingCoin },
                      })
                      msgRef.current[inputAmountField] = msg
                      return cb()
                    }
                    msgRef.current[inputAmountField] = ''
                    return cb()
                  }
                  if (!validatorTradeNumber(value)) {
                    const msg = t`features_trade_spot_trade_form_index_2603`
                    msgRef.current[inputAmountField] = msg
                    return cb()
                  }
                  if (tradeOrderType === TradeOrderTypesEnum.limit) {
                    const totalPrice = Number(form.getFieldsValue().totalPrice)
                    if (totalPrice > userCoinTotalDenominatedCoin) {
                      const msg = t`features/trade/trade-form/index-1`
                      msgRef.current[inputAmountField] = msg
                      return cb()
                    }
                    msgRef.current[inputAmountField] = ''
                    return cb()
                  }
                  if (value > userCoinTotalDenominatedCoin) {
                    const msg = t`features/trade/trade-form/index-1`
                    msgRef.current[inputAmountField] = msg
                    return cb()
                  }

                  if (value > maxFunds) {
                    const msg = t({
                      id: 'features_trade_spot_trade_form_index_2616',
                      values: { 0: maxFunds },
                    })
                    msgRef.current[inputAmountField] = msg
                    return cb()
                  }
                  if (value < minFunds) {
                    const msg = t({
                      id: 'features_trade_spot_trade_form_index_2617',
                      values: { 0: minFunds },
                    })
                    msgRef.current[inputAmountField] = msg
                    return cb()
                  }
                  msgRef.current[inputAmountField] = ''
                  return cb()
                },
              },
            ]}
          >
            <TradeAmountInput
              priceOffset={priceOffset}
              amountOffset={amountOffset}
              isTradeTrailingMarketOrderType={
                isStopLossTradeTrailingMarketOrderType && isTakeProfitTradeTrailingMarketOrderType
              }
              handleSelectChange={onAmountSelectChange}
              tradeOrderType={tradeOrderType}
              underlyingCoin={underlyingCoin}
              denominatedCoin={denominatedCoin}
              tradeMode={tradeMode}
              amountType={inputAmountField}
              initPrice={initPrice}
              setCoupons={setCoupons}
              fee={fee}
              isModeBuy={isModeBuy}
            />
          </FormItem>
          <Slider
            className="slider-wrap"
            disabled={!userStore.isLogin}
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
          {/* 成交额 */}
          {totalPriceShow && (
            <FormItem
              field="totalPrice"
              rules={[
                {
                  validator(value, cb) {
                    value = Number(value)
                    if (!validatorTradeNumber(value)) {
                      const msg = t`features/trade/trade-form/index-3`
                      msgRef.current.totalPrice = msg
                      return cb()
                    }
                    if (value > maxFunds) {
                      const msg = t({
                        id: 'features_trade_spot_trade_form_index_2616',
                        values: { 0: maxFunds },
                      })
                      msgRef.current.totalPrice = msg
                      return cb()
                    }

                    if (value < minFunds) {
                      const msg = t({
                        id: 'features_trade_spot_trade_form_index_2617',
                        values: { 0: minFunds },
                      })
                      msgRef.current.totalPrice = msg
                      return cb()
                    }
                    msgRef.current.totalPrice = ''
                    return cb()
                  },
                },
              ]}
            >
              <TradeInputNumber precision={priceOffset} suffix={denominatedCoin} prefix={t`constants/trade-4`} />
            </FormItem>
          )}
        </>
      )}
    </>
  )
}

export default TradeSpotStop
