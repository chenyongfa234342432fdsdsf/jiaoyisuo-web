import { t } from '@lingui/macro'
import { getMarketDefaultSeoMeta } from '@/helper/market/sector'

export async function onBeforeRender(pageContext: PageContext) {
  const pageProps = {}
  const layoutParams = {
    footerShow: true,
    headerShow: true,
    fullScreen: true,
  }
  return {
    pageContext: {
      needSeo: true,
      pageProps,
      layoutParams,
      documentProps: getMarketDefaultSeoMeta(t`market`),
    },
  }
}
