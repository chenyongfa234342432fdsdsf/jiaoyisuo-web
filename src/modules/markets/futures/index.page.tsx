import { MarketLisModulesEnum } from '@/constants/market/market-list'
import MarketListLayout from '@/features/market/market-list/market-list-layout'
import { MarketListActiveContent } from '@/features/market/market-list/market-list-active-content'
import {
  ActivityLatestMarqueeStickyBgEmptyWrapper,
  ActivityLatestMarquee,
} from '@/features/market/market-activity/activity-latest-marquee'
import { getMergeModeStatus } from '@/features/user/utils/common'
import { getModuleStatusByKey } from '@/helper/module-config'
import { ModuleEnum } from '@/constants/module-config'

export function Page() {
  const isMergeMode = getMergeModeStatus()
  const isShowSpot = getModuleStatusByKey(ModuleEnum.spot)
  return (
    <div className="spot-page-wrapper">
      <MarketListLayout moduleName={MarketLisModulesEnum.futuresMarkets}>
        <MarketListActiveContent />
      </MarketListLayout>

      {!isMergeMode && isShowSpot && <ActivityLatestMarqueeStickyBgEmptyWrapper />}
      {isShowSpot && <ActivityLatestMarquee />}
    </div>
  )
}
