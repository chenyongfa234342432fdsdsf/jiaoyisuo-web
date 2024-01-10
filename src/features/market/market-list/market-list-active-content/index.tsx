import { MarketListActiveFavContent } from '@/features/market/market-list/common/market-list-table-content-favourite'
import { MarketListActiveBaseCurrencyTab } from '../common/market-list-base-currency'
import styles from './index.module.css'
import { MarketListActiveTableContent } from '../common/market-list-table-content'
import { MarketListActiveSpotCategoriesByBaseCurrency } from '../common/market-list-categories'

export function MarketListActiveContent() {
  return (
    <div className={`${styles.scoped}`}>
      <div className="market-list-spot-base-panel">
        <MarketListActiveBaseCurrencyTab />
      </div>

      <MarketListActiveFavContent />
      <MarketListActiveSpotCategoriesByBaseCurrency />
      <MarketListActiveTableContent />
    </div>
  )
}
