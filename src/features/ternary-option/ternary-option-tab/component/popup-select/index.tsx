import { Select } from '@nbit/arco'
import { ReactNode, useState } from 'react'
import Icon from '@/components/icon'
import styles from './index.module.css'

export type DataType = {
  value: string | number | undefined
  name?: string | undefined
  label?: string
}

type PopupSearchSelectProps = {
  value?: string
  type?: boolean
  className?: string
  defaultName?: string
  data: Array<DataType>
  arrowIcon?: ReactNode
  defaultValue?: string | number
  popoverClassName?: string
  onChange: (item) => void
}

export default function PopupSearchSelect(props: PopupSearchSelectProps) {
  const { value, type = false, data, arrowIcon, onChange, defaultName } = props
  const [currentValue, setCurrentValue] = useState<string | number>(defaultName || '')

  const onSelectChange = (item: string | number) => {
    onChange && onChange(item || '')
    setCurrentValue(item)
  }

  // useMount(() => {
  //   if (defaultValue) {
  //     const currentList = data?.find(item => item.value === defaultValue)
  //     currentList && setCurrentName(currentList?.[value || 'name'] || '')
  //   }
  // })

  return (
    <Select
      onChange={onSelectChange}
      trigger="hover"
      bordered={false}
      value={currentValue}
      triggerProps={{
        autoAlignPopupWidth: false,
        autoAlignPopupMinWidth: true,
      }}
      arrowIcon={arrowIcon || <Icon name="trade_expand" hasTheme className={styles['popup-select-icon']} />}
      className={styles['popup-select']}
      dropdownMenuClassName={styles['popup-select-option']}
    >
      {data?.map(item => (
        <Select.Option key={item.value} value={item.value || ''}>
          {item[value || 'name']}
        </Select.Option>
      ))}
    </Select>
  )
}
