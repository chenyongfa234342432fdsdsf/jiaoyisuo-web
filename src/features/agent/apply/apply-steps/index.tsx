/**
 * 中间区域申请步骤说明组建
 */

import LazyImage from '@/components/lazy-image'
import { oss_svg_image_domain_address } from '@/constants/oss'
import { ReactNode } from 'react'
import { useCommonStore } from '@/store/common'
import { t } from '@lingui/macro'
import { useLayoutStore } from '@/store/layout'
import { ThemeEnum } from '@/constants/base'
import { getAgentOssImageUrl } from '@/helper/agent/agent-invite'
import style from './index.module.css'

type CardItemType = {
  icon: ReactNode
  text: string
  badge: string
}

function ApplyStrps() {
  const commonState = useCommonStore()
  const { headerData } = useLayoutStore()
  const getCardItem = ({ icon, text, badge }: CardItemType) => {
    return (
      <div className="share-card-item">
        <div className="share-card-item-header">
          {icon}
          {/* <div className="share-card-item-badge">{badge}</div> */}
        </div>
        <div className="share-card-item-content">{text}</div>
      </div>
    )
  }
  return (
    <div className={style.scoped}>
      <div className="share-card-content">
        <div className="line1">
          <LazyImage
            // 设置大小防止闪动
            height={22}
            width={248}
            className=""
            src={getAgentOssImageUrl('agen_step', true)}
            // LOGO 直接显示图片，这里不需要lazy load
            visibleByDefault
            whetherPlaceholdImg={false}
          />
        </div>
        <div className="line2">
          <LazyImage
            height={22}
            width={248}
            className=""
            src={getAgentOssImageUrl('agen_step', true)}
            visibleByDefault
            whetherPlaceholdImg={false}
          />
        </div>
        {getCardItem({
          icon: (
            <LazyImage
              height={90}
              width={90}
              className="share-card-code"
              src={getAgentOssImageUrl('agent_invite_application_code', true)}
              visibleByDefault
              whetherPlaceholdImg={false}
            />
          ),
          text: t`features_agent_apply_apply_steps_index_m6mg18wr61`,
          badge: '',
        })}
        {getCardItem({
          icon: (
            <LazyImage
              height={90}
              width={90}
              className=""
              src={getAgentOssImageUrl('agent_invite_Audit_code', true)}
              visibleByDefault
              whetherPlaceholdImg={false}
            />
          ),
          text: t({ id: 'features_agent_apply_index_5101470', values: { 0: headerData?.businessName } }),
          badge: '',
        })}
        {getCardItem({
          icon: (
            <LazyImage
              height={90}
              width={90}
              className="share-card-hy"
              src={getAgentOssImageUrl('agent_Invitation_hy', true)}
              visibleByDefault
              whetherPlaceholdImg={false}
            />
          ),
          text: t`features_agent_apply_apply_steps_index_nboip4_w_r`,
          badge: '',
        })}
      </div>
    </div>
  )
}

export default ApplyStrps
