/**
 * 邀请详情 - 代理中心
 */
import { useEffect, useState } from 'react'
import { useRequest } from 'ahooks'
import { DatePicker, TableColumnProps, Form, Button, Space, Spin, Message } from '@nbit/arco'
import Table from '@/components/table'
import UserPopUp from '@/features/user/components/popup'
import { t } from '@lingui/macro'
import { DownloadFiles, HandleDisableEndDate } from '@/features/user/utils/common'
import { IsEmptyValidate, DateThanSizeValidate } from '@/features/user/utils/validate'
import { MinAndMaxTypeEnum } from '@/constants/user'
import dayjs from 'dayjs'
import Icon from '@/components/icon'
import Link from '@/components/link'
import { initInviteDetailForm, useAgentCenterStore } from '@/store/agent/agent-center/center'
import { IAgentCenterInviteDetailData } from '@/typings/api/agent/agent-center'
import { getTextFromStoreEnums } from '@/helper/store'
import { useAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import { getAgentCenterInviteeDetail, postAgentExportInviteDetail } from '@/apis/agent/agent-center'
import { getAgentHisInvitationPageRoutePath } from '@/helper/route/agent'
import { IPyramidInviteCodeRatios } from '@/typings/api/agent/agent-invite'
import {
  AgentModalTypeEnum,
  InviteDetailRegisterSortTypeEnum,
  InviteDetailSortEnum,
  getAgentLevelIconName,
  getInviteCertificationStatusTypeName,
} from '@/constants/agent/agent-center'
import { useCopyToClipboard } from 'react-use'
import { isDateIntervalValid } from '@/helper/agent/agent-center'
import NoDataImage from '@/components/no-data-image'
import classNames from 'classnames'
import { SorterResult } from '@nbit/arco/es/Table/interface'
import AssetsInputNumber from '@/features/assets/common/assets-input-number'
import styles from '../index.module.css'
import { SearchItem } from './search-form'
import PyramidRebateModal from '../../agent-invite/common/pyramid-rebate-modal'
import { DataEncrypt } from '../data-overview/data-encrypt'

function AgentCenterInviteDetails() {
  const { agentEnums, visiblePyramidRebateSetting, updateVisiblePyramidRebateSetting } = {
    ...useAgentInviteV3Store(),
  }
  const { currentModalTab, productLine, inviteDetail, inviteDetailForm, updateInviteDetail, updateInviteDetailForm } =
    { ...useAgentCenterStore() } || {}

  const [inviteFilterShow, setInviteFilterShow] = useState<boolean>(false)
  const [inviteCodeData, setInviteCodeData] = useState<IAgentCenterInviteDetailData>()
  const [inviteDetailData, setInviteDetailData] = useState<IAgentCenterInviteDetailData[]>([])
  const registerEndTime = dayjs().endOf('date').valueOf()
  const [form] = Form.useForm()
  const FormItem = Form.Item
  const minChildNumWatch = Form.useWatch('minChildNum', form)
  const maxChildNumWatch = Form.useWatch('maxChildNum', form)
  const registerStartTimeWatch = Form.useWatch('registerStartTime', form)
  const registerEndTimeWatchWatch = Form.useWatch('registerEndTime', form)

  /** 复制功能 */
  const [state, copyToClipboard] = useCopyToClipboard()
  const onCopy = (val: string) => {
    if (!val) return
    copyToClipboard(val)
    state.error
      ? Message.error(t`assets.financial-record.copyFailure`)
      : Message.success(t`assets.financial-record.copySuccess`)
  }

  /** todo 待后端提供接口 - 下载 Excel */
  const getInviteExcelUrl = async () => {
    const params = JSON.parse(JSON.stringify(inviteDetailForm))
    delete params?.pageNum
    delete params?.pageSize
    if (!params?.isRealName) delete params?.isRealName
    if (!params?.rebateLevel) delete params?.rebateLevel
    if (!params?.registerDateSort) delete params?.registerDateSort
    if (!params?.startTime) delete params?.startTime
    if (!params?.endTime) delete params?.endTime
    if (!params?.teamNumMin) delete params?.teamNumMin
    if (!params?.teamNumMax) delete params?.teamNumMax
    if (!params?.uid) delete params?.uid
    const res = await postAgentExportInviteDetail({ ...params, model: currentModalTab })
    if (res.isOk && res.data) {
      DownloadFiles(res.data)
    }
  }

  /**
   * 查询邀请详情
   */
  const onGetAgentCenterInviteDetail = async (searchParams?) => {
    const params = { ...inviteDetailForm, model: currentModalTab, ...searchParams }
    if (!params?.isRealName) delete params?.isRealName
    if (!params?.rebateLevel) delete params?.rebateLevel
    if (!params?.registerDateSort) delete params?.registerDateSort
    if (!params?.startTime) delete params?.startTime
    if (!params?.endTime) delete params?.endTime
    if (!params?.teamNumMin) delete params?.teamNumMin
    if (!params?.teamNumMax) delete params?.teamNumMax
    if (!params?.uid) delete params?.uid

    const res = await getAgentCenterInviteeDetail(params)
    const { isOk, data } = res || {}

    if (!isOk || !data) return
    updateInviteDetail(data)
    setInviteDetailData(data[`${currentModalTab}AgentInviteeList`] || [])
    updateInviteDetailForm({
      ...params,
    })
  }

  const { run: getInviteDetails, loading } = useRequest(onGetAgentCenterInviteDetail, { manual: true })
  const { run: dowLoadExcel, loading: exportLoading } = useRequest(getInviteExcelUrl, { manual: true })

  /** 重置弹窗 */
  const handlePopUpReset = () => {
    updateInviteDetailForm(initInviteDetailForm)
    form.resetFields()
  }

  /** 设置时间组件禁用时间 */
  const setDisableDate = (currentDate: dayjs.Dayjs) => HandleDisableEndDate(currentDate, registerEndTime)

  /** 处理分页 */
  const handlePaginationOnChange = (pageNum: number, pageSize: number) => {
    updateInviteDetailForm({ ...inviteDetailForm, pageNum, pageSize })
    getInviteDetails({ pageNum, pageSize })
  }

  const handleSubmit = values => {
    const submitStartTime = values.registerStartTime
      ? dayjs(values.registerStartTime).startOf('date').valueOf()
      : undefined
    const submitEndTime = values.registerEndTime ? dayjs(values.registerEndTime).endOf('date').valueOf() : undefined
    if (submitStartTime && submitEndTime) {
      if (!isDateIntervalValid(submitStartTime, submitEndTime)) {
        return Message.error(t`features_agent_center_invite_his_personal_modal_index_xmq5nsydjo`)
      }
    }

    const options = {
      teamNumMin: values.minChildNum,
      teamNumMax: form.getFieldValue('maxChildNum'),
      startTime: submitStartTime,
      endTime: submitEndTime,
    }

    getInviteDetails(options)
    setInviteFilterShow(false)
  }

  const onSearch = searchParams => {
    getInviteDetails(searchParams)
  }

  useEffect(() => {
    if (!currentModalTab) return
    form.clearFields()
    updateInviteDetailForm({ ...inviteDetailForm, model: currentModalTab })
    getInviteDetails()
  }, [currentModalTab])

  const getInviteColumns = () => {
    let columns: TableColumnProps[] = []
    const userInfoColumns: TableColumnProps[] = [
      {
        title: t`user.account_security.modify_username_04`,
        fixed: 'left',
        ellipsis: true,
        dataIndex: 'nickName',
        render: (_, record: IAgentCenterInviteDetailData) => {
          return (
            <div className="invite-info">
              <div className="info-avatar">{record?.nickName?.match(/^.{1}/)?.[0] || '--'}</div>
              <div className="info-nickname">{record?.nickName}</div>
            </div>
          )
        },
      },
      {
        title: 'UID',
        dataIndex: 'uid',
        align: 'right',
        render: (_, record: IAgentCenterInviteDetailData) => {
          return (
            <div className="info-nickname">
              <DataEncrypt content={<span>{record?.uid}</span>} />

              <Icon
                name="icon_agent_invite_copy"
                hasTheme
                className="text-base ml-2"
                onClick={() => onCopy(record?.uid || '')}
              />
            </div>
          )
        },
      },
      {
        title: t`features_agent_agency_center_invitation_details_index_5101536`,
        dataIndex: 'kycStatus',
        align: 'right',
        render: (_, record) => {
          return (
            <label>
              {record.isRealName ? getInviteCertificationStatusTypeName()[Number(record.isRealName)] : '--'}
            </label>
          )
        },
      },
      {
        title: t`constants_agent_agent_jkly4smzop`,
        dataIndex: 'inviteNum',
        align: 'right',
        width: 130,
        sorter: inviteDetailData?.length > 0,
        // sorter: (a, b) => Number(a.inviteNum) - Number(b.inviteNum),
        render: (_, record: IAgentCenterInviteDetailData) => {
          return <DataEncrypt content={<div>{record?.inviteNum}</div>} />
        },
      },
    ]
    const teamColumns: TableColumnProps[] = [
      {
        title: t`features_agent_agency_center_invitation_details_index_qfbw6m22wx`,
        dataIndex: 'teamNum',
        align: 'right',
        sorter: inviteDetailData?.length > 0,
        render: (_, record: IAgentCenterInviteDetailData) => {
          return <DataEncrypt content={<div>{record?.teamNum}</div>} />
        },
      },
    ]
    const optColumns: TableColumnProps[] = [
      {
        title: t`features_agent_agency_center_invitation_details_index_5101541`,
        dataIndex: 'registerDate',
        align: 'right',
        sorter: inviteDetailData?.length > 0,
        // sorter: (a, b) => dayjs(a.registerDate).valueOf() - dayjs(b.registerDate).valueOf(),
        render: (_, record) => {
          return <label>{dayjs(record.registerDate).format('YYYY-MM-DD HH:mm:ss')}</label>
        },
      },
      {
        title: t`order.columns.action`,
        fixed: 'right',
        align: 'right',
        render: (_, record) => (
          <>
            {currentModalTab === AgentModalTypeEnum.pyramid && (
              <Button
                className="mr-4"
                type="text"
                size="mini"
                style={{ padding: 0 }}
                onClick={() => {
                  setInviteCodeData(record)
                  updateVisiblePyramidRebateSetting(true)
                }}
              >{t`features_agent_agency_center_invitation_details_index_s0le3rujwh`}</Button>
            )}
            <Link href={getAgentHisInvitationPageRoutePath(currentModalTab, record.uid)}>
              <Button
                type="text"
                size="mini"
                style={{ padding: 0 }}
              >{t`features_agent_center_invite_index_nfg2f8pgsn`}</Button>
            </Link>
          </>
        ),
      },
    ]

    switch (currentModalTab) {
      case AgentModalTypeEnum.area:
        const areaRebateColumns: TableColumnProps[] = [
          {
            title: t`features_agent_agent_center_invite_details_index_4odgu7wyac`,
            dataIndex: 'rebateRatio',
            align: 'right',
            render: (_, record: IAgentCenterInviteDetailData) => {
              return (
                <DataEncrypt
                  content={
                    <div className="model-grade">
                      <Icon className="my-grade" name={getAgentLevelIconName(record?.rebateLevel || 1) || ''} />
                      <div className="ratio-info">{record?.rebateRatio}%</div>
                    </div>
                  }
                />
              )
            },
          },
        ]
        columns = [...userInfoColumns, ...teamColumns, ...areaRebateColumns, ...optColumns]
        break
      case AgentModalTypeEnum.pyramid:
        const pyramidProductColumns: TableColumnProps[] = productLine?.map(productCd => {
          return {
            title: t({
              id: 'features_agent_agent_center_invite_details_index_kuj9fqwv8k',
              values: { 0: getTextFromStoreEnums(productCd || '', agentEnums.agentProductCdRatioEnum.enums) },
            }),
            align: 'right',
            render: (_, record: IAgentCenterInviteDetailData) => {
              const currentProduct = record?.productRebateList?.find(x => x?.productCd === productCd)
              return (
                <DataEncrypt
                  content={
                    <div>
                      {t`features_agent_agency_center_invitation_details_index_5101545`}
                      <span className="px-1">{currentProduct?.selfRatio}%</span>/ {t`features_agent_index_5101357`}
                      <span className="pl-1">{currentProduct?.childRatio}%</span>
                    </div>
                  }
                />
              )
            },
          }
        })
        columns = [...userInfoColumns, ...teamColumns, ...pyramidProductColumns, ...optColumns]
        break
      case AgentModalTypeEnum.threeLevel:
        columns = [...userInfoColumns, ...optColumns]
        break

      default:
    }
    return columns
  }

  return (
    <>
      <div className="agent-center-title" id="invitation-details">
        <Icon name="icon_agency_center_invite" hasTheme />
        <label>{t`features_agent_agent_center_invite_details_index_t_kekasxh8`}</label>
        <Link href={getAgentHisInvitationPageRoutePath(currentModalTab)} className="text-brand_color ml-3">
          {t`common.all`}
          <Icon name="transaction_arrow_hover" className="more-icon" />
        </Link>
      </div>

      <div className="agent-center-container">
        <div className="container-tabs">
          <SearchItem onSearch={onSearch} />
          <div>
            <Icon
              className="more-search"
              name="asset_record_filter"
              hasTheme
              onClick={() => setInviteFilterShow(true)}
              hover
            />
          </div>
        </div>

        <Table
          fitByContent
          autoWidth
          minWidthWithColumn={false}
          className={styles['invitation-details-table-style']}
          columns={getInviteColumns()}
          data={inviteDetailData}
          rowKey={record => `${record?.uid || ''}`}
          border={false}
          style={{ minHeight: 260 }}
          loading={loading}
          scroll={{
            y: 400,
          }}
          placeholder="-"
          pagination={
            inviteDetailData?.length > 0 &&
            inviteDetail?.total &&
            inviteDetail?.total > Number(inviteDetailForm?.pageSize)
              ? {
                  current: inviteDetailForm.pageNum,
                  total: inviteDetail?.total || 1,
                  pageSize: inviteDetailForm.pageSize,
                  onChange: handlePaginationOnChange,
                }
              : false
          }
          onChange={(_, _sorter: SorterResult) => {
            // 触发翻页时直接返回
            if (_?.current !== inviteDetailForm?.pageNum || _?.pageSize !== inviteDetailForm?.pageSize) {
              return
            }

            let sortData = { registerDateSort: 0, sort: 0 }
            if (!_sorter.direction) {
              getInviteDetails(sortData)
              return
            }

            switch (_sorter.field) {
              case 'registerDate':
                sortData.sort = InviteDetailSortEnum.registerDateSort
                break
              case 'inviteNum':
                sortData.sort = InviteDetailSortEnum.inviteNum
                break
              case 'teamNum':
                sortData.sort = InviteDetailSortEnum.teamNum
                break
              default:
                sortData.sort = InviteDetailSortEnum.default
                return
            }

            getInviteDetails({
              registerDateSort:
                _sorter.direction === 'descend'
                  ? InviteDetailRegisterSortTypeEnum.inverted
                  : InviteDetailRegisterSortTypeEnum.just,
              sort: sortData.sort,
            })
          }}
          noDataElement={<NoDataImage size="h-24 w-28" className={classNames({ invisible: loading })} />}
        />

        <div className="export">
          <div className="tips">
            <label>{t`features_agent_agency_center_invitation_details_index_5101564`}</label>
          </div>
          <div className="export-btn">
            {exportLoading ? (
              <Spin dot />
            ) : (
              <div className="btn" onClick={dowLoadExcel}>
                <Icon name="rebates_export" />
                <label>{t`features_agent_agency_center_revenue_details_index_5101525`}</label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 金字塔返佣比例设置弹窗 */}
      {visiblePyramidRebateSetting && (
        <PyramidRebateModal
          uid={String(inviteCodeData?.uid)}
          productList={(inviteCodeData?.productRebateList as IPyramidInviteCodeRatios[]) || []}
          visible={visiblePyramidRebateSetting}
          setVisible={updateVisiblePyramidRebateSetting}
          onCallback={onGetAgentCenterInviteDetail}
        />
      )}

      <UserPopUp
        title={<div style={{ textAlign: 'left' }}>{t`assets.financial-record.search.search`}</div>}
        className={`user-popup ${styles['agent-form-popup']}`}
        maskClosable={false}
        visible={inviteFilterShow}
        autoFocus={false}
        closeIcon={<Icon name="close" hasTheme />}
        onCancel={() => setInviteFilterShow(false)}
        footer={null}
      >
        <div className={`invite-wrap ${styles['agent-form']}`}>
          <Form form={form} layout="vertical" onSubmit={handleSubmit} autoComplete="off" validateTrigger="onSubmit">
            <FormItem
              label={
                currentModalTab === AgentModalTypeEnum.threeLevel
                  ? t`features_agent_agency_center_data_overview_index_5101508`
                  : t`features_agent_agency_center_data_overview_index_o2y6ibxmqh`
              }
            >
              <Space split={t`features/assets/saving/history-list/index-0`} align="start">
                <FormItem
                  field="minChildNum"
                  rules={[
                    {
                      type: 'number',
                      required: true,
                      validator: (value, cb) => {
                        if (value === undefined && maxChildNumWatch) {
                          return cb(t`features_agent_invitation_v3_invitation_formfilter_v3_index_qcmiet2los`)
                        }
                        if (value > maxChildNumWatch) {
                          return cb(t`features_agent_center_invite_his_personal_modal_index_vbsizo5ao_`)
                        }
                        return cb()
                      },
                    },
                  ]}
                >
                  <AssetsInputNumber
                    precision={0}
                    placeholder={t`features_agent_agency_center_invitation_details_index_5101552`}
                    hideControl
                  />
                </FormItem>

                <FormItem
                  field="maxChildNum"
                  rules={[
                    IsEmptyValidate(
                      minChildNumWatch,
                      t`features_agent_invitation_v3_invitation_formfilter_v3_index_qcmiet2los`
                    ),
                  ]}
                >
                  <AssetsInputNumber
                    precision={0}
                    placeholder={t`features_agent_agency_center_invitation_details_index_5101555`}
                    hideControl
                  />
                </FormItem>
              </Space>
            </FormItem>

            <FormItem label={t`features_agent_agency_center_invitation_details_index_5101540`}>
              <Space split={t`features/assets/saving/history-list/index-0`} align="start">
                <FormItem
                  field="registerStartTime"
                  rules={[
                    IsEmptyValidate(
                      registerEndTimeWatchWatch,
                      t`features_agent_agency_center_invitation_details_index_5101562`
                    ),
                    DateThanSizeValidate(
                      registerEndTimeWatchWatch,
                      MinAndMaxTypeEnum.max,
                      t`features_agent_agency_center_invitation_details_index_5101598`
                    ),
                  ]}
                >
                  <DatePicker
                    placeholder={t`features_agent_agency_center_revenue_details_index_5101527`}
                    disabledDate={setDisableDate}
                  />
                </FormItem>

                <FormItem
                  field="registerEndTime"
                  rules={[
                    IsEmptyValidate(
                      registerStartTimeWatch,
                      t`features_agent_agency_center_invitation_details_index_5101563`
                    ),
                  ]}
                >
                  <DatePicker
                    placeholder={t`features_agent_agency_center_revenue_details_index_5101527`}
                    disabledDate={setDisableDate}
                  />
                </FormItem>
              </Space>
            </FormItem>

            <div className="btn">
              <Button type="default" onClick={handlePopUpReset}>{t`user.field.reuse_47`}</Button>
              <Button
                loading={loading}
                type="primary"
                htmlType="submit"
              >{t`features_agent_agency_center_revenue_details_index_5101533`}</Button>
            </div>
          </Form>
        </div>
      </UserPopUp>
    </>
  )
}

export default AgentCenterInviteDetails
