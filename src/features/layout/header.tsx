import { useLayoutStore } from '@/store/layout'
import LoginModal from '@/features/message-center/login-modal'
import { useGuidePageInfo } from '@/hooks/features/layout'
import { getGuidePageComponentInfoByKey, getHomePageConfig } from '@/helper/layout'
import Styles from './header.module.css'
import Personalization from './components/personalization'
import HeaderMenu from './components/header-menu'
import Logo from './components/logo'
import ShouldGuidePageComponentDisplay from '../home/common/component-should-display'

function Header() {
  const { headerData } = useLayoutStore()

  const guidePage = useGuidePageInfo()
  const formattedLandingPageSection = getHomePageConfig(guidePage)
  const { pageInfoTopBar = [] } = guidePage

  const { pageInfoTopBar: headerConfig } = formattedLandingPageSection || {}

  const homeIcon = getGuidePageComponentInfoByKey('homeIcon', pageInfoTopBar)

  return (
    <ShouldGuidePageComponentDisplay {...headerConfig}>
      <div className={Styles.scoped}>
        <div className="home-wrap">
          <ShouldGuidePageComponentDisplay {...homeIcon}>
            <Logo data={headerData} />
          </ShouldGuidePageComponentDisplay>
        </div>
        <HeaderMenu />
        <Personalization />
        <LoginModal />
      </div>
    </ShouldGuidePageComponentDisplay>
  )
}

export default Header
