/**
 * 代理中心 - 更多用户详情
 */

import request, { MarkcoinRequest } from '@/plugins/request'
import {
  IAgentCenterHisInviteeReq,
  IAgentCenterHisInviteeResp,
  IAgentCenterHisInvitationReq,
  IAgentCenterHisInvitationResp,
  IAgentCenterSetRebateRatioReq,
  IAgentCenterWebMoreDetailReq,
  IAgentCenterWebMoreDetailResp,
  IAgentCenterSetRebateRatioResp,
  IAgentSystemAreaAgentLevelReq,
  IAgentSystemAreaAgentLevelResp,
} from '@/typings/api/agent/agent-center/user'
/**
 * 代理中心 - 邀请详情-TA 的邀请
 * https://yapi.nbttfc365.com/project/44/interface/api/18369
 * */

export const getAgentCenterHisInvitation: MarkcoinRequest<
  IAgentCenterHisInvitationReq,
  IAgentCenterHisInvitationResp
> = params => {
  return request({
    path: '/v1/agent/center/hisInvitation',
    method: 'GET',
    params,
  })
}

/**
 * 代理中心 - 邀请详情-TA 的邀请 - 被邀请人信息
 * https://yapi.nbttfc365.com/project/44/interface/api/18394
 * */

export const getAgentCenterHisInvitee: MarkcoinRequest<
  IAgentCenterHisInviteeReq,
  IAgentCenterHisInviteeResp
> = data => {
  return request({
    path: '/v1/agent/center/hisInvitee',
    method: 'POST',
    data,
  })
}

/**
 * 代理中心 - 金字塔代理 - 调整返佣比例
 * https://yapi.nbttfc365.com/project/44/interface/api/18434
 * */

export const getAgentCenterSetRebateRatio: MarkcoinRequest<
  IAgentCenterSetRebateRatioReq,
  IAgentCenterSetRebateRatioResp
> = data => {
  return request({
    path: '/v1/agent/center/setRebateRatio',
    method: 'POST',
    data,
  })
}

/**
 * 代理中心 - 更多详情-web
 * https://yapi.nbttfc365.com/project/44/interface/api/18509
 * */

export const getAgentCenterWebSetMoreDetail: MarkcoinRequest<
  IAgentCenterWebMoreDetailReq,
  IAgentCenterWebMoreDetailResp
> = data => {
  return request({
    path: '/v1/agent/center/moreDetail',
    method: 'POST',
    data,
  })
}

/**
 * 代理中心 - 区域代理等级查询
 * https://yapi.nbttfc365.com/project/44/interface/api/18684
 * */

export const getAgentSystemAreaAgentLevel: MarkcoinRequest<
  IAgentSystemAreaAgentLevelReq,
  IAgentSystemAreaAgentLevelResp
> = () => {
  return request({
    path: '/v1/agent/system/getAreaAgentLevel',
    method: 'GET',
  })
}

/**
 * 代理中心 - 获取用户所有代理模式
 * https://yapi.nbttfc365.com/project/44/interface/api/18474
 * */

export const getAgentCenterGetAgentList: MarkcoinRequest<
  IAgentSystemAreaAgentLevelReq,
  IAgentSystemAreaAgentLevelResp
> = () => {
  return request({
    path: '/v1/agent/center/getAgentList',
    method: 'GET',
  })
}

/**
 * 代理中心 - 更多详情 - 导出 Excel
 * https://yapi.nbttfc365.com/project/44/interface/api/18724
 * */

export const getAgentSystemExportMoreDetail: MarkcoinRequest<IAgentCenterWebMoreDetailReq, string> = data => {
  return request({
    path: '/v1/agent/export/moreDetail',
    method: 'POST',
    data,
  })
}
