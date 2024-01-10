import useDownloadInfo from '@/hooks/features/download'
import { Button } from '@nbit/arco'
import { isEmpty } from 'lodash'
import LazyImage from '@/components/lazy-image'
import Icon from '@/components/icon'
import { downloadAppType, downloadIconsType } from '@/constants/download'
import { oss_svg_image_domain_address } from '@/constants/oss'
import { QRCodeCanvas } from 'qrcode.react'
import { buttonShouldDisabled } from '@/helper/download'
import { t } from '@lingui/macro'
import { link } from '@/helper/link'
import classNames from 'classnames'
import styles from './index.module.css'

function DownloadSection() {
  const { appInfo } = useDownloadInfo()

  let h5Data

  // show Qr code if status is active and url is not '/'
  if (appInfo?.[downloadAppType.h5] && !buttonShouldDisabled(appInfo[downloadAppType.h5]))
    h5Data = appInfo[downloadAppType.h5]

  return (
    <div className={styles.scoped}>
      <div className="download-title">{t`features_home_download_index_tdhls8dvmd`}</div>
      <div className="download-subtitle">{t`features_home_download_index_zgfeb1gqtm`}</div>
      <div className="download-btns">
        {!isEmpty(appInfo) &&
          Object.keys(appInfo).map((key, idx) => {
            if (key === downloadAppType.h5) return
            return (
              <Button
                className={'download-btn'}
                icon={<Icon name={downloadIconsType[key]} hasTheme />}
                key={idx}
                onClick={() => {
                  appInfo[key]?.downloadUrl && link(appInfo[key].downloadUrl, { target: true })
                }}
              >
                {appInfo[key]?.appTypeCd}
              </Button>
            )
          })}
      </div>
      <div className="qr-container">
        <LazyImage
          className={classNames({ 'mx-auto': !h5Data?.downloadUrl })}
          src={`${oss_svg_image_domain_address}home-download-bg.png`}
        />
        {h5Data?.downloadUrl && <QRDownloadBox downloadUrl={h5Data.downloadUrl} />}
      </div>
    </div>
  )
}

function QRDownloadBox({ downloadUrl }: { downloadUrl: string }) {
  return (
    <div className="qr-download">
      {<QRCodeCanvas value={downloadUrl} />}
      <div>
        <div className="text-xl mb-4">{t`features_home_download_index_2vxtyknzzy`}</div>
        <div className="text-2xl font-medium">iOS&Android Apps</div>
      </div>
    </div>
  )
}

export default DownloadSection
