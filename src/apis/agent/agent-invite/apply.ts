/**
 * 邀请码 - 邀请码管理界面
 */

import request, { MarkcoinRequest } from '@/plugins/request'
import {
  IApplyBlackListReq,
  IApplyBlackListResp,
  IApplyInvitationCodeResp,
  IApplyInvitationCodeIesResp,
  IApplyInvitedPeopleTypeReq,
  IApplyInvitationCodeTypeReq,
  IApplyInvitationCodeParamsResp,
  IApplyInvitationCodeDefaultResp,
  IApplyInvitationCodeRatioReq,
  IApplyInvitationCodeAddReq,
  IApplyProductListReq,
  IApplyProductListResp,
  IApplyProductRatioReq,
  IApplyProductRatioResp,
  IApplyPyramidReadReq,
  IApplyPyramidReadResp,
  IApplyInvitationCodeDeleteReq,
  IApplyInvitationCodeDeleteResp,
  IAgenApplyPyramidReq,
  IAgenApplyPyramidResp,
  IApplyPyramidMaxRatioReq,
  IApplyPyramidMaxRatioResp,
} from '@/typings/api/agent/agent-invite/apply'

/* ========== 代理商 邀请码黑名单 ========== */

/**
 *  代理商 - 是否黑名单用户查询
 *  https://yapi.nbttfc365.com/project/44/interface/api/18194
 */
export const fetchBlacklistQuery: MarkcoinRequest<IApplyBlackListReq, IApplyBlackListResp> = () => {
  return request({
    path: '/v1/agent/user/checkBlacklist',
    method: 'GET',
  })
}

/* ========== 代理商 邀请码列表 ========== */

/**
 * 代理商 - 邀请返佣 - 金字塔邀请码列表
 * https://yapi.nbttfc365.com/project/44/interface/api/18379
 */
export const fetchInvitationCodeQuery: MarkcoinRequest<
  IApplyInvitationCodeIesResp,
  IApplyInvitationCodeResp
> = options => {
  return request({
    path: '/v1/agent/pyramid/invitationCode/list',
    method: 'GET',
    params: {
      pageNum: options.page, // 页数
      pageSize: options.pageSize, // 条数
    },
  })
}

/* ========== 代理商 金字塔邀请码邀请的好友查询 ========== */

/**
 *
 * 代理商 - 邀请返佣 - 金字塔邀请码邀请的好友
 * https://yapi.nbttfc365.com/project/44/interface/api/18384
 */
export const fetchInvitationCodes: MarkcoinRequest<
  IApplyInvitedPeopleTypeReq,
  IApplyInvitationCodeParamsResp
> = options => {
  return request({
    path: '/v1/agent/pyramid/invitationCode/invitedPeople',
    method: 'GET',
    params: {
      invitationCode: options.invitationCode, // 好友邀请码
    },
  })
}

/* ========== 代理商 金字塔默认邀请码 ========== */

/**
 * 代理商 - 邀请返佣 - 设为默认邀请码
 * https://yapi.nbttfc365.com/project/44/interface/api/18399
 */
export const fetchDefaultInvCode: MarkcoinRequest<
  IApplyInvitationCodeTypeReq,
  IApplyInvitationCodeDefaultResp
> = options => {
  return request({
    path: '/v1/agent/pyramid/invitationCode/default',
    method: 'POST',
    data: {
      invitationCodeId: options.invitationCodeId, // 邀请码 id
    },
  })
}

/* ========== 代理商 修改金字塔默认邀请码 ========== */

/**
 * 代理商 - 邀请返佣 - 修改金字塔默认邀请码名称
 * https://yapi.nbttfc365.com/project/44/interface/api/18389
 */
export const fetchEditDefaultInvCode: MarkcoinRequest<
  IApplyInvitationCodeTypeReq,
  IApplyInvitationCodeDefaultResp
> = options => {
  return request({
    path: '/v1/agent/pyramid/invitationCode/modifyName',
    method: 'POST',
    data: {
      invitationCodeId: options.invitationCodeId, // 邀请码 id
      name: options.name, // 邀请码名称
    },
  })
}

/* ========== 代理商 修改金字塔邀请码返佣比例 ========== */

/**
 * 代理商 - 邀请返佣 - 修改金字塔邀请码返佣比例
 * https://yapi.nbttfc365.com/project/44/interface/api/18404
 */
export const fetchInvitationRatio: MarkcoinRequest<
  IApplyInvitationCodeRatioReq,
  IApplyInvitationCodeDefaultResp
> = options => {
  return request({
    path: '/v1/agent/pyramid/invitationCode/ratio',
    method: 'POST',
    data: {
      invitationCodeId: options.invitationCodeId, // 邀请码 id
      ratios: options.ratios, // 产品线数据
    },
  })
}

/* ========== 代理商 新增邀请码 ========== */

/**
 * 代理商 - 邀请返佣 - 新增邀请码
 * https://yapi.nbttfc365.com/project/44/interface/api/18409
 */
export const fetchInvitationCodeAdd: MarkcoinRequest<
  IApplyInvitationCodeAddReq,
  IApplyInvitationCodeDefaultResp
> = options => {
  return request({
    path: '/v1/agent/pyramid/invitationCode/add',
    method: 'POST',
    data: {
      name: options.name, // 名称
      isDefault: options.isDefault, // 是否设置为默认邀请码，1=设置为默认，2=非默认
      ratios: options.ratios, // 产品线数据
    },
  })
}

/* ========== 代理商 产品线查询 ========== */

/**
 * 代理商 - 产品线查询
 */
export const fetchProductList: MarkcoinRequest<IApplyProductListReq, IApplyProductListResp> = options => {
  return request({
    path: '/v1/agent/system/getProductList',
    method: 'GET',
  })
}

/* ========== 代理商  查询金字塔产品线返佣比例 ========== */

/**
 * 代理商 - 邀请返佣 - 查询金字塔产品线返佣比例
 * https://yapi.nbttfc365.com/project/44/interface/api/18504
 */
export const fetchProductRatio: MarkcoinRequest<IApplyProductRatioReq, IApplyProductRatioResp> = () => {
  return request({
    path: '/v1/agent/pyramid/product/ratio',
    method: 'GET',
  })
}

/* ========== 代理商  金字塔返佣申请 (未通过时) 设置为已读 ========== */

/**
 * 代理商 - 邀请返佣 - 设置为已读
 * https://yapi.nbttfc365.com/project/44/interface/api/18494
 */

export const fetchApplyRead: MarkcoinRequest<IApplyPyramidReadReq, IApplyPyramidReadResp> = () => {
  return request({
    path: '/v1/agent/pyramid/apply/read',
    method: 'POST',
  })
}

/* ========== 代理商  删除邀请码 ========== */

/**
 * 代理商 - 邀请返佣 - 删除邀请码
 * https://yapi.nbttfc365.com/project/44/interface/api/18414
 */

export const fetchApplydelete: MarkcoinRequest<
  IApplyInvitationCodeDeleteReq,
  IApplyInvitationCodeDeleteResp
> = options => {
  return request({
    path: '/v1/agent/pyramid/invitationCode/delete',
    method: 'POST',
    data: {
      invitationCodeId: options.invitationCodeId, // 邀请码 id
    },
  })
}

/* ========== 代理商 申请代理商 ========== */

/**
 * 代理商 - 申请金字塔反佣成为代理商
 * https://yapi.nbttfc365.com/project/44/interface/api/18424
 */
export const fetchPyramidRebateApplication: MarkcoinRequest<IAgenApplyPyramidReq, IAgenApplyPyramidResp> = options => {
  return request({
    path: `/v1/agent/pyramid/apply`,
    method: 'POST',
    data: {
      contact: options.contact, // 联系类型：1 手机，2 邮箱
      contactInformation: options.contactInformation, // 联系方式，手机号或者邮箱
      mobileCountryCd: options?.mobileCountryCd || '', // 手机区号
      socialMedia: options.socialMedia, // 社交媒体
      socialMediaInfo: options.socialMediaInfo, // 社交媒体账号
      content: options?.content || '', // 补充说明 (选填)
    },
  })
}

/* ========== 代理商 邀请返佣 - 申请金字塔时可获得的最大返佣比例 ========== */

/**
 * 代理商 - 申请金字塔时可获得的最大返佣比例
 * https://yapi.nbttfc365.com/project/44/interface/api/18929
 */
export const fetchAgentPyramidMaxRatio: MarkcoinRequest<
  IApplyPyramidMaxRatioReq,
  IApplyPyramidMaxRatioResp
> = options => {
  return request({
    path: `/v1/agent/pyramid/maxRatio`,
    method: 'GET',
  })
}
