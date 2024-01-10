import { t } from '@lingui/macro'
import EntertainmentArea from '@/features/recreation'
import { getUserPageDefaultDescribeMeta } from '@/helper/user'
import { UserModuleDescribeKeyEnum } from '@/constants/user'

function Page() {
  return <EntertainmentArea />
}

async function onBeforeRender(pageContext: PageContext) {
  const pageProps = {}
  const layoutParams = {
    footerShow: false,
    headerShow: true,
    fullScreen: true,
  }
  return {
    pageContext: {
      unAuthTo: '/login',
      pageProps,
      layoutParams,
      documentProps: getUserPageDefaultDescribeMeta(
        t`features_recreation_index_oqhxipaffm`,
        UserModuleDescribeKeyEnum.default
      ),
    },
  }
}

export { Page, onBeforeRender }
