import { t } from '@lingui/macro'

export async function onBeforeRender(pageContext: PageContext) {
  const pageProps = {}
  const layoutParams = {
    footerShow: true,
    headerShow: true,
  }
  return {
    pageContext: {
      needSeo: true,
      pageProps,
      layoutParams,
      documentProps: {
        title: t`store/market/market-list/index-2`,
      },
    },
  }
}
