import { useFeaturesCard } from '@/hooks/features/home'
import { isEmpty } from 'lodash'
import classNames from 'classnames'
import { MouseEventHandler } from 'react'
import LazyImage from '@/components/lazy-image'
import { Typography } from '@nbit/arco'
import { t } from '@lingui/macro'
import ShouldGuidePageComponentDisplay from '../common/component-should-display'
import styles from './index.module.css'

interface IDisplayCardProps {
  contentMainText: string
  contentSubText: string
  contentIcon: string
  onClick?: MouseEventHandler<HTMLDivElement>
}

function DisplayCard(props: IDisplayCardProps) {
  const { contentMainText, contentSubText, contentIcon, onClick } = props

  return (
    <div className={classNames(styles['display-card'])} onClick={onClick}>
      <LazyImage src={contentIcon} />
      <Typography className="text-text_color_01 font-medium text-xl">{contentMainText}</Typography>
      <Typography className="text-text_color_02">{contentSubText}</Typography>
    </div>
  )
}

function DisplayCardsGrid() {
  const featuresConfig = useFeaturesCard()
  const renderDisplayCards = featuresConfig?.value?.map((data, index) => <DisplayCard key={index} {...data} />)

  return (
    <ShouldGuidePageComponentDisplay {...featuresConfig}>
      {!isEmpty(renderDisplayCards) ? (
        <div className={styles.scoped}>
          <div className="cards-title">{t`features_home_display_cards_grid_index_xtlrmmcyu7`}</div>
          <div>{renderDisplayCards}</div>
        </div>
      ) : (
        <div></div>
      )}
    </ShouldGuidePageComponentDisplay>
  )
}

export default DisplayCardsGrid
