import { addGlobalLibrary } from '@/helper/externals'
import { logGitCommitId } from '../common'
import { initSentry } from './utils/sentry'
import { getDeviceId } from './utils/client-device-id'
import { initCache } from '../cache/common'
import { initWS } from './utils/init-ws'
import { initClientApi } from './utils/init-api'
import { InitMergeMode } from './utils/init-merge-mode'
import { dynamicActivate } from '../i18n'
import { initThemeColor } from '../theme'
import { initObserver } from './utils/init-observer'
import initC2cMode from './utils/init-c2c-mode'

/**
 * 初始化 客户端能力，例如注册 ws
 */
export const onInstallForClient = async (pageContext: PageContext) => {
  const locale = pageContext.locale
  /** 注册 sentry */
  initSentry()
  initObserver()
  await dynamicActivate(locale!)

  /** 获取设置唯一 id */
  await getDeviceId()

  /** 融合模式 */
  const isBlock = await InitMergeMode(pageContext)

  /** get c2c bid */
  await initC2cMode()

  /** 探测持久化储存 */
  initCache()
  /** 添加全局库 */
  addGlobalLibrary()
  /** 注册 WS */
  initWS()
  /** 注册 api */
  initClientApi()
  /** 额外功能 */
  logGitCommitId()
  /** 是否融合模式设置 Okx 皮肤 */
  initThemeColor()

  if (isBlock === undefined) {
    return true
  }
}
