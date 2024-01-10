import { t } from '@lingui/macro'
import dayjs from 'dayjs'

/** 金字塔代理申请状态 */
export enum ApplyStatusEnum {
  /** 未申请 */
  default = -1,
  /** 审核中 */
  underReview = 0,
  /** 申请通过 */
  pass = 1,
  /** 申请未通过 */
  noPass = 2,
}

/**
 * 代理等级
 */
export enum AgentLevelTypeEnum {
  /** v1 */
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
export function getAgentLevelIconName(type = AgentLevelTypeEnum.one) {
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
 * 代理商 - 数据字典
 */
export enum AgentDictionaryTypeEnum {
  /** 返佣类型 */
  rebateTypeCd = 'rebate_type_cd',
  /** 产品线 */
  // agentProductCd = 'agent_product_cd',
  /** 产品线 - 显示返佣/手续费描述 */
  agentProductCdRatio = 'agent_product_cd_ratio',
  /** 产品线 - 仅展示产品名 */
  agentProductCdShowRatio = 'agent_product_cd_show_ratio',
  /** 代理模式/代理类型 */
  agentTypeCode = 'agent_type_code',
  /** 代理商审核状态 */
  approvalStatusInd = 'approvalStatusInd',
  /** 代理商等级规则 */
  // agentGradeRules = 'agt_grade_rules_cd',
  /** 三级代理等级规则 */
  agentThreeGradeRules = 'agt_grade_three_level_rules_cd',
  /** 区域代理等级规则 */
  agentAreaGradeRules = 'agt_grade_area_rules_cd',
  /** 代理商等级 */
  agentGrade = 'agt_grade',
}

/**
 * 代理商等级规则指标单位
 */
export enum AgentGradeUnitEnum {
  /** 成功邀請人數 */
  teamSize = 'teamSize',
  /** 直推業績量 */
  volumeOfBusiness = 'volumeOfBusiness',
  /** 自身業績 */
  meBusinessVolume = 'meBusinessVolume',
}

/**
 * 代理商等级规则指标单位
 */
export enum AgentGradeConditionEnum {
  /** 或 */
  or = 'OR',
  /** 且 */
  and = 'AND',
}

/**
 * UID 下拉枚举
 */
export enum InviteDetailsUidTypeEnum {
  /** 用户 UID */
  myUid = 1,
  /** 上级 UID */
  upperLevelUid = 2,
}
export const getInviteDetailsTypeEnumMap = () => {
  return {
    [InviteDetailsUidTypeEnum.myUid]: t`features_agent_invitation_index_5101587`,
    [InviteDetailsUidTypeEnum.upperLevelUid]: t`features_agent_invitation_index_5101588`,
  }
}
export const getInviteDetailsUidTypes = () => {
  const map = getInviteDetailsTypeEnumMap()
  return [
    {
      label: map[InviteDetailsUidTypeEnum.myUid],
      value: InviteDetailsUidTypeEnum.myUid,
    },
    {
      label: map[InviteDetailsUidTypeEnum.upperLevelUid],
      value: InviteDetailsUidTypeEnum.upperLevelUid,
    },
  ]
}

/**
 * 开始时间结束时间转换时间戳方法
 */
export function getDefaultLast30DaysStartAndEnd() {
  return {
    startDate: dayjs().subtract(3, 'month').valueOf(),
    endDate: dayjs().valueOf(),
  }
}

/**
 * 更多详情 KYC 认证枚举
 */
export enum InviteFilterKycLevelEnum {
  /** 标准认证 */
  standard = '2',
  /** 高级认证 */
  advanced = '3',
  /** 企业认证 */
  enterprise = '4',
  /** 未认证 */
  notVerified = '1',
}
const InviteKycLevelEnumMap = (isShowNotVerified?: boolean) => {
  let shared = {
    [InviteFilterKycLevelEnum.standard]: t`features_user_personal_center_menu_navigation_index_5101265`,
    [InviteFilterKycLevelEnum.advanced]: t`features_user_personal_center_menu_navigation_index_5101266`,
    [InviteFilterKycLevelEnum.enterprise]: t`features/user/personal-center/profile/index-17`,
    [InviteFilterKycLevelEnum.notVerified]: t`constants_agent_invite_index_vzl3j_iht7`,
  }

  if (isShowNotVerified) {
    shared[InviteFilterKycLevelEnum.notVerified] = t`user.personal_center_03`
  }

  return shared
}
export const getInviteKycLevelEnumTitle = (mode: string, isShowNotVerified?: boolean) => {
  const map = InviteKycLevelEnumMap(isShowNotVerified)
  const title = map[mode]
  return title || map[InviteFilterKycLevelEnum.notVerified]
}
