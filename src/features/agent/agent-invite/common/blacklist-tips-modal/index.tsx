/**
 * 用户黑名单弹框提醒
 */
import { t } from '@lingui/macro'
import { Button, Checkbox } from '@nbit/arco'
import AssetsPopupTips from '@/features/assets/common/assets-popup/assets-popup-tips'
import { useEffect, useState } from 'react'
import { getCacheAgentTipsTime, setCacheAgentTipsTime } from '@/helper/cache/agent'
import { useAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import styles from './index.module.css'

function BlackListTipsModal() {
  const agentInviteStore = useAgentInviteV3Store()
  const {
    isBlackListData: { inBlacklist, reason },
  } = {
    ...agentInviteStore,
  }

  const [isShowWarn, setIsShowWarn] = useState<boolean>(true) // 警告控制
  const [noWarn, setNoWarn] = useState<boolean>(false) // 为 true 时本日不再提醒
  const [cacheDate, setCacheDate] = useState(0) // 本日不再提醒，设备缓存时间

  useEffect(() => {
    if (inBlacklist) {
      setIsShowWarn(true)
    } else {
      setIsShowWarn(false)
    }
  }, [inBlacklist])

  /** 获取当天日期 */
  const getCurrentDate = () => {
    const todayDate = new Date().getDate()
    return todayDate
  }

  /** 挂载获取存储日期 */
  useEffect(() => {
    const cacheTime = getCacheAgentTipsTime()
    if (!cacheTime) return
    setCacheDate(Number(cacheTime))
  }, [])

  const onOkButton = () => {
    setIsShowWarn(false)
    if (!noWarn) return

    const todayDate = getCurrentDate()
    // 存储时间，用于判断是否当天不再提醒
    setCacheAgentTipsTime(todayDate)
    setCacheDate(todayDate)
    setNoWarn(false)
  }

  return (
    <AssetsPopupTips
      popupTitle={t`features_agent_index_hlcebjqjyd`}
      footer={null}
      visible={cacheDate === getCurrentDate() ? false : isShowWarn}
      setVisible={setIsShowWarn}
      slotContent={
        <div className={styles['blacklist-modal']}>
          <div className="tips-content">
            <div className="text">
              {t`features_agent_index_bbvzcg0gv9`}
              <br />
              {t`features_agent_index_8eqcucrpta`}
            </div>
            <div className="text">
              {t`features_agent_index_ndnjfwutbm`}
              <br />
              <span className="reason-msg">{reason || '--'}</span>
            </div>
            <div className="text">{t`features_agent_index_x1qx3ngxzb`} </div>
          </div>
          <div className="tips-warn">
            <Checkbox
              onChange={checked => {
                setNoWarn(checked)
              }}
            >
              <span className="no-warn">{t`features_agent_index_25rxh_h8tq`}</span>
            </Checkbox>
          </div>
          <div className="footer !mt-4">
            <Button type="primary" onClick={onOkButton}>
              {t`features_trade_spot_index_2510`}
            </Button>
          </div>
        </div>
      }
    />
  )
}

export default BlackListTipsModal
