import { t } from '@lingui/macro'
import { getAgentPyramidApplyInfo, getRebateLadder } from '@/apis/agent/agent-invite'
import { fetchProductList, fetchProductRatio } from '@/apis/agent/agent-invite/apply'
import { postAgentIsBlack } from '@/apis/agent/common'
import { Type } from '@/components/lazy-image'
import { AgentModalTypeEnum } from '@/constants/agent/agent-center'
import { AgentGradeUnitEnum, ApplyStatusEnum } from '@/constants/agent/agent-invite'
import { ThemeEnum } from '@/constants/base'
import { oss_svg_image_domain_address_agent } from '@/constants/oss'
import { link } from '@/helper/link'
import { getAgentApplyRoutePath, getAgentJoinRoutePath } from '@/helper/route/agent'
import { baseAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import { baseCommonStore } from '@/store/common'
import { Message } from '@nbit/arco'
import { isNumber } from 'lodash'

export const agentOssUrl = `${oss_svg_image_domain_address_agent}v3/`

/**
 * 获取邀请链接
 * @returns
 */
export const getInviteLink = (inviteCode: string) => {
  if (!inviteCode) return ''

  const {
    location: { protocol, host },
  } = window
  const { locale } = baseCommonStore.getState()
  const inviteLink = `${protocol}//${host}/${locale}/register?invitationCode=${inviteCode}`

  return inviteLink
}

/** 获取代理商三期图片地址 */
export const getAgentOssImageUrl = (name: string, hasTheme = false) => {
  const commonState = baseCommonStore.getState()
  let themeName = ''
  if (hasTheme) themeName = commonState.theme === ThemeEnum.dark ? '_black' : '_white'
  const bannerBgImage = `${agentOssUrl}${name}${themeName}${Type.png}`
  return bannerBgImage
}

/**
 * 查询当前用户是否黑名单
 */
export const getIsBlackListData = async () => {
  const { updateIsBlackListData } = baseAgentInviteV3Store.getState()
  const res = await postAgentIsBlack({})
  const { isOk, data } = res || {}

  if (!isOk || !data) {
    return
  }

  updateIsBlackListData(data)
  return data
}

/**
 * 获取金字塔产品返佣比例
 */
export const getProductRatio = async () => {
  const { updateProductRadio } = baseAgentInviteV3Store.getState()
  const res = await fetchProductRatio({})
  const { isOk, data } = res || {}

  if (!isOk || !data) {
    return
  }

  updateProductRadio(data?.products || [])
  return data
}

/**
 * 获取金字塔代理申请信息
 */
export const getPyramidAgentApplyInfo = async () => {
  const { updatePyramidAgentApplyData } = baseAgentInviteV3Store.getState()
  const res = await getAgentPyramidApplyInfo({})
  const { isOk, data } = res || {}

  if (!isOk || !data) {
    return
  }

  updatePyramidAgentApplyData(data)
  if (data.applyStatus === ApplyStatusEnum.pass) {
    getProductRatio()
  }
  return data
}

/**
 * 获取区域/三级返佣阶梯
 */
export const getRebateLadderData = async (mode: string) => {
  const { updateRebateLadderArea, updateRebateLadderThreeLevel } = baseAgentInviteV3Store.getState()
  const res = await getRebateLadder({ model: mode })
  const { isOk, data } = res || {}

  if (!isOk || !data) {
    return
  }
  switch (mode) {
    case AgentModalTypeEnum.area:
      updateRebateLadderArea(data)
      break
    case AgentModalTypeEnum.threeLevel:
      updateRebateLadderThreeLevel(data)
      break
    default:
  }
  return data
}

/** 滑块分隔符 marks 数据 */
export function generateRatio(val) {
  if (!isNumber(Number(val))) return 0

  const result = {}

  const maxVal = (+val / 10) | 0

  for (let i = 0; i <= maxVal; i += 1) {
    result[i * 10] = ''
  }

  return result
}

export const getPyramidApplyUrl = () => {
  const { isBlackListData, pyramidAgentApplyData } = baseAgentInviteV3Store.getState()
  if (isBlackListData?.inBlacklist) {
    Message.warning(t`features_agent_apply_index_yuzdqvpqnn`)
    return
  }
  // 未申请跳转介绍页，否则审核状态或结果页
  const href =
    pyramidAgentApplyData?.applyStatus === ApplyStatusEnum.default ? getAgentApplyRoutePath() : getAgentJoinRoutePath()
  link(href)
}

export const onSetRebateRatio = (onCallback?) => {
  const { isBlackListData, updateVisiblePyramidRebateSetting } = baseAgentInviteV3Store.getState()

  if (isBlackListData?.inBlacklist) {
    Message.warning(t`features_agent_referral_ratio_modal_index_cper1sch7t`)
    return
  }
  updateVisiblePyramidRebateSetting(true)
  onCallback && onCallback()
}

export const getUserRebateLevelText = (codeKey, text: string) => {
  if (codeKey === AgentGradeUnitEnum.teamSize) {
    return t({
      id: 'helper_agent_agent_invite_index_kcooi6wwle',
      values: { 0: text },
    })
  }
  return t({
    id: 'helper_agent_agent_invite_index__9cylzkvoy',
    values: { 0: text },
  })
}
