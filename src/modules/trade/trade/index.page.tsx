import React, { useEffect, useRef } from 'react'
import TradeForm from '@/features/trade/spot'
import TradeHeader from '@/features/trade/trade-header'
import TradeList from '@/features/trade/trade-list'
import TradeSpotOrderBook from '@/features/order-book/trade'
import TradeOrder from '@/features/trade/trade-order'
import AsyncSuspense from '@/components/async-suspense'
import { useTradeStore } from '@/store/trade'
import { useMarketStore } from '@/store/market'
import RealTimeDescribe from '@/features/market/real-time-describe'
import TransactionBulletinBoard from '@/features/announcement/bulletin-board'
import { initCurrentCoin, initDescribe, MarketCoinTab } from '@/constants/market'
import ErrorBoundary from '@/components/error-boundary'
import classNames from 'classnames'
import { TradeLayoutEnum, TradeModeEnum, TradeOrderTypesEnum } from '@/constants/trade'
import { KLineChartType } from '@nbit/chart-utils'
import { Spin } from '@nbit/arco'
import { MarketSpotHooksWrapper } from '@/hooks/features/market/market-list/market-spot-hooks-wrapper'
import { t } from '@lingui/macro'
import { generateTradeDefaultSeoMeta } from '@/helper/trade'
import { getMergeModeStatus } from '@/features/user/utils/common'
import { ITradeRef } from '@/features/trade/futures'
import { usePageContext } from '@/hooks/use-page-context'
import { checkUrlIdAndLink } from '@/helper/common'
import { useResponsive } from 'ahooks'
import { MarketListSpotTradeNewLayout } from '@/features/market/market-list/market-list-trade-layout'
import { MarketHistoryBottomBar } from '@/features/market/market-history-select'
import { MarketLisModulesEnum } from '@/constants/market/market-list'
import KlineDescribeTab from '@/features/market/kline-describe-tab'
import Styles from './index.module.css'

function Page() {
  const marketState = useMarketStore()

  const { updateCurrentInitPrice, updateCurrentCoin, updateCurrentCoinDescribe } = marketState

  const TradeStore = useTradeStore()
  const tradeRef = useRef<ITradeRef>(null)
  const pageContext = usePageContext()

  const { layout } = TradeStore
  const isMergeMode = getMergeModeStatus()

  const id = pageContext.routeParams.id
  const reg = /[a-z]+/

  checkUrlIdAndLink(reg, id, pageContext)

  // 留给交易操作获取盘口某条数据价格的函数
  const handleSelectPrice = (price: string) => {
    if (price) {
      const queryType = pageContext.urlParsed.search?.type as TradeOrderTypesEnum
      if (queryType === TradeOrderTypesEnum.market || !queryType) {
        tradeRef.current?.onTradeOrderTypeChange({ id: TradeOrderTypesEnum.limit })
      }
      updateCurrentInitPrice({
        buyPrice: price,
        sellPrice: price,
      })
    }
  }

  const isDefault = layout.tradeFormPosition === TradeLayoutEnum.default
  const size = useResponsive()
  useEffect(() => {
    return () => {
      /** 当通过路由跳转到其它页面时，需要清空当前币对信息，当用户从行情列表或者其它地方选择另外一个币对重新进入交易页面，这里不做清空，会导致 bug */
      updateCurrentCoin(initCurrentCoin)
      updateCurrentCoinDescribe(initDescribe)
    }
  }, [])

  if (reg.test(id)) {
    return <div></div>
  }

  return (
    <div
      className={classNames(
        {
          [Styles.xxxlscoped]: size?.xxxl,
          [Styles.xxlscoped]: size?.xxl,
          [Styles.scoped]: !size?.xxxl && !size?.xxl,
        },
        Styles.common,
        layout.tradeFormPosition,
        `scrollbar-custom`
      )}
    >
      <MarketSpotHooksWrapper />
      <div className="header-wrap">
        <TradeHeader type={KLineChartType.Quote} />
      </div>
      {!isMergeMode && (
        <div className={`announcements-wrap ${layout.announcementShow ? 'block' : 'hidden'}`}>
          <TransactionBulletinBoard />
        </div>
      )}
      {/* <div className="market-detail-wrap">
        <RealTimeQuote />
      </div> */}

      {isDefault ? (
        <div className="market-wrap">
          <MarketListSpotTradeNewLayout />
        </div>
      ) : null}

      <div className="search-history-wrap">
        <MarketHistoryBottomBar />
      </div>

      {/* 行情异动 */}
      <div className="market-change-wrap">
        {/* 删除其他代码 */}
        <TradeList marketMovements className="market-movements-height" />
      </div>
      <div className="chart-wrap">
        <KlineDescribeTab />
      </div>
      {/* <div className="market-select-history-wrap">
        <MarkHistoryList storeType={MarketLisModulesEnum.spotMarketsTrade} />
      </div> */}
      <div className="order-wrap">
        <TradeOrder />
      </div>
      {/* 小屏盘口成交合二为一 */}
      {!isDefault || !size?.xxl ? (
        <div className="orderbook-wrap">
          <TradeList
            onSelectPrice={handleSelectPrice}
            tradeMode={TradeModeEnum.spot}
            leftOrRightLayout={!isDefault}
            standard={isDefault}
            className={classNames(isDefault ? null : 'trade-page-new')}
          />
        </div>
      ) : (
        <>
          <div className="orderbook-wrap">
            <TradeList
              onSelectPrice={handleSelectPrice}
              tradeMode={TradeModeEnum.spot}
              leftOrRightLayout={!isDefault}
              standard={isDefault}
              className={classNames(isDefault ? null : 'trade-page-new')}
            />
          </div>
          <div className="trade-list-wrap">
            <TradeList newMy className="trade-page-new" />
          </div>
        </>
      )}

      <div className="trade-form-wrap">
        <TradeForm ref={tradeRef} isSide={!isDefault} />
      </div>
    </div>
  )
}

export { Page }

export { onBeforeRender }

async function onBeforeRender(pageContext: PageContext) {
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
      documentProps: generateTradeDefaultSeoMeta({ title: `${symbol} | ${t`trade.type.coin`}` }, values),
    },
  }
}
