/**
 * 返佣细则
 */
import { t } from '@lingui/macro'
import LazyImage from '@/components/lazy-image'
import { oss_svg_image_domain_address_agent } from '@/constants/oss'
import Icon from '@/components/icon'
import styles from './index.module.css'
import RuleDetails from './rule-details'

function AgentRebateRules() {
  const infoList = [
    {
      imgUrl: 'agent_invite_friends.png',
      label: t`features_agent_index_5101375`,
      text: t`features_agent_index_5101376`,
    },
    {
      imgUrl: 'agent_invite_register.png',
      label: t`features_agent_index_5101377`,
      text: t`features_agent_index_5101378`,
    },
    {
      imgUrl: 'agent_invite_reward.png',
      label: t`features_agent_index_5101379`,
      text: t`features_agent_index_5101380`,
    },
  ]

  return (
    <div className={styles.scoped}>
      <div className="section" id="rules">
        <div className="share-card">
          <div className="share-card-header">
            <p className="share-card-header-text">
              {t`features_agent_index_5101373`}
              {t`features_agent_index_5101374`}?
            </p>
          </div>
          <div className="share-card-content">
            <Icon className="line line-left" name="image_agent_next" hasTheme />
            <Icon className="line line-right" name="image_agent_next" hasTheme />
            {infoList?.map((item, index) => {
              return (
                <div className="share-card-item" key={index}>
                  <div className="share-card-item-header">
                    <LazyImage width={90} height={90} src={`${oss_svg_image_domain_address_agent}v3/${item?.imgUrl}`} />
                  </div>
                  <div className="share-card-item-content">{item?.label}</div>
                  <div className="share-card-item-footer">
                    <p>{item?.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <RuleDetails />
    </div>
  )
}

export default AgentRebateRules
