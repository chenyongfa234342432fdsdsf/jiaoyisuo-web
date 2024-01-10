import { MarketLisModulesEnum } from '@/constants/market/market-list'
import { contractFavFn, spotFavFn, ternaryFavFn } from '@/helper/market/market-favorite'
import { useMarketListStore } from '@/store/market/market-list'
import { useFuturesFavStore, useSpotFavStore } from '@/store/market/spot-favorite-module'
import { IApiResponse } from '@/typings/api/market'
import { TFavouriteListData } from '@/typings/market/market-favourite'
import { YapiGetV1FavouriteListData } from '@/typings/yapi/FavouriteListV1GetApi'
import { useEffect, useState } from 'react'

/**
 * 获取当前状态下的自选列表
 * @returns fav 数据和状态
 */
function useFavList(contextFn, contextStore) {
  const { getFavList } = contextFn
  const [state, setState] = useState<IApiResponse<TFavouriteListData[]>>({ isLoading: true, data: [] })
  const { hasListUpdated, updateFavList } = contextStore()

  useEffect(() => {
    getFavList()
      .then(res => {
        updateFavList(res || [])

        setState(prev => ({
          ...prev,
          data: res || [],
        }))
      })
      .finally(() => {
        setState(prev => ({
          ...prev,
          isLoading: false,
        }))
      })
  }, [hasListUpdated])

  return state
}

function useFavActions(contextFn, contextStore) {
  const { addFav, removeFav } = contextFn
  const { updateList } = contextStore()
  return {
    addFavToList: async (items: TFavouriteListData[]) => {
      await addFav(items)
      updateList()
    },
    rmFavFromList: async (items: TFavouriteListData[]) => {
      await removeFav(items)
      updateList()
    },
  }
}

const useSpotFavList = () => useFavList(spotFavFn, useSpotFavStore)
const useSpotFavActions = () => useFavActions(spotFavFn, useSpotFavStore)

const useFuturesFavList = () => useFavList(contractFavFn, useFuturesFavStore)
const useFuturesFavActions = () => useFavActions(contractFavFn, useFuturesFavStore)

const useTernaryFavList = () => useFavList(ternaryFavFn, useFuturesFavStore)
const useTernaryFavActions = () => useFavActions(ternaryFavFn, useFuturesFavStore)

function useFavActionsSwitch(): typeof useSpotFavActions {
  const active = useMarketListStore().activeModule
  if (active === MarketLisModulesEnum.futuresMarkets) return useSpotFavActions
  if (active === MarketLisModulesEnum.ternaryMarketsTrade) return useTernaryFavActions
  return useFuturesFavActions
}

export {
  useSpotFavList,
  useSpotFavActions,
  useFuturesFavList,
  useFuturesFavActions,
  useFavActionsSwitch,
  useTernaryFavList,
  useTernaryFavActions,
}
