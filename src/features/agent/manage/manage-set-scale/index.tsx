/**
 * 代理商 -  设置金字塔佣金比例组建
 */
import CustomModal from '@/features/agent/modal'
import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import { Button, Alert, Slider, Checkbox, Input, Message } from '@nbit/arco'
import { AgentProductRatioDate } from '@/typings/api/agent/agent-invite/apply'
import { generateRatio } from '@/helper/agent/agent-invite'
import { ErrorTypeEnum } from '@/constants/assets'
import styles from './index.module.css'

interface formModalType {
  name: string // 邀请码名称
  ratios: {
    productCd: string
    selfRatio: number
    childRatio: number
  }[]
  isDefault: boolean // 是否默认
  childRatio: number // 好友比例
}

interface Props {
  isShowSetRatio: boolean
  touchId: string
  onIsShowSetRatio?: (isShow: boolean) => void
  formModal?: formModalType
  onChangeFormModal?: (val?: string) => void
  onCheboxFormModal?: (isDefault?: boolean) => void
  AddOrUpdate?: () => void
  productList: Array<AgentProductRatioDate>
  onSliderChange?: (valString?: string, num?: number) => void
  productRebateList?: Array<AgentProductRatioDate>
  loading?: boolean
}

function formatTooltip(val) {
  return <span>{val}%</span>
}
function ManageSetScale({
  isShowSetRatio,
  touchId,
  onIsShowSetRatio,
  formModal,
  onChangeFormModal,
  onCheboxFormModal,
  AddOrUpdate,
  productList,
  onSliderChange,
  productRebateList,
  loading,
}: Props) {
  return (
    <CustomModal style={{ width: 444 }} className={styles['agent-manage-scale']} visible={isShowSetRatio}>
      <div className="set-ratio">
        <div className="set-ratio-header">
          <div className="set-ratio-header-title">
            {!touchId ? t`features_agent_manage_index_5101440` : t`features_agent_index_5101411`}
          </div>
          <div>
            <Icon name="close" hasTheme fontSize={18} onClick={() => onIsShowSetRatio?.(false)} />
          </div>
        </div>

        <div className="set-ratio-content">
          {touchId && (
            <Alert
              icon={<Icon name="msg" className="msg" fontSize={12} />}
              className="set-radio-alert"
              content={<div className="set-radio-alert-label">{t`features_agent_index_5101412`}</div>}
              type="info"
            />
          )}
          {!touchId && (
            <div className="set-radio-form-item">
              <div className="set-radio-header">
                <span>*</span>
                {t`features_agent_manage_index_wsavb4wy6a`}
              </div>
              <div className="set-radio-input-box">
                <Input
                  className="set-radio-input"
                  maxLength={30}
                  value={formModal?.name}
                  onChange={val => {
                    val = val?.replace(/\s/g, '')
                    onChangeFormModal?.(val)
                  }}
                  showWordLimit
                  placeholder={t`features_agent_manage_index_5101430`}
                />
              </div>
            </div>
          )}
          {productList.length > 0 &&
            productList.map((res, index) => (
              <div className="set-radio-form-item" key={index}>
                <div className="set-radio-slider">
                  <div className="set-radio-slider-header">
                    {`${res.codeKey}:`}
                    <span className="set-radio-highlight">{res.total}%</span>
                  </div>
                  <div className="set-radio-slider-content">
                    <Slider
                      className="slider-wrap"
                      marks={generateRatio(res.total)}
                      max={res.total}
                      value={res.Comparison}
                      onChange={val => {
                        let number = val
                        if (productRebateList && productRebateList.length > 0) {
                          productRebateList.forEach(row => {
                            if (res.productCd === row.productCd && Number(val) < Number(row.childRatio)) {
                              number = Number(row.childRatio)
                              Message.warning({
                                content: t`features_agent_referral_ratio_modal_ratio_slider_index_yex4uvnntu`,
                                id: ErrorTypeEnum.uncategorizedError,
                              })
                            }
                          })
                        }
                        onSliderChange?.(res.productCd, Number(number))
                      }}
                      formatTooltip={formatTooltip}
                    />
                  </div>
                  <div className="set-radio-slider-footer">
                    <div className="set-radio-slider-footer-text">
                      {t`features_agent_index_5101414`}
                      <span className="set-footer-highlight">{Number(res?.total) - Number(res?.Comparison)}%</span>
                    </div>
                    <div className="set-radio-slider-footer-text">
                      {t`features_agent_index_5101357`}
                      <span className="set-footer-highlight">{res?.Comparison}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          {!touchId && (
            <div className="set-radio-form-item checkbox">
              <div className="set-radio-checkbox">
                <Checkbox checked={formModal?.isDefault} onChange={val => onCheboxFormModal?.(val)}>
                  {({ checked }) => {
                    return (
                      <>
                        {checked ? (
                          <Icon name="login_verify_selected" />
                        ) : (
                          <Icon name="login_verify_unselected" hasTheme />
                        )}

                        <span className="checkbox-label">{t`features_agent_manage_index_5101438`}</span>
                      </>
                    )
                  }}
                </Checkbox>
              </div>
            </div>
          )}
        </div>

        <div className="set-ratio-footer">
          <Button className="button" type="secondary" onClick={() => onIsShowSetRatio?.(false)}>
            {t`trade.c2c.cancel`}
          </Button>
          <Button
            className="button"
            type="primary"
            disabled={!touchId && !formModal?.name}
            onClick={() => AddOrUpdate?.()}
            loading={loading}
          >
            {t`components_chart_header_data_2622`}
          </Button>
        </div>
      </div>
    </CustomModal>
  )
}

export default ManageSetScale
