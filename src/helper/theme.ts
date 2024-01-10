import { ColorPlateEnum, ThemeBusinessEnum } from '@/constants/base'
import { baseCommonStore } from '@/store/common'
import { isChainstar } from './env'

/** 设置 okx 主题色 */
export function setOkxThemeColor() {
  const store = baseCommonStore.getState()
  store.setThemeType(ColorPlateEnum.okx)
}
/** 设置 chainstar 主题色 */

/** 设置默认主题色 */
export function setDefaultThemeColor() {
  const store = baseCommonStore.getState()
  store.setThemeType(ColorPlateEnum.default)
}
export function initThemeColor() {
  const baseStore = baseCommonStore.getState()
  if (baseStore.isMergeMode) {
    setOkxThemeColor()
  }
}
