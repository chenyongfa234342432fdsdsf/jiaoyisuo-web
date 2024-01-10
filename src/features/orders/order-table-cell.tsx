import {
  CANCEL_SPOT_ORDER_QUERY_MAP,
  cancelAllHoldingOrderByMarketPrice,
  cancelFutureOrder,
  cancelSpotNormalOrder,
  cancelSpotPlanOrder,
} from '@/apis/order'
import { useSpotOrderModuleContext, useFutureOrderModuleContext } from '@/features/orders/order-module-context'
import {
  IBaseOrderItem,
  IFutureFundingFeeLog,
  IFutureHoldingOrderItem,
  IFutureOrderItem,
  ISpotPlanOrderItem,
  ISpotStopLimitOrderItem,
} from '@/typings/api/order'
import { Button, Message, Tooltip } from '@nbit/arco'
import { t } from '@lingui/macro'
import { useRequest } from 'ahooks'
import { useState } from 'react'
import {
  FutureOrderActionEnum,
  FuturePlanOrderStatusEnum,
  FutureStopLimitOrderStopLimitTypeEnum,
  OrderDirectionEnum,
  OrderStatusEnum,
  OrderTabTypeEnum,
  SpotPlanOrderStatusEnum,
} from '@/constants/order'
import { getCurrentUnitAmount } from '@/helper/order'
import { replaceEmpty } from '@/helper/filters'
import { FutureTradeUnitEnum } from '@/constants/future/trade'
import Icon from '@/components/icon'
import { link } from '@/helper/link'
import { usePageContext } from '@/hooks/use-page-context'
import classNames from 'classnames'
import TableActions from '@/components/table-actions'
import { getFutureOrderActions, getFutureOrderIsBuy, getFutureOrderValueEnumText } from '@/helper/order/future'
import { getTextFromStoreEnums } from '@/helper/store'
import { baseOrderFutureStore } from '@/store/order/future'
import { formatCurrency } from '@/helper/decimal'
import { useContractMarketStore } from '@/store/market/contract'
import { AssetsListResp } from '@/typings/api/assets/assets'
import { getOrderValueEnumText } from '@/helper/order/spot'
import SideTag from '@/components/side-tag'
import { getSubCoinList } from '@/helper/assets'
import { some } from 'lodash'
import { CoinStateEnum } from '@/constants/assets'
import { FutureOrderDetail } from './details/future'
import { FutureHoldingOrderModifyMargin } from './details/holding'
import { FutureOrderStopLimitDetail } from './details/modify-stop-limit'
import { SpotOrderDetail } from './details/spot'
import { FutureOrderModifyExtraMargin } from './details/extra-margin'
import { FutureFundingFeeDetail } from './details/future-funding-fee'
import styles from './order.module.css'
import { DepositModal } from '../assets/main/deposit-modal'

function useCancelFutureOrder(order: IFutureOrderItem) {
  const { orderHookResult } = useFutureOrderModuleContext()
  const { run, loading } = useRequest(
    async () => {
      const res = await cancelFutureOrder({ id: order.id, entrustType: orderHookResult.entrustType })
      if (!res.isOk) {
        return
      }
      Message.success(t`order.messages.cancelSuccess`)
    },
    {
      manual: true,
    }
  )

  return {
    run,
    loading,
  }
}

export function ActionCell({ order }: { order: IBaseOrderItem | ISpotPlanOrderItem | ISpotStopLimitOrderItem }) {
  const { cancelOrderEvent$, orderHookResult } = useSpotOrderModuleContext()
  const isPlanOrder = (order as ISpotPlanOrderItem).orderStatusCd !== undefined
  const normalOrder = order as IBaseOrderItem
  const planOrder = order as ISpotPlanOrderItem
  const stopLimitOrder = order as ISpotStopLimitOrderItem
  const isStopLimitOrder =
    !!(order as ISpotStopLimitOrderItem).profitTriggerPrice || !!(order as ISpotStopLimitOrderItem).lossTriggerPrice

  const { run: cancel, loading } = useRequest(
    async () => {
      const fn = CANCEL_SPOT_ORDER_QUERY_MAP[orderHookResult.entrustType].single
      const res = await fn({ id: order.id })
      if (!res.isOk) {
        return
      }
      cancelOrderEvent$.emit()
      Message.success(t`order.messages.cancelSuccess`)
    },
    {
      manual: true,
    }
  )
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const cancelable = isPlanOrder
    ? [SpotPlanOrderStatusEnum.unTrigger].includes(planOrder.orderStatusCd)
    : isStopLimitOrder
    ? [SpotPlanOrderStatusEnum.unTrigger].includes(stopLimitOrder.status)
    : [OrderStatusEnum.unsettled, OrderStatusEnum.partlySucceed].includes(normalOrder.status!)
  const onAction = () => {
    if (cancelable) {
      cancel()
    } else {
      setDetailModalVisible(true)
    }
  }
  if (isPlanOrder && !planOrder.refOrderId && !cancelable) {
    return <span>{replaceEmpty('')}</span>
  }
  if (isStopLimitOrder && !stopLimitOrder.refOrderId && !cancelable) {
    return <span>{replaceEmpty('')}</span>
  }

  return (
    <>
      {detailModalVisible && (
        <SpotOrderDetail
          visible={detailModalVisible}
          onClose={() => {
            setDetailModalVisible(false)
          }}
          id={isPlanOrder ? planOrder.refOrderId : normalOrder.id!}
        />
      )}
      <Button className="!rounded" size="mini" onClick={onAction}>
        {cancelable ? t`order.table-cell.action.cancel` : t`assets.coin.overview.detail`}
      </Button>
    </>
  )
}

export function FutureAmountCell({
  order,
  amount,
  isDealAmount,
}: {
  order: IFutureOrderItem
  amount: string
  isDealAmount: boolean
}) {
  return <div>{getCurrentUnitAmount(amount, order, isDealAmount)}</div>
}
export function FutureTriggerEntrustAmountCell({ order }: { order: IFutureOrderItem }) {
  return (
    <div>
      {getCurrentUnitAmount(order.dealAmount, order, true, undefined, false)}/
      {getCurrentUnitAmount(order.price, order, false, undefined)}
    </div>
  )
}

export function FutureActionCell({ order, tab }: { order: IFutureOrderItem; tab: OrderTabTypeEnum }) {
  const { run } = useCancelFutureOrder(order)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showStopLimitModal, setShowStopLimitModal] = useState(false)
  const [showModifyMarginModal, setShowModifyMarginModal] = useState(false)
  const actions = getFutureOrderActions(order)
  const onClickAction = (id: FutureOrderActionEnum) => {
    switch (id) {
      case FutureOrderActionEnum.cancel:
        run()
        break
      case FutureOrderActionEnum.detail:
        setShowDetailModal(true)
        break
      case FutureOrderActionEnum.stopLimit:
        setShowStopLimitModal(true)
        break
      case FutureOrderActionEnum.margin:
        setShowModifyMarginModal(true)
        break
      default:
        break
    }
  }

  return (
    <TableActions actions={actions} max={tab === OrderTabTypeEnum.current ? 4 : 4} onClick={onClickAction}>
      {showDetailModal && (
        <FutureOrderDetail
          visible={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
          }}
          id={order.refOrderId || order.id}
        />
      )}
      {showStopLimitModal && (
        <FutureOrderStopLimitDetail visible={showStopLimitModal} setVisible={setShowStopLimitModal} order={order} />
      )}
      {showModifyMarginModal && (
        <FutureOrderModifyExtraMargin
          visible={showModifyMarginModal}
          setVisible={setShowModifyMarginModal}
          id={order.id}
          order={order}
        />
      )}
    </TableActions>
  )
}
export function FutureStopLimitCell({ order }: { order: IFutureOrderItem }) {
  const showDetailButton = order.stopLoss || order.stopProfit
  const [showDetailModal, setShowDetailModal] = useState(false)

  return (
    <div className="flex items-center">
      {showDetailModal && (
        <FutureOrderStopLimitDetail visible={showDetailModal} setVisible={setShowDetailModal} order={order} />
      )}
      {showDetailButton ? (
        <Button onClick={() => setShowDetailModal(true)} type="text">
          {t`features/orders/order-table-cell-1`}
        </Button>
      ) : (
        t`features/orders/order-table-cell-2`
      )}
    </div>
  )
}

export function FutureHoldingCell({ order }: { order: IFutureHoldingOrderItem }) {
  return (
    <div className="items-center">
      <Tooltip
        content={
          <div className="text-xs">
            <div className="mb-0.5">
              <span className="mr-8">{t`features/orders/order-table-cell-3`}</span>
              {/* 虽然有些属性没有，但是这里的 order 可以传入进行计算，下同 */}
              <span>{getCurrentUnitAmount(order.amount, order as any, false, FutureTradeUnitEnum.a)}</span>
            </div>
            <div className="mb-0.5">
              <span className="mr-8">{t`features/orders/order-table-cell-4`}</span>
              <span>{getCurrentUnitAmount(order.amount, order as any, false, FutureTradeUnitEnum.indexBase)}</span>
            </div>
            {order.symbol.toLowerCase() === FutureTradeUnitEnum.usdt && (
              <div>
                <span className="mr-8">{t`features/orders/order-table-cell-5`}</span>
                <span>{getCurrentUnitAmount(order.amount, order as any, false, FutureTradeUnitEnum.quote)}</span>
              </div>
            )}
          </div>
        }
      >
        <span className="underline decoration-dashed underline-offset-4">
          {getCurrentUnitAmount(order.amount, order as any, false)}
        </span>
      </Tooltip>
      <div>{getCurrentUnitAmount(order.frontendCalcLiquidateAmount.toString(), order as any, false)}</div>
    </div>
  )
}
export function FutureMarginCell({ order }: { order: IFutureHoldingOrderItem }) {
  const [showDetailModal, setShowDetailModal] = useState(false)
  return (
    <div className="flex items-center">
      {showDetailModal && <FutureHoldingOrderModifyMargin setVisible={setShowDetailModal} order={order} />}
      <span>{order.openMargin}</span>
      <div className="-mt-0.5 ml-2 text-lg" onClick={() => setShowDetailModal(true)}>
        <Icon name="moreIcon_white" className="text-brand_color" />
      </div>
    </div>
  )
}

export function FutureHoldingActionCell({ order }: { order: IFutureHoldingOrderItem }) {
  const { cancelOrderEvent$ } = useSpotOrderModuleContext()

  const { run, loading } = useRequest(
    async () => {
      if (Number(order.closingAmount) > 0) {
        Message.info(t`features/orders/order-table-cell-6`)
      }
      const res = await cancelAllHoldingOrderByMarketPrice({
        side: `close_${order.side}`,
        amount: order.amount,
        triggerPrice: order.triggerPrice || '',
        code: order.symbol,
      })
      if (!res.isOk) {
        return
      }
      setTimeout(() => {
        // 撮合需要时间
        cancelOrderEvent$.emit()
      }, 500)
      Message.success(t`features/orders/order-table-cell-7`)
    },
    {
      manual: true,
    }
  )

  const [showStopProfitModal, setShowStopProfitModal] = useState(false)
  const [showStopLossModal, setShowStopLossModal] = useState(false)

  return (
    <div className="flex items-center">
      <Button onClick={() => setShowStopLossModal(true)} type="text">
        {t`constants/order-7`}
      </Button>
      <span className="text-text_color_03 text-lg">|</span>
      <Button onClick={() => setShowStopProfitModal(true)} type="text">
        {t`constants/order-6`}
      </Button>
      <span className="text-text_color_03 text-lg">|</span>
      <Button onClick={run} loading={loading} type="text">
        {t`features/orders/order-table-cell-8`}
      </Button>
    </div>
  )
}
export function FutureStopLimitActionCell({ order }: { order: IFutureOrderItem }) {
  const { run, loading } = useCancelFutureOrder(order)
  const [showStopLimitModal, setShowStopLimitModal] = useState(false)
  const isProfit =
    (order.stopLimitType as any as FutureStopLimitOrderStopLimitTypeEnum) ===
    FutureStopLimitOrderStopLimitTypeEnum.profit
  if (![FuturePlanOrderStatusEnum.unTrigger, FuturePlanOrderStatusEnum.unTrigger2].includes(order.statusCd as any)) {
    return <span>{replaceEmpty('')}</span>
  }

  return (
    <div className="flex items-center">
      <Button onClick={() => setShowStopLimitModal(true)} type="text">
        {t`user.field.reuse_43`}
      </Button>
      <span className="text-text_color_03 text-lg">|</span>
      <Button onClick={run} loading={loading} type="text">
        {t`order.table-cell.action.cancel`}
      </Button>
    </div>
  )
}

export function FutureNameCell({
  order,
  isStopLimit,
  leverVisible,
}: {
  order: IFutureOrderItem
  leverVisible?: boolean
  isStopLimit?: boolean
}) {
  const texts = getFutureOrderValueEnumText(order)
  const isBuy = getFutureOrderIsBuy(order.sideInd)
  // 合约和当前合约一致也进行跳转
  const currentSymbolName = useContractMarketStore().currentCoin.symbolName
  const tagClassName = classNames('tag', isStopLimit ? 'is-stop-limit' : isBuy ? 'is-buy' : 'is-sell')
  const showLink = leverVisible
  const onClickName = () => {
    if (showLink) {
      link(`/futures/${order.symbol}`)
    }
  }

  return (
    <div className={styles['future-name-cell-wrapper']}>
      <div
        onClick={onClickName}
        className={classNames('mb-1 flex items-center', {
          'cursor-pointer': showLink,
        })}
      >
        <div className="mr-1">
          <span>{order.symbol.toUpperCase()}</span>&nbsp;
          <span>{t`assets.enum.tradeCoinType.perpetual`}</span>
        </div>
        {showLink && <Icon name="next_arrow" hasTheme className="text-sm translate-y-px" />}
      </div>
      {leverVisible && (
        <div className="flex">
          <div className={tagClassName}>
            {texts.typeText === replaceEmpty() ? texts.typeTextWithSuffix : texts.typeText}
          </div>
          <div className={tagClassName}>{texts.directionText}</div>
          <div className={classNames('tag bg-card_bg_color_02 text-text_color_02')}>{order.lever}X</div>
        </div>
      )}
    </div>
  )
}

export function SpotTradeOpenCurrencyCell({ order }: { order: IBaseOrderItem | ISpotPlanOrderItem }) {
  const pageContext = usePageContext()
  const targetPath = `/trade/${order.symbol}`
  const isCurrentTrade = pageContext.path === targetPath

  const toTrade = () => {
    if (isCurrentTrade) {
      return
    }
    link(targetPath, {
      overwriteLastHistoryEntry: true,
    })
  }
  return (
    <div
      className={classNames({
        'cursor-pointer': !isCurrentTrade,
      })}
      onClick={toTrade}
    >
      {order.sellCoinShortName?.toUpperCase()}/{order.buyCoinShortName?.toUpperCase()}
      {!isCurrentTrade && <Icon className="ml-1" name="next_arrow" hasTheme />}
      <div className="mt-1">
        <SideTag isSideUp={order.side === OrderDirectionEnum.buy}>{getOrderValueEnumText(order).directionText}</SideTag>
      </div>
    </div>
  )
}

export function FuturePlanOrderTriggerCondition({ order }: { order: IFutureOrderItem }) {
  const priceTypeText = getTextFromStoreEnums(
    order.triggerPriceTypeInd,
    baseOrderFutureStore.getState().orderEnums.triggerPriceTypeIndWithSuffix.enums
  )

  return (
    <div className="inline-flex">
      {priceTypeText} {order.triggerDirectionInd === 'up' ? '≥' : '≤'}{' '}
      {replaceEmpty(formatCurrency(order.triggerPrice))}
    </div>
  )
}
export function FutureFundingFeeActionCell({ item }: { item: IFutureFundingFeeLog }) {
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const onAction = () => {
    setDetailModalVisible(true)
  }

  return (
    <>
      {detailModalVisible && (
        <FutureFundingFeeDetail
          visible={detailModalVisible}
          onClose={() => {
            setDetailModalVisible(false)
          }}
          fundingFee={item}
        />
      )}
      <div>
        <Button size="mini" onClick={onAction}>
          {t`assets.coin.overview.detail`}
        </Button>
      </div>
    </>
  )
}

export function SpotDepositeCell({ coinId }: { coinId: string }) {
  const [modalVisible, setModalVisible] = useState(false)
  const { data } = useRequest(() => getSubCoinList(coinId))
  // 该币种主网是否全部暂停充币
  const isAllClose = !some(data, i => i.isDeposit === CoinStateEnum.open)

  const openModal = () => setModalVisible(true)
  const hideModal = () => setModalVisible(false)
  return (
    <>
      {modalVisible && <DepositModal visible={modalVisible} onClose={hideModal} coinId={coinId} />}

      <Tooltip content={isAllClose ? t`features_orders_order_table_cell_vyn0tr96i6` : ''}>
        <Button disabled={isAllClose} className="!rounded" size="mini" onClick={openModal}>
          {t`assets.deposit.title`}
        </Button>
      </Tooltip>
    </>
  )
}
