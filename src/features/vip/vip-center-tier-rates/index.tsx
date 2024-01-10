import { YapiGetV1MemberVipBaseInfoListFeeList } from '@/typings/yapi/MemberVipBaseInfoV1GetApi'
import Icon from '@/components/icon'
import { link } from '@/helper/link'
import { getVipTierRoutePath } from '@/helper/route'
import { useVipUpgradeConditionsList, useVipUserInfo } from '@/hooks/features/vip/vip-perks'
import { getDiscountAmt, getVipCdValue } from '@/helper/vip'
import { t } from '@lingui/macro'
import { formatNumberDecimal } from '@/helper/decimal'
import { useEffect, useState } from 'react'
import { YapiGetV1MemberVipBaseConfigListData } from '@/typings/yapi/MemberVipBaseConfigListV1GetApi'
import styles from './index.module.css'

function getPercentageValue(value: string | number) {
  return formatNumberDecimal(value, 2)
}

function TierRatesTableItem({
  title,
  value,
  isMaxLevel,
}: {
  title?: string
  value?: string | number
  isMaxLevel?: boolean
}) {
  return (
    <div className={styles['tier-rates-table-item']}>
      {title && <div className="mb-3 font-normal text-xs text-text_color_02">{title}</div>}
      {(value !== null && value !== undefined) || isMaxLevel ? (
        <span className="text-lg text-text_color_01 font-medium">
          {isMaxLevel ? t`features_vip_vip_center_tier_rates_index_cthle0su03` : `${getPercentageValue(value!)}%`}
        </span>
      ) : (
        '-'
      )}
    </div>
  )
}

function TierRatesTable({
  data,
  isMaxLevel,
}: {
  data?: YapiGetV1MemberVipBaseInfoListFeeList[]
  isMaxLevel?: boolean
}) {
  return (
    <table className={styles['tier-rates-table']}>
      <thead>
        <tr>
          <th>{t`features_vip_vip_center_tier_rates_index_ehonptkogw`}</th>
          {data?.map((each, idx) => (
            <th key={idx}>{getVipCdValue(each.productCd)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div className="translate-y-3">{t`features_vip_vip_center_tier_rates_index_u56_ibrxpw`}</div>
          </td>
          {data?.map((each, idx) => (
            <td key={idx}>
              <div className="td-layout">
                <TierRatesTableItem
                  title={t`features_vip_vip_center_tier_rates_index_1ifodnb5tr`}
                  value={each?.makerFee}
                />
                <TierRatesTableItem
                  title={t`features_vip_vip_center_tier_rates_index_3ygtkdqmlq`}
                  value={each?.nextMakerFee}
                  isMaxLevel={isMaxLevel}
                />
              </div>
            </td>
          ))}
        </tr>
        <tr>
          <td>{t`features_vip_vip_center_tier_rates_index_fnzy1rjx3y`}</td>
          {data?.map((each, idx) => (
            <td key={idx}>
              <div className="td-layout">
                <TierRatesTableItem
                  // title={t`features_vip_vip_center_tier_rates_index_1ifodnb5tr`}
                  value={each?.takerFee}
                />
                <TierRatesTableItem
                  // title={t`features_vip_vip_center_tier_rates_index_3ygtkdqmlq`}
                  value={each?.nextTakerFee}
                  isMaxLevel={isMaxLevel}
                />
              </div>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}

function VipCenterTierRates({ levelCode }: { levelCode?: string }) {
  // const { userConfig } = useVipUserInfo()
  // const { levelCode } = userConfig || {}
  const list = useVipUpgradeConditionsList()
  const [isMaxLevel, setisMaxLevel] = useState(false)
  const [data, setdata] = useState<YapiGetV1MemberVipBaseConfigListData>()
  useEffect(() => {
    if (levelCode === 'LV10') setisMaxLevel(true)
    else setisMaxLevel(false)

    const data = list?.find(e => e.levelCode?.toString() === levelCode?.toString())
    setdata(data)
  }, [levelCode])

  return (
    <div className={styles.scoped}>
      <div className="flex flex-row justify-between mb-6">
        <span className="text-base font-medium">{t`features_vip_vip_center_tier_rates_index_zwz96cfcyj`}</span>
        <span className="text-xs text-text_color_03 cursor-pointer" onClick={() => link(getVipTierRoutePath())}>
          {t`features_vip_vip_center_tier_rates_index_q3ugitipal`}
          <Icon className="mb-0.5" name="next_arrow" hasTheme />
        </span>
      </div>
      <TierRatesTable data={data?.feeList} isMaxLevel={isMaxLevel} />
    </div>
  )
}

export default VipCenterTierRates
