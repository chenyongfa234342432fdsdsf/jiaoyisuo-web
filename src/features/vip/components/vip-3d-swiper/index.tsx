import { Button, Carousel } from '@nbit/arco'
import { ComponentProps, ReactNode, useEffect, useState } from 'react'
import LazyImage from '@/components/lazy-image'
import Icon from '@/components/icon'
import { YapiGetV1MemberVipBaseConfigListData } from '@/typings/yapi/MemberVipBaseConfigListV1GetApi'
import { getVipCdValue } from '@/helper/vip'
import { t } from '@lingui/macro'
import { bgColorMap, colorMap, tagColorMap } from '@/constants/vip'
import styles from './index.module.css'
import { VipCenterProtectModal } from '../../vip-center-modals'

function Vip3dSwiper(
  props: ComponentProps<typeof Carousel> & { defaultIdx?: number; onChange?: (idx: number) => void }
) {
  const { children, defaultIdx = 0, onChange, ...rest } = props
  const [idx, setidx] = useState(defaultIdx)
  useEffect(() => {
    setidx(defaultIdx)
  }, [defaultIdx])

  useEffect(() => {
    onChange && onChange(idx)
  }, [idx])

  return (
    <Carousel
      className={styles.scoped}
      animation="card"
      showArrow="always"
      indicatorType="never"
      icons={{
        prev: <Icon name="back_black" />,
        next: <Icon className="rotate-180" name="back_black" />,
      }}
      {...rest}
      currentIndex={idx}
      onChange={setidx}
    >
      {Array.isArray(children) &&
        children?.map((child, idx) => (
          <div key={idx} style={{ width: '60%' }}>
            {child}
          </div>
        ))}
    </Carousel>
  )
}

function SwiperItem(
  props: YapiGetV1MemberVipBaseConfigListData & {
    levelIcon: string
    levelBg: string
    levelImg: string
  }
) {
  const { levelStatus, protecting, levelIcon, levelBg, levelImg, levelCode, level } = props
  const [modalVisible, setmodalVisible] = useState(false)
  return (
    <div
      className={`${styles['swiper-item']}`}
      style={{ backgroundImage: `url(${levelBg})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
    >
      <div>
        <span className="tag" style={{ backgroundColor: bgColorMap[level], color: colorMap[level] }}>
          {getVipCdValue(levelStatus)}
        </span>
        <div className="flex flex-row">
          <LazyImage className="swiper-level" src={levelIcon} />
          {protecting && (
            <Button
              className={'swiper-btn'}
              style={{ backgroundImage: tagColorMap[level] }}
              onClick={() => setmodalVisible(true)}
            >
              {t`features_vip_components_vip_3d_swiper_index_nlava0ulke`}
              <Icon className="ml-1" name="property_icon_tips_hover_black" />
            </Button>
          )}
        </div>
      </div>
      <LazyImage className="banner-image" src={levelImg} />
      {protecting && modalVisible && (
        <VipCenterProtectModal levelCode={levelCode} visible={modalVisible} setvisible={setmodalVisible} />
      )}
    </div>
  )
}

Vip3dSwiper.SwiperItem = SwiperItem

export default Vip3dSwiper
