import Icon from '../icon'
import Link from '../link'

function DownloadIcon() {
  return (
    <Link href="/download" className="download-icon">
      <span>
        <Icon name={`nav_download`} hasTheme hover fontSize={20} />
      </span>
    </Link>
  )
}

export default DownloadIcon
