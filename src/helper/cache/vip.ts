import { baseCommonStore } from '@/store/common'
import cacheUtils from 'store'

const vipCdKey = 'CACHE_CODE_DETAILS_V3'
const vipPerksListKey = 'CACHE_PERKS_LIST'
const vipUpgradeKey = 'CACHE_UPGRADE_CONDTIONS'
const vipUpgradeList = 'CACHE_UPGRADE_LIST'

export function getCacheVipCd() {
  const { locale } = baseCommonStore.getState()
  const _cache = cacheUtils.get(vipCdKey)
  return _cache?.[locale]
}

export function setCacheVipCd(value) {
  const { locale } = baseCommonStore.getState()
  const currentCache = cacheUtils.get(vipCdKey)
  cacheUtils.set(vipCdKey, { ...currentCache, [locale]: value })
}

export function getCacheVipPerksList() {
  return cacheUtils.get(vipPerksListKey)
}

export function setCacheVipPerksList(value) {
  cacheUtils.set(vipPerksListKey, value)
}

export function getCacheVipUpgradeByLevel(levelCode) {
  return cacheUtils.get(vipUpgradeKey)?.[levelCode]
}

export function setCacheVipUpgradeByLevel(levelCode, value) {
  const cache = getCacheVipUpgradeByLevel(levelCode)
  cacheUtils.set(vipUpgradeKey, { ...cache, levelCode: value })
}

export function getCacheVipUpgradeList() {
  return cacheUtils.get(vipUpgradeList)
}

export function setCacheVipUpgradeList(value) {
  cacheUtils.set(vipUpgradeList, value)
}

// ====================================================== //
// ===================== VIP avatar ===================== //
// ====================================================== //

const avatarFramesKey = 'CACHE_AVATAR_FRAMES'

export function getCacheAvatarFrames() {
  return cacheUtils.get(avatarFramesKey)
}

export function setCacheAvatarFrames(value) {
  return cacheUtils.set(avatarFramesKey, value)
}
