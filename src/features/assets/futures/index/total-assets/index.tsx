import { t } from '@lingui/macro'
import { AssetsEncrypt } from '@/features/assets/common/assets-encrypt'
import { EyesIcon } from '@/features/assets/common/eyes-icon'
import { formatAssetInfo } from '@/helper/assets/futures'
import { FuturesAssetsResp } from '@/typings/api/assets/futures'
import { useState } from 'react'
import AssetsPopupTips from '@/features/assets/common/assets-popup/assets-popup-tips'
import { Button } from '@nbit/arco'
import { IncreaseTag } from '@nbit/react'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import { useCommonStore } from '@/store/common'
import { useFutureQuoteDisplayDigit } from '@/hooks/features/assets'
import styles from './index.module.css'

interface ITotalAssetsProps {
  assetsData: FuturesAssetsResp
}

interface IModalDataProps {
  visible?: boolean
  type: string
  title: string
  coinAssets: string | number
  marginAssets: string | number
}

function TotalAssets(props: ITotalAssetsProps) {
  const { isMergeMode } = useCommonStore()
  const [visibleAvailablePrompt, setVisibleAvailablePrompt] = useState(false)
  const [modalData, setModalData] = useState<IModalDataProps>()
  const offset = useFutureQuoteDisplayDigit()

  const {
    assetsData: {
      /** 计价币 */
      baseCoin = '',
      /** 追加保证金剩余额度 */
      marginAmount = '--',
      /** 合约总资产 */
      totalPerpetualAsset = '0',
      /** 流动资产 */
      totalMarginAvailable = '0',
      /** 仓位资产 */
      totalPositionAssets = '0',
      /** 是否自动追加保证金 */
      isAutoAdd = false,
      /** 未实现盈亏 */
      totalUnrealizedProfit = '0',
      /** 可用币种资产 */
      totalMarginCoinAvailable = '0',
      /** 仓位占用币种资产 */
      totalPositionCoinAsset = '0',
      /** 开仓冻结币种价值 */
      totalLockCoinAsset = '0',
      /** 开仓冻结保证金价值 */
      totalLockMarginAsset = '0',
      /** 体验金 */
      totalVoucherAmount = '0',
    },
  } = {
    ...props,
  }
  // 设置 modal 数据
  const setModalDataFn = (title: string, coinAssets: string | number, marginAssets: string | number, type: string) => {
    setModalData({
      title,
      coinAssets,
      marginAssets,
      type,
    })
  }

  return (
    <div className={styles.scoped}>
      <div className="asset-item-wrap">
        <div className="asset-item">
          <div className="asset-total">
            <span>{t`assets.index.overview.contract_assets`}</span>
            <EyesIcon />
          </div>

          <span className="asset-total-num">
            <AssetsEncrypt content={`≈ ${formatAssetInfo(totalPerpetualAsset, baseCoin, offset, !isMergeMode)}`} />
          </span>
        </div>
      </div>

      <div className="asset-item-wrap">
        <div className="asset-item">
          <div className="asset-label">
            <span
              className="tips-text"
              onClick={() => {
                setVisibleAvailablePrompt(true)
                setModalDataFn(
                  t`features/assets/margin/all/assets-list/index-1`,
                  totalMarginCoinAvailable,
                  totalMarginAvailable,
                  'available'
                )
              }}
            >{t`features/assets/margin/all/assets-list/index-1`}</span>
          </div>
          <span className="value">
            <AssetsEncrypt content={formatAssetInfo(totalMarginCoinAvailable, baseCoin, offset, !isMergeMode)} />
          </span>
        </div>
        <div className="asset-item">
          <div className="asset-label">
            <span
              className="tips-text"
              onClick={() => {
                setVisibleAvailablePrompt(true)
                setModalDataFn(
                  t`assets.common.position_assets_new`,
                  totalPositionCoinAsset,
                  totalPositionAssets,
                  'margin'
                )
              }}
            >{t`assets.common.position_assets_new`}</span>
          </div>
          <span className="value">
            <AssetsEncrypt content={formatAssetInfo(totalPositionCoinAsset, baseCoin, offset, !isMergeMode)} />
          </span>
        </div>
        <div className="asset-item">
          <div className="asset-label">
            <span
              className="tips-text"
              onClick={() => {
                setVisibleAvailablePrompt(true)
                setModalDataFn(
                  t`features_assets_futures_index_total_assets_index_wadnkn6hxo3kzwjzjkahr`,
                  totalLockCoinAsset,
                  totalLockMarginAsset,
                  'lock'
                )
              }}
            >{t`features_assets_futures_index_total_assets_index_wadnkn6hxo3kzwjzjkahr`}</span>
          </div>
          <span className="value">
            <AssetsEncrypt content={formatAssetInfo(totalLockCoinAsset, baseCoin, offset, !isMergeMode)} />
          </span>
        </div>
      </div>
      <div className="asset-item-wrap">
        {isAutoAdd && (
          <div className="asset-item">
            <span className="asset-label">{t`features_assets_futures_index_total_assets_index_5101344`}</span>
            <span className="value">
              <AssetsEncrypt content={formatAssetInfo(marginAmount, baseCoin, offset, !isMergeMode)} />
            </span>
          </div>
        )}
        <div className="asset-item">
          <span className="asset-label">{t`features/orders/order-columns/holding-6`}</span>
          <span className="value">
            <AssetsEncrypt
              content={
                Number(totalUnrealizedProfit) === 0 ? (
                  '--'
                ) : (
                  <IncreaseTag
                    value={totalUnrealizedProfit}
                    digits={offset}
                    isRound={false}
                    delZero={false}
                    hasPrefix
                    kSign
                    right={` ${!isMergeMode ? baseCoin : ''}`}
                  />
                )
              }
            />
          </span>
        </div>
      </div>
      {/* 可用资产、仓位占用资产详情 */}
      {visibleAvailablePrompt && modalData && (
        <AssetsPopupTips
          visible={visibleAvailablePrompt}
          setVisible={setVisibleAvailablePrompt}
          popupTitle={modalData.title}
          footer={null}
          slotContent={
            <div>
              <div>
                <div>
                  {t`features_assets_futures_index_total_assets_index_prhxdnqzueoyu8it5yqhr`}
                  {formatAssetInfo(modalData.coinAssets, baseCoin, offset, !isMergeMode)}
                </div>
                <div>
                  {t`features_assets_futures_index_total_assets_index_yqnkfkoitd0iicq_oxbve`}
                  {formatAssetInfo(modalData.marginAssets, baseCoin, offset, !isMergeMode)}
                  {modalData?.type === 'margin' &&
                    Number(totalVoucherAmount) > 0 &&
                    t({
                      id: 'features_assets_futures_common_position_cell_index_p0onx1r3zy',
                      values: { 0: formatAssetInfo(totalVoucherAmount, baseCoin, offset, !isMergeMode) },
                    })}
                </div>
              </div>
              <div className="footer">
                <Button
                  type="primary"
                  onClick={() => {
                    setVisibleAvailablePrompt(false)
                  }}
                >
                  {t`features_trade_spot_index_2510`}
                </Button>
              </div>
            </div>
          }
        />
      )}
    </div>
  )
}

export { TotalAssets }
