import { OrderLayout } from '@/features/orders/order-layout'
import { t } from '@lingui/macro'
import { useMount } from 'ahooks'
import { getFuturesCurrencySettings } from '@/helper/assets/futures'
import { baseAssetsStore } from '@/store/assets'
import { generateOrderPageDefaultSeoMeta } from '@/helper/order/future'
import { FutureHistoryPositionOrders } from '@/features/assets/futures/history-position/orders-history-position'

export async function onBeforeRender(pageContext: PageContext) {
  const pageProps = {}
  const layoutParams = {
    footerShow: true,
    headerShow: true,
    fullScreen: true,
  }
  return {
    pageContext: {
      unAuthTo: `/login?redirect=${pageContext.path}`,
      pageProps,
      layoutParams,
      documentProps: generateOrderPageDefaultSeoMeta(t`features_orders_order_menu_jt39dmdgfi`),
    },
  }
}

export function Page() {
  useMount(() => {
    getFuturesCurrencySettings()
    baseAssetsStore.getState().fetchCoinRate()
  })

  return (
    <OrderLayout subTitle={t`order.titles.future`} title={t`features_orders_order_menu_jt39dmdgfi`}>
      <FutureHistoryPositionOrders />
    </OrderLayout>
  )
}
