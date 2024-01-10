import { t } from '@lingui/macro'
import { useState } from 'react'
import { link } from '@/helper/link'
import Icon from '@/components/icon'
import { useUserStore } from '@/store/user'
import { useLayoutStore } from '@/store/layout'
import LazyImage from '@/components/lazy-image'
import UserPopUp from '@/features/user/components/popup'
import { oss_svg_image_domain_address } from '@/constants/oss'
import { usePersonalCenterStore } from '@/store/user/personal-center'
import { Radio, Input, Button, Checkbox, Message } from '@nbit/arco'
import { postLogoffRequest, getAgentDelAccLogoutRequest } from '@/apis/user'
import { ManageAccountEnum, UserAgreementEnum, UserSendValidateCodeBusinessTypeEnum } from '@/constants/user'
import UserPopupTipsContent from '@/features/user/components/popup/content/tips'
import UniversalSecurityVerification from '@/features/user/universal-security-verification'
import classNames from 'classnames'
import styles from './index.module.css'

const RadioGroup = Radio.Group
const TextArea = Input.TextArea

type ManageAccountReasonProps = {
  email?: string
  mobileCountry?: string
  mobileNumber?: string
  reason: string
  verifyCode: string
}

function ManageAccount() {
  const [loading, setLoading] = useState<boolean>(false)
  const [otherText, setOtherText] = useState<string>('')
  const [accountCheck, setAccountCheck] = useState<boolean>(false)
  const [checkVisible, setCheckVisible] = useState<boolean>(false)
  const [radioId, setRadioId] = useState<string>(ManageAccountEnum.noAccount)
  const [visibleManageAccount, setVisibleManageAccount] = useState<boolean>(false)
  const [isShowVerification, setIsShowVerification] = useState<boolean>(false)

  const footerStore = useLayoutStore()
  const { clearUserCacheData } = useUserStore()
  const { baseInfoResult } = usePersonalCenterStore()
  const { headerData } = useLayoutStore()

  const manageAccountRadio = [
    {
      name: t`features_user_personal_center_account_security_manage_account_index_eutm7o2bwc`,
      value: ManageAccountEnum.noAccount,
    },
    {
      name: t`features_user_personal_center_account_security_manage_account_index_5qbgae8v0n`,
      value: ManageAccountEnum.allAccount,
    },
    { name: t`constants_assets_index_2560`, value: ManageAccountEnum.other },
  ]

  const onRadioChange = v => {
    setRadioId(v)
  }

  const onThirdPartyChange = async option => {
    const isOther = radioId === ManageAccountEnum.other
    const radioData = manageAccountRadio?.find(item => item.value === radioId)
    let params = {
      reason: isOther ? otherText : radioData?.name,
      verifyCode: option?.mobileVerifyCode || option?.emailVerifyCode,
    } as ManageAccountReasonProps
    if (option?.mobileVerifyCode) {
      params = {
        ...params,
        mobileCountry: baseInfoResult?.mobileCountryCd,
        mobileNumber: baseInfoResult?.mobileNumber,
      }
    } else {
      params = {
        ...params,
        email: baseInfoResult?.email,
      }
    }
    setLoading(true)
    const { data, isOk } = await postLogoffRequest(params)
    if (isOk && data) {
      link('/')
      Message.success(t`features_user_personal_center_account_security_manage_account_index_u9le_3gvaa`)
      await clearUserCacheData()
      await getAgentDelAccLogoutRequest({})
    }
    setLoading(false)
  }

  const handleToReset = () => {
    if (!accountCheck) {
      return Message.info(t`features_user_register_flow_index_2450`)
    }
    setVisibleManageAccount(false)
    setIsShowVerification(true)
  }

  const onDelSureChange = () => {
    if (!checkVisible) {
      return Message.info(t`features_user_register_flow_index_2450`)
    }
    setVisibleManageAccount(true)
  }

  const checkoutBoxDom = () => {
    return (
      <>
        <span className="ml-2">{t`features/user/initial-person/submit-applications/index-11`}</span>
        <label onClick={() => link(footerStore.columnsDataByCd?.[UserAgreementEnum.termsService]?.webUrl)}>
          {t`features_user_personal_center_account_security_manage_account_index_mzunuk8pvr`}
        </label>
        <span>{t`features/trade/future/index-5`}</span>
        <label
          onClick={() => link(footerStore.columnsDataByCd?.[UserAgreementEnum.termsService]?.webUrl)}
        >{t`features_user_personal_center_account_security_manage_account_index_ulmxsiq15y`}</label>
      </>
    )
  }

  return (
    <section className={`personal-center ${styles.scoped}`}>
      <div className="manage-account-wrap">
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
      <div className="manage-account-body">
        <div className="main">
          <div className={`back personal-center-back`}>
            <Icon name="back" hasTheme className="mt-px" />
            <label onClick={() => window.history.back()}>{t`user.field.reuse_44`}</label>
            <div className="back-divider" />
            <label className="back-text">{t`features_user_personal_center_account_security_manage_account_index_rio8jd10ku`}</label>
          </div>
          <div className="manage-account-content">
            <label>
              {t({
                id: 'features_user_personal_center_account_security_manage_account_index_imgxa4yaj1',
                values: { 0: headerData?.businessName },
              })}
            </label>
            <div className="content-radio">
              <RadioGroup direction="vertical" value={radioId} onChange={onRadioChange}>
                {manageAccountRadio?.map(item => {
                  return (
                    <Radio key={item.value} value={item.value}>
                      {({ checked }) => {
                        return checked ? (
                          <>
                            <Icon name="agreement_select" className="content-radio-icon" />
                            <span className="ml-4 pb-1 text-sm font-normal">{item.name}</span>
                          </>
                        ) : (
                          <>
                            <Icon name="icon_options_unselected" className="content-radio-icon" hasTheme />
                            <span className="ml-4 pb-1 text-sm font-normal">{item.name}</span>
                          </>
                        )
                      }}
                    </Radio>
                  )
                })}
              </RadioGroup>
              {radioId === ManageAccountEnum.other && (
                <div className="content-text-area">
                  <TextArea
                    showWordLimit
                    maxLength={100}
                    value={otherText}
                    onChange={setOtherText}
                    placeholder={t`features_user_personal_center_account_security_manage_account_index_sq9dqheswt`}
                  />
                </div>
              )}
            </div>
            <div className="manage-account-footer">
              <Checkbox className="footer-checkobx" checked={checkVisible} onChange={setCheckVisible}>
                {({ checked }) => {
                  return checked ? (
                    <>
                      <Icon name="icon_agree_yes" className="text-sm mb-px" />
                      {checkoutBoxDom()}
                    </>
                  ) : (
                    <>
                      <Icon name="icon_agree_no" className="text-sm mb-px" hasTheme />
                      {checkoutBoxDom()}
                    </>
                  )
                }}
              </Checkbox>
              <Button type="primary" loading={loading} className="footer-button" onClick={() => onDelSureChange()}>
                {t`user.field.reuse_10`}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <UserPopUp
        width={360}
        okText={t`user.field.reuse_17`}
        cancelText={t`user.field.reuse_09`}
        onOk={handleToReset}
        visible={visibleManageAccount}
        closeIcon={<Icon name="close" hasTheme />}
        onCancel={() => setVisibleManageAccount(false)}
        className={classNames(styles['manage-modal-wrap'], 'user-popup', 'user-popup-tips')}
      >
        <UserPopupTipsContent
          className={styles['manage-account-popup']}
          headerIcon={<LazyImage src={`${oss_svg_image_domain_address}tips.png`} />}
          slotContent={
            <div className="manage-account-popup-content">
              <Icon
                hasTheme
                name="close"
                className="popup-header-icon"
                onClick={() => setVisibleManageAccount(false)}
              />
              <span className="content-text">{t`features_user_personal_center_account_security_manage_account_index__ks0z_7z3e`}</span>
              <div className="footer-checkobx">
                <Checkbox checked={accountCheck} onChange={setAccountCheck}>
                  {({ checked }) => {
                    return checked ? (
                      <>
                        <Icon name="icon_agree_yes" hasTheme className="text-sm" />
                        <span>{t`features_user_personal_center_account_security_manage_account_index_p4vh4yfkuq`}</span>
                      </>
                    ) : (
                      <>
                        <Icon name="icon_agree_no" className="text-sm" hasTheme />
                        <span>{t`features_user_personal_center_account_security_manage_account_index_p4vh4yfkuq`}</span>
                      </>
                    )
                  }}
                </Checkbox>
              </div>
            </div>
          }
        />
      </UserPopUp>

      <UniversalSecurityVerification
        isShow={isShowVerification}
        onClose={setIsShowVerification}
        onSuccess={(isSuccess: boolean, option) => {
          isSuccess && onThirdPartyChange(option)
        }}
        businessType={UserSendValidateCodeBusinessTypeEnum.userLogoutApplication}
      />
    </section>
  )
}

export default ManageAccount
