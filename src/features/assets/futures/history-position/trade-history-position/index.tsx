/**
 * 合约持仓 - 历史仓位 - 合约交易页用
 */
import { defaultFuturesPosition, useAssetsFuturesStore } from '@/store/assets/futures'
import { useEffect, useState } from 'react'
import { postPerpetualPositionHistoryList } from '@/apis/assets/futures/position'
import { useMemoizedFn, useMount, useUnmount } from 'ahooks'
import { useUserStore } from '@/store/user'
import { ClosePositionHistory } from '@/plugins/ws/protobuf/ts/proto/ClosePositionHistory'
import { HistoryPositionList } from './history-position-list'

export function FutureHistoryPositionTrade() {
  const userStore = useUserStore()
  const {
    isLogin,
    userInfo: { isOpenContractStatus },
  } = userStore
  const [page, setPage] = useState({ pageNum: 1, pageSize: 20 })
  const { futuresPosition, updateFuturesPosition, fetchFuturesEnums } = useAssetsFuturesStore() || {}
  const { historyForm, historyPositionList, wsClosePositionHistorySubscribe, wsClosePositionHistoryUnSubscribe } =
    futuresPosition || {}

  useMount(() => {
    if (!isLogin || !isOpenContractStatus) return
    fetchFuturesEnums()
  })

  const onLoadHistory = async (isRefresh?: boolean, pageObj?) => {
    const res = await postPerpetualPositionHistoryList({
      ...historyForm,
      symbol: historyForm.tradeInfo?.symbolName || '',
      pageNum: pageObj?.pageNum || page.pageNum,
      pageSize: pageObj?.pageSize || page.pageSize,
    })

    const { isOk, data } = res || {}
    if (!isOk || !data) {
      updateFuturesPosition({ historyFinished: true })
    }

    const nList = isRefresh ? data?.list : [...historyPositionList]
    updateFuturesPosition({ historyPositionList: nList, historyPositionTotal: data?.total })
  }

  /** 翻页事件 */
  const setPageFn = async pageObj => {
    setPage(pageObj)
    onLoadHistory(true, pageObj)
  }

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
      onLoadHistory(true)
  })

  useEffect(() => {
    if (!isLogin || !isOpenContractStatus) {
      updateFuturesPosition(defaultFuturesPosition)
      return
    }

    onLoadHistory(true)
    wsClosePositionHistorySubscribe(onClosePositionHistoryWsCallBack)
  }, [isLogin, isOpenContractStatus])

  useUnmount(() => {
    updateFuturesPosition(defaultFuturesPosition)
    wsClosePositionHistoryUnSubscribe(onClosePositionHistoryWsCallBack)
  })

  return <HistoryPositionList page={page} setPage={setPageFn} />
}
