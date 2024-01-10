import { generateMarketDefaultSeoMeta } from '@/helper/market'
import { t } from '@lingui/macro'

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
      documentProps: generateMarketDefaultSeoMeta({
        title: t`market`,
      }),
    },
  }
}
