import { t } from '@lingui/macro'
import { getAgentPyramidApplyInfo } from '@/apis/agent/agent-invite'
import { postAgentIsBlack } from '@/apis/agent/common'
import { Type } from '@/components/lazy-image'
import { AgentModalTypeEnum } from '@/constants/agent/agent-center'
import { ThemeEnum } from '@/constants/base'
import { oss_svg_image_domain_address_agent } from '@/constants/oss'
import { baseAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import { baseCommonStore } from '@/store/common'
import { baseAgentCenterStore } from '@/store/agent/agent-center/center'
import { getAreaAgentLevelList } from '@/apis/agent/agent-center'
import { rateFilter } from '@/helper/assets'
import { fetchProductList } from '@/apis/agent/agent-invite/apply'
import dayjs from 'dayjs'
import { formatCurrency } from '@/helper/decimal'

export const agentOssUrl = `${oss_svg_image_domain_address_agent}v3/`

/**
 * 获取代理模式相关信息 - 代理中心数据总览
 * @returns
 */
export const getAgentModelInfo = (mode: string) => {
  let agentInfo = {
    modelName: '',
  }
  if (!mode) return agentInfo

  switch (mode?.toLocaleUpperCase()) {
    case AgentModalTypeEnum.area.toLocaleUpperCase():
      agentInfo = {
        modelName: t`helper_agent_agent_center_index_yprloxvfyo`,
      }
      break
    case AgentModalTypeEnum.threeLevel.toLocaleUpperCase():
      agentInfo = {
        modelName: t`features_agent_agent_invite_invite_header_agent_model_index_ib52hqfaqs`,
      }
      break
    case AgentModalTypeEnum.pyramid.toLocaleUpperCase():
      agentInfo = {
        modelName: t`helper_agent_agent_center_index_l73bcvfrnb`,
      }
      break
    default:
      break
  }
  return agentInfo
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
  return data
}

/** 验证由中文、数字和 26 个英文字母组成的字符串 */
export const checkSearchKey = (str: string) => {
  const strReg = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/
  return strReg.test(str)
}

/**
 * 代理中心 - 结算币种进行汇率换算
 */
export const rateFilterAgent = (amount?: number | string) => {
  const { overviewData, currentCurrency } = baseAgentCenterStore.getState()
  if (!amount) return formatCurrency(amount || 0, currentCurrency?.offset || 2, true, false)

  if (overviewData?.currencySymbol === currentCurrency?.currencyEnName) {
    return formatCurrency(amount, currentCurrency?.offset || 2, true, false)
  }

  return rateFilter({
    symbol: overviewData?.currencySymbol,
    rate: currentCurrency?.currencyEnName,
    amount,
    showUnit: false,
    isFormat: true,
  })
}

/**
 * 获取金字塔产品返佣比例
 */
export const getProductLine = async () => {
  const { updateProductLine } = baseAgentCenterStore.getState()
  const res = await fetchProductList({})
  const { isOk, data } = res || {}

  if (!isOk || !data) {
    return
  }

  updateProductLine(data || [])
  return data
}

/**
 * 时间判断方法
 * @param {string} startTime 开始时间
 * @param {string} endTime 结束时间
 * @param {number} timeNumber 限制天数
 * @return {boolean}
 */
export const isDateIntervalValid = (startTime, endTime, timeNumber = 365) => {
  const start = dayjs(Number(endTime)).format('YYYY-MM-DD')
  const end = dayjs(Number(startTime)).format('YYYY-MM-DD')
  const dayDiff = dayjs(start).diff(dayjs(end), 'day')
  return dayDiff <= timeNumber
}

/**
 * 邀请详情 - 获取区域代理等级列表
 */
export const onGetAreaAgentLevelList = async () => {
  const { updateAreaAgentLevelList } = baseAgentCenterStore.getState()
  const res = await getAreaAgentLevelList({})

  const { isOk, data } = res || {}
  if (!isOk || !data) return
  updateAreaAgentLevelList(data)
}
