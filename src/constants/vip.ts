import { t } from '@lingui/macro'
import { oss_svg_image_domain_address } from './oss'

export const vipCenterRedirectMenuIconUrl = {
  'futures': `${oss_svg_image_domain_address}vip/image_derive_deal.png`,
  'ternary-option': `${oss_svg_image_domain_address}vip/image_derive_change.png`,
  'recreation': `${oss_svg_image_domain_address}vip/image_derive_game.png`,
  'deposit': `${oss_svg_image_domain_address}vip/image_derive_toupup.png`,
  'fast-trade': `${oss_svg_image_domain_address}vip/image_derive_pay.png`,
}

export const getVipPerkLevelIcon = (level: number | string) =>
  `${oss_svg_image_domain_address}vip/image_rights_lv${level}.png`

export const getVipAvatarFrameIcon = (level: number | string) =>
  `${oss_svg_image_domain_address}vip/image_heads_lv${level}.png`

export const getVipCenterBannerLevelIcon = (level: number | string) =>
  `${oss_svg_image_domain_address}vip/image_vip_lv${level}.png`

export const getVipCenterBannerLevelBg = (level: number | string) => {
  const lvlNum = Number(level)
  if (lvlNum > 0 && lvlNum < 4) return `${oss_svg_image_domain_address}vip/image_vip_lv${1}_bj.png`
  if (lvlNum >= 4 && lvlNum < 7) return `${oss_svg_image_domain_address}vip/image_vip_lv${4}_bj.png`
  if (lvlNum >= 7 && lvlNum < 10) return `${oss_svg_image_domain_address}vip/image_vip_lv${7}_bj.png`
  return `${oss_svg_image_domain_address}vip/image_vip_lv${lvlNum}_bj.png`
}

export const getVipCenterBannerLevelImg = (level: number | string) =>
  `${oss_svg_image_domain_address}vip/image_vip_lv${level}_icon.png`

export const getVipPerkModalImg = {
  rate_discount: `${oss_svg_image_domain_address}vip/image_rights_rate.png`,
  exclusive_avatar: `${oss_svg_image_domain_address}vip/image_rights_exclusive.png`,
  service_group: `${oss_svg_image_domain_address}vip/image_rights_message.png`,
  one_to_one_service: `${oss_svg_image_domain_address}vip/image_rights_manage.png`,
  project_recommend: `${oss_svg_image_domain_address}vip/image_rights_project.png`,
  airdrop_priority: `${oss_svg_image_domain_address}vip/image_rights_airdrop.png`,
  currency_priority: `${oss_svg_image_domain_address}vip/image_rights_newcoin.png`,
  birthday_surprise: `${oss_svg_image_domain_address}vip/image_rights_birthday.png`,
}

export enum vipTierProductLineEnum {
  spot = 'spot',
  perpetual = 'perpetual',
  ra = 'ra',
}

export const getVipTierProductLine = () => {
  return {
    [vipTierProductLineEnum.spot]: t`trade.type.coin`,
    [vipTierProductLineEnum.perpetual]: t`constants/trade-0`,
    [vipTierProductLineEnum.ra]: t`features_recreation_index_oqhxipaffm`,
  }
}

export const getVipTierHeaderProductLine = () => {
  return {
    [vipTierProductLineEnum.spot]: t`order.constants.marginMode.spot`,
    [vipTierProductLineEnum.perpetual]: t`future.funding-history.future-select.future`,
    [vipTierProductLineEnum.ra]: t`features_recreation_index_oqhxipaffm`,
  }
}

export const getVipTabTitle = (type: vipTierProductLineEnum) => {
  if (type === vipTierProductLineEnum.spot) return t`constants_vip_sq5fltydgw`
  if (type === vipTierProductLineEnum.perpetual) return t`constants_vip_nwclyltfak`
}

export const getVipTabHeader = (type: vipTierProductLineEnum) => {
  if (type === vipTierProductLineEnum.spot) return t`constants_vip_jubqppxwkp`
  if (type === vipTierProductLineEnum.perpetual) return t`constants_vip_g2b4jdsc6h`
}

export const colorMap = {
  0: '#91A7CF',
  1: '#6E98D9',
  2: '#6E98D9',
  3: '#6E98D9',
  4: '#7673CA',
  5: '#7673CA',
  6: '#7673CA',
  7: '#AC8234',
  8: '#AC8234',
  9: '#AC8234',
  10: '#F2C777',
}

export const bgColorMap = {
  0: '#BCD6FE',
  1: '#BCD6FE',
  2: '#BCD6FE',
  3: '#BCD6FE',
  4: '#C9C5FA',
  5: '#C9C5FA',
  6: '#C9C5FA',
  7: '#FBD897',
  8: '#FBD897',
  9: '#FBD897',
  10: '#535353',
}

export const tagColorMap = {
  0: 'linear-gradient(101deg, #6E98D9 5.41%, #84AAE3 94.22%)',
  1: 'linear-gradient(101deg, #6E98D9 5.41%, #84AAE3 94.22%)',
  2: 'linear-gradient(101deg, #6E98D9 5.41%, #84AAE3 94.22%)',
  3: 'linear-gradient(101deg, #6E98D9 5.41%, #84AAE3 94.22%)',
  4: 'linear-gradient(101deg, #8281D8 5.41%, #918FEB 94.22%)',
  5: 'linear-gradient(101deg, #8281D8 5.41%, #918FEB 94.22%)',
  6: 'linear-gradient(101deg, #8281D8 5.41%, #918FEB 94.22%)',
  7: 'linear-gradient(84deg, #F2C777 74.22%, #EAB554 94.92%)',
  8: 'linear-gradient(84deg, #F2C777 74.22%, #EAB554 94.92%)',
  9: 'linear-gradient(84deg, #F2C777 74.22%, #EAB554 94.92%)',
  10: 'linear-gradient(84deg, #F2C777 74.22%, #EAB554 94.92%)',
}

export const headerBgColorMap = {
  0: 'linear-gradient(355deg, #8BA0C9 4.17%, #A6B7D6 95.83%)',
  1: 'linear-gradient(355deg, #668ECB 4.17%, #8DADDD 95.83%)',
  2: 'linear-gradient(355deg, #668ECB 4.17%, #8DADDD 95.83%)',
  3: 'linear-gradient(355deg, #668ECB 4.17%, #8DADDD 95.83%)',
  4: 'linear-gradient(0deg, #8784E4 11.93%, #9B98F3 100%)',
  5: 'linear-gradient(0deg, #8784E4 11.93%, #9B98F3 100%)',
  6: 'linear-gradient(0deg, #8784E4 11.93%, #9B98F3 100%)',
  7: 'linear-gradient(145deg, #E7C696 20.57%, #D6AE7B 79.21%)',
  8: 'linear-gradient(145deg, #E7C696 20.57%, #D6AE7B 79.21%)',
  9: 'linear-gradient(145deg, #E7C696 20.57%, #D6AE7B 79.21%)',
  10: 'linear-gradient(175deg, #343434 4.38%, #1D1D1D 95.83%)',
}

export enum amountCalStatus {
  enable = 'enable',
  disable = 'disable',
}
