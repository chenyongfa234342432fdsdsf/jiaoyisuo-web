import { getTradePairDetailApi } from '@/apis/assets/futures/common'
import { getCodeDetailList, getCodeDetailListBatch } from '@/apis/common'
import { getMarketTicker } from '@/apis/market'
import {
  getV1MemberVipBaseBenefitListApiRequest,
  getV1MemberVipBaseConfigApiRequest,
  getV1MemberVipBaseConfigListApiRequest,
  getV1MemberVipBaseInfoApiRequest,
} from '@/apis/vip'
import { getVipTierHeaderProductLine, vipTierProductLineEnum } from '@/constants/vip'
import {
  getCacheVipCd,
  getCacheVipPerksList,
  getCacheVipUpgradeByLevel,
  getCacheVipUpgradeList,
  setCacheVipCd,
  setCacheVipPerksList,
  setCacheVipUpgradeByLevel,
  setCacheVipUpgradeList,
} from '@/helper/cache/vip'
import { useVipStore } from '@/store/vip'
import { defaultUpgradeData, useVipPerksStore } from '@/store/vip/vip-perks'
import { useVipSettingStore } from '@/store/vip/vip-user-setting'
import { t } from '@lingui/macro'
import { useRequest } from 'ahooks'
import { isEmpty } from 'lodash'
import { useEffect, useState } from 'react'

export function useVipPerksList() {
  const { runAsync } = useRequest(getV1MemberVipBaseBenefitListApiRequest, { manual: true })
  const { list, setList } = useVipPerksStore()

  if (list === null) {
    setList([])
    runAsync({}).then(res => {
      let data = res?.data
      if (data) {
        setList(data)
      }
    })
  }

  return list
}

export function useVipUpgradeConditionsByLevel(levelCode?: string) {
  const { runAsync, loading } = useRequest(getV1MemberVipBaseConfigApiRequest, { manual: true })
  const { currentUpgradeData, setcurrentUpgradeData, currentPeriod, setcurrentPeriod } = useVipPerksStore()

  useEffect(() => {
    if (levelCode) {
      setcurrentUpgradeData([])
      runAsync({ levelCode }).then(res => {
        if (res.isOk) {
          const data = res?.data?.levelCondition || {}
          const period = res?.data?.period || 0
          const derivatives = res?.data?.derivatives?.map(d => getVipTierHeaderProductLine()?.[d])?.join(',') || []

          const upgradeData = defaultUpgradeData().map(each => {
            return {
              ...each,
              limit: data[each.limitApiKey],
              isEnabled: data[each.enableApiKey],
              // dynamic popup decription for derivatives upgrades only
              ...(each?.apiKey === 'vipDerivativesAmount' && {
                popoverDescription: t({
                  id: 'hooks_features_vip_vip_perks_index_pffdqdd4a9',
                  values: { 0: derivatives },
                }),
              }),
            }
          })
          setcurrentPeriod(period)
          setcurrentUpgradeData(upgradeData)
        } else setcurrentUpgradeData(null)
      })
    }
  }, [levelCode])

  if (!levelCode) return { currentUpgradeData: defaultUpgradeData(), loading, currentPeriod }

  return { currentUpgradeData, loading, currentPeriod }
}

export function useVipUpgradeConditionsList() {
  const { runAsync } = useRequest(getV1MemberVipBaseConfigListApiRequest, { manual: true })
  const { upgradeConditions, setUpgradeConditions } = useVipPerksStore()

  useEffect(() => {
    if (upgradeConditions === null) {
      setUpgradeConditions([])
      runAsync({}).then(res => {
        if (res?.data) {
          setCacheVipUpgradeList(res.data)
          setUpgradeConditions(res.data)
        } else setUpgradeConditions(null)
      })
    }
  }, [])

  return upgradeConditions
}

export function useVipUserInfo() {
  const { runAsync } = useRequest(getV1MemberVipBaseInfoApiRequest, { manual: true })
  const { userConfig, setConfig } = useVipSettingStore()

  const fetchApi = () =>
    runAsync({}).then(res => {
      let data = res.data
      setConfig(data)
    })

  if (userConfig === null) {
    setConfig({})
    fetchApi()
  }

  return { userConfig, fetchApi }
}

const codes = ['vip_level_status', 'benefit_code', 'derivative_cd', 'vip_protect_group_cd']

export function useInitVipCodeDict() {
  const { codeDictMap, setCodeDictMap } = useVipStore()

  const { runAsync } = useRequest(getCodeDetailListBatch, { manual: true })
  if (codeDictMap === null) {
    setCodeDictMap({})
    const cacheCd = getCacheVipCd()
    isEmpty(cacheCd)
      ? runAsync(codes).then(res => {
          const merged = res.reduce((a, c) => {
            a = [...a, ...c]
            return a
          }, [])

          const mapped = merged?.reduce((a, c) => {
            a[c.codeVal] = c.codeKey
            return a
          }, {})
          setCacheVipCd(mapped)
          setCodeDictMap(mapped)
        })
      : setCodeDictMap(cacheCd)
  }
}

export function useGetTradeFee(symbol: string, productType: vipTierProductLineEnum) {
  const { loading: spotLoading, runAsync: runSpotAsync } = useRequest(getMarketTicker, { manual: true })
  const { loading: perpetualLoading, runAsync: runPertualAsync } = useRequest(getTradePairDetailApi, { manual: true })
  const [tradeFee, settradeFee] = useState<{
    makerFeeRate: null
    takerFeeRate: null
  }>()
  useEffect(() => {
    if (!symbol || symbol === '') return
    if (productType === vipTierProductLineEnum.spot)
      runSpotAsync({ symbol }).then(res => {
        const { sellFee, buyFee } = (res.data as any) || {}
        settradeFee({
          makerFeeRate: sellFee,
          takerFeeRate: buyFee,
        })
      })
    if (productType === vipTierProductLineEnum.perpetual)
      runPertualAsync({ symbol }).then(res => {
        const { markerFeeRate, takerFeeRate } = (res.data as any) || {}
        settradeFee({
          makerFeeRate: markerFeeRate,
          takerFeeRate,
        })
      })
  }, [symbol])

  return { tradeFee, loading: spotLoading || perpetualLoading }
}
