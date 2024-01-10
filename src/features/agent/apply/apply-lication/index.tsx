/** *
 * 底部申请代理商组建
 */

import { oss_svg_image_domain_address } from '@/constants/oss'
import { t } from '@lingui/macro'
import { ThemeEnum } from '@/constants/base'
import { Button } from '@nbit/arco'
import { useCommonStore } from '@/store/common'
import style from './index.module.css'

function ApplyLication({ JoinClick }) {
  const commonState = useCommonStore()
  const bg_suffix = commonState.theme === ThemeEnum.dark ? 'bg_apply_agent_bottom_black' : 'bg_apply_agent_bottom_white'

  return (
    <div className={style.scoped}>
      <div
        className="footer-bg-img"
        style={{
          background: `url("${oss_svg_image_domain_address}agent/${bg_suffix}.png?x-oss-process=image/auto-orient,1/quality,q_50") center center/cover no-repeat`,
          backgroundSize: 'cover',
        }}
      >
        <div className="apply-footer-box">
          <div className="apply-footer-box-lication">
            <div>{t`features_agent_apply_apply_lication_index_ihh1fxhlxe`}</div>
            <div>{t`features_agent_apply_apply_lication_index_5duiprfzmd`}</div>
            <div>
              <Button onClick={JoinClick} className="header-box-button">
                {t`features_agent_apply_index_5101496`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplyLication
