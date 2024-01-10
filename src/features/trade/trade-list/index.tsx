import Tabs from '@/components/tabs'
import { TradeActivityList } from '@/features/market/market-activity/trade-activity-list'
import { t } from '@lingui/macro'
import classNames from 'classnames'
import { useState } from 'react'
import { usePageContext } from '@/hooks/use-page-context'
import TradeOrderBook from '@/features/order-book/trade'
import { TradeListLayout } from './base'
import styles from './index.module.css'

enum TabsTitle {
  /**
   * 最新成交
   */
  latestTransaction = 'latestTransaction',
  /**
   * 我的成交
   */
  realTimeTransaction = 'realTimeTransaction',
  /**
   * 行情异动
   */
  marketFluctuation = 'marketFluctuation',
  /**
   * 买卖盘
   */
  dealDish = 'dealDish',
}
interface OrderBookPropsList {
  /**
   * price 价格
   * total 合计
   * direction 方向 (买或者卖)
   * amount 数量
   */
  onSelectPrice?: (price: string, total: string, direction: number, amount: string) => void
  width?: number | string
  tradeMode?: string
  standard?: boolean // 标准布局的买卖盘
  marketMovements?: boolean // 行情异动
  leftOrRightLayout?: boolean // 左右布局
  newMy?: boolean // 最新和我的
  className?: string
}
/** 交易页面实时成交 */
function TradeList(props: OrderBookPropsList) {
  const { onSelectPrice, tradeMode, standard, marketMovements, leftOrRightLayout, newMy, className } = props
  let selectedTabDef // 控制组件的显示

  if (standard || leftOrRightLayout) {
    selectedTabDef = TabsTitle.dealDish
  }
  if (marketMovements) {
    selectedTabDef = TabsTitle.marketFluctuation
  }
  if (newMy) {
    selectedTabDef = TabsTitle.latestTransaction
  }
  const [selectedTab, setSelectedTab] = useState(selectedTabDef)

  const pageContext = usePageContext()

  const { pathname } = pageContext.urlParsed

  const setChangeSubs = pathname => {
    const pathnameArr = pathname?.split('/')
    return pathnameArr?.[pathnameArr.length - 2]
  }

  const tabs = [
    {
      title: t`OrderBook`,
      content: <TradeOrderBook onSelectPrice={onSelectPrice!} tradeMode={tradeMode!} />,
      id: TabsTitle.dealDish,
    },
    {
      title: t`features/trade/trade-list/base-0`,
      content: <TradeListLayout id={selectedTab} />,
      id: TabsTitle.latestTransaction,
    },
    {
      title: t`features_trade_trade_deal_tradedeal_5101192`,
      content: <TradeListLayout id={selectedTab} />,
      id: TabsTitle.realTimeTransaction,
    },

    {
      title: t`features_market_market_time_axis_index_2523`,
      content: <TradeActivityList />,
      id: TabsTitle.marketFluctuation,
    },
  ]
  const tabsFilter = tabs.filter((item, index) => {
    if (standard) {
      if (item.id === TabsTitle.dealDish) {
        return item
      }
    }
    if (marketMovements) {
      if (item.id === TabsTitle.marketFluctuation) {
        return item
      }
    }
    if (newMy) {
      if (item.id === TabsTitle.latestTransaction || item.id === TabsTitle.realTimeTransaction) {
        return item
      }
    }
    if (leftOrRightLayout) {
      if (item.id !== TabsTitle.marketFluctuation) {
        return item
      }
    }

    return null
  })
  const showTab =
    setChangeSubs(pathname) === 'futures'
      ? tabsFilter.filter(item => item.id === TabsTitle.latestTransaction)
      : tabsFilter
  const onTabChange = (item: typeof tabsFilter[0]) => {
    setSelectedTab(item.id)
  }
  let tabsLine = true // 控制tabs下标的显示
  if (showTab.length === 1) {
    tabsLine = false
  }
  return (
    <div className={styles['trade-list-outer-layout-wrapper']}>
      <div className={classNames('header-tabs-wrapper', className)}>
        <Tabs
          tabList={showTab}
          classNames="header-tabs"
          value={selectedTab}
          idMap="id"
          onChange={onTabChange}
          mode={tabsLine ? 'line' : 'text'}
        />
      </div>
      <div className="content-wrapper">
        {showTab?.map(tab => {
          return (
            <div
              key={tab.id}
              className={classNames('content-wrapper-container', {
                hidden: selectedTab !== tab.id,
              })}
            >
              {selectedTab === tab.id && tab.content}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TradeList
