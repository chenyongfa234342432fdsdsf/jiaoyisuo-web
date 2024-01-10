/** **
 * 申请代理商表单界面头部组建
 */
import { oss_svg_image_domain_address } from '@/constants/oss'
import { useCommonStore } from '@/store/common'
import { t } from '@lingui/macro'
import { ThemeEnum } from '@/constants/base'
import styles from './index.module.css'

function JoinHerder() {
  const commonState = useCommonStore()
  const bg_suffix = commonState?.theme === ThemeEnum.dark ? 'bg_agent_apply_black' : 'bg_agent_apply_white' // 区分深色模式图片
  return (
    <div
      className={styles.scoped}
      style={{
        background: `url("${oss_svg_image_domain_address}agent/${bg_suffix}.png?x-oss-process=image/auto-orient,1/quality,q_50") center center/cover no-repeat`,
        backgroundSize: 'cover',
      }}
    >
      <div className="header">
        <div className="herder-page">
          <div className="header-box">
            <div className="header-box-text">{t`features_agent_join_join_herder_index_ct1bdqlbow`}</div>
            <div className="header-box-sub-text">{t`features_agent_join_join_herder_index_zkrvrkxerz`}</div>
          </div>
        </div>
        <div className="herder-left"></div>
      </div>
    </div>
  )
}

export default JoinHerder
