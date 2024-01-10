import { defaultUpgradeData, useVipPerksStore } from '@/store/vip/vip-perks'
import { Button, Modal } from '@nbit/arco'
import Icon from '@/components/icon'
import LazyImage from '@/components/lazy-image'
import Link from '@/components/link'
import useApiHeaderMenu from '@/hooks/features/layout'
import { getHomeMenu } from '@/helper/layout'
import { AuthModuleAdapterNavi } from '@/helper/module-config'
import { getC2cFastTradePageRoutePath } from '@/helper/route'
import { getAssetsDepositPageRoutePath } from '@/helper/route/assets'
import { YapiGetV1ChainStarGetNavigationListSubmenuListNavigationBarListData } from '@/typings/yapi/ChainStarGetNavigationV1GetApi'
import { amountCalStatus, vipCenterRedirectMenuIconUrl } from '@/constants/vip'
import {
  useVipUpgradeConditionsByLevel,
  useVipUpgradeConditionsList,
  useVipUserInfo,
} from '@/hooks/features/vip/vip-perks'
import { t } from '@lingui/macro'
import { getBusinessName } from '@/helper/common'
import { useRequest } from 'ahooks'
import { getV1ChainStarGetDynamicNavigationApiRequest, getV1MemberVipBaseConfigApiRequest } from '@/apis/vip'
import { useEffect, useState } from 'react'
import { YapiGetV1ChainStarGetDynamicNavigationData } from '@/typings/yapi/ChainStarGetDynamicNavigationV1GetApi'
import { YapiGetV1MemberVipBaseConfigListData } from '@/typings/yapi/MemberVipBaseConfigListV1GetApi'
import styles from './index.module.css'

export function VipCenterProtectModal(props) {
  const { visible, setvisible } = props
  const { userConfig } = useVipUserInfo() || {}
  const { levelCode } = userConfig || {}
  const [currentUpgradeData, setcurrentUpgradeData] = useState<ReturnType<typeof defaultUpgradeData>>([])
  const [currentPeriod, setcurrentPeriod] = useState(0)
  const { runAsync } = useRequest(getV1MemberVipBaseConfigApiRequest, { manual: true })

  useEffect(() => {
    if (levelCode) {
      runAsync({ levelCode }).then(res => {
        if (res.isOk) {
          const data = res?.data?.levelCondition || {}
          const period = res?.data?.period || 0
          const upgradeData = defaultUpgradeData().map(each => {
            return {
              ...each,
              limit: data[each.limitApiKey],
              isEnabled: data[each.enableApiKey],
            }
          })
          setcurrentPeriod(period)
          setcurrentUpgradeData(upgradeData)
        }
      })
    }
  }, [levelCode])

  const data = currentUpgradeData?.map(each => {
    return {
      ...each,
      value: userConfig?.[each.apiKey] || 0,
    }
  })
  return (
    <Modal
      className={styles['vip-center-protect-modal']}
      visible={visible}
      title={t`features_vip_vip_center_modals_index_cdy2_jr4zp`}
      footer={
        <Button long type="primary" onClick={() => setvisible(false)}>
          {t`features_trade_spot_index_2510`}
        </Button>
      }
      onCancel={() => setvisible(false)}
    >
      <div>
        <div className="text-brand_color text-sm mb-2">
          {t`features_vip_vip_center_modals_index_lqcpuglegx`} {userConfig?.protectDay}{' '}
          {t`features_vip_vip_center_modals_index_eymyun4mvi`}
        </div>
        <span>{t`features_vip_vip_center_modals_index_brwh_kxqcg`} </span>
        <span>{userConfig?.levelCode}</span>
        {data?.map(
          (each, idx) =>
            each.isEnabled === amountCalStatus.enable && (
              <div key={idx}>
                <span className="text-text_color_03">{each.title}</span>
                <span className="ml-1">
                  {each.value}/{each.limit}
                </span>
              </div>
            )
        )}
        <div className="text-text_color_01 text-sm mt-2">
          {t({
            id: 'features_vip_vip_center_modals_index_gaoi6chrqx',
            values: { 0: currentPeriod, 1: currentPeriod },
          })}
        </div>
      </div>
    </Modal>
  )
}

function RedirectionCell(props: YapiGetV1ChainStarGetDynamicNavigationData) {
  const { name, describe, url, icon } = props
  return (
    <div className={styles['vip-center-redirection-cell']}>
      <div>
        <div className="text-sm text-text_color_01 font-medium">{name}</div>
        <div className="text-xs font-normal text-text_color_03 my-2">{describe}</div>
        <Link href={url as string} className="flex flex-row items-center">
          <span className="text-brand_color text-sm">{t`features_vip_vip_center_modals_index_msqif69brk`}</span>
          <div className="arrow-icon">
            <Icon name="new_next_arrow" hasTheme />
          </div>
        </Link>
      </div>
      <LazyImage width={50} height={50} src={icon as unknown as string} />
    </div>
  )
}

export function VipCenterDeriviativesRedirectModal(props) {
  const { visible, setvisible, levelCode } = props

  const { data, run } = useRequest(getV1ChainStarGetDynamicNavigationApiRequest, { manual: true })

  const [upgradeCondition, setupgradeCondition] = useState<YapiGetV1MemberVipBaseConfigListData>()
  const list = useVipUpgradeConditionsList()
  useEffect(() => {
    const data = list?.find(e => e.levelCode?.toString() === levelCode?.toString())
    setupgradeCondition(data)
  }, [levelCode])

  useEffect(() => {
    visible && run({ type: '1' })
  }, [visible])

  const derivativesMenuList = (data?.data as unknown as YapiGetV1ChainStarGetDynamicNavigationData[])
    ?.map(derivative => {
      const iconUrl = Object.keys(vipCenterRedirectMenuIconUrl)
      const icon = iconUrl.find(key => derivative?.url?.includes(key)) || ''
      return {
        ...derivative,
        icon: vipCenterRedirectMenuIconUrl?.[icon],
      }
    })
    ?.filter(d =>
      (d as any)?.vipDerivative ? upgradeCondition?.derivatives.includes((d as any).vipDerivative) : false
    )
  return (
    <Modal
      className={styles['vip-center-redirection-modal']}
      visible={visible}
      title={t`features_vip_vip_center_modals_index_hr1wvpk_lz`}
      footer={
        <Button long type="primary" onClick={() => setvisible(false)}>
          {t`features_trade_spot_index_2510`}
        </Button>
      }
      onCancel={() => setvisible(false)}
    >
      {derivativesMenuList?.map((menu, idx) => (
        <RedirectionCell {...menu} key={idx} />
      ))}
    </Modal>
  )
}

export function VipCenterBalanceRedirectModal(props) {
  const { visible, setvisible } = props

  const businessName = getBusinessName()

  let c2cMenuList = {
    name: t`features_vip_vip_center_modals_index_ankqyn2p_z`,
    describe: t`features_vip_vip_center_modals_index_eixihc5grq`,
    url: getC2cFastTradePageRoutePath(),
  }

  let balanceMenuList = [
    {
      name: t`assets.deposit.title`,
      describe: t({
        id: 'features_vip_vip_center_modals_index_j_uvfscjjg',
        values: { 0: businessName },
      }),
      url: getAssetsDepositPageRoutePath(),
    },
    c2cMenuList,
  ]

  balanceMenuList = balanceMenuList.map(derivative => {
    const iconUrl = Object.keys(vipCenterRedirectMenuIconUrl)
    const icon = iconUrl.find(key => derivative?.url?.includes(key)) || ''
    return {
      ...derivative,
      icon: vipCenterRedirectMenuIconUrl?.[icon],
    }
  })

  return (
    <Modal
      className={styles['vip-center-redirection-modal']}
      visible={visible}
      title={t`features_vip_vip_center_modals_index_xdmgvxwp4x`}
      footer={
        <Button long type="primary" onClick={() => setvisible(false)}>
          {t`features_trade_spot_index_2510`}
        </Button>
      }
      onCancel={() => setvisible(false)}
    >
      {balanceMenuList?.map((menu, idx) => (
        <RedirectionCell {...(menu as YapiGetV1ChainStarGetDynamicNavigationData)} key={idx} />
      ))}
    </Modal>
  )
}
