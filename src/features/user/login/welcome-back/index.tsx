import { t } from '@lingui/macro'
import { useState, useEffect } from 'react'
import { link } from '@/helper/link'
import Icon from '@/components/icon'
import { Input, Button, Form } from '@nbit/arco'
import { postPasswordChecRequest } from '@/apis/user'
import { usePageContext } from '@/hooks/use-page-context'
import { useGeeTestBind } from '@/features/user/common/geetest'
import { LoginValidateRules } from '@/features/user/utils/validate'
import { UserVerifyTypeEnum, GeeTestOperationTypeEnum } from '@/constants/user'
import { FormValuesTrim, UserInformationDesensitization } from '@/features/user/utils/common'
import styles from './index.module.css'

const FormItem = Form.Item
function WelcomeBack() {
  const pageContext = usePageContext()
  const [account, setAccount] = useState<string>('')
  const [passwordShow, setPasswordShow] = useState<boolean>(false)
  const [accountType, setAccountType] = useState<number>(UserVerifyTypeEnum.email)
  const [loading, setLoading] = useState<boolean>(false)

  const geeTestInit = useGeeTestBind()

  const [form] = Form.useForm()
  const rule = LoginValidateRules()

  const getRouterParams = () => {
    const routeParams = pageContext?.urlParsed
    const accountData = routeParams?.search?.account
    const type = routeParams?.search?.accountType
    type && setAccountType(Number(type))
    accountData && setAccount(accountData)
  }

  const geeTestOnSuccess = async values => {
    const params = {
      account,
      accountType,
      password: values.password,
    }
    const { data, isOk } = await postPasswordChecRequest(params)
    if (isOk && data) {
      const loginType = pageContext?.urlParsed?.hash
      link(`/safety-verification?bindType=${loginType}`)
    }
    setLoading(false)
  }

  const onFinish = async values => {
    // /** 极验验证 */
    const operateType = GeeTestOperationTypeEnum.login
    const accountData = account?.replace(/\s/g, '')
    setLoading(true)
    geeTestInit(
      accountData,
      operateType,
      () => geeTestOnSuccess(values),
      () => setLoading(false)
    )
  }

  // const handleClearPassword = () => {
  //   // form.setFieldValue('password', '')
  // }

  useEffect(() => {
    getRouterParams()
  }, [])

  return (
    <section className={styles.scoped}>
      <div className="welcome-back-body">
        <div className="main">
          <div className={`back personal-center-back`}>
            <Icon name="back" hasTheme className="mt-px" />
            <label onClick={() => window.history.back()}>{t`user.field.reuse_44`}</label>
          </div>
          <div className="welcome-back-content">
            <p>{t`features_user_login_welcome_back_index_ajqqtcqmju`}</p>
            <label>{UserInformationDesensitization(account)}</label>
            <Form form={form} layout="vertical" onSubmit={onFinish} autoComplete="off" validateTrigger="onBlur">
              <FormItem
                label={t`user.validate_form_05`}
                field="password"
                formatter={FormValuesTrim}
                rules={[rule.password]}
                requiredSymbol={false}
              >
                <Input
                  type={passwordShow ? 'text' : 'password'}
                  placeholder={t`user.validate_form_06`}
                  suffix={
                    <Icon
                      name={passwordShow ? 'eyes_open' : 'eyes_close'}
                      hasTheme
                      onClick={() => setPasswordShow(!passwordShow)}
                    />
                  }
                />
              </FormItem>
              <FormItem style={{ marginBottom: 0 }}>
                <Button loading={loading} type="primary" htmlType="submit" className="welcome-back-button">
                  {t`user.field.reuse_23`}
                </Button>
              </FormItem>
            </Form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WelcomeBack
