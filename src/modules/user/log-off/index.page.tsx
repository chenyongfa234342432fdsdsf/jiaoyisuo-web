import { postMemberSafeVerifyEmailSend, postMemberSafeVerifyPhoneSend, postV1UserLogoffApiRequest } from '@/apis/user'
import Icon from '@/components/icon'
import Link from '@/components/link'
import { oss_area_code_image_domain_address } from '@/constants/oss'
import { ChinaAreaCodeEnum, UserValidateMethodEnum } from '@/constants/user'
import UserChooseVerificationMethod from '@/features/user/common/choose-verification-method'
import UserSearchArea from '@/features/user/common/search-area'
import UserCountDown from '@/features/user/components/count-down'
import UserPopUp from '@/features/user/components/popup'
import { FormValuesTrim } from '@/features/user/utils/common'
import {
  IsBlankValidate,
  RegisterFlowRules,
  RegisterVerificationRules,
  formatPhoneNumber,
} from '@/features/user/utils/validate'
import { MarkcoinResponse } from '@/plugins/request'
import { MemberMemberAreaType, MemberSuccessResp } from '@/typings/user'
import { t } from '@lingui/macro'
import { Alert, Button, Form, Image, Input, Message, Select } from '@nbit/arco'
import { useUpdateEffect } from 'ahooks'
import { useRef, useState } from 'react'
import { YapiPostV1UserLogoffApiRequest } from '@/typings/yapi/UserLogoffV1PostApi'
import styles from './index.module.css'

const verificationCodeType = 24

const FormItem = Form.Item

const getAccountTypeTab = () => {
  return [
    { title: t`user.safety_items_04`, id: 'email' },
    { title: t`user.validate_form_header_02`, id: 'phone' },
  ]
}

function Page() {
  const [isEmailPhoneEmpty, setisEmailPhoneEmpty] = useState(true)
  const [method, setMethod] = useState<string>(UserValidateMethodEnum.email)
  const [loading, setLoading] = useState<boolean>(false)
  const [passwordShow, setPasswordShow] = useState({
    newPasswordShow: true,
    confirmPasswordShow: true,
  })
  const [area, setArea] = useState({
    codeVal: ChinaAreaCodeEnum.code,
    codeKey: t`features_user_personal_center_account_security_phone_index_2432`,
    remark: ChinaAreaCodeEnum.remark,
  })
  const [selectArea, setSelectArea] = useState<boolean>(false)

  const [form] = Form.useForm()
  const loginPassword = Form.useWatch('loginPassword', form)
  const confirmPassword = Form.useWatch('confirmPassword', form)

  const isEmailSend = useRef<boolean>(false)
  const isPhoneSend = useRef<boolean>(false)

  const rules = RegisterFlowRules(loginPassword)
  const verificationRules = RegisterVerificationRules(isEmailSend, isPhoneSend)

  const handleSendValidateCode = async () => {
    let res: MarkcoinResponse<MemberSuccessResp> | null = null
    if (method === UserValidateMethodEnum.email) {
      const email = form.getFieldValue('email')
      res = await postMemberSafeVerifyEmailSend({ email, type: verificationCodeType })
    }
    if (method === UserValidateMethodEnum.phone) {
      let mobile = form.getFieldValue('mobileNumber')
      mobile = mobile?.replace(/\s/g, '')
      res = await postMemberSafeVerifyPhoneSend({ mobile, mobileCountryCode: area.codeVal, type: verificationCodeType })
    }

    const isTrue = (res?.isOk && res?.data?.isSuccess) || false
    if (isTrue) {
      isEmailSend.current = true
      Message.success(t`user.field.reuse_38`)
    }
    return isTrue
  }

  useUpdateEffect(() => {
    loginPassword && confirmPassword && form.validate(['loginPassword', 'confirmPassword'])
  }, [loginPassword, confirmPassword])

  const onSubmit = async values => {
    values = { ...values, password: values.loginPassword }
    delete values.loginPassword
    delete values.confirmPassword
    if (method === UserValidateMethodEnum.phone) {
      values = { ...values, mobileCountry: area.codeVal }
      values.mobileNumber = values.mobileNumber?.replace(/\s/g, '')
    }
    setLoading(true)

    postV1UserLogoffApiRequest(values)
      .then(res => {
        if (res.isOk && res.data?.isSuccess) {
          form.clearFields()
          setisEmailPhoneEmpty(true)
          Message.info(t`modules_user_log_off_index_page_le9miowja5`)
        } else Message.info(t`modules_user_log_off_index_page_3egha6uncw`)
      })
      .catch(err => Message.info(t`modules_user_log_off_index_page_3egha6uncw`))
      .finally(() => setLoading(false))
  }

  const handleClearPassword = (key: string) => {
    form.setFieldValue(key, '')
  }

  const handleSelectArea = (v: MemberMemberAreaType) => {
    setArea(v as unknown as any)
    setSelectArea(false)
  }

  const handleChoosMethod = (type: string) => {
    setMethod(type)
    form.clearFields()
  }

  const checkEmailPhoneIsEmpty = () =>
    method === UserValidateMethodEnum.email ? !form.getFieldValue('email') : !form.getFieldValue('mobileNumber')

  return (
    <div className={`${styles.scoped} user-form-style`}>
      <span className="cancellation-title">{t`modules_user_account_cancellation_index_page_adftw7dcqk`}</span>
      <Alert
        type="info"
        content={<span className="text-tips_color">{t`modules_user_account_cancellation_index_page_r6nzqw7dkc`}</span>}
      />
      <UserChooseVerificationMethod tabList={getAccountTypeTab()} method={method} choosMethod={handleChoosMethod} />
      <Form
        className={'cancellation-form'}
        form={form}
        layout="vertical"
        onSubmit={onSubmit}
        autoComplete="off"
        validateTrigger="onBlur"
      >
        {method === UserValidateMethodEnum.email && (
          <FormItem label={t`user.safety_items_04`} field="email" requiredSymbol={false} rules={[rules.email]}>
            <Input
              placeholder={t`user.validate_form_02`}
              onBlur={() => {
                const flag = checkEmailPhoneIsEmpty()
                setisEmailPhoneEmpty(flag)
              }}
            />
          </FormItem>
        )}

        {method === UserValidateMethodEnum.phone && (
          <FormItem
            className="custom-arco-form-item"
            label={t`user.validate_form_03`}
            field="mobileNumber"
            requiredSymbol={false}
            rules={[rules.phone]}
            formatter={value => formatPhoneNumber(value, area?.codeVal)}
          >
            <Input
              onBlur={() => {
                const flag = checkEmailPhoneIsEmpty()
                setisEmailPhoneEmpty(flag)
              }}
              placeholder={t`user.field.reuse_11`}
              addBefore={
                <Select
                  onClick={() => setSelectArea(true)}
                  style={{ width: 100 }}
                  popupVisible={false}
                  arrowIcon={<Icon name="arrow_open" hasTheme />}
                  prefix={
                    <>
                      <Image preview={false} src={`${oss_area_code_image_domain_address}${area?.remark}.png`} /> +
                      {area?.codeVal}
                    </>
                  }
                />
              }
            />
          </FormItem>
        )}

        <FormItem
          label={t`user.validate_form_05`}
          field="loginPassword"
          requiredSymbol={false}
          formatter={FormValuesTrim}
          rules={[rules.password]}
        >
          <Input
            type={passwordShow.newPasswordShow ? 'password' : 'text'}
            maxLength={16}
            placeholder={t`user.validate_form_06`}
            suffix={
              <>
                {loginPassword && (
                  <Icon name="del_input_box" hasTheme onClick={() => handleClearPassword('loginPassword')} />
                )}

                <Icon
                  name={passwordShow.newPasswordShow ? 'eyes_open' : 'eyes_close'}
                  hasTheme
                  onClick={() =>
                    setPasswordShow({
                      ...passwordShow,
                      newPasswordShow: !passwordShow.newPasswordShow,
                    })
                  }
                />
              </>
            }
          />
        </FormItem>

        <FormItem
          label={t`user.field.reuse_12`}
          field="confirmPassword"
          requiredSymbol={false}
          formatter={FormValuesTrim}
          rules={[rules.confirmPassword]}
        >
          <Input
            type={passwordShow.confirmPasswordShow ? 'password' : 'text'}
            maxLength={16}
            placeholder={t`user.validate_form_06`}
            suffix={
              <>
                {confirmPassword && (
                  <Icon name="del_input_box" hasTheme onClick={() => handleClearPassword('confirmPassword')} />
                )}

                <Icon
                  name={passwordShow.confirmPasswordShow ? 'eyes_open' : 'eyes_close'}
                  hasTheme
                  onClick={() =>
                    setPasswordShow({
                      ...passwordShow,
                      confirmPasswordShow: !passwordShow.confirmPasswordShow,
                    })
                  }
                />
              </>
            }
          />
        </FormItem>

        <FormItem
          field="verifyCode"
          requiredSymbol={false}
          rules={[verificationRules.emailCode]}
          label={method === UserValidateMethodEnum.email ? t`user.field.reuse_03` : t`user.field.reuse_04`}
          disabled={isEmailPhoneEmpty}
        >
          <Input
            type="number"
            maxLength={6}
            placeholder={method === UserValidateMethodEnum.email ? t`user.field.reuse_20` : t`user.field.reuse_21`}
            suffix={
              isEmailPhoneEmpty ? (
                <div>{t`user.field.reuse_31`}</div>
              ) : (
                <UserCountDown onSend={handleSendValidateCode} />
              )
            }
          />
        </FormItem>

        <FormItem
          field="reason"
          label={t`modules_user_log_off_index_page_9kmspivxzn`}
          rules={[IsBlankValidate(t`modules_user_log_off_index_page_akxttegvun`)]}
          requiredSymbol={false}
        >
          <Input.TextArea placeholder={t`modules_user_account_cancellation_index_page_cv40x7mjaf`} className={'h-20'} />
        </FormItem>

        <FormItem>
          <Button long loading={loading} type="primary" htmlType="submit">
            {t`modules_user_account_cancellation_index_page_tbb86zndww`}
          </Button>
        </FormItem>
      </Form>
      <UserPopUp
        title={<div style={{ textAlign: 'left' }}>{t`user.search_area_04`}</div>}
        className="user-popup"
        maskClosable={false}
        visible={selectArea}
        closeIcon={<Icon name="close" hasTheme />}
        onCancel={() => setSelectArea(false)}
        footer={null}
      >
        <UserSearchArea
          type="area"
          checkedValue={area?.codeVal}
          placeholderText={t`user.field.reuse_25`}
          selectArea={handleSelectArea}
        />
      </UserPopUp>
    </div>
  )
}

async function onBeforeRender(pageContext: PageContext) {
  const pageProps = {}
  const layoutParams = {
    footerShow: false,
    headerShow: false,
    fullScreen: false,
  }
  return {
    pageContext: {
      pageProps,
      layoutParams,
    },
  }
}

export { Page, onBeforeRender }
