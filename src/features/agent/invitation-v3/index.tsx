import { useEffect, useRef, useState } from 'react'
import { t } from '@lingui/macro'
import { Message } from '@nbit/arco'
import { usePageContext } from '@/hooks/use-page-context'
import { useAgentInviteStore } from '@/store/agent/agent-invite'
import InvitationDetailsV3 from '@/features/agent/invitation-v3/invitation-details-v3'
import { getAgentCenterGetAgentList } from '@/apis/agent/agent-center/userDetails'
import { baseAgentInviteV3Store, useAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import { getCodeDetailList } from '@/apis/common'
import { fetchBlacklistQuery } from '@/apis/agent/agent-invite/apply'
import { YapiGetV1OpenapiComCodeGetCodeDetailListData } from '@/typings/yapi/OpenapiComCodeGetCodeDetailListV1GetApi'
import { AgentModeEnumeration } from '@/constants/agent/agent'
import { getIsBlackListData } from '@/helper/agent/agent-invite'
import BlackListTipsModal from '@/features/agent/agent-invite/common/blacklist-tips-modal'
import InvitationFormfilterV3 from './invitation-formfilter-v3'
import styles from './index.module.css'

interface IntabListResp {
  id: string
  name: string
}

function InvitationDetailsV3Layout() {
  const { isBlackListData } = {
    ...useAgentInviteV3Store(),
  }
  const pageCtx = usePageContext()
  const InvitationDetailsRef = useRef<Record<'onCenterWebSetMoreDetail' | 'onEmptyIdCollection', () => void>>() // 表格组建 ref
  const InvitationFormfilterRef = useRef<Record<'onCloseFrom' | 'onSetStartDate', (uid?: string) => void>>() // 表单组建 ref
  const [tabList, setTabList] = useState<Array<IntabListResp>>([]) // 当前用户的代理模式
  const { agentTypeCodeEnum } = baseAgentInviteV3Store.getState().agentEnums
  const [tabIndex, setTabIndex] = useState<string | null>(pageCtx.urlParsed.search?.model) // tab 当前选中数值
  const [ratio, setRatio] = useState<Array<YapiGetV1OpenapiComCodeGetCodeDetailListData>>([]) // 产品线字段值
  const store = useAgentInviteStore()
  const defaultDate = {
    uid: '',
    productCd: 0,
    queryUidType: 1,
    isChildUid: false,
    areaLevel: 0,
    inviteNumMin: '',
    inviteNumMax: '',
    startTime: '',
    pageNum: 1,
    pageSize: 20,
    endTime: '',
  }
  const [fromDate, setFromDate] = useState({ ...defaultDate })
  store.hooks.useGetContractStatusCode()

  /**
   * 调用清空层级数组方法
   */
  const onEmptyIdCollection = () => {
    InvitationDetailsRef.current?.onEmptyIdCollection()
  }

  /**
   * 调用表格查询方法
   */
  const onInquireTable = row => {
    InvitationFormfilterRef.current?.onSetStartDate(row)
    setFromDate(row)
  }

  /**
   * 清空表单值方法
   */
  const onResetForm = row => {
    setFromDate(row)
  }

  /**
   * Tab 切换事件
   */
  const onSelected = row => {
    if (row.id !== tabIndex) {
      InvitationFormfilterRef.current?.onCloseFrom()
      setTabIndex(row.id)
      setFromDate(val => {
        const fromData = { ...val, ...defaultDate, pageNum: 1, pageSize: 20 }
        return fromData
      })
    }
  }

  /**
   * 获取当前用户的代理模式
   */
  const AgentCenterGetAgentList = async () => {
    const res = await getAgentCenterGetAgentList({})
    return res
  }

  /**
   * 获取模式数据字典
   */
  const codeDetailList = async () => {
    const res = await getCodeDetailList({ codeVal: agentTypeCodeEnum.codeKey })
    return res
  }

  /**
   * 并发请求接口
   */
  const getsTheProxyMode = async () => {
    Promise.all([AgentCenterGetAgentList(), codeDetailList()]).then(res => {
      if (res[0].isOk && res[1].isOk) {
        res[1].data?.forEach(row => {
          res[0].data?.forEach(rowKey => {
            if (row.codeVal === String(rowKey)) {
              setTabList(val => {
                const data = [...val]
                data.push({ id: String(rowKey), name: row.codeKey })
                return data
              })
            }
          })
        })
        if (!pageCtx.urlParsed.search?.model) {
          setTabIndex(String(res[0]?.data ? res[0].data[0] : ''))
        }
      }
    })
  }

  /**
   * 产品线数据字典查询
   */
  const getRatioMethod = async () => {
    const res = await getCodeDetailList({ codeVal: 'agent_product_cd_show_ratio' })
    if (res.isOk && res.data) {
      setRatio(res.data)
    }
  }

  /**
   * 初始化方法
   */

  const InitializeMethod = async () => {
    getsTheProxyMode()
    getRatioMethod()
  }

  useEffect(() => {
    InitializeMethod()
  }, [])

  return (
    <section className={`invitation-center ${styles.scoped}`}>
      <div className="header">
        <div className="invitaion-center-header">
          <div className="title">
            <label>{t`features_agent_invitation_index_5101581`}</label>
          </div>
        </div>
      </div>
      <div className="invitation-center-wrap">
        <div className="invitaion-tab-box">
          {tabList.map(row => {
            return (
              <div
                className={`invitaion-tab-everybox ${
                  row.id === tabIndex ? 'invitaion-tab-selected' : 'invitaion-tab-unchecked'
                }`}
                onClick={() => onSelected(row)}
                key={row.id}
              >
                {row.name}
              </div>
            )
          })}
        </div>
        <InvitationFormfilterV3
          onEmptyIdCollection={onEmptyIdCollection}
          onInquireTable={onInquireTable}
          ref={InvitationFormfilterRef}
          defaultDate={defaultDate}
          ratio={ratio}
          filterNum={tabIndex}
          onResetForm={onResetForm}
        />
        <InvitationDetailsV3
          onInquireTable={onInquireTable}
          ref={InvitationDetailsRef}
          ratio={ratio}
          defaultParameters={defaultDate}
          defaultDate={fromDate}
          filterNum={tabIndex}
        />
      </div>
    </section>
  )
}
export default InvitationDetailsV3Layout
