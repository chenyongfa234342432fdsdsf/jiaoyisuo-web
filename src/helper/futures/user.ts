import { SpotStopStatusEnum } from '@/constants/market'
import { UserContractVersionEnum, UserFuturesTradeStatus } from '@/constants/user'
import { baseUserStore } from '@/store/user'
import { baseContractPreferencesStore } from '@/store/user/contract-preferences'

/**
 * 是否开通合约
 */
export function getFuturesIsTrading() {
  const { isLogin, userInfo } = baseUserStore()
  return isLogin && userInfo.contractStatusInd === UserFuturesTradeStatus.open
}
/**
 * 是否开通专业版
 */
export function getFuturesIsProfessionalVersion() {
  const { isLogin } = baseUserStore()
  const contractPreferencesStore = baseContractPreferencesStore()
  const { perpetualVersion } = contractPreferencesStore.contractPreference
  const isProfessionalVersion = perpetualVersion === UserContractVersionEnum.professional
  return isLogin && isProfessionalVersion
}
