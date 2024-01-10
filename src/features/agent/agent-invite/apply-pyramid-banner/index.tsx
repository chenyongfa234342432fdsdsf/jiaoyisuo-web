/**
 * 邀请返佣 - 金字塔代理申请入口
 */
import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import { useAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import { ApplyStatusEnum } from '@/constants/agent/agent-invite'
import classNames from 'classnames'
import { getAgentOssImageUrl, getPyramidApplyUrl } from '@/helper/agent/agent-invite'
import { getAgentModelInfo } from '@/helper/agent/agent-center'
import styles from './index.module.css'

function ApplyPyramidBanner() {
  const { pyramidAgentApplyData, defaultInviteCodeData } = {
    ...useAgentInviteV3Store(),
  }
  const applyStatus = pyramidAgentApplyData?.applyStatus
  const getModelName = () => {
    const agentLine = defaultInviteCodeData?.agentLine || []
    let resultText = ''
    agentLine.forEach((item, index) => {
      resultText += getAgentModelInfo(item)?.modelName || ''
      if (index < agentLine.length - 1) {
        resultText += ' + '
      }
    })
    if (agentLine.length > 1) resultText += t`features_agent_agent_invite_apply_pyramid_banner_index_sawm9ol_qi`
    // resultText += t`features_agent_agent_invite_apply_pyramid_banner_index_aabo5zz6dt`
    return resultText
  }

  const getBtnTextByApplyStatus = (status: ApplyStatusEnum) => {
    switch (status) {
      case ApplyStatusEnum.noPass:
        return t`features_c2c_trade_c2c_chat_c2c_chat_window_index__e8suz5boketwopmx-hzm`
      case ApplyStatusEnum.underReview:
        return t`features/user/personal-center/account-security/index-2`
      default:
        return t`features_user_initial_person_submit_applications_index_2534`
    }
  }

  return (
    <div
      className={styles.scoped}
      style={{ backgroundImage: `url(${getAgentOssImageUrl('agent_apply_banner', false)})` }}
      onClick={() => {
        getPyramidApplyUrl()
      }}
    >
      <div className="agent-apply-wrap">
        <div className="apply-text-box">
          <div className="apply-text1">{t`features_agent_agent_invite_pyramid_apply_banner_index_tcegtz5bbn`}</div>
          <div className="apply-text2">
            {t({
              id: 'features_agent_agent_invite_pyramid_apply_banner_index_uwrc3w1cbu',
              values: { 0: getModelName() },
            })}
          </div>
        </div>
        <div className="apply-btn-box">
          <div
            className={classNames('apply-btn', {
              '!bg-warning_color': applyStatus === ApplyStatusEnum.noPass,
            })}
          >
            {getBtnTextByApplyStatus(applyStatus)}
            <Icon className="ml-2 mt-0" name="icon_vip_derivative_popups_go" fontSize={16} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplyPyramidBanner
