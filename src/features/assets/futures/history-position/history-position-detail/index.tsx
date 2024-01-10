/**
 * 历史仓位 - 强平详情弹框组件
 */
import AssetsPopUp from '@/features/assets/common/assets-popup'
import styles from './index.module.css'
import { LiquidationPositionInfo } from './position-info'
import { LiquidationPositionDetails } from './details'

/** 调用组件需要提前请求数据字典接口-fetchAssetEnums */
interface IHistoryPositionDetailLayoutProps {
  visible: boolean
  setVisible: (val: boolean) => void
}
export function HistoryPositionDetailLayout(props: IHistoryPositionDetailLayoutProps) {
  const { visible, setVisible } = props

  return (
    <AssetsPopUp
      isResetCss
      title={null}
      visible={visible}
      footer={null}
      onCancel={() => {
        setVisible(false)
      }}
    >
      <div className={styles.scoped}>
        <LiquidationPositionInfo />
        <LiquidationPositionDetails />
      </div>
    </AssetsPopUp>
  )
}
