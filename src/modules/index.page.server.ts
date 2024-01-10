import { getHomePageProps } from '@/helper/home/home-seo'

export async function onBeforeRender(pageContext: PageContext) {
  // TODO error on first load
  const pageProps = {} // await getHomePageProps()
  const layoutParams: LayoutParams = {
    footerShow: true,
    headerShow: true,
    fullScreen: true,
  }
  return {
    pageContext: {
      needSeo: true,
      pageProps,
      layoutParams,
    } as unknown as PageContext,
  }
}
