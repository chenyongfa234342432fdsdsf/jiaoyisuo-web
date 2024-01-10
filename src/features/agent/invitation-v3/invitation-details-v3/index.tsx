import { useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import { Button, PaginationProps, Form, Space, Spin, InputNumber, DatePicker, Message } from '@nbit/arco'
import Table from '@/components/table'
import UserPopUp from '@/features/user/components/popup'
import Icon from '@/components/icon'
import { t } from '@lingui/macro'
import { usePageContext } from '@/hooks/use-page-context'
import { useAgentInviteStore } from '@/store/agent/agent-invite'
import { getInviteDetailsTableColumnSchema } from '@/features/agent/invitation-v3/invitation-details-v3/table-schema'
import { DownloadFiles, HandleDisableEndDate } from '@/features/user/utils/common'
import { getDefaultLast30DaysStartAndEnd, getInviteDetailsUidTypes } from '@/constants/agent/agent-invite'
import { AgentModalTypeEnum } from '@/constants/agent/agent-center'
import { IsEmptyValidate, ThanSizeEqualValidate } from '@/features/user/utils/validate'
import { MinAndMaxTypeEnum } from '@/constants/user'
import { getAgentSystemExportMoreDetail, getAgentCenterWebSetMoreDetail } from '@/apis/agent/agent-center/userDetails'
import { useUnmount } from 'ahooks'
import { isHidePagination } from '@/helper/agent/invite'
import NoDataImage from '@/components/no-data-image'
import dayjs from 'dayjs'
import { YapiPostV2AgentInviteHistoryApiRequestReal } from '@/typings/api/agent-old/invite'
import {
  areaAgentUserDetailListType,
  pyramidAgentUserDetailListType,
  thirdLevelUserDetailListType,
} from '@/typings/api/agent/agent-center/user'
import classNames from 'classnames'
import { getUserInfo } from '@/helper/cache'
import AssetsTable from '@/features/assets/common/assets-table'
import styles from '../index.module.css'

const FormItem = Form.Item

function InvitationDetailsV3(props, ref) {
  let rowKey = 1
  const [tertiaryAgent, setTertiaryAgent] = useState(1) // 三级代理层级变量
  const pageCtx = usePageContext()
  const optionList = getInviteDetailsUidTypes()
  const store = useAgentInviteStore()
  const { uid } = getUserInfo()
  const [uidList, setUidList] = useState<Array<number | string>>([]) // 返回上层集合数据
  store.hooks.useGetContractStatusCode()
  const rootUid = pageCtx.routeParams?.id
  const filterForm = store.filterSettingCheckMoreV2
  const setFilterForm = store.setFilterSettingCheckMoreV2
  const [list, setList] = useState<
    Array<areaAgentUserDetailListType | pyramidAgentUserDetailListType | thirdLevelUserDetailListType>
  >([]) // 表格数据
  const [isLoading, setIsLoading] = useState(false)

  const [selectedStates, setSelectedState] = useState<YapiPostV2AgentInviteHistoryApiRequestReal[]>([])
  const [page, setPage] = useState({
    total: 0,
    current: 1,
    showTotal: true,
    showJumper: true,
    sizeCanChange: true,
    hideOnSinglePage: false,
    pageSize: 20,
  })
  const [defaultDate, setDefaultDate] = useState(props.defaultDate)
  const [controlledForm, setControlledFormState] = useState<{ startDate: string | number; endDate: string | number }>({
    ...getDefaultLast30DaysStartAndEnd(),
  })
  const [currencySymbol, setCurrencySymbol] = useState<string>('')
  function setControlledForm(state) {
    setControlledFormState(prev => {
      return {
        ...prev,
        ...state,
      }
    })
  }

  function setSelectedStatesPop() {
    const lastState = selectedStates[selectedStates.length - 1]
    setSelectedState(prev => {
      return prev.slice(0, prev.length - 1)
    })
    return lastState
  }

  function setSelectedStatesPush(toBeSavedState) {
    const storedState = selectedStates[selectedStates.length - 1]

    if (storedState?.targetUid === toBeSavedState.targetUid) return
    if (storedState && filterForm.targetUid === toBeSavedState.targetUid) return

    setSelectedState(prev => {
      return [...prev, toBeSavedState]
    })
  }

  /**
   * 返回上一层事件
   */
  const getUpperState = () => {
    let parentList = uidList
    if (props.filterNum === AgentModalTypeEnum.threeLevel) {
      setTertiaryAgent(val => (val -= 1))
    }
    parentList.pop()
    setUidList(parentList)
    props.onInquireTable({
      ...props.defaultParameters,
      parentUid: parentList[parentList.length - 1],
      uid: parentList[parentList.length - 1],
      queryUidType: parentList.length > 0 ? optionList[1].value : optionList[0].value,
    })
  }

  useUnmount(() => {
    store.resetFilterSettingCheckMoreV2()
  })

  function resetForm() {
    form.resetFields()
    setControlledForm(getDefaultLast30DaysStartAndEnd())
  }

  const [form] = Form.useForm()
  const minTotalRebate = Form.useWatch('minTotalRebate', form)
  const maxTotalRebate = Form.useWatch('maxTotalRebate', form)
  const minRebateRatio = Form.useWatch('minRebateRatio', form)
  const maxRebateRatio = Form.useWatch('maxRebateRatio', form)

  const [inviteFilterShow, setInviteFilterShow] = useState<boolean>(false)
  const [exportLoading, setExportLoading] = useState<boolean>(false)

  useUnmount(() => {
    store.resetFilterSettingCheckMoreV2()
  })

  /** 下载 Excel */
  const handleExportExcel = async () => {
    setExportLoading(true)
    const res = await getAgentSystemExportMoreDetail({
      ...props.defaultDate,
      isChildUid: props.defaultDate.isChildUid ? 1 : 2,
      productCd: props.defaultDate.productCd || null,
      areaLevel: props.defaultDate.areaLevel || null,
      model: props.filterNum,
    })
    if (res.isOk && res.data) {
      DownloadFiles(res.data)
    }
    setExportLoading(false)
  }

  /** 设置时间组件禁用时间 */
  const setDisableDate = (currentDate: dayjs.Dayjs) => {
    const endTime = dayjs().endOf('date').valueOf()
    return HandleDisableEndDate(currentDate, endTime)
  }

  /**
   * 获取表格数据
   */
  const getCenterWebSetMoreDetail = async () => {
    setList([])
    setIsLoading(true)
    const res = await getAgentCenterWebSetMoreDetail({
      ...props.defaultDate,
      isChildUid: props.defaultDate.isChildUid ? 1 : 2,
      productCd: props.defaultDate.productCd || null,
      areaLevel: props.defaultDate.areaLevel || null,
      model: props.filterNum,
    })
    if (res.isOk && res.data) {
      const dataVal =
        res.data?.areaAgentUserDetailList ||
        res.data?.pyramidAgentUserDetailList ||
        res.data?.threeLevelUserDetailList ||
        []
      setList(dataVal)
      setPage(prev => {
        return {
          ...prev,
          total: res.data?.total || 0,
        }
      })
      setCurrencySymbol(res.data?.currencySymbol || '')
    }
    setIsLoading(false)
  }

  /**
   * 分页事件
   */
  const onChangeTable = async (_page: PaginationProps) => {
    const selectedPageSize = Number(_page.pageSize)
    const selectedPage = Number(_page.current)

    setPage(prev => {
      props.onInquireTable({
        ...props.defaultParameters,
        pageSize: selectedPageSize,
        pageNum: selectedPage,
      })
      return {
        ...prev,
        pageSize: selectedPageSize,
        current: selectedPage,
      }
    })
  }

  useImperativeHandle(ref, () => {
    return {
      onCenterWebSetMoreDetail: () => {
        getCenterWebSetMoreDetail()
      },
      onCenterPage: () => {
        setPage(prev => {
          return {
            ...prev,
            current: 1,
            pageSize: 20,
          }
        })
      },
      onEmptyIdCollection: () => {
        setUidList([])
        setTertiaryAgent(1)
      },
    }
  })

  /**
   * 用户 UID 筛选事件
   */
  const onDrillDownEvents = selectedUid => {
    if (props.filterNum === AgentModalTypeEnum.threeLevel) {
      setTertiaryAgent(val => (val += 1))
    }
    setUidList(val => {
      const data = [...val]
      if (!data.includes(selectedUid)) {
        data.push(selectedUid)
      }
      return data
    })
    props.onInquireTable({
      ...props.defaultParameters,
      uid: selectedUid,
      queryUidType: optionList[1].value,
      parentUid: selectedUid,
    })
  }

  /**
   * 上级 UID 事件
   */
  const onSelectedStatesEven = ppuid => {
    props.onInquireTable({
      ...props.defaultParameters,
      parentUid: ppuid,
      queryUidType: optionList[0].value,
    })
  }

  /**
   * 上一级按钮显隐方法
   * */
  const buttonConcealmentMethod = () => {
    if (props.filterNum === AgentModalTypeEnum.threeLevel && tertiaryAgent === 3) {
      return true
    }
    return uidList.length > 0 && String(list[0]?.parentUid) !== uid
  }

  useEffect(() => {
    if (props.filterNum) {
      setPage(val => {
        const pageData = { ...val, current: props.defaultDate.pageNum, pageSize: props.defaultDate.pageSize }
        return pageData
      })
      getCenterWebSetMoreDetail()
    }
  }, [props.defaultDate])
  function FilterRow() {
    return <div></div>
  }

  return (
    <section className={`invitation-details-wrapper ${styles.scoped}`}>
      <div className={`flex gap-8 invite-wrap ${styles['agent-form']}`}>{<FilterRow />}</div>

      <div
        className={classNames('invitation-table-body', {
          'arco-table-body-full': true,
          'auto-width': true,
        })}
        style={{ height: 700 }}
      >
        <AssetsTable
          className="list"
          fitByContent
          autoWidth
          rowKey={record => `withdraw_fee_list_${record?.nickName}${(rowKey += 1)}`}
          columns={getInviteDetailsTableColumnSchema(
            store,
            onDrillDownEvents,
            onSelectedStatesEven,
            props,
            tertiaryAgent,
            currencySymbol
          )}
          data={list || []}
          loading={isLoading}
          showSorterTooltip={false}
          pagination={page}
          onChange={_page => onChangeTable(_page)}
          renderPagination={paginationNode => {
            if (isHidePagination(page)) return null

            return (
              <div className="table-pagination">
                <div>{paginationNode}</div>
                <div className="table-pagination-extra">{t`features_agent_manage_index_5101442`}</div>
              </div>
            )
          }}
          noDataElement={
            isLoading === false && list.length === 0 ? (
              <NoDataImage size="h-24 w-28" footerText={t`trade.c2c.noData`} />
            ) : (
              <div></div>
            )
          }
        />

        {/* 列表值 parentUid 为当前用户 UID 时不显示此按钮 */}
        {buttonConcealmentMethod() && (
          <div className="return-button-wrapper">
            <span
              className="return-button"
              onClick={getUpperState}
            >{t`features_agent_invitation_v2_invitation_details_v2_index_ypqa88q7dl`}</span>
          </div>
        )}
      </div>

      <div className="invitation-tips">
        <div>
          <p>*{t`features_agent_invitation_index_5101585`}</p>
        </div>
        <div className="out">
          {exportLoading ? (
            <Spin dot />
          ) : (
            <div className="btn cursor-pointer" onClick={handleExportExcel}>
              <Icon name="rebates_export" />
              <label className="cursor-pointer pl-2">{t`features_agent_agency_center_revenue_details_index_5101525`}</label>
            </div>
          )}
        </div>
      </div>

      <UserPopUp
        title={<div style={{ textAlign: 'left' }}>{t`assets.financial-record.search.search`}</div>}
        className="user-popup"
        maskClosable={false}
        visible={inviteFilterShow}
        closeIcon={<Icon name="close" hasTheme />}
        onCancel={() => setInviteFilterShow(false)}
        footer={null}
      >
        <div className={`invite-wrap ${styles['agent-form']}`}>
          <Form form={form} layout="vertical" autoComplete="off" validateTrigger="onBlur" initialValues={{}}>
            <FormItem>
              <Space split={t`features/assets/saving/history-list/index-0`}>
                <FormItem>
                  <DatePicker
                    value={controlledForm.startDate}
                    onChange={val => {
                      setControlledForm({ startDate: val })
                    }}
                  />
                </FormItem>

                <FormItem>
                  <DatePicker
                    value={controlledForm.endDate}
                    onChange={val => {
                      setControlledForm({ endDate: val })
                    }}
                  />
                </FormItem>
              </Space>
            </FormItem>

            <FormItem>
              <Space split={t`features/assets/saving/history-list/index-0`}>
                <FormItem
                  field="minTotalRebate"
                  rules={[
                    IsEmptyValidate(minTotalRebate, t`features_agent_invitation_index_5101603`),
                    ThanSizeEqualValidate(
                      maxTotalRebate,
                      MinAndMaxTypeEnum.max,
                      t`features_agent_invitation_index_5101604`
                    ),
                  ]}
                >
                  <InputNumber
                    max={1000000}
                    precision={0}
                    min={0}
                    hideControl
                    placeholder={t`features_agent_invitation_v2_invitation_details_v2_index_ujrdqlxzji`}
                  />
                </FormItem>

                <FormItem
                  field="maxTotalRebate"
                  rules={[IsEmptyValidate(maxTotalRebate, t`features_agent_invitation_index_5101605`)]}
                >
                  <InputNumber
                    max={1000000}
                    min={0}
                    precision={0}
                    hideControl
                    placeholder={t`features_agent_invitation_v2_invitation_details_v2_index_gd34quoabk`}
                  />
                </FormItem>
              </Space>
            </FormItem>

            <FormItem>
              <Space split={t`features/assets/saving/history-list/index-0`}>
                <FormItem
                  field="minRebateRatio"
                  rules={[
                    IsEmptyValidate(minRebateRatio, t`features_agent_invitation_index_5101603`),
                    ThanSizeEqualValidate(
                      maxRebateRatio,
                      MinAndMaxTypeEnum.max,
                      t`features_agent_invitation_index_5101604`
                    ),
                  ]}
                >
                  <InputNumber
                    precision={0}
                    max={100}
                    min={0}
                    hideControl
                    placeholder={t`features_agent_invitation_v2_invitation_details_v2_index_xesy5dkru0`}
                    suffix="%"
                  />
                </FormItem>

                <FormItem
                  field="maxRebateRatio"
                  rules={[IsEmptyValidate(maxRebateRatio, t`features_agent_invitation_index_5101605`)]}
                >
                  <InputNumber
                    max={100}
                    min={0}
                    precision={0}
                    hideControl
                    placeholder={t`features_agent_invitation_v2_invitation_details_v2_index_fqzbxopfya`}
                    suffix="%"
                  />
                </FormItem>
              </Space>
            </FormItem>

            <div className="btn pt-2">
              <Button className={'reset-btn'} type="secondary" onClick={resetForm}>{t`user.field.reuse_47`}</Button>
              <Button
                type="primary"
                htmlType="submit"
                onClick={() => {
                  form
                    .validate()
                    .then(() => {
                      if (dayjs(controlledForm.endDate).isBefore(dayjs(controlledForm.startDate))) {
                        Message.warning(t`features_agent_agency_center_invitation_details_index_5101598`)
                        return
                      }

                      const formValue = form.getFieldsValue()
                      setFilterForm({
                        ...formValue,
                        ...controlledForm,
                      })
                      setInviteFilterShow(false)
                    })
                    .catch(e => {})
                }}
              >{t`order.search_button`}</Button>
            </div>
          </Form>
        </div>
      </UserPopUp>
    </section>
  )
}

export default forwardRef(InvitationDetailsV3)
