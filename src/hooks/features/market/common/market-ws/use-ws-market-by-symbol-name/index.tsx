import {
  useWsSpotPairRealTime,
  useWsTernaryOptionPairRealTime,
  useWsFuturesPairtRealTime,
} from '@/hooks/features/market/common/market-ws/use-ws-market-trade-pair'
import { useMarketStore } from '@/store/market'
import { useContractMarketStore } from '@/store/market/contract'
import { useTernaryOptionStore } from '@/store/ternary-option'
import { YapiGetV1OptionTradePairListData } from '@/typings/yapi/OptionTradePairListV1GetApi'
import { YapiGetV1TradePairListData } from '@/typings/yapi/TradePairListV1GetApi'
import { KLineChartType } from '@nbit/chart-utils'
import { isEmpty } from 'lodash'
import { useState, useEffect } from 'react'

type IProps = {
  symbolName: string
  symbolType: KLineChartType
}

/**
 * 根据 symbolName, 查找币对信息并订阅行情实时数据
 * @param symbolName 币对名称
 * @param symbolType 币对类型
 * @param wsType 行情订阅类型
 * @return 单个币对订阅数据
 * 需要提前加载所有币对信息
 */
export function useWsMarketBySymbolName({ symbolName, symbolType }: IProps) {
  const useStore = getStoreByType(symbolType)
  const useWsTradepair = getWsTradePairByType(symbolType)

  const allTradePairs = useStore().allTradePairs as (YapiGetV1TradePairListData | YapiGetV1OptionTradePairListData)[]
  const [apiData, setApiData] = useState<(YapiGetV1TradePairListData | YapiGetV1OptionTradePairListData)[]>([])

  useEffect(() => {
    if (!symbolName) return
    if (isEmpty(allTradePairs)) return

    const coin = allTradePairs.find(x => {
      if (symbolType === KLineChartType.Ternary) return (x as YapiGetV1OptionTradePairListData)?.symbol === symbolName
      return (x as YapiGetV1TradePairListData).symbolName === symbolName
    })

    if (!coin) {
      setApiData([])
      return
    }
    if (apiData[0] && apiData[0].id === coin.id) return
    setApiData([coin])
  }, [symbolName, allTradePairs])

  const data = useWsTradepair({ apiData })[0] || {}
  return data
}

function getWsTradePairByType(type: KLineChartType) {
  switch (type) {
    case KLineChartType.Quote:
      return useWsSpotPairRealTime
    case KLineChartType.Ternary:
      return useWsTernaryOptionPairRealTime
    default:
      return useWsFuturesPairtRealTime
  }
}

function getStoreByType(type: KLineChartType) {
  switch (type) {
    case KLineChartType.Quote:
      return useMarketStore
    case KLineChartType.Ternary:
      return useTernaryOptionStore
    default:
      return useContractMarketStore
  }
}
