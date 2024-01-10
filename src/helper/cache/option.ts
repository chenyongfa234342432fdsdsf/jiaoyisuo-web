import { baseUserStore } from '@/store/user'
import cacheUtils from 'store'

export function setCacheAgentBindUser(key, value) {
  const uid = baseUserStore.getState()?.userInfo?.uid
  cacheUtils.set(`${key}${uid}`, value)
}

export function getCacheAgentBindUser(key) {
  const uid = baseUserStore.getState()?.userInfo?.uid
  return cacheUtils.get(`${key}${uid}`)
}
