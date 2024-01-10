import { getMaintenanceConfigFromS3 } from '@/apis/maintenance'
import LazyImage from '@/components/lazy-image'
import Link from '@/components/link'
import { formatDate } from '@/helper/date'
import { usePageContext } from '@/hooks/use-page-context'
import { t } from '@lingui/macro'
import { isEmpty } from 'lodash'
import { useEffect, useState } from 'react'
import { useCommonStore } from '@/store/common'
import styles from './index.module.css'

function Page() {
  const [config, setconfig] = useState<any>()
  const { host } = usePageContext()
  const locale = useCommonStore().locale

  useEffect(() => {
    getMaintenanceConfigFromS3({}).then(res => {
      setconfig(res.data)
    })
  }, [])

  return (
    <div className={styles.scoped}>
      <div className="grid-container">
        <LazyImage src={config?.icon || ''} />
        <div className="flex flex-col gap-y-4">
          <div className="leading-5">
            <div className="text-base font-medium">{t`modules_maintenance_index_page_k7nquq0-xblb6pzeou384`} </div>
            <div>{config?.title}</div>
          </div>
          <div className="text-xs leading-5">
            <div>{t`modules_maintenance_index_page_y96bzs3he6rdmcuqwngoy`} </div>
            <div className="text-brand_color leading-5" dangerouslySetInnerHTML={{ __html: config?.content }} />
          </div>
          <div className="text-xs leading-5">
            <div>{t`modules_maintenance_index_page_l5hwdgltsnh44a29il0ns`}</div>
            {config?.start_time && config?.end_time && (
              <div className="text-brand_color">{`${formatDate(config?.start_time, 'YYYY-MM-DD HH:mm')} - ${formatDate(
                config?.end_time,
                'YYYY-MM-DD HH:mm'
              )}`}</div>
            )}
          </div>
          {!isEmpty(config?.contact_us || []) && (
            <div className="text-xs leading-5">
              <div>{t`modules_maintenance_index_page_oslmz9qthtc-0gxokd7cj`}</div>
              <div className="social-media-grid">
                {config.contact_us
                  ?.filter(e => e.lanTypeCd === locale)
                  ?.map((configData, index) => (
                    <Link key={index} href={configData.linkUrl} className="w-5 h-5">
                      <LazyImage width={20} height={20} src={configData.imgIcon} />
                    </Link>
                  ))}
              </div>
            </div>
          )}
          {config?.customer_jump_url && (
            <div className="text-xs leading-5">
              <div>
                {t`modules_maintenance_index_page_6jn7jqohls93m66dmydv-`} 24{' '}
                {t`modules_maintenance_index_page_xfjlimz4dwiigcgk9na1s`}
              </div>
              <Link href={config.customer_jump_url}>
                <span className="text-brand_color">
                  {host}
                  {config.customer_jump_url}
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { Page }
