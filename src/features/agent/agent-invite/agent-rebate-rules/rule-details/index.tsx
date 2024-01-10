import { t } from '@lingui/macro'
import { getAgentRebateRule } from '@/apis/agent/agent-invite'
import { useEffect, useState } from 'react'
import { IAgentRebateRuleResp } from '@/typings/api/agent/agent-invite'
import { getAgentCenterModalTypeName } from '@/constants/agent/agent-center'
import styles from './index.module.css'

function RuleDetails() {
  const [rebateRules, setRebateRules] = useState<IAgentRebateRuleResp>({} as IAgentRebateRuleResp)
  const getRebateRules = async () => {
    const res = await getAgentRebateRule({})
    const { isOk, data } = res || {}

    if (!isOk || !data) {
      return
    }

    setRebateRules(data)
  }

  useEffect(() => {
    getRebateRules()
  }, [])

  return (
    <div className={styles.scoped}>
      <div className="footer-text">
        {Object.keys(rebateRules).map(productCd => {
          if (!rebateRules[productCd]) return
          return (
            <div className="mb-8" key={productCd}>
              <p className="footer-h1">
                {getAgentCenterModalTypeName(productCd)}
                {t`features_agent_agent_invite_agent_rebate_rules_rule_details_index_gd8zxadh89`}
              </p>
              <div
                className="mt-4"
                dangerouslySetInnerHTML={{
                  __html: rebateRules[productCd],
                }}
              ></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RuleDetails
