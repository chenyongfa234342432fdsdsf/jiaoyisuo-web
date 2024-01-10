import dayjs from 'dayjs'
import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import { useRequest } from 'ahooks'
import { Modal, Popover, Spin } from '@nbit/arco'
import TernaryOptionLineChart from '@/features/ternary-option/ternary-option-tab/component/line-chart'
import { getV1OptionEarningTodayApiRequest } from '@/apis/ternary-option/market'
import { formatNumberDecimal } from '@/helper/decimal'
import { isArray } from 'lodash'
import { IncreaseTag } from '@nbit/react'
import { useEffect } from 'react'
import { getMergeModeStatus } from '@/features/user/utils/common'
import styles from './index.module.css'

type ProfitLossModalProps = {
  visible: boolean
  setVisible: (visible: boolean) => void
}

export default function ProfitLossModal(props: ProfitLossModalProps) {
  const { visible, setVisible } = props
  const isMergeMode = getMergeModeStatus()

  const { data: res, loading, run } = useRequest(getV1OptionEarningTodayApiRequest, { manual: true })
  const { list, total, currency } = res?.data || {}

  useEffect(() => {
    visible && run({})
  }, [visible])

  const chartData = isArray(list)
    ? (list as any).map((each, idx) => {
        return {
          y: each.ts > dayjs() ? null : `${formatNumberDecimal(each.yield, 2)}`,
          x: idx === list.length - 1 ? '24:00:00' : dayjs(each.ts).format('HH:mm:ss'),
        }
      })
    : []

  return (
    <Modal
      focusLock
      footer={null}
      unmountOnExit
      visible={visible}
      autoFocus={false}
      className={styles['profit-loss-modal']}
    >
      <div className="profit-loss-modal-content">
        <div className="content-header">
          <Popover
            content={
              <span>{t`features_ternary_option_ternary_option_tab_component_profit_loss_modal_index_8njckwhskk`}</span>
            }
          >
            <div className="left-text">
              <span>{t`features_ternary_option_ternary_option_tab_component_profit_loss_modal_index_kxix4mg2km`}</span>
              <Icon name="msg" hasTheme className="left-icon" />
            </div>
          </Popover>
          <Icon
            name="close"
            hasTheme
            className="right-icon"
            onClick={() => {
              setVisible(false)
            }}
          />
        </div>
        <div className="content-body">
          <div className="profit-header">
            <div className="profit-header-left">
              <div className="profit-text">{t`features_ternary_option_ternary_option_tab_component_profit_loss_modal_index_9jv54mtm5v`}</div>
              <div className="profit-moneny">
                <IncreaseTag
                  value={Number(total) || undefined}
                  defaultEmptyText={'0.00'}
                  delZero={false}
                  kSign
                  digits={2}
                  hasPrefix
                  hasColor
                  right={` ${currency || ''}`}
                />
              </div>
            </div>
            <div className="profit-header-right">{dayjs().format('YYYY-MM-DD')}</div>
          </div>
          <div className="profit-echarts">
            {loading ? (
              <Spin className={'m-auto'} />
            ) : (
              <TernaryOptionLineChart
                currency={currency}
                data={[
                  {
                    id: 'profit',
                    color: isMergeMode ? '#000000' : '#F1AE3D',
                    data: chartData,
                  },
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
