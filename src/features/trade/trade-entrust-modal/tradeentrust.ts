import { TradeOrderTypesEnum } from '@/constants/trade'
import { t } from '@lingui/macro'

export const useTradeEntrust = (whetherIsSpot?: boolean) => {
  const entrustTabList = [
    { title: t`order.constants.matchType.market`, id: TradeOrderTypesEnum.market },
    { title: t`order.constants.matchType.limit`, id: TradeOrderTypesEnum.limit },
    { title: t`order.constants.placeOrderType.plan`, id: TradeOrderTypesEnum.trailing },
    // { title: t`order.tabs.profitLoss`, id: TradeOrderTypesEnum.stop },
  ]

  whetherIsSpot && entrustTabList.push({ title: t`order.tabs.profitLoss`, id: TradeOrderTypesEnum.stop })

  const limitOrderExplain = {
    buy: {
      content: `${t`features_trade_trade_entrust_modal_limit_order_index_2456`}`,
      remark: `${t`features_trade_trade_entrust_modal_limit_order_index_2465`}`,
      reverse: `${t`features_trade_trade_entrust_modal_limit_order_index_2471`}`,
    },
    sell: {
      content: `${t`features_trade_trade_entrust_modal_tradeentrust_5101333`}`,
      remark: t`features_trade_trade_entrust_modal_tradeentrust_5101327`,
      reverse: t`features_trade_trade_entrust_modal_tradeentrust_5101328`,
    },
  }

  return { entrustTabList, limitOrderExplain }
}

export enum HandleMode {
  BUY = 'buy',
  SELL = 'sell',
}
