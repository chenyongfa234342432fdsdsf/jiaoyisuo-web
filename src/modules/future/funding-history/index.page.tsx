import { FundingHistoryLayout } from '@/features/future/funding-history/layout'
import { generateOrderPageDefaultSeoMeta } from '@/helper/order/future'
import { t } from '@lingui/macro'

export function Page() {
  return <FundingHistoryLayout />
}

export async function onBeforeRender(pageContext: PageContext) {
  const pageProps = {}
  const layoutParams = {
    footerShow: true,
    headerShow: true,
    fullScreen: true,
  }
  return {
    pageContext: {
      pageProps,
      layoutParams,
      documentProps: generateOrderPageDefaultSeoMeta(t`future.funding-history.title`),
    },
  }
}
