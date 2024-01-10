import { t } from '@lingui/macro'
import WelfareCenter from '@/features/welfare-center'
import { generateAgentDefaultSeoMeta } from '@/helper/agent'

function Page() {
  return <WelfareCenter />
}

async function onBeforeRender(pageContext: PageContext) {
  const pageProps = {}
  const layoutParams = {
    footerShow: true,
    headerShow: true,
    fullScreen: true,
  }
  return {
    pageContext: {
      // unAuthTo: '/login?redirect=/welfare-center',
      pageProps,
      layoutParams,
      documentProps: generateAgentDefaultSeoMeta({ title: t`features_welfare_center_index__4rlmmqasg` }),
    },
  }
}

export { onBeforeRender, Page }
