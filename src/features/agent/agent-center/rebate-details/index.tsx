/**
 * 返佣详情 - 代理中心
 */
import { useEffect, useState } from 'react'
import { useRequest } from 'ahooks'
import { TableColumnProps, Form, Spin, Tooltip } from '@nbit/arco'
import { t } from '@lingui/macro'
import { DownloadFiles } from '@/features/user/utils/common'
import { formatCurrency, formatNumberDecimal } from '@/helper/decimal'
import dayjs from 'dayjs'
import Icon from '@/components/icon'
import { useAgentCenterStore } from '@/store/agent/agent-center/center'
import { IAgentCenterRebateDetailData } from '@/typings/api/agent/agent-center'
import { getTextFromStoreEnums } from '@/helper/store'
import { useAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import { getAgentCenterEarningsDetail, postAgentExportEarningsDetail } from '@/apis/agent/agent-center'
import {
  AgentModalTypeEnum,
  InviteDetailRegisterSortTypeEnum,
  RebateDetailSortEnum,
  RebateTypeCdEnum,
} from '@/constants/agent/agent-center'
import NoDataImage from '@/components/no-data-image'
import classNames from 'classnames'
import { SorterResult } from '@nbit/arco/es/Table/interface'
import { getUUId } from '@/helper/common'
import Table from '@/components/table'
import { SearchItem } from './search-form'
import styles from '../index.module.css'
import { DataEncrypt } from '../data-overview/data-encrypt'

function AgentCenterRebateDetails() {
  const { overviewParams, currentModalTab, rebateData, rebateDetailForm, updateRebateData, updateRebateDetailForm } =
    { ...useAgentCenterStore() } || {}
  const { agentEnums } = useAgentInviteV3Store() || {}
  const [rebateDetailData, setRebateDetailData] = useState<IAgentCenterRebateDetailData[]>([])
  const getRebateColumns = () => {
    let columns: TableColumnProps[] = []
    let teamRebateRatioRules = { text: '', example: '' }
    switch (currentModalTab) {
      case AgentModalTypeEnum.area:
        teamRebateRatioRules = {
          text: t`features_agent_agent_center_rebate_details_index_tcvbk7z1er`,
          example: t`features_agent_agent_center_rebate_details_index_xxzrjev98y`,
        }
        break
      case AgentModalTypeEnum.pyramid:
        teamRebateRatioRules = {
          text: t`features_agent_agent_center_rebate_details_index_70jtfax2y8`,
          example: t`features_agent_agent_center_rebate_details_index_symbq39gjh`,
        }
        break
      case AgentModalTypeEnum.threeLevel:
        teamRebateRatioRules = {
          text: t`features_agent_agent_center_rebate_details_index_mch3aalohv`,
          example: t`features_agent_agent_center_rebate_details_index_potmp9gau_`,
        }
        break
      default:
    }
    const productColumns: TableColumnProps[] = [
      {
        title: t`features_agent_agency_center_revenue_details_index_1jodtr2ubj`,
        dataIndex: 'productCd',
        render: (_, record: IAgentCenterRebateDetailData) => {
          return (
            <label>{getTextFromStoreEnums(record?.productCd || '', agentEnums.agentProductCdRatioEnum.enums)}</label>
          )
        },
      },
      {
        title: t`features_agent_agent_center_rebate_details_index_sce5xrqtqu`,
        dataIndex: 'rebateDate',
        align: 'right',
        sorter: rebateDetailData?.length > 0,
        // sorter: (a, b) => dayjs(a.rebateDate).valueOf() - dayjs(b.rebateDate).valueOf(),
        render: (_, record) => {
          return <label>{record.rebateDate && dayjs(record.rebateDate).format('YYYY-MM-DD HH:mm:ss')}</label>
        },
      },
    ]
    const uidColumns: TableColumnProps[] = [
      {
        title: t`features_agent_agent_center_rebate_details_index_kyddgt_6rc`,
        dataIndex: 'childUid',
        align: 'right',
        render: (_, record: IAgentCenterRebateDetailData) => {
          return (
            <div>
              {record?.rebateType === RebateTypeCdEnum.selfRebate ? (
                <label>--</label>
              ) : (
                <DataEncrypt content={<label>{record?.childUid}</label>} />
              )}
            </div>
          )
        },
      },
    ]
    const rebateTypeColumns: TableColumnProps[] = [
      {
        title: t`features_agent_agency_center_revenue_details_index_5101515`,
        dataIndex: 'rebateType',
        align: 'right',
        render: (_, record: IAgentCenterRebateDetailData) => {
          return (
            <label>{getTextFromStoreEnums(record?.rebateType || '', agentEnums.agentRebateTypeCdEnum.enums)}</label>
          )
        },
      },
    ]
    const teamFeeColumns: TableColumnProps[] = [
      {
        title: t`features_agent_agent_center_data_overview_index_jqjpafwdsi`,
        dataIndex: 'teamFee',
        align: 'right',
        sorter: rebateDetailData?.length > 0,
        // sorter: (a, b) => Number(a.teamFee) - Number(b.teamFee),
        render: (_, record: IAgentCenterRebateDetailData) => {
          return (
            <DataEncrypt
              content={
                <label>
                  {formatCurrency(record?.teamFee, record?.currencyOffset || 2, false)} {record?.symbol}
                </label>
              }
            />
          )
        },
      },
    ]
    const amountColumns: TableColumnProps[] = [
      {
        title: t`features_agent_agency_center_revenue_details_index_5101522`,
        dataIndex: 'amount',
        align: 'right',
        fixed: 'right',
        sorter: rebateDetailData?.length > 0,
        // sorter: (a, b) => Number(a.amount) - Number(b.amount),
        render: (_, record: IAgentCenterRebateDetailData) => {
          return (
            <DataEncrypt
              content={
                <div>
                  {Number(formatNumberDecimal(record?.amount, record?.currencyOffset || 2)) > 0 && '+'}
                  {formatCurrency(record?.amount, record?.currencyOffset || 2, false)} {record?.symbol}
                </div>
              }
            />
          )
        },
      },
    ]

    const rebateRatio: TableColumnProps[] = [
      {
        title: (
          <div>
            {t`features_agent_agent_center_invite_details_index_j_ch3rcxgh`}
            <Tooltip
              content={
                <div className="tips-wrap">
                  {teamRebateRatioRules.text}
                  <br />
                  {teamRebateRatioRules.example}
                </div>
              }
            >
              <span>
                <Icon className="ml-1" name="msg" hasTheme />
              </span>
            </Tooltip>
          </div>
        ),
        align: 'right',
        render: (_, record: IAgentCenterRebateDetailData) => {
          return <DataEncrypt content={<div>{record?.ratioActual}%</div>} />
        },
      },
    ]
    switch (currentModalTab) {
      case AgentModalTypeEnum.area:
        const levelRatio: TableColumnProps[] = [
          {
            title: t`features_agent_center_invite_his_invitation_personal_index_fvls7t5zuu`,
            align: 'right',
            render: (_, record: IAgentCenterRebateDetailData) => {
              return (
                <DataEncrypt
                  content={
                    <label>
                      {record?.rebateType === RebateTypeCdEnum.selfRebate
                        ? '--'
                        : `V${record?.rebateLevel} / ${Number(record?.rebateRatio)}%`}
                    </label>
                  }
                />
              )
            },
          },
        ]
        columns = [
          ...productColumns,
          ...rebateTypeColumns,
          ...uidColumns,
          ...teamFeeColumns,
          ...levelRatio,
          ...rebateRatio,
          ...amountColumns,
        ]
        break
      case AgentModalTypeEnum.pyramid:
        columns = [
          ...productColumns,
          ...rebateTypeColumns,
          ...uidColumns,
          ...teamFeeColumns,
          ...rebateRatio,
          ...amountColumns,
        ]
        break
      case AgentModalTypeEnum.threeLevel:
        const threeLevelRatio: TableColumnProps[] = [
          {
            title: t`features_agent_agent_center_rebate_details_index_ojyh676m67`,
            align: 'right',
            dataIndex: 'fee',
            sorter: rebateDetailData?.length > 0,
            render: (_, record: IAgentCenterRebateDetailData) => {
              return (
                <DataEncrypt
                  content={
                    <label>
                      {formatCurrency(record?.fee, record?.currencyOffset || 2, false)} {record?.symbol}
                    </label>
                  }
                />
              )
            },
          },
          {
            title: t`features_agent_agent_center_rebate_details_index_ygdlsw2n4k`,
            align: 'right',
            render: (_, record: IAgentCenterRebateDetailData) => {
              return (
                <DataEncrypt
                  content={
                    <label>
                      {record?.rebateLevel}
                      {t`features_agent_agent_center_rebate_details_index_lua3arq5gd`}
                    </label>
                  }
                />
              )
            },
          },
        ]
        columns = [...productColumns, ...uidColumns, ...threeLevelRatio, ...rebateRatio, ...amountColumns]
        break

      default:
    }
    return columns
  }

  /** 下载 Excel */
  const getIncomeExcelUrl = async () => {
    const paramsObj = {
      ...rebateDetailForm,
      model: currentModalTab,
      // /** * 收益计算开始时间 */
      startTime: overviewParams.startTime,
      // /** * 收益计算结束时间 */
      endTime: overviewParams.endTime,
    }
    const params = JSON.parse(JSON.stringify(paramsObj))
    delete params?.pageNum
    delete params?.pageSize
    if (!params?.productCd) delete params?.productCd
    if (!params?.rebateLevel) delete params?.rebateLevel
    if (!params?.rebateType) delete params?.rebateType
    if (!params?.minAmount) delete params?.minAmount
    if (!params?.maxAmount) delete params?.maxAmount
    const res = await postAgentExportEarningsDetail({ ...params, model: currentModalTab })
    if (res.isOk && res.data) {
      DownloadFiles(res.data)
    }
  }

  /**
   * 查询收益详情
   */
  const onGetAgentCenterRebateDetail = async (searchParams?) => {
    const params = {
      ...rebateDetailForm,
      model: currentModalTab,
      // /** * 收益计算开始时间 */
      startTime: overviewParams.startTime,
      // /** * 收益计算结束时间 */
      endTime: overviewParams.endTime,
      ...searchParams,
    }
    if (!params?.productCd) delete params?.productCd
    if (!params?.rebateLevel) delete params?.rebateLevel
    if (!params?.rebateType) delete params?.rebateType
    if (!params?.minAmount) delete params?.minAmount
    if (!params?.maxAmount) delete params?.maxAmount
    const res = await getAgentCenterEarningsDetail(params)
    const { isOk, data } = res || {}

    if (!isOk || !data) return
    updateRebateData(data)
    updateRebateDetailForm({
      ...params,
    })
    setRebateDetailData(data[`${currentModalTab}AgentRebateList`] || [])
  }

  const { run: getRebateDetails, loading } = useRequest(onGetAgentCenterRebateDetail, { manual: true })
  const { run: dowLoadExcel, loading: exportLoading } = useRequest(getIncomeExcelUrl, { manual: true })

  useEffect(() => {
    if (!currentModalTab) return
    getRebateDetails()
  }, [currentModalTab, overviewParams.startTime, overviewParams.endTime])

  /** 处理分页 */
  const handlePaginationOnChange = (pageNum: number, pageSize: number) => {
    updateRebateDetailForm({ ...rebateDetailForm, pageNum, pageSize })
    getRebateDetails({ pageNum, pageSize })
  }

  const onSearch = params => {
    getRebateDetails(params)
  }

  return (
    <>
      <div className="agent-center-title" id="revenue-details">
        <Icon name="icon_agency_center_rebate" hasTheme />
        <label>{t`features_agent_agent_center_rebate_details_index_ph8g5q18vb`}</label>
      </div>

      <div
        className={`agent-center-container ${
          Number(rebateData.total) > Number(rebateDetailForm?.pageSize) ? 'table-container-bottom' : ''
        }`}
      >
        <div className="container-tabs">
          <SearchItem onSearch={onSearch} />
        </div>

        <Table
          fitByContent
          autoWidth
          minWidthWithColumn={false}
          className={styles['revenue-details-table-style']}
          columns={getRebateColumns()}
          data={rebateDetailData}
          rowKey={record => `${record?.id || getUUId()}`}
          border={false}
          style={{ minHeight: 260 }}
          loading={loading}
          scroll={{
            y: 400,
          }}
          placeholder="-"
          pagination={
            rebateDetailData?.length > 0 &&
            rebateData?.total &&
            Number(rebateData?.total) > Number(rebateDetailForm?.pageSize)
              ? {
                  current: rebateDetailForm?.pageNum,
                  total: Number(rebateData?.total) || 1,
                  pageSize: rebateDetailForm?.pageSize || 10,
                  onChange: handlePaginationOnChange,
                  hideOnSinglePage: true,
                }
              : false
          }
          onChange={(_, _sorter: SorterResult) => {
            // 触发翻页时直接返回
            if (_?.current !== rebateDetailForm?.pageNum || _?.pageSize !== rebateDetailForm?.pageSize) {
              return
            }

            let sortData = { registerDateSort: 0, sort: 0 }
            if (!_sorter.direction) {
              getRebateDetails(sortData)
              return
            }

            switch (_sorter.field) {
              case 'rebateDate':
                sortData.sort = RebateDetailSortEnum.rebateDate
                break
              case 'teamFee':
                sortData.sort = RebateDetailSortEnum.teamFee
                break
              case 'amount':
                sortData.sort = RebateDetailSortEnum.amount
                break
              case 'fee':
                sortData.sort = RebateDetailSortEnum.fee
                break
              default:
                sortData.sort = RebateDetailSortEnum.default
            }

            getRebateDetails({
              sortRule:
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
            <label>{t`features_agent_agency_center_revenue_details_index_5101524`}</label>
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
    </>
  )
}

export default AgentCenterRebateDetails
