import classNames from 'classnames'
import CurrentActivities from './current-activities'
import AllActivities from './all-activities'
import styles from './index.module.css'

function ActivitiesCenter() {
  return (
    <div className={classNames(styles.scoped)}>
      <CurrentActivities />
      <AllActivities />
    </div>
  )
}

export default ActivitiesCenter
