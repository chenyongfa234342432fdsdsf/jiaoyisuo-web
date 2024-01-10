import { YapiGetV1HomeColumnGetListColumnsDatasData } from '@/typings/yapi/HomeColumnGetListV1GetApi'
import { useGuidePageInfo } from '@/hooks/features/layout'
import { flattenArrToObj } from '@/helper/layout'
import ShouldGuidePageComponentDisplay from '@/features/home/common/component-should-display'
import FooterMenuList from '../footer-menu-list'
import styles from './index.module.css'

type TFooterMenu = {
  data?: YapiGetV1HomeColumnGetListColumnsDatasData[]
}

function FooterMenu(props: TFooterMenu) {
  const { data } = props

  const guidePage = useGuidePageInfo()
  const { pageInfoServiceSupport } = guidePage
  const footerMenuConfig = flattenArrToObj(pageInfoServiceSupport)
  return (
    <div className={styles.scoped}>
      {data &&
        data.map((footer, index) => {
          return footer.isWeb === 1 ? (
            <ShouldGuidePageComponentDisplay
              key={`${footer.homeColumnName}_${index}`}
              {...footerMenuConfig?.[footer.homeColumnCd]}
            >
              <div className="footer-menu-item">
                <div className="footer-title">{footer.homeColumnName}</div>
                <FooterMenuList list={footer.childColumns} />
              </div>
            </ShouldGuidePageComponentDisplay>
          ) : null
        })}
    </div>
  )
}

export default FooterMenu
