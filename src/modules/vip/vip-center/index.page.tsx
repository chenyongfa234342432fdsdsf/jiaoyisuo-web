import { getV1MemberVipBaseInfoApiRequest } from '@/apis/vip'
import Vip3dSwiper from '@/features/vip/components/vip-3d-swiper'
import VipCenterPerks from '@/features/vip/vip-center-perks'
import VipCenterTierRates from '@/features/vip/vip-center-tier-rates'
import VipCenterUpgrade from '@/features/vip/vip-center-upgrade'
import { useRequest } from 'ahooks'
import {
  useInitVipCodeDict,
  useVipPerksList,
  useVipUpgradeConditionsByLevel,
  useVipUpgradeConditionsList,
  useVipUserInfo,
} from '@/hooks/features/vip/vip-perks'
import Icon from '@/components/icon'
import {
  getVipCenterBannerLevelBg,
  getVipCenterBannerLevelIcon,
  getVipCenterBannerLevelImg,
  headerBgColorMap,
} from '@/constants/vip'
import { t } from '@lingui/macro'
import { useState } from 'react'
import { getBusinessName } from '@/helper/common'
import { useScaleDom } from '@/hooks/use-scale-dom'
import styles from './index.module.css'

const headerTags = () => [
  {
    title: t`modules_vip_vip_center_index_page_ihvfuakwk1`,
    icon: <Icon name="icon_vip_percentage" />,
  },
  {
    title: t`modules_vip_vip_center_index_page_8in6khuk9l`,
    icon: <Icon name="icon_vip_drop" />,
  },
  {
    title: t`modules_vip_vip_center_index_page_mpkj0yfxlv`,
    icon: <Icon name="icon_vip_crown" />,
  },
]

function Page() {
  useInitVipCodeDict()

  const { userConfig: data } = useVipUserInfo()
  const { levelCode = '', level = '0', nextLevelCode, ...rest } = data || {}

  const [currLevelCode, setcurrLevelCode] = useState<string>()

  const [nextLevel, setnextLevel] = useState<string>()

  const perksList = useVipPerksList()
  const upgradeConditions = useVipUpgradeConditionsList()
  let currentPerkList =
    nextLevel === null ? perksList : perksList?.filter(perk => currLevelCode && perk.levelCode <= currLevelCode) || []
  const prevPerkList = levelCode ? perksList?.filter(perk => perk?.levelCode?.toString() === nextLevel?.toString()) : []

  const formatted = upgradeConditions?.map((perk, idx) => {
    const level = perk.level as unknown as number
    return {
      ...perk,
      levelIcon: getVipCenterBannerLevelIcon(level),
      levelBg: getVipCenterBannerLevelBg(level),
      levelImg: getVipCenterBannerLevelImg(level),
    }
  })

  const defaultIdx = formatted?.map(each => each.level).indexOf(level)

  const [currentIndex, setcurrentIndex] = useState(0)

  const businessName = getBusinessName()

  const autoScaleDom = useScaleDom(400, businessName)

  return (
    <div className="bg-bg_color">
      <div className={styles['vip-center-header']} style={{ backgroundImage: headerBgColorMap?.[currentIndex] }}>
        <div className="header-layout">
          <div>
            <div ref={autoScaleDom} className="header-title whitespace-nowrap pr-2">
              {businessName} VIP {t`modules_vip_vip_center_index_page__xaktwgeii`}
            </div>
            <div className="header-tags">
              {headerTags()?.map(({ icon, title }) => (
                <span key={title}>
                  {icon}
                  <span className="ml-1">{title}</span>
                </span>
              ))}
            </div>
          </div>
          <Vip3dSwiper
            defaultIdx={defaultIdx}
            onChange={idx => {
              const _LevelCode = formatted?.[idx]?.levelCode
              const _nextLevelCode = formatted?.[idx]?.nextLevelCode
              setcurrentIndex(idx)
              _LevelCode && setcurrLevelCode(_LevelCode)
              setnextLevel(_nextLevelCode)
            }}
          >
            {formatted?.map((perk, idx) => (
              <Vip3dSwiper.SwiperItem key={idx} {...perk} />
            ))}
          </Vip3dSwiper>
        </div>
      </div>
      <div className={styles['vip-center-layout']}>
        <VipCenterTierRates levelCode={currLevelCode} />
        <VipCenterUpgrade
          headerTitle={t`modules_vip_vip_center_index_page_seyeguxxga`}
          levelCode={currLevelCode}
          nextLevelCode={nextLevel}
        />
        <VipCenterPerks
          headerTitle={t`modules_vip_vip_center_index_page_fplhcn5gdm`}
          perkList={currentPerkList as any}
        />
        {nextLevel !== null && (
          <VipCenterPerks headerTitle={t`modules_vip_vip_center_index_page_b64qqgjfkl`} perkList={prevPerkList} />
        )}
      </div>
    </div>
  )
}

export { Page }
