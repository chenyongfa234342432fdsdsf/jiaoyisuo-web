import { t } from '@lingui/macro'
import { getVipTierRoutePath } from '@/helper/route'
import { getUserPageDefaultDescribeMeta } from '@/helper/user'
import { UserModuleDescribeKeyEnum } from '@/constants/user'

async function onBeforeRender(pageContext: PageContext) {
  const pageProps = {}
  const layoutParams = {
    footerShow: true,
    headerShow: true,
  }
  return {
    pageContext: {
      unAuthTo: `/login?redirect=${getVipTierRoutePath()}`,
      pageProps,
      layoutParams,
      documentProps: getUserPageDefaultDescribeMeta(
        t`modules_vip_vip_center_index_page_seyeguxxga`,
        UserModuleDescribeKeyEnum.default
      ),
    },
  }
}

export { onBeforeRender }
