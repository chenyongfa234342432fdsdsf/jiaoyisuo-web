import { useEffect, useState } from 'react'
import { dataOverviewTabInvite } from '@/constants/agent'
import { useAgentInviteStore } from '@/store/agent/agent-invite'
import { t } from '@lingui/macro'
import { getV1AgentInviteAnalysisOverviewApiRequest, getV2AgtRebateInfoHistoryOverviewApiRequest } from '@/apis/agent'
import { YapiGetV1AgentInviteAnalysisOverviewData } from '@/typings/yapi/AgentInviteAnalysisOverviewV1GetApi'
import { YapiGetV2AgtRebateInfoHistoryOverviewData } from '@/typings/yapi/AgtRebateInfoHistoryOverviewV2GetApi'
import AgentAnalyticsTab from '../common/agent-analytics-tab'
import { AgentInviteHeader } from '../common/agent-analytics-header'
import AgentAnalyticsFilterTab from '../common/agent-analytics-filter-tab'
import { InvitesAnalysisLineChart, TotalInvitesLineChart } from '../common/stats-line-chart'
import AgentAnalyticsLayout from '../common/agent-analytics-layout'

function InvitationCenter() {
  const tabList = dataOverviewTabInvite()
  const [selectTime, setSelectTime] = useState<number>(tabList[0].value)
  const [headerData, setheaderData] = useState<YapiGetV1AgentInviteAnalysisOverviewData>()
  const [overview, setOverview] = useState<YapiGetV2AgtRebateInfoHistoryOverviewData>()

  useEffect(() => {
    getV1AgentInviteAnalysisOverviewApiRequest({}).then(res => setheaderData(res.data))
    getV2AgtRebateInfoHistoryOverviewApiRequest({}).then(res => setOverview(res.data))
  }, [])

  // const { invitedList, totalList } = useInviteDetailsAnalysis(selectTime)

  return null
  // (
  //   <AgentAnalyticsLayout
  //     tab={<AgentAnalyticsTab />}
  //     header={
  //       <AgentInviteHeader
  //         valueAll={overview?.invitedNum}
  //         valueSub={overview?.invitedTeamNum}
  //         valueNow={headerData?.today}
  //         value7Days={headerData?.sevenDays}
  //         value30Days={headerData?.thirtyDays}
  //       />
  //     }
  //     filterTab={
  //       <AgentAnalyticsFilterTab
  //         value={selectTime}
  //         setValue={setSelectTime}
  //         tabList={tabList}
  //         contextStore={useAgentInviteStore}
  //       />
  //     }
  //     charts={
  //       <>
  //         <TotalInvitesLineChart data={invitedList} />
  //         <InvitesAnalysisLineChart data={totalList} />
  //       </>
  //     }
  //     tips={t`features_agent_agency_center_data_overview_index_5101510`}
  //   />
  // )
}

export default InvitationCenter
