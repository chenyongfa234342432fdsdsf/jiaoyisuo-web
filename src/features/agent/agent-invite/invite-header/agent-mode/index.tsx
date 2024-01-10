/**
 * 代理模式 - 邀请比例及代理等级
 */
import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import { useState } from 'react'
import { useAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import { ApplyStatusEnum, getAgentLevelIconName } from '@/constants/agent/agent-invite'
import { getTextFromStoreEnums } from '@/helper/store'
import { AgentModalTypeEnum } from '@/constants/agent/agent-center'
import { getPyramidApplyUrl, onSetRebateRatio } from '@/helper/agent/agent-invite'

function AgentMode() {
  const agentInviteStore = useAgentInviteV3Store()
  const {
    defaultInviteCodeData: inviteCodeData,
    pyramidAgentApplyData,
    agentEnums,
    updateVisibleAreaRebateModal,
    updateVisibleThreeLevelRatioModal,
  } = {
    ...agentInviteStore,
  }
  const [visibleMorePyramidRebate, setVisibleMorePyramidRebate] = useState(true)
  const pyramidData = inviteCodeData?.pyramid
  const pyramidMoreProducts =
    pyramidData && pyramidData.products && pyramidData.products.length >= 2 ? pyramidData.products.slice(1) : []
  const visiblePyramidRebate =
    (inviteCodeData?.agentLine?.includes(AgentModalTypeEnum.pyramid) &&
      Number(inviteCodeData?.agentLine?.length) <= 1) ||
    (Number(inviteCodeData?.agentLine?.length) > 1 && inviteCodeData?.pyramid)
  return (
    <>
      {visiblePyramidRebate && (
        <>
          <div className="invite-model">
            <div className="model-name">
              {t`features_agent_agent_invite_invite_header_agent_model_index_l2n0panzst`}
              {inviteCodeData?.pyramid && (
                <Icon
                  name="modify_icon"
                  className="text-sm ml-2"
                  onClick={() => {
                    onSetRebateRatio()
                  }}
                />
              )}
            </div>
            {!inviteCodeData?.pyramid && pyramidAgentApplyData?.applyStatus !== ApplyStatusEnum.underReview && (
              <div
                className="text-warning_color cursor-pointer"
                onClick={() => {
                  getPyramidApplyUrl()
                }}
              >{t`features_agent_agent_invite_invite_header_agent_mode_index_xmt5tx0qod`}</div>
            )}
          </div>
          <div className="pyramid-product-rebate">
            {pyramidData?.products && pyramidData?.products.length >= 1 && (
              <div className="rebate-ratio-item">
                <div className="label">
                  {getTextFromStoreEnums(
                    pyramidData?.products[0].productCd,
                    agentEnums.agentProductCdShowRatioEnum.enums
                  )}
                </div>
                <div className="value">
                  {t`features_agent_agency_center_invitation_details_index_5101545`}{' '}
                  {pyramidData?.products[0]?.selfRatio}%<span className="mx-1">/</span>
                  {t`features_agent_index_5101357`} {pyramidData?.products[0]?.childRatio}%
                  <span className="opt">
                    <Icon
                      name={visibleMorePyramidRebate ? 'icon_agent_away' : 'icon_agent_drop'}
                      hasTheme
                      className="text-xs pl-2"
                      onClick={() => {
                        setVisibleMorePyramidRebate(!visibleMorePyramidRebate)
                      }}
                    />
                  </span>
                </div>
              </div>
            )}

            {visibleMorePyramidRebate &&
              pyramidMoreProducts &&
              pyramidMoreProducts.map(item => (
                <div key={item?.productCd} className="rebate-ratio-item">
                  <div className="label">
                    {getTextFromStoreEnums(item?.productCd, agentEnums.agentProductCdShowRatioEnum.enums)}
                  </div>
                  <div className="value">
                    {t`features_agent_agency_center_invitation_details_index_5101545`} {item?.selfRatio}%
                    <span className="mx-1">/</span>
                    {t`features_agent_index_5101357`} {item?.childRatio}%<span className="opt"></span>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
      {inviteCodeData?.area && (
        <div className="invite-model">
          <div className="model-name">{t`features_agent_agent_invite_invite_header_agent_model_index_r_hla8wz2d`}</div>
          <div className="model-grade">
            <div className="my-grade">
              <Icon name={getAgentLevelIconName(inviteCodeData?.area?.grade) || ''} />
            </div>
            <div className="ratio-info ml-2">
              <div className="grade">
                <span>{inviteCodeData?.area?.ratio}%</span>
              </div>
            </div>
            <Icon
              name="msg"
              hasTheme
              className="msg-icon"
              onClick={() => {
                updateVisibleAreaRebateModal(true)
              }}
            />
          </div>
        </div>
      )}
      {inviteCodeData?.threeLevel && (
        <div className="invite-model">
          <div className="model-name">{t`features_agent_agent_invite_invite_header_agent_model_index_ursiyemtln`}</div>
          <div className="model-grade">
            <div className="my-grade">
              <Icon name={getAgentLevelIconName(inviteCodeData?.threeLevel?.grade) || ''} className="mr-3" />
            </div>
            <div className="ratio-info">
              <div className="grade">
                {t`features_agent_agent_invite_invite_header_agent_model_index_huadwtlbyr`}
                <span>{inviteCodeData?.threeLevel?.firstLevelRatio}%</span>
              </div>
              <div className="grade">
                {t`features_agent_agent_invite_invite_header_agent_model_index_ephj5yutej`}
                <span>{inviteCodeData?.threeLevel?.secondLevelRatio}%</span>
              </div>
              <div className="grade">
                {t`features_agent_agent_invite_invite_header_agent_model_index_ib52hqfaqs`}
                <span>{inviteCodeData?.threeLevel?.thirdLevelRatio}%</span>
              </div>
            </div>
            <Icon
              name="msg"
              hasTheme
              className="msg-icon"
              onClick={() => {
                updateVisibleThreeLevelRatioModal(true)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default AgentMode
