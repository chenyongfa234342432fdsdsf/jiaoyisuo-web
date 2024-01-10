import { t } from '@lingui/macro'
import BindAccount from '@/features/user/personal-center/account-security/bind-account'
import { getUserPageDefaultDescribeMeta } from '@/helper/user'
import { UserModuleDescribeKeyEnum } from '@/constants/user'

function Page() {
  return <BindAccount />
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
      unAuthTo: '/login?redirect=/personal-center/account-security/bind-account',
      pageProps,
      layoutParams,
      documentProps: getUserPageDefaultDescribeMeta(
        t`features_user_personal_center_account_security_bind_account_index_0ad2fy45yb`,
        UserModuleDescribeKeyEnum.default
      ),
    },
  }
}

export { Page, onBeforeRender }
