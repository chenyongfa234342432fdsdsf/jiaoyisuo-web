/* prettier-ignore-start */
/* tslint:disable */
/* eslint-disable */

/* 该文件由 yapi-to-typescript 自动生成，请勿直接修改！！！ */

/**
 * 接口 [帮助中心查询最新文章↗](https://yapi.coin-online.cc/project/72/interface/api/2033) 的 **请求类型**
 *
 * @分类 [帮助中心接口↗](https://yapi.coin-online.cc/project/72/interface/api/cat_443)
 * @标签 `帮助中心接口`
 * @请求头 `GET /support/latest`
 * @更新时间 `2022-08-29 13:58:27`
 */
export interface YapiGetSupportLatestApiRequest {}

/**
 * 接口 [帮助中心查询最新文章↗](https://yapi.coin-online.cc/project/72/interface/api/2033) 的 **返回类型**
 *
 * @分类 [帮助中心接口↗](https://yapi.coin-online.cc/project/72/interface/api/cat_443)
 * @标签 `帮助中心接口`
 * @请求头 `GET /support/latest`
 * @更新时间 `2022-08-29 13:58:27`
 */
export interface YapiGetSupportLatestApiResponse {
  code?: number
  data?: YapiDtoCmsSupportLatestVO[]
  msg?: string
  pageNum?: number
  startDate?: string
  time?: number
  totalCount?: number
  totalPages?: number
}
export interface YapiDtoCmsSupportLatestVO {
  /**
   * 类别编码
   */
  code?: string
  /**
   * 内容
   */
  content?: string
  /**
   * 创建人
   */
  createdBy?: string
  /**
   * 创建时间
   */
  createdTime?: number
  /**
   * id
   */
  id?: string
  /**
   * 语言
   */
  lang?: string
  /**
   * 排序
   */
  sortId?: number
  /**
   * 公告code
   */
  supportCode?: number
  /**
   * 标题
   */
  title?: string
  /**
   * 创建时间
   */
  updatedTime?: number
}

/* prettier-ignore-end */
