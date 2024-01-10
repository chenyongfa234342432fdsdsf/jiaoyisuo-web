import { MarketLisModulesEnum } from '@/constants/market/market-list'
import MarketListLayout from '@/features/market/market-list/market-list-layout'
import MarketSector from '@/features/market/market-sector'
import { ActivityLatestMarquee } from '@/features/market/market-activity/activity-latest-marquee'
import { getModuleStatusByKey } from '@/helper/module-config'
import { ModuleEnum } from '@/constants/module-config'

export function Page() {
  const isShowSpot = getModuleStatusByKey(ModuleEnum.spot)
  return (
    <MarketListLayout moduleName={MarketLisModulesEnum.sector}>
      <MarketSector />
      {isShowSpot && (
        <div className="mt-24">
          <ActivityLatestMarquee />
        </div>
      )}
    </MarketListLayout>
  )
}
