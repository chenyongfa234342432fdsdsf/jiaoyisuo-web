import { t } from '@lingui/macro'
import { useEffect, useRef, useState } from 'react'
import { useCommonStore } from '@/store/common'
import { ThemeEnum } from '@nbit/chart-utils'
import { IntroSteps } from '@/components/intro-js/intro-steps'
import introStyles from '@/components/intro-js/intro-steps/index.module.css'
import { Step, Steps } from 'intro.js-react'
import { oss_svg_image_domain_address } from '@/constants/oss'
import classNames from 'classnames'
import { useInterval, useUpdateEffect } from 'ahooks'
// import { awaitTime } from '@/helper/common'
// import { requestWithLoading } from '@/helper/order'
import { useTernaryOptionStore } from '@/store/ternary-option'
import { formatCurrency } from '@/helper/decimal'
import {
  OptionGuideCache,
  OPTION_GUIDE_ELEMENT_IDS_ENUM,
  OptionGuideType,
  TernaryBuyTypeEnum,
} from '@/constants/ternary-option'
import { getCacheAgentBindUser, setCacheAgentBindUser } from '@/helper/cache/option'
import { awaitTime } from '@/helper/common'
import styles from './guide.module.css'
// import { useOptionTradeStore } from '@/store/ternary-option/trade'

enum IntroPosition {
  left = 'left',
  bottom = 'bottom',
}

interface PropsType {
  showGuideType?: string
  setShowGuideType?: (v) => void
  setCheckboxValue?: (v) => void
}

export default function TernaryOptionTradeGuide(props: PropsType) {
  const { showGuideType, setShowGuideType, setCheckboxValue } = props
  const { theme } = useCommonStore()
  const ternaryOptionState = useTernaryOptionStore()

  // 新版只看是否手动开启了
  const [stepEnabled, setStepEnabled] = useState(false)
  const [step, setStep] = useState(0)

  const onRenderIntro = (title: string, hint: string) => {
    return (
      <div className={styles['margin-operate-guide-root']}>
        <div className="content-title">{title}</div>
        <div
          className="content-text"
          style={{ width: title ? '100%' : 'calc(100% - 20px)' }}
          dangerouslySetInnerHTML={{
            __html: hint,
          }}
        />
      </div>
    )
  }

  const stepsTypeRef = useRef<string>('')

  stepsTypeRef.current = showGuideType || ''

  const binaryOption = [
    {
      element: `#${OPTION_GUIDE_ELEMENT_IDS_ENUM.binary}`,
      intro: onRenderIntro(
        t`features_c2c_advertise_post_advertise_index_4yidfqk_wu8ypinnwmsd7`,
        t`features_ternary_option_trade_form_guide_ahtobaeauq`
      ),
      position: IntroPosition.bottom,
    },
    {
      element: `#${OPTION_GUIDE_ELEMENT_IDS_ENUM.binaryPlan}`,
      intro: onRenderIntro(
        t`features_ternary_option_trade_form_guide_gmn6je1zlm`,
        t`features_ternary_option_trade_form_guide_ve7s78layc`
      ),
      position: IntroPosition.bottom,
    },
    {
      element: `#${OPTION_GUIDE_ELEMENT_IDS_ENUM.binaryDir}`,
      intro: onRenderIntro(
        t`features_ternary_option_trade_form_guide_z8vsjb4cz1`,
        t`features_ternary_option_trade_form_guide_mfh9vd3vym`
      ),
      position: IntroPosition.bottom,
    },
  ]

  const advance = [
    {
      element: `#${OPTION_GUIDE_ELEMENT_IDS_ENUM.advance}`,
      intro: onRenderIntro(
        t`features_ternary_option_trade_form_index_m6azpdbxcz`,
        t`features_ternary_option_trade_form_guide_zs1mwksi6_`
      ),
      position: IntroPosition.bottom,
    },
    {
      element: `#${OPTION_GUIDE_ELEMENT_IDS_ENUM.advanceMaxSum}`,
      intro: onRenderIntro(
        t`features_ternary_option_trade_form_index_xj4qthe3c2`,
        t`features_ternary_option_trade_form_guide_juujyvztoz`
      ),
      position: IntroPosition.bottom,
    },
    {
      element: `#${OPTION_GUIDE_ELEMENT_IDS_ENUM.advanceMaxAmount}`,
      intro: onRenderIntro(
        t`features_ternary_option_trade_form_index_w0cl0r4doh`,
        t`features_ternary_option_trade_form_index_gnzenhdwab`
      ),
      position: IntroPosition.bottom,
    },
    {
      element: `#${OPTION_GUIDE_ELEMENT_IDS_ENUM.advanceAuto}`,
      intro: onRenderIntro(
        t`constants_ternary_option_zo0ww6xiau`,
        t`features_ternary_option_trade_form_guide_iuxfeskktx`
      ),
      position: IntroPosition.bottom,
    },
  ]
  const ternaryOption = [
    {
      element: `#${OPTION_GUIDE_ELEMENT_IDS_ENUM.ternary}`,
      intro: onRenderIntro(
        t`features_c2c_advertise_post_advertise_index_4yidfqk_wu8ypinnwmsd7`,
        t`features_ternary_option_trade_form_guide_af1fpj6izd`
      ),
      position: IntroPosition.bottom,
    },
    {
      element: `#${OPTION_GUIDE_ELEMENT_IDS_ENUM.ternaryPercent}`,
      intro: onRenderIntro(
        t`features_ternary_option_trade_form_guide_pkzsnmxuiw`,
        t`features_ternary_option_trade_form_guide_xxmnxkwtov`
      ),
      position: IntroPosition.bottom,
    },
    {
      element: `#${OPTION_GUIDE_ELEMENT_IDS_ENUM.ternaryPlan}`,
      intro: onRenderIntro(
        t`features_ternary_option_trade_form_guide_gmn6je1zlm`,
        t`features_ternary_option_trade_form_guide_ve7s78layc`
      ),
      position: IntroPosition.bottom,
    },
    {
      element: `#${OPTION_GUIDE_ELEMENT_IDS_ENUM.ternaryDir}`,
      intro: onRenderIntro(
        t`features_ternary_option_trade_form_guide_z8vsjb4cz1`,
        t`features_ternary_option_trade_form_guide_rsd6bu2gxw`
      ),
      position: IntroPosition.bottom,
    },
  ]
  const steps: Step[] = (
    showGuideType === OptionGuideType.binaryOption
      ? binaryOption
      : showGuideType === OptionGuideType.ternaryOption
      ? ternaryOption
      : showGuideType === OptionGuideType.advance
      ? advance
      : binaryOption.concat(advance)
  ).filter(a => a)

  useUpdateEffect(() => {
    if (stepEnabled) {
      setStep(0)
    }
  }, [stepEnabled])

  const onModeChange = async () => {
    setStepEnabled(true)
  }

  useEffect(() => {
    if (!ternaryOptionState.currentCoin.id || !showGuideType) {
      return
    }
    onModeChange()
  }, [ternaryOptionState.currentCoin.id, showGuideType])

  const stepsRef = useRef<any>(null)

  const onStepChange = async (nextStep: number) => {
    setStep(nextStep)
  }

  const onStepBeforeChange = async (nextStep: number) => {
    if (!steps[nextStep - 1]) {
      return
    }
    if (
      showGuideType === OptionGuideType.binaryOptionAndAdvance &&
      steps[nextStep]?.element?.toString().includes(OPTION_GUIDE_ELEMENT_IDS_ENUM.advance)
    ) {
      setCheckboxValue && setCheckboxValue(TernaryBuyTypeEnum.Advance)

      await awaitTime(100)
      for (let i = binaryOption.length + 1; i < binaryOption.length + advance.length; i += 1) {
        stepsRef.current?.updateStepElement?.(i)
      }
    }
  }
  const onExit = () => {
    setStepEnabled(false)
    setShowGuideType && setShowGuideType('')
    // from
    //   ? setCacheAgentBindUser(OptionGuideCache.optionSecondStep, true)
    //   : setCacheAgentBindUser(OptionGuideCache.optionOneStep, true)
  }

  const onDrawerIntroRef = refs => {
    stepsRef.current = refs
  }

  if (!stepEnabled || step > steps.length) return null
  return (
    <IntroSteps
      steps={steps}
      onRef={onDrawerIntroRef}
      stepEnabled={stepEnabled}
      onExit={onExit}
      initialStep={0}
      tooltipClassCustom={styles['introjs-tooltip-custom']}
      highlightClassCustom={styles['introjs-highlight-custom']}
      options={{
        showButtons: true,
        showBullets: false,
        showProgress: false,
        helperElementPadding: 0,
        skipLabel: '×',
        nextLabel: t`user.field.reuse_23`,
        doneLabel:
          showGuideType === OptionGuideType.advance
            ? t`features_trade_spot_index_2510`
            : t`features_trade_trade_setting_futures_user_classification_index_4ujx9zfxpz`,
        exitOnOverlayClick: false,
        hintAnimation: true,
        disableInteraction: false,
      }}
      onBeforeChange={onStepBeforeChange}
      onChange={onStepChange as any}
    />
  )
}
