import { memo } from 'react'

import { useCommonStore } from '@/store/common'

function DealyTime() {
  const { wsDelayTime } = useCommonStore()

  return <span>{`${wsDelayTime || 0}ms`}</span>
}

export default memo(DealyTime)
