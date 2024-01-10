/**
 * Tabel 表格数据定义
 * */
import { TableColumnProps, Message } from '@nbit/arco'
import { AgentModeEnumeration } from '@/constants/agent/agent'
import { formatCurrency } from '@/helper/decimal'
import { useCopyToClipboard } from 'react-use'
import { usePageContext } from '@/hooks/use-page-context'
import { t } from '@lingui/macro'
import { InviteCertificationStatusTypeEnum } from '@/constants/agent/agent-center/index'
import { AgentLevelIconMethod } from '@/features/agent/invitation-v3/invitation-details-v3/his-tools'
import dayjs from 'dayjs'
import Icon from '@/components/icon'
import style from './index.module.css'

export function GetBrokerTableColumnList(ratio, onInviteEvents, foundation, onIconEven) {
  const tabelText = t`features_agent_center_invite_index_nfg2f8pgsn`
  const [state, copyToClipboard] = useCopyToClipboard()
  const pageContext = usePageContext() // 获取路由参数
  /**
   * 金字塔比例过滤方法
   */
  const pyramidFilteringMethod = productRebateList => {
    let RebateList = ''
    if (productRebateList && productRebateList.length > 0) {
      ratio.forEach(res => {
        productRebateList.forEach(resKey => {
          if (res.codeVal === resKey.productCd) {
            RebateList += `${res?.codeKey || ''} ${resKey?.childRatio || 0}% / `
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
   *
   * UID 复制功能
   */
  const onIconCopy = val => {
    if (!val) return
    copyToClipboard(val)
    state.error
      ? Message.error(t`assets.financial-record.copyFailure`)
      : Message.success(t`assets.financial-record.copySuccess`)
  }

  /**
   * TA 的邀请事件
   */
  const onBtInviteEvents = e => {
    onInviteEvents(e)
  }

  /**
   * 隐藏操作邀请人方法
   * */
  const hideInviterMethod = () => {
    if (
      pageContext.urlParsed.search?.model === AgentModeEnumeration.threeLevel &&
      Number(foundation?.agentLevel) === 2
    ) {
      return false
    }
    return true
  }

  /**
   * 表格按钮条件判断方法
   */
  const TableJudgmentMethod = () => {
    return (
      pageContext.urlParsed.search?.model === AgentModeEnumeration.pyramid &&
      [0].includes(Number(foundation?.agentLevel))
    )
  }
  const columns = [
    {
      fixed: 'left',
      keyDisplay: true,
      title: t`user.account_security.modify_username_04`,
      dataIndex: 'nickName',
      render: (_row, e) => {
        return (
          <div className={style['tabel-data']}>
            <div className="tabel-box">
              <div className="tabel-name-circle">{e?.nickName ? e?.nickName.substring(0, 1) : '-'}</div>
              <div className="tabel-name">{e?.nickName || '--'}</div>
            </div>
          </div>
        )
      },
    },
    {
      keyDisplay: true,
      title: 'UID',
      dataIndex: 'uid',
      render: (_row, e) => {
        return (
          <div className={style['tabel-data']}>
            <div className="tabel-uid-box">
              <div>{e?.uid || '--'} </div>
              <div>
                <Icon
                  className="personal-uid-icon"
                  name="icon_agent_invite_copy"
                  onClick={() => onIconCopy(e.uid)}
                  hasTheme
                  fontSize={16}
                />
              </div>
            </div>
          </div>
        )
      },
    },
    {
      keyDisplay: true,
      title: t`features_agent_agency_center_invitation_details_index_5101536`,
      dataIndex: 'isRealName',
      render: (_row, e) => {
        return (
          <div>
            {Number(e?.isRealName) === InviteCertificationStatusTypeEnum.verified
              ? t`features_agent_agency_center_invitation_details_index_5101548`
              : t`features_agent_agency_center_invitation_details_index_5101549`}
          </div>
        )
      },
    },
    {
      keyDisplay: hideInviterMethod(),
      title: t`features_agent_center_invite_his_broker_list_table_schema_txsyv1bzre`,
      dataIndex: 'inviteNum',
      sorter: (a, b) => a.inviteNum - b.inviteNum,
      render: (_row, e) => {
        return pageContext.urlParsed.search?.model === AgentModeEnumeration.threeLevel &&
          Number(foundation?.agentLevel) === 2 ? (
          ''
        ) : (
          <div>{e?.inviteNum ? formatCurrency(e.inviteNum) : 0}</div>
        )
      },
    },
    {
      keyDisplay: pageContext.urlParsed.search?.model !== AgentModeEnumeration.threeLevel,
      title: t`features_agent_agency_center_invitation_details_index_qfbw6m22wx`,
      dataIndex: 'teamNum',
      sorter: (a, b) => a.teamNum - b.teamNum,
      render: (_row, e) => {
        return <div>{e?.teamNum ? formatCurrency(e.teamNum) : 0}</div>
      },
    },
    {
      keyDisplay: pageContext.urlParsed.search?.model === AgentModeEnumeration.pyramid,
      title: t`features_agent_center_invite_his_broker_list_table_schema_bggc0ofuad`,
      dataIndex: 'myRatio',
      render: (_row, e) => {
        return <div>{e?.productRebateList ? pyramidFilteringMethod(e.productRebateList) : '--'}</div>
      },
    },
    {
      keyDisplay: pageContext.urlParsed.search?.model === AgentModeEnumeration.area,
      title: t`features_agent_center_invite_his_broker_list_table_schema_mq8yp8t4u4`,
      dataIndex: 'rebateRatio',
      render: (_row, e) => {
        return (
          <div className={style['tabel-data']}>
            <div className="tabel-box-proportion">
              <div>
                <Icon name={RegionalRebateMethod(e)} width={16} height={13} />
              </div>
              <div>{e?.rebateRatio ? `${e.rebateRatio}%` : '--'}</div>
            </div>
          </div>
        )
      },
    },
    {
      keyDisplay: true,
      title: t`features_agent_agency_center_invitation_details_index_5101541`,
      dataIndex: 'registerDate',
      sorter: true,
      render: (_row, e) => {
        return <div>{e?.registerDate ? dayjs(e.registerDate).format('YYYY-MM-DD HH:mm:ss') : '--'}</div>
      },
    },
    {
      keyDisplay: hideInviterMethod(),
      title: t`order.columns.action`,
      fixed: 'right',
      width: TableJudgmentMethod() ? 170 : 130,
      render: (_row, e) => {
        return (
          <div className={style['tabel-data']}>
            <div className={TableJudgmentMethod() ? 'tabel-but-box' : ''}>
              {/* 当上级为自己时展示 */}
              {TableJudgmentMethod() && (
                <div className="tabel-right-button">
                  <span onClick={() => onIconEven(e)}>
                    {t`features_agent_agency_center_invitation_details_index_s0le3rujwh`}
                  </span>
                </div>
              )}
              <div>
                {pageContext.urlParsed.search?.model === AgentModeEnumeration.threeLevel &&
                Number(foundation?.agentLevel) === 2 ? (
                  ''
                ) : (
                  <div className="tabel-right-button">
                    <span onClick={() => onBtInviteEvents(e)}>{tabelText.replace(' ', '')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      },
    },
  ].filter(e => {
    return e.keyDisplay
  }) as Array<TableColumnProps>

  return columns
}
