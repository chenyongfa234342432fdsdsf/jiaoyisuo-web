import { t } from '@lingui/macro'
import { Message } from '@nbit/arco'
import dayjs from 'dayjs'

// 邀请类型
export enum InviteFilterInviteTypeEnum {
  total = '',
  agentInvite = '1',
  normalInvite = '2',
}

export const isAgtCheck = val => {
  if (val === InviteFilterInviteTypeEnum.agentInvite) {
    return true
  }

  return false
}

export const getAgtTitle = val => {
  return isAgtCheck(val)
    ? t`features_agent_invitation_v2_rebate_records_v2_table_schema_wviijyr7a_`
    : t`features_agent_invitation_v2_rebate_records_v2_table_schema_gjlifu7u9n`
}

// 实名状态 1 为未认证，不传默认已认证
export enum InviteFilterKycEnum {
  total = '',
  verified = '2',
  notVerified = '1',
}
// 排序约定 1 正序 2 倒序
export enum InviteFilterSortEnum {
  default = '',
  asc = '1',
  desc = '2',
}

export enum DateOptionsTypesInvite {
  now,
  last7Days,
  last30Days,
  custom,
  all,
}

export const dateOptionsTypesInviteApiKeyMap = {
  [DateOptionsTypesInvite.now]: 'today',
  [DateOptionsTypesInvite.last7Days]: 'sevenDays',
  [DateOptionsTypesInvite.last30Days]: 'thirtyDays',
}

export const infoHeaderTypesInvite = () => {
  return {
    [DateOptionsTypesInvite.now]: {
      title: t`constants_agent_invite_index_5101586`,
      content: t`constants_agent_invite_index_5101587`,
    },
    [DateOptionsTypesInvite.last7Days]: {
      title: t`constants_agent_invite_index_5101588`,
      content: t`constants_agent_invite_index_5101589`,
    },
    [DateOptionsTypesInvite.last30Days]: {
      title: t`constants_agent_invite_index_5101590`,
      content: t`constants_agent_invite_index_5101591`,
    },
  }
}

export const inviteFilterFormHelper = {
  /* api 返回结果，kycStatus 不是 1 则为已认证 */
  isKycVerified(kycStatus: string | number) {
    if (String(kycStatus) === InviteFilterKycEnum.notVerified) return false
    return true
  },

  getCheckMoreDefaultPage() {
    return {
      total: 0,
      current: 1,
      showTotal: true,
      showJumper: true,
      sizeCanChange: true,
      hideOnSinglePage: false,
      pageSize: 20,
    }
  },
}

export enum InviteTypeModeEnum {
  all = 0,
  levelLimit = 1,
  searching = 3,
  lookingUp = 4,
}

export const InviteCheckOnlyUnderMe = 1

export enum InviteDetailsPageTypeEnum {
  userDetails,
  rebateDetails,
}

export const getInviteDetailsPageTitle = (type: InviteDetailsPageTypeEnum) => {
  return {
    [InviteDetailsPageTypeEnum.userDetails]: t`constants_agent_invite_index_7c_ylwee7k`,
    [InviteDetailsPageTypeEnum.rebateDetails]: t`constants_agent_invite_index_0g7zcdyrg5`,
  }[type]
}

export enum InviteDetailsUidTypeEnum {
  myUid = 1,
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

export enum YesOrNoEnum {
  yes = '1',
  no = '2',
  all = '',
}

export const getIsGrantYesNoEnumMap = () => {
  return {
    [YesOrNoEnum.all]: t`common.all`,
    [YesOrNoEnum.yes]: t`features_agent_agency_center_invitation_details_index_5101543`,
    [YesOrNoEnum.no]: t`features_agent_agency_center_invitation_details_index_5101544`,
  }
}

export const getIsGrantYesNoEnumOptions = () => {
  const map = getIsGrantYesNoEnumMap()
  return [
    {
      label: map[YesOrNoEnum.all],
      value: YesOrNoEnum.all,
    },
    {
      label: map[YesOrNoEnum.yes],
      value: YesOrNoEnum.yes,
    },
    {
      label: map[YesOrNoEnum.no],
      value: YesOrNoEnum.no,
    },
  ]
}

export const getIsGrantYesNoEnumTitle = mode => {
  return getIsGrantYesNoEnumMap()[mode]
}

export const totalInvitedChartCheckboxOptions = () => {
  return {
    num: t`common.all`,
    agentNum: t`constants_agent_invite_index_wyatwyxxut`,
  }
}

export enum RebateTypeCdEnum {
  selfRebate = 'selfRebate',
  teamRebate = 'teamRebate',
}

export const RebateTypeCdEnumMap = () => {
  return {
    [RebateTypeCdEnum.selfRebate]: t`features_agent_agency_center_data_overview_index_z0uygeqiz_`,
    [RebateTypeCdEnum.teamRebate]: t`features_agent_agency_center_data_overview_index_jbnjkillbd`,
  }
}

export const getRebateTypeCdEnumTitle = mode => {
  return RebateTypeCdEnumMap()[mode]
}

export enum AgentProductTypeEnum {
  spot = '1',
  futures = '2',
  borrow = '3',
  ternary = '4',
  recreation = '5',
  total = '',
}

export const AgentProductTypeEnumMap = () => {
  return {
    [AgentProductTypeEnum.spot]: t`order.constants.marginMode.spot`,
    [AgentProductTypeEnum.futures]: t`future.funding-history.future-select.future`,
    [AgentProductTypeEnum.borrow]: t`constants_agent_invite_index_edntj26kwz`,
    [AgentProductTypeEnum.ternary]: t`constants_agent_invite_index_of5zdyg_0x`,
    [AgentProductTypeEnum.recreation]: t`constants_agent_invite_index_uuk9lsa4bn`,
  }
}

export const getAgentProductTypeEnumTitle = type => {
  return AgentProductTypeEnumMap()[type]
}

export const getInviteDetailsRebateEnumMap = () => {
  return {
    [AgentProductTypeEnum.total]: t`constants_agent_invite_index_kj6qtbub73`,
    [AgentProductTypeEnum.spot]: t`constants_agent_invite_index_umjl_wjafv`,
    [AgentProductTypeEnum.futures]: t`constants_agent_invite_index_0sujwjo7bp`,
    [AgentProductTypeEnum.borrow]: t`constants_agent_invite_index_vujdjm74j3`,
    [AgentProductTypeEnum.ternary]: t`constants_agent_invite_index_jo1bg2l6j9`,
    [AgentProductTypeEnum.recreation]: t`constants_agent_invite_index_p52wa0kycx`,
  }
}

export const getInviteDetailsRebateEnumTypes = ({ hasBorrow, hasSpot, hasContract, hasOption, hasRecreation }) => {
  const map = getInviteDetailsRebateEnumMap()

  return [
    {
      label: map[AgentProductTypeEnum.total],
      value: AgentProductTypeEnum.total,
      isShow: true,
    },
    {
      label: map[AgentProductTypeEnum.spot],
      value: AgentProductTypeEnum.spot,
      isShow: hasSpot,
    },
    {
      label: map[AgentProductTypeEnum.futures],
      value: AgentProductTypeEnum.futures,
      isShow: hasContract,
    },
    {
      label: map[AgentProductTypeEnum.borrow],
      value: AgentProductTypeEnum.borrow,
      isShow: hasBorrow,
    },
    {
      label: map[AgentProductTypeEnum.ternary],
      value: AgentProductTypeEnum.ternary,
      isShow: hasOption,
    },
    {
      label: map[AgentProductTypeEnum.recreation],
      value: AgentProductTypeEnum.recreation,
      isShow: hasRecreation,
    },
  ].filter(x => x.isShow)
}

export function getRebateRatioToDisplay(ratios: any[]) {
  // todo check which one to use
  return (ratios || []).reduce((acc, cur, index) => {
    return `${acc}${getAgentProductTypeEnumTitle(cur.productCd)}: ${cur.selfRatio || 0}% ${
      index === ratios.length - 1 ? '' : ' / '
    }`
  }, '')
}

// 1=未认证，2，标准认证，3，高级认证，4，企业认证
export enum InviteFilterKycLevelEnum {
  standard = '2',
  advanced = '3',
  enterprise = '4',
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

export const isAgentKycVerified = level => {
  return [
    InviteFilterKycLevelEnum.standard,
    InviteFilterKycLevelEnum.advanced,
    InviteFilterKycLevelEnum.enterprise,
  ].includes(String(level) as InviteFilterKycLevelEnum)
}

// default last 3 months data
export function getDefaultLast30DaysStartAndEnd() {
  return {
    startDate: dayjs().subtract(3, 'month').valueOf(),
    endDate: dayjs().valueOf(),
  }
}

const getSearchReminderMsg = () => t`constants_agent_invite_index_j1rixsj0l1`
export function showAgentSearchMsg() {
  Message.warning(getSearchReminderMsg())
}

export const maxZIndex = 9999
