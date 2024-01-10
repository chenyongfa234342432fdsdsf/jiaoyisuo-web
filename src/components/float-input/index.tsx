import { useState } from 'react'
import { Input, InputProps } from '@nbit/arco'
import styles from './index.module.css'

type FloatInput = {
  floatText?: string
  isAsterisk?: boolean
} & InputProps

export default function FloatInput({ isAsterisk = true, floatText, ...props }: FloatInput) {
  const [visible, setVisible] = useState<boolean>(false)

  const onFocusChange = () => {
    setVisible(true)
  }

  const onBlurChange = () => {
    setVisible(false)
  }

  return (
    <div className={styles['float-input-wrap']}>
      {visible && (
        <div className="float-input-item-text">
          <label>{floatText}</label>
          {isAsterisk && <span>*</span>}
        </div>
      )}
      <Input {...props} onFocus={onFocusChange} onBlur={onBlurChange} />
    </div>
  )
}
