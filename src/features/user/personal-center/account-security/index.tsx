import { useMount } from 'react-use'
import { useRequest } from 'ahooks'
import { Message } from '@nbit/arco'
import { t } from '@lingui/macro'
import { link } from '@/helper/link'
import {
  postMemberSafeEmailStatus,
  postMemberSafePhoneStatus,
  postMemberSafeGoogleStatus,
  deleteMemberSafeMobile,
} from '@/apis/user'
import {
  AccountSecurityOperationTypeEnum,
  UserEnabledStateTypeEnum,
  UserSendValidateCodeBusinessTypeEnum,
  UserValidateMethodEnum,
} from '@/constants/user'
import classNames from 'classnames'
import Icon from '@/components/icon'
import { ReactNode, useRef, useState } from 'react'
import { usePersonalCenterStore } from '@/store/user/personal-center'
import { UserInformationDesensitization } from '@/features/user/utils/common'
import FullScreenLoading from '@/features/user/components/full-screen-loading'
import UserPopUp from '@/features/user/components/popup'
import UserPopupTipsContent from '@/features/user/components/popup/content/tips'
import UserAccountSecurityGoogleKey from '@/features/user/personal-center/account-security/google'
import UserAntiPhishingCode from '@/features/user/personal-center/account-security/anti-phishing-code'
import UniversalSecurityVerification from '@/features/user/universal-security-verification'
import styles from './index.module.css'

interface SafetyVerificationItemProps {
  /** 图标 */
  icon?: ReactNode
  /** 名称 */
  name?: string
  describe?: string
  /** 文本 */
  text?: string
  /** 是否启用 */
  enable?: boolean
  /** 是否绑定 */
  isBind: boolean
  /** 未绑定文字 */
  unBindText?: string
  /** 是否启用回调函数 */
  onEnable?(enable: boolean): void
  /** 是否显示 switch 按钮 */
  isSwitch?: boolean
  isNumberIcon?: boolean
  /** 按钮插槽 */
  buttonSlot?: ReactNode
}

const emailUrl = '/personal-center/account-security/email?type='
const phonelUrl = '/personal-center/account-security/phone?type='
const passwordlUrl = '/personal-center/account-security/modify-password'
// const tradePasswordUrl = '/personal-center/account-security/transaction-password?type='

function SafetyVerificationItem({
  icon,
  name,
  text,
  describe,
  enable,
  isBind,
  isNumberIcon = true,
  unBindText,
  onEnable,
  isSwitch,
  buttonSlot,
}: SafetyVerificationItemProps) {
  return (
    <div className="safety-verification-item">
      <div className="item">
        <div className="item-name">
          {icon}
          <div className="item-name-content">
            <label>{name}</label>
            <span>{describe}</span>
          </div>
        </div>
        <div className="item-text">
          {isBind ? (
            <>
              {isNumberIcon &&
                (enable ? (
                  <Icon name="login_satisfied" className="item-text-icon" />
                ) : (
                  <Icon hasTheme name="icon_account_fail" className="item-text-icon" />
                ))}
              <label>{text}</label>
            </>
          ) : (
            <>
              <Icon name="icon_account_fail_white" className="item-text-icon" />
              <span className="ml-2">{unBindText}</span>
            </>
          )}
        </div>
        <div className="item-settings">
          {buttonSlot}
          <div className="divider" />
          {isSwitch && (
            <div className="item-button-text" onClick={() => onEnable && onEnable(!enable)}>
              {enable
                ? t`features_user_personal_center_account_security_index_iwlfgodcnr`
                : t`features_user_personal_center_account_security_index_0u_nnzady4`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function UserPersonalCenterAccountSecurity() {
  const [visibleTips, setVisibleTips] = useState<boolean>(false)
  const [visibleManageAccount, setVisibleManageAccount] = useState<boolean>(false)
  const [visibleGoogleKey, setVisibleGoogleKey] = useState<boolean>(false)
  const [visibleAntiPhishing, setVisibleAntiPhishing] = useState<boolean>(false)
  const [securityVerification, setSecurityVerification] = useState<boolean>(false)
  // const [deleteTipsPopup, setDeleteTipsPopup] = useState<boolean>(false)
  const [operationType, setOperationType] = useState<string>(AccountSecurityOperationTypeEnum.bind)
  // const [validateList, setValidateList] = useState<Array<certificationStatusType>>([])
  const businessType = useRef<number>()
  const verifyMethod = useRef<string>(UserValidateMethodEnum.email)

  const { getBaseInfo, baseInfoResult, turnOnVerification } = usePersonalCenterStore()

  const { run, loading } = useRequest(getBaseInfo, { manual: true })

  useMount(run)

  /** 处理关闭验证提示 */
  const handleCloseVerficationTips = (type: number) => {
    // Modal.confirm({
    //   title: t`trade.c2c.max.reminder`,
    //   content: t`features_user_personal_center_account_security_index_2426`,
    //   okButtonProps: {
    //     status: 'default',
    //   },
    //   onOk: () => {
    //     businessType.current = type
    //     setSecurityVerification(true)
    //   },
    // })

    businessType.current = type
    setSecurityVerification(true)
  }

  /** 处理未绑定开启操作 */
  const handleUnBind = (method: number, text: string) => {
    if (method === UserEnabledStateTypeEnum.unEnable) {
      Message.info(text)
      return false
    }

    return true
  }

  const handleSecurityItemStatus = (enable: boolean, url?: string) => {
    if (turnOnVerification && !enable) {
      Message.warning(t`features_user_personal_center_account_security_index_2446`)
      return false
    }
    url && link(url)
    return true
  }

  const handleSafeEmailStatus = async (status: number) => {
    const res = await postMemberSafeEmailStatus({ status })
    if (res.isOk && res.data?.isSuccess) {
      Message.success(t`user.field.reuse_34`)
      getBaseInfo()
    }
  }

  const handleSafePhoneStatus = async (status: number) => {
    const res = await postMemberSafePhoneStatus({ status })
    if (res.isOk && res.data?.isSuccess) {
      Message.success(t`user.field.reuse_34`)
      getBaseInfo()
    }
  }

  const handleSafeGoogleStatus = async (status: number) => {
    const res = await postMemberSafeGoogleStatus({ status })
    if (res.isOk && res.data?.isSuccess) {
      Message.success(t`user.field.reuse_34`)
      getBaseInfo()
    }
  }

  /** 邮箱修改 */
  const handleModifyEmail = () => {
    const isEnableSecurity = handleSecurityItemStatus(false)
    if (!isEnableSecurity) return

    businessType.current = UserSendValidateCodeBusinessTypeEnum.modifyEmail
    verifyMethod.current = UserValidateMethodEnum.email
    setSecurityVerification(true)
  }

  /** 邮箱关闭开启 */
  const handleEmailEnableChange = (enable: boolean) => {
    const isEnableSecurity = handleSecurityItemStatus(enable)
    if (!isEnableSecurity) return

    verifyMethod.current = UserValidateMethodEnum.email

    const isTrue = handleUnBind(
      baseInfoResult.isBindEmailVerify,
      t`features_user_personal_center_account_security_index_5101346`
    )
    if (!isTrue) return

    if (!enable) {
      handleCloseVerficationTips(UserSendValidateCodeBusinessTypeEnum.closeEmailVerification)
      return
    }

    handleSafeEmailStatus(UserEnabledStateTypeEnum.enable)
  }

  /** 手机修改 */
  const handleModifyPhone = () => {
    const isEnableSecurity = handleSecurityItemStatus(false)
    if (!isEnableSecurity) return

    businessType.current = UserSendValidateCodeBusinessTypeEnum.modifyPhone
    verifyMethod.current = UserValidateMethodEnum.phone
    setSecurityVerification(true)
  }

  /** 手机关闭开启 */
  const handlePhoneEnableChange = (enable: boolean) => {
    const isEnableSecurity = handleSecurityItemStatus(enable)
    if (!isEnableSecurity) return

    verifyMethod.current = UserValidateMethodEnum.phone

    const isTrue = handleUnBind(
      baseInfoResult.isBindPhoneVerify,
      t`features_user_personal_center_account_security_index_5101347`
    )
    if (!isTrue) return

    if (!enable) {
      handleCloseVerficationTips(UserSendValidateCodeBusinessTypeEnum.closePhoneVerification)
      return
    }

    handleSafePhoneStatus(UserEnabledStateTypeEnum.enable)
  }

  /** 谷歌验证器关闭开启 */
  const handleGoogleEnableChange = (enable: boolean) => {
    const isEnableSecurity = handleSecurityItemStatus(enable)
    if (!isEnableSecurity) return

    verifyMethod.current = UserValidateMethodEnum.validator

    const isTrue = handleUnBind(
      baseInfoResult.isOpenGoogleVerify,
      t`features_user_personal_center_account_security_index_5101348`
    )
    if (!isTrue) return

    if (!enable) {
      handleCloseVerficationTips(UserSendValidateCodeBusinessTypeEnum.closeGoogleVerification)
      return
    }

    handleSafeGoogleStatus(UserEnabledStateTypeEnum.enable)
  }

  /** 绑定谷歌验证 */
  const handleToSetGoogleKey = () => {
    setOperationType(AccountSecurityOperationTypeEnum.bind)
    setVisibleGoogleKey(true)
  }

  const handleGoogleKeyPopUpOnSuccess = () => {
    setVisibleGoogleKey(false)
    getBaseInfo()
  }

  /** 重置谷歌验证 */
  const handleToReset = () => {
    const isEnableSecurity = handleSecurityItemStatus(false)
    if (!isEnableSecurity) return

    setOperationType(AccountSecurityOperationTypeEnum.modify)
    businessType.current = UserSendValidateCodeBusinessTypeEnum.modifyGoogle
    verifyMethod.current = UserValidateMethodEnum.validator
    setVisibleTips(false)
    setSecurityVerification(true)
  }

  const handleDeletePhoneVerification = () => {
    const isEnableSecurity = handleSecurityItemStatus(false)
    if (!isEnableSecurity) return

    businessType.current = UserSendValidateCodeBusinessTypeEnum.deletePhoneVerification
    verifyMethod.current = AccountSecurityOperationTypeEnum.delete
    // setDeleteTipsPopup(false)
    setSecurityVerification(true)
  }

  /** 删除手机 */
  const handleDeletePhone = async () => {
    const res = await deleteMemberSafeMobile({})
    if (res.isOk && res.data.isSuccess) {
      Message.success(t`features_user_personal_center_account_security_index_2428`)
      getBaseInfo()
    }
  }

  /** 修改登录密码 */
  const handleModifyPassword = () => {
    const isEnableSecurity = handleSecurityItemStatus(false)
    if (!isEnableSecurity) return

    link(passwordlUrl)
  }

  const handleOnSuccess = (isTrue: boolean) => {
    if (isTrue) {
      const status = UserEnabledStateTypeEnum.unEnable
      switch (verifyMethod.current) {
        case UserValidateMethodEnum.email:
          if (businessType.current === UserSendValidateCodeBusinessTypeEnum.modifyEmail) {
            handleSecurityItemStatus(false, `${emailUrl}${AccountSecurityOperationTypeEnum.modify}`)
            return
          }
          handleSafeEmailStatus(status)
          break
        case UserValidateMethodEnum.phone:
          if (businessType.current === UserSendValidateCodeBusinessTypeEnum.modifyPhone) {
            handleSecurityItemStatus(false, `${phonelUrl}${AccountSecurityOperationTypeEnum.modify}`)
            return
          }
          handleSafePhoneStatus(status)
          break
        case UserValidateMethodEnum.validator:
          if (businessType.current === UserSendValidateCodeBusinessTypeEnum.modifyGoogle) {
            setOperationType(AccountSecurityOperationTypeEnum.modify)
            setVisibleGoogleKey(true)
            return
          }
          handleSafeGoogleStatus(status)
          break
        case AccountSecurityOperationTypeEnum.delete:
          handleDeletePhone()
          break
        default:
          break
      }
    }
  }

  return (
    <section className={`personal-center ${styles.scoped}`}>
      <div className="personal-center-wrap">
        <div className="header">
          <div className="header-wrap">
            <div className="user-account-security-info">
              <div className="title">
                <h1>{t`user.personal_center_09`}</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="safety-verification">
          <div className="safety-verification-wrap wrap">
            <div className="subtitle">
              <label>{t`user.safety_verification_01`}</label>
            </div>

            <div className="safety-verification-content">
              <SafetyVerificationItem
                icon={<Icon name="mailbox" hasTheme fontSize={24} />}
                name={t`user.field.reuse_13`}
                text={
                  baseInfoResult?.isBindEmailVerify === UserEnabledStateTypeEnum.enable
                    ? UserInformationDesensitization(baseInfoResult?.email)
                    : ''
                }
                unBindText={t`features_user_personal_center_account_security_index_2557`}
                describe={t`features_user_personal_center_account_security_index_czvhwmm2la`}
                enable={baseInfoResult?.isOpenEmailVerify === UserEnabledStateTypeEnum.enable}
                isBind={baseInfoResult?.isBindEmailVerify === UserEnabledStateTypeEnum.enable}
                onEnable={handleEmailEnableChange}
                isSwitch
                buttonSlot={
                  baseInfoResult?.isBindEmailVerify === UserEnabledStateTypeEnum.enable ? (
                    <div className="item-button-text" onClick={handleModifyEmail}>
                      {t`user.account_security_06`}
                    </div>
                  ) : (
                    <div
                      className="item-button-text"
                      onClick={() => link(`${emailUrl}${AccountSecurityOperationTypeEnum.bind}`)}
                    >
                      {t`user.security_verification_status_02`}
                    </div>
                  )
                }
              />

              <SafetyVerificationItem
                icon={<Icon name="phone" hasTheme fontSize={24} />}
                name={t`features_user_personal_center_account_security_index_2610`}
                text={
                  baseInfoResult?.isBindPhoneVerify === UserEnabledStateTypeEnum.enable
                    ? `+${baseInfoResult?.mobileCountryCd} ${UserInformationDesensitization(
                        baseInfoResult?.mobileNumber
                      )}`
                    : ''
                }
                unBindText={t`features_user_personal_center_account_security_index_2557`}
                describe={t`features_user_personal_center_account_security_index_v4ntl6g1cv`}
                enable={baseInfoResult?.isOpenPhoneVerify === UserEnabledStateTypeEnum.enable}
                isBind={baseInfoResult?.isBindPhoneVerify === UserEnabledStateTypeEnum.enable}
                onEnable={handlePhoneEnableChange}
                isSwitch
                buttonSlot={
                  // eslint-disable-next-line react/jsx-no-useless-fragment
                  <>
                    {baseInfoResult?.isBindPhoneVerify === UserEnabledStateTypeEnum.enable ? (
                      <>
                        <div className="item-button-text" onClick={handleModifyPhone}>
                          {t`user.account_security_06`}
                        </div>
                        <div className="item-button-text" onClick={handleDeletePhoneVerification}>
                          {t`assets.common.delete`}
                        </div>
                      </>
                    ) : (
                      <div
                        className="item-button-text"
                        onClick={() => link(`${phonelUrl}${AccountSecurityOperationTypeEnum.bind}`)}
                      >
                        {t`user.security_verification_status_02`}
                      </div>
                    )}
                  </>
                }
              />

              <SafetyVerificationItem
                icon={<Icon name="google" hasTheme fontSize={24} />}
                name={t`features_user_personal_center_account_security_index_2611`}
                enable={baseInfoResult?.isOpenGoogleVerify === UserEnabledStateTypeEnum.enable}
                isBind={baseInfoResult?.isOpenGoogleVerify === UserEnabledStateTypeEnum.enable}
                unBindText={t`features/orders/order-table-cell-2`}
                describe={t`features_user_personal_center_account_security_index_zymr5myxxi`}
                onEnable={handleGoogleEnableChange}
                isSwitch
                isNumberIcon={false}
                buttonSlot={
                  // eslint-disable-next-line react/jsx-no-useless-fragment
                  <>
                    {baseInfoResult?.isOpenGoogleVerify === UserEnabledStateTypeEnum.enable ? (
                      <div className="item-button-text" onClick={() => setVisibleTips(true)}>
                        {t`user.field.reuse_47`}
                      </div>
                    ) : (
                      <div className="item-button-text" onClick={handleToSetGoogleKey}>
                        {t`user.account_security.google_01`}
                      </div>
                    )}
                  </>
                }
              />
            </div>

            <div className="subtitle-advanced">
              <label>{t`features_user_personal_center_account_security_index_hpytsxfqlm`}</label>
            </div>

            <div className="modify-item" onClick={handleModifyPassword}>
              <div className="name">
                <Icon name="icon_change_password_white" className="name-icon" />
                <div className="ml-4">
                  <label>{t`user.account_security_05`}</label>
                  <span>{t`features_user_personal_center_account_security_index_ahotwzkvnk`}</span>
                </div>
              </div>
              <div className="settings">
                <label className="settings-text">{t`user.account_security_06`}</label>
                {/* <Icon name="next_arrow" hasTheme /> */}
              </div>
            </div>

            <div className="modify-item" onClick={() => setVisibleAntiPhishing(true)}>
              <div className="name">
                <Icon name="icon_security_code_white-1" className="name-icon" />
                <div className="ml-4">
                  <label>{t`user.pageContent.title_13`}</label>
                  <span>{t`features_user_personal_center_account_security_index_sct0plb80m`}</span>
                </div>
              </div>
              <div className="settings">
                <label className="settings-text">{t`user.field.reuse_08`}</label>
                {/* <Icon name="next_arrow" hasTheme /> */}
              </div>
            </div>

            <div className="modify-item" onClick={() => link('/personal-center/account-security/bind-account')}>
              <div className="name">
                <label>{t`features_user_personal_center_account_security_bind_account_index_0ad2fy45yb`}</label>
              </div>
              <div className="settings">
                <Icon name="next_arrow" hasTheme />
              </div>
            </div>

            <div className="modify-item" onClick={() => setVisibleManageAccount(true)}>
              <div className="name">
                <label>{t`features_user_personal_center_account_security_index_o1zaktug2x`}</label>
              </div>
              <div className="settings">
                <Icon name="next_arrow" hasTheme />
              </div>
            </div>
          </div>
        </div>
      </div>
      <UserPopUp
        className="user-popup user-popup-tips"
        visible={visibleTips}
        closeIcon={<Icon name="close" hasTheme />}
        okText={t`user.account_security.google_07`}
        cancelText={t`user.field.reuse_09`}
        onOk={handleToReset}
        onCancel={() => setVisibleTips(false)}
      >
        <UserPopupTipsContent
          slotContent={
            <>
              <p>{t`user.account_security.google_03`}</p>
              <p>
                {t`user.account_security.google_04`} <span>{t`user.account_security.google_05`}</span>{' '}
                {t`user.account_security.google_06`}
              </p>
            </>
          }
        />
      </UserPopUp>
      <UserPopUp
        className="user-popup user-form-style"
        title={
          <div style={{ textAlign: 'left' }}>
            {operationType === AccountSecurityOperationTypeEnum.bind ? t`user.field.reuse_42` : t`user.field.reuse_47`}
            {t`user.field.reuse_05`}
          </div>
        }
        visible={visibleGoogleKey}
        autoFocus={false}
        closeIcon={<Icon name="close" hasTheme />}
        onCancel={() => setVisibleGoogleKey(false)}
        footer={null}
      >
        <UserAccountSecurityGoogleKey mode={operationType} onSuccess={handleGoogleKeyPopUpOnSuccess} />
      </UserPopUp>
      <UserPopUp
        className="user-popup"
        title={<div style={{ textAlign: 'left' }}>{t`user.field.reuse_16`}</div>}
        visible={visibleAntiPhishing}
        autoFocus={false}
        closeIcon={<Icon name="close" hasTheme />}
        onCancel={() => setVisibleAntiPhishing(false)}
        footer={null}
      >
        <UserAntiPhishingCode onSuccess={() => setVisibleAntiPhishing(false)} />
      </UserPopUp>

      {/* 管理账号弹框 */}
      <UserPopUp
        footer={null}
        width={440}
        onOk={handleToReset}
        visible={visibleManageAccount}
        className={classNames(styles['manage-modal-wrap'], 'user-popup', 'user-popup-tips')}
        closeIcon={<Icon name="close" hasTheme />}
        onCancel={() => setVisibleManageAccount(false)}
      >
        <UserPopupTipsContent
          className={styles['account-security-popup']}
          headerIcon={
            <div className="popup-header">
              <label>{t`features_user_personal_center_account_security_index_03eqpifvbt`}</label>
              <Icon
                hasTheme
                name="close"
                className="popup-header-icon"
                onClick={() => setVisibleManageAccount(false)}
              />
            </div>
          }
          slotContent={
            <div
              className="account-security-popup-content"
              onClick={() => link('/personal-center/account-security/manage-account')}
            >
              <div className="popup-content-left">
                <p>{t`features_user_personal_center_account_security_index_mwn6kvugi7`}</p>
                <label>{t`features_user_personal_center_account_security_index_h2myjuuacu`}</label>
              </div>
              <Icon name="next_arrow" hasTheme />
            </div>
          }
        />
      </UserPopUp>

      <UniversalSecurityVerification
        isShow={securityVerification}
        businessType={businessType.current}
        onClose={setSecurityVerification}
        onSuccess={handleOnSuccess}
      />
      <FullScreenLoading isShow={loading} />
    </section>
  )
}

export default UserPersonalCenterAccountSecurity
