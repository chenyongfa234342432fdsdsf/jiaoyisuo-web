import { memo, useEffect, useRef } from 'react'
import { t } from '@lingui/macro'
import { IncreaseTag } from '@nbit/react'
import classNames from 'classnames'
import { translateUrlToParams, formatTradePair, getQuoteDisplayName } from '@/helper/market'
import CollectStar from '@/components/collect-star'
import { usePageContext } from '@/hooks/use-page-context'
import { WSThrottleTypeEnum } from '@/plugins/ws/constants'
import { YapiGetV1TradePairDetailData } from '@/typings/yapi/TradePairDetailV1GetApi'
import { WsThrottleTimeEnum } from '@/constants/ws'
import { useMarketListStore } from '@/store/market/market-list'
import { usePrevious, useSafeState } from 'ahooks'
import { KLineChartType } from '@nbit/chart-utils'
import { MarketLisModulesEnum } from '@/constants/market/market-list'

import { Spin } from '@nbit/arco'
import { MarketSectorBadage } from '@/features/market/real-time-quote/market-sector-badage'
import { OrderBookOptionMarketSubs } from '@/store/order-book/common'
import { useTernaryOptionStore } from '@/store/ternary-option'
import { getV1OptionTradePairDetailApiRequest } from '@/apis/ternary-option'
import optionWs from '@/plugins/ws/option'

import DealyTime from './delay-time'
import Styles from './index.module.css'
import { initCurrentCoin } from '../../../constants/market/index'
import { MarketListActiveTradeLayout } from '../market-list/market-list-trade-layout'

function RealTimeQuote() {
  let currentModule

  const pageContext = usePageContext()
  const ternryOptionState = useTernaryOptionStore()

  const ws = optionWs
  const marketTradeStore = useMarketListStore()[MarketLisModulesEnum.futuresMarketsTrade]

  const symbolName = translateUrlToParams(pageContext.routeParams.id)
  const tempRef = useRef<any>()

  const controlRef = useRef<boolean>(true)
  currentModule = ternryOptionState

  // 获取币对标题的位置
  const symboTitleRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!symboTitleRef.current) return
    marketTradeStore.setTradeAreaLeftOffset(symboTitleRef.current.getBoundingClientRect().x)
  }, [symboTitleRef.current])

  const MarketWs = {
    Sub: 1,
    UnSub: 0,
  }
  const [marketWs, setMarketWs] = useSafeState<number>(MarketWs.UnSub)
  // @ts-ignore

  useEffect(() => {
    setMarketWs(MarketWs.UnSub)
  }, [symbolName])

  useEffect(() => {
    const kLineCallback = data => {
      // 更新实时报价信息
      /** 如果页面已被销毁，就不设置值了，防止接口没有返回，页面已经切换了其它币种 */
      if (!controlRef.current) return

      if (data?.length) {
        currentModule.updateCurrentCoin({
          ...tempRef.current,
          chg: Number(data[0].chg).toFixed(2),
          close: data[0].close,
          high: data[0].high,
          last: data[0].last,
          low: data[0].low,
          open: data[0].open,
          volume: data[0].volume,
          quoteVolume: data[0].quoteVolume,
        })
      }
    }

    const subs = OrderBookOptionMarketSubs(tempRef.current?.symbol)

    console.log('subs', subs)
    if (marketWs === MarketWs.Sub) {
      ws.subscribe({
        subs,
        callback: kLineCallback,
        throttleType: WSThrottleTypeEnum.increment,
        throttleTime: WsThrottleTimeEnum.Fast,
      })
    }

    return () => {
      // if (klineWs === KlineWs.unSub) {
      ws.unsubscribe({
        subs,
        callback: kLineCallback,
      })
      // }
    }
  }, [marketWs])

  useEffect(() => {
    /** 进来的时候设置为 true */
    controlRef.current = true
    Promise.all([getV1OptionTradePairDetailApiRequest({ symbol: symbolName })]).then(([detailRes]) => {
      if (detailRes.isOk) {
        // @ts-ignore
        const { id } = detailRes.data as YapiGetV1TradePairDetailData

        /** 如果页面已被销毁，就不设置值了，防止接口没有返回，页面已经切换了其它币种 */
        if (!controlRef.current) return
        currentModule.updateCurrentCoin({
          ...currentModule.currentCoin,
          ...detailRes.data,
          symbolName: detailRes.data?.symbol,
        })
        tempRef.current = {
          ...currentModule.currentCoin,
          ...detailRes.data,
          symbolName: detailRes.data?.symbol,
        }

        if (tempRef.current?.id) {
          if (!controlRef.current) return
          setMarketWs(MarketWs.Sub)
        }
      }
    })
    return () => {
      controlRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolName])

  // 查看 state 里的 currentCoin 的信息是否健全，不健全的话从 allTradePairs 里面拿
  const coinData = currentModule.currentCoin.symbolName
    ? currentModule.currentCoin
    : currentModule.allTradePairs.find(x => x.symbolName === symbolName) || initCurrentCoin

  const prevLast = usePrevious(coinData.last)

  return (
    <div className={Styles.scoped}>
      {currentModule?.currentCoin?.symbolName ? (
        <>
          <div className="symbol-wrap">
            <CollectStar needWrap={false} {...(coinData as any)} />
            <div
              className="market-popover-wrap flex flex-row justify-start items-center"
              onFocus={() => marketTradeStore.setIsSearchPopoverVisible(true)}
              onMouseOver={() => marketTradeStore.setIsSearchPopoverVisible(true)}
              onMouseLeave={() => marketTradeStore.setIsSearchPopoverVisible(false)}
            >
              <div className="symbol-title" ref={symboTitleRef}>
                <span>{getQuoteDisplayName({ coin: coinData })}</span>
                <span className="full-name"> {t`assets.enum.tradeCoinType.perpetual`}</span>
              </div>
              <div className="market-icon">
                <MarketListActiveTradeLayout type={KLineChartType.Ternary} />
              </div>
            </div>

            <MarketSectorBadage type={KLineChartType.Ternary} coinData={coinData} />
            <div className="divide"></div>
          </div>
          <div className="price-wrap">
            <div className="col-price h-9 leading-9">
              <span className={classNames('last-price')}>
                {formatTradePair(coinData as any).ternaryOptionLastWithDiffTarget(prevLast as any)}
              </span>
            </div>

            <div className="col-price ml-8">
              <IncreaseTag delZero={false} hasPostfix digits={2} value={coinData.chg} />
            </div>

            <div className="col-price ml-8 text-buy_up_color">
              <DealyTime />
            </div>
          </div>
        </>
      ) : (
        <Spin />
      )}
    </div>
  )
}

export default memo(RealTimeQuote)
