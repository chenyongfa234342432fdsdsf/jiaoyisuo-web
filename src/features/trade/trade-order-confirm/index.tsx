import SideTag from '@/components/side-tag'
import {
  TradeOrderTypesEnum,
  TradeModeEnum,
  TradeMarketAmountTypesEnum,
  TradeFuturesOptionUnitEnum,
  TradeFuturesOrderAssetsTypesEnum,
  getTradeOrderTypesMap,
  TradeStopSideTypeEnum,
} from '@/constants/trade'
import { baseFuturesStore, useFuturesStore } from '@/store/futures'
import { baseOrderBookStore } from '@/store/order-book'
import { useTradeStore } from '@/store/trade'
import { t } from '@lingui/macro'
import { Checkbox, Tooltip } from '@nbit/arco'
import Icon from '@/components/icon'
import FuturesGroupTag from '../futures-group-tag'
import Styles from './index.module.css'
import BuySellTag from '../buy-sell-tag'

interface ITradeOrderConfirm {
  tradeOrderType: TradeOrderTypesEnum
  tradeMode: TradeModeEnum
  amountType: TradeMarketAmountTypesEnum
  coin: any
  isModeBuy: boolean
  formParams: Record<string, any>
  // 只减仓类型
  futuresDelOptionChecked?: boolean
  /** 最外层 */
  futuresOptionUnit?: TradeFuturesOptionUnitEnum
  /** 止盈止损 */
  futuresStopLossUnit?: TradeFuturesOptionUnitEnum
  futuresTakeProfitUnit?: TradeFuturesOptionUnitEnum
  nominalPositionValue?: number | string
  stopSideType?: TradeStopSideTypeEnum
  isTradeTrailingMarketOrderType?: boolean
  isStopLossTradeTrailingMarketOrderType?: boolean
  isTakeProfitTradeTrailingMarketOrderType?: boolean
}
function TradeFuturesList({
  underlyingCoin,
  isModeBuy,
  amountType,
  formParams,
  denominatedCoin,
  futuresDelOptionChecked,
  nominalPositionValue,
}) {
  const { currentGroupOrderAssetsTypes } = useFuturesStore()
  const isShowAdditionalMargin =
    !futuresDelOptionChecked && currentGroupOrderAssetsTypes === TradeFuturesOrderAssetsTypesEnum.assets
  return (
    <>
      {amountType === TradeMarketAmountTypesEnum.amount && (
        <div className="wrap">
          <div className="label">
            {isModeBuy ? t`features/trade/trade-order-confirm/index-2` : t`features/trade/trade-order-confirm/index-3`}
          </div>
          <div className="value">
            {formParams.amount} {underlyingCoin}
          </div>
        </div>
      )}
      {amountType === TradeMarketAmountTypesEnum.funds && (
        <div className="wrap">
          <div className="label">{t`features/trade/trade-order-confirm/index-2`}</div>
          <div className="value">
            {/* {formParams.funds} {denominatedCoin} */}
            {nominalPositionValue} {denominatedCoin}
          </div>
        </div>
      )}
      {isShowAdditionalMargin && (
        <div className="wrap">
          <div className="label">{t`features_trade_trade_order_confirm_index_5101515`}</div>
          <div className="value">
            {formParams?.additionalMarginPrice || 0} {denominatedCoin}
          </div>
        </div>
      )}
      {(formParams.takeProfit || formParams.stopLoss) && (
        <div className="wrap">
          <div className="label">{t`features/orders/details/future-11`}</div>
          <div className="value">
            {formParams.takeProfit || '--'}/{formParams.stopLoss || '--'} {denominatedCoin}
          </div>
        </div>
      )}
      <div className="wrap">
        <div className="label">{t`features_trade_trade_order_confirm_index_5101516`}</div>
        <div className="value">
          {futuresDelOptionChecked
            ? t`features_trade_trade_order_confirm_index_5101517`
            : t`features_trade_trade_order_confirm_index_whd7gfy7mywmqzgvahv-q`}
        </div>
      </div>
    </>
  )
}

function TradeDetailTitle({
  tradeMode,
  tradeOrderType,
  underlyingCoin,
  denominatedCoin,
  isModeBuy,
}: {
  tradeOrderType: TradeOrderTypesEnum
  tradeMode: TradeModeEnum
  underlyingCoin: any
  denominatedCoin: any
  isModeBuy: boolean
}) {
  if (tradeMode === TradeModeEnum.spot) {
    const tradeOrderTypesMap = getTradeOrderTypesMap()
    return (
      <div className="title-wrap">
        <div className="wrap symbol-wrap">
          <div className="label symbol">
            <BuySellTag isModeBuy={isModeBuy}>
              {isModeBuy
                ? t`features/user/personal-center/settings/payment/index-2`
                : t`features/user/personal-center/settings/payment/index-3`}
            </BuySellTag>
            <span className="ml-1">
              {underlyingCoin}/{denominatedCoin}
            </span>
          </div>
        </div>
        <div className="wrap">
          <div className="label">{t`features_trade_trade_order_confirm_index_5101516`}</div>
          <div className="value">{tradeOrderTypesMap[tradeOrderType]}</div>
        </div>
      </div>
    )
  }
  const { selectedContractGroup, currentLeverage } = baseFuturesStore.getState()
  return (
    <div className="wrap symbol-wrap">
      <div className="label symbol">
        {underlyingCoin}
        {denominatedCoin} {t`assets.enum.tradeCoinType.perpetual`}
        <SideTag className="mx-2" isSideUp={isModeBuy}>
          {isModeBuy ? t`constants/order-17` : t`constants/order-18`} {currentLeverage}X
        </SideTag>
        {selectedContractGroup?.groupName && (
          <FuturesGroupTag isModeBuy={isModeBuy}>{selectedContractGroup.groupName}</FuturesGroupTag>
        )}
      </div>
    </div>
  )
}
function TradeMarketDetail({
  isModeBuy,
  tradeOrderType,
  tradeMode,
  formParams,
  coin,
  amountType,
  futuresDelOptionChecked,
  nominalPositionValue,
}: ITradeOrderConfirm) {
  const denominatedCoin = coin.buySymbol
  const underlyingCoin = coin.sellSymbol
  return (
    <div>
      <TradeDetailTitle
        tradeMode={tradeMode}
        tradeOrderType={tradeOrderType}
        denominatedCoin={denominatedCoin}
        underlyingCoin={underlyingCoin}
        isModeBuy={isModeBuy}
      />
      {tradeMode === TradeModeEnum.spot && (
        <>
          <div className="wrap">
            <div className="label">
              {isModeBuy
                ? t`features/trade/trade-order-confirm/index-0`
                : t`features/trade/trade-order-confirm/index-1`}
            </div>
            <div className="value">
              {formParams?.priceText ? t`trade.tab.orderType.marketPrice` : `${formParams.price} ${denominatedCoin}`}
            </div>
          </div>
          {amountType === TradeMarketAmountTypesEnum.amount && (
            <div className="wrap">
              <div className="label">
                {isModeBuy
                  ? t`features/trade/trade-order-confirm/index-2`
                  : t`features/trade/trade-order-confirm/index-3`}
              </div>
              <div className="value">
                {formParams.amount} {underlyingCoin}
              </div>
            </div>
          )}
          {amountType === TradeMarketAmountTypesEnum.funds && (
            <div className="wrap">
              <div className="label">{t`constants/trade-4`}</div>
              <div className="value">
                {formParams.funds} {denominatedCoin}
              </div>
            </div>
          )}
        </>
      )}
      {tradeMode === TradeModeEnum.futures && (
        <>
          <div className="wrap">
            <div className="label">
              {isModeBuy
                ? t`features/trade/trade-order-confirm/index-0`
                : t`features/trade/trade-order-confirm/index-1`}
            </div>
            <div className="value">
              {formParams?.priceText ? t`trade.tab.orderType.marketPrice` : `${formParams.price} ${denominatedCoin}`}
            </div>
          </div>

          <TradeFuturesList
            underlyingCoin={underlyingCoin}
            nominalPositionValue={nominalPositionValue}
            isModeBuy={isModeBuy}
            amountType={amountType}
            formParams={formParams}
            denominatedCoin={denominatedCoin}
            futuresDelOptionChecked={futuresDelOptionChecked}
          />
        </>
      )}
    </div>
  )
}
function TradeLimitDetail({
  isModeBuy,
  tradeOrderType,
  tradeMode,
  formParams,
  coin,
  amountType,
  futuresDelOptionChecked,
  nominalPositionValue,
}: ITradeOrderConfirm) {
  const denominatedCoin = coin.buySymbol
  const underlyingCoin = coin.sellSymbol
  return (
    <div>
      <TradeDetailTitle
        tradeMode={tradeMode}
        tradeOrderType={tradeOrderType}
        denominatedCoin={denominatedCoin}
        underlyingCoin={underlyingCoin}
        isModeBuy={isModeBuy}
      />
      {tradeMode === TradeModeEnum.spot && (
        <>
          <div className="wrap">
            <div className="label">
              {isModeBuy
                ? t`features/trade/trade-order-confirm/index-0`
                : t`features/trade/trade-order-confirm/index-1`}
            </div>
            <div className="value">
              {formParams?.priceText ? t`trade.tab.orderType.marketPrice` : `${formParams.price} ${denominatedCoin}`}
            </div>
          </div>
          <div className="wrap">
            <div className="label">
              {isModeBuy
                ? t`features/trade/trade-order-confirm/index-2`
                : t`features/trade/trade-order-confirm/index-3`}
            </div>
            <div className="value">
              {formParams.amount} {underlyingCoin}
            </div>
          </div>

          <div className="wrap">
            <div className="label">{t`constants/trade-4`}</div>
            <div className="value">
              {formParams.totalPrice} {denominatedCoin}
            </div>
          </div>
        </>
      )}
      {tradeMode === TradeModeEnum.futures && (
        <>
          <div className="wrap">
            <div className="label">
              {isModeBuy
                ? t`features/trade/trade-order-confirm/index-0`
                : t`features/trade/trade-order-confirm/index-1`}
            </div>
            <div className="value">
              {formParams?.priceText ? t`trade.tab.orderType.marketPrice` : `${formParams.price} ${denominatedCoin}`}
            </div>
          </div>
          <TradeFuturesList
            underlyingCoin={underlyingCoin}
            nominalPositionValue={nominalPositionValue}
            isModeBuy={isModeBuy}
            amountType={amountType}
            formParams={formParams}
            denominatedCoin={denominatedCoin}
            futuresDelOptionChecked={futuresDelOptionChecked}
          />
        </>
      )}
    </div>
  )
}
function TradeTrailingDetail({
  isModeBuy,
  tradeOrderType,
  tradeMode,
  formParams,
  coin,
  amountType,
  futuresDelOptionChecked,
  futuresOptionUnit,
  futuresStopLossUnit,
  futuresTakeProfitUnit,
  nominalPositionValue,
  isTradeTrailingMarketOrderType,
}: ITradeOrderConfirm) {
  const denominatedCoin = coin.buySymbol
  const underlyingCoin = coin.sellSymbol
  const { contractMarkPriceInitialValue } = baseOrderBookStore.getState()
  const isUp =
    futuresOptionUnit === TradeFuturesOptionUnitEnum.last
      ? formParams.triggerPrice > coin.last
      : formParams.triggerPrice > contractMarkPriceInitialValue
  if (tradeMode === TradeModeEnum.spot) {
    return (
      <div>
        <TradeDetailTitle
          tradeMode={tradeMode}
          tradeOrderType={tradeOrderType}
          denominatedCoin={denominatedCoin}
          underlyingCoin={underlyingCoin}
          isModeBuy={isModeBuy}
        />
        {
          <>
            <div className="wrap">
              <div className="label">
                {isModeBuy
                  ? t`features/trade/trade-order-confirm/index-0`
                  : t`features/trade/trade-order-confirm/index-1`}
              </div>
              <div className="value">
                {isTradeTrailingMarketOrderType
                  ? t`trade.tab.orderType.marketPrice`
                  : `${formParams.price} ${denominatedCoin}`}
              </div>
            </div>
            {isTradeTrailingMarketOrderType ? (
              <div className="wrap">
                <div className="label">
                  {amountType === TradeMarketAmountTypesEnum.amount
                    ? t`features_c2c_advertise_advertise_history_record_list_index_wvbglqcsk6mbkp1guxv9i`
                    : t`constants/trade-4`}
                </div>
                {amountType === TradeMarketAmountTypesEnum.amount ? (
                  <div className="value">
                    {formParams.amount} {underlyingCoin}
                  </div>
                ) : (
                  <div className="value">
                    {formParams.funds} {denominatedCoin}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="wrap">
                  <div className="label">
                    {isModeBuy
                      ? t`features/trade/trade-order-confirm/index-2`
                      : t`features/trade/trade-order-confirm/index-3`}
                  </div>
                  <div className="value">
                    {formParams.amount} {underlyingCoin}
                  </div>
                </div>
                <div className="wrap">
                  <div className="label">{t`constants/trade-4`}</div>
                  <div className="value">
                    {formParams.totalPrice} {denominatedCoin}
                  </div>
                </div>
              </>
            )}

            <div className="wrap">
              <div className="label">{t`features/orders/order-columns/future-5`}</div>
              <div className="value">
                {t`features_market_market_list_common_market_list_trade_pair_table_schema_index_5101265`}{' '}
                {isUp ? '>=' : '<='} {formParams?.triggerPrice} {denominatedCoin}
              </div>
            </div>
          </>
        }
      </div>
    )
  }
  // 合约
  return (
    <div>
      <TradeDetailTitle
        tradeMode={tradeMode}
        tradeOrderType={tradeOrderType}
        denominatedCoin={denominatedCoin}
        underlyingCoin={underlyingCoin}
        isModeBuy={isModeBuy}
      />
      {
        <>
          <div className="wrap">
            <div className="label">
              {isModeBuy
                ? t`features/trade/trade-order-confirm/index-0`
                : t`features/trade/trade-order-confirm/index-1`}
            </div>
            <div className="value">
              {formParams?.priceText ? formParams?.priceText : `${formParams.price} ${denominatedCoin}`}
            </div>
          </div>

          <div className="wrap">
            <div className="label">{t`features/orders/order-columns/future-5`}</div>
            <div className="value">
              {futuresOptionUnit === TradeFuturesOptionUnitEnum.last
                ? t`features_market_market_list_common_market_list_trade_pair_table_schema_index_5101265`
                : t`constants_order_5101074`}{' '}
              {isUp ? '>=' : '<='} {formParams?.triggerPrice} {denominatedCoin}
            </div>
          </div>
          <TradeFuturesList
            underlyingCoin={underlyingCoin}
            nominalPositionValue={nominalPositionValue}
            isModeBuy={isModeBuy}
            amountType={amountType}
            formParams={formParams}
            denominatedCoin={denominatedCoin}
            futuresDelOptionChecked={futuresDelOptionChecked}
          />
        </>
      }
    </div>
  )
}
function TradeTrailingStopDetail({
  isModeBuy,
  tradeOrderType,
  tradeMode,
  formParams,
  coin,
  amountType,
  futuresDelOptionChecked,
  futuresOptionUnit,
  futuresStopLossUnit,
  futuresTakeProfitUnit,
  nominalPositionValue,
  stopSideType,
  isTradeTrailingMarketOrderType,
  isStopLossTradeTrailingMarketOrderType,
  isTakeProfitTradeTrailingMarketOrderType,
}: ITradeOrderConfirm) {
  const denominatedCoin = coin.buySymbol
  const underlyingCoin = coin.sellSymbol
  const isUp = formParams.triggerPrice > Number(coin.last)
  if (stopSideType === TradeStopSideTypeEnum.single) {
    return (
      <div>
        <TradeDetailTitle
          tradeMode={tradeMode}
          tradeOrderType={tradeOrderType}
          denominatedCoin={denominatedCoin}
          underlyingCoin={underlyingCoin}
          isModeBuy={isModeBuy}
        />
        {
          <>
            <div className="wrap">
              <div className="label">
                {isModeBuy
                  ? t`features/trade/trade-order-confirm/index-0`
                  : t`features/trade/trade-order-confirm/index-1`}
              </div>
              <div className="value">
                {isTradeTrailingMarketOrderType
                  ? t`trade.tab.orderType.marketPrice`
                  : `${formParams.price} ${denominatedCoin}`}
              </div>
            </div>
            {isTradeTrailingMarketOrderType ? (
              <div className="wrap">
                <div className="label">
                  {amountType === TradeMarketAmountTypesEnum.amount
                    ? t`features_c2c_advertise_advertise_history_record_list_index_wvbglqcsk6mbkp1guxv9i`
                    : t`constants/trade-4`}
                </div>
                {amountType === TradeMarketAmountTypesEnum.amount ? (
                  <div className="value">
                    {formParams.amount} {underlyingCoin}
                  </div>
                ) : (
                  <div className="value">
                    {formParams.funds} {denominatedCoin}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="wrap">
                  <div className="label">
                    {isModeBuy
                      ? t`features/trade/trade-order-confirm/index-2`
                      : t`features/trade/trade-order-confirm/index-3`}
                  </div>
                  <div className="value">
                    {formParams.amount} {underlyingCoin}
                  </div>
                </div>
                <div className="wrap">
                  <div className="label">{t`constants/trade-4`}</div>
                  <div className="value">
                    {formParams.totalPrice} {denominatedCoin}
                  </div>
                </div>
              </>
            )}

            <div className="wrap">
              <div className="label">{t`features/orders/order-columns/future-5`}</div>
              <div className="value">
                {t`features_market_market_list_common_market_list_trade_pair_table_schema_index_5101265`}{' '}
                {isUp ? '>=' : '<='} {formParams?.triggerPrice} {denominatedCoin}
              </div>
            </div>
          </>
        }
      </div>
    )
  }
  const isTakeProfitUp = formParams.takeProfitTriggerPrice > coin.last
  const isStopLossUp = formParams.stopLossTriggerPrice > coin.last

  return (
    <div>
      <TradeDetailTitle
        tradeMode={tradeMode}
        tradeOrderType={tradeOrderType}
        denominatedCoin={denominatedCoin}
        underlyingCoin={underlyingCoin}
        isModeBuy={isModeBuy}
      />
      {tradeMode === TradeModeEnum.spot && (
        <>
          <div className="wrap">
            <div className="label">{t`features_trade_trade_order_confirm_index_w2qjawazoe`}</div>
            <div className="value">
              {t`features_market_market_list_common_market_list_trade_pair_table_schema_index_5101265`}{' '}
              {isTakeProfitUp ? '>=' : '<='} {formParams?.takeProfitTriggerPrice} {denominatedCoin}
            </div>
          </div>
          <div className="wrap">
            <div className="label">{t`features_trade_trade_order_confirm_index_wcf498oxqw`}</div>
            <div className="value">
              {isTakeProfitTradeTrailingMarketOrderType
                ? t`trade.tab.orderType.marketPrice`
                : `${formParams.takeProfitPrice} ${denominatedCoin}`}
            </div>
          </div>
          <div className="wrap">
            <div className="label">{t`features_trade_trade_order_confirm_index_lnbsrdrcbs`}</div>
            <div className="value">
              {t`features_market_market_list_common_market_list_trade_pair_table_schema_index_5101265`}{' '}
              {isStopLossUp ? '>=' : '<='} {formParams?.stopLossTriggerPrice} {denominatedCoin}
            </div>
          </div>
          <div className="wrap">
            <div className="label">{t`features_trade_trade_order_confirm_index_y5ur2lwjs0`}</div>
            <div className="value">
              {isStopLossTradeTrailingMarketOrderType
                ? t`trade.tab.orderType.marketPrice`
                : `${formParams.stopLossPrice} ${denominatedCoin}`}
            </div>
          </div>
          {isStopLossTradeTrailingMarketOrderType && isTakeProfitTradeTrailingMarketOrderType ? (
            <div className="wrap">
              <div className="label">
                {amountType === TradeMarketAmountTypesEnum.amount
                  ? t`features_c2c_advertise_advertise_history_record_list_index_wvbglqcsk6mbkp1guxv9i`
                  : t`constants/trade-4`}
              </div>
              {amountType === TradeMarketAmountTypesEnum.amount ? (
                <div className="value">
                  {formParams.amount} {underlyingCoin}
                </div>
              ) : (
                <div className="value">
                  {formParams.funds} {denominatedCoin}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="wrap">
                <div className="label">
                  {isModeBuy
                    ? t`features/trade/trade-order-confirm/index-2`
                    : t`features/trade/trade-order-confirm/index-3`}
                </div>
                <div className="value">
                  {formParams.amount} {underlyingCoin}
                </div>
              </div>
              <div className="wrap">
                <div className="label">{t`constants/trade-4`}</div>
                <div className="value">
                  {formParams.totalPrice} {denominatedCoin}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function TradeOrderConfirm({
  isModeBuy,
  tradeOrderType,
  tradeMode,
  formParams,
  coin,
  amountType,
  futuresDelOptionChecked,
  futuresOptionUnit,
  futuresStopLossUnit,
  futuresTakeProfitUnit,
  nominalPositionValue,
  stopSideType,
  isTradeTrailingMarketOrderType,
  isStopLossTradeTrailingMarketOrderType,
  isTakeProfitTradeTrailingMarketOrderType,
}: ITradeOrderConfirm) {
  const TradeStore = useTradeStore()
  const { setSettingFalse } = TradeStore
  function onChange() {
    setSettingFalse()
  }
  return (
    <div className={Styles.scoped}>
      {/* 市价单 */}
      {tradeOrderType === TradeOrderTypesEnum.market &&
        TradeMarketDetail({
          isModeBuy,
          tradeOrderType,
          tradeMode,
          formParams,
          coin,
          amountType,
          futuresDelOptionChecked,
          nominalPositionValue,
        })}
      {/* 限价单 */}
      {tradeOrderType === TradeOrderTypesEnum.limit &&
        TradeLimitDetail({
          isModeBuy,
          tradeOrderType,
          tradeMode,
          formParams,
          coin,
          amountType,
          futuresDelOptionChecked,
          nominalPositionValue,
        })}
      {/* 计划委托单 */}
      {tradeOrderType === TradeOrderTypesEnum.trailing &&
        TradeTrailingDetail({
          isModeBuy,
          tradeOrderType,
          tradeMode,
          formParams,
          coin,
          amountType,
          futuresDelOptionChecked,
          futuresOptionUnit,
          futuresStopLossUnit,
          futuresTakeProfitUnit,
          nominalPositionValue,
          isTradeTrailingMarketOrderType,
        })}
      {tradeOrderType === TradeOrderTypesEnum.stop &&
        TradeTrailingStopDetail({
          isModeBuy,
          tradeOrderType,
          tradeMode,
          formParams,
          coin,
          amountType,
          futuresDelOptionChecked,
          futuresOptionUnit,
          futuresStopLossUnit,
          futuresTakeProfitUnit,
          nominalPositionValue,
          stopSideType,
          isTradeTrailingMarketOrderType,
          isStopLossTradeTrailingMarketOrderType,
          isTakeProfitTradeTrailingMarketOrderType,
        })}
      <div className="setting">
        <Checkbox onChange={onChange}>
          <span className="tips-wrap">
            {t`features_trade_trade_order_confirm_index_2556`}
            <Tooltip content={<div>{t`features_trade_trade_order_confirm_index_2557`}</div>}>
              <span>
                <Icon className="ml-0.5" name="msg" hasTheme />
              </span>
            </Tooltip>
          </span>
        </Checkbox>
      </div>
    </div>
  )
}

export default TradeOrderConfirm
