/** *
 * 金字塔代理申请头部组建
 */

import { t } from '@lingui/macro'
import { oss_svg_image_domain_address } from '@/constants/oss'
import { useCommonStore } from '@/store/common'
import { ThemeEnum } from '@/constants/base'
import { Button } from '@nbit/arco'
import LazyImage from '@/components/lazy-image'
import style from './index.module.css'

function ApplyHerder({ eventJoinClick }) {
  const commonState = useCommonStore()
  const bg_suffix = commonState.theme === ThemeEnum.dark ? 'agent_apply_balk_light' : 'agent_apply_bg_light'

  return (
    <div className={style.scoped}>
      <div
        className="herder-bg-img"
        style={{
          background: `url("${oss_svg_image_domain_address}agent/${bg_suffix}.png?x-oss-process=image/auto-orient,1/quality,q_50") center center/cover no-repeat`,
          backgroundSize: 'cover',
        }}
      >
        <div className="header">
          <div className="header-box">
            <div className="header-box-primary">{t`features_agent_apply_apply_herder_index_rgejuwtwpg`}</div>
            <div className="header-box-second">{t`features_agent_apply_apply_herder_index_5l1yb_j4tl`}</div>
            <Button className="header-box-button" onClick={eventJoinClick}>
              {t`features_agent_apply_index_5101496`}
            </Button>
          </div>
          <div className="herder-img">
            <LazyImage
              height={250}
              width={250}
              src={`${oss_svg_image_domain_address}${'agent/agent_apply_ herder_right.png'}`}
              visibleByDefault
              whetherPlaceholdImg={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplyHerder
