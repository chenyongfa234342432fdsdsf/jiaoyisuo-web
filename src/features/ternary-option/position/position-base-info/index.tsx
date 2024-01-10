/**
 * 期权持仓 - 名称、交易方向标签组件
 */
import { getFuturesGroupTypeName } from '@/constants/assets/futures'
import LazyImage from '@/components/lazy-image'
import Icon from '@/components/icon'
import { link } from '@/helper/link'
import { OptionSideIndCallEnum, OptionSideIndEnum, OptionsSideIndPutEnum } from '@/constants/ternary-option'
import classNames from 'classnames'
import { getTextFromStoreEnums } from '@/helper/store'
import { useTernaryOptionStore } from '@/store/ternary-option'
import { IOptionCurrentPositionList } from '@/typings/api/ternary-option/position'
import styles from './index.module.css'

interface IOptionBaseInfoProps {
  /** 仓位信息 */
  positionData: IOptionCurrentPositionList
}
export default function OptionBaseInfo(props: IOptionBaseInfoProps) {
  const {
    /**
     * symbol: 币对名
     * typeInd: 合约类型 perpetual:永续 delivery:交割
     * sideInd: 涨跌方向
     * amplitude: 涨跌值
     */
    positionData: { symbol = '', typeInd, webLogo, amplitude, sideInd },
  } = props || {}
  const ternaryOptionStore = useTernaryOptionStore() || {}
  const { optionDictionaryEnums } = { ...ternaryOptionStore }

  return (
    <div className={styles['position-base-tag-root']}>
      <div
        className="name"
        onClick={() => {
          link(`/ternary-option/${symbol}`)
        }}
      >
        {webLogo && <LazyImage src={webLogo} width={14} height={14} />}
        <span>
          {symbol} {getFuturesGroupTypeName(typeInd)}
        </span>
        <Icon name="next_arrow" hasTheme className="next-icon" />
      </div>
      <span
        className={classNames('tag', {
          'type-call': OptionSideIndCallEnum.includes(sideInd as OptionSideIndEnum),
          'type-put': OptionsSideIndPutEnum.includes(sideInd as OptionSideIndEnum),
        })}
      >
        <span>{getTextFromStoreEnums(sideInd, optionDictionaryEnums.optionsSideIndEnum.enums)}</span>
        {amplitude && <span className="pl-1">{amplitude}</span>}
      </span>
    </div>
  )
}
