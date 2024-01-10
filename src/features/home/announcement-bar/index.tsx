import { useAnnouncements } from '@/hooks/features/home'
import { ITradeNotification } from '@/typings/api/trade'
import ArticlesCarousel from './articles-carousel'
import styles from './index.module.css'

function AnnouncementBar(props: { data?: ITradeNotification[]; className?: string }) {
  const { data, className } = props
  const notices = useAnnouncements(data)
  return (
    <div className={`${styles.scoped} ${className}`}>
      <ArticlesCarousel notices={notices} />
    </div>
  )
}

export default AnnouncementBar
