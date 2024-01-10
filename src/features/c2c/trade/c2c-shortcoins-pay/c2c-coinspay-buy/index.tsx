import { memo, useState, useEffect, useRef } from 'react'
import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import { link } from '@/helper/link'
import { setQuickTransaction } from '@/apis/c2c/c2c-trade'
import cn from 'classnames'
import { getC2cOrderDetailPageRoutePath } from '@/helper/route'
import { useC2CStore } from '@/store/c2c'
import { YapiPostV1C2CQuickTransactionBuyCurrencyListData } from '@/typings/yapi/C2cQuickTransactionBuyCurrencyV1PostApi'
import { decimalUtils } from '@nbit/utils'
import LazyImage from '@/components/lazy-image'
import { ShortcoinsPay } from '@/features/c2c/trade/c2c-trade'
import { YapiPostV1C2CCoinListData } from '@/typings/yapi/C2cCoinListV1PostApi.d'
import { formatNumberDecimal } from '@/helper/decimal'
import { YapiGetV1C2CAreaListData } from '@/typings/yapi/C2cAreaListV1GetApi.d'
import C2CPaythodsStyle from '@/features/c2c/trade/c2c-paythods-style'
import C2CCoinspayButton from '../c2c-coinspay-button/index'
import C2CTradeLink from '../c2c-trade-link'
import style from './index.module.css'

type ShowSubmitNums = {
  currencTrade: string
  currencyTradeResult: string
  currencyList: YapiPostV1C2CQuickTransactionBuyCurrencyListData[]
}

type Props = {
  setOperateChange?: (item: string) => void
  showSubmitNums?: ShowSubmitNums
  handleCoinsTypeReturn?: YapiPostV1C2CCoinListData
  handleAreaTypeReturn?: YapiGetV1C2CAreaListData
  getPaymentCodeVal?: (item: string) => string | undefined
  coinsType?: string
  orderType?: string
  getPaymentColorCodeVal: (item: string) => string | undefined
}

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

  const c2cCoinspayRef = useRef<Record<'openCoinsPayvisibleModal', () => void>>()

  const [contentTips, setContentTips] = useState<string>()

  const { c2cTrade } = useC2CStore()

  const { transactionPayOffset } = c2cTrade

  const [selectedPayMethod, setSelectedPayMethod] = useState<YapiPostV1C2CQuickTransactionBuyCurrencyListData>()

  const [bestSellPrice, setBestprice] = useState<number>()

  const [buyCurrencyList, setBuyCurrencyList] = useState<YapiPostV1C2CQuickTransactionBuyCurrencyListData[]>()

  const setCoinspaybuyBack = () => {
    setOperateChange && setOperateChange(ShortcoinsPay.HomePageCutCoins)
  }

  const setSelectedMethodChange = item => {
    setSelectedPayMethod(item)
  }

  const getQuickTransactionPay = async () => {
    const data = showSubmitNums?.currencyList
    if (data) {
      setBuyCurrencyList(data)
      setSelectedPayMethod(data[0])
      setBestprice(data[0]?.price)
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
    const { isOk, code, data } = await setQuickTransaction({
      coinId: handleCoinsTypeReturn?.id,
      paymentId: selectedPayMethod?.paymentId,
      advertId: selectedPayMethod?.advertId,
      ...getRequestParams(),
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

  return (
    <div className={style.scope}>
      <div className="coinspaybuy-container">
        <div className="flex justify-center items-center flex-col">
          <div className="coinspaybuy-title">
            <LazyImage className="select-img" src={handleCoinsTypeReturn?.webLogo as string} />
            <span>
              {t`trade.c2c.buy`}
              <span>{handleCoinsTypeReturn?.coinName}</span>
            </span>
          </div>
          <div className="coinspaybuy-all-price">
            <span>
              {orderType === 'NUMBER'
                ? formatNumberDecimal(showSubmitNums?.currencTrade, handleCoinsTypeReturn?.trade_precision)
                : formatNumberDecimal(
                    Number(
                      SafeCalcUtil.div(Number(showSubmitNums?.currencyTradeResult), Number(selectedPayMethod?.price))
                    ),
                    handleCoinsTypeReturn?.trade_precision
                  )}
            </span>
            <span>{handleCoinsTypeReturn?.coinName}</span>
          </div>
          <div>
            <span className="text-sm text-text_color_02">{t`features_c2c_trade_free_trade_free_placeorder_modal_index_65e0ly5zvvrygqczgupqf`}</span>
            <span className="text-sm pl-3 text-text_color_01 mt-2 font-normal">
              {selectedPayMethod?.price &&
                (orderType === 'NUMBER'
                  ? formatNumberDecimal(
                      Number(SafeCalcUtil.mul(Number(showSubmitNums?.currencTrade), Number(selectedPayMethod?.price))),
                      handleAreaTypeReturn?.precision
                    )
                  : formatNumberDecimal(showSubmitNums?.currencyTradeResult, handleAreaTypeReturn?.precision))}
              {handleAreaTypeReturn?.currencyName}
            </span>
          </div>
          <div className="coinspaybuy-sub-title">{t`trade.c2c.payment`}</div>
          <div className="coinspaybuy-paymethod">
            {buyCurrencyList?.map(item => {
              return (
                <div
                  className={cn('coinspaybuy-paymethod-item', {
                    'coinspaybuy-paymethod-selected': selectedPayMethod?.paymentId === item?.paymentId,
                  })}
                  key={item?.paymentId}
                  onClick={() => setSelectedMethodChange(item)}
                >
                  <div className="flex items-center">
                    {getPaymentCodeVal && (
                      <C2CPaythodsStyle
                        getPaymentColorCodeVal={getPaymentColorCodeVal}
                        value={item?.paymentType}
                        getPaymentCodeVal={getPaymentCodeVal}
                      />
                    )}
                    {bestSellPrice === item?.price && (
                      <span className="coinspaybuy-paymethod-preferential">{t`features_c2c_trade_c2c_shortcoins_pay_c2c_coinspay_buy_index_aervfkrceat3howem03ie`}</span>
                    )}
                  </div>
                  {<div>¥ {item?.price}</div>}
                </div>
              )
            })}
          </div>
          <div className="coinspaybuy-disclaimers">
            {t`features_c2c_trade_c2c_shortcoins_pay_c2c_coinspay_sell_index_xhcacqay7ttjm1pkytsom`}
            <C2CTradeLink />
          </div>
          <div className="coinspaybuy-button">
            <C2CCoinspayButton
              buttonText={t`trade.c2c.buy`}
              color="buy_up_color"
              contentTips={contentTips}
              ref={c2cCoinspayRef}
              setCoinspaybuyBack={setCoinspaybuyBack}
              setCoinspayChange={setCoinspayChange}
              selectedPayMethod={selectedPayMethod}
            />
          </div>
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
