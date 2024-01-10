import { mergeOptionTradePairWithWsDataById, mergeTradePairWithWsDataByWassName } from '@/helper/market/market-list'
import { useDeepCompareEffect, useSafeState, useUpdateEffect } from 'ahooks'
import {
  wsContractTradePairSubSlow,
  wsFuturesMarketCommonSub,
  wsOptionMarketCommonSub,
  wsSpotMarketCommonSub,
  wsSpotTradePairSubSlow,
} from '@/helper/market/market-list/market-ws'
import { useEffect } from 'react'
import ws from '@/plugins/ws'
import futuresWs from '@/plugins/ws/futures'
import { WsThrottleTimeEnum } from '@/constants/ws'
import optionWs from '@/plugins/ws/option'
import { Options_Option } from '@/plugins/ws/protobuf/ts/proto/Options'
import { isEmpty } from 'lodash'
import { useWsMultiSub } from '../use-ws-sub'

export const getWsMarketTradePairBySub = (subscription, ws, intervalTime, shouldMergeTradePair) => {
  return ({ apiData }: { apiData: any }) => {
    const [resolvedData, setResolvedData] = useSafeState<any>(apiData)
    const wsData: any = useWsMultiSub({ apiData, sub: subscription, ws, intervalTime })
    useEffect(() => {
      setResolvedData(apiData)
    }, [apiData])

    useUpdateEffect(() => {
      if (isEmpty(wsData)) return
      if (!shouldMergeTradePair) {
        setResolvedData(wsData)
        return
      }

      // merge trade pair list
      if ((wsData as unknown as Options_Option)?.[0]?.optionId)
        setResolvedData(mergeOptionTradePairWithWsDataById(resolvedData, wsData) as any)
      else setResolvedData(mergeTradePairWithWsDataByWassName(resolvedData || [], wsData))
    }, [wsData])

    return resolvedData || []
  }
}

/**
 * 现货单个币对的行情订阅，支持多个币对传参
 */
export const useWsSpotMarketTradePairRealTime = getWsMarketTradePairBySub(
  wsSpotMarketCommonSub,
  ws,
  WsThrottleTimeEnum.Market,
  true
)
export const useWsFuturesMarketTradePairRealTime = getWsMarketTradePairBySub(
  wsFuturesMarketCommonSub,
  futuresWs,
  WsThrottleTimeEnum.Market,
  true
)
export const useWsTernaryOptionMarketTradePairRealTime = getWsMarketTradePairBySub(
  wsOptionMarketCommonSub,
  optionWs,
  WsThrottleTimeEnum.Market,
  true
)

/**
 * 现货单个币对的行情订阅，支持多个币对传参
 */
export const useWsSpotPairRealTime = getWsMarketTradePairBySub(
  wsSpotMarketCommonSub,
  ws,
  WsThrottleTimeEnum.Market,
  false
)
export const useWsFuturesPairtRealTime = getWsMarketTradePairBySub(
  wsFuturesMarketCommonSub,
  futuresWs,
  WsThrottleTimeEnum.Market,
  false
)
export const useWsTernaryOptionPairRealTime = getWsMarketTradePairBySub(
  wsOptionMarketCommonSub,
  optionWs,
  WsThrottleTimeEnum.Market,
  false
)

/**
 * 现货单个币对的行情慢速（2s）订阅，支持多个币对传参
 * 当前使用场景：首页币对信息 (热门、推荐、涨跌榜)，自选缺省推荐，历史选择币对
 */
export const useWsSpotMarketTradePairSlow = getWsMarketTradePairBySub(
  wsSpotTradePairSubSlow,
  ws,
  WsThrottleTimeEnum.Slower,
  true
)
export const useWsFuturesMarketTradePairSlow = getWsMarketTradePairBySub(
  wsContractTradePairSubSlow,
  futuresWs,
  WsThrottleTimeEnum.Slower,
  true
)

export const useWsMarketTradePairByType = (subscription, ws, time: WsThrottleTimeEnum) =>
  getWsMarketTradePairBySub(subscription, ws, time, true)
