import { TradeFuturesOrderAssetsTypesEnum, getTradeFuturesOrderAssetsTypesMap } from '@/constants/trade'
import { formatCurrency } from '@/helper/decimal'
import Icon from '@/components/icon'
import { FuturesGuideIdEnum } from '@/constants/future/trade'
import { useUserStore } from '@/store/user'
import FuturesAssetsPanelAdd from './futures-assets-panel-add'
import Styles from './index.module.css'

interface IFuturesAssetsPanel {
  isOpenFutures: boolean
  isMergeMode: boolean
  setFuturesOrderAssetsPopupVisible: any
  underlyingCoin: any
  futuresCurrencySettings: any
  userCoinTotal: any
  currentCoin: any
  currentGroupOrderAssetsTypes: TradeFuturesOrderAssetsTypesEnum
}

function FuturesAssetsPanel(props: IFuturesAssetsPanel) {
  const {
    isOpenFutures,
    setFuturesOrderAssetsPopupVisible,
    currentGroupOrderAssetsTypes,
    underlyingCoin,
    futuresCurrencySettings,
    userCoinTotal,
  } = props
  const tradeFuturesOrderAssetsTypesMap = getTradeFuturesOrderAssetsTypesMap()
  const { isLogin } = useUserStore()
  return (
    <div className={`assets-wrap ${Styles.scoped}`} id={FuturesGuideIdEnum.availableBalance}>
      <div
        className="label cursor-pointer"
        onClick={() => {
          if (isOpenFutures) {
            setFuturesOrderAssetsPopupVisible(true)
          }
        }}
      >
        {tradeFuturesOrderAssetsTypesMap[currentGroupOrderAssetsTypes]}({underlyingCoin}){' '}
        <Icon className="icon-arrow" name="arrow_open" hasTheme />
      </div>
      <div className="num">
        {isOpenFutures && isLogin ? formatCurrency(userCoinTotal, futuresCurrencySettings.offset || 2, false) : '--'}
        <FuturesAssetsPanelAdd />
      </div>
    </div>
  )
}

export default FuturesAssetsPanel
