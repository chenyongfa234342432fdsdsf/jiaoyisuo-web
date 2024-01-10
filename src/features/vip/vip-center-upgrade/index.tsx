import Icon from '@/components/icon'
import { Popover, Progress, Spin, Tooltip } from '@nbit/arco'
import { YapiGetV1MemberVipBaseInfoApiResponse } from '@/typings/yapi/MemberVipBaseInfoV1GetApi'
import { useEffect, useState } from 'react'
import { useVipUpgradeConditionsByLevel, useVipUserInfo } from '@/hooks/features/vip/vip-perks'
import { getVipTierRoutePath } from '@/helper/route'
import { link } from '@/helper/link'
import { defaultUpgradeData } from '@/store/vip/vip-perks'
import { t } from '@lingui/macro'
import { amountCalStatus } from '@/constants/vip'
import styles from './index.module.css'

function VipCenterUpgradeItem(props: ReturnType<typeof defaultUpgradeData>[0] & { levelCode?: string }) {
  const { title, description, button, isEnabled, value, limit, popoverDescription, Modal, redirectionUrl, levelCode } =
    props
  const [modalVisible, setmodalVisible] = useState(false)
  if (!isEnabled) return <div></div>
  return (
    <div className={styles['vip-center-upgrade-item']}>
      <div className="flex flex-row item-center">
        <span className="text-sm text-text_color_01">{title}</span>
        {popoverDescription && (
          <Tooltip content={<span>{popoverDescription}</span>} trigger="click">
            <Icon className="ml-1 text-xs" name="msg" hasTheme />
          </Tooltip>
        )}
      </div>
      <div className="text-2xl font-medium my-1">{value} USD</div>
      <label className="text-xs font-normal text-text_color_03">{`${value} / ${limit || '-'}`}</label>
      <Progress className={'mb-4'} percent={(value / limit) * 100} />
      <span className="text-xs text-text_color_02">{description}</span>
      <span
        onClick={() => {
          Modal && setmodalVisible(true)
          redirectionUrl && link(redirectionUrl)
        }}
      >
        {button}
      </span>
      {Modal && <Modal visible={modalVisible} setvisible={setmodalVisible} levelCode={levelCode} />}
    </div>
  )
}

function VipCenterUpgrade({
  headerTitle,
  levelCode,
  nextLevelCode,
}: {
  headerTitle?: string
  levelCode?: string
  nextLevelCode?: string
}) {
  const { currentUpgradeData, loading } = useVipUpgradeConditionsByLevel(
    nextLevelCode === null ? 'LV10' : nextLevelCode
  )
  const { userConfig, fetchApi } = useVipUserInfo() || {}
  const formattedData = currentUpgradeData?.map(each => {
    return {
      ...each,
      value: userConfig?.[each.apiKey] || 0,
    }
  })
  useEffect(() => {
    fetchApi()
  }, [])

  return (
    <Spin loading={loading} className={styles['vip-center-upgrade']}>
      <div className="mb-6 flex">
        <span>
          <span className="text-base font-medium flex flex-row items-center">
            {headerTitle}
            <Tooltip content={<span>{t`features_vip_vip_center_upgrade_index_afckq6qjjo`}</span>} trigger="click">
              <Icon className="ml-1" name="msg" hasTheme />
            </Tooltip>
          </span>
          <div className="text-xs text-text_color_03 mt-1">
            <span
              dangerouslySetInnerHTML={{
                __html: t({
                  id: 'features_vip_vip_center_upgrade_index_neg6kuxw88',
                  values: { 0: nextLevelCode || 'LV10' },
                }),
              }}
            ></span>
          </div>
        </span>
        <span className="ml-auto text-text_color_03 text-xs cursor-pointer" onClick={() => link(getVipTierRoutePath())}>
          {t`features_vip_vip_center_upgrade_index_omv2xq13yd`} <Icon className="mb-0.5" name="next_arrow" hasTheme />
        </span>
      </div>
      <div className="upgrade-layout">
        {formattedData?.map(
          (each, idx) =>
            each.isEnabled === amountCalStatus.enable && (
              <VipCenterUpgradeItem key={idx} {...each} levelCode={levelCode} />
            )
        )}
      </div>
    </Spin>
  )
}

export default VipCenterUpgrade
