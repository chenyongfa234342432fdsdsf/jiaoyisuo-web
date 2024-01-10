import Icon from '@/components/icon'
import { Message, Modal, Spin, Tooltip } from '@nbit/arco'
import { CoinSelect, NetWorkSelect } from '@/features/assets/common/assets-select'
import { useEffect, useState } from 'react'
import { CoinList } from '@/features/assets/common/coin-list'
import { CoinListTypeEnum, CoinStateEnum } from '@/constants/assets'
import { t } from '@lingui/macro'
import { ISubCoinList, AllCoinListResp, IDepositAddressResp } from '@/typings/api/assets/assets'
import { getAllCoinList, getSubCoinList } from '@/helper/assets'
import { useCopyToClipboard } from 'react-use'
import { getDepositAddress } from '@/apis/assets/main'
import { map } from 'lodash'
import { QRCodeCanvas } from 'qrcode.react'
import NetworkStopService from '../../common/network-stop-service'
import styles from './index.module.css'

function AddressInfo({ addressData, coinName }) {
  const { address, depositMinLimit, depositConfirmNum, withdrawConfirmNum, contractInfo } = addressData || {}
  const [state, copyToClipboard] = useCopyToClipboard()
  const onCopyToClipboard = val => {
    copyToClipboard(val)
    state.error
      ? Message.error(t`assets.financial-record.copyFailure`)
      : Message.success(t`assets.financial-record.copySuccess`)
  }

  const confirmList = [
    {
      label: t`features_assets_main_deposit_address_info_index_lu11ghg3au`,
      value: depositMinLimit && `${depositMinLimit} ${coinName}`,
    },
    {
      label: t`features_assets_main_deposit_address_info_index_i1tgbsgqhi`,
      value:
        depositConfirmNum && `${depositConfirmNum} ${t`features_assets_main_deposit_address_info_index_q5lhj7qzmz`}`,
    },
    {
      label: t`features_assets_main_deposit_address_info_index_owa1vrgpxa`,
      value:
        withdrawConfirmNum && `${withdrawConfirmNum} ${t`features_assets_main_deposit_address_info_index_q5lhj7qzmz`}`,
    },
    {
      label: t`future.funding-history.title`,
      value: contractInfo && `****${contractInfo.slice(-5)}`,
      showHint: true,
    },
  ]

  return (
    <>
      <div className="assets-label">{t`assets.deposit.DepositAddress`}</div>
      <div className="address-form">
        <div className="info">{address}</div>
        <Icon
          name="copy"
          hasTheme
          onClick={() => {
            onCopyToClipboard(address)
          }}
          className="copy-icon"
        />
      </div>
      <div className="assets-label">{t`features_assets_main_deposit_modal_index_jg2ymd1br6`}</div>
      <div className="flex justify-between">
        <div className="confirm-wrap">
          {map(confirmList, (item, i: number) => {
            if (!item.value) return null
            return (
              <div key={i} className="confirm-item">
                <div className="label">
                  {item.label}
                  {item?.showHint && (
                    <Tooltip content={t`features_assets_main_deposit_address_info_index_pkbvrx_uan`}>
                      <div>
                        <Icon name="msg" hasTheme />
                      </div>
                    </Tooltip>
                  )}
                </div>
                <div className="font-medium">{item.value}</div>
              </div>
            )
          })}
        </div>
        <div className="pay-qr-code">
          <QRCodeCanvas value={address || ''} size={110} />
          <div className="pay-tips">
            {t`assets.deposit.DepositTips`} {coinName}
          </div>
        </div>
      </div>
    </>
  )
}

export function DepositModal({ visible, onClose, coinId }) {
  const [visibleCoinList, setVisibleCoinList] = useState(false)
  // 币种选择
  const [coin, setCoin] = useState<AllCoinListResp>(null as any)
  // 主网选择
  const [subCoin, setSubCoin] = useState<ISubCoinList | null>()
  // 主网选择下拉列表
  const [subCoinList, setSubCoinList] = useState<ISubCoinList[]>(null as any)
  // 充币地址
  const [addressData, setAddressData] = useState<null | IDepositAddressResp>(null as any)
  const [loading, setLoading] = useState(false)

  /** 获取充币地址 */
  const getAddressInfo = async id => {
    const params = { coinId: id }
    const res = await getDepositAddress(params)
    const results = res.data

    if (!res.isOk || !results) {
      setAddressData(null) // 清空之前选中的充币地址信息
      return
    }

    setAddressData(results)
  }

  /** 获取币的基本信息 - 币状态和币地址 */
  const getCoinBaseInfo = async coinInfo => {
    if (!coinInfo) return
    setLoading(true)
    setCoin(coinInfo)

    // 获取对应的子币（主网信息）
    const subCoinListData = await getSubCoinList(coinInfo.id)
    subCoinListData && setSubCoinList(subCoinListData)

    // 没子币信息时，直接获取充币地址
    if (!subCoinListData || subCoinListData.length === 0) {
      // 是否开启充值，1，是。2，否
      coinInfo.isDeposit === CoinStateEnum.open && (await getAddressInfo(coinInfo.id))
      setLoading(false)
      return
    }

    if (subCoinListData && coinId) {
      setSubCoin(subCoinListData[0])
      subCoinListData[0].isDeposit === CoinStateEnum.open && (await getAddressInfo(subCoinListData[0].id))
      setLoading(false)
    }
  }

  /** 选择主网信息 */
  const onChangeSubCoin = (value: any) => {
    const subCoinData = JSON.parse(value)
    if (subCoinData.isDeposit === CoinStateEnum.open) {
      getAddressInfo(subCoinData.id)
    } else {
      setAddressData(null)
    }
    setSubCoin(subCoinData)
  }

  const renderAddressByState = () => {
    if (!coin) return
    if (subCoin && subCoin?.isDeposit === CoinStateEnum.close) {
      return <NetworkStopService coinId={subCoin?.id || coin?.id} type={CoinListTypeEnum.deposit} />
    }

    if (addressData) {
      return <AddressInfo addressData={addressData} coinName={coin?.coinName} />
    }

    return null
  }

  const initData = async () => {
    if (!coinId) return
    // 获取所有币种
    const { coinInfo } = await getAllCoinList({ coinId, type: CoinListTypeEnum.deposit })
    /** 获取币的基本信息 */
    getCoinBaseInfo(coinInfo)
  }

  useEffect(() => {
    initData()
  }, [])

  return (
    <>
      <Modal
        title={t`assets.deposit.title`}
        visible={visible}
        onCancel={onClose}
        footer={null}
        className={styles['deposit-modal']}
        closeIcon={<Icon className="text-xl translate-y-1" name="close" hasTheme />}
        focusLock={false}
      >
        <Spin loading={loading}>
          <div className="assets-label">{t`order.filters.coin.placeholder`}</div>
          <CoinSelect
            setVisibleCoinList={setVisibleCoinList}
            coin={coin}
            className="!h-10"
            coinInfoClassName="border-none bg-bg_sr_color !rounded-lg"
          />
          {coin && (
            <>
              <div className="assets-label">{t`assets.deposit.network`}</div>
              <NetWorkSelect selectValue={subCoin} networkList={subCoinList} onChangeFn={onChangeSubCoin} />
            </>
          )}
          {renderAddressByState()}
        </Spin>
      </Modal>
      {/* 币种选择 */}
      {visibleCoinList && (
        <CoinList
          type={CoinListTypeEnum.deposit}
          onChangeCoin={getCoinBaseInfo}
          isShow={visibleCoinList}
          setShow={setVisibleCoinList}
        />
      )}
    </>
  )
}
