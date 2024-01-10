/**
 * 区域返佣阶梯弹框
 */
import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import { Button } from '@nbit/arco'
import AssetsPopUp from '@/features/assets/common/assets-popup'
import { useEffect } from 'react'
import { getRebateLadderData, getUserRebateLevelText } from '@/helper/agent/agent-invite'
import { AgentModalTypeEnum, getAgentLevelIconName } from '@/constants/agent/agent-center'
import { useAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import { getTextFromStoreEnums } from '@/helper/store'
import { AgentGradeConditionEnum, AgentGradeUnitEnum } from '@/constants/agent/agent-invite'
import styles from './index.module.css'

interface IAreaRebateModalProps {
  visible: boolean
  setVisible: (val: boolean) => void
}
function AreaRebateModal(props: IAreaRebateModalProps) {
  const { visible, setVisible } = props || {}
  const { rebateLadderArea: rebateLadderData, agentEnums } = { ...useAgentInviteV3Store() }
  const data = rebateLadderData?.areaRebateRatioList || []

  useEffect(() => {
    getRebateLadderData(AgentModalTypeEnum.area)
  }, [])

  return (
    <AssetsPopUp
      title={t`features_agent_agent_invite_common_area_rebate_modal_index_uiduz_tdkk`}
      visible={visible}
      footer={null}
      onCancel={() => {
        setVisible(false)
      }}
      onOk={() => {
        setVisible(false)
      }}
      okText={t`features_trade_spot_index_2510`}
    >
      <div className={styles['rebate-ladder-root']}>
        <div className="rebate-ladder-wrap">
          {data.map(item => {
            const conData = item?.conData?.upDownLiveDataRespDTO || []
            return (
              <div className="rebate-ladder-item" key={item?.live}>
                <div className="grade-ratio">
                  <Icon className="grade-icon" name={getAgentLevelIconName(Number(item?.live)) || ''} />
                  <span className="ml-4">{item?.rebateRatio}%</span>
                  {Number(item?.live) === Number(rebateLadderData?.live) && (
                    <Icon className="active-grade-icon" name="login_satisfied" />
                  )}
                </div>
                <div className="desc">
                  <p>
                    {conData.map((rules, index) => {
                      return (
                        <label key={rules?.codeKey}>
                          {index !== 0 && (
                            <label>
                              {rules?.condition?.toLocaleUpperCase() === AgentGradeConditionEnum.or
                                ? t`user.third_party_01`
                                : t`features_agent_agent_invite_common_area_rebate_modal_index_mrmvnf8y44`}
                            </label>
                          )}
                          {getTextFromStoreEnums(rules?.codeKey || '', agentEnums.agentAreaGradeRulesEnum.enums)}
                          <span>{rules?.val}</span>
                          {rules?.codeKey === AgentGradeUnitEnum.teamSize
                            ? t`constants_agent_agent_invite_index_e7nudlmsny`
                            : rebateLadderData?.currencySymbol}
                        </label>
                      )
                    })}
                  </p>
                  {Number(item?.live) === Number(rebateLadderData?.live) + 1 && (
                    <p>
                      {conData.map((rules, index) => {
                        return (
                          <label key={`user_${rules?.codeKey}`}>
                            {getUserRebateLevelText(
                              rules?.codeKey,
                              getTextFromStoreEnums(rules?.codeKey || '', agentEnums.agentAreaGradeRulesEnum.enums)
                            )}
                            <span>{rebateLadderData[rules?.codeKey || '']}</span>
                            <label>
                              {rules?.codeKey === AgentGradeUnitEnum.teamSize
                                ? t`constants_agent_agent_invite_index_e7nudlmsny`
                                : rebateLadderData?.currencySymbol}
                            </label>
                            {index + 1 < conData.length && <label>、</label>}
                          </label>
                        )
                      })}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className="rebate-rules">
          <p>
            <span></span>
            {t`features_agent_agent_invite_common_area_rebate_modal_index_nx0jnpkzey`}
          </p>
          <p>
            <span></span>
            {t`features_agent_agent_invite_common_area_rebate_modal_index_7zs__untwm`}
          </p>
          <p>
            <span></span>
            {t`features_agent_agent_invite_common_area_rebate_modal_index_n9dqahwabz`}
            {rebateLadderData?.upgrade} {t`features_agent_agent_invite_common_area_rebate_modal_index_yqspdwnene`}
          </p>
          <p>
            <span></span>
            {t`features_agent_agent_invite_common_area_rebate_modal_index_ml0xxle72e`} {rebateLadderData?.demotion}{' '}
            {t`features_agent_agent_invite_common_area_rebate_modal_index_gjqibcbnro`}
            {rebateLadderData?.demotion} {t`features_agent_agent_invite_common_area_rebate_modal_index_5wn2zsdlog`}
          </p>
        </div>
      </div>

      <div className="footer">
        <Button
          type="primary"
          onClick={() => {
            setVisible(false)
          }}
        >
          {t`features_trade_spot_index_2510`}
        </Button>
      </div>
    </AssetsPopUp>
  )
}

export default AreaRebateModal
