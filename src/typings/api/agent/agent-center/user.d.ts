/**
 * 代理中心 - 更多用户详情
 */

/**
 *  ta 的邀请被邀请人信息参数出入参
 */
interface pyramidAgentInviteeListType {
  /** 注册时间 */
  registerDate: number
  /** 昵称：昵称＞邮箱＞手机号 */
  nickName: string
  /** uid */
  uid: string
  /** 金字塔返佣 */
  productRebateList: {
    /** 我的返佣比例 */
    myRatio?: number
    /** 好友返佣比例 */
    friendRatio?: number
    /** 现货、合约、娱乐区、三元期权等 */
    productCd?: string
  }[]
  /** 是否已实名，1.是，2.否 */
  isRealName: number
  /** TA 的团队人数 */
  teamNum: number
  /** TA 的邀请人数 */
  inviteNum: number
  /** 代理层级 */
  agentLevel?: string
}
interface areaAgentInviteeListType {
  /** 是否已实名，1.是，2.否 */
  isRealName: number
  /** TA 的区域返佣比例 */
  rebateRatio: number
  /** TA 的邀请人数 */
  inviteNum: string
  /** 代理等级 */
  rebateLevel: string
  /** 昵称：昵称＞邮箱＞手机号 */
  nickName: string
  /** uid */
  uid: string
  /** TA 的团队人数	 */
  teamNum: string
  /** 注册时间 */
  registerDate: string
  /** 代理层级 */
  agentLevel?: string
}
interface thirdLevelAgentInviteeListType {
  /** 昵称：昵称＞邮箱＞手机号 */
  nickName: string
  /** uid */
  uid?: string
  /** 是否已实名，1.是，2.否 */
  isRealName: number
  /** 注册时间 */
  registerDate: number
  /** TA 的邀请人数	*/
  inviteNum: number
  /** 代理层级 */
  agentLevel?: string
}
export interface IAgentCenterHisInviteeReq {
  /** 邀请的用户 uid */
  uid?: string
  /**  模式 */
  model: string
  /** 注册时间排序，默认倒序，1.正，2.倒 */
  registerDateSort?: number
  /** 实名状态，1.是，2.否 */
  isRealName?: number
  /** 团队人数 (低) */
  teamNumMin?: number
  /** 邀团队人数 (高) */
  teamNumMax?: number
  /** 注册时间 (起) */
  startTime?: number
  /** 注册时间 (止)*/
  endTime?: number
  /** 当前页 */
  pageNum: number
  /** 当前页 */
  pageSize: number
}
export interface IAgentCenterHisInviteeResp {
  /** 金字塔代理被邀请人列表 */
  pyramidAgentInviteeList: pyramidAgentInviteeListType[]
  /** 区域代理被邀请人列表 */
  areaAgentInviteeList: areaAgentInviteeListType[]
  /** 三级代理被邀请人列表 */
  threeLevelAgentInviteeList: thirdLevelAgentInviteeListType[]
  /** 基本信息 */
  message?: string
  /** 总数 */
  total: number
}

/**
 *  邀请详情 TA 的邀请出入参
 */
export interface IAgentCenterHisInvitationReq {
  /** UID */
  uid: string
  /** 模式 */
  model: string
}
export interface IAgentCenterHisInvitationResp {
  /** 区域代理 */
  areaAgentInviteDto: areaAgentInviteeListType
  /** 金字塔代理 */
  pyramidAgentInviteDto: pyramidAgentInviteeListType
  /** 三级代理 */
  threeLevelAgentInviteDto: thirdLevelAgentInviteeListType
}

/***
 * 金字塔代理 - 调整返佣比例出入参数
 */
interface rebateRatioType {
  selfRatio: number
  childRatio: number
  productCd: string
}
export interface IAgentCenterSetRebateRatioReq {
  /** 用户 id */
  uid: string
  /** 产品线数据 */
  rebateRatio: rebateRatioType[]
}
export interface IAgentCenterSetRebateRatioResp {}

/***
 * 代理中心 - 更多详情-web
 * https://yapi.nbttfc365.com/project/44/interface/api/18509
 */
interface productRebateListType {
  /** 现货、合约、娱乐区、三元期权等 */
  product?: string
  /** 比例 */
  ratio?: string
}

interface areaAgentUserDetailListType {
  /** 产品线 */
  productCd?: string
  /** 用户 UID */
  uid?: string
  /** 上级 UID */
  parentUid?: string
  /** 昵称 */
  nickName?: string
  /** 手机号 */
  mobileNumber?: string
  /** 邮箱 */
  email?: string
  /** KYC 认证类型 */
  kycType?: number
  /** 邀请人数 */
  inviteNum?: number
  /** 团队人数 */
  teamNum?: number
  /** 代理级别 */
  agentLevel?: number
  /** 区域返佣等级 */
  rebateLevel?: number
  /** 区域返佣比例 */
  rebateRatio?: number
  /** 团队返佣 (USD) */
  teamRebate?: number
  /** 团队手续费 (USD) */
  teamFee?: number
  /** 团队贡献返佣 (USD) */
  teamContributionRebate?: number
  /** 产品线返佣比例列表 */
  productRebateList?: productRebateListType[]
  /** TA 的手续费 (USD) */
  fee?: number
  /** TA 的贡献返佣 (USD) */
  contributionRebate?: number
  /** 总入金 (USD) */
  incoming?: number
  /** 总出金 (USD) */
  withdraw?: number
  /** 注册时间 */
  registerDate?: number
  /** 父级 UID */
  ppuid?: number
}

interface pyramidAgentUserDetailListType extends areaAgentUserDetailListType {
  /** 产品线返佣比例列表 */
  productRebateList?: productRebateListType[]
}
interface thirdLevelUserDetailListType extends areaAgentUserDetailListType {
  /** TA 的手续费 (USD) */
  fee?: number
  /** TA 的贡献返佣 (USD) */
  contributionRebate?: number
}
export interface IAgentCenterWebMoreDetailReq {
  /** 模式 */
  model: string
  /** uid */
  uid: string
  /** 产品线 */
  productCd?: string
  /** 区域等级 */
  areaLevel?: string
  /** 团队人数 (低)/邀请人数 */
  inviteNumMin?: number
  /** 团队人数 (高)/邀请人数 */
  inviteNumMax?: number
  /** 注册时间 (起) */
  startTime?: number
  /** 注册时间 (止) */
  endTime?: number
  /** 当前页 */
  pageNum: string
  /** 每页条数 */
  pageSize: string
}
export interface IAgentCenterWebMoreDetailResp {
  areaAgentUserDetailList?: areaAgentUserDetailListType[]
  pyramidAgentUserDetailList?: pyramidAgentUserDetailListType[]
  threeLevelUserDetailList?: thirdLevelUserDetailListType[]
  total?: number
  currencySymbol?: string
}

/**
 * 代理中心 - 区域代理等级查询
 */
export interface IAgentSystemAreaAgentLevelReq {}
export interface IAgentSystemAreaAgentLevelResp extends Array<number> {}


export interface IAgentCenterUserLevelListReq {
  /** 模式 */
  model: string
}

export interface IAgentCenterUserLevelListResp {
  uid: string
  model: string
  businessId: string
  /** 用户等级 */
  liveList: string[]
}
