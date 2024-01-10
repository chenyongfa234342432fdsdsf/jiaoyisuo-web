import {
  AssetsTransferTypeList,
  FinancialRecordListFromPage,
  FinancialRecordStateEnum,
  FinancialRecordTypeEnum,
  RecordValueNoSymbol,
} from '@/constants/assets'
import { t } from '@lingui/macro'
import { getTextFromStoreEnums } from '@/helper/store'
import { useAssetsStore } from '@/store/assets'
import { formatNonExponential } from '@/helper/decimal'
import { IncreaseTag } from '@nbit/react'
import classNames from 'classnames'
import { oss_svg_image_domain_address } from '@/constants/oss'
import LazyImage, { Type } from '@/components/lazy-image'
import styles from './index.module.css'

// 状态图标
function StateIconItem(props) {
  const { state } = props
  const svgList = {
    success: 'recharge_icon_success',
    processing: 'recharge_icon_processing',
    fail: 'recharge_icon_fail',
    error: 'recharge_icon_error',
  }

  let imgUrl = svgList.success
  /** 财务记录状态：1、进行中 2、成功 3、失败 4、错误 */
  switch (state) {
    case FinancialRecordStateEnum.success:
      imgUrl = `${svgList.success}`
      break
    case FinancialRecordStateEnum.processing:
      imgUrl = `${svgList.processing}`
      break
    case FinancialRecordStateEnum.fail:
      imgUrl = `${svgList.fail}`
      break
    case FinancialRecordStateEnum.error:
      imgUrl = `${svgList.error}`
      break
    default:
      imgUrl = `${svgList.processing}`
      break
  }

  return <LazyImage src={`${oss_svg_image_domain_address}${imgUrl}`} imageType={Type.svg} className="state-icon" />
}

export function RecordDetailState({ fromPage = FinancialRecordListFromPage.other, total = '' }) {
  const { financialRecordDetail } = useAssetsStore()

  const getStateCss = (state: number) => {
    switch (state) {
      case FinancialRecordStateEnum.success:
        return 'success'
      case FinancialRecordStateEnum.processing:
        return 'processing'
      case FinancialRecordStateEnum.fail:
        return 'fail'
      case FinancialRecordStateEnum.error:
        return 'error'
      default:
        return 'processing'
    }
  }

  const {
    statusCd = FinancialRecordStateEnum.processing,
    typeInd = FinancialRecordTypeEnum.all,
    businessCoin,
    amount = 0,
    fee = 0,
    feeCoinName,
    coinName,
    groupType,
    transferIn,
    transferOut,
  } = financialRecordDetail || {}

  // 现货手续费币种用 feeCoinName
  let newBusinessCoin =
    typeInd === FinancialRecordTypeEnum.spotCommission ? feeCoinName : businessCoin || coinName || '--'

  const { assetsEnums } = useAssetsStore()
  const getAmount = () => {
    let newAmount = typeInd === FinancialRecordTypeEnum.spotCommission ? fee : amount
    // 划转从列表里取值
    if (AssetsTransferTypeList.includes(typeInd) && total) {
      newAmount = total
    }

    return formatNonExponential(newAmount)
  }

  return (
    <div className={styles.scoped}>
      <div className={`order-info ${getStateCss(statusCd)}`}>
        <StateIconItem state={statusCd} />
        <div className="left">
          <div>
            {typeInd === FinancialRecordTypeEnum.extractCommission
              ? t`assets.financial-record.search.withdraw`
              : getTextFromStoreEnums(typeInd, assetsEnums.financialRecordTypeEnum.enums)}
          </div>
          <div className="font-color">
            {getTextFromStoreEnums(statusCd, assetsEnums.financialRecordStateEnum.enums)}
          </div>
        </div>
        <div className="right">
          <div>
            {newBusinessCoin}
            {groupType ? getTextFromStoreEnums(groupType, assetsEnums.financialRecordTypeSwapList.enums) : ''}
          </div>
          <div
            className={classNames('amount', {
              'font-color': statusCd !== FinancialRecordStateEnum.success && statusCd !== FinancialRecordStateEnum.fail,
            })}
          >
            <IncreaseTag
              value={getAmount()}
              hasColor={
                (!RecordValueNoSymbol.includes(typeInd) &&
                  !(fromPage === FinancialRecordListFromPage.futuresRecordList && transferIn && transferOut) &&
                  statusCd === FinancialRecordStateEnum.success) ||
                statusCd === FinancialRecordStateEnum.fail
              }
              hasPrefix={
                !(fromPage === FinancialRecordListFromPage.futuresRecordList && transferIn && transferOut) &&
                !RecordValueNoSymbol.includes(typeInd)
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
