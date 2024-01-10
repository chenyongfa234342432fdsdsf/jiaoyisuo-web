import { t } from '@lingui/macro'
import { Step } from 'intro.js-react'
import { useFuturesStore } from '@/store/futures'
import { IntroSteps } from '@/components/intro-js/intro-steps'
import { FuturesGuideIdEnum } from '@/constants/future/trade'
import styles from './index.module.css'

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

export function FuturesIntro({
  visible = false,
  onExit,
  onIntroChange,
  onIntroBeforeChange,
  onIntroRef,
}: IFuturesIntroProps) {
  const onRenderIntro = (title: string, hint: string) => {
    return (
      <div className={styles['margin-operate-guide-root']}>
        <div className="content-title">{title}</div>
        <div
          className="content-text"
          dangerouslySetInnerHTML={{
            __html: hint,
          }}
        />
      </div>
    )
  }
  const { currentIntroId } = useFuturesStore()
  const available = {
    position: IntroPosition.bottom,
    element: `#${FuturesGuideIdEnum.availableBalance}`,
    intro: onRenderIntro(
      t`features_trade_futures_futures_intro_index_ajbavxuwhi`,
      t`features_trade_futures_futures_intro_index_tqikhfarld`
    ),
  }
  const newAccount = {
    position: IntroPosition.bottom,
    element: `#${FuturesGuideIdEnum.newAccount}`,
    intro: onRenderIntro(
      t`features_future_future_account_tip_index_yhehjgu64t`,
      t`features_trade_futures_futures_intro_index_a9cp7oh7tm`
    ),
  }
  const contract = {
    position: IntroPosition.bottom,
    element: `#${FuturesGuideIdEnum.contractCurrencyPair}`,
    intro: onRenderIntro(
      t`features_trade_futures_futures_intro_index_fyvus2obo_`,
      t`features_trade_futures_futures_intro_index_fsu9ehxmqa`
    ),
  }
  const leverage = {
    position: IntroPosition.bottom,
    element: `#${FuturesGuideIdEnum.leverageRatio}`,
    intro: onRenderIntro(
      t`features_trade_futures_futures_intro_index_galqzlptu8`,
      t`features_trade_futures_futures_intro_index_juwvjebitu`
    ),
  }
  const opening = {
    position: IntroPosition.bottom,
    element: `#${FuturesGuideIdEnum.openingQuantity} > .arco-input-group-wrapper`,
    intro: onRenderIntro(
      t`features_trade_futures_futures_intro_index_pgo_wcn2qz`,
      t`features_trade_futures_futures_intro_index_fjmy9p43fr`
    ),
  }
  const marketPrice = {
    position: IntroPosition.bottom,
    element: `#${FuturesGuideIdEnum.marketPriceOpening}`,
    intro: onRenderIntro(
      t`features_trade_futures_futures_intro_index_jghk81w_j4`,
      t`features_trade_futures_futures_intro_index_9qgbp8m7wq`
    ),
  }
  const currentPosition = {
    position: IntroPosition.bottom,
    element: `#${FuturesGuideIdEnum.currentPosition} .position-cell`,
    intro: onRenderIntro(t`order.tabs.holdings`, t`features_trade_futures_futures_intro_index_leearw6gjh`),
  }
  const accountMode = {
    position: IntroPosition.bottom,
    element: `#${FuturesGuideIdEnum.accountMode}`,
    intro: onRenderIntro(
      t`features_trade_futures_futures_intro_index_5gg8xxtpve`,
      t`features_trade_futures_futures_intro_index_xvazq3vqhr`
    ),
  }
  const accountDetails = {
    position: IntroPosition.bottom,
    element: `#${FuturesGuideIdEnum.accountDetails} table > tbody > tr:nth-child(1) > td:nth-child(1) .group-name`,
    intro: onRenderIntro(
      t`features_trade_futures_futures_intro_index_jwcl418lcp`,
      t`features_trade_futures_futures_intro_index_di9migu0oa`
    ),
  }
  const temporary = {
    position: IntroPosition.bottom,
    element: `#${FuturesGuideIdEnum.temporaryAccount}`,
    intro: (
      <div className={styles['margin-operate-guide-root']}>
        <div className="content-title">{t`features_trade_futures_futures_intro_index_ymez3fkiub`}</div>
        <div className="content-text">
          <div className="mb-4">{t`features_trade_futures_futures_intro_index_ylqccietb0`}</div>
          <div>{t`features_trade_futures_futures_intro_index_lqtituphsz`}</div>
          <div>{t`features_trade_futures_futures_intro_index_vpcguaejsc`}</div>
        </div>
      </div>
    ),
  }
  const closingPosition = {
    position: IntroPosition.bottom,
    element: `#${FuturesGuideIdEnum.closingPosition}`,
    intro: onRenderIntro(t`constants/assets/common-1`, t`features_trade_futures_futures_intro_index_rw5qh7lz4r`),
  }
  const profitCurrency = {
    position: IntroPosition.left,
    element: `#${FuturesGuideIdEnum.profitCurrency} > .list-item:nth-child(1)`,
    intro: onRenderIntro(
      t`features_trade_futures_futures_intro_index_fntbkxhism`,
      t`features_trade_futures_futures_intro_index_hpuzfzz7oc`
    ),
  }

  const steps: Step[] = [
    available,
    newAccount,
    contract,
    leverage,
    opening,
    marketPrice,
    currentPosition,
    accountMode,
    accountDetails,
    temporary,
    closingPosition,
    profitCurrency,
  ]

  return (
    <IntroSteps
      steps={steps}
      onExit={onExit}
      stepEnabled={visible}
      initialStep={currentIntroId}
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

export default FuturesIntro
