import Icon from '@/components/icon'
import { getInviteKycLevelEnumTitle } from '@/constants/agent/agent-invite'
import { AgentModalTypeEnum } from '@/constants/agent/agent-center'
import { AgentModeEnumeration } from '@/constants/agent/agent'
import { isFalsyExcludeZero } from '@/helper/common'
import { formatDate } from '@/helper/date'
import { IAgentInviteStore } from '@/store/agent/agent-invite'
import { t } from '@lingui/macro'
import { formatCurrency } from '@/helper/decimal'
import {
  areaAgentUserDetailListType,
  pyramidAgentUserDetailListType,
  thirdLevelUserDetailListType,
} from '@/typings/api/agent/agent-center/user'
import { TableColumnProps } from '@nbit/arco'
import { IncreaseTag } from '@nbit/react'
import { AgentLevelIconMethod } from './his-tools'

import style from './index.module.css'

export function ShowDashIfEmpty({
  val,
  children,
  defaultValue,
}: {
  val: any
  children?: React.ReactNode
  defaultValue?: string
}) {
  if (!isFalsyExcludeZero(val)) return <span>{children}</span>
  return <span>{defaultValue || '--'}</span>
}

export function FinanceValue({ val, currency }: { val: any; currency?: string }) {
  if (isFalsyExcludeZero(val)) {
    return <span>{'--'}</span>
  }

  return (
    <IncreaseTag
      value={val}
      digits={2}
      delZero={false}
      kSign
      defaultEmptyText={'0'}
      hasPrefix={false}
      hasColor={false}
      hasPostfix={false}
    />
  )
}

export function getInviteDetailsTableColumnSchema(
  store: IAgentInviteStore,
  onDrillDownEvents,
  onSelectedStatesEven,
  props,
  tertiaryAgent,
  currencySymbol
) {
  const cellStyle: any = {
    headerCellStyle: {
      textAlign: 'right',
    },
    bodyCellStyle: {
      textAlign: 'right',
    },
  }
  /**
   * 产品线筛选方法
   */
  const productLineApproach = productCd => {
    let codeKey = ''
    props.ratio.forEach(res => {
      if (res.codeVal === productCd) {
        codeKey = res.codeKey
      }
    })
    return codeKey
  }

  /**
   * 金字塔比例过滤方法
   */
  const pyramidFilteringMethod = productRebateList => {
    let RebateList = ''
    if (productRebateList && productRebateList.length > 0) {
      props.ratio.forEach(res => {
        productRebateList.forEach(resKey => {
          if (res.codeVal === resKey.productCd) {
            RebateList += `${res.codeKey} ${resKey?.ratio || 0}% / `
          }
        })
      })
    }
    return (RebateList = RebateList.replace(/\/\s*[^/]*\s*$/, ''))
  }

  /**
   * 区域返佣比例方法
   */
  const RegionalRebateMethod = e => {
    return AgentLevelIconMethod(e.rebateLevel)
  }

  /**
   * 隐藏邀请人方法
   * */
  const hideInviterMethod = () => {
    if (props.filterNum === AgentModalTypeEnum.threeLevel && Number(tertiaryAgent) === 3) {
      return true
    }
    return false
  }

  const columns: (TableColumnProps<
    areaAgentUserDetailListType | pyramidAgentUserDetailListType | thirdLevelUserDetailListType
  > & {
    isHide?: boolean
  })[] = [
    {
      width: 50,
      title: t`features_agent_invitation_index_5101586`,
      render: (text, record, index) => `${index + 1}`,
      ...cellStyle,
    },
    {
      title: t`features_agent_invitation_index_5101587`,
      ...cellStyle,
      dataIndex: 'uid',
      render: (text, data, index) => {
        // 三级代理代理层级为 3 的时候是不能点击的
        if (props.filterNum === AgentModalTypeEnum.threeLevel && Number(data?.agentLevel) === 3) {
          return (
            <ShowDashIfEmpty val={data.uid}>
              <span className="">{data?.uid}</span>
            </ShowDashIfEmpty>
          )
        }
        return (
          <ShowDashIfEmpty val={data?.uid}>
            <span
              className="cursor-pointer uid-wrapper"
              onClick={() => {
                onDrillDownEvents(data.uid)
              }}
            >
              {data?.uid}
            </span>
          </ShowDashIfEmpty>
        )
      },
    },
    {
      ...cellStyle,
      title: t`user.account_security.modify_username_04`,
      dataIndex: 'nickName',
      render: (text, data, index) => {
        return <ShowDashIfEmpty val={data.nickName}>{data?.nickName}</ShowDashIfEmpty>
      },
    },
    {
      ...cellStyle,
      title: (
        <div className="flex">
          {t`features_agent_invitation_index_5101588`}
          <div className="parent-uid-hide-icon pl-1">
            <Icon
              name={store.checkMoreTableUpUidHide ? 'eyes_close' : 'eyes_open'}
              hasTheme
              onClick={() => store.toggleCheckMoreUpUidHide()}
            />
          </div>
        </div>
      ),
      dataIndex: 'parentUid',
      render: (text, data, index) => {
        const curState = store.filterSettingCheckMoreV2

        if (store.checkMoreTableUpUidHide) {
          return '***'
        }
        return (
          <ShowDashIfEmpty val={data?.parentUid}>
            <span className="">{data?.parentUid}</span>
          </ShowDashIfEmpty>
        )
      },
    },

    {
      ...cellStyle,
      title: t`user.safety_items_02`,
      dataIndex: 'mobileNumber',
      render: (text, data, index) => {
        return <ShowDashIfEmpty val={data?.mobileNumber}>{`${data?.mobileNumber}`}</ShowDashIfEmpty>
      },
    },

    {
      ...cellStyle,
      title: t`user.safety_items_04`,
      dataIndex: 'email',
      render: (text, data, index) => {
        return <ShowDashIfEmpty val={data?.email}>{data?.email}</ShowDashIfEmpty>
      },
    },

    {
      ...cellStyle,
      title: t`features_agent_invitation_v2_invitation_details_v2_table_schema_zvalmddbhr`,
      dataIndex: 'kycType',
      render: (text, data, index) => {
        return (
          <ShowDashIfEmpty val={data?.kycType}>
            {getInviteKycLevelEnumTitle(String(data?.kycType || ''), true)}
          </ShowDashIfEmpty>
        )
      },
    },
    {
      isHide: hideInviterMethod(),
      ...cellStyle,
      title: t`constants_agent_agent_jkly4smzop`,
      dataIndex: 'inviteNum',
      sorter: (a, b) => a.inviteNum - b.inviteNum,
      render: (text, data, index) => {
        return data?.inviteNum ? formatCurrency(data?.inviteNum) : 0
      },
    },
    {
      ...cellStyle,
      isHide: ![AgentModeEnumeration.area, AgentModeEnumeration.pyramid].includes(props.filterNum),
      title: t`features_agent_agency_center_data_overview_index_o2y6ibxmqh`,
      dataIndex: 'teamNum',
      sorter: (a, b) => a.teamNum - b.teamNum,
      render: (text, data, index) => {
        return data?.teamNum ? formatCurrency(data?.teamNum) : 0
      },
    },
    {
      ...cellStyle,
      title: t`features_agent_invitation_v3_invitation_details_v3_table_schema_us_fc2kinp`,
      dataIndex: 'agentLevel',
      render: (text, data, index) => {
        return data.agentLevel
      },
    },
    {
      ...cellStyle,
      isHide: ![AgentModeEnumeration.area].includes(props.filterNum),
      title: t`features_agent_invitation_v3_invitation_details_v3_table_schema_b1hpvrh9_j`,
      dataIndex: 'rebateLevel',
      render: (text, data, index) => {
        return (
          <div className={style['scoped-table']}>
            <div className="details">
              <div>{data?.rebateLevel ? <Icon name={RegionalRebateMethod(data)} width={16} height={13} /> : ''}</div>
              <div>{`${data?.rebateRatio || 0}%`}</div>
            </div>
          </div>
        )
      },
    },
    {
      ...cellStyle,
      isHide: ![AgentModeEnumeration.pyramid].includes(props.filterNum),
      title: t`features_agent_invitation_v3_invitation_details_v3_table_schema_zyabt3fn7a`,
      dataIndex: 'productRebateList',
      render: (text, data, index) => {
        return pyramidFilteringMethod(data?.productRebateList) || '--'
      },
    },
    {
      ...cellStyle,
      title: t`features_assets_financial_record_search_form_index_njivosohlh`,
      dataIndex: 'productCd',
      render: (text, data, index) => {
        return data?.productCd ? productLineApproach(data.productCd) : t`assets.financial-record.search.all`
      },
    },
    {
      ...cellStyle,
      isHide: ![AgentModeEnumeration.threeLevel].includes(props.filterNum),
      title: `${t`features_agent_invitation_v3_invitation_details_v3_table_schema_mirnjlovrp`}(${currencySymbol})`,
      dataIndex: 'fee',
      sorter: (a, b) => a.fee - b.fee,
      render: (text, data, index) => {
        return <FinanceValue val={data?.fee} />
      },
    },

    {
      ...cellStyle,
      isHide: ![AgentModeEnumeration.threeLevel].includes(props.filterNum),
      title: `${t`features_agent_invitation_v3_invitation_details_v3_table_schema_j0u2iylppc`}(${currencySymbol})`,
      dataIndex: 'contributionRebate',
      sorter: (a, b) => a.contributionRebate - b.contributionRebate,
      render: (text, data, index) => {
        return <FinanceValue val={data?.contributionRebate} />
      },
    },

    {
      ...cellStyle,
      isHide: ![AgentModeEnumeration.area, AgentModeEnumeration.pyramid].includes(props.filterNum),
      title: `${t`features_agent_invitation_v2_invitation_details_v2_table_schema_thzapk1ti8`}(${currencySymbol})`,
      dataIndex: 'teamRebate',
      sorter: (a, b) => a.teamRebate - b.teamRebate,
      render: (text, data, index) => {
        return <FinanceValue val={data?.teamRebate} />
      },
    },

    {
      ...cellStyle,
      isHide: ![AgentModeEnumeration.area, AgentModeEnumeration.pyramid].includes(props.filterNum),
      title: `${t`features_agent_invitation_v2_invitation_details_v2_table_schema_u7ngyfqxl6`}(${currencySymbol})`,
      dataIndex: 'teamFee',
      sorter: (a, b) => a.teamFee - b.teamFee,

      render: (text, data, index) => {
        return <FinanceValue val={data?.teamFee} />
      },
    },

    {
      ...cellStyle,
      isHide: ![AgentModeEnumeration.area, AgentModeEnumeration.pyramid].includes(props.filterNum),
      title: `${t`features_agent_invitation_v2_invitation_details_v2_table_schema_ltpzj6achr`}(${currencySymbol})`,
      dataIndex: 'teamContributionRebate',
      sorter: (a, b) => a.teamContributionRebate - b.teamContributionRebate,

      render: (text, data, index) => {
        return <FinanceValue val={data?.teamContributionRebate} />
      },
    },

    {
      ...cellStyle,
      title: `${t`features_agent_invitation_v2_invitation_details_v2_table_schema_cy2_e1ousl`}(${currencySymbol})`,
      dataIndex: 'incoming',
      sorter: (a, b) => a.incoming - b.incoming,

      render: (text, data, index) => {
        return <FinanceValue val={data?.incoming} />
      },
    },

    {
      ...cellStyle,
      title: `${t`features_agent_invitation_v2_invitation_details_v2_table_schema_3rm_bpygtr`}(${currencySymbol})`,
      dataIndex: 'withdraw',
      sorter: (a, b) => a.withdraw - b.withdraw,
      render: (text, data, index) => {
        return <FinanceValue val={data?.withdraw} />
      },
    },
    {
      ...cellStyle,
      title: t`features_agent_agency_center_invitation_details_index_5101541`,
      dataIndex: 'registerDate',
      sorter: (a, b) => a.registerDate - b.registerDate,
      render: (text, data, index) => {
        return <ShowDashIfEmpty val={data?.registerDate}>{formatDate(data?.registerDate || '')}</ShowDashIfEmpty>
      },
    },
  ]

  return columns.filter(x => !x.isHide)
}
