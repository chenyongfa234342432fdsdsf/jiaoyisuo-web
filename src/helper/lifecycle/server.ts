import { dynamicActivate } from '../i18n'
import { initServerApi } from './utils/init-api'

/**
 * 初始化 服务端能力
 */
export const onInstallForServer = async (pageContext: PageContext) => {
  const locale = pageContext.locale
  /** 注册 api */
  pageContext = await initServerApi(pageContext)
  await dynamicActivate(locale!)
  return pageContext
}
