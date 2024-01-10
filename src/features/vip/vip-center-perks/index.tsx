import LazyImage from '@/components/lazy-image'
import { YapiGetV1MemberVipBaseBenefitListData } from '@/typings/yapi/MemberVipBaseBenefitListV1GetApi'
import NoDataImage from '@/components/no-data-image'
import { isEmpty } from 'lodash'
import Icon from '@/components/icon'
import { useState } from 'react'
import { getVipCdValue } from '@/helper/vip'
import { t } from '@lingui/macro'
import { useCommonStore } from '@/store/common'
import { ThemeEnum } from '@/constants/base'
import styles from './index.module.css'
import VipPerksModal from '../vip-perks-modal'
import VipAvatarModal from '../vip-avatar-modal'

function PerkItem(props: YapiGetV1MemberVipBaseBenefitListData & { onclick?: any }) {
  const { description, benefitCode, benefitIcon, onclick, darkIcon } = props
  const { theme } = useCommonStore()
  return (
    <div className={styles['vip-center-perks-item']} {...(onclick && { onClick: e => onclick(e) })}>
      <div className="flex flex-row">
        <div className="icon-container">
          <LazyImage src={theme === ThemeEnum.light ? benefitIcon : darkIcon} width={25} height={25} className="mr-4" />
        </div>
        <div>
          <div className="font-medium text-base">{getVipCdValue(benefitCode)}</div>
          <span className="text-xs text-text_color_03">{description}</span>
        </div>
      </div>
      <span className="my-auto ml-auto text-xs cursor-pointer text-text_color_02">{t`features_announcement_bulletin_board_index_5101190`}</span>
      <Icon name="next_arrow" hasTheme />
    </div>
  )
}

function VipCenterPerks({
  headerTitle,
  perkList,
}: {
  headerTitle: string
  perkList?: YapiGetV1MemberVipBaseBenefitListData[]
}) {
  const [modalVisible, setmodalVisible] = useState(false)
  const [frameModalVisible, setframeModalVisible] = useState(false)
  const [selectedPerk, setselectedPerk] = useState<YapiGetV1MemberVipBaseBenefitListData>()
  return (
    <div className={styles['vip-center-perks']}>
      <div className="flex flex-row justify-between mb-6">
        <span className="font-medium">{headerTitle}</span>
        <span className="text-xs text-text_color_03 cursor-pointer" onClick={() => setmodalVisible(true)}>
          {t`features_vip_vip_center_perks_index_e0biknwt1o`} <Icon className="mb-0.5" name="next_arrow" hasTheme />
        </span>
      </div>
      {!isEmpty(perkList) ? (
        <div className="grid grid-cols-2 gap-10">
          {perkList?.map((perk, idx) => (
            <PerkItem
              key={idx}
              {...perk}
              onclick={() => {
                setselectedPerk(perk)
                setmodalVisible(true)
              }}
            />
          ))}
        </div>
      ) : (
        <NoDataImage size="h-24 w-28" />
      )}

      {modalVisible && (
        <VipPerksModal
          visible={modalVisible}
          setvisible={setmodalVisible}
          setframeModalVisible={setframeModalVisible}
          defaultTabByBenefitCode={selectedPerk?.benefitCode}
        />
      )}

      {frameModalVisible && <VipAvatarModal setvisible={setframeModalVisible} visible={frameModalVisible} />}
    </div>
  )
}

export default VipCenterPerks
