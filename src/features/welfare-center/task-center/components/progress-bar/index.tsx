import { memo } from 'react'
import classNames from 'classnames'
import styles from './index.module.css'

interface Props {
  current: number
  overall: number
}

function ProgressBar(props: Props) {
  const { current, overall } = props
  // 计算进度值，确保在 0 到 100 之间
  const progress = Math.round((current / overall) * 100)

  return (
    <div className={classNames(styles.scoped)}>
      <div className="progress" style={{ width: `${progress}%` }}></div>
    </div>
  )
}

export default memo(ProgressBar)
