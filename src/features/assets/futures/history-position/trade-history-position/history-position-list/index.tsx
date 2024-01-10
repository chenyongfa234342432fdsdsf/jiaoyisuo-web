/**
 * 合约持仓 - 历史仓位 - 合约交易页用
 */
import { t } from '@lingui/macro'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import { decimalUtils } from '@nbit/utils'
import { IncreaseTag } from '@nbit/react'
import { formatDate } from '@/helper/date'
import { useMemo, useState } from 'react'
import { useFuturesStore } from '@/store/futures'
import { onFormatPositionSize } from '@/helper/assets/futures'
import { FuturesPositionHistoryTypeEnum } from '@/constants/assets/futures'
import Icon from '@/components/icon'
import { getTextFromStoreEnums } from '@/helper/store'
import { NoDataElement } from '@/features/orders/order-table-layout'
import { useUserStore } from '@/store/user'
import { useGetHistoryPosition } from '@/hooks/features/assets/futures'
import classNames from 'classnames'
import AssetsPagination from '@/features/assets/common/pagination'
import { IPositionProfitInfoData } from '@/typings/api/assets/futures/position'
import { useFutureQuoteDisplayDigit } from '@/hooks/features/assets'
import styles from './index.module.css'
import { HistoryPositionDetailLayout } from '../../history-position-detail'
import FuturesBaseTag from '../../../common/futures-info-tag/futures-base-tag'
import { ProfitDetailModal } from '../../profit-detail-modal'

interface IHistoryPositionList {
  /** 分页 */
  page: any
  /** 分页事件 */
  setPage(val): void
}

export function HistoryPositionList(props: IHistoryPositionList) {
  const { page, setPage } = props
  const userStore = useUserStore()
  const {
    isLogin,
    userInfo: { isOpenContractStatus },
  } = userStore
  const {
    updateFuturesPosition,
    futuresPosition: { historyPositionTotal = 0 },
    futuresEnums,
  } = useAssetsFuturesStore() || {}
  const historyPositionList = useGetHistoryPosition()
  const [visibleDetail, setVisibleDetail] = useState(false)
  const [visibleProfitDetail, setVisibleProfitDetail] = useState(false)
  const [profitData, setProfitData] = useState<IPositionProfitInfoData>()
  const offset = useFutureQuoteDisplayDigit()
  // const {
  //   futuresCurrencySettings: { offset = 2 },
  // } = useAssetsFuturesStore()
  const { formatCurrency } = decimalUtils
  /** 开仓保证金来源设置，tradePanel 下单面板数据 */
  const { tradePanel } = useFuturesStore()
  /** 下单页输入框下拉计价单位 - 金额还是数量 eg usd / btc */
  const tradePairType = useMemo(() => {
    return tradePanel.tradeUnit
  }, [tradePanel.tradeUnit])

  const onOpenProfitDetail = (data: IPositionProfitInfoData) => {
    setProfitData(data)
    setVisibleProfitDetail(true)
  }

  if (!isLogin || !isOpenContractStatus || !historyPositionList || historyPositionList.length === 0) {
    return (
      <div className="h-full flex justify-center">
        <NoDataElement isFuture />
      </div>
    )
  }

  return (
    <div className={styles['futures-position-table']}>
      <div
        className={classNames('history-history-root', {
          'arco-table-body-full': true,
          'auto-width': true,
          'no-data': historyPositionList?.length === 0,
        })}
      >
        <div className={styles['history-history-wrapper']}>
          {historyPositionList &&
            historyPositionList.map((item, index) => {
              const {
                swapTypeInd,
                operationTypeCd,
                quoteSymbolName,
                baseSymbolName,
                openPrice,
                closePrice,
                profitRatio,
                profit,
                size,
                closeSize,
                openPositionTime,
                closePositionTime,
                tradeId,
                amountOffset,
                priceOffset,
                latestPrice,
              } = item || {}

              const positionInfo = [
                {
                  label: t`features_assets_futures_history_position_trade_history_position_history_position_list_index_52_ns_x8rw`,
                  value: formatDate(openPositionTime),
                },
                {
                  label: t`features_assets_futures_futures_details_position_details_list_5101351`,
                  value: `${formatCurrency(openPrice, Number(priceOffset))} ${quoteSymbolName}`,
                },
                {
                  label: t`features/orders/order-columns/future-2`,
                  value: (
                    <>
                      <IncreaseTag
                        value={profit}
                        hasPrefix={false}
                        kSign
                        digits={offset}
                        right={<span className="ml-1">{quoteSymbolName}</span>}
                      />
                      {Number(item.profit) < 0 && Number(item?.insuranceDeductionAmount) > 0 && (
                        <Icon
                          name="msg"
                          hasTheme
                          className="ml-1"
                          onClick={() => {
                            onOpenProfitDetail({
                              profit: item?.profit,
                              insuranceDeductionAmount: item?.insuranceDeductionAmount,
                              voucherDeductionAmount: item?.voucherDeductionAmount,
                            })
                          }}
                        />
                      )}
                    </>
                  ),
                },
                {
                  label: t`features_assets_futures_futures_detail_position_list_index_5101362`,
                  value: onFormatPositionSize(
                    tradePairType,
                    size,
                    latestPrice,
                    amountOffset,
                    offset,
                    baseSymbolName,
                    quoteSymbolName
                  ),
                },
                {
                  label:
                    operationTypeCd === FuturesPositionHistoryTypeEnum.liquidation
                      ? t`features_assets_futures_history_position_trade_history_position_history_position_list_index_jxt6lbbaex`
                      : t`features_assets_futures_history_position_trade_history_position_history_position_list_index_lmnsjm6vh1`,
                  value: formatDate(closePositionTime),
                },
                {
                  label:
                    operationTypeCd === FuturesPositionHistoryTypeEnum.liquidation
                      ? t`features/orders/order-columns/holding-2`
                      : t`features_assets_futures_history_position_orders_history_position_index_klnrjko1b5`,
                  value: `${decimalUtils.formatCurrency(closePrice, Number(priceOffset))}  ${quoteSymbolName}`,
                },
                {
                  label: t`features/orders/order-columns/holding-5`,
                  value: <IncreaseTag value={profitRatio} digits={2} hasPostfix needPercentCalc />,
                },
                {
                  label: t`features_assets_futures_history_position_trade_history_position_history_position_list_index_5e6sihylfl`,
                  value: onFormatPositionSize(
                    tradePairType,
                    closeSize,
                    latestPrice,
                    amountOffset,
                    offset,
                    baseSymbolName,
                    quoteSymbolName
                  ),
                },
              ]
              return (
                <div key={`${tradeId}_${index}`}>
                  <div className="header-wrap">
                    <FuturesBaseTag positionData={item} swapTypeInd={swapTypeInd} />
                    <div
                      className={classNames('close-type', {
                        'liquidation-type': operationTypeCd === FuturesPositionHistoryTypeEnum.liquidation,
                      })}
                      onClick={() => {
                        if (operationTypeCd !== FuturesPositionHistoryTypeEnum.liquidation) return

                        updateFuturesPosition({ liquidationDetails: item })
                        setVisibleDetail(true)
                      }}
                    >
                      <span>
                        {operationTypeCd &&
                          getTextFromStoreEnums(operationTypeCd, futuresEnums.historyPositionCloseTypeEnum.enums)}
                      </span>
                      {operationTypeCd === FuturesPositionHistoryTypeEnum.liquidation && (
                        <Icon name="next_arrow" hasTheme className="type-next-icon" />
                      )}
                    </div>
                  </div>
                  <div className="content">
                    {positionInfo.map((info, i) => {
                      return (
                        <div
                          className={classNames('info-cell', { 'line-third-info-cell': i + 1 === 3 || i + 1 === 7 })}
                          key={i}
                        >
                          <div className="info-label">{info.label}</div>
                          <div className="info-content">{info.value}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
      {historyPositionList && historyPositionList.length > 0 && (
        <AssetsPagination
          // targetRef={tableContainerRef}
          size={'small'}
          current={page.pageNum}
          pageSize={page.pageSize}
          total={historyPositionTotal}
          onChange={(pageNumber: number, pageSize: number) => {
            setPage({ ...page, pageNum: pageNumber, pageSize })
          }}
        />
      )}
      {visibleDetail && <HistoryPositionDetailLayout visible={visibleDetail} setVisible={setVisibleDetail} />}
      {visibleProfitDetail && profitData && (
        <ProfitDetailModal profitData={profitData} visible={visibleProfitDetail} setVisible={setVisibleProfitDetail} />
      )}
    </div>
  )
}
