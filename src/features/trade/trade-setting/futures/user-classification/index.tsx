import { useState } from 'react'
import { Button } from '@nbit/arco'
import UserPopUp from '@/features/user/components/popup'
import { t } from '@lingui/macro'
import { useUserStore } from '@/store/user'
import { useFuturesStore } from '@/store/futures'
import { UserClassificationEnum, UserHandleIntroEnum } from '@/constants/user'
import { oss_svg_image_domain_address } from '@/constants/oss'
import LazyImage, { Type } from '@/components/lazy-image'
import { link } from '@/helper/link'
import Icon from '@/components/icon'
import { usePageContext } from '@/hooks/use-page-context'
import { getMergeModeStatus } from '@/features/user/utils/common'
import styles from './index.module.css'

interface VersionPopUpProps {
  /** 关闭图标 */
  hasCloseIcon?: boolean
  /** 是否是合约交易页 非交易页需要跳转至交易页 */
  isContractPage?: boolean
}

interface VersionOptionsType {
  key: number
  /** 标题 */
  title: string
  /** 内容 */
  content: Array<string>
  /** 用户分类值 */
  value: number
  /** 图片 */
  image: string
}

function FuturesUserClassification({ hasCloseIcon, isContractPage = false }: VersionPopUpProps) {
  const [isNovice, setIsNovice] = useState<number>(UserClassificationEnum.default)

  const useStore = useUserStore()
  const { urlParsed } = usePageContext()
  const { setReadyCallIntroId } = useFuturesStore()
  const { showUserClassificationPopUp, setUserClassificationPopUpStatus } = useStore

  const isMergeMode = getMergeModeStatus()

  const versionOptions: Array<VersionOptionsType> = [
    {
      key: 1,
      title: t`features_trade_trade_setting_futures_user_classification_index_vfzyrkmyx0`,
      content: [
        t`features_trade_trade_setting_futures_user_classification_index_jraqhrd_fi`,
        t`features_trade_trade_setting_futures_user_classification_index_otkqxnynhr`,
      ],
      value: UserClassificationEnum.novice,
      image: isMergeMode ? 'merge_noob' : 'image_contract_novice',
    },
    {
      key: 2,
      title: t`features_trade_trade_setting_futures_user_classification_index_4erqcviztr`,
      content: [
        t`features_trade_trade_setting_futures_user_classification_index_qs4rqlyrpc`,
        t`features_trade_trade_setting_futures_user_classification_index_wrdt7o80ts`,
      ],
      value: UserClassificationEnum.traders,
      image: isMergeMode ? 'merge_traders' : 'image_contract_professional',
    },
  ]

  const handleSubmit = async () => {
    if (isNovice === UserClassificationEnum.novice) {
      const routeName = urlParsed?.pathname
      const isFutures = routeName?.includes(UserHandleIntroEnum.futures)
      isFutures && setReadyCallIntroId(true)
    }
    await setUserClassificationPopUpStatus(false)
    !isContractPage && link('/futures/BTCUSD')
  }

  return (
    <UserPopUp
      className="user-popup"
      title={
        <div
          style={{ textAlign: 'left' }}
        >{t`features_trade_trade_setting_futures_user_classification_index_bik0x0iyyu`}</div>
      }
      visible={showUserClassificationPopUp}
      maskClosable={false}
      autoFocus={false}
      closable={hasCloseIcon}
      closeIcon={<Icon name="close" hasTheme />}
      onCancel={() => setUserClassificationPopUpStatus(false)}
      footer={null}
    >
      <div className={`futures-version ${styles.scoped}`}>
        <div className="container">
          {versionOptions.map(v => (
            <div className={`options ${isNovice === v.value ? 'checked' : ''}`} key={v.key}>
              <div className="options-wrap" onClick={() => setIsNovice(v.value)}>
                <div className="options-content">
                  <div className="title">
                    <label>{v.title}</label>
                  </div>

                  <div className="image">
                    <div className="image-wrap">
                      <LazyImage
                        src={`${oss_svg_image_domain_address}${isMergeMode ? `preferences/${v.image}` : v.image}`}
                        whetherManyBusiness={!isMergeMode}
                        imageType={Type.png}
                        hasTheme={!isMergeMode}
                      />
                    </div>
                  </div>

                  <div className="content">
                    {v.content.map((text, row) => (
                      <div className="text" key={`${v.key}${row}`}>
                        <Icon name="prompt-symbol" />
                        <label>{text}</label>
                      </div>
                    ))}
                  </div>

                  {isNovice === v.value && (
                    <div className="checked-icon">
                      <Icon name="contract_select" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="btn">
            <Button type="primary" disabled={isNovice === UserClassificationEnum.default} onClick={handleSubmit}>
              {isNovice === UserClassificationEnum.novice
                ? t`features_trade_trade_setting_futures_user_classification_index_ligxzequez`
                : t`features_trade_trade_setting_futures_user_classification_index_4ujx9zfxpz`}
            </Button>
          </div>
        </div>
      </div>
    </UserPopUp>
  )
}

export default FuturesUserClassification
