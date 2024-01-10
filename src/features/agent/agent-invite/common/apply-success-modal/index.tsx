/**
 * 金字塔代理申请成功弹窗
 */
import { t } from '@lingui/macro'
import { Button } from '@nbit/arco'
import LazyImage from '@/components/lazy-image'
import { useAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import AssetsPopUp from '@/features/assets/common/assets-popup'
import { getAgentOssImageUrl, onSetRebateRatio } from '@/helper/agent/agent-invite'
import { useEffect } from 'react'
import { postPyramidFirstSettingHasRead } from '@/apis/agent/agent-invite'
import { getTextFromStoreEnums } from '@/helper/store'
import Icon from '@/components/icon'
import styles from './index.module.css'

interface IApplySuccessTipsModalProps {
  visible: boolean
  setVisible: (val: boolean) => void
}

function ApplySuccessTipsModal(props: IApplySuccessTipsModalProps) {
  const { visible, setVisible } = props || {}
  const { agentEnums, productRadio } = {
    ...useAgentInviteV3Store(),
  }

  const onSetRatioClick = () => {
    onSetRebateRatio(() => {
      setVisible(false)
    })
  }

  useEffect(() => {
    if (visible) {
      // 金字塔返佣首次设置是否已读
      postPyramidFirstSettingHasRead({})
    }
  }, [])

  return (
    <AssetsPopUp
      style={{ width: 360 }}
      className={`${styles['asset-popup-reset']}`}
      closeIcon={null}
      footer={null}
      visible={visible}
      onCancel={() => {
        setVisible(false)
      }}
    >
      <div className={styles['apply-success-modal']}>
        <div className="apply-success-close-icon">
          <Icon
            name="rebates_close"
            fontSize={32}
            onClick={() => {
              setVisible(false)
            }}
          />
        </div>

        <div className="apply-success-header">
          <LazyImage
            // 设置大小防止闪动
            height={118}
            width={116}
            className="apply-header-logo"
            src={getAgentOssImageUrl('apply_agent_success', true)}
            // LOGO 直接显示图片，这里不需要lazy load
            visibleByDefault
            whetherPlaceholdImg={false}
          />

          <div className="apply-success-text">{t`features_agent_index_5101419`}</div>
        </div>

        <div className="apply-success-content">
          <div className="apply-success-box">
            <p>
              {t`features_agent_index_5101420`}
              <span className="brand">{t`features_agent_index_5101421`}</span>
              {t`features_agent_agent_invite_common_apply_success_modal_index_ed3qwxbxsl`}
            </p>
            <p className="mt-2">
              {t`features_agent_index_5101422`}
              {productRadio?.length > 0 &&
                productRadio.map((item, index) => {
                  return (
                    <span className="brand ml-1" key={item.productCd}>
                      {getTextFromStoreEnums(item?.productCd, agentEnums.agentProductCdShowRatioEnum.enums)}{' '}
                      {item?.selfRatio}%{' '}
                      {index !== productRadio.length - 1 && (
                        <span>{t`features_c2c_trade_ad_list_2222222225101679`}</span>
                      )}
                    </span>
                  )
                })}
              {t`features_agent_index_5101426`}
            </p>
            <p className="mt-3">{t`features_agent_index_5101427`}</p>
            <p className="mt-3">{t`features_agent_index_5101428`}</p>

            <div className="mt-6">
              <Button className="button" type="primary" onClick={onSetRatioClick}>
                {t`features_agent_index_5101429`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AssetsPopUp>
  )
}

export default ApplySuccessTipsModal
