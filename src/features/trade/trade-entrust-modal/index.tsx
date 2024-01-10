import { useState, memo, useRef, forwardRef, useImperativeHandle, useEffect } from 'react'
import { Button, Modal, ModalProps, Tabs } from '@nbit/arco'
import Icon from '@/components/icon'
import { baseCommonStore } from '@/store/common'
import { ThemeEnum } from '@/constants/base'
// import Tabs from '@/components/tabs'
import { TradeOrderTypesEnum } from '@/constants/trade'
import LimitOrder from './limit-order'
import MarketOrder from './market-order'
import PlanDelegation from './plan-delegation'
import StopProfitStop from './stop-profit-stop'
import { useTradeEntrust } from './tradeentrust'
import styles from './index.module.css'

interface Props extends ModalProps {
  okText?: string
  onOk?: (e?: MouseEvent) => Promise<any> | void
  whetherIsSpot?: boolean
}

function TradeEntrustModal(props: Props, ref) {
  const [modalVisibl, setModalVisibl] = useState<boolean>(false)

  const [selectedTab, setSelectedTab] = useState<string>(TradeOrderTypesEnum.market)

  const [imgName, setImgName] = useState<string>('black')

  const { theme } = baseCommonStore.getState()

  const setThemeChange = () => {
    switch (theme) {
      case ThemeEnum.dark:
        return setImgName('white')
      case ThemeEnum.light:
        return setImgName('black')
      default:
        setImgName('black')
    }
  }

  useEffect(() => {
    setThemeChange()
  }, [theme])

  const {
    okText,
    onOk = () => {
      setModalVisibl(false)
    },
  } = props

  const { entrustTabList } = useTradeEntrust(props?.whetherIsSpot)

  const tradeEntrustModalRef = useRef<HTMLDivElement | null>(null)

  useImperativeHandle(ref, () => ({
    openModal() {
      setModalVisibl(true)
    },
    closeModal() {
      setModalVisibl(false)
    },
  }))

  const setTabContent = () => {
    switch (selectedTab) {
      case TradeOrderTypesEnum.market:
        return <MarketOrder imgName={imgName} />
      case TradeOrderTypesEnum.limit:
        return <LimitOrder imgName={imgName} />
      case TradeOrderTypesEnum.trailing:
        return <PlanDelegation imgName={imgName} />
      case TradeOrderTypesEnum.stop:
        return <StopProfitStop />
      default:
        break
    }
  }

  return (
    <div ref={tradeEntrustModalRef}>
      <div>
        <Modal
          {...props}
          onCancel={() => setModalVisibl(false)}
          visible={modalVisibl}
          closable={false}
          style={{ width: '400px' }}
          wrapClassName={styles['free-trade-modal']}
          footer={null}
        >
          <div className="modal-container-tab">
            <div className="container-tab-item">
              {/* <Tabs
                value={selectedTab}
                mode="line"
                isScrollable
                tabList={entrustTabList}
                onChange={item => setSelectedTab(item.id)}
              /> */}
              <Tabs
                defaultActiveTab={TradeOrderTypesEnum.market}
                scrollPosition="center"
                animation={false}
                onChange={item => setSelectedTab(item)}
              >
                {entrustTabList.map(item => (
                  <Tabs.TabPane destroyOnHide key={item.id} title={item.title} />
                ))}
              </Tabs>
            </div>
            <Icon name="close" hasTheme className="tab-close" onClick={() => setModalVisibl(false)} />
          </div>
          <div className="modalDetail">{setTabContent()}</div>
          <div className="modal-container-button">
            <Button long type="primary" onClick={() => onOk()} className="container-button-detail">
              {okText}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default memo(forwardRef(TradeEntrustModal))
