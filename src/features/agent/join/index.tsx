import { useEffect, useState } from 'react'
import { Button, Form, Input, Select, Message } from '@nbit/arco'
import { t } from '@lingui/macro'
import cn from 'classnames'
import Icon from '@/components/icon'
import { AgentJoinRules } from '@/features/agent/utils/validate'
import Link from '@/components/link'
import { link } from '@/helper/link'
import LazyImage from '@/components/lazy-image'
import { useCommonStore } from '@/store/common'
import { getCodeDetailList } from '@/apis/common'
import { fetchPyramidRebateApplication, fetchApplyRead, fetchBlacklistQuery } from '@/apis/agent/agent-invite/apply'
import { getAgentPyramidApplyInfo } from '@/apis/agent/agent-invite'
import { IAgenApplyPyramidReq } from '@/typings/api/agent/agent-invite/apply'
import { AuditStatusType, emailOrPhoneEnum, JoinStatusEnum, AgentApplicationEnum } from '@/constants/agent/agent'
import { getMemberAreaIp } from '@/apis/user'
import { usePersonalCenterStore } from '@/store/user/personal-center'
import { useMount } from 'ahooks'
import { YapiGetV1OpenapiComCodeGetCodeDetailListData } from '@/typings/yapi/OpenapiComCodeGetCodeDetailListV1GetApi'
import CustomModal from '../modal'
import styles from './index.module.css'
import AreacodeSelect from '../areacode-select'
import JoinHerder from './join-herder'

const FormItem = Form.Item
const Option = Select.Option
const TextArea = Input.TextArea

type webComponentType = {
  selectVal: string
  inputVal: string
}

type WebSocializeProps = {
  value?: webComponentType
  onChange?: (e: webComponentType) => void
  error?: boolean
}

/**
 * 联系方式选中手机号的 component
 */
function UserPhoneSelect({ value, onChange, error }: WebSocializeProps) {
  const [focus, setFocus] = useState<boolean>(false) // 输入框是否选中
  const [cvalue, setCvalue] = useState<webComponentType>(
    value || {
      selectVal: '',
      inputVal: '',
    }
  )

  useEffect(() => {
    setCvalue({ ...cvalue, ...value })
  }, [value])

  const handleKeyChange = (k, v) => {
    const data = { ...cvalue, [k]: v }
    setCvalue(data)
    onChange && cvalue.inputVal && onChange(data)
  }

  return (
    <div className={cn(styles['select-container'], { error: !!error, focus: !error && focus })}>
      <div className="select-box">
        <AreacodeSelect onChange={e => handleKeyChange('selectVal', e)} value={cvalue.selectVal} />
      </div>
      <Input
        placeholder={t`user.field.reuse_11`}
        className="select-input"
        value={cvalue.inputVal}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onChange={e => handleKeyChange('inputVal', e)}
        suffix={
          cvalue.inputVal ? (
            <div>
              <Icon name="del_input_box" hasTheme fontSize={18} onClick={() => handleKeyChange('inputVal', '')} />
            </div>
          ) : (
            <span className="w-5 block"></span>
          )
        }
      />
    </div>
  )
}

/** 代理商提交申请表单 */
function UserPersonalCenterAgentFormJoin() {
  const commonState = useCommonStore()

  const { getBaseInfo, baseInfoResult } = usePersonalCenterStore()

  useMount(getBaseInfo)

  const [form] = Form.useForm()
  const socialMediaInfoWatch = Form.useWatch('socialMediaInfo')
  const socialMediaWatch = Form.useWatch('socialMedia')

  const [rules, setRules] = useState(AgentJoinRules())

  const selectLists = [
    { label: t`user.safety_items_02`, value: 1 },
    { label: t`user.safety_items_04`, value: 2 },
  ]
  const [socialFocus, setSocialFocus] = useState<boolean>(false)
  const [socialMediaInfo, setSocialMediaInfo] = useState<boolean>(false)
  const [formValue, setFormValue] = useState<IAgenApplyPyramidReq>()
  const [selectVisible, setSelectVisible] = useState<boolean>(false)
  const [disabled, setDisabled] = useState<boolean>(true)
  const [isLoading, setLoading] = useState<boolean>(true)
  const [emailOrPhone, setEmailOrPhone] = useState<emailOrPhoneEnum | null>(1) // 切换表单 1: 手机号 2: email
  const [userIpInfo, setUserIpInfo] = useState<any>()
  const [socialMediaSeled, setSocialMediaSeled] = useState<IsocialMedia>()
  const [auditStatus, setAuditStatus] = useState<AuditStatusType>({
    status: JoinStatusEnum.default,
    rejectReason: '',
  }) // 代理商申请状态
  const [isShow, setShow] = useState<boolean>(false) // 显示 / 隐藏 确认提交弹窗
  const [socialMedia, setSocialMedia] = useState<Array<YapiGetV1OpenapiComCodeGetCodeDetailListData>>([]) // 社交媒体数据
  const [loadingButton, setLoadingButton] = useState(false)
  // 写死社交媒体下拉选择项
  type IsocialMedia = 'Line' | 'Telegram' | 'Twitter' | 'WeChat' | 'Facebook'

  /**
   * 是否黑名单
   */
  const getBlockNot = async () => {
    const row = await fetchBlacklistQuery({})
    if (row.isOk && row.data) {
      return row.data?.inBlacklist
    }
    return false
  }

  /**
   * 下拉框展开时获取社交媒体数据
   */
  const getSocialMedia = async (visible: boolean) => {
    if (!visible || socialMedia.length > 0) return
    const res = await getCodeDetailList({ codeVal: 'webSocialize' })
    if (res.isOk) {
      const socialmediaList = res.data || []
      setSocialMedia(socialmediaList)
    }
  }

  /**
   * 审核失败 (未通过时) 设置为已读
   */
  const applyReadGet = async () => {
    await fetchApplyRead({})
  }

  const getManageInvitequery = async () => {
    const res = await getAgentPyramidApplyInfo({})
    if (res.isOk && res.data) {
      // 当不能申请金字塔 并且审核状态不存在于系统中时就跳转首页
      if (
        !res.data?.showBanner &&
        ![
          AgentApplicationEnum.NotApplied,
          AgentApplicationEnum.ToBeReviewed,
          AgentApplicationEnum.ApplicationApproved,
          AgentApplicationEnum.Failed,
        ].includes(res.data.applyStatus)
      ) {
        link('/agent')
        return
      }
      setAuditStatus({
        ...auditStatus,
        status: res.data?.applyStatus,
        rejectReason: res.data?.rejectReason || '',
      })
      res.data?.applyStatus === AgentApplicationEnum.Failed && applyReadGet()
    }
    setLoading(false)
  }

  /**
   * 表单提交方法
   */
  const joinInviteAdd = async () => {
    setLoadingButton(true)
    const block = await getBlockNot()
    if (block) {
      setLoadingButton(false)
      Message.warning(t`features_agent_join_index_1xbyklso6c`)
      return
    }
    const res = await fetchPyramidRebateApplication(formValue as IAgenApplyPyramidReq)

    if (res.isOk) {
      setShow(false)
      ;(document.scrollingElement as Element).scrollTop = 0
      getManageInvitequery()
    }
    setLoadingButton(false)
  }

  const getAreaIp = async () => {
    const res = await getMemberAreaIp({})
    if (res.isOk && res.data) {
      setUserIpInfo(res.data)
    }
  }

  useEffect(() => {
    getManageInvitequery()
    getAreaIp()
  }, [])

  // 设置默认的 selectVal 和 inputVal
  useEffect(() => {
    if (emailOrPhone === emailOrPhoneEnum.email && baseInfoResult.email) {
      form.setFieldValue('email', baseInfoResult.email || '')
      return
    }
    if (emailOrPhone === emailOrPhoneEnum.phone) {
      if (baseInfoResult?.mobileNumber) {
        form.setFieldValue('phone', {
          selectVal: baseInfoResult?.mobileCountryCd,
          inputVal: baseInfoResult?.mobileNumber,
        })
      } else {
        form.setFieldValue('phone', {
          selectVal: userIpInfo?.enCode,
          inputVal: '',
        })
      }
    }
  }, [baseInfoResult, emailOrPhone, userIpInfo])

  const handleClearFormValue = (key: string) => {
    form.setFieldValue(key, '')
    form
      .validate([key])
      .then(() => setDisabled(false))
      .catch(() => setDisabled(true))
  }

  const onChangeEmailOrPhone = v => {
    setEmailOrPhone(v)
  }

  const handleValidateChange = () => {
    const x = form.getFieldsValue()

    let isValidate = true

    Object.keys(x).map(key => {
      if (key !== 'comment' && typeof x[key] === 'undefined') {
        isValidate = false
      }

      return 0
    })

    isValidate &&
      form
        .validate()
        .then(() => setDisabled(false))
        .catch(() => setDisabled(true))
  }

  const email = Form.useWatch('email', form)

  const getSelectFormItem = () => {
    if (emailOrPhone === emailOrPhoneEnum.email) {
      return (
        <div>
          <FormItem field="email" requiredSymbol={false} rules={[rules.email]} style={{ borderRadius: 8 }}>
            <Input
              className="page-box-form"
              placeholder={t`user.validate_form_02`}
              suffix={
                form.getFieldValue('email') ? (
                  <Icon name="del_input_box" hasTheme fontSize={18} onClick={() => handleClearFormValue('email')} />
                ) : (
                  <span className="w-5 block"></span>
                )
              }
            />
          </FormItem>
        </div>
      )
    }

    if (emailOrPhone === emailOrPhoneEnum.phone) {
      return (
        <FormItem field="phone" requiredSymbol={false} rules={[rules.phone]}>
          <UserPhoneSelect />
        </FormItem>
      )
    }

    return <Input />
  }

  const onSubmit = async values => {
    setShow(true)
    const params: any = {}
    params.contactInformation = values.email

    // 联系方式为手机号时
    if (emailOrPhone === emailOrPhoneEnum.phone) {
      params.mobileCountryCd = values.phone.selectVal
      params.contactInformation = values.phone.inputVal
    }

    setFormValue({
      contact: (emailOrPhone || '').toString(),
      content: values.comment,
      ...params,
      socialMedia: values.socialMedia,
      socialMediaInfo: values.socialMediaInfo,
    })
  }

  /** 待审核 */
  if (auditStatus.status === JoinStatusEnum.noReview) {
    return (
      <section className={`personal-center-agent-join ${styles.scoped}`}>
        <div className="no-pass">
          <Icon name="register_success" hasTheme className="regidter-icon" />
          <div className="no-pass-title">{t`modules_kyc_verified_result_verified_5101153`}</div>
          <div className="no-pass-subtitle">{t`features_agent_join_index_sfk4siqi7e`}</div>
          <div className="no-pass-submit">
            <Link href={'/agent'}>
              <Button className="button" type="primary">
                {t`features_trade_spot_index_2510`}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  /** 申请未通过 */
  if (auditStatus.status === JoinStatusEnum.noPass) {
    return (
      <section className={`personal-center-agent-join ${styles.scoped}`}>
        <div className="no-pass">
          <Icon name="icon_review_failed" className="regidter-faile-icon" />
          <div className="no-pass-title">{t`modules_kyc_verified_result_index_page_5101150`}</div>
          <div className="no-pass-subtitle">
            {`${t`modules_user_log_off_index_page_9kmspivxzn`}: ${auditStatus?.rejectReason || '--'}`}
          </div>
          <div className="no-pass-submit">
            <Link href={'/agent'}>
              <Button className="button" type="primary">
                {t`features_trade_spot_index_2510`}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  /** 申请审核通过 */
  if (auditStatus.status === JoinStatusEnum.pass) {
    return (
      <section className={`personal-center-agent-join ${styles.scoped}`}>
        <div className="no-pass">
          <Icon name="register_success" hasTheme className="regidter-icon" />
          <div className="no-pass-title">{t`features/user/initial-person/index-5`}</div>
          <div className="no-pass-submit">
            <Link href={'/agent'}>
              <Button className="button" type="primary">
                {t`features_trade_spot_index_2510`}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  if (isLoading) {
    return <div></div>
  }

  const validateSocialMedia = () => {
    form.validate(['socialMedia'])
  }
  const validateSocialMediaInfo = () => {
    form.validate(['socialMediaInfo'])
  }
  return (
    <section className={`personal-center-agent-join ${styles.scoped}`}>
      <JoinHerder />
      <div className="section">
        <div className="agent-join-form">
          <Form
            form={form}
            initialValues={{ contact: 1 }}
            layout="vertical"
            onSubmit={onSubmit}
            autoComplete="off"
            onChange={handleValidateChange}
          >
            <div className="agent-join-form-item">
              <div className="agent-join-form-item-label">{t`features_agent_join_index_5101453`}</div>
              <div className="agent-join-form-item-value">
                <div className="agent-join-form-item-select-box">
                  <FormItem field="contact" requiredSymbol={false} required>
                    <Select
                      className="agent-join-form-item-select"
                      suffixIcon={
                        <span className="country-icon">
                          <Icon name="icon_agent_drop" fontSize={8} hasTheme />
                        </span>
                      }
                      onVisibleChange={visible => setSelectVisible(visible)}
                      onChange={onChangeEmailOrPhone}
                      placeholder={t`features_agent_join_index_uhvtjbqdjx`}
                    >
                      {selectLists.map((item, i) => (
                        <Option key={item.value} value={item.value}>
                          {item.label}
                        </Option>
                      ))}
                    </Select>
                  </FormItem>
                </div>
                <div className="join-form-item-input">{getSelectFormItem()}</div>
              </div>
            </div>
            {/* 社交媒体 */}
            <div className="agent-join-form-item agent-join-form-topmargin">
              <div className="agent-join-form-item-label">{t`features_agent_join_index_qbtixmzwljrmxafjlhavy`}</div>
              <div className="agent-join-form-item-value">
                <div className="agent-join-form-item-select-box">
                  <FormItem
                    field="socialMedia"
                    requiredSymbol={false}
                    rules={[
                      {
                        required: true,
                        validator: (value: string | undefined, cb) => {
                          if (socialMediaInfoWatch && form.getFieldValue('socialMedia') === undefined) {
                            return cb(t`features_agent_join_index_jt_e1w2md3uqcbf4urgyc`)
                          }
                          if (!value) {
                            return cb(t`features_agent_join_index_jt_e1w2md3uqcbf4urgyc`)
                          }
                          return cb()
                        },
                      },
                    ]}
                  >
                    <Select
                      onChange={() => {
                        validateSocialMediaInfo()
                      }}
                      className={'agent-join-form-item-select'}
                      placeholder={t`features_agent_join_index_jt_e1w2md3uqcbf4urgyc`}
                      dropdownMenuStyle={{ width: 412 }}
                      triggerProps={{
                        autoAlignPopupWidth: false,
                        autoAlignPopupMinWidth: true,
                        position: 'bl',
                      }}
                      suffixIcon={
                        <span className="country-icon">
                          <Icon name="icon_agent_drop" fontSize={8} hasTheme />
                        </span>
                      }
                      onVisibleChange={visible => getSocialMedia(visible)}
                    >
                      {socialMedia.map((item, i) => (
                        <Option key={i} value={item.codeKey}>
                          <div
                            className={styles['select-option']}
                            onClick={() => setSocialMediaSeled(item.codeKey as IsocialMedia)}
                          >
                            <div className="icon">
                              <LazyImage whetherPlaceholdImg src={item.codeVal} />
                            </div>
                            <div className={cn(socialMediaSeled === item.codeKey ? 'selecked-text' : 'text')}>
                              {item.codeKey}
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </FormItem>
                </div>
                <div className="join-form-item-input">
                  <FormItem
                    field="socialMediaInfo"
                    requiredSymbol={false}
                    rules={[
                      {
                        required: true,
                        validator: (value: string | undefined, cb) => {
                          if (socialMediaWatch && form.getFieldValue('socialMediaInfo') === undefined) {
                            return cb(t`features_agent_join_index_axtt1xdhjn`)
                          }
                          if (!value) {
                            return cb(t`features_agent_join_index_axtt1xdhjn`)
                          }
                          return cb()
                        },
                      },
                    ]}
                  >
                    <Input
                      className="page-box-form"
                      placeholder={t`features_agent_join_index_v2pmxh446j`}
                      autoFocus={socialFocus}
                      onChange={value => {
                        validateSocialMedia()
                        if (value) {
                          setSocialMediaInfo(true)
                          setSocialFocus(true)
                        } else {
                          setSocialMediaInfo(false)
                        }
                      }}
                      suffix={
                        socialMediaInfo && (
                          <Icon
                            name="del_input_box"
                            hasTheme
                            fontSize={18}
                            onClick={() => {
                              setSocialMediaInfo(false)
                              handleClearFormValue('socialMediaInfo')
                            }}
                          />
                        )
                      }
                    />
                  </FormItem>
                </div>
              </div>
            </div>
            <div className="agent-join-form-item agent-join-form-topmargin">
              <div className="agent-join-form-item-label">{t`features_agent_join_index_5101462`}</div>
              <div className="agent-join-form-item-value">
                <div className="join-form-item-input">
                  <FormItem field="comment" requiredSymbol={false}>
                    <TextArea
                      className="agent-join-form-item-textarea"
                      style={{ minHeight: 90 }}
                      showWordLimit
                      maxLength={500}
                    />
                  </FormItem>
                </div>
              </div>
            </div>
            <div className="agent-join-form-item agent-join-topmargin">
              <FormItem>
                <Button className="agent-join-form-item-button" type="primary" htmlType="submit">
                  {t`user.application_form_11`}
                </Button>
              </FormItem>
            </div>
          </Form>
        </div>
      </div>
      <CustomModal style={{ width: 360 }} className={styles['agent-join-modal']} visible={isShow}>
        <div className="agent-join-submit-box">
          <div className="agent-join-submit-header">
            <div className="agent-join-submit-header-title">{t`features_agent_join_index_5101463`}</div>
            <div className="agent-join-submit-header-icon">
              <Icon name="close" hasTheme fontSize={20} onClick={() => setShow(false)} />
            </div>
          </div>

          <div className="agent-join-submit-content">{t`features_agent_join_index_pjjkaxt2o9`}</div>

          <div className="agent-join-submit-footer">
            <Button className="button" type="secondary" onClick={() => setShow(false)}>
              {t`trade.c2c.cancel`}
            </Button>
            <Button
              disabled={loadingButton}
              loading={loadingButton}
              className="button"
              type="primary"
              onClick={() => joinInviteAdd()}
            >
              {t`user.field.reuse_17`}
            </Button>
          </div>
        </div>
      </CustomModal>
    </section>
  )
}

export default UserPersonalCenterAgentFormJoin
