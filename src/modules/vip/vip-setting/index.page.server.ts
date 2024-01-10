import { t } from '@lingui/macro'
import { getArtcleDefaultSeoMeta } from '@/helper/support'
import { getVipSettingRoutePath } from '@/helper/route'

async function onBeforeRender(pageContext: PageContext) {
  const pageProps = {}
  const layoutParams = {
    footerShow: true,
    headerShow: true,
    fullScreen: true,
  }
  return {
    pageContext: {
      unAuthTo: `/login?redirect=${getVipSettingRoutePath()}`,
      pageProps,
      layoutParams,
      documentProps: getArtcleDefaultSeoMeta(t`user.personal_center_06`),
    },
  }
}

export { onBeforeRender }
