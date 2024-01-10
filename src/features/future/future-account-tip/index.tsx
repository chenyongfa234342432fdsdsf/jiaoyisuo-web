import { t } from '@lingui/macro'
import { oss_svg_image_domain_address } from '@/constants/oss'
import LazyImage from '@/components/lazy-image'
import { Modal } from '@nbit/arco'
import { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react'
import Lottie, { LottieRef } from 'lottie-react'
import { useCommonStore } from '@/store/common'
import { ThemeEnum } from '@nbit/chart-utils'
import DynamicLottie from '@/components/dynamic-lottie'
import styles from './index.module.css'

const animationOneData = 'account_tip_one_light'
const animationOneDataDark = 'account_tip_one_dark'
const animationTwoData = 'account_tip_two_light'
const animationTwoDataDark = 'account_tip_two_dark'
const animationThreeData = 'account_tip_three_light'
const animationThreeDataDark = 'account_tip_three_dark'

type LottieDataListItem = {
  isComplete: boolean
  swiperComponent: any
  name: string
  ref: LottieRef
}

function FutureAccountTip(_, ref) {
  const [visible, setVisible] = useState<boolean>(false)

  const common = useCommonStore()

  const judgeTheme = common.theme === ThemeEnum.dark

  const [lottieDataList, setLottieDataList] = useState<LottieDataListItem[]>([])

  const [showLottieDataIndex, setShowLottieDataIndex] = useState<number>(0)

  const lottieOneRef = useRef<LottieRef>(null)

  const lottieTowRef = useRef<LottieRef>(null)

  const lottieThreeRef = useRef<LottieRef>(null)

  const lottieOneData = judgeTheme ? animationOneDataDark : animationOneData

  const lottieTowData = judgeTheme ? animationTwoDataDark : animationTwoData

  const lottieThreeData = judgeTheme ? animationThreeDataDark : animationThreeData

  useEffect(() => {
    setLottieDataList([
      {
        isComplete: false,
        swiperComponent: lottieOneData,
        name: t`features_future_future_account_tip_index_i7cdt9n_55`,
        ref: lottieOneRef as LottieRef,
      },
      {
        isComplete: false,
        swiperComponent: lottieTowData,
        name: t`features_future_future_account_tip_index_0nmm1g_rwy`,
        ref: lottieTowRef as LottieRef,
      },
      {
        isComplete: false,
        swiperComponent: lottieThreeData,
        name: t`features_future_future_account_tip_index_t3uufpvxhh`,
        ref: lottieThreeRef as LottieRef,
      },
    ])
  }, [judgeTheme])

  useImperativeHandle(ref, () => ({
    setOpenAccountTipModal() {
      return setVisible(true)
    },
    setCloseAccountTipModal() {
      return setVisible(false)
    },
  }))

  return (
    <Modal
      className={styles['future-account-tip']}
      title={t`features_future_future_account_tip_index_yhehjgu64t`}
      onCancel={() => setVisible(false)}
      visible={visible}
      footer={null}
    >
      <div className="account-tip-container">
        {lottieDataList.map((item, index) => {
          return (
            <div key={item.name}>
              {showLottieDataIndex === index && (
                <>
                  <DynamicLottie
                    animationData={item.swiperComponent}
                    loop
                    lottieRef={item.ref}
                    onLoopComplete={() => {
                      item.ref.current?.stop()
                    }}
                    style={{ width: '100%', height: '180px' }}
                  />
                  <div className="text-text_color_01 mt-2 text-sm">{item.name}</div>
                </>
              )}
            </div>
          )
        })}
        <div
          onClick={() => setVisible(false)}
          className="w-full h-10 bg-brand_color flex justify-center items-center text-button_text_02 rounded text-sm mt-6"
        >{t`features_trade_spot_index_2510`}</div>
        {showLottieDataIndex > 0 && (
          <LazyImage
            onClick={() => setShowLottieDataIndex(showLottieDataIndex - 1)}
            src={`${oss_svg_image_domain_address}future-account-tip-left-arrow.png`}
            className="future-account-arrow-left"
          />
        )}
        {showLottieDataIndex < lottieDataList.length - 1 && (
          <LazyImage
            onClick={() => setShowLottieDataIndex(showLottieDataIndex + 1)}
            src={`${oss_svg_image_domain_address}future-account-tip-right-arrow.png`}
            className="future-account-arrow-right"
          />
        )}
      </div>
    </Modal>
  )
}

export default forwardRef(FutureAccountTip)
