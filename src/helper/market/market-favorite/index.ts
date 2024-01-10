import {
  addFavList,
  removeFavList,
  getUserFavList,
  addFavListFutures,
  removeFavListFutures,
  getUserFavListFutures,
} from '@/apis/market/market-list/market-favourites'
import { getFavouriteListCache, setFavouriteListCache } from '@/helper/cache'
import { partial } from 'lodash'
import {
  getV1OptionFavouriteTradePairListApiRequest,
  postV1OptionFavouriteTradePairAddApiRequest,
  postV1OptionFavouriteTradePairDeleteApiRequest,
} from '@/apis/ternary-option/market'
import { commonActionFn, commonCacheFn } from './common'
import { marketApiResponseAdapter } from '../bridge'

/** Spot favorite helper Functions */
const spotFavCacheFn = commonCacheFn(partial(getFavouriteListCache, 'spot'), partial(setFavouriteListCache, 'spot'))
const spotFavFn = commonActionFn(addFavList, removeFavList, getUserFavList, spotFavCacheFn)

/** Contract favorite helper Functions */
const contractFavCacheFn = commonCacheFn(
  partial(getFavouriteListCache, 'futures'),
  partial(setFavouriteListCache, 'futures')
)
const contractFavFn = commonActionFn(addFavListFutures, removeFavListFutures, getUserFavListFutures, contractFavCacheFn)

/*
 * Ternary favourite helper Functions
 * Ternary options share the same cache as futures
 */
const ternaryFavFn = commonActionFn(
  postV1OptionFavouriteTradePairAddApiRequest,
  postV1OptionFavouriteTradePairDeleteApiRequest,
  marketApiResponseAdapter(getV1OptionFavouriteTradePairListApiRequest),
  contractFavCacheFn
)

export { spotFavFn, contractFavFn, ternaryFavFn }
