/**
 * 合约 - 交易方向标签组件 - 持仓和历史仓位通用
 */
import { IPositionListData } from '@/typings/api/assets/futures/position'
import { getFuturesGroupTypeName } from '@/constants/assets/futures'
import LazyImage from '@/components/lazy-image'
import Icon from '@/components/icon'
import { getTradeFuturesRoutePath } from '@/helper/route/trade'
import { link } from '@/helper/link'
import styles from './index.module.css'
import FuturesInfoTag from '..'

interface IFuturesBaseTagProps {
  /** 是否展示杠杆倍数，默认展示 */
  showLever?: boolean
  /** 历史仓位的合约类型 */
  swapTypeInd?: string
  /** 仓位信息 */
  positionData: IPositionListData | any
}
export default function FuturesBaseTag(props: IFuturesBaseTagProps) {
  const {
    showLever = true,
    /** 历史仓位的合约类型 */
    swapTypeInd,
    /**
     * symbol: 币对名
     * typeInd: 合约类型 perpetual:永续 delivery:交割
     * sideInd: 交易方向 open_long:多仓位 open_short:空仓位
     * lever: 杠杆倍数
     * groupName: 合约组名
     */
    positionData: { symbol = '', typeInd = '', sideInd = '', lever = '', webLogo, groupId },
  } = props || {}

  return (
    <div
      className={styles['futures-base-tag-root']}
      onClick={() => {
        link(getTradeFuturesRoutePath(symbol, undefined, groupId))
      }}
    >
      {webLogo && <LazyImage src={webLogo} width={14} height={14} />}
      <div className="name">
        {symbol} {(swapTypeInd || typeInd) && getFuturesGroupTypeName(swapTypeInd || typeInd)}
      </div>
      <Icon name="next_arrow" hasTheme className="next-icon" />
      <FuturesInfoTag positionData={{ sideInd, lever: String(lever) }} showGroupName={false} showLever={showLever} />
    </div>
  )
}
