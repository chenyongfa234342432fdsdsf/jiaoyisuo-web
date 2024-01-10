import axios from 'axios'
import { envUtils } from '@nbit/utils'

const { getEnvS3Url, S3UrlNameEnum, EnvTypesEnum } = envUtils
/**
 * 动态获取不同商户、环境下的 s3 相关地址
 */
export async function getEnvUrlConfig(businessId, mode) {
  const url = getEnvS3Url(mode, businessId, S3UrlNameEnum.dnsConfig)
  return axios
    .get(url)
    .then(res => res.data)
    .catch(e => {
      console.error(e)
      console.error('动态获取不同商户、环境下的 s3 相关地址错误，请检查 businessId 是否正确')
      console.error(`businessId: ${businessId}`)
      console.error(url)
      process.exit(1)
    })
}

/**
 * 获取模块动态化配置文件 - s3 相关地址
 * mode: 环境
 * businessId: 商户 id
 */
export async function getDynamicModuleConfig(businessId, mode) {
  const url = getEnvS3Url(mode, businessId, S3UrlNameEnum.moduleAuthConfig)
  return axios
    .get(url)
    .then(res => res.data)
    .catch(e => {
      console.error(e)
      console.error('动态获取不同商户、环境下的 s3 模块动态配置地址错误，请检查 businessId 是否正确')
      console.error(`businessId: ${businessId}`)
      console.error(url)
      process.exit(1)
    })
}

/**
 * 更具环境、businessId、接口动态注入环境变量
 */
export async function injectEnvConfig(preConfig, mode, businessId = '1') {
  if (mode === 'multibuild') {
    return
  }
  const envUrlConfig = await getEnvUrlConfig(businessId, mode)
  let resConfig: Record<string, string> = {}
  const baseUrl = `${envUrlConfig.API.bff}api/forward/`
  resConfig.VITE_MARKCOIN_BASE_URL = baseUrl
  resConfig.VITE_MARKCOIN_SERVER_BASE_URL =
    mode === EnvTypesEnum.development ? baseUrl : 'http://newbit-bff.core.svc:4100/api/forward/'
  resConfig.VITE_MARKCOIN_WS = envUrlConfig.WS_SPOT.web
  resConfig.VITE_MARKCOIN_WS_CONTRACT = envUrlConfig.WS_CONTRACT.web
  resConfig.VITE_MARKCOIN_WS_OPTION = envUrlConfig.WS_OPTION?.web || envUrlConfig.WS_CONTRACT.web
  resConfig.VITE_MARKCOIN_H5_URL = envUrlConfig.H5.h5
  resConfig.VITE_MARKCOIN_WEB_URL = envUrlConfig.H5.web
  resConfig.VITE_MARKCOIN_SAAS = envUrlConfig?.saas_cd?.web
  /** 娱乐区 url */
  resConfig.VITE_MARKCOIN_RECREATION_WEB = envUrlConfig.H5['recreation-web']

  resConfig.VITE_MARKCOIN_BUSINESS_ID = `${businessId}`
  resConfig.VITE_MARKCOIN_TEMPLATE_ID = envUrlConfig?.MAINPAGE_TEMPLATE?.web

  /** c2c mode */
  const c2cMode = envUrlConfig?.C2C_MODE?.web
  const c2cBid = envUrlConfig?.C2C_BUSINESS_ID?.web
  resConfig.VITE_MARKCOIN_C2C_MODE = c2cMode
  resConfig.VITE_MARKCOIN_C2C_BID = c2cBid
  if (c2cMode === 'public' && c2cBid) {
    resConfig.VITE_MARKCOIN_C2C_BID = envUrlConfig?.C2C_BUSINESS_ID?.web
    const fastPayEnvConfig = await getEnvUrlConfig(c2cBid, mode)
    resConfig.VITE_MARKCOIN_PUBLIC_C2C_BASE_URL = `${fastPayEnvConfig.API.bff}api/forward/`
    resConfig.VITE_MARKCOIN_PUBLIC_C2C_WS = fastPayEnvConfig.WS_SPOT.web
  }

  // 本地测试用 - 模块动态化配置
  // const defaultModulesDynamicConfig = {
  //   spot: false,
  //   contract: true,
  //   c2c: true,
  //   entertainment: true,
  //   options: true,
  // }
  // const moduleConfig = defaultModulesDynamicConfig
  const moduleConfig = await getDynamicModuleConfig(businessId, mode)
  resConfig.VITE_MARKCOIN_MODULE_CONFIG = JSON.stringify(moduleConfig)

  resConfig = { ...resConfig, ...preConfig }
  Object.keys(resConfig).forEach(k => {
    process.env[k] = resConfig[k]
  })
}
