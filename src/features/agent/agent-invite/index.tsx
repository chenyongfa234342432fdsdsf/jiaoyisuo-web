/**
 * 代理商 - 邀请返佣首页
 */
import { t } from '@lingui/macro'
import { useEffect, useState } from 'react'
import { getAgentInviteCodeDefault } from '@/apis/agent/agent-invite'
import { useMount, useRequest, useUnmount } from 'ahooks'
import { Spin } from '@nbit/arco'
import { useAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import {
  agentOssUrl,
  getAgentOssImageUrl,
  getIsBlackListData,
  getPyramidAgentApplyInfo,
} from '@/helper/agent/agent-invite'
import { ApplyStatusEnum } from '@/constants/agent/agent-invite'
import { useLayoutStore } from '@/store/layout'
import Icon from '@/components/icon'
import LazyImage, { Type } from '@/components/lazy-image'
import { useCommonStore } from '@/store/common'
import styles from './index.module.css'
import ApplyPyramidBanner from './apply-pyramid-banner'
import BlackListTipsModal from './common/blacklist-tips-modal'
import ApplySuccessTipsModal from './common/apply-success-modal'
import PyramidRebateModal from './common/pyramid-rebate-modal'
import AgentRebateRules from './agent-rebate-rules'
import PyramidInviteManage from './invite-header/pyramid-invite-manage'
import AgentMode from './invite-header/agent-mode'
import { InviteCodeForm } from './invite-header/invite-code-form'
import AreaRebateModal from './common/area-rebate-modal'
import ThreeLevelRebateModal from './common/three-level-rebate-modal'

function AgentInviteLayout() {
  const { headerData } = useLayoutStore()
  const {
    defaultInviteCodeData: inviteCodeData,
    pyramidAgentApplyData,
    isBlackListData,
    visiblePyramidRebateSetting,
    visibleAreaRebateModal,
    visibleThreeLevelRatioModal,
    updateVisibleThreeLevelRatioModal,
    updateVisibleAreaRebateModal,
    updateDefaultInviteCodeData,
    updateVisiblePyramidRebateSetting,
    updateInviteCodeList,
    updateIsBlackListData,
    updatePyramidAgentApplyData,
    fetchAgentEnums,
  } = {
    ...useAgentInviteV3Store(),
  }
  useMount(fetchAgentEnums)
  const commonState = useCommonStore()
  const [visiblePyramidApplySuccess, setVisiblePyramidApplySuccess] = useState(false)

  /** 获取默认邀请码 */
  const { run: getDefaultInviteCode, loading } = useRequest(
    async () => {
      const res = await getAgentInviteCodeDefault({})
      if (!res.isOk) return
      const data = res?.data || {}
      updateDefaultInviteCodeData(data)
    },
    { manual: true }
  )

  const initData = async () => {
    getDefaultInviteCode()
    getPyramidAgentApplyInfo()
    getIsBlackListData()
  }

  useEffect(() => {
    initData()
  }, [])

  useEffect(() => {
    // 金字塔模式申请成功弹窗
    if (inviteCodeData?.pyramid?.showPyramidSetting) {
      setVisiblePyramidApplySuccess(true)
    }
  }, [inviteCodeData?.pyramid?.showPyramidSetting])

  useUnmount(() => {
    updateDefaultInviteCodeData(null)
    updateInviteCodeList([])
    updateIsBlackListData({})
    updatePyramidAgentApplyData({})
    updateVisiblePyramidRebateSetting(false)
    updateVisibleAreaRebateModal(false)
    updateVisibleThreeLevelRatioModal(false)
  })

  return (
    <>
      <Spin className={styles.scoped} loading={loading}>
        <div
          className="header-wrapper"
          style={{ backgroundImage: `url(${getAgentOssImageUrl('agent_invite_banner_bg', true)})` }}
        >
          <div className="invite-form-wrap">
            <div className="invite-intro-wrap">
              <div className="intro-title">{t`features_agent_index_5101353`}</div>
              <div className="rules-desc">
                <span className="pr-4">
                  {t({
                    id: 'features_agent_index_4xojbthxq2',
                    values: { 0: headerData?.businessName },
                  })}
                </span>
                <a href="#rules" className="rules-link">
                  <span>{t`features_agent_agent_invite_index_d2vurdl4ea`}</span>
                  <Icon name="transaction_arrow_hover" className="ml-1 text-sm" />
                </a>
              </div>
              <LazyImage
                className="intro-image"
                hasTheme
                imageType={Type.png}
                src={`${agentOssUrl}agent_invite_banner`}
              />
            </div>
            <div className="invite-code-wrap">
              {/* 金字塔邀请码管理 */}
              {inviteCodeData?.pyramid && <PyramidInviteManage onCallback={getDefaultInviteCode} />}
              <div className="invite-form">
                {/* 代理模式返佣比例、等级 */}
                <AgentMode />
                {/* 默认邀请码及邀请链接 */}
                <InviteCodeForm />
              </div>
            </div>
          </div>
        </div>
        <div className="footer-wrapper">
          <div className="invite-content-wrap">
            {pyramidAgentApplyData?.showBanner && pyramidAgentApplyData?.applyStatus !== ApplyStatusEnum.pass && (
              <ApplyPyramidBanner />
            )}
            <AgentRebateRules />
          </div>
        </div>
      </Spin>

      {/* 黑名单提示弹窗 */}
      {isBlackListData?.inBlacklist && <BlackListTipsModal />}

      {/* 有金字塔模式但未设置比例时展示申请成功弹窗 */}
      {visiblePyramidApplySuccess && (
        <ApplySuccessTipsModal visible={visiblePyramidApplySuccess} setVisible={setVisiblePyramidApplySuccess} />
      )}

      {/* 金字塔返佣比例设置弹窗 */}
      {visiblePyramidRebateSetting && (
        <PyramidRebateModal
          inviteCodeId={Number(inviteCodeData?.id)}
          productList={inviteCodeData?.pyramid?.products || []}
          visible={visiblePyramidRebateSetting}
          setVisible={updateVisiblePyramidRebateSetting}
          onCallback={getDefaultInviteCode}
        />
      )}

      {/* 区域返佣阶梯 */}
      {inviteCodeData?.area && (
        <AreaRebateModal visible={visibleAreaRebateModal} setVisible={updateVisibleAreaRebateModal} />
      )}
      {/* 三级代理返佣阶梯 */}
      {inviteCodeData?.threeLevel && (
        <ThreeLevelRebateModal visible={visibleThreeLevelRatioModal} setVisible={updateVisibleThreeLevelRatioModal} />
      )}
    </>
  )
}

export default AgentInviteLayout
