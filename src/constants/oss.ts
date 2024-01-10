import { fastUrlUtils } from '@nbit/utils'
import { baseCommonStore } from '@/store/common'
import { isChainstar } from '@/helper/env'
import { fusionModeBConfig, getBConfig } from './business-users'

const getFastUrl = fastUrlUtils.getFastUrl
const { iconfontFile, ossFolder } = getBConfig()

export const oss_address = getFastUrl('https://markcoin.oss-ap-southeast-1.aliyuncs.com')

const getOssAddress = () => {
  return `${oss_address}${ossFolder}`
}

export const getIsManyMerchantMode = () => {
  const { isMergeMode } = baseCommonStore.getState()
  // is chainstar and not fusion mode === many merchant mode
  return !isMergeMode && isChainstar
}

/** web OSS 地址 */
export const oss_domain_address = `${getOssAddress()}/web`

/** web OSS 渐变色 svg 地址 */
export const oss_svg_image_domain_address = `${getOssAddress()}/web/image/`

export const oss_svg_image_domain_address_agent = `${getOssAddress()}/web/image/agent/`

/** web OSS 非渐变色 svg 地址 */
export const oss_svg_domain_address = `${getOssAddress()}/web/icon/${iconfontFile}`

/** 国家国旗图片 png 地址 */
export const oss_area_code_image_domain_address = `${oss_address}/area_code_img/`

/** 融合模式图片地址 */
export const oss_merge_mode_image_domain_address = `${getOssAddress()}/web/image/merge_mode/`

/** 融合模式 svg 地址 */
export const oss_merge_mode_svg_domain_address = `${getOssAddress()}/web/icon/${fusionModeBConfig.iconfontFile}`
