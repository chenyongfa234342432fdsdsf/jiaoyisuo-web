import { baseVipStore } from '@/store/vip'
import { t } from '@lingui/macro'
import { getVipTierHeaderProductLine, getVipTierProductLine } from '@/constants/vip'
import { isEn } from '../i18n'
import { formatNumberDecimal } from '../decimal'

export function getVipCdValue(codeVal: string) {
  const { codeDictMap } = baseVipStore.getState()
  return getVipTierProductLine()?.[codeVal] || codeDictMap?.[codeVal]
}

export function getVipHeaderValue(codeVal: string) {
  return getVipTierHeaderProductLine()?.[codeVal]
}

export function getDiscountAmt(discount: number | string, hasDecimal?: boolean) {
  const discountVal = hasDecimal ? formatNumberDecimal(discount) : discount

  return `${discountVal || 0}%`
}

export async function blobToBase64(blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}
