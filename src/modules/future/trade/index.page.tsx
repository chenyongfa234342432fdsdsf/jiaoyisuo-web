import React, { useEffect, useRef } from 'react'
import type { ITradeRef } from '@/features/trade/futures'
import AsyncSuspense from '@/components/async-suspense'
import TradeHeader from '@/features/trade/trade-header'
import { useTradeStore } from '@/store/trade'
import { useContractMarketStore } from '@/store/market/contract'
import { initCurrentCoin, initDescribe, MarketCoinTab } from '@/constants/market'
import ErrorBoundary from '@/components/error-boundary'
import classNames from 'classnames'
import { TradeLayoutEnum, TradeModeEnum, TradeOrderTypesEnum } from '@/constants/trade'
import { MarketLisModulesEnum } from '@/constants/market/market-list'
import { KLineChartType } from '@nbit/chart-utils'
import { useUserStore } from '@/store/user'
import { useMount } from 'react-use'
import { getFuturesCurrencySettings } from '@/helper/assets/futures'
import { t } from '@lingui/macro'
import { Spin } from '@nbit/arco'
import { link } from '@/helper/link'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import { FuturesPositionViewTypeEnum } from '@/constants/assets/futures'
import { FuturesGuideIdStepsEnum, fixedNodeGuideIdIntroList } from '@/constants/future/trade'
import { MarketFuturesHooksWrapper } from '@/hooks/features/market/market-list/market-futures-hooks-wrapper'
import { useFuturesStore } from '@/store/futures'
import { generateTradeDefaultSeoMeta } from '@/helper/trade'
import { getMergeModeStatus } from '@/features/user/utils/common'
import { usePageContext } from '@/hooks/use-page-context'
import { checkUrlIdAndLink } from '@/helper/common'
import Styles from './index.module.css'

const TransactionBulletinBoard = React.lazy(() => import('@/features/announcement/bulletin-board'))
const RealTimeDescribe = React.lazy(() => import('@/features/market/real-time-describe'))
const MarkHistoryList = React.lazy(() => import('@/features/market/market-history-select'))
const FutureTradeOrder = React.lazy(() => import('@/features/trade/trade-order/future'))
const TradeContractOrderBook = React.lazy(() => import('@/features/order-book/trade'))
const TradeList = React.lazy(() => import('@/features/trade/trade-list'))
const TradeForm = React.lazy(() => import('@/features/trade/futures'))
const FuturesIntro = React.lazy(() => import('@/features/trade/futures/futures-intro'))
const Chart = React.lazy(() => import('@/components/chart'))

function Page() {
  /** 使用合约 store */
  const marketState = useContractMarketStore()
  const TradeStore = useTradeStore()
  const isMergeMode = getMergeModeStatus()
  const tradeRef = useRef<ITradeRef>(null)
  const introRef = useRef<any>(null)
  const pageContext = usePageContext()
  const {
    setIsClickOrderBook,
    isFutureShow,
    currentIntroId,
    futureEnabled,
    readyCallIntroId,
    setIsFutureShow,
    setFutureEnabled,
    setCurrentIntroId,
    resetIntroEnabled,
    setReadyCallIntroId,
  } = useFuturesStore()
  const { isLogin, updatePreferenceAndUserInfoData } = useUserStore()
  const assetsFuturesStore = useAssetsFuturesStore()
  const { futuresGroupList, updateAssetsFuturesSetting } = {
    ...assetsFuturesStore,
  }

  /** 合约引导 */
  const onFuturesIntroBeforeChange = (num: number) => {
    if (fixedNodeGuideIdIntroList.includes(num)) {
      introRef?.current?.updateStepElement?.(num)
    }
    if (num === FuturesGuideIdStepsEnum.fixedNode - 1) {
      updateAssetsFuturesSetting({ positionViewType: FuturesPositionViewTypeEnum.position })
    }
    if (num === FuturesGuideIdStepsEnum.jump - 1) {
      updateAssetsFuturesSetting({ positionViewType: FuturesPositionViewTypeEnum.account })
    }
    if (num === FuturesGuideIdStepsEnum.show) {
      setFutureEnabled(false)
      const assetsId = futuresGroupList?.[FuturesGuideIdStepsEnum.none]?.groupId
      link(`/assets/futures/detail/${assetsId}`)
      setCurrentIntroId(FuturesGuideIdStepsEnum.show)
      return false
    }
  }
  const onCloseFuturesIntro = () => {
    setFutureEnabled(false)
  }
  const onFuturesIntroRef = refs => {
    introRef.current = refs
  }

  const id = pageContext.routeParams.id
  const reg = /[a-z]+/

  checkUrlIdAndLink(reg, id, pageContext)

  useMount(() => {
    // 获取商户法币设置信息
    getFuturesCurrencySettings()
    if (isLogin) {
      updatePreferenceAndUserInfoData()
    }
  })

  const { layout } = TradeStore

  // 留给交易操作获取盘口某条数据价格的函数
  const handleSelectPrice = (price: string, total, direction, amount) => {
    if (!Number.isNaN(Number(price))) {
      const queryType = pageContext.urlParsed.search?.type as TradeOrderTypesEnum
      if (queryType === TradeOrderTypesEnum.market || !queryType) {
        tradeRef.current?.onTradeOrderTypeChange({ id: TradeOrderTypesEnum.limit })
      }
      setIsClickOrderBook(true)
      marketState.updateCurrentInitPrice({
        buyPrice: price,
        sellPrice: price,
        total,
      })
    }
  }

  const isDefault = layout.tradeFormPosition === TradeLayoutEnum.default

  useEffect(() => {
    /** 合约资产点击跳转调用* */
    if (isFutureShow) {
      resetIntroEnabled()
      setIsFutureShow(false)
    } else {
      setFutureEnabled(false)
    }
    return () => {
      /** 当通过路由跳转到其它页面时，需要清空当前币对信息，当用户从行情列表或者其它地方选择另外一个币对重新进入交易页面，这里不做清空，会导致 bug */
      marketState.updateCurrentCoin(initCurrentCoin)
      marketState.updateCurrentCoinDescribe(initDescribe)
    }
  }, [])

  useEffect(() => {
    if (readyCallIntroId) {
      resetIntroEnabled()
      setReadyCallIntroId(false)
    }
  }, [readyCallIntroId])

  if (reg.test(id)) {
    return <div></div>
  }

  return (
    <div className={classNames(Styles.scoped, layout.tradeFormPosition, `scrollbar-custom`)}>
      <MarketFuturesHooksWrapper />
      <div className="header-wrap">
        <ErrorBoundary>
          <TradeHeader type={KLineChartType.Futures} />
        </ErrorBoundary>
      </div>
      {!isMergeMode && (
        <div className={`announcements-wrap ${layout.announcementShow ? 'block' : 'hidden'}`}>
          <AsyncSuspense>
            <ErrorBoundary>
              <TransactionBulletinBoard />
            </ErrorBoundary>
          </AsyncSuspense>
        </div>
      )}
      {/* <div className="market-detail-wrap">
        <RealTimeQuote />
      </div> */}

      <div className="chart-wrap">
        {/* 容错处理，币种切换 */}
        {marketState.currentMarketCoinTab === MarketCoinTab.Kline ? (
          // marketState.currentCoin.id ? (
          <AsyncSuspense hasLoading>
            <ErrorBoundary>
              <Chart type={KLineChartType.Futures} />
            </ErrorBoundary>
          </AsyncSuspense>
        ) : // ) : null
        marketState.currentCoin.symbolName ? (
          <AsyncSuspense>
            <ErrorBoundary>
              <RealTimeDescribe type={KLineChartType.Futures} />
            </ErrorBoundary>
          </AsyncSuspense>
        ) : (
          <Spin />
        )}
      </div>

      <div className="market-select-history-wrap">
        <AsyncSuspense>
          <ErrorBoundary>
            <MarkHistoryList storeType={MarketLisModulesEnum.futuresMarketsTrade} />
          </ErrorBoundary>
        </AsyncSuspense>
      </div>
      <div className="order-wrap">
        <AsyncSuspense>
          <ErrorBoundary>
            <FutureTradeOrder />
          </ErrorBoundary>
        </AsyncSuspense>
      </div>
      {isDefault ? (
        <>
          <div className="orderbook-wrap">
            <AsyncSuspense>
              <ErrorBoundary>
                <TradeContractOrderBook onSelectPrice={handleSelectPrice} tradeMode={TradeModeEnum.futures} />
              </ErrorBoundary>
            </AsyncSuspense>
          </div>
          <div className="trade-list-wrap">
            <AsyncSuspense>
              <ErrorBoundary>
                <TradeList newMy />
              </ErrorBoundary>
            </AsyncSuspense>
          </div>
          <div className="trade-form-wrap">
            <AsyncSuspense>
              <ErrorBoundary>
                <TradeForm ref={tradeRef} />
              </ErrorBoundary>
            </AsyncSuspense>
          </div>
        </>
      ) : (
        <>
          <div className="trade-side-wrapper">
            <div className="trade-form-wrap">
              <AsyncSuspense>
                <ErrorBoundary>
                  <TradeForm isSide ref={tradeRef} />
                </ErrorBoundary>
              </AsyncSuspense>
            </div>
            <div className="trade-assets-wrap">{/* <TradePairAssets /> */}</div>
          </div>
          <div className="orderbook-side-wrapper">
            <div className="orderbook-wrap">
              <AsyncSuspense>
                <ErrorBoundary>
                  <TradeContractOrderBook onSelectPrice={handleSelectPrice} tradeMode={TradeModeEnum.futures} />
                </ErrorBoundary>
              </AsyncSuspense>
            </div>
            <div className="trade-list-wrap">
              <AsyncSuspense>
                <ErrorBoundary>
                  <TradeList newMy />
                </ErrorBoundary>
              </AsyncSuspense>
            </div>
          </div>
        </>
      )}
      {currentIntroId < FuturesGuideIdStepsEnum.show && futureEnabled && (
        <AsyncSuspense>
          <ErrorBoundary>
            <FuturesIntro
              visible={futureEnabled}
              onExit={onCloseFuturesIntro}
              onIntroRef={onFuturesIntroRef}
              onIntroBeforeChange={onFuturesIntroBeforeChange}
            />
          </ErrorBoundary>
        </AsyncSuspense>
      )}
    </div>
  )
}

export { Page }

export async function onBeforeRender(pageContext: PageContext) {
  const pageProps = {}
  const layoutParams: LayoutParams = {
    fullScreen: true,
  }

  const id = pageContext.routeParams.id

  let symbol = id
  const values = {
    symbol,
  }
  return {
    pageContext: {
      pageProps,
      layoutParams,
      documentProps: generateTradeDefaultSeoMeta({ title: `${symbol} | ${t`constants/trade-0`}` }, values),
    },
  }
}
