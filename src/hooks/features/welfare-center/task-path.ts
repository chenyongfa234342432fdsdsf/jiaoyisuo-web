import { useDefaultFuturesUrl, getDefaultTradeUrl } from '@/helper/market'
import { getC2cOrderShortPageRoutePath, getKycPageRoutePath } from '@/helper/route'
import { MissionType } from '@/constants/welfare-center/task-center'

export function useTaskPath() {
  return {
    [MissionType.contract_transfer]: useDefaultFuturesUrl(),
    [MissionType.spot_goods]: getDefaultTradeUrl(),
    [MissionType.spot_fee]: getDefaultTradeUrl(),
    [MissionType.contract_fee]: useDefaultFuturesUrl(),
    [MissionType.transfer_input]: getC2cOrderShortPageRoutePath(),
    [MissionType.kyc_authorized]: getKycPageRoutePath(),
    [MissionType.mobile_bind]: '/personal-center/account-security/phone?type=bind',
    [MissionType.account_security_authorized]: '/personal-center/account-security',
  }
}
