import { baseUserStore } from '@/store/user'
import { TFavouriteListData } from '@/typings/market/market-favourite'
import { differenceBy, isArray, uniqBy } from 'lodash'
import { marketApiParamsAdapter } from '../bridge'

const commonActionFn = (addFn, rmFn, getFn, cacheFn) => {
  const { getFavListFromCache, addToCache, removeFromCache, clearFavCache } = cacheFn
  const addFav = marketApiParamsAdapter(async (item: TFavouriteListData[]) => {
    const { isLogin } = baseUserStore.getState()
    if (isLogin) {
      const params = item.map(each => each.id)
      await addFn({ tradeIdList: params })
    } else addToCache(item)
  })

  const removeFav = marketApiParamsAdapter(async (item: TFavouriteListData[]) => {
    const { isLogin } = baseUserStore.getState()
    if (isLogin) {
      const params = item.map(each => each.id)
      await rmFn({ tradeIdList: params })
    } else removeFromCache(item)
  })

  const getFavList: () => Promise<TFavouriteListData[]> = () => {
    return new Promise(async (resolve, reject) => {
      const { isLogin } = baseUserStore.getState()
      if (isLogin) {
        await syncWithApi()
        const res = await getFn({})
        let list = res.data

        list = convertFavouriteToTrue(list)
        resolve(list)
      } else resolve(getFavListFromCache())
    })
  }

  const syncWithApi = async () => {
    const cacheData = getFavListFromCache()
    if (cacheData.length > 0) {
      await addFav(cacheData)
      clearFavCache()
    }
  }

  // TODO: get backend to change the favourite field to 1
  const convertFavouriteToTrue = (list: TFavouriteListData[] | undefined) => {
    if (!list) return []
    return list.map(fav => {
      return {
        ...fav,
        favourite: 1,
      }
    })
  }

  return {
    addFav,
    removeFav,
    getFavList,
  }
}

const commonCacheFn = (getCacheFn: any, setCacheFn: any) => {
  const getFavListFromCache: () => TFavouriteListData[] = () => getCacheFn() || []

  const addToCache = marketApiParamsAdapter((item: TFavouriteListData[]) => {
    const currentCache = getFavListFromCache()
    const toCache = uniqBy([...item, ...currentCache], 'id')
    setCacheFn(toCache)
  })

  const removeFromCache = marketApiParamsAdapter((item: TFavouriteListData[]) => {
    const currentCache = getFavListFromCache()
    setCacheFn(differenceBy(currentCache, item, each => each.id))
  })

  const clearFavCache = () => {
    setCacheFn(undefined)
  }

  return {
    getFavListFromCache,
    addToCache,
    removeFromCache,
    clearFavCache,
  }
}

export { commonActionFn, commonCacheFn }
