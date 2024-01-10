/**
 * 获取收益说明组建
 *
 */
import { ReactNode } from 'react'
import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import LazyImage from '@/components/lazy-image'
import { oss_svg_image_domain_address } from '@/constants/oss'
import { useCommonStore } from '@/store/common'
import { ThemeEnum } from '@/constants/base'
import { getAgentOssImageUrl } from '@/helper/agent/agent-invite'
import style from './index.module.css'

function ApplyEarnings({ maxValue }) {
  const ProportionalFn = () => {
    return {}
  }
  const commonState = useCommonStore()
  const agentEarnings = commonState.theme === ThemeEnum.dark ? 'agent_apply-earnings_black' : 'agent_apply-earnings'
  return (
    <div className={style.scoped}>
      <div className="agent-page">
        <div className="agent-apply-classification">
          <div className="apply-classification-box">
            <div className="apply-classification-title">{t`features_agent_apply_index_5101482`}</div>
            <div className="apply-classification-subtitle">
              {`${t`features_agent_apply_apply_earnings_index_r72wacsmqo`} ${maxValue}% ${t`features_agent_apply_apply_earnings_index_oevpan7f6a`}`}
            </div>
            <div className="agent-apply-classification-footer">
              <div className="apply-classification-footer">
                <div>
                  <div className="apply-classification-footer-box l-box">{'30%'}</div>
                  <div className="apply-classification-footer-text">{t`features_agent_apply_index_5101485`}</div>
                </div>

                <div className="plus">
                  <Icon name="leverage_increase" hasTheme fontSize={22} />
                </div>
                <div>
                  <div className="apply-classification-footer">
                    <div className="apply-classification-footer-box r-box">{'20%'}</div>
                  </div>
                  <div className="apply-classification-footer-text">{t`features_agent_apply_index_5101486`}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="agent-apply-classification-r-box">
            <div className="agent-apply-classification-img">
              <div>
                <LazyImage
                  // 设置大小防止闪动
                  height={210}
                  width={210}
                  className=""
                  src={getAgentOssImageUrl('agent_apply-earnings_code', true)}
                  // LOGO 直接显示图片，这里不需要lazy load
                  visibleByDefault
                  whetherPlaceholdImg={false}
                />
              </div>
              <div className="agent-apply-line-01"></div>
              <div className="flex">
                <div className="agent-apply-line-box">
                  <div className="agent-apply-line-02"></div>
                </div>
                <div className="agent-apply-pend">
                  <div className="relative text-center">
                    <div className="agent-apply-a">
                      <Icon name="icon_agent_pyramid_friends" hasTheme />
                    </div>
                    <div>{t`features_agent_index_5101357`} A</div>
                    <div className="absolute agent-apply-jl agent-apply-y">
                      <div>{t`features_agent_index_5101414`} 30%</div>
                      <div> {t`features_agent_apply_index_5101487`} 20% </div>
                    </div>
                  </div>
                  <div className="relative text-center">
                    <div className="agent-apply-a agent-apply-b">
                      <Icon name="icon_agent_pyramid_friends" hasTheme />
                    </div>
                    <div>{t`features_agent_index_5101357`} B</div>
                    <div className="absolute agent-apply-jl agent-apply-by">
                      <div>{t`features_agent_index_5101414`} 20%</div>
                      <div> {t`features_agent_apply_index_5101488`} 30% </div>
                    </div>

                    <div className="absolute agent-apply-line-03"></div>
                    <div className="flex absolute agent-apply-line-lf">
                      <div className="agent-apply-line-box">
                        <div className="agent-apply-line-02"></div>
                      </div>
                      <div className="agent-apply-pend">
                        <div className="relative text-center">
                          <div className="agent-apply-a">
                            <Icon name="icon_agent_pyramid_friends" hasTheme />
                          </div>
                          <div>{t`features_agent_index_5101357`} C</div>
                          <div className="absolute agent-apply-jl agent-apply-y">
                            <div>{t`features_agent_apply_index_5101488`} 10%</div>
                            <div>{t`features_agent_apply_index_5101489`} 20% </div>
                          </div>
                        </div>
                        <div className="relative text-center">
                          <div className="agent-apply-a agent-apply-b">
                            <Icon name="icon_agent_pyramid_friends" hasTheme />
                          </div>
                          <div>{t`features_agent_index_5101357`} D</div>
                          <div className="absolute agent-apply-jl agent-apply-by">
                            <div>{t`features_agent_apply_index_5101488`} 20%</div>
                            <div> {t`features_agent_apply_index_5101490`} 10% </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplyEarnings
