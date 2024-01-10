import { Input, InputProps } from '@nbit/arco'
import Styles from './index.module.css'

function TradeInputText(props: InputProps) {
  const { defaultValue, suffix, prefix, max = 1e12, ...rest } = props
  return (
    <Input className={Styles.scoped} max={max} {...rest} defaultValue={defaultValue} suffix={suffix} prefix={prefix} />
  )
}

export default TradeInputText
