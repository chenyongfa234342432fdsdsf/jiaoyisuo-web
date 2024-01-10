import Personalization from '@/features/layout/components/personalization'
import RealTimeTernary from '@/features/market/real-time-ternary'
import Logo from '@/features/layout/components/logo'
import { useLayoutStore } from '@/store/layout'
import { KLineChartType } from '@nbit/chart-utils'
import TradeSetting from '@/features/trade/trade-setting'
import PopMenu from '@/features/trade/trade-header/pop-menu'
import Styles from './header.module.css'

interface HeaderProps {
  type: KLineChartType
}

function Header(props: HeaderProps) {
  const { headerData } = useLayoutStore()
  return (
    <div className={Styles.scoped}>
      <div className="home-wrap py-0.5">
        <Logo data={headerData} />
        <PopMenu />
        <RealTimeTernary />
      </div>
      <Personalization isTrade />
    </div>
  )
}

export default Header
