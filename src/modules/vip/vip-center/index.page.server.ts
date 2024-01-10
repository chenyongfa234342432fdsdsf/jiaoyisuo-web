import { t } from '@lingui/macro'
import { getVipCenterRoutePath } from '@/helper/route'
import { generateAgentDefaultSeoMeta } from '@/helper/agent'

async function onBeforeRender(pageContext: PageContext) {
  const pageProps = {}
  const layoutParams = {
    footerShow: true,
    headerShow: true,
    fullScreen: true,
  }
  return {
    pageContext: {
      unAuthTo: `/login?redirect=${getVipCenterRoutePath()}`,
      pageProps,
      layoutParams,
      documentProps: generateAgentDefaultSeoMeta({ title: t`modules_vip_vip_center_index_page_server_kqyv_fup6o` }),
    },
  }
}

export { onBeforeRender }
