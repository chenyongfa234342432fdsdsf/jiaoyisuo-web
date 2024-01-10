import Icon from '@/components/icon'
import Link from '@/components/link'
import { AssetsTransferTypeEnum } from '@/constants/assets/futures'
import { TradeFuturesOrderAssetsTypesEnum } from '@/constants/trade'
import AssetsFuturesTransfer from '@/features/assets/common/transfer/assets-futures-transfer'
import { getMergeModeStatus } from '@/features/user/utils/common'
import { useFuturesStore } from '@/store/futures'
import { useContractMarketStore } from '@/store/market/contract'
import { useState } from 'react'

function FuturesAssetsPanelAdd() {
  const isMergeMode = getMergeModeStatus()
  const { currentCoin } = useContractMarketStore()

  const [assetsFuturesTransferVisible, setAssetsFuturesTransferVisible] = useState(false)
  const { selectedContractGroup, currentGroupOrderAssetsTypes } = useFuturesStore()

  function setVisible() {
    setAssetsFuturesTransferVisible(false)
  }
  if (isMergeMode) {
    return null
  }
  if (currentGroupOrderAssetsTypes === TradeFuturesOrderAssetsTypesEnum.assets) {
    return (
      <Link href={`/assets/main/deposit?id=${currentCoin.sellCoinId}`} target>
        <Icon name="a-spot_available" />
      </Link>
    )
  }
  return (
    <>
      <Icon name="convert_icon" onClick={() => setAssetsFuturesTransferVisible(true)} />
      {assetsFuturesTransferVisible && (
        <AssetsFuturesTransfer
          type={AssetsTransferTypeEnum.to}
          coinId={currentCoin?.id as unknown as string}
          groupId={selectedContractGroup?.groupId}
          visible={assetsFuturesTransferVisible}
          setVisible={setVisible}
        />
      )}
    </>
  )
}

export default FuturesAssetsPanelAdd
