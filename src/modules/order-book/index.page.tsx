import { t } from '@lingui/macro'
import OrderBook from '@/features/order-book'
import { getUserPageDefaultDescribeMeta } from '@/helper/user'
import { UserModuleDescribeKeyEnum } from '@/constants/user'

function Page() {
  return <OrderBook />
}

async function onBeforeRender(pageContext: PageContext) {
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
      documentProps: getUserPageDefaultDescribeMeta(t`modules/order-book/index-0`, UserModuleDescribeKeyEnum.default),
    },
  }
}

export { Page, onBeforeRender }
