/**
 * 历史仓位 - 合约订单页面用到的组件
 */
import { t } from '@lingui/macro'
import { Button } from '@nbit/arco'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FutureOrderModuleContext, useCreateOrderModuleContext } from '@/features/orders/order-module-context'
import { OrderTableLayout } from '@/features/orders/order-table-layout'
import { postPerpetualPositionHistoryList } from '@/apis/assets/futures/position'
import { useFuturesStore } from '@/store/futures'
import { formatDate } from '@/helper/date'
import { decimalUtils } from '@nbit/utils'
import { onFormatPositionSize } from '@/helper/assets/futures'
import classNames from 'classnames'
import {
  FuturePositionDirectionEnum,
  getFuturePositionListDirectionEnumName,
  getFuturesGroupTypeName,
} from '@/constants/assets/futures'
import { defaultFuturesPositionHistoryForm, useAssetsFuturesStore } from '@/store/assets/futures'
import { useMemoizedFn, useMount, useUnmount } from 'ahooks'
import { useUserStore } from '@/store/user'
import { ClosePositionHistory } from '@/plugins/ws/protobuf/ts/proto/ClosePositionHistory'
import { FutureHistoryPositionFilter } from '@/features/orders/filters/history-position'
import { useFutureQuoteDisplayDigit } from '@/hooks/features/assets'
import { HistoryPositionDetailLayout } from '../history-position-detail'
import styles from './index.module.css'
import { HistoryPositionOptionCell, HistoryPositionProfitCell } from './profit-cell'

export function FutureHistoryPositionOrders() {
  /** 开仓保证金来源设置，tradePanel 下单面板数据 */
  const { tradePanel } = useFuturesStore()
  /** 下单页输入框下拉计价单位 - 金额还是数量 eg usd / btc */
  const tradePairType = useMemo(() => {
    return tradePanel.tradeUnit
  }, [tradePanel.tradeUnit])
  const userStore = useUserStore()
  const {
    isLogin,
    userInfo: { isOpenContractStatus },
  } = userStore
  const offset = useFutureQuoteDisplayDigit()
  const {
    futuresCurrencySettings: { currencySymbol },
    futuresPosition,
    updateFuturesPosition,
    fetchFuturesEnums,
  } = useAssetsFuturesStore() || {}

  useMount(fetchFuturesEnums)
  const { historyForm, wsClosePositionHistorySubscribe, wsClosePositionHistoryUnSubscribe } = futuresPosition || {}

  const contextValue = useCreateOrderModuleContext({} as any)
  const refresh = () => {
    contextValue.refreshEvent$.emit()
  }
  const reset = () => {
    updateFuturesPosition({ historyForm: defaultFuturesPositionHistoryForm })
  }
  const search = async (pageParams: any) => {
    const params = { ...historyForm }
    delete params.tradeInfo
    delete params.dateType
    const res = await postPerpetualPositionHistoryList({
      ...params,
      ...pageParams,
    })

    const { isOk, data } = res || {}
    if (isOk && data) {
      return {
        data: data.list,
        total: data.total,
      }
    }
    return {
      data: [],
      total: 0,
    }
  }
  const staticRefs = useRef({
    tableLayoutProps: {
      tableHeight: 500,
    },
  })

  /**
   * 历史仓位变动推送回调
   */
  const onClosePositionHistoryWsCallBack = useMemoizedFn((data: ClosePositionHistory[]) => {
    if (!data || data.length === 0) return

    const { closePositionTime, symbol, type } = data[0] || {}
    const { startTime, endTime, tradeInfo, operationTypeCd } = historyForm || {}
    if (
      +closePositionTime >= startTime &&
      +closePositionTime <= endTime &&
      (!tradeInfo?.symbolName || tradeInfo?.symbolName === symbol) &&
      (!operationTypeCd || operationTypeCd === type)
    )
      search({})
  })

  useEffect(() => {
    wsClosePositionHistorySubscribe(onClosePositionHistoryWsCallBack)
  }, [isLogin, isOpenContractStatus])

  useUnmount(() => {
    wsClosePositionHistoryUnSubscribe(onClosePositionHistoryWsCallBack)
  })

  const cellStyle: any = {
    headerCellStyle: {
      textAlign: 'right',
    },
    bodyCellStyle: {
      textAlign: 'right',
    },
  }
  const columns = [
    {
      title: t`features_assets_futures_history_position_trade_history_position_history_position_list_index_52_ns_x8rw`,
      render(_col, item) {
        return <>{formatDate(item.openPositionTime!)}</>
      },
    },
    {
      title: t`future.funding-history.future-select.future`,
      ...cellStyle,
      render(_col, item) {
        return (
          <>
            {item.symbol} {getFuturesGroupTypeName(item.swapTypeInd)}
          </>
        )
      },
    },
    {
      title: t`features_assets_futures_history_position_orders_history_position_index_xcrdh6ueum`,
      ...cellStyle,
      render: (col, item) => (
        <div>
          <span
            className={classNames({
              'text-buy_up_color': item.sideInd === FuturePositionDirectionEnum.openBuy,
              'text-sell_down_color': item.sideInd === FuturePositionDirectionEnum.openSell,
            })}
          >
            {getFuturePositionListDirectionEnumName(item.sideInd)}
          </span>
          <span className="px-1">/</span>
          <span>{item.lever}X</span>
        </div>
      ),
    },
    {
      title: t`features_assets_futures_futures_details_position_details_list_5101351`,
      ...cellStyle,
      render(_col, item) {
        return <>{decimalUtils.formatCurrency(item.openPrice, Number(item.priceOffset))}</>
      },
    },
    {
      title: t`features_assets_futures_history_position_orders_history_position_index_klnrjko1b5`,
      ...cellStyle,
      render(_col, item) {
        return <>{decimalUtils.formatCurrency(item.closePrice, Number(item.priceOffset))}</>
      },
    },
    {
      title: (
        <span className="tips-text">
          {t`features/orders/order-columns/future-2`} {`(${currencySymbol || ''})`} |{' '}
          {t`features/orders/order-columns/holding-5`}
        </span>
      ),
      ...cellStyle,
      render(_col, item) {
        return <HistoryPositionProfitCell item={item} />
      },
    },
    {
      title: t`features_assets_futures_history_position_orders_history_position_index_xsieh75xwd`,
      ...cellStyle,
      render(_col, item) {
        return (
          <>
            {onFormatPositionSize(
              tradePairType,
              item.size,
              item.latestPrice,
              item.amountOffset,
              offset,
              item.baseSymbolName,
              item.quoteSymbolName
            )}
          </>
        )
      },
    },
    {
      title: t`features_assets_futures_history_position_orders_history_position_index_wvww_7mhak`,
      ...cellStyle,
      render(_col, item) {
        return (
          <>
            {onFormatPositionSize(
              tradePairType,
              item.closeSize,
              item.latestPrice,
              item.amountOffset,
              offset,
              item.baseSymbolName,
              item.quoteSymbolName
            )}
          </>
        )
      },
    },
    {
      title: t`features_assets_futures_history_position_trade_history_position_history_position_list_index_lmnsjm6vh1`,
      ...cellStyle,
      render(_col, item) {
        return <>{formatDate(item.closePositionTime!)}</>
      },
    },
    {
      title: t`order.filters.status.label`,
      ...cellStyle,
      render(_col, item) {
        return <HistoryPositionOptionCell item={item} />
      },
    },
  ]

  return (
    <FutureOrderModuleContext.Provider value={contextValue}>
      <div className={styles['futures-history-position']}>
        <div className="search-form-wrap">
          <div className="search-form mb-filter-block">
            <FutureHistoryPositionFilter />
            <div className="mb-4">
              <Button className="mr-4 h-10" onClick={refresh} type="primary">
                {t`assets.financial-record.search.search`}
              </Button>
              <Button className="h-10" onClick={reset}>
                {t`user.field.reuse_47`}
              </Button>
            </div>
          </div>
        </div>
        <OrderTableLayout
          {...staticRefs.current.tableLayoutProps}
          columns={columns}
          autoSetWidth={false}
          params={{}}
          onlyTable
          orderModuleContext={contextValue}
          filters={null}
          showPagination
          search={search as any}
          rowKey={i => `${i.id}_${i.closePositionTime}_${i.closePrice}_${i.closeSize}_${i.closeFee}`}
        />
      </div>
    </FutureOrderModuleContext.Provider>
  )
}
