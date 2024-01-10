import { t } from '@lingui/macro'
import { Step } from 'intro.js-react'
import { IntroSteps } from '@/components/intro-js/intro-steps'
import { FuturesGuideIdEnum } from '@/constants/future/trade'
import styles from '../futures-intro/index.module.css'

type IFuturesIntroProps = {
  visible: boolean
  onExit: (num: number) => void
  onIntroRef?: (refs: any) => void
  onIntroChange?: (num: number) => void
  onIntroBeforeChange?: (num: number) => void
}

enum IntroPosition {
  left = 'left',
  bottom = 'bottom',
}

export function FuturesDrawerIntro({
  visible = false,
  onExit,
  onIntroChange,
  onIntroBeforeChange,
  onIntroRef,
}: IFuturesIntroProps) {
  const profitCurrency = {
    position: IntroPosition.left,
    element: `#${FuturesGuideIdEnum.profitCurrency} > .list-item:nth-child(1)`,
    intro: (
      <div className={styles['margin-operate-guide-root']}>
        <div className="content-title">{t`features_trade_futures_futures_intro_index_fntbkxhism`}</div>
        <div className="content-text">{t`features_trade_futures_futures_intro_index_hpuzfzz7oc`}</div>
      </div>
    ),
  }

  const steps: Step[] = [profitCurrency]

  return (
    <IntroSteps
      steps={steps}
      onExit={onExit}
      stepEnabled={visible}
      tooltipClassCustom={styles['introjs-tooltip-custom']}
      highlightClassCustom={styles['introjs-highlight-custom']}
      options={{
        showButtons: true,
        showBullets: false,
        showProgress: false,
        helperElementPadding: 0,
        skipLabel: '×',
        nextLabel: t`user.field.reuse_23`,
        doneLabel: t`features_trade_trade_setting_futures_user_classification_index_4ujx9zfxpz`,
        exitOnOverlayClick: false,
        hintAnimation: true,
        disableInteraction: false,
      }}
      onRef={onIntroRef}
      onChange={onIntroChange}
      onBeforeChange={onIntroBeforeChange}
    />
  )
}
