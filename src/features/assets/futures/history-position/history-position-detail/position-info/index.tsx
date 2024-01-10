/**
 * 强平 - 仓位信息
 */
import { getFuturesGroupTypeName } from '@/constants/assets/futures'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import { getTextFromStoreEnums } from '@/helper/store'
import { t } from '@lingui/macro'
import LazyImage from '@/components/lazy-image'
import FuturesInfoTag from '../../../common/futures-info-tag'

function LiquidationPositionInfo() {
  const { futuresPosition, futuresEnums } = useAssetsFuturesStore() || {}
  const { liquidationDetails } = futuresPosition || {}

  return (
    <>
      <div className="position-modal-header-title">{t`constants/order-13`}</div>
      <div className="position-wrap">
        <div className="position-info">
          <div className="info-name">
            {liquidationDetails?.symbol} {getFuturesGroupTypeName(liquidationDetails?.swapTypeInd)}
          </div>

          <FuturesInfoTag
            showGroupName={false}
            positionData={{ sideInd: liquidationDetails?.sideInd, lever: String(liquidationDetails?.lever || '') }}
          />
        </div>

        <div className="position-type">
          {getTextFromStoreEnums(liquidationDetails?.operationTypeCd, futuresEnums.historyPositionCloseTypeEnum.enums)}
        </div>
      </div>
    </>
  )
}

export { LiquidationPositionInfo }
