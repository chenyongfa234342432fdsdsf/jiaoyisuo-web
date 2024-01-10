import { mergeOptionTradePairWithWsDataById, mergeTradePairWithWsDataByWassName } from '@/helper/market/market-list'
import { useEffect } from 'react'
import { useSafeState, useUpdateEffect } from 'ahooks'
import { TradePairs_TradePair } from '@/plugins/ws/protobuf/ts/proto/TradePairs'
import { isEmpty } from 'lodash'
import {
  wsContractTradePairSubFullAmount,
  wsOptionTradePairSubFullAmount,
  wsSpotTradePairSubFullAmount,
} from '@/helper/market/market-list/market-ws'
import ws from '@/plugins/ws'
import futuresWs from '@/plugins/ws/futures'
import { Options_Option } from '@/plugins/ws/protobuf/ts/proto/Options'
import optionWs from '@/plugins/ws/option'
import { useWsSingleSubByBizId } from '../use-ws-sub'

const getWsMarketTradeBySub = (subscription, ws) => {
  return ({ apiData }) => {
    const wsData = useWsSingleSubByBizId({ apiData, sub: subscription, ws }) as (
      | Options_Option
      | TradePairs_TradePair
    )[]
    const [resolvedData, setResolvedData] = useSafeState([])

    useEffect(() => {
      setResolvedData(apiData || [])
    }, [apiData])

    useUpdateEffect(() => {
      if (isEmpty(wsData)) return

      if ((wsData as unknown as Options_Option)?.[0]?.optionId)
        setResolvedData(mergeOptionTradePairWithWsDataById(resolvedData, wsData) as any)
      else setResolvedData((mergeTradePairWithWsDataByWassName(resolvedData as any, wsData || []) || []) as any)
    }, [wsData])

    return resolvedData || []
  }
}
export const useWsSpotMarketTradePairFullAmount = getWsMarketTradeBySub(wsSpotTradePairSubFullAmount, ws)
export const useWsFuturesMarketTradePairFullAmount = getWsMarketTradeBySub(wsContractTradePairSubFullAmount, futuresWs)
export const useWsTernaryMarketTradePairFullAmount = getWsMarketTradeBySub(wsOptionTradePairSubFullAmount, optionWs)
