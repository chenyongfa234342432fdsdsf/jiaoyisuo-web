import { useEffect, useState } from 'react'
import { Trigger } from '@nbit/arco'
import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import { FuturesAccountTypeEnum, getFuturesAccountTypeColor } from '@/constants/assets/futures'
import classNames from 'classnames'
import { getTextFromStoreEnums } from '@/helper/store'
import { FuturesGuideIdEnum } from '@/constants/future/trade'
import styles from './index.module.css'

function AccountTypeDropdownCells({
  onClickAccountType,
  accountType,
  isSearch,
}: {
  onClickAccountType?: (v) => void
  accountType: FuturesAccountTypeEnum
  isSearch?: boolean
}) {
  const { futuresEnums } = useAssetsFuturesStore()
  const allAccount = { value: '', label: t`features_assets_futures_index_search_form_index_6jepavpvtd` }
  const accountTypeList = futuresEnums.perpetualAccountTypeEnum.enums
  let newAccountTypeList = [...accountTypeList]
  isSearch && newAccountTypeList.unshift(allAccount)

  const onClick = values => {
    onClickAccountType && onClickAccountType(values)
  }
  return (
    <div className={styles['menu-cells']}>
      {newAccountTypeList.map(v => (
        <div className="cell" key={v.value} onClick={() => onClick(v.value)}>
          <div className="cell-wrap">
            <span
              className={classNames({
                'is-selected': accountType === v.value,
              })}
            >
              {v.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function AccountTypeSelect({
  isSearch = false,
  accountType = '',
  onCallback,
}: {
  isSearch: boolean
  accountType: FuturesAccountTypeEnum | string
  onCallback?: (v) => void
}) {
  const assetsFuturesStore = useAssetsFuturesStore()
  const { futuresEnums, futureAccountListSearchForm, updateFutureAccountListSearchForm } = { ...assetsFuturesStore }
  const [visibleAccountTypeList, setVisibleAccountTypeList] = useState(false)

  const onChangeAccountType = async type => {
    updateFutureAccountListSearchForm({ ...futureAccountListSearchForm, accountType: type })
  }

  useEffect(() => {}, [isSearch])
  return (
    <div className={styles.scoped}>
      <Trigger
        popup={() => (
          <AccountTypeDropdownCells
            accountType={accountType as FuturesAccountTypeEnum}
            onClickAccountType={v => {
              onCallback ? onCallback(v) : onChangeAccountType(v)
              setVisibleAccountTypeList(false)
            }}
            isSearch={isSearch}
          />
        )}
        onVisibleChange={setVisibleAccountTypeList}
        popupVisible={visibleAccountTypeList}
      >
        <div
          className={classNames('popover-reference', { 'rounded bg-bg_sr_color': !isSearch })}
          id={FuturesGuideIdEnum.temporaryAccount}
          style={!isSearch ? getFuturesAccountTypeColor(accountType) : undefined}
          onClick={() => setVisibleAccountTypeList(true)}
        >
          <div className="popover-reference-text">
            {accountType
              ? getTextFromStoreEnums(accountType, futuresEnums.perpetualAccountTypeEnum.enums)
              : isSearch
              ? t`features_assets_futures_index_search_form_index_6jepavpvtd`
              : '--'}
          </div>
          <Icon name="arrow_open" hasTheme className="popover-reference-icon" />
        </div>
      </Trigger>
    </div>
  )
}

export default AccountTypeSelect
