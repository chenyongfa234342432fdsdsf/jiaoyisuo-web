import { t } from '@lingui/macro'
import { generateAgentDefaultSeoMeta } from '@/helper/agent'
import AgentInviteLayout from '@/features/agent/agent-invite'

function Page() {
  return <AgentInviteLayout />
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
      unAuthTo: '/login?redirect=/agent',
      pageProps,
      layoutParams,
      documentProps: generateAgentDefaultSeoMeta({ title: t`user.personal_center_05` }),
    },
  }
}

export { onBeforeRender, Page }
