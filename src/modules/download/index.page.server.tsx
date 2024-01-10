import { generateDownloadSeoMeta } from '@/helper/download'

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
      documentProps: await generateDownloadSeoMeta(),
    },
  }
}

export { onBeforeRender }
