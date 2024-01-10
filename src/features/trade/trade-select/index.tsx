import { Select } from '@nbit/arco'
import { useRef } from 'react'
import Styles from './index.module.css'

interface ITradeSelectProps {
  value: any
  onChange: any
  prefix: any
  options: { key: any; value: any }[]
}
function TradeSelect(props: ITradeSelectProps) {
  const { value, onChange, prefix, options } = props
  const currentSelectRef = useRef<HTMLDivElement | null>(null)

  function _onSelectChange(params, opt) {
    if (value !== params && onChange) {
      onChange(params, opt)
    }
  }

  return (
    <div className={Styles.scoped} ref={currentSelectRef}>
      <div className="select-text-wrap">
        <div className="prefix">{prefix}</div>
      </div>
      <Select
        getPopupContainer={() => currentSelectRef.current as Element}
        defaultValue={value}
        onChange={_onSelectChange}
        bordered={false}
        triggerProps={{
          autoAlignPopupWidth: false,
          autoAlignPopupMinWidth: true,
        }}
      >
        {options.map(val => (
          <Select.Option key={val.value} value={val.key}>
            {val.value}
          </Select.Option>
        ))}
      </Select>
    </div>
  )
}

export default TradeSelect
