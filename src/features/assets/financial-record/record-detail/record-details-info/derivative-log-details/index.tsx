/**
 * 财务记录 - 衍生品 - 三元期权详情
 */
import { t } from '@lingui/macro'
import { formatDate } from '@/helper/date'
import { getTextFromStoreEnums } from '@/helper/store'
import { useAssetsStore } from '@/store/assets'
import { OptionProductPeriodUnitEnum, getOptionProductPeriodUnit } from '@/constants/ternary-option'
import { RecordOptionTypeList, RecordRecreationTypeList } from '@/constants/assets'
import { IListEnum, RecordDetailsLayout } from '../common/details-layout'

function DerivativeLogDetails() {
  const { financialRecordDetail, assetsEnums } = useAssetsStore()

  const {
    typeInd,
    symbol,
    optionTypeInd,
    sideInd,
    amplitude,
    createdByTime = '--',
    updatedByTime = '--',
    periodDisplay,
    periodUnit,
    projectName,
  } = financialRecordDetail || {}

  const OptionInfoList: IListEnum[] = [
    {
      label: t`features_ternary_option_position_index_ozpimwugyi`,
      content: `${symbol} ${getTextFromStoreEnums(optionTypeInd || '', assetsEnums.financialRecordTypeSwapList.enums)}`,
    },
    {
      label: t`order.columns.direction`,
      content: `${getTextFromStoreEnums(sideInd || '', assetsEnums.optionsSideIndEnum.enums)} ${amplitude || ''}`,
    },
    {
      label: t`features_ternary_option_position_index_grryygxxzd`,
      content: `${periodDisplay} ${
        periodUnit && getOptionProductPeriodUnit(periodUnit as OptionProductPeriodUnitEnum)
      }`,
    },
    { label: t`assets.financial-record.creationTime`, content: formatDate(createdByTime) },
    { label: t`assets.financial-record.completionTime`, content: formatDate(updatedByTime) },
  ]

  const RecreationList: IListEnum[] = [
    {
      label: t`features_assets_financial_record_record_detail_record_details_info_derivative_log_details_index_2k9v13mi7k`,
      content: projectName || '--',
    },
    { label: t`assets.financial-record.creationTime`, content: formatDate(createdByTime) },
    { label: t`assets.financial-record.completionTime`, content: formatDate(updatedByTime) },
  ]

  let infoList: IListEnum[] = []
  // 三元期权 - 财务记录详情
  if (RecordOptionTypeList.indexOf(typeInd) > -1) {
    infoList = OptionInfoList
  }

  // 娱乐区 - 财务记录详情
  if (RecordRecreationTypeList.indexOf(typeInd) > -1) {
    infoList = RecreationList
  }

  return <RecordDetailsLayout list={infoList} />
}

export { DerivativeLogDetails }
