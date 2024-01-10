import { templateId } from '@/helper/env'
import { localeDefault } from '@/helper/i18n'
import Request, { MarkcoinRequest } from '@/plugins/request'
import { baseCommonStore } from '@/store/common'
import {
  YapiGetV1ChainStarGetNavigationApiRequest,
  YapiGetV1ChainStarGetNavigationApiResponse,
} from '@/typings/yapi/ChainStarGetNavigationV1GetApi'
import {
  YapiGetV1HomeColumnGetListApiRequest,
  YapiGetV1HomeColumnGetListApiResponse,
} from '@/typings/yapi/HomeColumnGetListV1GetApi'
import {
  YapiGetV1HomeWebsiteGetDataApiRequest,
  YapiGetV1HomeWebsiteGetDataApiResponse,
} from '@/typings/yapi/HomeWebsiteGetDataV1GetApi'

export const getFooterApiData: MarkcoinRequest<
  YapiGetV1HomeColumnGetListApiRequest,
  YapiGetV1HomeColumnGetListApiResponse['data']
> = params => {
  return Request({
    path: '/v1/home/column/getList',
    method: 'GET',
    params,
    timeout: 3 * 1000,
  })
}

export const getBasicWebApiData: MarkcoinRequest<
  YapiGetV1HomeWebsiteGetDataApiRequest,
  YapiGetV1HomeWebsiteGetDataApiResponse['data']
> = params => {
  return Request({
    path: '/v1/home/website/getData',
    method: 'GET',
    params,
    timeout: 3 * 1000,
  })
}

/**
 * [web 引导图↗](https://yapi.nbttfc365.com/project/44/interface/api/10904)
 * */
export const getV1GuideMapH5GetApiRequest: any = () => {
  const params = { templateId, lanType: localeDefault }
  const { locale } = baseCommonStore.getState()
  params.lanType = locale
  return Request({
    path: '/v1/guideMapH5/get',
    method: 'GET',
    params,
  })
}
/*
 * [获取导航栏↗](https://yapi.nbttfc365.com/project/44/interface/api/11989)
 * */
export const getV1ChainStarGetNavigationApiRequest: MarkcoinRequest<
  YapiGetV1ChainStarGetNavigationApiRequest,
  YapiGetV1ChainStarGetNavigationApiResponse['data']
> = params => {
  return Request({
    path: '/v1/chainStar/getNavigation',
    method: 'GET',
    params,
  })
}
