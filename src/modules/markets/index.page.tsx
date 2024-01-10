import { MarketLisModulesEnum } from '@/constants/market/market-list'
import {
  ActivityLatestMarqueeStickyBgEmptyWrapper,
  ActivityLatestMarquee,
} from '@/features/market/market-activity/activity-latest-marquee'
import MarketListLayout from '@/features/market/market-list/market-list-layout'
import { MarketListActiveContent } from '@/features/market/market-list/market-list-active-content'

export function Page() {
  return (
    <MarketListLayout moduleName={MarketLisModulesEnum.spotMarkets}>
      <MarketListActiveContent />

      <ActivityLatestMarqueeStickyBgEmptyWrapper />
      <ActivityLatestMarquee />
    </MarketListLayout>
  )
}
