import VipTierSetting from '@/features/vip/vip-tier-setting'
import { useInitVipCodeDict } from '@/hooks/features/vip/vip-perks'
import { t } from '@lingui/macro'
import styles from './index.module.css'

function Page() {
  useInitVipCodeDict()

  return (
    <div className={styles.scoped}>
      <div className="h-28 bg-card_bg_color_01 flex">
        <div className="header-title">{t`features/user/personal-center/profile/index-9`}</div>
      </div>
      <VipTierSetting />
    </div>
  )
}

export { Page }
