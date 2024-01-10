import {
  EntrustTypeEnum,
  getOrderDirectionEnumName,
  getTradePriceTypeEnumName,
  OrderDirectionEnum,
  OrderStatusEnum,
  OrderTabTypeEnum,
  PlanOrderMatchTypeEnum,
  SpotNormalOrderMarketUnitEnum,
  SpotPlanOrderStatusEnum,
  SpotPlanTriggerDirection,
} from '@/constants/order'
import { formatDate } from '@/helper/date'
import { replaceEmpty } from '@/helper/filters'
import {
  IBaseOrderItem,
  IQuerySpotOrderReqParams,
  ISpotPlanOrderItem,
  ISpotStopLimitOrderItem,
} from '@/typings/api/order'
import { TableColumnProps } from '@nbit/arco'
import { t } from '@lingui/macro'
import cn from 'classnames'
import { formatCurrency } from '@/helper/decimal'
import { getOrderValueEnumText } from '@/helper/order/spot'
import SideTag from '@/components/side-tag'
import { ActionCell, SpotTradeOpenCurrencyCell } from '../order-table-cell'
import { getOrderTableColumns, ORDER_TABLE_COLUMN_ID } from './base'

type IQueryOrderListReq = IQuerySpotOrderReqParams

type ISpotOrderRenderItem = IBaseOrderItem &
  ISpotPlanOrderItem & {
    profitTriggerPrice: string
    lossTriggerPrice: string
    profitTriggerDirectionInd: string
    lossTriggerDirectionInd: string
    profitOrderType: number
    lossOrderType: number
    profitPlacePrice: string
    lossPlacePrice: string
    profitPlaceCount: string
    profitFunds: string
    lossPlaceCount: string
    lossFunds: string
  }

function getBaseColumns(params: IQueryOrderListReq) {
  const baseColumns: Array<
    TableColumnProps<ISpotOrderRenderItem> & {
      id: ORDER_TABLE_COLUMN_ID
    }
  > = [
    {
      title: t`order.columns.date`,
      width: 200,
      id: ORDER_TABLE_COLUMN_ID.date,
      render(_col, item) {
        return (
          <div>
            <div className="mb-1">{formatDate(Number(item.createdByTime), 'YYYY-MM-DD')}</div>
            <div>{formatDate(Number(item.createdByTime), 'HH:mm')}</div>
          </div>
        )
      },
    },
    {
      title: t`order.columns.currency`,
      id: ORDER_TABLE_COLUMN_ID.currency,
      width: 140,
      render(_col, item) {
        return (
          <div>
            {item.sellCoinShortName?.toUpperCase()}/{item.buyCoinShortName?.toUpperCase()}
            <div className="mt-1">
              <SideTag className="font-normal" isSideUp={item.side === OrderDirectionEnum.buy}>
                {getOrderValueEnumText(item).directionText}
              </SideTag>
            </div>
          </div>
        )
      },
    },
    {
      title: t`order.columns.currency`,
      id: ORDER_TABLE_COLUMN_ID.tradeOpenCurrency,
      width: 140,
      render(_col, item) {
        return <SpotTradeOpenCurrencyCell order={item} />
      },
    },
    {
      title: t`assets.coin.trade-records.table.type`,
      id: ORDER_TABLE_COLUMN_ID.entrustType,
      width: 100,
      render(_col, item) {
        return <div className="font-normal">{getOrderValueEnumText(item).typeTextWithSuffix}</div>
      },
    },
    {
      title: t`assets.coin.trade-records.table.type`,
      id: ORDER_TABLE_COLUMN_ID.stopLimitType,
      width: 100,
      render(_col, item) {
        return <div className="font-normal">{t`order.tabs.profitLoss`}</div>
      },
    },
    {
      title: t`features/trade/trade-order-confirm/index-3`,
      id: ORDER_TABLE_COLUMN_ID.entrustAmount,
      width: 140,
      render(_col, item: ISpotPlanOrderItem) {
        const isMarketPrice = item.matchType === PlanOrderMatchTypeEnum.marketPrice
        const coinName = isMarketPrice
          ? item.orderAmount
            ? item.sellCoinShortName
            : item.buyCoinShortName
          : item.sellCoinShortName

        return (
          <div>
            <span>{formatCurrency(item.orderAmount || item.orderPrice)}</span> <span>{coinName}</span>
          </div>
        )
      },
    },
    {
      title: t`order.columns.entrustPrice`,
      id: ORDER_TABLE_COLUMN_ID.price,
      width: 120,
      render(_col, item: ISpotPlanOrderItem) {
        const isMarketPrice = item.matchType === PlanOrderMatchTypeEnum.marketPrice

        return (
          <div className={isMarketPrice ? 'font-normal' : ''}>
            {isMarketPrice ? t`trade.tab.orderType.marketPrice` : replaceEmpty(formatCurrency(item.orderPrice))}
          </div>
        )
      },
    },
    {
      title: t`order.columns.triggerPrice`,
      id: ORDER_TABLE_COLUMN_ID.triggerPrice,
      width: 120,
      render(_col, item: ISpotPlanOrderItem) {
        return <div>{replaceEmpty(formatCurrency(item.triggerPrice))}</div>
      },
    },
    {
      title: t`features/orders/order-columns/future-5`,
      id: ORDER_TABLE_COLUMN_ID.triggerCondition,
      width: 160,
      render(_col, order: ISpotPlanOrderItem) {
        const triggerPriceTypeName = getTradePriceTypeEnumName(order.triggerTypeInd)

        return (
          <div>
            <span className="font-normal">{triggerPriceTypeName}</span>
            <span className="mx-1">{order.triggerDirectionInd === SpotPlanTriggerDirection.up ? '≥' : '≤'}</span>
            {formatCurrency(order.triggerPrice)}
          </div>
        )
      },
    },
    {
      title: t`order.columns.triggerPrice`,
      id: ORDER_TABLE_COLUMN_ID.stopLimitTriggerCondition,
      width: 160,
      render(_col, order) {
        // 区分单向、双向止盈止损
        const multiple = order.profitTriggerPrice && order.lossTriggerPrice
        return (
          <>
            {order.profitTriggerPrice ? (
              <div>
                <span className="font-normal">
                  {multiple
                    ? t`features_orders_order_columns_spot_xayhzucdjn`
                    : t`features_market_market_list_common_market_list_trade_pair_table_schema_index_5101265`}
                </span>
                <span className="mx-1">{order.profitTriggerDirectionInd === 'up' ? '≥' : '≤'}</span>
                {formatCurrency(order.profitTriggerPrice)}
              </div>
            ) : null}
            {order.lossTriggerPrice ? (
              <div className="mt-1">
                <span className="font-normal">
                  {multiple
                    ? t`features_orders_order_columns_spot_obchxkeoqo`
                    : t`features_market_market_list_common_market_list_trade_pair_table_schema_index_5101265`}
                </span>
                <span className="mx-1">{order.lossTriggerDirectionInd === 'up' ? '≥' : '≤'}</span>
                {formatCurrency(order.lossTriggerPrice)}
              </div>
            ) : null}
          </>
        )
      },
    },
    {
      title: t`order.columns.triggerTime`,
      id: ORDER_TABLE_COLUMN_ID.triggerTime,
      width: 180,
      render(_col, item) {
        return <div>{formatDate(item.triggerTime!)}</div>
      },
    },
    {
      title: t`features_orders_order_columns_spot_5101083`,
      id: ORDER_TABLE_COLUMN_ID.count,
      width: 240,
      render(_col, item) {
        const isMarketPrice = item.orderType === EntrustTypeEnum.market
        const marketOrderIsEntrustAmount = item.marketUnit === SpotNormalOrderMarketUnitEnum.entrustAmount
        const coinName = isMarketPrice
          ? marketOrderIsEntrustAmount
            ? item.sellCoinShortName
            : item.buyCoinShortName
          : item.sellCoinShortName
        return (
          <div>
            <span>{`${formatCurrency(item.successCount)} ${coinName}`}</span>
            <div className="mt-1">{`${formatCurrency(item.entrustCount)} ${coinName}`}</div>
          </div>
        )
      },
    },
    {
      title: t`features/trade/trade-order-confirm/index-3`,
      id: ORDER_TABLE_COLUMN_ID.stopLimitEntrustAmount,
      width: 140,
      render(_col, item) {
        const marketOrderIsEntrustAmount = item.marketUnit === SpotNormalOrderMarketUnitEnum.entrustAmount
        const isProfitMarketPrice = item.profitOrderType === EntrustTypeEnum.market
        const isLossMarketPrice = item.lossOrderType === EntrustTypeEnum.market
        function getCoinName(isMarketPrice, isEntrustAmout) {
          return isMarketPrice
            ? isEntrustAmout
              ? item.sellCoinShortName
              : item.buyCoinShortName
            : item.sellCoinShortName
        }
        const profitCoinName = getCoinName(isProfitMarketPrice, marketOrderIsEntrustAmount)
        const lossCoinName = getCoinName(isLossMarketPrice, marketOrderIsEntrustAmount)
        return item.profitTriggerPrice ? (
          <div>
            <span>{formatCurrency(item.profitFunds || item.profitPlaceCount)}</span> <span>{profitCoinName}</span>
          </div>
        ) : (
          <div>
            <span>{formatCurrency(item.lossFunds || item.lossPlaceCount)}</span> <span>{lossCoinName}</span>
          </div>
        )
      },
    },
    {
      title: t`features/trade/trade-order-confirm/index-1`,
      id: ORDER_TABLE_COLUMN_ID.stopLimitPrice,
      width: 240,
      render(_col, item) {
        const isProfitMarketPrice = item.profitOrderType === EntrustTypeEnum.market
        const isLossMarketPrice = item.lossOrderType === EntrustTypeEnum.market
        return (
          <>
            {item.profitTriggerPrice ? (
              <div className={isProfitMarketPrice ? 'font-normal' : ''}>
                {isProfitMarketPrice ? t`trade.tab.orderType.marketPrice` : formatCurrency(item.profitPlacePrice || 0)}
              </div>
            ) : null}
            {item.lossTriggerPrice ? (
              <div className={cn('mt-1', { 'font-normal': isLossMarketPrice })}>
                {isLossMarketPrice ? t`trade.tab.orderType.marketPrice` : formatCurrency(item.lossPlacePrice || 0)}
              </div>
            ) : null}
          </>
        )
      },
    },
    {
      title: t`features_orders_order_columns_spot_5101084`,
      id: ORDER_TABLE_COLUMN_ID.avgPrice,
      width: 240,
      render(_col, item) {
        const isMarketPrice = item.orderType === EntrustTypeEnum.market
        return (
          <div>
            <span>{replaceEmpty(formatCurrency(item.averagePrice))}</span>
            <div className={cn('mt-1', { 'font-normal': isMarketPrice })}>
              {isMarketPrice ? t`trade.tab.orderType.marketPrice` : formatCurrency(item.entrustPrice || 0)}
            </div>
          </div>
        )
      },
    },
    {
      title: t`features_orders_order_columns_spot_5101085`,
      id: ORDER_TABLE_COLUMN_ID.percent,
      width: 80,
      render(_col, item) {
        return (
          <div>
            <span>{item.completeness}</span>
          </div>
        )
      },
    },
    {
      title: t`order.columns.status`,
      width: 100,
      id: ORDER_TABLE_COLUMN_ID.status,
      render(_col, item) {
        const statusText = getOrderValueEnumText(item).statusText

        return <div className="font-normal">{statusText}</div>
      },
    },
    {
      title: t`order.columns.action`,
      width: 80,
      id: ORDER_TABLE_COLUMN_ID.action,
      render(_col, item) {
        return <ActionCell order={item} />
      },
    },
  ]
  return baseColumns
}

export function getSpotColumns(
  tab: OrderTabTypeEnum,
  params: IQueryOrderListReq,
  inTrade?: boolean,
  mapFnRecord?: Parameters<typeof getOrderTableColumns>[2]
) {
  const isHistoryTab = tab === OrderTabTypeEnum.history
  const currencyId = !isHistoryTab ? ORDER_TABLE_COLUMN_ID.tradeOpenCurrency : ORDER_TABLE_COLUMN_ID.currency
  const normalColumnIds = [
    currencyId,
    ORDER_TABLE_COLUMN_ID.date,
    ORDER_TABLE_COLUMN_ID.entrustType,
    ORDER_TABLE_COLUMN_ID.count,
    ORDER_TABLE_COLUMN_ID.avgPrice,
    ORDER_TABLE_COLUMN_ID.percent,
    ...(isHistoryTab ? [ORDER_TABLE_COLUMN_ID.status] : []),
    ORDER_TABLE_COLUMN_ID.action,
  ]
  const planColumnIds = [
    currencyId,
    ORDER_TABLE_COLUMN_ID.date,
    ORDER_TABLE_COLUMN_ID.entrustType,
    ORDER_TABLE_COLUMN_ID.entrustAmount,
    ORDER_TABLE_COLUMN_ID.price,
    ORDER_TABLE_COLUMN_ID.triggerCondition,
    ...(isHistoryTab ? [ORDER_TABLE_COLUMN_ID.status] : []),
    ORDER_TABLE_COLUMN_ID.action,
  ]

  const stopLimitColumnIds = [
    currencyId,
    ORDER_TABLE_COLUMN_ID.date,
    ORDER_TABLE_COLUMN_ID.stopLimitType,
    ORDER_TABLE_COLUMN_ID.stopLimitEntrustAmount,
    ORDER_TABLE_COLUMN_ID.stopLimitPrice,
    ORDER_TABLE_COLUMN_ID.stopLimitTriggerCondition,
    ...(isHistoryTab ? [ORDER_TABLE_COLUMN_ID.status] : []),
    ORDER_TABLE_COLUMN_ID.action,
  ]
  const columnsMap = {
    [EntrustTypeEnum.plan]: planColumnIds,
    [EntrustTypeEnum.normal]: normalColumnIds,
    [EntrustTypeEnum.stopLimit]: stopLimitColumnIds,
  }

  const columns = getOrderTableColumns(
    () => {
      return getBaseColumns(params)
    },
    columnsMap[Number(params.entrustType)],
    mapFnRecord
  )

  return columns
}
