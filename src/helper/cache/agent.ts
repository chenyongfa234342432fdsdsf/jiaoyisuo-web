// 使用 store 来处理 localStorage
import { IAgentCurrencyList } from '@/constants/agent/agent-center'
import cacheUtils from 'store'

export const Agent_Tips_Time = 'Agent_Tips_Time'

/** 今日不再提醒黑名单提示，存当天日期 - 自然日 */
export function setCacheAgentTipsTime(time: any) {
  cacheUtils.set(Agent_Tips_Time, time)
}
/** 今日不再提醒黑名单提示 */
export function getCacheAgentTipsTime() {
  return cacheUtils.get(Agent_Tips_Time)
}

/** 代理中心 - 是否隐藏金额 */
export const AGENT_CENTER_ENCRYPTION = 'AGENT_CENTER_ENCRYPTION'
export function getAgentCenterEncryptionCache() {
  return cacheUtils.get(AGENT_CENTER_ENCRYPTION)
}
export function setAgentCenterEncryptionCache(data: boolean) {
  return cacheUtils.set(AGENT_CENTER_ENCRYPTION, data)
}

/** 代理中心 - 当前选中法币 */
export const AGENT_CENTER_CURRENT_CURRENCY = 'AGENT_CENTER_CURRENT_CURRENCY'
export function getAgentCenterCurrentCurrencyCache() {
  return cacheUtils.get(AGENT_CENTER_CURRENT_CURRENCY)
}
export function setAgentCenterCurrentCurrencyCache(data: IAgentCurrencyList) {
  return cacheUtils.set(AGENT_CENTER_CURRENT_CURRENCY, data)
}
