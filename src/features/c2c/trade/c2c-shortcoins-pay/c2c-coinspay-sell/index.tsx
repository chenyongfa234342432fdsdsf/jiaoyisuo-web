import { memo, useState, useRef, useEffect } from 'react'
import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import { Select } from '@nbit/arco'
import { useC2CStore } from '@/store/c2c'
import { getC2CCenterPagePath, getC2cOrderDetailPageRoutePath } from '@/helper/route'
import { link } from '@/helper/link'
import { setQuickSellTransaction } from '@/apis/c2c/c2c-trade'
import cn from 'classnames'
import { YapiPostV1C2CCoinListData } from '@/typings/yapi/C2cCoinListV1PostApi.d'
import { ShortcoinsPay, PaymentMethodStatus } from '@/features/c2c/trade/c2c-trade'
import { decimalUtils } from '@nbit/utils'
import { YapiGetV1C2CAreaListData } from '@/typings/yapi/C2cAreaListV1GetApi.d'
import { formatNumberDecimal } from '@/helper/decimal'
import {
  YapiPostV1C2CQuickTransactionSellCurrencyListData,
  YapiPostV1C2CQuickTransactionSellCurrencyListListData,
} from '@/typings/yapi/C2cQuickTransactionSellCurrencyV1PostApi.d'
import LazyImage from '@/components/lazy-image'
import C2CPaythodsStyle from '@/features/c2c/trade/c2c-paythods-style'
import C2CCoinspayButton from '../c2c-coinspay-button/index'
import C2CTradeLink from '../c2c-trade-link'
import style from './index.module.css'

const Option = Select.Option

type ShowSubmitNums = {
  currencTrade: string
  currencyTradeResult: string
  currencyList: YapiPostV1C2CQuickTransactionSellCurrencyListData[]
}

type Props = {
  setOperateChange?: (item: string) => void
  orderType?: string
  showSubmitNums?: ShowSubmitNums
  handleCoinsTypeReturn?: YapiPostV1C2CCoinListData
  handleAreaTypeReturn?: YapiGetV1C2CAreaListData
  getPaymentCodeVal?: (item: string) => string | undefined
  getPaymentColorCodeVal: (item: string) => string | undefined
}

type SelectPitchOn = Record<string, YapiPostV1C2CQuickTransactionSellCurrencyListListData | undefined>

const SafeCalcUtil = decimalUtils.SafeCalcUtil

function C2CCoinspayBuy(props: Props) {
  const {
    setOperateChange,
    showSubmitNums,
    handleCoinsTypeReturn,
    handleAreaTypeReturn,
    getPaymentCodeVal,
    orderType,
    getPaymentColorCodeVal,
  } = props || {}

  const { c2cTrade } = useC2CStore()

  const { transactionPayOffset } = c2cTrade

  const c2cCoinspayRef = useRef<Record<'openCoinsPayvisibleModal', () => void>>()

  const [contentTips, setContentTips] = useState<string>()

  const refSelect = useRef<HTMLDivElement | null>(null)

  const [selectedPayMethod, setSelectedPayMethod] = useState<YapiPostV1C2CQuickTransactionSellCurrencyListData>()

  const [selectPitchOnStatus, setShowSelectPitchOnStatus] = useState<Record<string, string>>()

  const [selectPitchOn, setSelectPitchOn] = useState<SelectPitchOn>({})

  const [coinspaySellList, setCoinspaySellList] = useState<YapiPostV1C2CQuickTransactionSellCurrencyListData[]>([])

  const setCoinspaybuyBack = () => {
    setOperateChange && setOperateChange(ShortcoinsPay.HomePageCutCoins)
  }

  const setSelectedMethodChange = (e, item) => {
    e.stopPropagation()
    if (selectPitchOnStatus?.[item?.paymentType] === 'none') {
      return
    }
    setSelectedPayMethod(item)
  }
  const setStopPropagation = e => {
    e.stopPropagation()
  }

  const setManagePayments = () => {
    link(getC2CCenterPagePath(undefined, 2))
  }

  const setSelectPayMethods = (e, paymentName) => {
    setSelectPitchOn({ ...selectPitchOn, [paymentName]: e })
  }

  const getQuickTransactionPay = async () => {
    const data = showSubmitNums?.currencyList
    if (data) {
      const selectPitchOnDetal = {} as SelectPitchOn
      let selectPitchIndex = undefined as number | undefined
      let selectPitchStatus = {}
      data?.forEach((item, index) => {
        selectPitchOnDetal[item?.paymentType] = item?.list?.[0]
        if (item?.list && item?.list.length > 0) {
          selectPitchIndex === undefined && (selectPitchIndex = index)
          selectPitchStatus[item?.paymentType] = item?.status
        } else {
          selectPitchStatus[item?.paymentType] = 'none'
        }
      })

      setSelectedPayMethod(data.length ? data[selectPitchIndex as number] : undefined)
      console.log(selectPitchOnDetal, 'selectPitchOnDetalselectPitchOnDetalselectPitchOnDetal')

      setSelectPitchOn(selectPitchOnDetal)
      setCoinspaySellList(data)
      // 选中的支付方式的状态
      setShowSelectPitchOnStatus(selectPitchStatus)
    }
  }

  const getRequestParams = () => {
    return orderType === 'NUMBER'
      ? {
          typeCd: 'NUMBER',
          number: showSubmitNums?.currencTrade,
        }
      : {
          typeCd: orderType as string,
          totalPrice: showSubmitNums?.currencyTradeResult,
        }
  }

  const setCoinspayChange = async () => {
    const { paymentId, advertId } = selectPitchOn?.[selectedPayMethod?.paymentType as string] || {}
    const { isOk, code, data } = await setQuickSellTransaction({
      ...getRequestParams(),
      coinId: handleCoinsTypeReturn?.id,
      paymentId,
      advertId,
    })

    if (isOk) {
      link(getC2cOrderDetailPageRoutePath(data?.id))
    } else if (code === 10106004) {
      setContentTips(t`features_c2c_trade_c2c_shortcoins_pay_c2c_coinspay_sell_index_nqqxxrnfytfgbt0pytarb`)
      c2cCoinspayRef.current?.openCoinsPayvisibleModal()
    }
    return isOk
  }

  useEffect(() => {
    if (showSubmitNums && showSubmitNums?.currencyList?.length > 0) {
      getQuickTransactionPay()
    }
  }, [showSubmitNums])

  const setBindingPaymentMethod = e => {
    e.stopPropagation()
    setManagePayments()
  }

  const getCoinspayComponent = (type, item) => {
    return {
      [PaymentMethodStatus.unbound]: (
        <div className="flex items-center">
          <span className="text-xs text-text_color_03">{t`features_c2c_trade_c2c_shortcoins_pay_c2c_coinspay_sell_index_xcu-2wzwrly8y-znxjbjr`}</span>
          <span className="text-sm text-brand_color ml-2 cursor-pointer" onClick={setBindingPaymentMethod}>
            {t`user.security_verification_status_02`}
          </span>
        </div>
      ),
      [PaymentMethodStatus.unopened]: (
        <div className="flex items-center">
          <span className="text-xs text-text_color_03">{t`features_c2c_trade_free_trade_free_placeorder_modal_index_y6_r51ja_glmt1nixxek_`}</span>
          <span className="text-sm text-brand_color ml-2 cursor-pointer" onClick={setBindingPaymentMethod}>
            {t`features_c2c_trade_free_trade_free_placeorder_modal_index_egyeu2ubtwrgrdlzgymam`}
          </span>
        </div>
      ),
      [PaymentMethodStatus.exist]: (
        <div className="h-full" onClick={e => setStopPropagation(e)}>
          {item?.list?.length > 0 && (
            <Select
              getPopupContainer={() => refSelect.current as HTMLDivElement}
              triggerElement={
                <div className="flex items-center coinspaybuy-select h-full cursor-pointer">
                  <span className="text-sm text-text_color_01 pr-2 payment-type">
                    {selectPitchOn?.[item?.paymentType]?.paymentAccount ||
                      selectPitchOn?.[item?.paymentType]?.paymentDetails}
                  </span>
                  <Icon name="arrow_open" hasTheme />
                </div>
              }
              onChange={e => setSelectPayMethods(e, item?.paymentType)}
            >
              {item?.list?.map(items => {
                return (
                  <Option
                    value={items}
                    disabled={items?.paymentStatus !== 'exist'}
                    key={items?.paymentAccount || items?.paymentDetails}
                    className="px-1 flex justify-between"
                  >
                    {items?.openBank ? (
                      <span className="open-account">
                        {items?.openBank}
                        {t`features_c2c_center_coll_pay_manage_index_loafhg8k4aubv8fnnpyqu`}
                        {items?.paymentAccount}
                        {t`features_c2c_center_coll_pay_manage_index_kwjbatlrha5htpcfybg7j`}
                      </span>
                    ) : (
                      <span className="open-account">{items?.paymentAccount || items?.paymentDetails}</span>
                    )}
                    {items?.paymentStatus !== 'exist' && (
                      <span>{t`features_c2c_trade_c2c_shortcoins_pay_c2c_coinspay_sell_index_3xpyenxs8h4-dxs5hutpg`}</span>
                    )}
                  </Option>
                )
              })}
            </Select>
          )}
        </div>
      ),
    }[type]
  }

  const getSelectPitchOn = () => {
    return selectPitchOn?.[selectedPayMethod?.paymentType as string]
  }

  const getSelectStatus = () => {
    return selectPitchOnStatus?.[selectedPayMethod?.paymentType as string]
  }

  const getCoinspayComponentButton = type => {
    if (type) {
      return {
        [PaymentMethodStatus.unbound]: (
          <div
            className="add-coinspaybuy-button"
            onClick={setBindingPaymentMethod}
          >{t`features_c2c_trade_c2c_shortcoins_pay_c2c_coinspay_sell_index_alqw7_qp0p7dxh3sdn4yp`}</div>
        ),
        [PaymentMethodStatus.unopened]: (
          <div className="add-coinspaybuy-button" onClick={setBindingPaymentMethod}>
            {t`features_c2c_trade_c2c_shortcoins_pay_c2c_coinspay_sell_index_tyoa_z5zitgmmk9euyhrx`}
          </div>
        ),
        [PaymentMethodStatus.exist]: (
          <C2CCoinspayButton
            buttonText={t`trade.c2c.sell`}
            color="sell_down_color"
            contentTips={contentTips}
            selectedPayAdvertId={getSelectPitchOn()?.advertId}
            ref={c2cCoinspayRef}
            setCoinspaybuyBack={setCoinspaybuyBack}
            setCoinspayChange={setCoinspayChange}
          />
        ),
        [PaymentMethodStatus.none]: (
          <div className="add-coinspaybuy-button-not">{t`features_c2c_trade_c2c_shortcoins_pay_c2c_coinspay_sell_index_d1ly00kl9_xmrx3_suge5`}</div>
        ),
      }[type]
    } else {
      return ''
    }
  }

  return (
    <div className={style.scope}>
      <div className="coinspaybuy-container">
        <div className="flex justify-center items-center flex-col">
          <div className="coinspaybuy-title">
            <LazyImage className="select-img" src={handleCoinsTypeReturn?.webLogo as string} />
            <span>
              {t`trade.c2c.sell`}
              <span>{handleCoinsTypeReturn?.coinName}</span>
            </span>
          </div>
          <div className="coinspaybuy-all-price">
            <span>
              {getSelectPitchOn()?.price && orderType === 'NUMBER'
                ? formatNumberDecimal(showSubmitNums?.currencTrade, handleCoinsTypeReturn?.trade_precision)
                : formatNumberDecimal(
                    Number(
                      SafeCalcUtil.div(Number(showSubmitNums?.currencyTradeResult), Number(getSelectPitchOn()?.price))
                    ),
                    handleCoinsTypeReturn?.trade_precision
                  )}
            </span>
            <span>{handleCoinsTypeReturn?.coinName}</span>
          </div>
          <div>
            <span className="text-sm text-text_color_02">{t`features_c2c_trade_shortcut_coins_shortcutcoins_aqlhjvztczzmd32-9ubuv`}</span>
            <span className="text-sm pl-3 text-text_color_01 mt-2 font-normal">
              {getSelectPitchOn()?.price &&
                (orderType === 'NUMBER'
                  ? formatNumberDecimal(
                      Number(SafeCalcUtil.mul(Number(showSubmitNums?.currencTrade), Number(getSelectPitchOn()?.price))),
                      handleAreaTypeReturn?.precision
                    )
                  : formatNumberDecimal(showSubmitNums?.currencyTradeResult, handleAreaTypeReturn?.precision))}
              {handleAreaTypeReturn?.currencyName}
            </span>
          </div>
          <div className="coinspaybuy-sub-title">
            <span>{t`features_c2c_advertise_advertise_detail_index_l7wec9dmflyuibhenbm78`}</span>
            <span
              onClick={setManagePayments}
              className="cursor-pointer"
            >{t`features_c2c_trade_free_trade_free_placeorder_modal_index_al4i170-w89xouup7p2jm`}</span>
          </div>
          <div className="coinspaybuy-paymethod" ref={refSelect}>
            {coinspaySellList.map(item => {
              return (
                <div
                  className={cn('coinspaybuy-paymethod-item', {
                    'coinspaybuy-paymethod-selected': selectedPayMethod?.paymentType === item?.paymentType,
                  })}
                  onClick={e => setSelectedMethodChange(e, item)}
                  key={item?.paymentType}
                >
                  <div>
                    {getPaymentCodeVal && (
                      <C2CPaythodsStyle
                        getPaymentColorCodeVal={getPaymentColorCodeVal}
                        value={item?.paymentType}
                        getPaymentCodeVal={getPaymentCodeVal}
                      />
                    )}
                  </div>
                  {getCoinspayComponent(item?.status, item)}
                </div>
              )
            })}
          </div>
          <div className="coinspaybuy-disclaimers">
            {t`features_c2c_trade_c2c_shortcoins_pay_c2c_coinspay_sell_index_xhcacqay7ttjm1pkytsom`}
            <C2CTradeLink />
          </div>
          <div className="coinspaybuy-button">{getCoinspayComponentButton(getSelectStatus())}</div>
        </div>
        <div className="coinspaybuy-back" onClick={setCoinspaybuyBack}>
          <Icon name="back_black" />
          {t`user.field.reuse_44`}
        </div>
      </div>
    </div>
  )
}

export default memo(C2CCoinspayBuy)
