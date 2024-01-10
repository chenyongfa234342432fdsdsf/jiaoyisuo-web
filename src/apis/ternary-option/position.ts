import request, { MarkcoinRequest } from '@/plugins/request'
import { IOptionCurrentPositionReq, IOptionCurrentPositionResp } from '@/typings/api/ternary-option/position'

/**
 * [三元期权 - 当前持仓↗](https://yapi.nbttfc365.com/project/44/interface/api/10919)
 * */
export const getOptionCurrentPositionApi: MarkcoinRequest<
  IOptionCurrentPositionReq,
  IOptionCurrentPositionResp
> = params => {
  return request({
    path: '/v1/option/orders/current',
    method: 'GET',
    params,
  })
}
