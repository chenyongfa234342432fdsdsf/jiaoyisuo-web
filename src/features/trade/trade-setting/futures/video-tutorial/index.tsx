import { useEffect, useRef, useState } from 'react'
import { useCountDown, useEventListener } from 'ahooks'
import { Button } from '@nbit/arco'
import UserPopUp from '@/features/user/components/popup'
import { UserContractVersionEnum } from '@/constants/user'
import { useContractPreferencesStore } from '@/store/user/contract-preferences'
import { useLayoutStore } from '@/store/layout'
import { oss_svg_image_domain_address } from '@/constants/oss'
import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import styles from './index.module.css'

interface FuturesVideoTutorialProps {
  /** 版本 */
  version?: number
  /** 是否显示 */
  visible: boolean
  /** 是否有关闭按钮 */
  hasCloseIcon?: boolean
  /** 设置是否显示 */
  setVisible: (visible: boolean) => void
  /** 开通合约模式 */
  isOpenContract?: boolean
  /** 是否设置成功 */
  onSuccess?(isTrue: boolean): void
  /** 仅仅观看视频 */
  isWatch?: boolean
  /** 仅观看视频选择的版本 */
  isWatchSelectVersion?: number
}

function FuturesVideoTutorial({
  version = UserContractVersionEnum.base,
  visible,
  hasCloseIcon,
  setVisible,
  isOpenContract,
  onSuccess,
  isWatch = false,
  isWatchSelectVersion,
}: FuturesVideoTutorialProps) {
  const [targetDate, setTargetDate] = useState<number>(0)
  const [playState, setPlayState] = useState<boolean>(false)
  const [formattedRes] = useCountDown({ targetDate })

  const customVideo = useRef<HTMLVideoElement>(null)

  const { columnsDataByCd } = useLayoutStore()
  const contractPreferenceStore = useContractPreferencesStore()
  const { hasOpenSpecializeVersion } = contractPreferenceStore.contractPreference

  const handleCountDown = () => setTargetDate(Date.now() + 10000)

  const selectVersion = isWatch ? isWatchSelectVersion : version

  useEventListener(
    'play',
    () => {
      setPlayState(false)
    },
    { target: customVideo }
  )

  useEventListener(
    'pause',
    () => {
      setPlayState(true)
    },
    { target: customVideo }
  )

  useEventListener(
    'loadedmetadata',
    () => {
      customVideo.current?.play()
    },
    { target: customVideo }
  )

  useEffect(() => {
    visible && handleCountDown()
  }, [visible])

  const handleOnSuccess = () => {
    !isWatch && onSuccess && onSuccess(true)
    customVideo.current?.pause()
    setVisible(false)
  }

  const handleClose = () => {
    customVideo.current?.pause()
    setVisible(false)
  }

  return (
    <UserPopUp
      className="user-popup"
      style={{ width: 736 }}
      visible={visible}
      maskClosable={false}
      autoFocus={false}
      closable={hasCloseIcon}
      closeIcon={<Icon name="close" hasTheme />}
      onCancel={() => setVisible(false)}
      unmountOnExit
      footer={null}
    >
      <div className={`video-tutorial ${styles.scoped}`}>
        <div className="container">
          <div className="video">
            <video
              controls
              autoPlay
              className="w-full"
              poster={
                selectVersion === UserContractVersionEnum.base
                  ? `${oss_svg_image_domain_address}preferences/video_basic_cover.jpeg`
                  : `${oss_svg_image_domain_address}preferences/video_pro_cover.jpeg`
              }
              ref={customVideo}
            >
              <source
                src={`${
                  selectVersion === UserContractVersionEnum.base
                    ? columnsDataByCd?.contract_subaccount_video?.webUrl
                    : columnsDataByCd?.contract_subaccount_video_pro?.webUrl
                }`}
                type="video/mp4"
              ></source>
            </video>

            {playState && (
              <div className="custom-video-button">
                <Icon name="play_icon" />
              </div>
            )}
          </div>

          <div className="btn">
            <Button type="default" onClick={handleClose}>{t`user.field.reuse_48`}</Button>
            {(isOpenContract || hasOpenSpecializeVersion === UserContractVersionEnum.base) && !isWatch && (
              <Button type="primary" disabled={formattedRes > 0} onClick={handleOnSuccess}>
                {formattedRes
                  ? `${Math.round(formattedRes / 1000)} s`
                  : t`features_trade_trade_setting_futures_video_tutorial_index_xuborfvu4t`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </UserPopUp>
  )
}

export default FuturesVideoTutorial
