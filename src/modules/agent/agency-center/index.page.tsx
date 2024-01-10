import { t } from '@lingui/macro'
import { getUserPageDefaultDescribeMeta } from '@/helper/user'
import { UserModuleDescribeKeyEnum } from '@/constants/user'
import AgentCenterLayout from '@/features/agent/agent-center'

function Page() {
  return <AgentCenterLayout />
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
      unAuthTo: '/login?redirect=/agent/agency-center',
      pageProps,
      layoutParams,
      documentProps: getUserPageDefaultDescribeMeta(
        t`features_agent_agency_center_index_5101513`,
        UserModuleDescribeKeyEnum.agentCenter
      ),
    },
  }
}

export { Page, onBeforeRender }
