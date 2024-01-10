/** *
 * Ta 的邀请首页
 */

import { useEffect, useState, useRef } from 'react'
import { getUserInfo } from '@/helper/cache'
import { t } from '@lingui/macro'
import { Message } from '@nbit/arco'
import { getAgentCenterHisInvitation } from '@/apis/agent/agent-center/userDetails'
import { fetchBlacklistQuery } from '@/apis/agent/agent-invite/apply'
import { useRequest, useMount } from 'ahooks'
import { AgentModeEnumeration } from '@/constants/agent/agent'
import { usePageContext } from '@/hooks/use-page-context'
import { getCodeDetailList } from '@/apis/common'
import { YapiGetV1OpenapiComCodeGetCodeDetailListData } from '@/typings/yapi/OpenapiComCodeGetCodeDetailListV1GetApi'
import { useAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import HisInvitationPersonal from './his-invitation-personal'
import HisBrokerList from './his-broker-list'
import style from './index.module.css'

function HisInvitationLayout() {
  const { fetchAgentEnums } = {
    ...useAgentInviteV3Store(),
  }
  const hisValue = t`features_agent_center_invite_index_nfg2f8pgsn` // TA 的邀请常量值
  const brokerRef = useRef<Record<'getCenterHisInviteeQuery', (uidCode?: string) => void>>(null)
  const pageContext = usePageContext() // 获取路由参数
  const [foundation, setFoundation] = useState<object>({}) // 基础信息数据
  const [ratio, setRatio] = useState<Array<YapiGetV1OpenapiComCodeGetCodeDetailListData>>([]) // 产品线字段值
  const { uid } = getUserInfo() // 获取当前用户信息
  const listObj = useRef({
    uid: pageContext.urlParsed.search?.uid || uid,
    model: pageContext.urlParsed.search?.model,
  })

  const [oneLevelup, setOneLevelup] = useState([uid]) // 上一级集合数据

  /**
   * 查询邀请人基本信息
   */
  const centerHisInvitation = async () => {
    const res = await getAgentCenterHisInvitation(listObj.current)
    if (res.isOk && res.data) {
      let newData =
        res.data?.areaAgentInviteDto || res.data?.pyramidAgentInviteDto || res.data?.threeLevelAgentInviteDto
      setFoundation(newData)
      return
    }
    setFoundation({})
  }
  const { run: getInviteDetails, loading } = useRequest(centerHisInvitation, { manual: true })
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
   * Ta 的邀请表格按钮改变基础信息事件
   */
  const onInviteEvents = row => {
    const dataList = [...oneLevelup]
    if (!dataList.includes(row.uid)) {
      dataList.push(row.uid)
    }
    listObj.current = { ...listObj.current, uid: row.uid }
    setOneLevelup(dataList)
    getInviteDetails()
    brokerRef.current?.getCenterHisInviteeQuery(row.uid)
  }

  /**
   * 基础信息上一级事件
   */
  const onReturnMethod = () => {
    const dataList = [...oneLevelup]
    dataList.pop()
    listObj.current = { ...listObj.current, uid: dataList[dataList.length - 1] as string }
    setOneLevelup(dataList)
    getInviteDetails()
    brokerRef.current?.getCenterHisInviteeQuery(dataList[dataList.length - 1])
  }

  /**
   * 初始化方法
   */
  const getBlockNot = async () => {
    // 当路由上有 uid 并且这个 uid 不存在默认的数组中的时候就追加传件来的 uid
    if (pageContext.urlParsed.search?.uid && !oneLevelup.includes(pageContext.urlParsed.search?.uid)) {
      setOneLevelup(val => {
        const dataVal = [...val]
        dataVal.push(pageContext.urlParsed.search?.uid)
        return dataVal
      })
    }
    getInviteDetails()
    getRatioMethod()
  }

  useMount(fetchAgentEnums)

  useEffect(() => {
    getBlockNot()
  }, [])
  return (
    <div className={style['page-scoped']}>
      <section className={style.scoped}>
        <div className="his-herder">
          <div className="his-body-box">
            <span>{hisValue.replace(' ', '')}</span>
          </div>
        </div>
        <div className="his-personal">
          <div className="his-personal-box">
            <HisInvitationPersonal
              loading={loading}
              centerHisInvitation={centerHisInvitation}
              onReturnMethod={onReturnMethod}
              ratio={ratio}
              foundation={foundation}
            />
          </div>

          <div className="his-personal-box">
            <HisBrokerList
              foundation={foundation}
              oneLevelup={oneLevelup}
              ref={brokerRef}
              listObj={listObj.current}
              onInviteEvents={row => {
                onInviteEvents(row)
              }}
              ratio={ratio}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default HisInvitationLayout
