/**
 * 表单查询组建
 */

import { Button, Form, Space, Spin, InputNumber, Select, DatePicker, Input, Checkbox, Message } from '@nbit/arco'
import { getInviteDetailsUidTypes } from '@/constants/agent/agent-invite'
import { AgentModalTypeEnum } from '@/constants/agent/agent-center'
import { YapiGetV1OpenapiComCodeGetCodeDetailListData } from '@/typings/yapi/OpenapiComCodeGetCodeDetailListV1GetApi'
import { t } from '@lingui/macro'
import { fetchProductList } from '@/apis/agent/agent-invite/apply'
import { getAgentSystemAreaAgentLevel } from '@/apis/agent/agent-center/userDetails'
import { getUserInfo } from '@/helper/cache'
import { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react'
import { isDateIntervalValid } from '@/features/agent/center/invite/his-personal-modal/model-tools'
import dayjs from 'dayjs'
import Icon from '@/components/icon'
import style from './index.module.css'

const FormItem = Form.Item
const Option = Select.Option

interface Proos {
  // 表单筛选数值
  filterNum: string | null
  // 产品线数据字典
  ratio: Array<YapiGetV1OpenapiComCodeGetCodeDetailListData>
  // 表单默认查询
  defaultDate: object
}
interface productLineType {
  /** 名称 */
  label: string
  /** value 唯一值 */
  value: string | number
}

function InvitationFormfilterV3(props, ref) {
  const [form] = Form.useForm()
  const optionList = getInviteDetailsUidTypes()
  const [productLine, setProductLine] = useState<Array<productLineType>>([{ label: t`common.all`, value: 0 }]) // 产品线数据
  const { businessId, uid } = getUserInfo() // 获取当前用户信息
  const [regionList, setRegionList] = useState([{ value: 0, label: t`common.all` }]) // 区域等级数据
  const [startDate, setStartDate] = useState({
    ...props.defaultDate,
  })

  /**
   * 产品线查询
   */
  const onVisibleChange = async (visible: boolean) => {
    if (visible && productLine.length === 1) {
      const res = await fetchProductList({ businessId })
      if (res.isOk && res.data) {
        const data = res?.data || []
        props.ratio.forEach(val => {
          data.forEach(valKey => {
            if (val.codeVal === valKey) {
              setProductLine(dataVal => {
                const data = [...dataVal]
                data.push({ label: val.codeKey, value: String(valKey) })
                return data
              })
            }
          })
        })
      }
    }
  }

  /**
   * 代理等级查询
   */
  const getsRegionRating = async (visibleShow: boolean) => {
    if (visibleShow && regionList.length <= 1) {
      const res = await getAgentSystemAreaAgentLevel({})
      if (res.isOk && res.data) {
        const data = res.data
        setRegionList(val => {
          const newValue = [...val]
          data.length > 0 &&
            data?.forEach(req => {
              newValue.push({ value: req, label: `V ${req}` })
            })
          return newValue
        })
      }
    }
  }

  /**
   * 注册时间
   */
  const handleCustomTimeOnChange = (_: string[], date: dayjs.Dayjs[]) => {
    const startTime = date[0].startOf('date').valueOf()
    const endTime = date[1].endOf('date').valueOf()
    setStartDate(val => {
      const data = { ...val }
      data.startTime = startTime
      data.endTime = endTime
      return data
    })
  }

  /**
   * 重置方法
   */
  const onReset = () => {
    setStartDate(props.defaultDate)
  }

  /**
   * 查询方法
   */
  const onInquire = () => {
    if ((startDate.inviteNumMin && !startDate.inviteNumMax) || (startDate.inviteNumMax && !startDate.inviteNumMin)) {
      Message.error(t`features_agent_invitation_v3_invitation_formfilter_v3_index_qcmiet2los`)
      return
    }
    if (startDate.inviteNumMin > startDate.inviteNumMax) {
      Message.error(t`features_agent_center_invite_his_personal_modal_index_vbsizo5ao_`)
      return
    }
    if (startDate.uid === uid) {
      Message.error(t`constants_agent_invite_index_j1rixsj0l1`)
      return
    }
    if (startDate.startTime && startDate.endTime) {
      if (!isDateIntervalValid(startDate.startTime, startDate.endTime)) {
        return Message.error(t`features_agent_center_invite_his_personal_modal_index_xmq5nsydjo`)
      }
    }
    setStartDate(val => {
      const dataVal = { ...val }
      // 暂时注释掉了，后续看是否需要
      // if (!dataVal.uid && dataVal.queryUidType === optionList[1].value) {
      //   dataVal.queryUidType = 1
      // }
      props.onInquireTable(dataVal)
      return dataVal
    })
  }

  /**
   * 只看上下级的切换事件
   */
  const onHandoffBox = value => {
    setStartDate(val => {
      const data = { ...val }
      data.isChildUid = value
      if (value) {
        data.queryUidType = 1
        data.uid = ''
      }
      props.onInquireTable(data)
      return data
    })
    props.onEmptyIdCollection()
  }

  /**
   * uid 查询事件
   */
  const onChangeUId = value => {
    setStartDate(val => ({ ...val, uid: value?.replace(/[^a-zA-Z0-9]/g, '') }))
  }

  /**
   *
   * 最大值键盘事件
   */
  const handleKeyPress = event => {
    const invalidChars = ['.', '-']
    if (invalidChars.indexOf(event.key) !== -1) {
      event.preventDefault()
    }
  }

  useImperativeHandle(ref, () => {
    return {
      onCloseFrom: () => {
        onReset()
      },
      onSetStartDate: value => {
        setStartDate(val => {
          const data = { ...val, ...value }
          return data
        })
      },
    }
  })

  return (
    <div className={style.scoped}>
      <Form form={form} className="form-box" autoComplete="off" layout="inline">
        <FormItem className="form-uid">
          <Input
            onChange={onChangeUId}
            value={startDate.uid}
            className="form-uid-input"
            style={{ width: 224, height: 40 }}
            prefix={
              <div className={style.select}>
                <Select
                  onChange={value => setStartDate(val => ({ ...val, queryUidType: value }))}
                  value={startDate.queryUidType}
                  style={{ width: 100 }}
                  suffixIcon={
                    <span className="country-icon">
                      <Icon name="icon_agent_drop" fontSize={8} hasTheme />
                    </span>
                  }
                >
                  {optionList.map((res, index) => {
                    return (
                      <Option key={index} value={res.value} disabled={startDate.isChildUid && index === 1}>
                        {res.label}
                      </Option>
                    )
                  })}
                </Select>
              </div>
            }
            placeholder={t`features_agent_invitation_v2_invitation_details_v2_index_sfaxyc6emo`}
          />
        </FormItem>
        <FormItem className="form-checkbox">
          <Checkbox
            onChange={value => onHandoffBox(value)}
            checked={startDate.isChildUid}
          >{t`features_agent_invitation_v2_rebate_records_v2_index_e0pseylqm5`}</Checkbox>
        </FormItem>
        <FormItem label={t`features_assets_financial_record_search_form_index_njivosohlh`} className="form-select">
          <Select
            onChange={value => setStartDate(val => ({ ...val, productCd: value }))}
            value={startDate.productCd}
            onVisibleChange={onVisibleChange}
            style={{ width: 130, height: 40 }}
            suffixIcon={
              <span className="country-icon">
                <Icon name="icon_agent_drop" fontSize={8} hasTheme />
              </span>
            }
          >
            {productLine.map(res => {
              return (
                <Option key={res.value} value={res.value}>
                  {res.label}
                </Option>
              )
            })}
          </Select>
        </FormItem>
        {props.filterNum && props.filterNum === AgentModalTypeEnum.area && (
          <FormItem
            label={t`features_agent_invitation_v3_invitation_formfilter_v3_index_xocibthwhg`}
            className="form-select"
          >
            <Select
              onChange={value => setStartDate(val => ({ ...val, areaLevel: value }))}
              value={startDate.areaLevel}
              onVisibleChange={getsRegionRating}
              style={{ width: 130, height: 40 }}
              suffixIcon={
                <span className="country-icon">
                  <Icon name="icon_agent_drop" fontSize={8} hasTheme />
                </span>
              }
            >
              {regionList.map(res => {
                return (
                  <Option key={res.value} value={res.value}>
                    {res.label}
                  </Option>
                )
              })}
            </Select>
          </FormItem>
        )}

        <FormItem label={t`features_agent_agency_center_invitation_details_index_5101541`} className="form-datepicker">
          <DatePicker.RangePicker
            value={[startDate.startTime, startDate.endTime]}
            allowClear={false}
            onChange={handleCustomTimeOnChange}
            format="YYYY-MM-DD"
            separator={t`features/assets/saving/history-list/index-0`}
            style={{ width: 240, height: 40 }}
          />
        </FormItem>
        <FormItem label={t`features_agent_agency_center_data_overview_index_o2y6ibxmqh`} className="form-numteam">
          <div className="form-members">
            <Input.Group>
              <InputNumber
                onKeyDown={handleKeyPress}
                onChange={value => setStartDate(val => ({ ...val, inviteNumMin: value }))}
                value={startDate.inviteNumMin}
                hideControl
                style={{ width: '30%', marginLeft: 22 }}
                placeholder={t`assets.withdraw.withdrawCountPlaceholder`}
              />
              <span className="form-members-span">{t`features/assets/saving/history-list/index-0`}</span>
              <InputNumber
                onKeyDown={handleKeyPress}
                onChange={value => setStartDate(val => ({ ...val, inviteNumMax: value }))}
                value={startDate.inviteNumMax}
                hideControl
                style={{ width: '30%' }}
                placeholder={t`features_agent_invitation_v3_invitation_formfilter_v3_index_kkuexottxx`}
              />
            </Input.Group>
          </div>
        </FormItem>
        <Button className="button-reset" type="primary" onClick={onInquire}>
          {t`order.search_button`}
        </Button>
        <Button className="button-query" onClick={onReset}>
          {t`user.field.reuse_47`}
        </Button>
      </Form>
    </div>
  )
}

export default forwardRef(InvitationFormfilterV3)
