/**
 * 代理中心 - 代理商
 */
import { useEffect, useState } from 'react'
import { t } from '@lingui/macro'
import Link from '@/components/link'
import Icon from '@/components/icon'
import { getAgentOssImageUrl, getIsBlackListData } from '@/helper/agent/agent-invite'
import {
  defaultOverviewParams,
  defaultOverviewTimeTab,
  initInviteDetailForm,
  initRebateDetailForm,
  useAgentCenterStore,
} from '@/store/agent/agent-center/center'
import { AgentModalTypeEnum, getAgentCenterModalTypeName } from '@/constants/agent/agent-center'
import LazyImage from '@/components/lazy-image'
import { useAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import { useMount, useUnmount } from 'ahooks'
import { getAgentList } from '@/apis/agent/agent-center'
import { getAgentMoreInviteDetailRoutePath } from '@/helper/route/agent'
import { getProductLine } from '@/helper/agent/agent-center'
import { useCommonStore } from '@/store/common'
import styles from './index.module.css'
import AgentCenterDataOverview from './data-overview'
import AgentCenterInviteDetails from './invite-details'
import AgentCenterRebateDetails from './rebate-details'
import AreaRebateModal from '../agent-invite/common/area-rebate-modal'
import ThreeLevelRebateModal from '../agent-invite/common/three-level-rebate-modal'
import BlackListTipsModal from '../agent-invite/common/blacklist-tips-modal'

function AgentCenterLayout() {
  const {
    userAgentList,
    currentModalTab,
    updateCurrentModalTab,
    updateUserAgentList,
    updateOverviewTimeTab,
    updateOverviewParams,
    updateOverviewData,
    updateRebateDetailForm,
    updateRebateData,
    updateInviteDetailForm,
    updateInviteDetail,
    updateAgentCurrencyList,
  } = useAgentCenterStore() || {}
  const commonState = useCommonStore()
  const {
    isBlackListData,
    fetchAgentEnums,
    visibleAreaRebateModal,
    visibleThreeLevelRatioModal,
    updateVisibleThreeLevelRatioModal,
    updateVisibleAreaRebateModal,
  } = {
    ...useAgentInviteV3Store(),
  }

  useMount(fetchAgentEnums)

  const onClickModalTab = (val: string) => {
    if (val === currentModalTab) return
    updateCurrentModalTab(val)
    updateOverviewData({})
    updateRebateData({})
    updateInviteDetail({})
    updateOverviewParams({ ...defaultOverviewParams, model: val })
    updateRebateDetailForm({ ...initRebateDetailForm, model: val })
    updateInviteDetailForm({ ...initInviteDetailForm, model: val })
  }

  /**
   * 查询用户代理模式列表
   */
  const onLoadAgentList = async () => {
    const res = await getAgentList({})
    const { isOk, data } = res || {}

    if (!isOk || !data) return
    updateUserAgentList(data)
    !currentModalTab && updateCurrentModalTab(data[0])
  }

  useEffect(() => {
    onLoadAgentList()
    getIsBlackListData()
    getProductLine()
  }, [])

  useUnmount(() => {
    updateUserAgentList([])
    updateCurrentModalTab('')
    updateOverviewData({})
    updateRebateData({})
    updateInviteDetail({})
    updateAgentCurrencyList([])
    updateOverviewTimeTab(defaultOverviewTimeTab)
    updateOverviewParams(defaultOverviewParams)
    updateRebateDetailForm(initRebateDetailForm)
    updateInviteDetailForm(initInviteDetailForm)
  })

  return (
    <section className={`agency-center ${styles.scoped}`}>
      <div className="agency-center-wrap">
        <div className="header" style={{ backgroundImage: `url(${getAgentOssImageUrl('bg_agency_center', true)})` }}>
          <div className="header-container">
            <div className="header-title">
              <div className="text">{t`features_agent_agency_center_index_5101513`}</div>
              <div className="describe">{t`features_agent_agency_center_index_5101514`}</div>
            </div>
            <div className="header-img">
              <LazyImage src={getAgentOssImageUrl(`bg_agency_center_image`)} />
            </div>
          </div>
        </div>
        <div className="main">
          <div className="main-wrap">
            <div className="main-nav">
              <div className="tab-wrap">
                {userAgentList?.map((v, index) => (
                  <span
                    className={currentModalTab === v ? 'active' : ''}
                    key={index}
                    onClick={() => onClickModalTab(v)}
                  >
                    {getAgentCenterModalTypeName(v)}
                  </span>
                ))}
              </div>
              <div className="user-details">
                {/* 替换路由为代理商三期 */}
                <Link
                  href={getAgentMoreInviteDetailRoutePath(currentModalTab)}
                >{t`features_agent_invitation_index_5101581`}</Link>
                <Icon name="help_center_more" />
              </div>
            </div>
            {/* 总览 */}
            <AgentCenterDataOverview />
            {/* 返佣详情 */}
            <AgentCenterRebateDetails />
            {/* 邀请详情 */}
            <AgentCenterInviteDetails />
          </div>
        </div>
      </div>

      {/* 黑名单提示弹窗 */}
      {isBlackListData?.inBlacklist && <BlackListTipsModal />}

      {/* 区域返佣阶梯弹框 */}
      {userAgentList?.includes(AgentModalTypeEnum?.area) && (
        <AreaRebateModal visible={visibleAreaRebateModal} setVisible={updateVisibleAreaRebateModal} />
      )}

      {/* 三级代理返佣阶梯弹框 */}
      {userAgentList?.includes(AgentModalTypeEnum?.threeLevel) && (
        <ThreeLevelRebateModal visible={visibleThreeLevelRatioModal} setVisible={updateVisibleThreeLevelRatioModal} />
      )}
    </section>
  )
}

export default AgentCenterLayout
