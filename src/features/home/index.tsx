import { t } from '@lingui/macro'
import LazyImage, { Type } from '@/components/lazy-image'
import { oss_svg_image_domain_address } from '@/constants/oss'
import { Typography } from '@nbit/arco'
import { getHomePageProps } from '@/helper/home/home-seo'
import { getModuleStatusByKey } from '@/helper/module-config'
import { ModuleEnum } from '@/constants/module-config'
import { useEffect } from 'react'
import { getV1GuideMapH5GetApiRequest } from '@/apis/layout'
import { useGuidePageInfo } from '@/hooks/features/layout'
import { getHomePageConfig } from '@/helper/layout'
import AnnouncementBar from './announcement-bar'
import BannersBar from './banners-bar'
import DisplayCardsGrid from './display-cards-grid'
import styles from './index.module.css'
import FloatingIconButton from './floating-icon-button'
import ShouldGuidePageComponentDisplay from './common/component-should-display'
import HeroBanner from './hero-banner'
import DownloadSection from './download'
import HomeTable from './home-table'
import { getMergeModeStatus } from '../user/utils/common'

type THome = {
  data: Awaited<ReturnType<typeof getHomePageProps>>
}

function Home(props: THome) {
  const isMergeMode = getMergeModeStatus()

  const { banners, announcements } = props.data || {}
  const isShowSpot = getModuleStatusByKey(ModuleEnum.spot)

  const guidePage = useGuidePageInfo()
  const formattedLandingPageSection = getHomePageConfig(guidePage)

  const {
    // pageInfoTopBar: header,
    pageInfoSlogan: advertise,
    pageInfoPopularCurrency: popularCoin,
    pageInfoPurchaseSteps: buyCoin,
    pageInfoAboutUs: serviceAdvantage,
    // pageInfoCommunity: community,
    // pageInfoAppDow: download,
    // pageInfoServiceSupport: serviceSupport,
    // pageInfoDownPopup: downloadPopup,
  } = formattedLandingPageSection || {}

  return (
    <div className={styles.scoped}>
      <ShouldGuidePageComponentDisplay {...advertise}>
        <HeroBanner />
      </ShouldGuidePageComponentDisplay>
      {isMergeMode && (
        <div className="merge-mode-bar">
          <AnnouncementBar data={announcements} />
        </div>
      )}
      <div className="home-content-layout">
        <BannersBar data={banners} />
        {!isMergeMode && <AnnouncementBar data={announcements} />}
        <ShouldGuidePageComponentDisplay {...popularCoin}>
          {isShowSpot && <HomeTable />}
        </ShouldGuidePageComponentDisplay>
        <DownloadSection />
        <ShouldGuidePageComponentDisplay {...serviceAdvantage}>
          <DisplayCardsGrid />
        </ShouldGuidePageComponentDisplay>
      </div>
      <FloatingIconButton />
    </div>
  )
}

export default Home
