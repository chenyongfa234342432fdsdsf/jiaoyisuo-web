import { ModuleByRoute, ModuleEnum, contractModuleRoutes, spotModuleRoutes } from '@/constants/module-config'
import { YapiGetV1ChainStarGetNavigationListNavigationBarListData } from '@/typings/yapi/ChainStarGetNavigationV1GetApi'
import { ModuleConfig } from './env'

export const moduleData = JSON.parse(ModuleConfig)

/** 根据模块 key 获取模块的显示状态 */
export function getModuleStatusByKey(key: ModuleEnum) {
  if (moduleData && key && moduleData[key]) {
    return true
  }
  return false
}

/** 获取行情模块显示状态 - 如果现货、合约都不可见则行情模块不展示 */
export function getMarketsModuleStatus() {
  if (moduleData && moduleData[ModuleEnum.spot] === false && moduleData[ModuleEnum.contract] === false) {
    return false
  }
  return true
}

/** 获取订单模块显示状态 - 如果现货、合约、C2C 都配置为不可见则订单模块不展示 */
export function getOrdersModuleStatus() {
  if (
    moduleData &&
    moduleData[ModuleEnum.spot] === false &&
    moduleData[ModuleEnum.contract] === false &&
    moduleData[ModuleEnum.c2c] === false
  ) {
    return false
  }
  return true
}

/** 获取衍生品模块显示状态 - 如果期权、娱乐区都不可见则该模块不展示，目前仅对财务记录使用 */
export function getDerivativeModuleStatus() {
  if (moduleData && moduleData[ModuleEnum.options] === false && moduleData[ModuleEnum.entertainment] === false) {
    return false
  }
  return true
}

/**
 * 获取有权限的模块路由 - 实现动态化模块配置
 * @param data 要展示的模块路由
 * @returns
 */
export const getAuthModuleRoutes = (data = {}) => {
  const resultRoutes: any[] = []
  for (let key in data) {
    if (moduleData[key] === false) {
      continue
    }

    // 行情模块特殊处理，如果现货、合约都不可见则屏蔽行情模块
    if (key === ModuleEnum.markets && !getMarketsModuleStatus()) {
      continue
    }

    resultRoutes.push(data[key])
  }

  return resultRoutes
}

/**
 * format navigation menu list structure to getAuthModuleRoutes function params
 * @param data navigation menu list
 * @returns formatted authModules and otherRoutes
 */
export const AuthModuleAdapterNavi = (data: YapiGetV1ChainStarGetNavigationListNavigationBarListData[]) => {
  // routes config that doesn't belong to authModule
  let otherRoutes: YapiGetV1ChainStarGetNavigationListNavigationBarListData[] = []
  let authModules = data?.reduce((a, c) => {
    const moduleRoutes = Object.keys(ModuleByRoute)
    const currentModule = moduleRoutes.find(route => c?.url?.includes(route))
    if (currentModule) a[ModuleByRoute[currentModule]] = c
    else otherRoutes.push(c)
    return a
  }, {})
  return { authModules, otherRoutes }
}

/**
 * 模块路由匹配规则 - 匹配以**打头的路由
 * @param path
 * @param routes
 * @returns
 */
export function isStartsWithRoutes(path: string, routes: string[]) {
  return routes.some(keyword => path.startsWith(keyword))
}

/** 判断路由是否为模块白名单路由 */
export function IsModuleWhiteListRoute(path: string) {
  const isShowC2C = getModuleStatusByKey(ModuleEnum.c2c)
  const isShowSpot = getModuleStatusByKey(ModuleEnum.spot)
  const isShowContract = getModuleStatusByKey(ModuleEnum.contract)
  const isShowOption = getModuleStatusByKey(ModuleEnum.options)
  const optionModuleRoutes = ['/ternary-option']

  if (!isShowC2C && path.includes('/c2c/')) {
    return false
  }

  if (!isShowSpot && isStartsWithRoutes(path, spotModuleRoutes)) {
    return false
  }

  if (!isShowContract && isStartsWithRoutes(path, contractModuleRoutes)) {
    return false
  }

  if (!isShowOption && isStartsWithRoutes(path, optionModuleRoutes)) {
    return false
  }

  return true
}
