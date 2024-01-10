import request, { MarkcoinRequest } from '@/plugins/request'
import {
  YapiGetV1MemberVipBaseAvatarListApiRequest,
  YapiGetV1MemberVipBaseAvatarListApiResponse,
} from '@/typings/yapi/MemberVipBaseAvatarListV1GetApi'
import {
  YapiGetV1MemberVipBaseBenefitListApiRequest,
  YapiGetV1MemberVipBaseBenefitListApiResponse,
} from '@/typings/yapi/MemberVipBaseBenefitListV1GetApi'
import {
  YapiPostV1MemberVipBaseDressAvatarApiRequest,
  YapiPostV1MemberVipBaseDressAvatarApiResponse,
} from '@/typings/yapi/MemberVipBaseDressAvatarV1PostApi'
import {
  YapiGetV1MemberVipBaseFeeListApiRequest,
  YapiGetV1MemberVipBaseFeeListApiResponse,
} from '@/typings/yapi/MemberVipBaseFeeListV1GetApi'
import {
  YapiGetV1MemberVipBaseInfoApiRequest,
  YapiGetV1MemberVipBaseInfoApiResponse,
} from '@/typings/yapi/MemberVipBaseInfoV1GetApi'
import {
  YapiPostV1MemberBaseExtendInfoApiRequest,
  YapiPostV1MemberBaseExtendInfoApiResponse,
} from '@/typings/yapi/MemberBaseExtendInfoV1PostApi'
import {
  YapiGetV1MemberVipBaseConfigListApiRequest,
  YapiGetV1MemberVipBaseConfigListApiResponse,
} from '@/typings/yapi/MemberVipBaseConfigListV1GetApi'
import {
  YapiGetV1MemberVipBaseConfigApiRequest,
  YapiGetV1MemberVipBaseConfigApiResponse,
} from '@/typings/yapi/MemberVipBaseConfigV1GetApi'

import {
  YapiGetV1MemberVipBaseTradeFeeApiRequest,
  YapiGetV1MemberVipBaseTradeFeeApiResponse,
} from '@/typings/yapi/MemberVipBaseTradeFeeV1GetApi'
import {
  YapiGetV1ChainStarGetDynamicNavigationApiRequest,
  YapiGetV1ChainStarGetDynamicNavigationApiResponse,
} from '@/typings/yapi/ChainStarGetDynamicNavigationV1GetApi'

/**
 * [会员基本信息获取↗](https://yapi.nbttfc365.com/project/44/interface/api/18794)
 * */
export const getV1MemberVipBaseInfoApiRequest: MarkcoinRequest<
  YapiGetV1MemberVipBaseInfoApiRequest,
  YapiGetV1MemberVipBaseInfoApiResponse // ['data']
> = params => {
  return request({
    path: '/v1/member/vip/base/info',
    method: 'GET',
    params,
  })
}

/**
 * [VIP 跳转菜单查询↗](https://yapi.nbttfc365.com/project/44/interface/api/18979)
 * */
export const getV1ChainStarGetDynamicNavigationApiRequest: MarkcoinRequest<
  YapiGetV1ChainStarGetDynamicNavigationApiRequest,
  YapiGetV1ChainStarGetDynamicNavigationApiResponse['data']
> = params => {
  return request({
    path: '/v1/chainStar/getDynamicNavigation',
    method: 'GET',
    params,
  })
}

// ====================================================== //
// =================== vip perks APIs =================== //
// ====================================================== //

/**
 * [获取权益列表↗](https://yapi.nbttfc365.com/project/44/interface/api/18919)
 * */
export const getV1MemberVipBaseBenefitListApiRequest: MarkcoinRequest<
  YapiGetV1MemberVipBaseBenefitListApiRequest,
  YapiGetV1MemberVipBaseBenefitListApiResponse['data']
> = params => {
  return request({
    path: '/v1/member/vip/base/benefitList',
    method: 'GET',
    params,
  })
}

/**
 * [会员等级基础配置信息列表获取↗](https://yapi.nbttfc365.com/project/44/interface/api/18924)
 * */
export const getV1MemberVipBaseConfigListApiRequest: MarkcoinRequest<
  YapiGetV1MemberVipBaseConfigListApiRequest,
  YapiGetV1MemberVipBaseConfigListApiResponse['data']
> = params => {
  return request({
    path: '/v1/member/vip/base/configList',
    method: 'GET',
    params,
  })
}

/**
 * [会员等级基础配置信息获取-x 详情↗](https://yapi.nbttfc365.com/project/44/interface/api/18854)
 * */
export const getV1MemberVipBaseConfigApiRequest: MarkcoinRequest<
  YapiGetV1MemberVipBaseConfigApiRequest,
  YapiGetV1MemberVipBaseConfigApiResponse['data']
> = params => {
  return request({
    path: '/v1/member/vip/base/config',
    method: 'GET',
    params,
  })
}

// ====================================================== //
// ====================== vip fees ====================== //
// ====================================================== //

/**
 * [会员等级费率列表↗](https://yapi.nbttfc365.com/project/44/interface/api/18799)
 * */
export const getV1MemberVipBaseFeeListApiRequest: MarkcoinRequest<
  YapiGetV1MemberVipBaseFeeListApiRequest,
  YapiGetV1MemberVipBaseFeeListApiResponse['data']
> = params => {
  return request({
    path: '/v1/member/vip/base/feeList',
    method: 'GET',
    params,
  })
}

/**
 * [合约/现货 币对费率详情↗](https://yapi.nbttfc365.com/project/44/interface/api/18809)
 * */
export const getV1MemberVipBaseTradeFeeApiRequest: MarkcoinRequest<
  YapiGetV1MemberVipBaseTradeFeeApiRequest,
  YapiGetV1MemberVipBaseTradeFeeApiResponse['data']
> = params => {
  return request({
    path: '/v1/member/vip/base/tradeFee',
    method: 'GET',
    params,
  })
}

// ====================================================== //
// ===================== vip avatars ==================== //
// ====================================================== //

/**
 * [会员头像装扮↗](https://yapi.nbttfc365.com/project/44/interface/api/18834)
 * */
export const postV1MemberVipBaseDressAvatarApiRequest: MarkcoinRequest<
  YapiPostV1MemberVipBaseDressAvatarApiRequest,
  YapiPostV1MemberVipBaseDressAvatarApiResponse['data']
> = data => {
  return request({
    path: '/v1/member/vip/base/dressAvatar',
    method: 'POST',
    data,
  })
}

/**
 * [获取头像装扮列表↗](https://yapi.nbttfc365.com/project/44/interface/api/18819)
 * */
export const getV1MemberVipBaseAvatarListApiRequest: MarkcoinRequest<
  YapiGetV1MemberVipBaseAvatarListApiRequest,
  YapiGetV1MemberVipBaseAvatarListApiResponse['data']
> = params => {
  return request({
    path: '/v1/member/vip/base/avatarList',
    method: 'GET',
    params,
  })
}

// ====================================================== //
// ==================== vip user info =================== //
// ====================================================== //

/**
 * [个人信息更新 (头像、昵称、简介)↗](https://yapi.nbttfc365.com/project/44/interface/api/18879)
 * */
export const postV1MemberBaseExtendInfoApiRequest: MarkcoinRequest<
  YapiPostV1MemberBaseExtendInfoApiRequest,
  YapiPostV1MemberBaseExtendInfoApiResponse['data']
> = data => {
  // data = {
  //   nickName: undefined,
  //   introduction: undefined,
  //   avatarPath: undefined,
  //   ...data,
  // }
  return request({
    path: '/v1/member/base/extendInfo',
    method: 'POST',
    data,
  })
}
