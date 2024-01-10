import { getTradeStopSideTypeEnumMap } from '@/constants/trade'
import { t } from '@lingui/macro'
import TradeSelect from '../trade-select'

function TradeStopSideSelect(props) {
  const { value, onChange } = props
  const tradeStopSideTypeEnumMap = getTradeStopSideTypeEnumMap()
  const options = Object.keys(tradeStopSideTypeEnumMap).map(k => ({ key: k, value: tradeStopSideTypeEnumMap[k] }))
  function _onSelectChange(...params) {
    if (value !== params && onChange) {
      onChange(...params)
    }
  }

  return (
    <TradeSelect
      prefix={t`features_trade_trade_stop_side_input_index_c8cs6c3mgt`}
      value={value}
      onChange={_onSelectChange}
      options={options}
    />
  )
}

export default TradeStopSideSelect
