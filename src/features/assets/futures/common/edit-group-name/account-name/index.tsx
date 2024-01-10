/** 账户名称 */
import { t } from '@lingui/macro'
import { Input, Message } from '@nbit/arco'
import classNames from 'classnames'
import { useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { onCheckPositionName } from '@/helper/reg'
import styles from './index.module.css'

type IAccountNameProps = {
  groupName?: string
  maxLength?: number
  onChangeCallback?: (v: any) => void
}

function AccountName(prop: IAccountNameProps, ref) {
  const { groupName, maxLength = 20 } = prop
  const newAccountNameList = useRef([
    t`features_future_account_name_index_2pbrk_qpjq`,
    t`features_future_account_name_index_frpqvzpw_2`,
    t`features_future_account_name_index_hwwqznyhhb`,
    t`features_future_account_name_index_asmvx9vzmy`,
    t`features_future_account_name_index_usgpqq56rz`,
    t`features_future_account_name_index_wkkqsj2_ej`,
  ])

  const [accountName, setAccountName] = useState(groupName)
  const [errorStatus, setErrorStatus] = useState(false)

  const onChangeAccount = val => {
    if (!val) {
      setAccountName(val)
      setErrorStatus(true)
      Message.error(t`features_future_account_name_index_k5mw3cidws`)
      return
    } else if (val && !onCheckPositionName(val)) {
      return
    }
    setErrorStatus(false)
    setAccountName(val)
  }

  useImperativeHandle(ref, () => ({
    getAccountSelectName() {
      return accountName
    },
  }))

  return (
    <div className={styles['account-name-wrap']}>
      <div className="flex justify-between">
        <span className="text-text_color_02 text-sm">{t`features_future_account_name_index_05tnmn9vn9`}</span>
        <span className="text-brand_color text-sm">
          {t`features_assets_futures_common_edit_group_name_index_0dby7x4x5rw16wbwli80h`} 20{' '}
          {t`features_assets_futures_common_edit_group_name_index_dt0i3dasr3b0icw6zlcds`}
        </span>
      </div>
      <Input
        allowClear
        maxLength={maxLength}
        showWordLimit
        autoComplete="off"
        className={classNames('account-name', { 'check-error': errorStatus })}
        value={accountName}
        onChange={onChangeAccount}
        onClear={() => {
          setAccountName('')
        }}
        placeholder={t`features_future_account_name_index_k5mw3cidws`}
      />
      <div className="flex flex-wrap justify-between">
        {newAccountNameList.current?.map(item => {
          return (
            <div
              className={classNames('account-name-item cursor-pointer', {
                'account-name-item-selected': accountName === item,
              })}
              key={item}
              onClick={() => setAccountName(item)}
            >
              {item}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default forwardRef(AccountName)
