import request, { MarkcoinRequest } from '@/plugins/request'
import {
  YapiGetV1CouponCouponUsedDetailApiRequest,
  YapiGetV1CouponCouponUsedDetailApiResponse,
} from '@/typings/yapi/CouponCouponUsedDetailV1GetApi'
import { VipCouponListReq, VipCouponListResp } from '@/typings/api/welfare-center/coupons-select'

import { YapiPostV1CouponTemplateAcquireApiRequest } from '@/typings/yapi/CouponTemplateAcquireV1PostApi'

import {
  YapiGetV1CouponTemplateListApiRequest,
  YapiGetV1CouponTemplateListApiResponse,
} from '@/typings/yapi/CouponTemplateListV1GetApi'
import {
  YapiGetV1CouponTypeSceneListApiRequest,
  YapiGetV1CouponTypeSceneListApiResponse,
} from '@/typings/yapi/CouponTypeSceneListV1GetApi'
import {
  YapiGetV1CouponTypesCountApiRequest,
  YapiGetV1CouponTypesCountApiResponse,
} from '@/typings/yapi/CouponTypesCountV1GetApi'

/**
 * [各类卡券数量统计↗](https://yapi.nbttfc365.com/project/44/interface/api/18849)
 * */
export const getV1CouponTypesCountApiRequest: MarkcoinRequest<
  YapiGetV1CouponTypesCountApiRequest,
  YapiGetV1CouponTypesCountApiResponse['data']
> = params => {
  return request({
    path: '/v1/coupon/types/count',
    method: 'GET',
    params,
  })
}

/**
 * [获取优惠券列表↗](https://yapi.nbttfc365.com/project/44/interface/api/18814)
 * */
export const getV1CouponListApiRequest: MarkcoinRequest = params => {
  return request({
    path: '/v1/coupon/list',
    method: 'GET',
    params,
  })
}

/**
 * [获取兑换中心列表↗](https://yapi.nbttfc365.com/project/44/interface/api/18889)
 * */
export const getV1CouponTemplateListApiRequest: MarkcoinRequest<
  YapiGetV1CouponTemplateListApiRequest,
  YapiGetV1CouponTemplateListApiResponse['data']
> = params => {
  return request({
    path: '/v1/coupon/template/list',
    method: 'GET',
    params,
  })
}

/**
 * [领取优惠券↗](https://yapi.nbttfc365.com/project/44/interface/api/18894)
 * */
export const postV1CouponTemplateAcquireApiRequest: MarkcoinRequest<
  YapiPostV1CouponTemplateAcquireApiRequest,
  YapiGetV1CouponTemplateListApiResponse['data']
> = data => {
  return request({
    path: '/v1/coupon/template/acquire',
    method: 'POST',
    data,
  })
}

/**
 * [查询券类型关系↗](https://yapi.nbttfc365.com/project/44/interface/api/18949)
 * */
export const getV1CouponTypeSceneListApiRequest: MarkcoinRequest<
  YapiGetV1CouponTypeSceneListApiRequest,
  YapiGetV1CouponTypeSceneListApiResponse['data']
> = params => {
  return request({
    path: '/v1/coupon/typeSceneList',
    method: 'GET',
    params,
  })
}

/**
 * [优惠券使用详情 (新)↗](https://yapi.nbttfc365.com/project/44/interface/api/19124)
 * */
export const getV1CouponCouponUsedDetailApiRequest: MarkcoinRequest<
  YapiGetV1CouponCouponUsedDetailApiRequest,
  YapiGetV1CouponCouponUsedDetailApiResponse['data']
> = params => {
  return request({
    path: '/v1/coupon/couponUsedDetail',
    method: 'GET',
    params,
  })
}
/**
 * [获取用户可用券及 VIP 费率↗](https://yapi.nbttfc365.com/project/44/interface/api/18989)
 * */
export const getCouponSelectApi: MarkcoinRequest<VipCouponListReq, VipCouponListResp> = params => {
  return request({
    path: '/v1/coupon/selectCoupons',
    method: 'GET',
    params,
  })
}
