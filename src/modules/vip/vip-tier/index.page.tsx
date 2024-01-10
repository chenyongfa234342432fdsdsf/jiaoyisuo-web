import VipTierLayout from '@/features/vip/vip-tier/vip-tier-layout'
import { useInitVipCodeDict } from '@/hooks/features/vip/vip-perks'
import { t } from '@lingui/macro'

function Page() {
  useInitVipCodeDict()

  return (
    <VipTierLayout
      headerTitle={t`modules_vip_vip_tier_index_page_m8lbnwvkws`}
      headerSubtitle={t`modules_vip_vip_tier_index_page__ofhxsprbg`}
    />
  )
}

export { Page }
