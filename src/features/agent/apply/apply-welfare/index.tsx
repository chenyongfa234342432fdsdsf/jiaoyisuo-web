/**
 *  代理商福利说明组建
 */

import { ReactNode } from 'react'
import { oss_svg_image_domain_address } from '@/constants/oss'
import { t } from '@lingui/macro'
import LazyImage from '@/components/lazy-image'
import Icon from '@/components/icon'
import style from './index.module.css'

function ApplyWelfare() {
  type ListItemType = {
    icon: ReactNode
    title: string
    content: string
  }

  const getListItem = ({ icon, title, content }: ListItemType) => {
    return (
      <div className="list-item">
        <div className="list-item-l-box">
          <div className="list-item-icon">{icon}</div>
        </div>
        <div className="list-item-r-box">
          <div className="list-item-title">{title}</div>
          <div className="list-item-content">{content}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={style.scoped}>
      <div className="agent-apply-content agent-page">
        <div className="agent-apply-welfare">
          <div className="agent-apply-content-l-box">
            <div>
              <div className="agent-apply-content-title">{t`features_agent_apply_apply_welfare_index_k6unhlwi0y`}</div>
              <div className="agent-apply-content-subtitle">
                {t`features_agent_apply_apply_welfare_index_mm0e8ylk8d`}
              </div>
              <div className="listitem-box">
                {getListItem({
                  icon: <Icon fontSize={25} name="icon_agent_pyramid_pattern" hasTheme />,
                  title: t`features_agent_apply_index_5101476`,
                  content: t`features_agent_apply_index_5101477`,
                })}
                {getListItem({
                  icon: <Icon fontSize={25} name="icon_agent_pyramid_reward" hasTheme />,

                  title: t`features_agent_apply_index_5101478`,
                  content: t`features_agent_apply_index_5101479`,
                })}
                {getListItem({
                  icon: <Icon fontSize={25} name="icon_agent_pyramid_transparency" hasTheme />,

                  title: t`features_agent_apply_index_5101480`,
                  content: t`features_agent_apply_index_5101481`,
                })}
              </div>
            </div>
          </div>
          <div className="agent-apply-content-r-box">
            <LazyImage
              // 设置大小防止闪动
              height={240}
              width={240}
              className=""
              src={`${oss_svg_image_domain_address}${'agent/agent_apply_welfare.png'}`}
              // LOGO 直接显示图片，这里不需要lazy load
              visibleByDefault
              whetherPlaceholdImg={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplyWelfare
