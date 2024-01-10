import request, { MarkcoinRequest } from '@/plugins/request'
import {
  YapiGetCoinGetTradePairApiRequest,
  YapiGetCoinGetTradePairApiResponse,
} from '@/typings/yapi-old/CoinGettradepairGetApi'
import { YapiGetV1BannerListApiRequest, YapiGetV1BannerListApiResponse } from '@/typings/yapi/BannerListV1GetApi'
import {
  YapiGetV1TradePairRecommendApiRequest,
  YapiGetV1TradePairRecommendApiResponse,
} from '@/typings/yapi/TradePairRecommendV1GetApi'
import {
  YapiGetV1HomeCarouselList2ApiRequest,
  YapiGetV1HomeCarouselList2ApiResponse,
} from '@/typings/yapi/HomeCarouselList2V1GetApi'
import { queryTradeNotifications } from './trade'

/**
 * get banner list
 */
export const getBanners: MarkcoinRequest<YapiGetV1BannerListApiRequest, YapiGetV1BannerListApiResponse['data']> = (
  params = {}
) => {
  return request({
    path: '/v1/banner/list',
    method: 'GET',
    params,
  })
}

export const getTradePair: MarkcoinRequest<
  YapiGetCoinGetTradePairApiRequest,
  YapiGetCoinGetTradePairApiResponse['data']
> = (params = { type: '1' }) => {
  return request({
    path: '/coin/getTradePair',
    method: 'GET',
    params,
  })
}

export const getTradePairRecommend: MarkcoinRequest<
  YapiGetV1TradePairRecommendApiRequest,
  YapiGetV1TradePairRecommendApiResponse['data']
> = (params = { type: '1' }) => {
  return request({
    path: '/v1/tradePair/recommend',
    method: 'GET',
    params,
  })
}

/**
 * [首页 - 轮播图↗](https://yapi.nbttfc365.com/project/44/interface/api/19394)
 * */
export const getV1HomeCarouselList2ApiRequest: MarkcoinRequest<
  YapiGetV1HomeCarouselList2ApiRequest,
  YapiGetV1HomeCarouselList2ApiResponse['data']
> = params => {
  return request({
    path: '/v1/homeCarousel/list2',
    method: 'GET',
    params,
  })
}

export const getNotices = () => queryTradeNotifications({ operateType: 1, symbol: '', coindIdList: [] })
