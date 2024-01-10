import { YapiPostV1AgentActivationData } from '@/typings/yapi/AgentActivationV1PostApi'
import {
  YapiPostV2AgentInviteDetailsAnalysisApiResponse,
  YapiPostV2AgentInviteDetailsAnalysisListTotalListData,
} from '@/typings/yapi/AgentInviteDetailsAnalysisV2PostApi'
import { t } from '@lingui/macro'

export enum emailOrPhoneEnum {
  /** 手机号 */
  phone = 1,

  /** 邮箱 */
  email = 2,
}

/** 代理商申请状态 */
export enum JoinStatusEnum {
  /** 未提交 */
  default = -1,

  /** 待审批 */
  noReview = 0,

  /** 通过 */
  pass = 1,

  /** 拒绝 */
  noPass = 2,
}

export enum AgentCodeEnum {
  /** 代理商邀请码 */
  agent = 0,

  /** 普通邀请码 */
  ordinary = 1,
}

export const InviteQueryRespEnum = {
  [AgentCodeEnum.agent]: 'agtInvitationCode',
  [AgentCodeEnum.ordinary]: 'invitationCode',
} as const

export type AuditStatusType = {
  /** 审核状态 */
  status: JoinStatusEnum

  /** 拒绝理由 */
  rejectReason: string
}

export enum isShowBannerEnum {
  show = 1, // 可以展示横幅
  hidden = 2, // 则不可以申请
}

export enum AutoFocusEnum {
  spot = 1,
  contract = 2,
  borrowCoin = 3,
  userNumber = 4,
}

export type WebSocializeType = {
  label: string
  value: string
}

export const agentInviteTotalListOptions = {
  totalNum: 'num',
  agentNum: 'agentNum',
}

export enum agentDateTimeTabEnum {
  all = -1,
  today = 0,
  yesterday = 1,
  week = 2,
  month = 3,
  custom = 4,
}

export const TaAgentActivitiesTitleMap = () => {
  return {
    totalRebate: t`constants_agent_agent_za0veancjz`,
    totalDeposit: t`constants_agent_agent_m6pah5x1ea`,
    totalWithdraw: t`constants_agent_agent_s64ln_efrl`,
    invitedNum: t`constants_agent_agent_jkly4smzop`,
    teamNum: t`features_agent_agency_center_invitation_details_index_qfbw6m22wx`,
  } as { [k in keyof YapiPostV1AgentActivationData]: string }
}

export const taAgentUserDetailTitleMap = () => {
  return {
    mobileNumber: t`user.safety_items_02`,
    email: t`user.safety_items_04`,
    registerTime: t`features_agent_agency_center_invitation_details_index_5101541`,
  }
}

export enum taAgentActivitiesDetailEnum {
  totalRebate = 'totalRebate',
  totalDeposit = 'totalDeposit',
  totalWithdraw = 'totalWithdraw',
  invitedNum = 'invitedNum',
  teamNum = 'teamNum',
}

export enum AgentChartKeyEnum {
  TotalIncomes = 'totalIcomes',
  IncomeAnalysis = 'incomeAnalysis',
  InvitedList = 'invitedList',
  TotalInvitedList = 'totalInvitedList',
}

/** 申请代理商申请状态枚举 */
export enum AgentApplicationEnum {
  /** 未申请 */
  NotApplied = -1,
  /** 待审核 */
  ToBeReviewed = 0,
  /** 申请通过 */
  ApplicationApproved = 1,
  /** 申请未通过 */
  Failed = 2,
}

/** 代理中心 - TA 的邀请认证枚举 */
export enum AgentIsRealNameEnum {
  /** 是 */
  Yes = 1,
  /** 否 */
  No = 2,
}

/** 代理中心 - 代理模式枚举 */
export enum AgentModeEnumeration {
  /** 三级代理 */
  threeLevel = 'threeLevel',
  /** 金字塔代理 */
  pyramid = 'pyramid',
  /** 区域代理 */
  area = 'area',
}

/** 代理中心 - TA 的邀请表格排序枚举 */
export enum AgentTableSortingEnumeration {
  /** 正序 */
  PositiveOrder = 1,
  /** 倒序 */
  ReverseOrder = 2,
}

/** 代理中心 - TA 的邀请表格排序枚举 */
export enum TableSortEnumeration {
  /** 时间 */
  registerDate = 1,
  /** 邀请人数 */
  inviteNum = 2,
  /** 团队人数 */
  teamNum = 3,
}
