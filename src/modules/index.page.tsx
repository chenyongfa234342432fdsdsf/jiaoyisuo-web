import Home from '@/features/home'
import { getHomePageProps } from '@/helper/home/home-seo'

export { Page }

function Page(props: Awaited<ReturnType<typeof getHomePageProps>>) {
  return <Home data={props} />
}
