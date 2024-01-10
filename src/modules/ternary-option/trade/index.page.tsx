import React, { useEffect } from 'react'
import TradeForm from '@/features/ternary-option/trade-form'
import AsyncSuspense from '@/components/async-suspense'
import { useTradeStore } from '@/store/trade'
import { TernaryOptionTab } from '@/features/ternary-option/ternary-option-tab'
import { initCurrentCoin } from '@/constants/market'
import ErrorBoundary from '@/components/error-boundary'
import classNames from 'classnames'
import { KLineChartType } from '@nbit/chart-utils'
import { useUserStore } from '@/store/user'
import { useMount } from 'react-use'
import { getFuturesCurrencySettings } from '@/helper/assets/futures'
import { t } from '@lingui/macro'
import { useFuturesStore } from '@/store/futures'
import { generateTradeDefaultSeoMeta } from '@/helper/trade'
import { usePageContext } from '@/hooks/use-page-context'
import { checkUrlIdAndLink } from '@/helper/common'

import TradeHeader from '@/features/ternary-option/trade-header'
import { MarketTernaryHooksWrapper } from '@/hooks/features/market/market-list/market-ternary-hooks-wrapper'
import { useTernaryOptionStore } from '@/store/ternary-option'
import Styles from './index.module.css'

const Chart = React.lazy(() => import('@/components/chart/ternary-chart'))

function Page() {
  /** 使用合约 store */

  const ternaryState = useTernaryOptionStore()
  const { updateCurrentCoin } = ternaryState
  const TradeStore = useTradeStore()
  const pageContext = usePageContext()

  const { isLogin, updatePreferenceAndUserInfoData } = useUserStore()

  const id = pageContext.routeParams.id
  const reg = /[a-z]+/

  checkUrlIdAndLink(reg, id, pageContext)

  useMount(() => {
    if (isLogin) {
      // 获取商户法币设置信息
      getFuturesCurrencySettings()
      updatePreferenceAndUserInfoData()
    }
  })

  const { layout } = TradeStore

  useEffect(() => {
    return () => {
      /** 当通过路由跳转到其它页面时，需要清空当前币对信息，当用户从行情列表或者其它地方选择另外一个币对重新进入交易页面，这里不做清空，会导致 bug */
      updateCurrentCoin(initCurrentCoin)
    }
  }, [])

  if (reg.test(id)) {
    return <div></div>
  }

  return (
    <div className={classNames(Styles.scoped, layout.tradeFormPosition, `scrollbar-custom`)}>
      <MarketTernaryHooksWrapper />
      <div className="header-wrap">
        <TradeHeader type={KLineChartType.Ternary} />
      </div>

      <div className="chart-wrap">
        {/* 容错处理，币种切换 */}
        <AsyncSuspense hasLoading>
          <ErrorBoundary>
            <div className="flex flex-row justify-center w-full h-full">
              <Chart />
            </div>
          </ErrorBoundary>
        </AsyncSuspense>
      </div>

      <div className="order-wrap">
        <TernaryOptionTab />
      </div>
      <div className="trade-side-wrapper !bg-bg_color">
        <div className="trade-form-wrap">
          <TradeForm />
        </div>
      </div>
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
      documentProps: generateTradeDefaultSeoMeta(
        { title: `${symbol} | ${t`features_trade_trade_header_pop_menu_index_pweylulaexiyla3oov_3y`}` },
        values
      ),
    },
  }
}
