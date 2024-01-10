import request, { MarkcoinRequest } from '@/plugins/request'
import {
  YapiGetV1AgentAbnormalApiRequest,
  YapiGetV1AgentAbnormalApiResponse,
} from '@/typings/yapi/AgentAbnormalV1GetApi'
import {
  YapiPostV1AgentActivationUserInfoApiRequest,
  YapiPostV1AgentActivationUserInfoApiResponse,
} from '@/typings/yapi/AgentActivationUserInfoV1PostApi'
import {
  YapiPostV1AgentActivationApiRequest,
  YapiPostV1AgentActivationApiResponse,
} from '@/typings/yapi/AgentActivationV1PostApi'
import {
  YapiGetV1AgentInvitationCodeQueryProductCdApiRequest,
  YapiGetV1AgentInvitationCodeQueryProductCdApiResponse,
} from '@/typings/yapi/AgentInvitationCodeQueryProductCdV1GetApi'
import {
  YapiGetV1AgentInviteAnalysisOverviewApiRequest,
  YapiGetV1AgentInviteAnalysisOverviewApiResponse,
} from '@/typings/yapi/AgentInviteAnalysisOverviewV1GetApi'
import {
  YapiPostV2AgentInviteDetailsAnalysisApiRequest,
  YapiPostV2AgentInviteDetailsAnalysisApiResponse,
} from '@/typings/yapi/AgentInviteDetailsAnalysisV2PostApi'
import {
  YapiGetV1AgentRebateAnalysisOverviewApiRequest,
  YapiGetV1AgentRebateAnalysisOverviewApiResponse,
} from '@/typings/yapi/AgentRebateAnalysisOverviewV1GetApi'
import {
  YapiPostV1AgentUpdateInvitedUserRebateRatioApiRequest,
  YapiPostV1AgentUpdateInvitedUserRebateRatioApiResponse,
} from '@/typings/yapi/AgentUpdateInvitedUserRebateRatioV1PostApi'
import {
  YapiGetV2AgtRebateInfoHistoryOverviewApiRequest,
  YapiGetV2AgtRebateInfoHistoryOverviewApiResponse,
} from '@/typings/yapi/AgtRebateInfoHistoryOverviewV2GetApi'

/* ========== 代理商 邀请返佣 ========== */

/**
 * [查询代理加普通一共开通的产品线↗](https://yapi.nbttfc365.com/project/44/interface/api/5479)
 * */
export const getV1AgentInvitationCodeQueryProductCdApiRequest: MarkcoinRequest<
  YapiGetV1AgentInvitationCodeQueryProductCdApiRequest,
  YapiGetV1AgentInvitationCodeQueryProductCdApiResponse['data']
> = params => {
  return request({
    path: '/v1/agent/invitationCode/queryProductCd',
    method: 'GET',
    params,
  })
}

/**
 * [代理商 - 邀请明细分析 V2↗](https://yapi.nbttfc365.com/project/44/interface/api/5949)
 * */
export const postV2AgentInviteDetailsAnalysisApiRequest: MarkcoinRequest<
  YapiPostV2AgentInviteDetailsAnalysisApiRequest,
  YapiPostV2AgentInviteDetailsAnalysisApiResponse['data']
> = data => {
  return request({
    path: '/v2/agent/inviteDetailsAnalysis',
    method: 'POST',
    data,
  })
}

/**
 * [代理商 - 邀请明细-Ta 的活跃度 - 用户信息↗](https://yapi.nbttfc365.com/project/44/interface/api/6004)
 * */
export const postV1AgentActivationUserInfoApiRequest: MarkcoinRequest<
  YapiPostV1AgentActivationUserInfoApiRequest,
  YapiPostV1AgentActivationUserInfoApiResponse['data']
> = data => {
  return request({
    path: '/v1/agent/activation/userInfo',
    method: 'POST',
    data,
  })
}

/**
 * [代理商 - 邀请明细-Ta 的活跃度 - 时间筛选↗](https://yapi.nbttfc365.com/project/44/interface/api/5984)
 * */
export const postV1AgentActivationApiRequest: MarkcoinRequest<
  YapiPostV1AgentActivationApiRequest,
  YapiPostV1AgentActivationApiResponse['data']
> = data => {
  return request({
    path: '/v1/agent/activation',
    method: 'POST',
    data,
  })
}

/**
 * [代理商 - 返佣明细分析 - 总览↗](https://yapi.nbttfc365.com/project/44/interface/api/5934)
 * */
export const getV1AgentRebateAnalysisOverviewApiRequest: MarkcoinRequest<
  YapiGetV1AgentRebateAnalysisOverviewApiRequest,
  YapiGetV1AgentRebateAnalysisOverviewApiResponse['data']
> = params => {
  return request({
    path: '/v1/agent/rebateAnalysis/overview',
    method: 'GET',
    params,
  })
}

/**
 * [代理商 - 邀请明细分析 - 总览↗](https://yapi.nbttfc365.com/project/44/interface/api/5944)
 * */
export const getV1AgentInviteAnalysisOverviewApiRequest: MarkcoinRequest<
  YapiGetV1AgentInviteAnalysisOverviewApiRequest,
  YapiGetV1AgentInviteAnalysisOverviewApiResponse['data']
> = params => {
  return request({
    path: '/v1/agent/inviteAnalysis/overview',
    method: 'GET',
    params,
  })
}

/**
 * [代理商 - 修改邀请用户的返佣比例↗](https://yapi.nbttfc365.com/project/44/interface/api/5979)
 * */
export const postV1AgentUpdateInvitedUserRebateRatioApiRequest: MarkcoinRequest<
  YapiPostV1AgentUpdateInvitedUserRebateRatioApiRequest,
  YapiPostV1AgentUpdateInvitedUserRebateRatioApiResponse['data']
> = data => {
  return request({
    path: '/v1/agent/updateInvitedUserRebateRatio',
    method: 'POST',
    data,
  })
}

/**
 * [用户账户异常提醒 (是否被拉入黑名单)↗](https://yapi.nbttfc365.com/project/44/interface/api/5974)
 * */
export const getV1AgentAbnormalApiRequest: MarkcoinRequest<
  YapiGetV1AgentAbnormalApiRequest,
  YapiGetV1AgentAbnormalApiResponse['data']
> = params => {
  return request({
    path: '/v1/agent/abnormal',
    method: 'GET',
    params,
  })
}

/**
 * [代理商 - 数据总览 V2↗](https://yapi.nbttfc365.com/project/44/interface/api/5924)
 * */
export const getV2AgtRebateInfoHistoryOverviewApiRequest: MarkcoinRequest<
  YapiGetV2AgtRebateInfoHistoryOverviewApiRequest,
  YapiGetV2AgtRebateInfoHistoryOverviewApiResponse['data']
> = params => {
  return request({
    path: '/v2/agtRebateInfoHistory/overview',
    method: 'GET',
    params,
  })
}
