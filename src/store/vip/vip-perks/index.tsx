import { create } from 'zustand'

import { createTrackedSelector } from 'react-tracked'
import produce from 'immer'
import { devtools } from 'zustand/middleware'
import { YapiGetV1MemberVipBaseBenefitListData } from '@/typings/yapi/MemberVipBaseBenefitListV1GetApi'
import { Button } from '@nbit/arco'
import { VipCenterBalanceRedirectModal, VipCenterDeriviativesRedirectModal } from '@/features/vip/vip-center-modals'
import { YapiGetV1MemberVipBaseConfigListData } from '@/typings/yapi/MemberVipBaseConfigListV1GetApi'
import { t } from '@lingui/macro'
import { baseUserStore } from '@/store/user'
import { amountCalStatus } from '@/constants/vip'

type TLayoutStore = ReturnType<typeof getStore>

export const defaultUpgradeData = () => [
  {
    apiKey: 'vipSpotAmount',
    limitApiKey: 'spotAmount',
    enableApiKey: 'spotAmountCalStatus',
    title: t`features_vip_vip_tier_vip_tier_table_tier_table_schema_q4vput2j1x`,
    description: t`store_vip_vip_perks_index__x9b_aw3si`,
    // popoverDescription:
    //   '当天 00:00（UTC+8）左右快照计算近 30 天“现货交易量” & “衍生品交易量”及当前的“资产余额”，并在当天 08:00（UTC+8）左右更新用户 VIP 等级和费率，更新后用户即可享受对应等级中的对应费率折扣。 （最终等级按计算所得最高等级取值）',
    button: (
      <Button type="primary" className={'upgrade-btn'}>
        {t`trade.c2c.trade`}
      </Button>
    ),
    value: 0,
    limit: 0,
    isEnabled: amountCalStatus.enable,
    redirectionUrl: '/trade/BTCUSDT',
  },
  {
    apiKey: 'vipDerivativesAmount',
    limitApiKey: 'derivativesAmount',
    enableApiKey: 'derivativesAmountCalStatus',
    title: t`store_vip_vip_perks_index_vnzi9xwkw1`,
    description: t`store_vip_vip_perks_index_d9cbd4e3mj`,
    popoverDescription: t`store_vip_vip_perks_index_1r6muqioqx`,
    button: (
      <Button type="primary" className={'upgrade-btn'}>
        {t`trade.c2c.trade`}
      </Button>
    ),
    Modal: VipCenterDeriviativesRedirectModal,
    value: 0,
    limit: 0,
    isEnabled: amountCalStatus.enable,
  },
  {
    apiKey: 'vipBalanceAmount',
    limitApiKey: 'balanceAmount',
    enableApiKey: 'balanceAmountCalStatus',
    title: t`store_vip_vip_perks_index_kixnzvuwq4`,
    description: t`store_vip_vip_perks_index_6qzit_8ujw`,
    popoverDescription: t`features_vip_vip_tier_vip_tier_table_tier_table_schema_k7h28bydub`,
    button: (
      <Button type="primary" className={'upgrade-btn'}>
        {t`store_vip_vip_perks_index_jau0cfswdl`}
      </Button>
    ),
    Modal: VipCenterBalanceRedirectModal,
    value: 0,
    limit: 0,
    isEnabled: amountCalStatus.enable,
  },
]

function getStore(set) {
  return {
    list: null as (YapiGetV1MemberVipBaseBenefitListData & { benefitName: string })[] | null,
    setList: list =>
      set(
        produce((draft: TLayoutStore) => {
          draft.list = list
        })
      ),
    upgradeConditions: null as YapiGetV1MemberVipBaseConfigListData[] | null,
    setUpgradeConditions: conditions =>
      set(
        produce((draft: TLayoutStore) => {
          draft.upgradeConditions = conditions
        })
      ),
    currentUpgradeData: null as ReturnType<typeof defaultUpgradeData> | null,
    setcurrentUpgradeData: data =>
      set(
        produce((draft: TLayoutStore) => {
          draft.currentUpgradeData = data
        })
      ),
    currentPeriod: 0,
    setcurrentPeriod: period =>
      set(
        produce((draft: TLayoutStore) => {
          draft.currentPeriod = period
        })
      ),
  }
}
const baseVipPerksStore = create(devtools(getStore, { name: 'vip-perks-store' }))

const useVipPerksStore = createTrackedSelector(baseVipPerksStore)

// clear upgrade data on logout
const clearUpgradesDataOnLogout = baseUserStore.subscribe(
  state => state.isLogin,
  async isLogin => {
    if (!isLogin) {
      const { setUpgradeConditions } = baseVipPerksStore.getState()
      setUpgradeConditions(null)
    }
  }
)

export { useVipPerksStore, baseVipPerksStore, clearUpgradesDataOnLogout }
