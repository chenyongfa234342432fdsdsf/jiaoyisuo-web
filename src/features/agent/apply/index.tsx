import { ReactNode, useState, useEffect } from 'react'
import { Button, Message } from '@nbit/arco'
import { t } from '@lingui/macro'
import { oss_svg_image_domain_address } from '@/constants/oss'
import Icon from '@/components/icon'
import { link } from '@/helper/link'
import { useAgentStore } from '@/store/agent'
import { useAgentUserInBlacklist } from '@/hooks/features/agent'
import { fetchAgentPyramidMaxRatio } from '@/apis/agent/agent-invite/apply'
import { getListItemTop20, ListItemTop20Type } from '../list-items'
import CustomModal from '../modal'
import styles from './index.module.css'
import ApplyHerder from './apply-herder'
import ApplyStrps from './apply-steps'
import ApplyWelfare from './apply-welfare'
import ApplyEarnings from './apply-earnings'
import ApplyLication from './apply-lication'

function UserPersonalCenterAgentApply() {
  useAgentUserInBlacklist()
  const store = useAgentStore()
  const isInBlackList = store.userInBlackListInfo.onTheBlacklist
  const [maxValue, setMaxValue] = useState<number>(0)
  const [top20, setTop20] = useState<ListItemTop20Type[]>([]) // Top20 列表
  const [isShowTop20, setShowTop20] = useState<boolean>(false)
  const [isShowTopRule, setShowTopRule] = useState<boolean>(false)

  function onJoinClick() {
    if (isInBlackList) {
      Message.warning(t`features_agent_apply_index_yuzdqvpqnn`)
      return
    }

    link('/agent/join')
  }

  /**
   * 获取金字塔最大比例
   */
  const getAgentPyramidMaxRatio = async () => {
    const res = await fetchAgentPyramidMaxRatio({})
    if (res.isOk && res.data) {
      setMaxValue(res.data?.maxRatio || 0)
    }
  }
  useEffect(() => {
    getAgentPyramidMaxRatio()
  }, [])

  return (
    <section className={`personal-center-agent-apply ${styles.scoped}`}>
      <ApplyHerder eventJoinClick={onJoinClick} />
      <div className="section">
        <div className="share-card agent-page">
          <ApplyStrps />
        </div>
        <div>
          <ApplyWelfare />
        </div>
        <div>
          <ApplyEarnings maxValue={maxValue} />
        </div>
        <div>
          <ApplyLication JoinClick={onJoinClick} />
        </div>
      </div>
      {/* Top 20 弹窗 */}
      <CustomModal style={{ width: 444 }} className={styles['agent-apply-modal']} visible={isShowTop20}>
        <div className="ranking">
          <div className="ranking-close-icon">
            {/* <Icon name="rebates_close" fontSize={32} onClick={() => setShowTop20(false)} /> */}
            <Icon name="close" hasTheme fontSize={22} onClick={() => setShowTop20(false)} />
          </div>

          <div
            className="ranking-header"
            style={{
              background: `url("${oss_svg_image_domain_address}${'agent/ranking_bj.png?x-oss-process=image/auto-orient,1/quality,q_50'}") center center/cover no-repeat`,
            }}
          >
            <div className="ranking-header-title">{t`features_agent_apply_index_5101491`}</div>
            <div className="ranking-header-text">{t`features_agent_apply_index_5101497`}</div>
            <div className="ranking-header-rule" onClick={() => setShowTopRule(true)}>
              {t`features_agent_apply_index_5101498`}
              <Icon name="transaction_arrow_hover" fontSize={14} />
            </div>
          </div>

          <div className="ranking-content">
            <div className="ranking-content-listitems">{getListItemTop20(top20)}</div>
          </div>
        </div>
      </CustomModal>
      {/* Top 20 弹窗规则 */}
      <CustomModal style={{ width: 360 }} className={styles['agent-apply-modal']} visible={isShowTopRule}>
        <div className="ranking-rule">
          <p className="ranking-rule-text">
            {t`features_agent_apply_index_5101499`}
            <span className="ranking-rule-text-highlight">{t`features_agent_apply_index_5101500`}</span>
          </p>
          <Button className="ranking-rule-button" type="primary" onClick={() => setShowTopRule(false)}>
            {t`features_agent_apply_index_5101501`}
          </Button>
        </div>
      </CustomModal>
    </section>
  )
}

export default UserPersonalCenterAgentApply
