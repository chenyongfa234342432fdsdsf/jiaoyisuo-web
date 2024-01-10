import MiniSelect from '@/components/mini-select'
import { TRADE_ORDER_TAB_RIGHT_ID } from '@/constants/dom'
import { t } from '@lingui/macro'
import classNames from 'classnames'
import { createPortal } from 'react-dom'

/** 放在这里解决重新渲染刷新的问题，所以这里就声明类型了 */
export function StatusSelect({ inTrade, filterParams, onStatusChange, statusList }) {
  const app = (
    <MiniSelect
      inThead
      label={false ? undefined : t`order.filters.status.label`}
      triggerProps={{
        autoAlignPopupWidth: false,
        autoAlignPopupMinWidth: true,
        position: 'bl',
      }}
      className={classNames({
        'text-xs': inTrade,
      })}
      value={filterParams.status}
      onChange={onStatusChange}
      options={statusList as any}
    />
  )
  if (!inTrade) {
    return app
  }
  const dom = document.querySelector(`#${TRADE_ORDER_TAB_RIGHT_ID}`)
  if (!dom) {
    return null
  }

  return createPortal(app, dom)
}
