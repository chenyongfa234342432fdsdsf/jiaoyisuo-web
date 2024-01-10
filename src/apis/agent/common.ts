/**
 * 代理商公共接口，比如黑名单，产品线等
 */
import request, { MarkcoinRequest } from '@/plugins/request'
import { IAgentIsBlackReq, IAgentIsBlackResp } from '@/typings/api/agent/common'

/**
 * [是否黑名单用户查询↗](https://yapi.nbttfc365.com/project/44/interface/api/18194)
 * */
export const postAgentIsBlack: MarkcoinRequest<IAgentIsBlackReq, IAgentIsBlackResp> = params => {
  return request({
    path: '/v1/agent/user/checkBlacklist',
    method: 'GET',
    params,
  })
}
