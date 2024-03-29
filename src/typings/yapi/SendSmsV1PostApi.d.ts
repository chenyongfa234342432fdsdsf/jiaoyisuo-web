/* prettier-ignore-start */
/* tslint:disable */
/* eslint-disable */

/* 该文件由 yapi-to-typescript 自动生成，请勿直接修改！！！ */

/**
 * 接口 [发送短信验证码↗](https://yapi.nbttfc365.com/project/44/interface/api/554) 的 **请求类型**
 *
 * @分类 [用户中心↗](https://yapi.nbttfc365.com/project/44/interface/api/cat_85)
 * @请求头 `POST /v1/send/sms`
 * @更新时间 `2023-09-06 17:08:36`
 */
export interface YapiPostV1SendSmsApiRequest {
  /**
   *     类型1注册，2登录，3.提币 4.已登录修改密码 5.修改邮箱前进行通用验证 6.关闭邮箱前进行通用验证  9修改手机号前进行通用验证 10关闭手机号前进行通用验证 11.修改手机号码 12绑定手机号码 13重置安全项验证 21商户注册 24用户注销申请
   */
  type: number
  /**
   * 手机号，未登陆必传
   */
  mobile?: string
  /**
   * 手机区号，未登陆必传
   */
  mobileCountryCode?: string
  businessId?: string
  uid?: string
}

/**
 * 接口 [发送短信验证码↗](https://yapi.nbttfc365.com/project/44/interface/api/554) 的 **返回类型**
 *
 * @分类 [用户中心↗](https://yapi.nbttfc365.com/project/44/interface/api/cat_85)
 * @请求头 `POST /v1/send/sms`
 * @更新时间 `2023-09-06 17:08:36`
 */
export interface YapiPostV1SendSmsApiResponse {
  /**
   * 200成功，其他失败
   */
  code: number
  /**
   * 返回信息
   */
  messsage: string
  data: YapiPostV1SendSmsData
}
/**
 * 返回数据
 */
export interface YapiPostV1SendSmsData {
  /**
   * true成功，false,失败
   */
  isSuccess: boolean
}

// 以下为自动生成的 api 请求，需要使用的话请手动复制到相应模块的 api 请求层
// import request, { MarkcoinRequest } from '@/plugins/request'

// /**
// * [发送短信验证码↗](https://yapi.nbttfc365.com/project/44/interface/api/554)
// **/
// export const postV1SendSmsApiRequest: MarkcoinRequest<
//   YapiPostV1SendSmsApiRequest,
//   YapiPostV1SendSmsApiResponse['data']
// > = data => {
//   return request({
//     path: "/v1/send/sms",
//     method: "POST",
//     data
//   })
// }

/* prettier-ignore-end */
