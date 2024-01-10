import Tabs from '@/components/tabs'
import { useEffect, useRef, useState } from 'react'
import { useUpdateEffect } from 'ahooks'
import { EntrustTypeEnum, geOrderTabTypeEnumName, OrderTabTypeEnum } from '@/constants/order'
import { enumValuesToOptions } from '@/helper/order'
import Link from '@/components/link'
import { useOrderCommonParams, useFutureOpenOrders } from '@/hooks/features/order'
import Icon from '@/components/icon'
import classNames from 'classnames'
import { t } from '@lingui/macro'
import { FutureFullBaseOrder } from '@/features/orders/composite/future-full'
import { getFutureOrderPagePath } from '@/helper/route'
import { useOrderFutureStore } from '@/store/order/future'
import { FuturesPositionList } from '@/features/assets/futures/common/position-list/futures-position-list'
import { TradeAssetsList } from '@/features/assets/futures/common/trade-future-assets/trade-assets-list'
import { FutureLeverInfo } from '@/features/orders/composite/future-lever-info'
import { useContractMarketStore } from '@/store/market/contract'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import { useUserStore } from '@/store/user'
import { useFuturesStore } from '@/store/futures'
import { UserFuturesTradeStatus } from '@/constants/user'
import { FutureHistoryPositionTrade } from '@/features/assets/futures/history-position/trade-history-position'
import { getFuturesHistoryPositionPageRoutePath } from '@/helper/route/assets'
import { FuturesPositionViewTypeEnum } from '@/constants/assets/futures'
import { FuturesAccountListView } from '@/features/assets/futures/account-list-view'
import { FuturesGuideIdEnum } from '@/constants/future/trade'
import AccountTypeSelect from '@/features/assets/futures/futures-detail/accout-type-select'
import { TRADE_ORDER_TAB_RIGHT_ID } from '@/constants/dom'
import styles from './index.module.css'
import { useTradeOrder } from './base'

/** 交易页面订单 */
export function FutureTradeOrder() {
  const currentId = useContractMarketStore().currentCoin?.id
  const { onlyCurrentSymbol, tableLayoutProps, checkOnlyCurrentSymbolNode } = useTradeOrder(
    t`features_trade_trade_order_future_xmsteurmbejlbirzyu1sh`
  )
  const { futureEnabled } = useFuturesStore()
  const { orderSettings } = useOrderFutureStore()
  const futureOrderHookResult = useFutureOpenOrders(undefined, currentId, onlyCurrentSymbol)
  const { entrustType, openTitle, displayNormalOrders, displayPlanOrders, disPlayStopLimitOrders } =
    futureOrderHookResult
  const tabs = enumValuesToOptions(
    [
      OrderTabTypeEnum.holdings,
      OrderTabTypeEnum.historyPosition,
      OrderTabTypeEnum.current,
      OrderTabTypeEnum.history,
      OrderTabTypeEnum.assets,
      OrderTabTypeEnum.leverInfo,
    ],
    geOrderTabTypeEnumName
  )
  const assetsFuturesStore = useAssetsFuturesStore()
  const {
    positionListFutures,
    futuresGroupList,
    updateAssetsFuturesSetting,
    assetsFuturesSetting: { positionViewType },
    futureAccountListSearchForm,
  } = {
    ...assetsFuturesStore,
  }
  const { accountType } = { ...futureAccountListSearchForm }

  const userStore = useUserStore()
  const {
    isLogin,
    userInfo: { isOpenContractStatus },
  } = userStore
  if (isLogin && isOpenContractStatus === UserFuturesTradeStatus.open) {
    // if (positionViewType === FuturesPositionViewTypeEnum.account) {
    //   tabs[0].label += `(${futuresGroupList.length || 0})`
    // } else {
    tabs[0].label += `(${positionListFutures.length || 0})`
    // }
    tabs[2].label = openTitle
  }
  const [orderTab, setOrderTab] = useState(orderSettings.defaultOrderTab as any)
  const onOrderTabChange = (item: typeof tabs[0]) => {
    setOrderTab(item.value)
    if (
      [
        OrderTabTypeEnum.holdings,
        OrderTabTypeEnum.historyPosition,
        OrderTabTypeEnum.current,
        OrderTabTypeEnum.history,
        OrderTabTypeEnum.assets,
      ].includes(item.value)
    ) {
      orderSettings.updateDefaultOrderTab(item.value)
    }
  }
  const [customParams, onCustomParamsChange] = useOrderCommonParams()

  useEffect(() => {
    /** 如果是新手引导状态，要将 tab 转为当前持仓* */
    if (futureEnabled) {
      setOrderTab(OrderTabTypeEnum.holdings)
      orderSettings.updateDefaultOrderTab(OrderTabTypeEnum.holdings)
    }
  }, [futureEnabled])

  useUpdateEffect(() => {
    onCustomParamsChange({
      tradeId: onlyCurrentSymbol ? (currentId as any) : undefined,
    })
  }, [onlyCurrentSymbol, currentId])

  let rightExtraNode
  if (orderTab === OrderTabTypeEnum.assets || orderTab === OrderTabTypeEnum.leverInfo) {
    rightExtraNode = null
  } else {
    rightExtraNode = (
      <div className="flex items-center mr-4">
        <div id={TRADE_ORDER_TAB_RIGHT_ID} className="flex items-center mr-4"></div>
        {orderTab === OrderTabTypeEnum.holdings && positionViewType === FuturesPositionViewTypeEnum.account && (
          <AccountTypeSelect isSearch accountType={accountType} />
        )}
        {orderTab === OrderTabTypeEnum.holdings && positionViewType === FuturesPositionViewTypeEnum.account
          ? null
          : checkOnlyCurrentSymbolNode}
        {orderTab === OrderTabTypeEnum.holdings && (
          <div className="ml-4 flex items-center" id={FuturesGuideIdEnum.accountMode}>
            <Icon
              name={positionViewType === FuturesPositionViewTypeEnum.account ? 'switch_icon_02' : 'switch_icon_01'}
              hasTheme
              className={`modal-icon`}
              onClick={() =>
                updateAssetsFuturesSetting({
                  positionViewType:
                    positionViewType === FuturesPositionViewTypeEnum.account
                      ? FuturesPositionViewTypeEnum.position
                      : FuturesPositionViewTypeEnum.account,
                })
              }
            />
          </div>
        )}
        <Link
          target
          href={
            orderTab === OrderTabTypeEnum.historyPosition || orderTab === OrderTabTypeEnum.holdings
              ? getFuturesHistoryPositionPageRoutePath()
              : getFutureOrderPagePath(
                  orderTab === OrderTabTypeEnum.holdings ? OrderTabTypeEnum.current : orderTab,
                  entrustType
                )
          }
          className="ml-4 flex items-center"
        >
          <Icon name="order_history" hasTheme />
        </Link>
      </div>
    )
  }
  const orders = [
    {
      tab: OrderTabTypeEnum.current,
      orders: displayNormalOrders,
      entrustType: EntrustTypeEnum.normal,
    },
    {
      tab: OrderTabTypeEnum.current,
      orders: displayPlanOrders,
      entrustType: EntrustTypeEnum.plan,
    },
    {
      tab: OrderTabTypeEnum.current,
      orders: disPlayStopLimitOrders,
      entrustType: EntrustTypeEnum.stopLimit,
    },
    {
      tab: OrderTabTypeEnum.history,
      entrustType: EntrustTypeEnum.normal,
    },
    {
      tab: OrderTabTypeEnum.history,
      entrustType: EntrustTypeEnum.plan,
    },
    {
      tab: OrderTabTypeEnum.history,
      entrustType: EntrustTypeEnum.stopLimit,
    },
  ]

  return (
    <div className={styles['trade-order-wrapper']}>
      <div className="tabs-wrapper">
        <Tabs
          extra={null}
          rightExtra={rightExtraNode}
          isScrollable
          mode="line"
          classNames="tabs-component"
          titleMap="label"
          idMap="value"
          onChange={onOrderTabChange}
          tabList={tabs}
          value={orderTab}
        />
      </div>
      <div
        className={classNames('content-wrapper', {
          'mb-2': orderTab === OrderTabTypeEnum.holdings,
        })}
      >
        {orders.map(item => {
          return (
            <FutureFullBaseOrder
              key={`${item.entrustType}${item.tab}`}
              orderTab={item.tab}
              entrustType={item.entrustType}
              orders={item.orders}
              futureOrderHookResult={futureOrderHookResult}
              tableLayoutProps={tableLayoutProps}
              commonParams={customParams}
              onCommonParamsChange={onCustomParamsChange}
              visible={orderTab === item.tab && entrustType === item.entrustType}
            />
          )
        })}
        <div
          className={classNames('h-full', {
            hidden: orderTab !== OrderTabTypeEnum.holdings,
          })}
        >
          {/* 切换为账户时也需要获取持仓数据 */}
          <FuturesPositionList isShow={positionViewType !== FuturesPositionViewTypeEnum.account} />
          {orderTab === OrderTabTypeEnum.holdings && positionViewType === FuturesPositionViewTypeEnum.account && (
            <FuturesAccountListView isActive />
          )}
        </div>
        <div
          className={classNames('h-full', {
            hidden: orderTab !== OrderTabTypeEnum.historyPosition,
          })}
        >
          <FutureHistoryPositionTrade />
        </div>
        {orderTab === OrderTabTypeEnum.assets && (
          <div className="h-full">
            <TradeAssetsList isActive />
          </div>
        )}
        <div
          className={classNames('h-full', {
            hidden: orderTab !== OrderTabTypeEnum.leverInfo,
          })}
        >
          <FutureLeverInfo />
        </div>
      </div>
    </div>
  )
}

export default FutureTradeOrder
