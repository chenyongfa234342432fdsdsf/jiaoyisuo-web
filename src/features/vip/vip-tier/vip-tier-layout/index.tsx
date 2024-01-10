import DebounceSearchBar from '@/components/debounce-search-bar'
import Tabs from '@/components/tabs'
import { useEffect, useState } from 'react'
import { getSymbolLabelInfo } from '@/apis/market'
import { getV1PerpetualTradePairListApiRequest } from '@/apis/market/futures'
import { t } from '@lingui/macro'
import classNames from 'classnames'
import LazyImage from '@/components/lazy-image'
import Icon from '@/components/icon'
import { useRequest, useUpdateEffect } from 'ahooks'
import { getV1MemberVipBaseFeeListApiRequest } from '@/apis/vip'
import { oss_svg_image_domain_address } from '@/constants/oss'
import { getVipTabHeader, getVipTabTitle, getVipTierProductLine, vipTierProductLineEnum } from '@/constants/vip'
import { YapiGetV1MemberVipBaseFeeData } from '@/typings/yapi/MemberVipBaseFeeListV1GetApi'
import { Spin, Tooltip } from '@nbit/arco'
import { useGetTradeFee } from '@/hooks/features/vip/vip-perks'
import NoData from '@/features/c2c/center/no-data'
import { isEmpty } from 'lodash'
import VipTierTable from '../vip-tier-table'
import styles from './index.module.css'

const tabList = () => [
  {
    title: (
      <span>
        <span>{getVipTabHeader(vipTierProductLineEnum.spot)}</span>
        <Tooltip content={t`features_vip_vip_tier_vip_tier_layout_index_p4qxowfqor`} trigger="click">
          <Icon className="ml-2 text-xs" name="msg" hasTheme />
        </Tooltip>
      </span>
    ),
    id: vipTierProductLineEnum.spot,
  },
  {
    title: (
      <span>
        <span>{getVipTabHeader(vipTierProductLineEnum.perpetual)}</span>
        <Tooltip content={t`features_vip_vip_tier_vip_tier_layout_index_4vvpvdi7dl`} trigger={'click'}>
          <Icon className="ml-2 text-xs" name="msg" hasTheme />
        </Tooltip>
      </span>
    ),
    id: vipTierProductLineEnum.perpetual,
  },
]

const getCoinListApiById = (id: vipTierProductLineEnum) =>
  id === vipTierProductLineEnum.spot ? getSymbolLabelInfo : getV1PerpetualTradePairListApiRequest

function VipTierLayout({ headerTitle, headerSubtitle }) {
  const [tabVal, settabVal] = useState<vipTierProductLineEnum>(tabList()[0].id)
  const [symbolList, setsymbolList] = useState<any>([])
  const [filterSymbols, setfilterSymbols] = useState([])
  const [selectedSymbol, setselectedSymbol] = useState<string>('')
  const [searchVal, setsearchVal] = useState('')

  const [tableData, settableData] = useState<YapiGetV1MemberVipBaseFeeData[]>()

  const { data, loading, run } = useRequest(getV1MemberVipBaseFeeListApiRequest, { manual: true })
  const apiData = data?.data as unknown as YapiGetV1MemberVipBaseFeeData[]
  !tableData &&
    apiData &&
    settableData(
      apiData?.map(e => {
        return {
          ...e,
          makerFee: null,
          takerFee: null,
        }
      }) as any
    )

  const { tradeFee, loading: tradeFeeApiLoading } = useGetTradeFee(selectedSymbol, tabVal) || {}

  useEffect(() => {
    const feeType = tabVal
    if (!feeType) return
    run({ feeType })
  }, [tabVal])

  useEffect(() => {
    const searched = symbolList?.filter(symbol => symbol?.toLowerCase()?.includes(searchVal.toLowerCase()))
    setfilterSymbols(searched)
  }, [searchVal])

  useUpdateEffect(() => {
    if (!selectedSymbol) {
      settableData(
        apiData?.map(e => {
          return {
            ...e,
            makerFee: null,
            takerFee: null,
          }
        }) as any
      )
    }
  }, [tabVal, selectedSymbol])

  // useEffect(() => {
  //   const feeType = tabVal
  //   const symbolName = selectedSymbol
  //   symbolName &&
  //     feeType &&
  //     runTradeFeeApi({ feeType, symbolName }).then(res => {
  //       const data = res.data
  //       data &&
  //         settableData(prev => {
  //           return prev?.map(e => {
  //             return {
  //               ...e,
  //               makerFeeRate: Number(e.makerFee) * data.markerFeeRate,
  //               takerFeeRate: Number(e.takerFee) * data.takerFeeRate,
  //             }
  //           })
  //         })
  //     })
  // }, [selectedSymbol])

  useEffect(() => {
    const { makerFeeRate, takerFeeRate } = tradeFee || {}
    makerFeeRate &&
      takerFeeRate &&
      settableData(prev => {
        const result = apiData?.map((e, idx) => {
          if (idx === 0 && e?.levelCondition?.levelCode === 'LV0') {
            return {
              ...e,
              levelCondition: {
                ...e.levelCondition,
                derivativesAmount: apiData[idx + 1]?.levelCondition?.derivativesAmount,
                spotAmount: apiData[idx + 1]?.levelCondition?.spotAmount,
                balanceAmount: apiData[idx + 1]?.levelCondition?.balanceAmount,
              },
              makerFeeRate: ((100 - Number(e.makerFee)) / 100) * makerFeeRate * 100,
              takerFeeRate: ((100 - Number(e.takerFee)) / 100) * takerFeeRate * 100,
            }
          }
          return {
            ...e,
            makerFeeRate: ((100 - Number(e.makerFee)) / 100) * makerFeeRate * 100,
            takerFeeRate: ((100 - Number(e.takerFee)) / 100) * takerFeeRate * 100,
          }
        })
        return result
      })
  }, [tradeFee])

  useEffect(() => {
    tabVal &&
      getCoinListApiById(tabVal)({})?.then(res => {
        let symbols = res?.data?.list || []
        symbols = symbols.map(s => s.symbolName)
        setsymbolList(symbols)
        setfilterSymbols(symbols)
        setselectedSymbol(symbols[0])
      })
  }, [tabVal])

  return (
    <div className={styles.scoped}>
      <LazyImage className="banner-image" src={`${oss_svg_image_domain_address}vip/vip_tier_banner.png`} hasTheme />
      <div className="tier-header">
        <div>
          <div className="header-title">{headerTitle}</div>
          <span>{headerSubtitle}</span>
        </div>
        <LazyImage src={`${oss_svg_image_domain_address}vip/vip_tier_image.png`} />
      </div>
      <Tabs
        classNames="vip-tier-tab"
        mode="line"
        value={tabVal}
        tabList={tabList()}
        onChange={({ id }) => settabVal(id)}
      />
      <div className="flex flex-row items-center justify-between">
        <div>
          <div className="text-lg font-medium">{getVipTabTitle(tabVal)}</div>
          <span className="text-brand_color text-sm">
            {t({
              id: 'features_vip_vip_tier_vip_tier_layout_index_x5ec4_ngtw',
              values: { 0: getVipTierProductLine()[tabVal] },
            })}
          </span>
        </div>
        <DebounceSearchBar
          className="w-52 h-8"
          onChange={setsearchVal}
          placeholder={t`features_vip_vip_tier_vip_tier_layout_index_czc1gimdhi`}
        />
      </div>
      {!isEmpty(filterSymbols) ? (
        <div className={styles['vip-grid']}>
          <div className={'vip-grid-layout'}>
            {filterSymbols.map((coin, idx) => (
              <div
                className={classNames('vip-grid-item', {
                  'vip-grid-item-active': selectedSymbol === coin,
                })}
                key={idx}
                onClick={() => setselectedSymbol(coin)}
              >
                {coin}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <NoData className="flex justify-center" />
      )}
      <VipTierTable data={tableData} loading={loading} />

      {/* instructions */}
      <div className="text-text_color_03 text-sm !mt-8">
        <div className="text-text_color_01 mb-2">{t`features_vip_vip_tier_vip_tier_layout_index_oftydkzic7`}</div>
        <div>{t`features_vip_vip_tier_vip_tier_layout_index_rb0guesuwq`}</div>
        <div>{t`features_vip_vip_tier_vip_tier_layout_index__d7lq8dwnk`}</div>
        <div>{t`features_vip_vip_tier_vip_tier_layout_index_djibglq6nf`}</div>
        <div className="mb-4">{t`features_vip_vip_tier_vip_tier_layout_index_ilth7hdz3b`}</div>
        <Icon name="prompt-symbol" className="prompt-icon" />
        <span>{t`features_vip_vip_tier_vip_tier_layout_index_yqy1u13muj`}</span>
      </div>

      {/* FAQ */}
      <div>
        <div className="text-3xl font-semibold my-8">{t`features_help_center_support_search_index_2751`}</div>
        <div className="text-base font-semibold my-4">
          {t`features_vip_vip_tier_vip_tier_layout_index_iv6uftf6ih`}{' '}
          {t`features_vip_vip_tier_vip_tier_layout_index_722fdhzp5m`}
        </div>
        <span className="text-xs p-3 bg-card_bg_color_01 text-text_color_02 rounded">
          {t`features_vip_vip_tier_vip_tier_layout_index_hjmywzelsw`}
        </span>
        <div className="text-base font-semibold my-4">{t`features_vip_vip_tier_vip_tier_layout_index_2tgfqyayrs`}</div>
        <span className="text-xs p-3 bg-card_bg_color_01 text-text_color_02 inline-flex rounded">{t`features_vip_vip_tier_vip_tier_layout_index_0dheskdabq`}</span>
      </div>
    </div>
  )
}

export default VipTierLayout
