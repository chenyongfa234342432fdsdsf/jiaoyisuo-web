/* ==========  代理商枚举值定义 ========== */

/**
 * 公共继承部分
 */

type inheritInvitationCode = {
  invitationCodeId: number // 邀请码 id
}

/**
 * 申请金字塔代理商
 */
export type IAgenApplyPyramidResp = {
  contact: number | string
  contactInformation: string
  mobileCountryCd?: string
  socialMedia: string
  socialMediaInfo: string
  content?: string
}
export type IAgenApplyPyramidReq = {
  contact: number | string
  contactInformation: string
  mobileCountryCd?: string
  socialMedia: string
  socialMediaInfo: string
  content?: string
}

/**
 * 金字塔代理商状态查询
 */

export type AgenPyramidStatusQuery = {}
export type AgenPyramidStatusParmes = {
  showBanner: boolean
  applyStatus: number
  rejectReasonId: string
}

/**
 *  邀请码黑名单
 */
export type IApplyBlackListReq = {}
export type IApplyBlackListResp = {
  uid: string
  businessId: string
  reasonMsg: string
  inBlacklist: boolean
}

/**
 *  邀请码列表
 */
export type IApplyInvitationCodeList = {
  id: number
  /** 邀请码 */
  invitationCode: string
  /** 名称 */
  name: string
  /** 1=默认邀请码，2=非默认邀请码 */
  isDefault: number
  /** 好友数 (该邀请码邀请的人数) */
  invitedNum: number
  /** 创建时间 */
  createdByTime: number
  products: {
    /** 产品线 code, 数据字典 agent_product_cd */
    productCd: string
    /** 自身返佣比例 */
    selfRebate: number
    /** 好友返佣比例 */
    childRebate: number
  }[]
  /** 邀请码 */
  createdCode?: number
}
export type IApplyInvitationCodeIesResp = {
  page: string // 页数
  pageSize: string // 条数
}
export type IApplyInvitationCodeResp = {
  /** 金字塔返佣信息 */
  list: IApplyInvitationCodeList[]
  /** 总数	 */
  total: number
  /** 分享海报 */
  slogan: string
  pageNum: number
  pageSize: number
}

/**
 * 邀请码邀请的好友
 */
export type AgeninvitationCodesDate = {
  invitedUid: number
  createdByTime: number
}
export type IApplyInvitedPeopleTypeReq = {
  invitationCode: string // 邀请码
}
export type IApplyInvitationCodeParamsResp = {
  list: AgeninvitationCodesDate[]
}

/**
 * 设为默认邀请码
 * */
export type IApplyInvitationCodeTypeReq = inheritInvitationCode & {
  name?: string // 邀请码名称
  invitationCodeId?: number // 邀请码 id
}
export type IApplyInvitationCodeDefaultResp = {}

/**
 *  修改邀请码返佣比例
 */
export type AgenInvitationRatioBody = {
  productCd: string
  selfRatio: number
  childRatio: number
}
export type IApplyInvitationCodeRatioReq = {
  invitationCodeId?: number
  ratios: AgenInvitationRatioBody[]
}

/**
 * 新增邀请码
 */
export type IApplyInvitationCodeAddReq = {
  /** 邀请码名称 */
  name: string
  /** 是否默认 */
  isDefault: number
  /** 产品线数据 */
  ratios: AgenInvitationRatioBody[]
}

/**
 * 产品线查询
 */
export type AgenProductListDate = {
  productId: string
  productName: string
  /** 产品线名称 */
  nameTitle?: string
  /** 区间比例 */
  Comparison?: number
  /** 好友比例 */
  FriendRatio?: number
}
export type IApplyProductListReq = {}
export type IApplyProductListResp = AgenProductListDate[]

/**
 * 查询金字塔产品线返佣比例
 */
export type IApplyProductRatioReq = {}
export type AgentProductRatioDate = {
  /** 比例总数 **/
  total?: number
  /** 产品线 ID */
  productCd: string
  /** 产品线比例 */
  selfRatio: number
  /** 产品线名称 */
  codeKey?: string
  /** 区间比例 */
  Comparison?: number
  /** 好友比例 */
  FriendRatio?: number
  /** 好友比例 */
  childRatio: number
}
export type IApplyProductRatioResp = {
  products: AgentProductRatioDate[]
}

/**
 * 金字塔返佣申请 (未通过时) 设置为已读
 * **/
export type IApplyPyramidReadReq = {}
export type IApplyPyramidReadResp = {}

/**
 * 邀请返佣 - 删除邀请码
 * **/
export type IApplyInvitationCodeDeleteReq = {
  invitationCodeId: number
}

export type IApplyInvitationCodeDeleteResp = {}

/**
 * 申请金字塔时可获得的最大返佣比例
 * **/
export type IApplyPyramidMaxRatioReq = {}
export type IApplyPyramidMaxRatioResp = {
  maxRatio: number
}
