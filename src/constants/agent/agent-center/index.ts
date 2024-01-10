import { t } from '@lingui/macro'

/** 总览时间类型 */
export enum AgentCenterTimeTypeEnum {
  /** 今日 */
  today = 'today',
  /** 昨日 */
  yesterday = 'yesterday',
  /** 7 日 */
  sevenDay = 'sevenDay',
  /** 30 日 */
  thirtyDay = 'thirtyDay',
  /** 自定义 */
  custom = 'custom',
}

/**
 * 获取总览时间类型名称
 */
export function getAgentCenterTimeTypeName(type: string) {
  return {
    [AgentCenterTimeTypeEnum.today]: t`features_agent_agency_center_data_overview_index_5101503`,
    [AgentCenterTimeTypeEnum.yesterday]: t`features_agent_agency_center_data_overview_index_7rv9ftbbap`,
    [AgentCenterTimeTypeEnum.sevenDay]: t`features_agent_gains_index_5101565`,
    [AgentCenterTimeTypeEnum.thirtyDay]: t`features_agent_gains_index_5101566`,
    [AgentCenterTimeTypeEnum.custom]: t`features_agent_ta_activity_index_hqwgu9hxda`,
  }[type]
}

/**
 * 代理模式类型
 */
export enum AgentModalTypeEnum {
  /** 区域代理 */
  area = 'area',
  /** 三级代理 */
  threeLevel = 'threeLevel',
  /** 金字塔 */
  pyramid = 'pyramid',
}

/**
 * 获取代理模式名称
 */
export function getAgentCenterModalTypeName(type: string) {
  return {
    [AgentModalTypeEnum.area]: t`constants_agent_agent_center_center_dcpfma14oy`,
    [AgentModalTypeEnum.threeLevel]: t`constants_agent_agent_center_center_i8uxlc3bmw`,
    [AgentModalTypeEnum.pyramid]: t`constants_agent_agent_center_center_s2_awhfdwk`,
  }[type]
}

/**
 * 代理等级
 */
export enum AgentLevelTypeEnum {
  one = 1,
  two,
  three,
  four,
  five,
  six,
  seven,
  eight,
  nine,
  ten,
}

/**
 * 获取代理等级对应图标
 */
export function getAgentLevelIconName(type: number) {
  return {
    [AgentLevelTypeEnum.one]: 'icon_agent_grade_one',
    [AgentLevelTypeEnum.two]: 'icon_agent_grade_two',
    [AgentLevelTypeEnum.three]: 'icon_agent_grade_three',
    [AgentLevelTypeEnum.four]: 'icon_agent_grade_four',
    [AgentLevelTypeEnum.five]: 'icon_agent_grade_five',
    [AgentLevelTypeEnum.six]: 'icon_agent_grade_six',
    [AgentLevelTypeEnum.seven]: 'icon_agent_grade_seven',
    [AgentLevelTypeEnum.eight]: 'icon_agent_grade_eight',
    [AgentLevelTypeEnum.nine]: 'icon_agent_grade_nine',
    [AgentLevelTypeEnum.ten]: 'icon_agent_grade_ten',
  }[type]
}

/**
 * 详情列表 tab 类型
 */
export enum AgentCenterDetailsTabEnum {
  /** 邀请详情 */
  invite = 'invite',
  /** 收益详情 */
  income = 'income',
}

/**
 * 获取详情列表 tab 类型名称
 */
export function getAgentCenterDetailsTabName(type: string) {
  return {
    [AgentCenterDetailsTabEnum.invite]: t`features_agent_agent_center_invite_details_index_t_kekasxh8`,
    [AgentCenterDetailsTabEnum.income]: t`constants_agent_agent_center_center_zhleangni0`,
  }[type]
}

/**
 * 总览&返佣详情 - 筛选 - 时间类型
 */
export enum DateTypeEnum {
  /** 今天 */
  today = 1,
  /** 昨日 */
  yesterday = 2,
  /** 最近 1 周 */
  week = 7,
  /** 最近 1 月 */
  month = 30,
  /** 自定义 */
  custom = 0,
}

/**
 * 邀请详情排序
 */
export enum InviteDetailSortEnum {
  /** 默认 */
  default = 0,
  /** 注册时间 */
  registerDateSort = 1,
  /** 邀请人数 */
  inviteNum = 2,
  /** 团队人数 */
  teamNum = 3,
}

/**
 * 返佣详情排序
 */
export enum RebateDetailSortEnum {
  /** 默认 */
  default = 0,
  /** 返佣时间 */
  rebateDate = 1,
  /** 团队手续费 */
  teamFee = 2,
  /** 结算币种 */
  amount = 3,
  /** TA 的手续费 */
  fee = 4,
}

/**
 * 邀请详情 - 注册时间排序类型
 */
export enum InviteDetailRegisterSortTypeEnum {
  /** 默认 */
  default = 0,
  /** 正序 */
  just,
  /** 倒序 */
  inverted,
}

/**
 * 邀请详情 - 实名状态类型
 */
export enum InviteCertificationStatusTypeEnum {
  /** 全部 */
  all = 0,
  /** 已实名 */
  verified,
  /** 未实名 */
  notCertified,
}

/**
 * 邀请详情 - 实名状态列表
 */
export const InviteCertificationList = [
  InviteCertificationStatusTypeEnum.all,
  InviteCertificationStatusTypeEnum.verified,
  InviteCertificationStatusTypeEnum.notCertified,
]

/**
 * 邀请详情 - 获取实名状态类型名称
 */
export function getInviteCertificationStatusTypeName() {
  return {
    [InviteCertificationStatusTypeEnum.all]: t`common.all`,
    [InviteCertificationStatusTypeEnum.verified]: t`features_agent_agency_center_invitation_details_index_5101548`,
    [InviteCertificationStatusTypeEnum.notCertified]: t`features_agent_agency_center_invitation_details_index_5101549`,
  }
}

/**
 * 代理中心 - 法币列表
 */
export interface IAgentCurrencyList {
  /** 结算币种/法币 */
  currencyEnName: string
  /** 法币精度 */
  offset: number
  logo?: string
}

export enum RebateTypeCdEnum {
  selfRebate = 'selfRebate',
  teamRebate = 'teamRebate',
}
