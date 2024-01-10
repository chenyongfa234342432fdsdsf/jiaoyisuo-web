import { t } from '@lingui/macro'
import { link } from '@/helper/link'
import Icon from '@/components/icon'
import { useState, useRef } from 'react'
import { useUserStore } from '@/store/user'
import { initializeApp } from 'firebase/app'
import { Button, Message } from '@nbit/arco'
import { useLayoutStore } from '@/store/layout'
import LazyImage from '@/components/lazy-image'
import { fetchAndUpdateUserInfo } from '@/helper/auth'
import UserPopUp from '@/features/user/components/popup'
import { oss_svg_image_domain_address } from '@/constants/oss'
import { UserInformationDesensitization } from '@/features/user/utils/common'
import UserPopupTipsContent from '@/features/user/components/popup/content/tips'
import { UserSendValidateCodeBusinessTypeEnum, BindTypeEnum } from '@/constants/user'
import UniversalSecurityVerification from '@/features/user/universal-security-verification'
import { getAuth, signInWithPopup, GoogleAuthProvider, OAuthProvider } from 'firebase/auth'
import { postThirdBindBindRequest, postThirdBindBindRemoveRequest, getThirdPartyConfig } from '@/apis/user'
import { useMount } from 'ahooks'
import styles from './index.module.css'

let googleProvider
let appleProvider
let auth
function BindAccount() {
  const [workOrderPopUp, setWorkOrderPopUp] = useState<boolean>(false)
  const [isShowVerification, setIsShowVerification] = useState<boolean>(false)
  const [appleLoad, setAppleLoad] = useState<boolean>(false)
  const [googleLoad, setGoogleLoad] = useState<boolean>(false)

  const isBind = useRef<boolean>(false)
  const currentBindType = useRef<BindTypeEnum>(BindTypeEnum.google)

  const { headerData } = useLayoutStore()
  const { userInfo, clearUserCacheData } = useUserStore()

  const handleClearData = async (url: string) => {
    link(url)
    await clearUserCacheData()
  }

  const handleBindChange = async (token: string) => {
    const params = {
      token,
      type: currentBindType.current,
    }
    const bindType = currentBindType.current === BindTypeEnum.google
    bindType ? setGoogleLoad(true) : setAppleLoad(true)
    if (isBind.current) {
      const { data, isOk } = await postThirdBindBindRequest(params)
      if (isOk && data) {
        Message.success(t`features_user_personal_center_account_security_email_index_2430`)
        fetchAndUpdateUserInfo()
        link('/')
      } else {
        link('/personal-center/account-security')
      }
    } else {
      const { data, isOk } = await postThirdBindBindRemoveRequest(params)
      if (isOk && data) {
        Message.success(t`features_user_personal_center_account_security_bind_account_index_hemtwbp7in`)
        fetchAndUpdateUserInfo()
        handleClearData('/')
      } else {
        link('/personal-center/account-security')
      }
    }
    setAppleLoad(false)
    setGoogleLoad(false)
  }

  /** 绑定处理 */
  const onBindChange = (type: BindTypeEnum) => {
    isBind.current = true
    currentBindType.current = type
    setIsShowVerification(true)
  }

  /** 解绑处理 */
  const onRemoveBindChange = (type: BindTypeEnum) => {
    isBind.current = false
    setWorkOrderPopUp(true)
    currentBindType.current = type
  }

  const getConfigInfo = async () => {
    const res = await getThirdPartyConfig({})
    if (res.isOk) {
      initializeApp(res.data!)
      googleProvider = new GoogleAuthProvider()
      appleProvider = new OAuthProvider('apple.com')

      auth = getAuth()
    }
  }

  const handleGoogleLogin = async () => {
    /** google 登录弹窗 */
    signInWithPopup(auth, googleProvider)
      .then(result => {
        const user = result.user as any
        const token = user.accessToken
        token && handleBindChange(token)
      })
      .catch(error => {
        const credential = GoogleAuthProvider.credentialFromError(error)
        console.error(credential)
      })
  }

  const handleAppleLogin = async () => {
    appleProvider.addScope('email')
    appleProvider.addScope('name')
    /** apple 登录弹窗 */
    signInWithPopup(auth, appleProvider)
      .then(result => {
        const user = result.user as any
        const token = user.accessToken
        token && handleBindChange(token)
      })
      .catch(error => {
        const credential = OAuthProvider.credentialFromError(error)
        console.error(credential)
      })
  }

  const onThirdPartyChange = () => {
    const bindType = currentBindType.current === BindTypeEnum.google
    bindType ? handleGoogleLogin() : handleAppleLogin()
  }

  useMount(() => {
    getConfigInfo()
  })
  return (
    <section className={`personal-center ${styles.scoped}`}>
      <div className="bind-account-wrap">
        <div className="header">
          <div className="header-wrap">
            <div className="user-account-security-info">
              <div className="title">
                <h1>{t`user.personal_center_09`}</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bind-account-body">
        <div className="main">
          <div className={`back personal-center-back`}>
            <Icon name="back" hasTheme className="mt-px" />
            <label onClick={() => window.history.back()}>{t`user.field.reuse_44`}</label>
            <div className="back-divider" />
            <label className="back-text">{t`features_user_personal_center_account_security_bind_account_index_0ad2fy45yb`}</label>
          </div>
          <div className="bind-account-content">
            <span className="bind-account-content-header">
              {t({
                id: 'features_user_personal_center_account_security_bind_account_index_yasmntiz0j',
                values: { 0: headerData?.businessName },
              })}
            </span>
            <div className="bind-account-content-card">
              <div className="item">
                <div className="item-left">
                  <Icon className="item-left-icon" name="login_icon_google" />
                  <div className="item-left-main">
                    <label className="item-left-text">{t`features_user_personal_center_account_security_bind_account_index_gpdmilrm6s`}</label>
                    <span className="item-left-value">
                      {userInfo?.thirdGoogleBind
                        ? t`features_user_personal_center_account_security_bind_account_index_pvj1uxjgsf`
                        : t`features_user_personal_center_account_security_index_2557`}
                    </span>
                  </div>
                </div>
                {userInfo?.thirdGoogleBind && userInfo?.googleAccount && (
                  <div className="item-middle">
                    <Icon name="login_satisfied" />
                    <span>{UserInformationDesensitization(userInfo?.googleAccount)}</span>
                  </div>
                )}
                {userInfo?.thirdGoogleBind ? (
                  <Button
                    loading={googleLoad}
                    className="item-right"
                    onClick={() => onRemoveBindChange(BindTypeEnum.google)}
                  >
                    {t`features_user_personal_center_account_security_bind_account_index_rwr_me6sdx`}
                  </Button>
                ) : (
                  <Button
                    type={'primary'}
                    className="item-right"
                    onClick={() => onBindChange(BindTypeEnum.google)}
                    loading={googleLoad}
                  >
                    {t`features_user_personal_center_account_security_bind_account_index_c6feuzsz5e`}
                  </Button>
                )}
              </div>
              <div className="item">
                <div className="item-left">
                  <Icon hasTheme className="item-left-icon" name="login_icon_apple" />
                  <div className="item-left-main">
                    <label className="item-left-text">{t`features_user_personal_center_account_security_bind_account_index_henqia0dmn`}</label>
                    <span className="item-left-value">
                      {userInfo?.thirdAppleBind
                        ? t`features_user_personal_center_account_security_bind_account_index_pvj1uxjgsf`
                        : t`features_user_personal_center_account_security_index_2557`}
                    </span>
                  </div>
                </div>
                {userInfo?.thirdAppleBind && userInfo?.appleAccount && (
                  <div className="item-middle">
                    <Icon name="login_satisfied" />
                    <span>{UserInformationDesensitization(userInfo?.appleAccount || userInfo?.mobileNumber)}</span>
                  </div>
                )}
                {userInfo?.thirdAppleBind ? (
                  <Button
                    loading={appleLoad}
                    className="item-right"
                    onClick={() => onRemoveBindChange(BindTypeEnum.apple)}
                  >
                    {t`features_user_personal_center_account_security_bind_account_index_rwr_me6sdx`}
                  </Button>
                ) : (
                  <Button
                    type={'primary'}
                    className="item-right"
                    onClick={() => onBindChange(BindTypeEnum.apple)}
                    loading={appleLoad}
                  >
                    {t`features_user_personal_center_account_security_bind_account_index_c6feuzsz5e`}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <UserPopUp
        width={360}
        okText={t`features_trade_spot_index_2510`}
        cancelText={t`user.field.reuse_48`}
        visible={workOrderPopUp}
        onOk={() => {
          setWorkOrderPopUp(false)
          setIsShowVerification(true)
        }}
        className="user-popup user-popup-tips"
        onCancel={() => setWorkOrderPopUp(false)}
        closeIcon={<Icon name="close" hasTheme />}
      >
        <UserPopupTipsContent
          className={styles['bind-account-popup']}
          headerIcon={<LazyImage src={`${oss_svg_image_domain_address}tips.png`} />}
          slotContent={
            <div className="bind-account-popup-content">
              <span className="content-text">{t`features_user_personal_center_account_security_bind_account_index_fixdbknqou`}</span>
            </div>
          }
        />
      </UserPopUp>

      <UniversalSecurityVerification
        isShow={isShowVerification}
        onSuccess={(isSuccess: boolean) => {
          isSuccess && onThirdPartyChange()
        }}
        onClose={setIsShowVerification}
        businessType={UserSendValidateCodeBusinessTypeEnum.createApi}
      />
    </section>
  )
}

export default BindAccount
