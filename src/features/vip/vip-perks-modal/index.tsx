import Icon from '@/components/icon'
import Tabs from '@/components/tabs'
import { Button, Carousel, Modal } from '@nbit/arco'
import LazyImage from '@/components/lazy-image'
import { useEffect, useRef, useState } from 'react'
import { useVipPerksList, useVipUserInfo } from '@/hooks/features/vip/vip-perks'
import { YapiGetV1MemberVipBaseBenefitListData } from '@/typings/yapi/MemberVipBaseBenefitListV1GetApi'
import { getVipPerkLevelIcon, getVipPerkModalImg } from '@/constants/vip'
import { getVipCdValue } from '@/helper/vip'
import { link } from '@/helper/link'
import { getVipTierRoutePath } from '@/helper/route'
import { t } from '@lingui/macro'
import styles from './index.module.css'
import VipAvatarModal from '../vip-avatar-modal'

function VipPerkCard(
  props: YapiGetV1MemberVipBaseBenefitListData & { style?: string; className?: string; levelIcon: string }
) {
  const { style = {}, className = '', levelCode, levelIcon, level, benefitCode, description, introduction } = props

  return (
    <div style={style} className={className}>
      <div className={`${styles['vip-perk-card-layout']}`}>
        <div className="vip-perk-card">
          <div className="title-container">
            <div className="title text-base">{getVipCdValue(benefitCode)}</div>
            <span className="subtitle text-sm">{description}</span>
          </div>
          <div className="icon-title-layout">
            <Icon name="icon_vip_equity_text" hasTheme />
            <span>
              <div className="title">{t`features_vip_vip_perks_modal_index_qtjasqjylj`}</div>
              <span className="subtitle">{introduction}</span>
            </span>
          </div>
          <div className="icon-title-layout">
            <Icon name="icon_vip_equity_man" hasTheme />
            <span>
              <div className="title">{t`features_vip_vip_perks_modal_index_35cqobhhuy`}</div>
              <span className="subtitle">
                <span className="text-brand_color">{levelCode}</span> {t`features_vip_vip_perks_modal_index_9gbay5vu9e`}
              </span>
            </span>
          </div>
          <div className="icon-title-layout">
            <Icon name="icon_vip_equity_crown" hasTheme />
            <span>
              <div className="title">{t`features_vip_vip_perks_modal_index_acxmex1msd`}</div>
              <LazyImage src={levelIcon} className="level-icon" />
              {/* <span className="text-brand_color text-3xl">LV{levelCode}</span> */}
            </span>
          </div>
        </div>
        <div className="vip-perk-card inactive-left"></div>
        <div className="vip-perk-card inactive-right"></div>
        <LazyImage className="perk-img-tag" src={getVipPerkModalImg[benefitCode]} width={120} height={120} />
      </div>
    </div>
  )
}

function VipPerksModal({
  visible,
  setvisible,
  defaultTabByBenefitCode,
  setframeModalVisible,
}: {
  visible: boolean
  setvisible: (state: boolean) => void
  defaultTabByBenefitCode?: string
  setframeModalVisible: (state: boolean) => void
}) {
  const [currentTab, setcurrentTab] = useState(0)
  let perksList = useVipPerksList() || []

  const specialIdx = useRef<{ avatar: number | null; rate: number | null }>({ avatar: null, rate: null })
  const perksMapByIdx = perksList?.reduce((a, c, idx) => {
    if (c.benefitCode === 'exclusive_avatar') specialIdx.current.avatar = idx
    if (c.benefitCode === 'rate_discount') specialIdx.current.rate = idx
    a[idx] = c
    return a
  }, {})

  useEffect(() => {
    if (defaultTabByBenefitCode) {
      let tabIdx = 0
      perksList?.forEach((perk, idx) => {
        if (perk.benefitCode === defaultTabByBenefitCode) {
          tabIdx = idx
        }
      })
      setcurrentTab(tabIdx)
    }
  }, [defaultTabByBenefitCode])

  const { userConfig } = useVipUserInfo()
  const { level: currentLevel } = userConfig || {}

  // add properties for tab components
  const formattedList = perksList.map((perk, idx) => {
    const level = Number(currentLevel)
    return {
      ...perk,
      title: getVipCdValue(perk.benefitCode),
      id: idx,
      levelIcon: getVipPerkLevelIcon(level),
    }
  })

  const renderBtn = () => {
    if (perksMapByIdx[currentTab]?.level > Number(currentLevel))
      return (
        <Button long className={'modal-btn'} disabled onClick={handleOnClick}>
          <span className="text-text_color_04">{t`features_vip_vip_perks_modal_index_ooedqnxamn`}</span>
        </Button>
      )
    // avatar btn
    if (currentTab === specialIdx.current.avatar)
      return (
        <Button long className={'modal-btn'} type="primary" onClick={handleOnClick}>
          {t`features_vip_vip_perks_modal_index_i7xm47vvll`}
        </Button>
      )
    if (currentTab === specialIdx.current.rate)
      return (
        <Button long className={'modal-btn'} type="primary" onClick={handleOnClick}>
          {t`features_vip_vip_perks_modal_index_ljfueelnmm`}
        </Button>
      )
    return (
      <Button long className={'modal-btn default-btn'} type="text">
        {t`features_vip_vip_perks_modal_index_cjbnixjw9o`}
      </Button>
    )
  }

  const handleOnClick = () => {
    if (currentTab === specialIdx.current.avatar) {
      setframeModalVisible(true)
      setvisible(false)
    }
    if (currentTab === specialIdx.current.rate) link(getVipTierRoutePath())
  }

  return (
    <Modal
      visible={visible}
      className={styles['vip-perks-modal']}
      closable={false}
      onCancel={() => setvisible(false)}
      footer={renderBtn()}
      autoFocus={false}
    >
      <Tabs
        autoScrollIntoView
        isScrollable
        classNames="perks-tab"
        mode="line"
        tabList={formattedList}
        onChange={({ id }) => setcurrentTab(id)}
        value={currentTab}
      />
      <Carousel
        animation="slide"
        showArrow="always"
        currentIndex={currentTab}
        onChange={idx => {
          setcurrentTab(idx)
        }}
        indicatorType="never"
        icons={{
          prev: <Icon name="back_black" />,
          next: <Icon className="rotate-180" name="back_black" />,
        }}
      >
        {formattedList.map((perk, idx) => (
          <VipPerkCard key={idx} {...perk} />
        ))}
      </Carousel>
      <div className="modal-divider"></div>
      <Icon className="close-icon" name="del_input_box_black" onClick={() => setvisible(false)} />
    </Modal>
  )
}

export default VipPerksModal
