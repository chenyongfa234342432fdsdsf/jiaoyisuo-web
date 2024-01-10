import request, { MarkcoinRequest } from '@/plugins/request'

import {
  YapiPostV1WelfareMissionJoinApiRequest,
  YapiPostV1WelfareMissionJoinApiResponse,
} from '@/typings/yapi/WelfareMissionJoinV1PostApi'
import {
  YapiGetV1WelfareMissionListApiRequest,
  YapiGetV1WelfareMissionListApiResponse,
} from '@/typings/yapi/WelfareMissionListV1GetApi'
import {
  YapiGetV1WelfareMissionRecordsApiRequest,
  YapiGetV1WelfareMissionRecordsApiResponse,
} from '@/typings/yapi/WelfareMissionRecordsV1GetApi'

/**
 * [任务中心列表 - 点击去完成↗](https://yapi.nbttfc365.com/project/44/interface/api/19903)
 * */
export const postV1WelfareMissionJoinApiRequest: MarkcoinRequest<
  YapiPostV1WelfareMissionJoinApiRequest,
  YapiPostV1WelfareMissionJoinApiResponse['data']
> = data => {
  return request({
    path: '/v1/welfare/mission/join',
    method: 'POST',
    data,
  })
}

/**
 * [任务中心列表 - 分页↗](https://yapi.nbttfc365.com/project/44/interface/api/19891)
 * */
export const getV1WelfareMissionListApiRequest: MarkcoinRequest<
  YapiGetV1WelfareMissionListApiRequest,
  YapiGetV1WelfareMissionListApiResponse['data']
> = params => {
  return request({
    path: '/v1/welfare/mission/list',
    method: 'GET',
    params,
  })
}

/**
 * [任务完成记录 - 分页↗](https://yapi.nbttfc365.com/project/44/interface/api/19915)
 * */
export const getV1WelfareMissionRecordsApiRequest: MarkcoinRequest<
  YapiGetV1WelfareMissionRecordsApiRequest,
  YapiGetV1WelfareMissionRecordsApiResponse['data']
> = params => {
  return request({
    path: '/v1/welfare/mission/records',
    method: 'GET',
    params,
  })
}
