import { useEffect, memo, useState } from 'react'
import { fillZero } from '@/helper/date'
import { useCountDown } from 'ahooks'

type Props = {
  targetDateTime: number
}

function OptionCountDown(props: Props) {
  const { targetDateTime } = props

  const [targetTime, setTargetTime] = useState<number>(targetDateTime)

  const [, { seconds, minutes }] = useCountDown({
    leftTime: targetTime,
    onEnd: () => {
      // console.log('onEndonEndonEndonEndonEndonEnd')
    },
  })

  useEffect(() => {
    setTargetTime(targetDateTime)
  }, [targetDateTime])

  return (
    <div>
      {fillZero(minutes)}:{fillZero(seconds)}
    </div>
  )
}

export default memo(OptionCountDown)
