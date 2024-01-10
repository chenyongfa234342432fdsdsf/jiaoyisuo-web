import React, { memo } from 'react'

import { useCommonStore } from '@/store/common'
import AsyncSuspense from '@/components/async-suspense'
import ErrorBoundary from '@/components/error-boundary'
import { KLineChartType } from '@nbit/chart-utils'
import { useMarketStore } from '@/store/market'
import { Spin } from '@nbit/arco'
import { MarketCoinTab } from '@/constants/market'
import { MarketLisModulesEnum } from '@/constants/market/market-list'
import Tabs from '@/components/tabs'
import { t } from '@lingui/macro'
import RealTimeDescribe from '../real-time-describe'
import styles from './index.module.css'

const Chart = React.lazy(() => import('@/components/chart'))

function KlineDescribeTab() {
  const marketState = useMarketStore()
  const onTabChange = item => {
    marketState.updateCurrentMarketCoinTab(item.id)
  }
  const tabList = [
    { title: t`features_market_market_history_select_index_2561`, id: MarketCoinTab.Kline },
    { title: t`features_market_market_history_select_index_2562`, id: MarketCoinTab.CoinDescribe },
  ]
  return (
    <div className={`${styles.scoped}`}>
      <div className="char-tab-wrapper">
        <Tabs
          classNames="chart-tab"
          mode="line"
          onChange={onTabChange}
          tabList={tabList}
          value={marketState.currentMarketCoinTab}
        />
      </div>
      <div className="w-full h-[1px] bg-line_color_02"></div>
      <div className="spot-chart-wrap">
        {marketState.currentMarketCoinTab === MarketCoinTab.Kline ? (
          <AsyncSuspense hasLoading>
            <ErrorBoundary>
              <Chart type={KLineChartType.Quote} />
            </ErrorBoundary>
          </AsyncSuspense>
        ) : marketState.currentCoin.symbolName ? (
          <RealTimeDescribe type={KLineChartType.Quote} />
        ) : (
          <Spin />
        )}
      </div>
    </div>
  )
}

export default KlineDescribeTab
