import { useState, useEffect } from 'react'
import { Button, Modal } from '@nbit/arco'
import { link } from '@/helper/link'
import Link from '@/components/link'
import { useLayoutStore } from '@/store/layout'
import ThemeSwitch from '@/components/theme-switch'
import { ColorPlateEnum } from '@/constants/base'
import UserPopUp from '@/features/user/components/popup'
import { getC2cFastTradePageRoutePath } from '@/helper/route'
import UserPersonalCenterAboutUs from '@/features/user/personal-center/about-us'
import UserPersonalCenterMenuNavigation from '@/features/user/personal-center/menu-navigation'
import UserAssetsMenuNavigation from '@/features/assets/common/menu-navigation'
import { useCommonStore } from '@/store/common'
import { t } from '@lingui/macro'
import TradeSetting from '@/features/trade/trade-setting'
import MessageCenter from '@/features/message-center'
import { useUserStore } from '@/store/user'
import Icon from '@/components/icon'
import DownloadIcon from '@/components/download-icon'
import { envIsServer } from '@/helper/env'
import { getMergeModeStatus } from '@/features/user/utils/common'
import { useGuidePageInfo } from '@/hooks/features/layout'
import { getGuidePageComponentInfoByKey } from '@/helper/layout'
import ShouldGuidePageComponentDisplay from '@/features/home/common/component-should-display'
import I18nSelect from './i18n-select'

interface IPersonalization {
  isTrade?: boolean
}
function Personalization(props: IPersonalization) {
  const [visibleAboutUs, setVisibleAboutUs] = useState<boolean>(false)
  const userStore = useUserStore()
  const isMergeMode = getMergeModeStatus()
  const { themeType } = useCommonStore()

  const { pageInfoTopBar = [] } = useGuidePageInfo()

  const styleSwitchIcon = getGuidePageComponentInfoByKey('styleSwitchIcon', pageInfoTopBar)
  const language = getGuidePageComponentInfoByKey('language', pageInfoTopBar)

  const config = {
    title: <div>{t`features/layout/components/personalization-0`}</div>,
    content: <I18nSelect />,
    footer: null,
    icon: null,
    closable: true,
  }

  const { getMerchantTrialQualification, setTrialAccountInfo, hasMerchantTrialQualification } = useUserStore()

  useEffect(() => {
    !userStore?.isLogin && getMerchantTrialQualification()
  }, [userStore?.isLogin])

  const openI18nSelect = () => {
    Modal.info!(config)
  }
  // 登录和非登录下在服务端和客户端的结果不同，即使加上 key 也无法让客户端接管时重新渲染，所以这里直接返回空
  if (envIsServer) {
    return <div className="personalization-wrap"></div>
  }
  return (
    <div className="personalization-wrap">
      {userStore?.isLogin ? (
        <>
          <UserAssetsMenuNavigation />
          <div className="login-btn-wrap text-wrap flex items-center">
            <UserPersonalCenterMenuNavigation isAboutShow={visibleAboutUs} handleAboutPopUpShow={setVisibleAboutUs} />
          </div>
          <span className="login-btn-wrap-line"></span>
          {!isMergeMode && (
            <div className="login-btn-wrap text-wrap flex items-center">
              <MessageCenter />
            </div>
          )}
        </>
      ) : !isMergeMode ? (
        <>
          <div className="login-btn-wrap text-wrap">
            <Link href="/login">{t`user.field.reuse_07`}</Link>
          </div>

          <div className="login-btn-wrap text-wrap">
            <Button
              className={'h-8'}
              type="primary"
              size="small"
              onClick={() => link('/register')}
            >{t`user.common.register`}</Button>
          </div>
          {hasMerchantTrialQualification && (
            <div className="login-btn-wrap text-wrap">
              <Button
                size="small"
                type="outline"
                className={'h-8'}
                onClick={() => setTrialAccountInfo()}
              >{t`features_user_register_index_wvdg2uy5cw`}</Button>
            </div>
          )}
        </>
      ) : null}
      {/* <div className="login-btn-wrap text-wrap">
        <Link href="/download">{t`Download`}</Link>
      </div> */}
      {!isMergeMode && (
        <div className="login-btn-wrap text-wrap">
          <DownloadIcon />
        </div>
      )}
      <ShouldGuidePageComponentDisplay {...styleSwitchIcon}>
        {themeType !== ColorPlateEnum.okx && (
          <div className="login-btn-wrap text-wrap">
            <ThemeSwitch />
          </div>
        )}
      </ShouldGuidePageComponentDisplay>
      <ShouldGuidePageComponentDisplay {...language}>
        <div className="login-btn-wrap text-wrap" onClick={openI18nSelect}>
          <Icon name="nav_language" fontSize={20} hasTheme hover />
        </div>
      </ShouldGuidePageComponentDisplay>
      {props.isTrade && (
        <span>
          <TradeSetting className="" />
        </span>
      )}
      <UserPopUp
        className="user-popup"
        title={<div style={{ textAlign: 'left' }}>{userStore.userTransitionDatas?.homeColumnName || ''}</div>}
        visible={visibleAboutUs}
        closeIcon={<Icon name="close" hasTheme />}
        onCancel={() => setVisibleAboutUs(false)}
        footer={null}
      >
        <UserPersonalCenterAboutUs />
      </UserPopUp>
    </div>
  )
}

export default Personalization
