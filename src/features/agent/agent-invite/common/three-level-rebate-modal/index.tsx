/**
 * 三级返佣阶梯弹框
 */
import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import AssetsPopUp from '@/features/assets/common/assets-popup'
import { Button } from '@nbit/arco'
import { useEffect } from 'react'
import { getRebateLadderData, getUserRebateLevelText } from '@/helper/agent/agent-invite'
import { AgentModalTypeEnum, getAgentLevelIconName } from '@/constants/agent/agent-center'
import { useAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import { getTextFromStoreEnums } from '@/helper/store'
import { AgentGradeConditionEnum, AgentGradeUnitEnum } from '@/constants/agent/agent-invite'
import styles from '../area-rebate-modal/index.module.css'

interface IThreeLevelRebateModalProps {
  visible: boolean
  setVisible: (val: boolean) => void
}
function ThreeLevelRebateModal(props: IThreeLevelRebateModalProps) {
  const { visible, setVisible } = props || {}
  const { rebateLadderThreeLevel: rebateLadderData, agentEnums } = { ...useAgentInviteV3Store() }
  const data = rebateLadderData?.threeLiveRebateRatioList || []

  useEffect(() => {
    getRebateLadderData(AgentModalTypeEnum.threeLevel)
  }, [])

  return (
    <AssetsPopUp
      title={t`features_agent_agent_invite_common_three_level_rebate_modal_index_u7t_jbas9k`}
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
                  <div className="ratio-info">
                    <div className="grade">
                      {t`features_agent_agent_invite_invite_header_agent_model_index_huadwtlbyr`}
                      <span>{item?.oneRebateRatio}%</span>
                    </div>
                    <div className="grade">
                      {t`features_agent_agent_invite_invite_header_agent_model_index_ephj5yutej`}
                      <span>{item?.twoRebateRatio}%</span>
                    </div>
                    <div className="grade">
                      {t`features_agent_agent_invite_invite_header_agent_model_index_ib52hqfaqs`}
                      <span>{item?.threeRebateRatio}%</span>
                    </div>
                  </div>
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
                          {getTextFromStoreEnums(rules?.codeKey || '', agentEnums.agentThreeGradeRulesEnum.enums)}
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
                              getTextFromStoreEnums(rules?.codeKey || '', agentEnums.agentThreeGradeRulesEnum.enums)
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
            {t`features_agent_agent_invite_common_three_level_rebate_modal_index_rjqzndlwzr`}
          </p>
          <p>
            <span></span>
            {t`features_agent_agent_invite_common_three_level_rebate_modal_index_4welcrrgxz`}
          </p>
          <p>
            <span></span>
            {t`features_agent_agent_invite_common_three_level_rebate_modal_index_jq4ixikxj7`}
          </p>
          <p>
            <span></span>
            {t`features_agent_agent_invite_common_area_rebate_modal_index_n9dqahwabz`}
            {rebateLadderData?.upgrade} {t`features_agent_agent_invite_common_area_rebate_modal_index_yqspdwnene`}
          </p>
          <p>
            <span></span>
            {t`features_agent_agent_invite_common_area_rebate_modal_index_ml0xxle72e`}
            {rebateLadderData?.demotion}
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

export default ThreeLevelRebateModal
