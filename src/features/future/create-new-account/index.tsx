import { t } from '@lingui/macro'
import { Modal, Input, Message, Slider } from '@nbit/arco'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import { formatNumberDecimal, removeDecimalZero, formatCurrency } from '@/helper/decimal'
import { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react'
import { setFutureGroupCreate } from '@/apis/future/common'
import { TradeModeEnum } from '@/constants/trade'
import { getMyAssetsData } from '@/helper/assets'
import AccountName from '../account-name'
import { GroupAccountTypeEnum } from '../use-acount-bg-and-color'
import styles from './index.module.css'

function formatTooltip(val) {
  return <span>{val}%</span>
}

function CreateNewAccount(_, ref) {
  const {
    futuresCurrencySettings: { offset = 2 },
    userAssetsFutures,
  } = useAssetsFuturesStore()

  const accountNameRef = useRef<Record<'getAccountSelectName', () => string>>()

  const [visible, setVisible] = useState<boolean>(false)

  const formatCurrencyNumber = item => {
    return formatCurrency(removeDecimalZero(formatNumberDecimal(item, Number(offset))))
  }

  const [accountMargin, setAccountMargin] = useState<string>('')

  const [percentValue, setPercentValue] = useState<number>(0)

  const setpriceOffsetChange = e => {
    return e.split('.')[1] === '' ? e : String(Number(formatNumberDecimal(e, offset)))
  }

  const onExtraMarginPercentChange = e => {
    setPercentValue(e)
    setAccountMargin(formatNumberDecimal((e / 100) * Number(userAssetsFutures?.availableBalanceValue), offset))
  }

  const onNewaccountMargin = e => {
    const triggerInputNum = setpriceOffsetChange(e) || ''
    const availableBalanceValue = userAssetsFutures?.availableBalanceValue
    const percentValueResult = (Number(triggerInputNum) / Number(setpriceOffsetChange(availableBalanceValue))) * 100
    const judgeTriggerNumber = Number(triggerInputNum) > Number(availableBalanceValue)
    setPercentValue(judgeTriggerNumber ? 100 : Number(formatNumberDecimal(percentValueResult, offset)))
    setAccountMargin(
      e ? String(judgeTriggerNumber ? Number(setpriceOffsetChange(availableBalanceValue)) : triggerInputNum || '') : ''
    )
  }

  useImperativeHandle(ref, () => ({
    setOpenAccountActionSheet() {
      return setVisible(true)
    },
    setCloseAccountActionSheet() {
      return setVisible(false)
    },
  }))

  const setCreateNewAccount = async () => {
    const name = accountNameRef.current?.getAccountSelectName()
    if (!name) {
      Message.info(t`features_future_create_new_account_index_i1ijrn3idp`)
      return
    }
    // if (!accountMargin) {
    //   Message.info('请输入账户保证金')
    //   return
    // }
    const { isOk } = await setFutureGroupCreate({
      name,
      margin: accountMargin,
      accountType: GroupAccountTypeEnum.IMMOBILIZATION,
      isAutoAdd: false,
    })
    if (isOk) {
      Message.info(t`features_future_create_new_account_index_6ab5dtxijz`)
      setVisible(false)
    }
  }

  useEffect(() => {
    if (visible) {
      getMyAssetsData({ accountType: TradeModeEnum.futures })
    }
  }, [visible])

  const onActionSheetClosedChange = () => {
    setPercentValue(0)
    setAccountMargin('')
  }

  return (
    <Modal
      className={styles['newaccount-select-modal-wrapper']}
      title={t`features_home_stepper_index_2551`}
      onCancel={() => setVisible(false)}
      visible={visible}
      footer={null}
      unmountOnExit
      afterClose={() => onActionSheetClosedChange()}
    >
      <div className="create-newaccount-container">
        <AccountName ref={accountNameRef} />
        <div className="flex justify-between">
          <span className="text-text_color_02 text-sm">{t`features_future_create_new_account_index_dlos4ynubu`}</span>
          <span className="text-text_color_01 text-sm">
            {t`features_future_create_new_account_index_z_n2wl0iy1`}
            {formatCurrencyNumber(userAssetsFutures?.availableBalanceValue)} USD
          </span>
        </div>
        <div className="newaccount-margin-input">
          <Input
            className="newaccount-margin"
            value={accountMargin}
            onChange={onNewaccountMargin}
            placeholder={t`features_future_create_new_account_index_8ejfvdqa_c`}
          />
          <span className="text-text_color_01 absolute right-4 top-4">USD</span>
        </div>
        <div className="mt-4">
          <Slider
            formatTooltip={formatTooltip}
            className="newaccount-slider"
            marks={{
              0: '0',
              25: '25',
              50: '50',
              75: '75',
              100: '100',
            }}
            onChange={onExtraMarginPercentChange}
            value={percentValue}
          />
        </div>
        <div className="flex justify-between newaccount-name-button mt-10">
          <div
            className="bg-bg_sr_color flex justify-center items-center text-sm text-text_color_01 cursor-pointer"
            onClick={() => setVisible(false)}
          >{t`user.field.reuse_48`}</div>
          <div
            className="bg-brand_color flex justify-center items-center text-sm text-button_text_02 cursor-pointer"
            onClick={() => setCreateNewAccount()}
          >{t`user.field.reuse_10`}</div>
        </div>
      </div>
    </Modal>
  )
}

export default forwardRef(CreateNewAccount)
