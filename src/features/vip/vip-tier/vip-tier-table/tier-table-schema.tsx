import Icon from '@/components/icon'
import { formatNumberDecimal } from '@/helper/decimal'
import { getDiscountAmt } from '@/helper/vip'
import { t } from '@lingui/macro'
import { Tooltip } from '@nbit/arco'

export const getTierTableColumns = () => {
  return [
    {
      title: t`features_vip_vip_tier_vip_tier_table_tier_table_schema_12o17wbmvq`,
      dataIndex: 'levelCondition.levelCode',
    },
    {
      title: t`features_vip_vip_tier_vip_tier_table_tier_table_schema_q4vput2j1x`,
      dataIndex: 'levelCondition.spotAmount',
      render: (text, data, index) => {
        if (!data?.levelCondition?.spotAmount) return '-'
        return (
          <span>
            {index === 0 ? '<' : '≥'} {data.levelCondition.spotAmount}
          </span>
        )
      },
    },
    {
      title: t`user.third_party_01`,
      render: () => <span>{t`user.third_party_01`}</span>,
    },
    {
      title: (
        <>
          <span>
            {t`features_vip_vip_tier_vip_tier_table_tier_table_schema_qnauryrsud`} 30{' '}
            {t`features_vip_vip_tier_vip_tier_table_tier_table_schema_jwhplhxaw2`}
          </span>
          <Tooltip content={t`features_vip_vip_tier_vip_tier_table_tier_table_schema_kvmqy0qzum`} trigger={'click'}>
            <Icon className="ml-1 text-xs mb-0.5" name="msg" hasTheme />
          </Tooltip>
        </>
      ),
      dataIndex: 'levelCondition.derivativesAmount',
      render: (text, data, index) => {
        if (!data?.levelCondition?.derivativesAmount) return '-'
        return (
          <span>
            {index === 0 ? '<' : '≥'} {data.levelCondition.derivativesAmount}
          </span>
        )
      },
    },
    {
      title: t`user.third_party_01`,
      render: () => <span>{t`user.third_party_01`}</span>,
    },
    {
      title: (
        <>
          <span>{t`features_vip_vip_tier_vip_tier_table_tier_table_schema_q9opgwfsff`} USD</span>
          <Tooltip content={t`features_vip_vip_tier_vip_tier_table_tier_table_schema_k7h28bydub`} trigger={'click'}>
            <Icon className="ml-1 text-xs mb-0.5" name="msg" hasTheme />
          </Tooltip>
        </>
      ),
      dataIndex: 'levelCondition.balanceAmount',
      render: (text, data, index) => {
        if (!data?.levelCondition?.balanceAmount) return '-'
        return (
          <span>
            {index === 0 ? '<' : '≥'} {data.levelCondition.balanceAmount}
          </span>
        )
      },
    },
    {
      title: t`features_vip_vip_tier_vip_tier_table_tier_table_schema_5ydqzt0j6j`,
      dataIndex: 'makerFee',
      render: (text, data, index) => {
        if (data?.makerFee === 0)
          return <span>{t`features_vip_vip_tier_vip_tier_table_tier_table_schema_cdijez0cft`}</span>
        return <span>{data?.makerFee ? getDiscountAmt(data.makerFee, true) : '-'}</span>
      },
    },
    {
      title: t`features_vip_vip_tier_vip_tier_table_tier_table_schema_jiuwwg5fom`,
      dataIndex: 'takerFee',
      render: (text, data, index) => {
        if (data?.takerFee === 0)
          return <span>{t`features_vip_vip_tier_vip_tier_table_tier_table_schema_cdijez0cft`}</span>
        return <span>{data?.takerFee ? getDiscountAmt(data.takerFee, true) : '-'}</span>
      },
    },
    {
      title: t`features_vip_vip_tier_vip_tier_table_tier_table_schema_4cmy10er2h`,
      render: (text, data, index) => {
        const { makerFeeRate, takerFeeRate } = data
        return (
          <span>
            {makerFeeRate && takerFeeRate
              ? `${formatNumberDecimal(makerFeeRate, 4, true)}%/${formatNumberDecimal(takerFeeRate, 4, true)}%`
              : '-'}
          </span>
        )
      },
    },
  ]
}
