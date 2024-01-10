import ReactDOMClient from 'react-dom'
import { ThemeBusinessEnum, ThemeEnum } from '@/constants/base'
import { onInstallForApp } from '@/helper/lifecycle'
import { onInstallForClient } from '@/helper/lifecycle/client'
import { baseCommonStore } from '@/store/common'
import { getSeo } from '@/helper/seo'
import { IsWhiteListRoute, getMergeModeStatus } from '@/features/user/utils/common'
import { IsModuleWhiteListRoute } from '@/helper/module-config'
import AsyncSuspense from '@/components/async-suspense'
import { ErrorPage } from '@/components/error-page'
import { getRedirectUrl } from '@/helper/auth'
import { link } from '@/helper/link'
import { isChainstar } from '@/helper/env'
import { oss_domain_address } from '@/constants/oss'
import Layout from './layout'
import '@/style/layout.css'

export const clientRouting = true
export const prefetchStaticAssets = { when: 'VIEWPORT' }
export const hydrationCanBeAborted = true

async function render(pageContext: PageContext) {
  const { Page, pageProps, needSeo, authTo, unAuthTo, path, urlParsed } = pageContext
  const redirectUrl = getRedirectUrl(authTo, unAuthTo, urlParsed.search?.go)
  const isRedirectTo = !!redirectUrl
  const { theme } = baseCommonStore.getState()

  const isMegerMode = getMergeModeStatus()
  /** 融合模式判断是否在白名单路由 */
  const isWhiteListRouting = IsWhiteListRoute(path || '')
  /** 普通模式 - 判断是否模块白名单路由 */
  const isNotModuleWhiteListRouting = !isMegerMode && !IsModuleWhiteListRoute(path || '')

  const appLayout =
    (isMegerMode && !isWhiteListRouting) || isNotModuleWhiteListRouting ? (
      <Layout pageContext={pageContext}>
        <ErrorPage is404 />
      </Layout>
    ) : needSeo ? (
      <Layout pageContext={pageContext}>{!isRedirectTo && <Page {...pageProps} />}</Layout>
    ) : (
      <Layout pageContext={pageContext}>
        <AsyncSuspense hasLoading>{!isRedirectTo && <Page {...pageProps} />}</AsyncSuspense>
      </Layout>
    )

  const container = document.getElementById('page-view')!
  if (pageContext.isHydration) {
    await onInstallForApp(pageContext)

    const isBlock = await onInstallForClient(pageContext)
    if (isBlock === true) {
      return
    }

    ReactDOMClient.hydrate(appLayout, container)
    if (isRedirectTo) {
      link(redirectUrl, { overwriteLastHistoryEntry: true })
    }
    return
  }

  ReactDOMClient.render(appLayout, container)
  const { title, description } = getSeo(pageContext)
  document.title = title
  document?.querySelector('meta[name="description"]')?.setAttribute('content', description)
  document.body.setAttribute('theme', theme || ThemeEnum.light)
  document.body.setAttribute('theme-business', isChainstar ? ThemeBusinessEnum.chainstar : '')
  if (isRedirectTo) {
    link(redirectUrl, { overwriteLastHistoryEntry: true })
  }
}

function onHydrationEnd() {}

export { render, onHydrationEnd }
