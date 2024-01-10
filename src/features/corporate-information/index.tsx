import { t } from '@lingui/macro'
import styles from './index.module.css'

function CorporateInformation() {
  return (
    <section className={`corporate-information ${styles.scoped}`}>
      <div className="corporate-information-wrap">
        <div className="header">
          <label>{t`features_corporate_information_index_qsf8auptgj`}</label>
        </div>
        <div className="container">
          <div className="name">
            <div className="title">
              <label>{t`features_corporate_information_index_e1qiqnu4ya`}</label>
            </div>
            <div className="text">
              <label>MONKEY TECHNOLOGY PTY LTD</label>
            </div>
          </div>
          <div className="address">
            <div className="title">
              <label>{t`features_corporate_information_index_cc6hbvapvo`}</label>
            </div>
            <div className="text">
              <label>UNIT 2905 , 318 RUSSELL STREET , MELBOURNE VIC 3000</label>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CorporateInformation
