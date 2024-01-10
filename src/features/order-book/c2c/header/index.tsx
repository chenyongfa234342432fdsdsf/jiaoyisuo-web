import { Select, Button } from '@nbit/arco'
import { t } from '@lingui/macro'
import styles from '../index.module.css'

function CToCOrderBookHeader() {
  return (
    <div className={`c2c-order-book-header ${styles['c2c-order-book-header-wrap']}`}>
      <div className="c2c-order-book-header-wrap">
        <Select size="default" />
        <Button type="primary">{t`features_c2c_advertise_post_advertise_index_vtrflh4s-dq4kzhpaijrv`}</Button>
      </div>
    </div>
  )
}

export default CToCOrderBookHeader
