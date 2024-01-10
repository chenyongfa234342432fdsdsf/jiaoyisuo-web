import { t } from '@lingui/macro'
import { getBusinessName } from '@/helper/common'
import { UserModuleDescribeKeyEnum, UserOrderUnit } from '@/constants/user'
import { getMemberViewSymbolType, postMemberViewSymbolType } from '@/apis/future/preferences'
import { baseContractPreferencesStore } from '@/store/user/contract-preferences'
import { baseFuturesStore } from '@/store/futures'
import { TradeMarketAmountTypesEnum } from '@/constants/trade'
import { Message } from '@nbit/arco'

export function getUserPageDefaultDescribeMeta(pageTitle: string, key: string) {
  const values = {
    businessName: getBusinessName(),
  }

  const getId = () => {
    switch (key) {
      case UserModuleDescribeKeyEnum.default:
        return `modules_assets_company_verified_material_index_page_server_efre42ngx6`
      case UserModuleDescribeKeyEnum.register:
        return `modules_user_register_index_page_ojyzttck8o`
      case UserModuleDescribeKeyEnum.agentCenter:
        return `helper_agent_index_gr1uz7jkp0`
      default:
        return ``
    }
  }

  return {
    title: pageTitle,
    description: t({
      id: getId(),
      values,
    }),
  }
}

export async function getOrderUnit() {
  const res = await getMemberViewSymbolType({})
  if (res.isOk && res.data) {
    const { updateTradeUnit } = baseFuturesStore.getState()
    updateTradeUnit(
      res.data?.symbolType !== UserOrderUnit.targetCurrency
        ? TradeMarketAmountTypesEnum.funds
        : TradeMarketAmountTypesEnum.amount
    )
    const { setOrderUnit } = baseContractPreferencesStore.getState()
    setOrderUnit(res.data?.symbolType as UserOrderUnit)
  }
}

export async function postSetOrderUnit(key: UserOrderUnit) {
  const { updateTradeUnit } = baseFuturesStore.getState()
  updateTradeUnit(
    key !== UserOrderUnit.targetCurrency ? TradeMarketAmountTypesEnum.funds : TradeMarketAmountTypesEnum.amount
  )
  const res = await postMemberViewSymbolType({ symbolType: key })
  if (res.isOk && res.data) {
    const { setOrderUnit } = baseContractPreferencesStore.getState()
    setOrderUnit(key as UserOrderUnit)

    Message.success(t`features/user/personal-center/settings/converted-currency/index-0`)
  }
}
