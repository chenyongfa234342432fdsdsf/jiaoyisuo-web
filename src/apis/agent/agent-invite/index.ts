/**
 * 邀请返佣 - 首页接口
 */
import request, { MarkcoinRequest } from '@/plugins/request'
import {
  IAgentInviteCodeDefaultResp,
  IAgentPyramidApplyInfoReq,
  IAgentPyramidApplyInfoResp,
  IAgentRebateRuleReq,
  IAgentRebateRuleResp,
  IAgentSloganResp,
  IBaseOptResp,
  IBaseReq,
  IPyramidInviteCodeRatioReq,
  IRebateLadderReq,
  IRebateLadderResp,
} from '@/typings/api/agent/agent-invite'

/**
 * [邀请返佣 - 获取默认邀请码↗](https://yapi.nbttfc365.com/project/44/interface/api/18499)
 * */
export const getAgentInviteCodeDefault: MarkcoinRequest<IBaseReq, IAgentInviteCodeDefaultResp> = params => {
  return request({
    path: '/v1/agent/invitationCode/default',
    method: 'GET',
    params,
  })
}

/**
 * [邀请返佣 - 金字塔返佣申请信息↗](https://yapi.nbttfc365.com/project/44/interface/api/18429)
 * */
export const getAgentPyramidApplyInfo: MarkcoinRequest<
  IAgentPyramidApplyInfoReq,
  IAgentPyramidApplyInfoResp
> = params => {
  return request({
    path: '/v1/agent/pyramid/applyInfo',
    method: 'GET',
    params,
  })
}

/**
 * [邀请返佣 - 返佣规则↗](https://yapi.nbttfc365.com/project/44/interface/api/18479)
 * */
export const getAgentRebateRule: MarkcoinRequest<IAgentRebateRuleReq, IAgentRebateRuleResp> = params => {
  return request({
    path: '/v1/agent/rebateRule',
    method: 'GET',
    params,
  })
}

/**
 * [邀请返佣 - 金字塔返佣首次设置是否已读↗](https://yapi.nbttfc365.com/project/44/interface/api/18624)
 * */
export const postPyramidFirstSettingHasRead: MarkcoinRequest<IBaseReq, IBaseOptResp> = data => {
  return request({
    path: '/v1/agent/pyramid/firstSetting/read',
    method: 'POST',
    data,
  })
}

/**
 * [邀请返佣 - 查询海报文案↗](https://yapi.nbttfc365.com/project/44/interface/api/18554)
 * */
export const getAgentSlogan: MarkcoinRequest<IBaseReq, IAgentSloganResp> = params => {
  return request({
    path: '/v1/agent/slogan',
    method: 'GET',
    params,
  })
}

/**
 * 代理商 - 邀请返佣 - 修改金字塔邀请码返佣比例
 * https://yapi.nbttfc365.com/project/44/interface/api/18404
 */
export const postPyramidInviteCodeRatio: MarkcoinRequest<IPyramidInviteCodeRatioReq, IBaseOptResp> = data => {
  return request({
    path: '/v1/agent/pyramid/invitationCode/ratio',
    method: 'POST',
    data,
  })
}

/**
 * [邀请返佣 - 返佣阶梯规则↗](https://yapi.nbttfc365.com/project/44/interface/api/18189)
 * */
export const getRebateLadder: MarkcoinRequest<IRebateLadderReq, IRebateLadderResp> = params => {
  return request({
    path: '/v1/agent/system/queryRebateRatioInfo',
    method: 'GET',
    params,
  })
}
