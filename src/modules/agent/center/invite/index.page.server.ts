import { generateAgentDefaultSeoMeta } from '@/helper/agent'
import { t } from '@lingui/macro'

async function onBeforeRender(pageContext: PageContext) {
  const pageProps = {}
  const layoutParams = {
    footerShow: true,
    headerShow: true,
    fullScreen: true,
  }
  return {
    pageContext: {
      unAuthTo: '/login?redirect=/agent/center/invite',
      pageProps,
      layoutParams,
      documentProps: generateAgentDefaultSeoMeta({ title: t`features_agent_center_invite_index_nfg2f8pgsn` }),
    },
  }
}

export { onBeforeRender }
