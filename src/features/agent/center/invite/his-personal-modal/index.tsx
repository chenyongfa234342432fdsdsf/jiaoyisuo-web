/**
 *
 * 表格筛选弹框组建
 */

import { Message, Modal, Form, Space, InputNumber, DatePicker, Button } from '@nbit/arco'
import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import dayjs from 'dayjs'
import { HandleDisableEndDate } from '@/features/user/utils/common'
import { useEffect } from 'react'
import { isDateIntervalValid } from './model-tools'
import style from './index.module.css'

const FormItem = Form.Item

interface Props {
  // 弹框控制变量
  visible: boolean
  // 弹框宽度
  widthNum?: number
  // 弹框宽度
  heightNum?: number
  // 弹窗关闭方法
  onHideVisible?: () => void
  // 查询方法
  onSecondary?: (val: object) => void
  // 重置方法
  onReset?: () => void
}
function HisPersonalModal({ visible, widthNum = 444, heightNum = 354, onHideVisible, onSecondary }: Props) {
  const [form] = Form.useForm()
  const registerEndTime = dayjs().endOf('date').valueOf()
  /**
   * 重置方法
   */
  const onReset = () => {
    form.resetFields()
  }

  /**
   * 查询方法
   */
  const onQuery = () => {
    form
      .validate()
      .then(() => {
        const formValue = form.getFieldsValue()
        formValue.startTime = formValue.startTime ? dayjs(formValue.startTime).startOf('date').valueOf() : undefined
        formValue.endTime = formValue.endTime ? dayjs(formValue.endTime).endOf('date').valueOf() : undefined

        if (formValue.startTime && formValue.endTime) {
          if (!isDateIntervalValid(formValue.startTime, formValue.endTime)) {
            return Message.error(t`features_agent_center_invite_his_personal_modal_index_xmq5nsydjo`)
          }
        }
        onSecondary?.(formValue)
      })
      .catch(e => {})
  }

  /**
   * 监听值部分
   */
  const teamNumMin = Form.useWatch('teamNumMin', form)
  const teamNumMax = Form.useWatch('teamNumMax', form)
  const startTime = Form.useWatch('startTime', form)
  const endTime = Form.useWatch('endTime', form)

  /** 设置时间组件禁用时间 */
  const setDisableDate = (currentDate: dayjs.Dayjs) => HandleDisableEndDate(currentDate, registerEndTime)

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

  useEffect(() => {
    if (visible) {
      form.clearFields()
    }
  }, [visible])

  return (
    <div>
      <Modal visible={visible} style={{ width: widthNum, height: heightNum }} closeIcon={null} footer={null}>
        <div className={style.scoped}>
          <div className="his-per-modal">
            <div>{t`assets.financial-record.search.search`}</div>
            <div>
              <Icon name="close" hasTheme fontSize={20} onClick={onHideVisible} />
            </div>
          </div>

          <div className={style['his-per-form']}>
            <Form
              form={form}
              layout="vertical"
              autoComplete="off"
              validateTrigger="onBlur"
              initialValues={{}}
              onSubmit={onQuery}
            >
              <FormItem className="arco-form-mrgin">
                <span className="arco-form-span">{t`features_agent_agency_center_data_overview_index_o2y6ibxmqh`}</span>
                <Space split={t`features/assets/saving/history-list/index-0`}>
                  <FormItem
                    field="teamNumMin"
                    rules={[
                      {
                        type: 'number',
                        required: true,
                        validator: (value, cb) => {
                          if (!value && teamNumMax) {
                            return cb(t`features_agent_invitation_v3_invitation_formfilter_v3_index_qcmiet2los`)
                          }
                          if (value > teamNumMax) {
                            return cb(t`features_agent_center_invite_his_personal_modal_index_vbsizo5ao_`)
                          }
                          return cb()
                        },
                      },
                    ]}
                  >
                    {/* 2 最大值 */}
                    <InputNumber
                      onKeyDown={handleKeyPress}
                      max={1000000}
                      precision={0}
                      min={0}
                      hideControl
                      placeholder={t`features_agent_agency_center_invitation_details_index_5101552`}
                    />
                  </FormItem>

                  <FormItem
                    field="teamNumMax"
                    rules={[
                      {
                        type: 'number',
                        required: true,
                        validator: (value, cb) => {
                          if (!value && teamNumMin) {
                            return cb(t`features_agent_invitation_v3_invitation_formfilter_v3_index_qcmiet2los`)
                          }
                          if (value < teamNumMin) {
                            return cb(t`features_agent_center_invite_his_personal_modal_index_lqut8anhet`)
                          }
                          return cb()
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      onKeyDown={handleKeyPress}
                      max={1000000}
                      min={0}
                      precision={0}
                      hideControl
                      placeholder={t`features_agent_agency_center_invitation_details_index_5101555`}
                    />
                  </FormItem>
                </Space>
              </FormItem>

              <FormItem className="arco-form-mrgin">
                <span className="arco-form-span">{t`features_agent_agency_center_invitation_details_index_5101540`}</span>
                <Space split={t`features/assets/saving/history-list/index-0`}>
                  <FormItem
                    field="startTime"
                    rules={[
                      {
                        required: true,
                        validator: (value, cb) => {
                          if (!value && endTime) {
                            return cb(t`features_agent_center_invite_his_personal_modal_index_w8_ag9zife`)
                          }
                          if (value > endTime) {
                            return cb(t`features_agent_center_invite_his_personal_modal_index_qsppqho8it`)
                          }
                          return cb()
                        },
                      },
                    ]}
                  >
                    <DatePicker disabledDate={setDisableDate} />
                  </FormItem>

                  <FormItem
                    field="endTime"
                    rules={[
                      {
                        required: true,
                        validator: (value, cb) => {
                          if (!value && startTime) {
                            return cb(t`features_agent_center_invite_his_personal_modal_index_w8_ag9zife`)
                          }
                          if (value < startTime) {
                            return cb(t`features_agent_center_invite_his_personal_modal_index_8gycb_wy18`)
                          }
                          return cb()
                        },
                      },
                    ]}
                  >
                    <DatePicker disabledDate={setDisableDate} />
                  </FormItem>
                </Space>
              </FormItem>

              <div className="btn pt-2">
                <Button className={'reset-btn'} type="secondary" onClick={onReset}>
                  {t`user.field.reuse_47`}
                </Button>
                <Button type="primary" htmlType="submit">
                  {t`order.search_button`}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default HisPersonalModal
