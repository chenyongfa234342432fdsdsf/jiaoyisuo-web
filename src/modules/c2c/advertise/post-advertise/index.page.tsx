import PostAdvertise from '@/features/c2c/advertise/post-advertise'
import C2CTab from '@/features/c2c/trade/c2c-tab'
import { generateAssetsDefaultSeoMeta } from '@/helper/assets'
import { getC2cDefaultSeoMeta } from '@/helper/c2c/trade'
import { getC2cPostAdvPageRoutePath } from '@/helper/route'
import { t } from '@lingui/macro'

export function Page() {
  return (
    <div className="bg-bg_color">
      <C2CTab showIsTop={false}>
        <PostAdvertise />
      </C2CTab>
    </div>
  )
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
      unAuthTo: `/login?redirect=${getC2cPostAdvPageRoutePath()}`,
      pageProps,
      layoutParams,
      documentProps: await getC2cDefaultSeoMeta(t`trade.c2c.publishAdvertisement`),
    },
  }
}
