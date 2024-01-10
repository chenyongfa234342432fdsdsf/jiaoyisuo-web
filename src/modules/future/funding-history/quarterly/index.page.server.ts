import { t } from '@lingui/macro'

export { onBeforeRender }

async function onBeforeRender(pageContext: PageContext) {
  const pageProps = {}
  const layoutParams = {
    footerShow: false,
    headerShow: false,
  }
  return {
    pageContext: {
      pageProps,
      layoutParams,
      documentProps: {
        title: t`future.funding-history.title`,
      },
    },
  }
}
