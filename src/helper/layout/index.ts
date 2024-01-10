import { getBasicWebApiData, getFooterApiData, getV1ChainStarGetNavigationApiRequest } from '@/apis/layout'
import { baseLayoutStore } from '@/store/layout'
import { TlayoutProps } from '@/typings/api/layout'
import {
  YapiGetV1HomeWebsiteGetData,
  YapiGetV1HomeWebsiteGetDataApiRequest,
} from '@/typings/yapi/HomeWebsiteGetDataV1GetApi'
import { YapiGetV1ChainStarGetNavigationListNavigationBarListData } from '@/typings/yapi/ChainStarGetNavigationV1GetApi'
import { headerMenuTypeEnum } from '@/constants/layout'
import { ModuleEnum } from '@/constants/module-config'
import { isEmpty } from 'lodash'
import { extractFooterData, recursiveColumnMap } from './footer'
import { extractHeaderData } from './header'
import { AuthModuleAdapterNavi, getAuthModuleRoutes, moduleData } from '../module-config'

async function getLayoutPropsWithFooter(
  lanType: YapiGetV1HomeWebsiteGetDataApiRequest['lanType'],
  bid: string
): Promise<TlayoutProps | undefined> {
  const businessId = bid

  if (businessId) {
    const params = { businessId, lanType }
    const req = Promise.all([getBasicWebApiData(params), getFooterApiData(params)])
    const res = await req
    return res[0]?.data && res[1]?.data
      ? {
          ...res[0]?.data,
          ...res[1]?.data,
        }
      : undefined
  }
}

async function getLayoutProps(
  lanType: YapiGetV1HomeWebsiteGetDataApiRequest['lanType'],
  bid: string
): Promise<YapiGetV1HomeWebsiteGetData | TlayoutProps | undefined> {
  return await getLayoutPropsWithFooter(lanType, bid)
}

function initializeLayoutStore(pageContext) {
  const layoutStore = baseLayoutStore.getState()
  const { setFooterData, setHeaderData, setLayoutProps, setColumnsDataByCd } = layoutStore
  const { layoutProps } = pageContext
  setLayoutProps(pageContext?.layoutProps)
  const headerData = extractHeaderData(layoutProps)
  const footerData = extractFooterData(layoutProps)
  setColumnsDataByCd(recursiveColumnMap(layoutProps?.columnsDatas || []))
  setHeaderData(headerData)
  setFooterData(footerData)
}

function getGuidePageComponentInfoByKey(key: string, componentInfo: []) {
  const found =
    componentInfo?.find(each => {
      const currentKey = Object.keys(each)[0]
      return key === currentKey
    }) || {}
  return found[key]
}

// flatten array to by 1 level and returns object
function flattenArrToObj(data) {
  return data?.reduce((p, c) => {
    const key = Object.keys(c)[0]
    const value = c[key]
    p[key] = value
    return p
  }, {})
}

function getHomePageConfig(guidePage) {
  const { landingPageSectionCd } = guidePage || {}
  return landingPageSectionCd?.reduce((p, c) => {
    const key = Object.keys(c)[0]
    const value = c[key]
    p[key] = value
    return p
  }, {})
}

function getTradeMenu(navigationMenu: YapiGetV1ChainStarGetNavigationListNavigationBarListData[]) {
  return recursiveFindMenu(navigationMenu, menu => menu.typeCd === headerMenuTypeEnum.trade)
}

function getHomeMenu(navigationMenu: YapiGetV1ChainStarGetNavigationListNavigationBarListData[]) {
  return recursiveFilterMenu(navigationMenu, menu => menu.typeCd === headerMenuTypeEnum.home)
}

// returns main navigation menu after filtering auth modules configuration
function getAuthMainMenu({ authModules: moduleRoutes, otherRoutes }: ReturnType<typeof AuthModuleAdapterNavi>) {
  // filter derivative submenu
  if (moduleRoutes?.[ModuleEnum.contract]) {
    const derivativesMenu = moduleRoutes[ModuleEnum.contract]?.submenu || []
    const { authModules: formatted, otherRoutes: otherSubRoutes } = AuthModuleAdapterNavi(derivativesMenu)
    moduleRoutes[ModuleEnum.contract].submenu = [...getAuthModuleRoutes(formatted), ...otherSubRoutes]
    // remove derivatives menu if all submenu modules are disabled
    isEmpty(moduleRoutes[ModuleEnum.contract].submenu) && delete moduleRoutes[ModuleEnum.contract]
  }
  // prevent getAuthModuleRoutes from filtering derivative menu when contract is set to false
  let authModuleRoutes =
    moduleRoutes[ModuleEnum.contract] && !moduleData?.contract
      ? [...getAuthModuleRoutes(moduleRoutes), moduleRoutes[ModuleEnum.contract]]
      : getAuthModuleRoutes(moduleRoutes)

  return [...authModuleRoutes, ...otherRoutes]
}

/**
 * recursively search navigation menu
 * @param data navigation menu list
 * @param pred function to check condition
 * @returns 1 layer menu array - not nested
 */
function recursiveFindMenu(
  data: YapiGetV1ChainStarGetNavigationListNavigationBarListData[],
  pred: (obj: YapiGetV1ChainStarGetNavigationListNavigationBarListData) => boolean
) {
  let result = [] as YapiGetV1ChainStarGetNavigationListNavigationBarListData[]

  function recursiveSearch(menu: YapiGetV1ChainStarGetNavigationListNavigationBarListData[]) {
    if (!menu || menu.length === 0) return
    menu.forEach(sub => {
      recursiveSearch(sub.submenu as unknown as YapiGetV1ChainStarGetNavigationListNavigationBarListData[])
      if (pred(sub)) result.push(sub)
    })
  }

  recursiveSearch(data)

  return result
}

/**
 * recursively filter navigation menu while retaining object structure
 * @param array navigation menu list
 * @param pred function to check condition
 * @returns navigation menu list
 */
function recursiveFilterMenu(
  array: YapiGetV1ChainStarGetNavigationListNavigationBarListData[],
  pred: (obj: YapiGetV1ChainStarGetNavigationListNavigationBarListData) => boolean
) {
  return array.reduce((r: YapiGetV1ChainStarGetNavigationListNavigationBarListData[], o) => {
    let submenu = recursiveFilterMenu(
      (o?.submenu || []) as unknown as YapiGetV1ChainStarGetNavigationListNavigationBarListData[],
      pred
    )
    if (pred(o) || submenu.length)
      r.push({ ...o, ...(submenu.length && { submenu }) } as YapiGetV1ChainStarGetNavigationListNavigationBarListData)
    return r
  }, [])
}

export {
  getLayoutProps,
  initializeLayoutStore,
  getTradeMenu,
  getHomeMenu,
  recursiveFilterMenu,
  getAuthMainMenu,
  getHomePageConfig,
  flattenArrToObj,
  getGuidePageComponentInfoByKey,
}
