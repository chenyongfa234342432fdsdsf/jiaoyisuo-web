import request, { MarkcoinRequest } from '@/plugins/request'

import {
  YapiGetV1WelfareActivityAllApiRequest,
  YapiGetV1WelfareActivityAllApiResponse,
} from '@/typings/yapi/WelfareActivityAllV1GetApi'
import {
  YapiPostV1WelfareActivityJoinApiRequest,
  YapiPostV1WelfareActivityJoinApiResponse,
} from '@/typings/yapi/WelfareActivityJoinV1PostApi'
import {
  YapiGetV1WelfareActivityListApiRequest,
  YapiGetV1WelfareActivityListApiResponse,
} from '@/typings/yapi/WelfareActivityListV1GetApi'
import {
  YapiGetV1WelfareActivityArticleApiRequest,
  YapiGetV1WelfareActivityArticleApiResponse,
} from '@/typings/yapi/WelfareActivityArticleV1GetApi'

/**
 * [活动中心列表 - 全部 - 分页↗](https://yapi.nbttfc365.com/project/44/interface/api/20119)
 * */
export const getV1WelfareActivityAllApiRequest: MarkcoinRequest<
  YapiGetV1WelfareActivityAllApiRequest,
  YapiGetV1WelfareActivityAllApiResponse['data']
> = params => {
  return request({
    path: '/v1/welfare/activity/all',
    method: 'GET',
    params,
  })
}

/**
 * [活动 - 立即报名↗](https://yapi.nbttfc365.com/project/44/interface/api/19933)
 * */
export const postV1WelfareActivityJoinApiRequest: MarkcoinRequest<
  YapiPostV1WelfareActivityJoinApiRequest,
  YapiPostV1WelfareActivityJoinApiResponse['data']
> = data => {
  return request({
    path: '/v1/welfare/activity/join',
    method: 'POST',
    data,
  })
}

/**
 * [活动中心列表 - 用户 - 分页↗](https://yapi.nbttfc365.com/project/44/interface/api/19927)
 * */
export const getV1WelfareActivityListApiRequest: MarkcoinRequest<
  YapiGetV1WelfareActivityListApiRequest,
  YapiGetV1WelfareActivityAllApiResponse['data']
> = params => {
  return request({
    path: '/v1/welfare/activity/list',
    method: 'GET',
    params,
  })
}

/**
 * [根据 article 获取用户活动参与数据↗](https://yapi.nbttfc365.com/project/44/interface/api/20495)
 * */
export const getV1WelfareActivityArticleApiRequest: MarkcoinRequest<
  YapiGetV1WelfareActivityArticleApiRequest,
  YapiGetV1WelfareActivityArticleApiResponse['data']
> = params => {
  return request({
    path: '/v1/welfare/activity/article',
    method: 'GET',
    params,
  })
}
