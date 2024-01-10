/**
 * 金字塔返佣比例设置弹窗
 */
import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import { Alert, Button, Message } from '@nbit/arco'
import Slider from '@/features/assets/futures/common/slider'
import { useEffect, useState } from 'react'
import { useAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import { postPyramidInviteCodeRatio } from '@/apis/agent/agent-invite'
import { cloneDeep } from 'lodash'
import { getTextFromStoreEnums } from '@/helper/store'
import { IPyramidInviteCodeRatios } from '@/typings/api/agent/agent-invite'
import { generateRatio } from '@/helper/agent/agent-invite'
import { getAgentCenterSetRebateRatioByUid } from '@/apis/agent/agent-center'
import { MarkcoinResponse } from '@/plugins/request'
import { ErrorTypeEnum } from '@/constants/assets'
import AssetsPopUp from '@/features/assets/common/assets-popup'
import styles from './index.module.css'

interface IAgentRatioModalProps {
  /** 查邀请码返佣比例，邀请码 id 和 uid 二选一 */
  inviteCodeId?: number
  /** 查 uid 好友返佣比例 */
  uid?: string
  /** 产品返佣比例 */
  productList: IPyramidInviteCodeRatios[]
  visible: boolean
  setVisible: (val: boolean) => void
  onCallback?: (val?) => void
}
function PyramidRebateModal(props: IAgentRatioModalProps) {
  const { visible, setVisible, inviteCodeId, uid, productList, onCallback } = props || {}
  const { agentEnums, updateVisiblePyramidRebateSetting } = {
    ...useAgentInviteV3Store(),
  }
  const [productRatios, setProductRatios] = useState<IPyramidInviteCodeRatios[]>([]) // 产品线数据

  function formatTooltip(val) {
    return <span>{val}%</span>
  }

  /**
   * 新增修改方法
   */
  const onUpdateRebateRatio = async () => {
    const ratioList = productRatios?.map(row => ({
      productCd: row?.productCd,
      selfRatio: Number(row?.selfRatio),
      childRatio: Number(row.childRatio),
    }))
    let res = {} as MarkcoinResponse
    // 通过 uid 设置返佣比例
    if (uid) {
      res = await getAgentCenterSetRebateRatioByUid({
        uid,
        rebateRatio: ratioList,
      })
    }

    // 通过邀请码设置返佣比例
    if (inviteCodeId) {
      res = await postPyramidInviteCodeRatio({
        invitationCodeId: inviteCodeId,
        ratios: ratioList,
      })
    }

    if (res?.isOk && res?.data) {
      setVisible(false)
      updateVisiblePyramidRebateSetting(false)
      onCallback && onCallback()
      Message.success(t`features/user/personal-center/settings/converted-currency/index-0`)
    }
  }

  function onSliderChange(key, _percent) {
    const copyList = cloneDeep(productRatios)
    copyList.forEach(item => {
      if (key === item.productCd) {
        const maxRatio = Number(item?.selfRatio) + Number(item?.childRatio)
        item.childRatio = _percent
        item.selfRatio = Number(maxRatio) - Number(_percent)
      }
    })
    setProductRatios(copyList)
  }

  useEffect(() => {
    setProductRatios(productList || [])
  }, [inviteCodeId])

  return (
    <AssetsPopUp
      closeIcon={null}
      footer={null}
      style={{ width: 444 }}
      className={styles['agent-modal']}
      visible={visible}
    >
      <div className="set-ratio">
        <div className="set-ratio-header">
          <div className="set-ratio-header-title">{t`features_agent_index_5101411`}</div>
          <div>
            <Icon
              name="close"
              hasTheme
              fontSize={18}
              onClick={() => {
                setVisible(false)
                updateVisiblePyramidRebateSetting(false)
              }}
            />
          </div>
        </div>

        <div className="set-ratio-content">
          <Alert
            icon={<Icon name="msg" />}
            className="set-radio-alert"
            content={<div className="set-radio-alert-label">{t`features_agent_index_5101412`}</div>}
            type="info"
          />

          {productRatios.length > 0 &&
            productRatios.map(item => (
              <div className="set-radio-form-item" key={item.productCd}>
                <div className="set-radio-slider">
                  <div className="set-radio-slider-header">
                    {getTextFromStoreEnums(item?.productCd, agentEnums.agentProductCdRatioEnum.enums)}
                    {t`features_agent_referral_ratio_modal_index_mia6tmunaz`}
                    <span>{Number(item?.selfRatio) + Number(item?.childRatio)}%</span>
                  </div>
                  <div className="set-radio-slider-content">
                    <Slider
                      className="slider-wrap"
                      marks={generateRatio(Number(item?.selfRatio) + Number(item?.childRatio))}
                      max={Number(item?.selfRatio) + Number(item?.childRatio)}
                      value={item?.childRatio}
                      onChange={(val: number) => {
                        if (uid) {
                          const minVal = productList?.find(v => v.productCd === item.productCd)?.childRatio || 0
                          if (val < minVal) {
                            Message.warning({
                              content: t`features_agent_referral_ratio_modal_ratio_slider_index_yex4uvnntu`,
                              id: ErrorTypeEnum.uncategorizedError,
                            })
                            return
                          }
                        }
                        onSliderChange(item?.productCd, Number(val))
                      }}
                      formatTooltip={formatTooltip}
                    />
                  </div>
                  <div className="set-radio-slider-footer">
                    <div className="set-radio-slider-footer-text">
                      {t`features_agent_index_5101414`}{' '}
                      <span className="set-radio-slider-footer-highlight">{Number(item?.selfRatio)}%</span>
                    </div>
                    <div className="set-radio-slider-footer-text">
                      {t`features_agent_index_5101357`}{' '}
                      <span className="set-radio-slider-footer-highlight">{item?.childRatio}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="set-ratio-footer">
          <Button
            className="button"
            type="secondary"
            onClick={() => {
              setVisible(false)
              updateVisiblePyramidRebateSetting(false)
            }}
          >
            {t`trade.c2c.cancel`}
          </Button>
          <Button className="button" type="primary" onClick={onUpdateRebateRatio}>
            {t`components_chart_header_data_2622`}
          </Button>
        </div>
      </div>
    </AssetsPopUp>
  )
}
export default PyramidRebateModal
