/**
 * 代理中心 - 首页接口
 */
import request, { MarkcoinRequest } from '@/plugins/request'
import {
  IAgentCenterEarningsDetailReq,
  IAgentCenterEarningsDetailResp,
  IAgentCenterInviteDetailReq,
  IAgentCenterInviteDetailResp,
  IAgentCenterOverviewDataReq,
  IAgentCenterOverviewDataResp,
} from '@/typings/api/agent/agent-center'
import {
  IAgentCenterSetRebateRatioReq,
  IAgentCenterUserLevelListReq,
  IAgentCenterUserLevelListResp,
} from '@/typings/api/agent/agent-center/user'
import { IBaseOptResp, IBaseReq } from '@/typings/api/agent/agent-invite'

/**
 * [代理中心 - 数据总览↗](https://yapi.nbttfc365.com/project/44/interface/api/15199)
 * */
export const getAgentCenterOverviewData: MarkcoinRequest<
  IAgentCenterOverviewDataReq,
  IAgentCenterOverviewDataResp
> = data => {
  return request({
    path: '/v1/agent/center/overviewData',
    method: 'POST',
    data,
  })
}

/**
 * [代理中心 - 收益详情↗](https://yapi.nbttfc365.com/project/44/interface/api/15224)
 * */
export const getAgentCenterEarningsDetail: MarkcoinRequest<
  IAgentCenterEarningsDetailReq,
  IAgentCenterEarningsDetailResp
> = data => {
  return request({
    path: '/v1/agent/center/earningsDetail',
    method: 'POST',
    data,
  })
}

/**
 * [代理中心 - 邀请详情↗](https://yapi.nbttfc365.com/project/44/interface/api/15209)
 * */
export const getAgentCenterInviteeDetail: MarkcoinRequest<
  IAgentCenterInviteDetailReq,
  IAgentCenterInviteDetailResp
> = data => {
  return request({
    path: '/v1/agent/center/inviteeDetail',
    method: 'POST',
    data,
  })
}

/**
 * 获取用户所有代理模式
 */
export const getAgentList: MarkcoinRequest<IBaseReq, string[]> = params => {
  return request({
    path: `/v1/agent/center/getAgentList`,
    method: 'GET',
    params,
  })
}

/**
 * 获取区域代理等级列表
 */
export const getAreaAgentLevelList: MarkcoinRequest<IBaseReq, number[]> = params => {
  return request({
    path: `/v1/agent/system/getAreaAgentLevel`,
    method: 'GET',
    params,
  })
}

/**
 * [代理中心 - 收益详情 - 导出 Excel↗](https://yapi.nbttfc365.com/project/44/interface/api/18734)
 * */
export const postAgentExportEarningsDetail: MarkcoinRequest<IAgentCenterEarningsDetailReq, string> = data => {
  return request({
    path: '/v1/agent/export/earningsDetail',
    method: 'POST',
    data,
  })
}

/**
 * [代理中心 - 邀请详情 - 导出 Excel↗](https://yapi.nbttfc365.com/project/44/interface/api/18904)
 * */
export const postAgentExportInviteDetail: MarkcoinRequest<IAgentCenterInviteDetailReq, string> = data => {
  return request({
    path: '/v1/agent/export/inviteeDetail',
    method: 'POST',
    data,
  })
}

/**
 * 代理中心 - 金字塔代理 - 调整返佣比例
 * https://yapi.nbttfc365.com/project/44/interface/api/18434
 * */
export const getAgentCenterSetRebateRatioByUid: MarkcoinRequest<IAgentCenterSetRebateRatioReq, IBaseOptResp> = data => {
  return request({
    path: '/v1/agent/center/setRebateRatio',
    method: 'POST',
    data: {
      uid: data.uid, // 邀请的用户 uid
      rebateRatio: data.rebateRatio, // 修改比例值
    },
  })
}

/**
 * [获取登录用户的可用级别↗](https://yapi.nbttfc365.com/project/44/interface/api/19114)
 * */
export const getAgentCenterUserLevelList: MarkcoinRequest<
  IAgentCenterUserLevelListReq,
  IAgentCenterUserLevelListResp
> = params => {
  return request({
    path: '/v1/agent/system/queryUserLevel',
    method: 'GET',
    params,
  })
}
