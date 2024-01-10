import { MarketLisModulesEnum } from '@/constants/market/market-list'
import MarketListLayout from '@/features/market/market-list/market-list-layout'
import SectorTable from '@/features/market/market-sector-table'

export function Page() {
  return (
    <MarketListLayout moduleName={MarketLisModulesEnum.sector}>
      <SectorTable />
    </MarketListLayout>
  )
}
