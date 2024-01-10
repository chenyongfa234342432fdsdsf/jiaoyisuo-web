import { MarketLisModulesEnum } from '@/constants/market/market-list'
import MarketListLayout from '@/features/market/market-list/market-list-layout'
import MarketSectorDetails from '@/features/market/market-sector-details'

export function Page() {
  return (
    <MarketListLayout moduleName={MarketLisModulesEnum.sector}>
      <MarketSectorDetails />
    </MarketListLayout>
  )
}
