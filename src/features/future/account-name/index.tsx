import { t } from '@lingui/macro'
import { Input } from '@nbit/arco'
import classNames from 'classnames'
import { useRef, useState, forwardRef, useImperativeHandle } from 'react'
import styles from './index.module.css'

function AccountName(_, ref) {
  const newaccountNameList = useRef([
    t`features_future_account_name_index_2pbrk_qpjq`,
    t`features_future_account_name_index_frpqvzpw_2`,
    t`features_future_account_name_index_hwwqznyhhb`,
    t`features_future_account_name_index_asmvx9vzmy`,
    t`features_future_account_name_index_usgpqq56rz`,
    t`features_future_account_name_index_wkkqsj2_ej`,
  ])

  const [accountSelectName, setAccountSelectName] = useState<string>('')

  const onNewAccountNameChange = e => {
    setAccountSelectName(e)
  }

  useImperativeHandle(ref, () => ({
    getAccountSelectName() {
      return accountSelectName
    },
  }))

  return (
    <div className={styles['newaccount-container']}>
      <div className="flex justify-between">
        <span className="text-text_color_02 text-sm">{t`features_future_account_name_index_05tnmn9vn9`}</span>
        <span className="text-brand_color text-sm">
          {t`features_assets_futures_common_edit_group_name_index_0dby7x4x5rw16wbwli80h`} 20{' '}
          {t`features_assets_futures_common_edit_group_name_index_dt0i3dasr3b0icw6zlcds`}
        </span>
      </div>
      <Input
        className="newaccount-name"
        value={accountSelectName}
        onChange={onNewAccountNameChange}
        placeholder={t`features_future_account_name_index_k5mw3cidws`}
        maxLength={20}
      />
      <div className="pt-3 mb-6 flex flex-wrap justify-between">
        {newaccountNameList.current?.map(item => {
          return (
            <div
              className={classNames('newaccount-name-item cursor-pointer', {
                'newaccount-name-item-selected': accountSelectName === item,
              })}
              key={item}
              onClick={() => setAccountSelectName(item)}
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
