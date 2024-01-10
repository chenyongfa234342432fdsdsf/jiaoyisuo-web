import { useRef } from 'react'
import { Select, SelectProps } from '@nbit/arco'
import Icon from '@/components/icon'
import { YapiGetV1OpenapiComCodeGetCodeDetailListData } from '@/typings/yapi/OpenapiComCodeGetCodeDetailListV1GetApi.d'
import styles from './index.module.css'

type Props = {
  typeOptions: YapiGetV1OpenapiComCodeGetCodeDetailListData[]
}

export function CardCouponFilterSelect({ value, typeOptions, placeholder, onChange }: SelectProps & Props) {
  const cardCouponStatusElementRef = useRef<any>()

  return (
    <div className={styles.scoped} ref={cardCouponStatusElementRef}>
      <Select
        dropdownMenuClassName={styles['base-select-options-wrapper']}
        getPopupContainer={() => cardCouponStatusElementRef.current as Element}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
        arrowIcon={<Icon name="arrow_open" hasTheme className="text-xs" />}
      >
        {typeOptions.map(option => (
          <Select.Option key={option.codeVal} value={option.codeVal}>
            {option.codeKey}
          </Select.Option>
        ))}
      </Select>
    </div>
  )
}

export default CardCouponFilterSelect
