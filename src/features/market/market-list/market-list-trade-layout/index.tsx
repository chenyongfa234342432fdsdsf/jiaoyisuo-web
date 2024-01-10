import { Popover } from '@nbit/arco'
import { IMarketListBaseStore, useMarketListStore } from '@/store/market/market-list'
import Icon from '@/components/icon'
import { KLineChartType } from '@nbit/chart-utils'
import { ReactNode, createContext, useContext, useEffect, useRef } from 'react'
import classNames from 'classnames'
import DebounceSearchBar from '@/components/debounce-search-bar'
import { SpotMarketBaseCurrenyEnum } from '@/constants/market/market-list'
import { t } from '@lingui/macro'
import styles from './index.module.css'
import {
  MarketFuturesTradeFavoriteTableContent,
  MarketFuturesTradeSearchDefaultTableContent,
  MarketSpotTradeFavoriteTableContent,
  MarketSpotTradeSearchDefaultTableContent,
  MarketTernaryTradeFavoriteTableContent,
  MarketTernaryTradeSearchDefaultTableContent,
} from '../common/market-list-table-content/market-list-table-content-trade-area'
import {
  MarketListTradeCoinSelectedHistoryFutures,
  MarketListTradeCoinSelectedHistorySpot,
} from '../common/market-list-trade-selected-history'
import { MarketFuturesTradeHotSearching, MarketSpotTradeHotSearching } from '../common/market-list-hot-searching'
import {
  MarketListFuturesTradeSearchResult,
  MarketListSpotTradeSearchResult,
  MarketListTernaryTradeSearchResult,
} from '../common/market-list-table-content-search'
import { MarketListSpotTradeBaseCurrencyDropDown } from '../common/market-list-base-currency'
import {
  MarketListFuturesTradeBaseCurrencyTab,
  MarketListSpotTradeCategoriesByBaseCurrency,
  MarketListTernaryTradeBaseCurrencyTab,
} from '../common/market-list-categories'

const StoreContext = createContext<Partial<IMarketListBaseStore['futuresMarketsTradeModule']>>({})

const Optional = function ({ children, isRender }: { children: any; isRender: boolean }) {
  return isRender ? children : null
}

function CommonMarketTradeContent({
  tab,
  currencyDropdown,
  favouriteTableContent,
  searchDefaultTableContent,
  selectedHistory,
  hotSearching,
  searchResult,
}: {
  tab?: ReactNode
  currencyDropdown?: ReactNode
  favouriteTableContent?: ReactNode
  searchDefaultTableContent?: ReactNode
  selectedHistory?: ReactNode
  hotSearching?: ReactNode
  searchResult?: ReactNode
}) {
  const { searchInput, isSearchInputFocused, ...store } = useContext(
    StoreContext
  ) as IMarketListBaseStore['spotMarketsTradeModule']

  const isDefault = !isSearchInputFocused && !searchInput
  const isJustFocused = isSearchInputFocused && (!searchInput || !searchInput.trim())
  const isSearching = searchInput && searchInput.trim()

  // 用于 just focused 状态时界面的判断点击事件，以免回到默认状态
  const justFocusedRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!isJustFocused) return

    justFocusedRef.current?.addEventListener('mousedown', e => {
      // mousedown event 优先级高于 onBlur，停止防止搜索 onBlur event 导致 state 变化
      e.preventDefault()
    })

    return () => {
      justFocusedRef.current?.removeEventListener('mousedown', () => {})
    }
  }, [justFocusedRef, isJustFocused])

  const categoriesFilter = store?.selectedCategroyFilter || store?.selectedBaseCurrencyFilter
  const defaultContent = (
    <div className="on-default">
      <div className="sticky-header sticky">
        <div className="default-nav-row">
          <div className="categories">{tab}</div>
          <div className="base-currency-selection-dropdown">{currencyDropdown}</div>
        </div>
      </div>

      <div className="on-default content">
        <div className="default-content">
          {categoriesFilter === SpotMarketBaseCurrenyEnum.favorites ? favouriteTableContent : searchDefaultTableContent}
        </div>
      </div>
    </div>
  )

  const focusContent = (
    <div className="on-focus content" ref={justFocusedRef}>
      {selectedHistory}

      <div className="spot-hot-table">{hotSearching}</div>
    </div>
  )

  const searchContent = <div className="on-result">{searchResult}</div>

  return (
    <div className={classNames(styles.scoped, 'hide-scrollbar-on-not-active')}>
      <div className="market-list-spot-trade-search-wrapper">
        <div className="common-header search-bar sticky">
          <DebounceSearchBar
            placeholder={t`future.funding-history.search-future`}
            onChange={value => {
              store?.setSearchInput && store.setSearchInput(value)
            }}
            toggleFocus={value => {
              store?.setIsSearchInputFocused && store.setIsSearchInputFocused(value)
            }}
            inputValue={searchInput}
          />
        </div>

        <Optional isRender={!!isDefault}>{defaultContent}</Optional>

        <Optional isRender={!!isJustFocused}>
          {selectedHistory && hotSearching ? focusContent : defaultContent}
        </Optional>

        <Optional isRender={!!isSearching}>{searchContent}</Optional>
      </div>
    </div>
  )
}

function CommonMarketListTradeLayout({ children, className }: { children: ReactNode; className?: string }) {
  const store = useContext(StoreContext)
  const isVisiable = store?.isSearchPopoverVisible
  const leftOffset = store?.tradeAreaLeftOffset
  return (
    <Popover
      position="bottom"
      content={children}
      popupVisible={isVisiable}
      className={`${styles.popover} ${className}`}
      style={{
        left: `${leftOffset}px`,
      }}
    >
      <div>
        <Icon className="icon flex items-center" name={isVisiable ? 'arrow_close' : 'arrow_open'} hasTheme />
      </div>
    </Popover>
  )
}

// ====================================================== //
// ====================== 行情交易列表改造 ====================== //
// ====================================================== //

export function MarketListSpotTradeNewLayout() {
  const { spotMarketsNewTradeModule } = useMarketListStore()
  return (
    <StoreContext.Provider value={spotMarketsNewTradeModule}>
      <div className={styles['spot-trade-new-layout']}>
        <div className="market-trade-title">
          <span>{t`features/c2c-trade/creates-advertisements/index-6`}</span>
        </div>
        <div className="divider"></div>
        <CommonMarketTradeContent
          tab={<MarketListSpotTradeCategoriesByBaseCurrency store={spotMarketsNewTradeModule} />}
          currencyDropdown={<MarketListSpotTradeBaseCurrencyDropDown store={spotMarketsNewTradeModule} />}
          favouriteTableContent={<MarketSpotTradeFavoriteTableContent />}
          searchDefaultTableContent={<MarketSpotTradeSearchDefaultTableContent store={spotMarketsNewTradeModule} />}
          selectedHistory={<MarketListTradeCoinSelectedHistorySpot />}
          hotSearching={<MarketSpotTradeHotSearching store={spotMarketsNewTradeModule} />}
          searchResult={<MarketListSpotTradeSearchResult store={spotMarketsNewTradeModule} />}
        />
      </div>
    </StoreContext.Provider>
  )
}

// ====================================================== //
// ===================== 行情交易列表 ===================== //
// ====================================================== //

function MarketListSpotTradeLayout() {
  const store = useContext(StoreContext)
  return (
    <CommonMarketListTradeLayout>
      <CommonMarketTradeContent
        tab={<MarketListSpotTradeCategoriesByBaseCurrency store={store} />}
        currencyDropdown={<MarketListSpotTradeBaseCurrencyDropDown store={store} />}
        favouriteTableContent={<MarketSpotTradeFavoriteTableContent />}
        searchDefaultTableContent={<MarketSpotTradeSearchDefaultTableContent store={store} />}
        selectedHistory={<MarketListTradeCoinSelectedHistorySpot />}
        hotSearching={<MarketSpotTradeHotSearching store={store} />}
        searchResult={<MarketListSpotTradeSearchResult store={store} />}
      />
    </CommonMarketListTradeLayout>
  )
}

function MarketListFuturesTradeLayout() {
  return (
    <CommonMarketListTradeLayout className={styles['futures-trade-layout']}>
      <CommonMarketTradeContent
        tab={<MarketListFuturesTradeBaseCurrencyTab />}
        favouriteTableContent={<MarketFuturesTradeFavoriteTableContent />}
        searchDefaultTableContent={<MarketFuturesTradeSearchDefaultTableContent />}
        selectedHistory={<MarketListTradeCoinSelectedHistoryFutures />}
        hotSearching={<MarketFuturesTradeHotSearching />}
        searchResult={<MarketListFuturesTradeSearchResult />}
      />
    </CommonMarketListTradeLayout>
  )
}

function MarketListTernaryTradeLayout() {
  // ternary shares some of futures feature
  return (
    <CommonMarketListTradeLayout className={styles['futures-trade-layout']}>
      <CommonMarketTradeContent
        tab={<MarketListTernaryTradeBaseCurrencyTab />}
        favouriteTableContent={<MarketTernaryTradeFavoriteTableContent />}
        searchDefaultTableContent={<MarketTernaryTradeSearchDefaultTableContent />}
        searchResult={<MarketListTernaryTradeSearchResult />}
      />
    </CommonMarketListTradeLayout>
  )
}

export function MarketListActiveTradeLayout({ type }: { type: KLineChartType }) {
  const { futuresMarketsTradeModule, spotMarketsTradeModule } = useMarketListStore()

  switch (type) {
    case KLineChartType.Futures:
      return (
        <StoreContext.Provider value={futuresMarketsTradeModule}>
          <MarketListFuturesTradeLayout />
        </StoreContext.Provider>
      )
    case KLineChartType.Ternary:
      return (
        <StoreContext.Provider value={futuresMarketsTradeModule}>
          <MarketListTernaryTradeLayout />
        </StoreContext.Provider>
      )
    default:
      return (
        <StoreContext.Provider value={spotMarketsTradeModule}>
          <MarketListSpotTradeLayout />
        </StoreContext.Provider>
      )
  }
}
