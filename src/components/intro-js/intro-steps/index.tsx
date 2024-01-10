import 'intro.js/introjs.css'
import classNames from 'classnames'
import { Steps, StepsProps } from 'intro.js-react'
import styles from './index.module.css'

type IProps = Omit<StepsProps, 'initialStep'> & {
  initialStep?: number
  stepEnabled: boolean
  onStartCallback?: () => void
  highlightClassCustom?: string
  tooltipClassCustom?: string
  onRef?: (introRef?: Steps) => void
  onChange?: (num: number) => void
  onBeforeChange?: (num: number) => void
}

export function IntroSteps({
  stepEnabled,
  steps,
  onRef,
  onExit,
  onChange,
  onBeforeChange,
  initialStep = 0,
  ...rest
}: IProps) {
  return (
    <Steps
      enabled={stepEnabled}
      steps={steps}
      initialStep={initialStep}
      onExit={onExit}
      onStart={() => {
        rest.onStartCallback && rest.onStartCallback()
      }}
      ref={(step: Steps) => {
        onRef && onRef(step)
      }}
      /**
       * @doc https://introjs.com/docs/intro/options
       */
      options={{
        ...(rest.options ? rest.options : {}),
        highlightClass: classNames(styles['introjs-helper-layer-custom-default'], {
          [rest.highlightClassCustom || '']: !!rest.highlightClassCustom,
        }),
        tooltipClass: classNames(styles['introjs-tooltip-custom-default'], {
          [rest.tooltipClassCustom || '']: !!rest.tooltipClassCustom,
        }),
      }}
      onChange={num => onChange && onChange(num)}
      onBeforeChange={num => onBeforeChange && onBeforeChange(num)}
    />
  )
}
