import { Dispatch, SetStateAction, useEffect } from 'react'
import { Drawer } from '@nbit/arco'
import { t } from '@lingui/macro'
import { UserEnabledStateTypeEnum } from '@/constants/user'
import FuturesSetting from '@/features/trade/trade-setting/futures'
import TradeSpotSetting from '@/features/trade/trade-setting/spot'
import { useUserStore } from '@/store/user'
import { getModuleStatusByKey } from '@/helper/module-config'
import { ModuleEnum } from '@/constants/module-config'
import styles from './index.module.css'

interface TradeSidebarSettingProps {
  /** 是否显示弹窗 */
  visible: boolean
  /** 是否显示新手教程 */
  isTutorial?: boolean
  /** 设置显示状态 */
  setVisible: Dispatch<SetStateAction<boolean>>
  /** 成功回调 */
  onSuccess?(isTrue: boolean): void
}

function TradeSidebarSetting({ visible, isTutorial = false, setVisible, onSuccess }: TradeSidebarSettingProps) {
  const { isLogin, userInfo, updateUserSettingsInfo } = useUserStore()
  const { isOpenContractStatus = UserEnabledStateTypeEnum.unEnable } = userInfo
  const isShowContract = getModuleStatusByKey(ModuleEnum.contract)

  useEffect(() => {
    visible && isLogin && updateUserSettingsInfo()
  }, [visible])

  return (
    <Drawer
      width={400}
      title={t`features_trade_trade_setting_index_2510`}
      visible={visible}
      footer={null}
      className={`trade-setting-drawer-style ${styles.scoped}`}
      onOk={() => {
        setVisible(false)
      }}
      onCancel={() => {
        setVisible(false)
      }}
    >
      <TradeSpotSetting />

      {isShowContract && (
        <FuturesSetting
          isTutorial={isTutorial}
          visible={isLogin && isOpenContractStatus === UserEnabledStateTypeEnum.enable && visible}
          onSuccess={onSuccess}
          onClose={setVisible}
        />
      )}
    </Drawer>
  )
}

export default TradeSidebarSetting
