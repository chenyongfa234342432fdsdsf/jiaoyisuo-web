/**
 * 代理中心
 */
/**
 * 接口 [代理中心 - 数据总览↗](https://yapi.nbttfc365.com/project/44/interface/api/15199) 的 **请求类型**
 */
export interface IAgentCenterOverviewDataReq {
  /** 模式 */
  model: string
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime: number
  /** 日期类型，主要前端用 */
  dateType?: number
}

export interface IAgentCenterOverviewDataResp {
  areaAgentRebateDto?: IAreaAgentRebateDtoOverviewData
  pyramidAgentRebateDto?: IPyramidAgentRebateDtoOverviewData
  threeLevelAgentRebateDto?: IThirdLevelAgentRebateDtoOverviewData
  /** 代理商法币 */
  currencySymbol?: string
  /** 法币精度 */
  currencyOffset?: number
  /** web 站 logo */
  webLogo?: string
  /** app 站 logo */
  appLogo?: string
}
export interface IAgentRebateOverviewData {
  /** 返佣金额 */
  rebateAmount?: number
  /** 返佣等级 */
  rebateLevel?: number
  /** 返佣比例 */
  rebateRatio?: number
  /** 团队手续费 */
  teamFee?: string
  /** 邀请人数 */
  inviteNum?: number
  /** 团队人数 */
  teamNum?: number
  /** 邀请人数 - 时间段内新增 */
  inviteNewAdd?: number
  /** 团队人数 - 时间段内新增 */
  teamNewAdd?: number
  /** 一级返佣比例 */
  firstRebateRatio?: number
  /** 二级返佣比例 */
  secondRebateRatio?: number
  /** 三级返佣比例 */
  thirdRebateRatio?: number
  /** 一级手续费 */
  firstLevelFee?: number
  /** 二级手续费 */
  secondLevelFee?: number
  /** 三级手续费 */
  thirdLevelFee?: number
}
/**
 * 区域代理返佣
 */
export interface IAreaAgentRebateDtoOverviewData {
  /** 返佣金额 */
  rebateAmount?: number
  /** 返佣等级 */
  rebateLevel?: number
  /** 返佣比例 */
  rebateRatio?: number
  /** 团队手续费 */
  teamFee?: string
  /** 邀请人数 */
  inviteNum?: number
  /** 团队人数 */
  teamNum?: number
  /** 邀请人数 - 时间段内新增 */
  inviteNewAdd?: number
  /** 团队人数 - 时间段内新增 */
  teamNewAdd?: number
}
/**
 * 金字塔代理返佣
 */
export interface IPyramidAgentRebateDtoOverviewData {
  /** 返佣金额 */
  rebateAmount?: number
  /** 团队手续费 */
  teamFee?: string
  /** 邀请人数 */
  inviteNum?: number
  /** 团队人数 */
  teamNum?: number
  /** 邀请人数 - 时间段内新增 */
  inviteNewAdd?: number
  /** 团队人数 - 时间段内新增 */
  teamNewAdd?: number
}
/**
 * 三级代理返佣
 */
export interface IThirdLevelAgentRebateDtoOverviewData {
  /** 返佣金额 */
  rebateAmount?: number
  /** 一级返佣比例 */
  firstRebateRatio?: number
  /** 二级返佣比例 */
  secondRebateRatio?: number
  /** 三级返佣比例 */
  thirdRebateRatio?: number
  /** 返佣等级 */
  rebateLevel?: number
  /** 一级手续费 */
  firstLevelFee?: number
  /** 二级手续费 */
  secondLevelFee?: number
  /** 三级手续费 */
  thirdLevelFee?: number
  /** 邀请人数 */
  inviteNum?: number
  /** 邀请人数 - 时间段内新增 */
  inviteNewAdd?: number
}

/**
 * 接口 [代理中心 - 收益详情↗](https://yapi.nbttfc365.com/project/44/interface/api/15224) 的 **请求类型**
 */
export interface IAgentCenterEarningsDetailReq {
  /** 模式 ("threeLevel", "三级代理"), PYRAMID("pyramid", "金字塔代理"), AREA("area", "区域代理") */
  model?: string;
  /** 产品线 */
  productCd?: string;
  /** 收益计算开始时间 */
  startTime?: number;
  /** 收益计算结束时间 */
  endTime?: number;
  /** 返佣类型 */
  rebateType?: string;
  /** 金额大小范围 (USD) 最低价 */
  minAmount?: string;
  /** 金额大小范围 (USD) 最高价 */
  maxAmount?: string;
  /** 返佣层级 */
  rebateLevel?: number;
  pageNum: number;
  pageSize: number;
  /** 排序字段，默认按时间倒序 可传字段：1 返佣时间；2 手续费；3 结算币种数量 */
  sort?: number
  /** 排序规则 1.正，2.倒 */
  sortRule?: number
}

export interface IAgentCenterEarningsDetailResp {
  /** 金字塔代理收益详情列表 */
  pyramidAgentRebateList?: IPyramidAgentRebateList[]
  /** 区域代理收益详情列表 */
  areaAgentRebateList?: IAreaAgentRebateList[]
  thirdLevelAgentRebateList?: IThirdLevelAgentRebateList[]
  pageNum?: number;
  pageSize?: number;
  total?: number;
}

export interface IAgentCenterRebateDetailData {
  id?:string
  /** 返佣的币种代码 */
  symbol?: string
  /** 返佣的币种代码精度 */
  currencyOffset?: number
  /** 返佣币种数量 */
  amount?: number
  /** 团队手续费（USDT） */
  teamFee?: number
  /** 下级 UID */
  childUid?: number
  /** 产品线 */
  productCd?: string
  /** 我的返佣比例 */
  selfRatio?: number
  /** 好友的 */
  childRatio?: number
  /** 返佣类型 */
  rebateType?: string
  /** 返佣时间 */
  rebateDate?: number
  /** TA 的手续费 (USDT) */
  fee?: number
   /** TA 的层级/区域等级 */
  rebateLevel?: string
  /** 返佣比例 */
  rebateRatio?: string
  /** 实际返佣比例 */
  ratioActual?: string
}
export interface IPyramidAgentRebateList {
  /** 返佣的币种代码 */
  symbol?: string
  /** 返佣的币种代码精度 */
  currencyOffset?: number
  /** 返佣币种数量 */
  amount?: number
  /** 团队手续费（USDT） */
  teamFee?: number
  /** 下级 UID */
  childUid?: number
  /** 产品线 */
  productCd?: string
  /** 我的返佣比例 */
  selfRatio?: number
  /** 好友的 */
  childRatio?: number
  /** 返佣类型 */
  rebateType?: string
  /** 返佣时间 */
  rebateDate?: number
  /** TA 的层级/区域等级 */
  rebateLevel?: string
  /** 返佣比例 */
  rebateRatio?: string
  /** 实际返佣比例 */
  ratioActual?: string
}
export interface IAreaAgentRebateList {
  /** 返佣的币种代码 */
  symbol?: string
  /** 返佣的币种代码精度 */
  currencyOffset?: number
  /** 返佣币种数量 */
  amount?: number
  /** 团队手续费（USDT） */
  teamFee?: number
  /** 下级 UID */
  childUid?: number
  /** TA 的层级/区域等级 */
  rebateLevel?: string
  /** 返佣比例 */
  rebateRatio?: string
  /** 产品线 */
  productCd?: string
  /** 返佣类型 */
  rebateType?: string
  /** 返佣时间 */
  rebateDate?: number
  /** 实际返佣比例 */
  ratioActual?: string
}
export interface IThirdLevelAgentRebateList {
  /** 返佣的币种代码 */
  symbol?: string
  /** 返佣的币种代码精度 */
  currencyOffset?: number
  /** 返佣币种数量 */
  amount?: number
  /** TA 的手续费 (USDT) */
  fee?: number
  /** TA 的层级 */
  rebateLevel?: string
  /** 返佣比例 */
  rebateRatio?: string
  /** 下级 UID */
  childUid?: number
  /** 产品线 */
  productCd?: string
  /** 返佣时间 */
  rebateDate?: number
  /** 实际返佣比例 */
  ratioActual?: string
}

/**
 * 接口 [代理中心 - 邀请详情↗](https://yapi.nbttfc365.com/project/44/interface/api/15209) 的 **请求类型**
 */
export interface IAgentCenterInviteDetailReq {
  /** 被邀请的用户 uid(模糊查询) */
  uid?: string
  /** 模式 */
  model?: string
  /** 排序字段，默认按时间倒序 可传字段：1 时间；2 邀请人数；3 团队人数 */
  sort?: number
  /** 排序规则 1.正，2.倒 */
  registerDateSort?: number
  /** 代理等级 (区域代理字段) */
  rebateLevel?: number | string;
  /** 实名状态，1.是，2.否 */
  isRealName?: number
  /** 团队人数 (低) */
  teamNumMin?: string
  /** 团队人数 (高) */
  teamNumMax?: string
  /** 注册时间 (起) */
  startTime?: number
  /** 注册时间 (止) */
  endTime?: number
  /** 当前页 */
  pageNum?: number
  /** 每页条数 */
  pageSize?: number
}

export interface IAgentCenterInviteDetailResp {
  /** 金字塔邀请详情列表 */
  pyramidAgentInviteeList?: IPyramidAgentInviteeList[]
  /** 区域代理邀请详情列表 */
  areaAgentInviteeList?: IAreaAgentInviteeList[]
  thirdLevelAgentInviteeList?: IThirdLevelAgentInviteeList[]
  /** 当前页 */
  pageNum?: number
  /** 每页条数 */
  pageSize?: number
  total?:number
}

export interface IAgentCenterInviteDetailData {
  /** TA 的邀请人数 */
  inviteNum?: number
  /** 是否已实名，1.是，2.否 */
  isRealName?: number
  /** 注册时间 */
  registerDate?: number
  /** TA 的团队人数 */
  teamNum?: number
  /** uid */
  uid?: string
  /** 金字塔产品返佣 */
  productRebateList?: IProductRebateList[]
  /** 昵称：昵称＞邮箱＞手机号 */
  nickName?: string
  /** 是否调整过比例 1 是，2 否 */
  isTrimRatio?: number
  /** 区域等级标签 */
  rebateLevel?: number
  /** TA 的区域返佣比例 */
  rebateRatio?: number
}

export interface IPyramidAgentInviteeList {
  /** TA 的邀请人数 */
  inviteNum?: number
  /** 是否已实名，1.是，2.否 */
  isRealName?: number
  /** 注册时间 */
  registerDate?: number
  /** TA 的团队人数 */
  teamNum?: number
  /** uid */
  uid?: string
  /** 金字塔产品返佣 */
  productRebateList?: IProductRebateList[]
  /** 昵称：昵称＞邮箱＞手机号 */
  nickName?: string
  /** 是否调整过比例 1 是，2 否 */
  isTrimRatio?: number
}
export interface  IProductRebateList{
  /** 我的返佣比例 */
  selfRatio?: number
  /** 好友返佣比例 */
  childRatio?: number
  /** 现货、合约、娱乐区、三元期权等 */
  productCd?: string
}
export interface  IAreaAgentInviteeList{
  /** TA 的团队人数 */
  teamNum?: number
  /** uid */
  uid?: number
  /** 区域等级标签 */
  rebateLevel?: number
  /** TA 的邀请人数 */
  inviteNum?: number
  /** 昵称：昵称＞邮箱＞手机号 */
  nickName?: string
  /** 注册时间 */
  registerDate?: number
  /** TA 的区域返佣比例 */
  rebateRatio?: number
  /** 是否已实名，1.是，2.否 */
  isRealName?: number
}
export interface IThirdLevelAgentInviteeList {
  /** 昵称：昵称＞邮箱＞手机号 */
  nickName?: string
  /** 是否已实名，1.是，2.否 */
  isRealName?: number
  /** uid */
  uid?: number
  /** TA 的邀请人数 */
  inviteNum?: number
  /** 注册时间 */
  registerDate?: number
}

export interface IAgentCenterSetRebateRatioReq {
  /** 用户 id */
  uid: string
  /** 产品线数据 */
  rebateRatio: rebateRatioType[]
}

/***
 * 金字塔代理 - 调整返佣比例出入参数
 */
interface rebateRatioType {
  selfRatio: number
  childRatio: number
  productCd: string
}