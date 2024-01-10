import Tabs from '@/components/tabs'
import {
  MarketLisModulesEnum,
  SpotMarketBaseCurrenyEnum,
  SpotMarketSectorCategoryEnum,
  spotMarketsBaseCurrencyFilter,
  spotMarketsCategoryFilter,
} from '@/constants/market/market-list'
import { IMarketListBaseStore, useMarketListStore } from '@/store/market/market-list'
import { SelectUIOptionType } from '@/typings/api/market/market-list'
import { ComponentProps, createContext, useContext, useEffect } from 'react'
import { isEmpty, omitBy } from 'lodash'
import { getV1PerpetualTradePairConceptListApiRequest } from '@/apis/market/futures'
import { useSafeState } from 'ahooks'
import { getCategoriesByBaseCurrency } from '@/apis/market/market-list'
import styles from './index.module.css'

const StoreContext = createContext<
  Partial<IMarketListBaseStore['spot'] | IMarketListBaseStore['spotMarketsTradeModule']>
>({})
const TabStoreContext = createContext<Partial<IMarketListBaseStore['futures']>>({})

function CommmonMarketListCategories(
  props: { tabList: SelectUIOptionType[]; className: string } & Partial<ComponentProps<typeof Tabs>>
) {
  const { tabList, className, mode = 'button', ...rest } = props
  const store = useContext(StoreContext)

  return (
    <div className={`${className} ${styles.scoped}`}>
      <Tabs
        mode={mode}
        value={store.selectedCategroyFilter || SpotMarketSectorCategoryEnum.total}
        tabList={tabList}
        onChange={val => store?.setSelectedCategroyFilter && store.setSelectedCategroyFilter(val.id)}
        isScrollable
        {...rest}
      />
    </div>
  )
}

function CommonMarketListBaseCurrencyTab(
  props: { tabList: SelectUIOptionType[]; className: string } & Partial<ComponentProps<typeof Tabs>>
) {
  const { tabList, className, mode = 'text', ...rest } = props
  const store = useContext(TabStoreContext)
  //   const tabList = [
  //     ...spotMarketsBaseCurrencyFilter(),
  //     ...spotMarketsCategoryFilter(),
  //     ...useMarketListFuturesSectorCategories(),
  //   ]

  return (
    <div className={`${className} ${styles.scoped}`}>
      <Tabs
        mode={mode}
        value={store.selectedBaseCurrencyFilter}
        tabList={tabList}
        onChange={item => store?.setSelectedBaseCurrencyFilter && store.setSelectedBaseCurrencyFilter(item.id)}
        isScrollable
        {...rest}
      />
    </div>
  )
}

export function useSpotMarketCategoryByBaseCurrency(selectedBaseCurrencyFilter) {
  const [state, setState] = useSafeState<SelectUIOptionType[]>([])

  useEffect(() => {
    const apiParams = omitBy({ buyCoinId: selectedBaseCurrencyFilter } || {}, x => !x) as any
    if (
      isEmpty(apiParams) ||
      selectedBaseCurrencyFilter === SpotMarketBaseCurrenyEnum.favorites ||
      selectedBaseCurrencyFilter === SpotMarketSectorCategoryEnum.total
    )
      return

    getCategoriesByBaseCurrency(apiParams).then(res => {
      let resolvedTabs: SelectUIOptionType[] = []

      if (res.isOk) {
        const newTabs = (res?.data?.list || []).map(x => {
          return {
            id: String(x.id),
            title: x.name,
          }
        })
        resolvedTabs = [...resolvedTabs, ...newTabs] as SelectUIOptionType[]
      }

      setState(resolvedTabs)
    })
  }, [selectedBaseCurrencyFilter])

  return state
}

export function useMarketListFuturesSectorCategories() {
  const cache = useMarketListStore().cache

  useEffect(() => {
    if (!isEmpty(cache.futuresCategories)) return
    getV1PerpetualTradePairConceptListApiRequest({}).then(res => {
      const newTabs: SelectUIOptionType[] =
        (res?.data || []).map(x => {
          return {
            id: String(x.id),
            title: x.name,
          }
        }) || []

      cache.setFuturesCategories(newTabs)
    })
  }, [])

  return cache.futuresCategories
}

export function MarketListSpotCategoriesByBaseCurrency() {
  const { spot } = useMarketListStore()

  return (
    <StoreContext.Provider value={spot}>
      <CommmonMarketListCategories
        tabList={[
          ...spotMarketsCategoryFilter(),
          ...useSpotMarketCategoryByBaseCurrency(spot.selectedBaseCurrencyFilter),
        ]}
        className="categroy-tab-bar"
      />
    </StoreContext.Provider>
  )
}

export function MarketListSpotTradeCategoriesByBaseCurrency({ store }) {
  return (
    <StoreContext.Provider value={store}>
      <CommmonMarketListCategories
        tabList={[
          ...spotMarketsBaseCurrencyFilter(),
          ...spotMarketsCategoryFilter(),
          ...useSpotMarketCategoryByBaseCurrency(store.selectedBaseCurrencyFilter),
        ]}
        className="categroy-tab-bar"
        mode="text"
      />
    </StoreContext.Provider>
  )
}

export function MarketListActiveSpotCategoriesByBaseCurrency() {
  const rootStore = useMarketListStore()
  const active = rootStore.activeModule
  const activeStore = rootStore[rootStore.activeModule]

  if (!activeStore || activeStore.selectedBaseCurrencyFilter === SpotMarketBaseCurrenyEnum.favorites) return null

  switch (active) {
    case MarketLisModulesEnum.spotMarkets:
      return (
        <div className="spot-base-currency-tab">
          <MarketListSpotCategoriesByBaseCurrency />
        </div>
      )
    default:
      return null
  }
}

export function MarketListFuturesBaseCurrencyTab() {
  const { futures } = useMarketListStore()

  return (
    <TabStoreContext.Provider value={futures}>
      <CommonMarketListBaseCurrencyTab
        tabList={[
          ...spotMarketsBaseCurrencyFilter(),
          ...spotMarketsCategoryFilter(),
          ...useMarketListFuturesSectorCategories(),
        ]}
        className="currency-tab-bar"
      />
    </TabStoreContext.Provider>
  )
}

export function MarketListFuturesTradeBaseCurrencyTab() {
  const { futuresMarketsTradeModule } = useMarketListStore()

  return (
    <TabStoreContext.Provider value={futuresMarketsTradeModule}>
      <CommonMarketListBaseCurrencyTab
        tabList={[
          ...spotMarketsBaseCurrencyFilter(),
          ...spotMarketsCategoryFilter(),
          ...useMarketListFuturesSectorCategories(),
        ]}
        className="currency-tab-bar"
      />
    </TabStoreContext.Provider>
  )
}

export function MarketListTernaryTradeBaseCurrencyTab() {
  const { futuresMarketsTradeModule } = useMarketListStore()

  return (
    <TabStoreContext.Provider value={futuresMarketsTradeModule}>
      <CommonMarketListBaseCurrencyTab
        tabList={[...spotMarketsBaseCurrencyFilter(), ...spotMarketsCategoryFilter()]}
        className="currency-tab-bar"
      />
    </TabStoreContext.Provider>
  )
}
