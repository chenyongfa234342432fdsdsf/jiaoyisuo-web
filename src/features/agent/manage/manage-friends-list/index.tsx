/**
 * 代理商 表格好友查看列表组建
 */

import CustomModal from '@/features/agent/modal'
import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import { Button, Empty } from '@nbit/arco'
import { oss_svg_image_domain_address } from '@/constants/oss'
import { formatDate } from '@/helper/date'
import LazyImage, { Type } from '@/components/lazy-image'

import styles from './index.module.css'

function ManageFriendsList({ isShowFriendModal, onShowFriendModal, analysisList }) {
  return (
    <CustomModal style={{ width: 444 }} className={styles['agent-manage-modal']} visible={isShowFriendModal}>
      <div className="friend-modal">
        <div className="friend-modal-header">
          <div className="friend-modal-header-title">{t`features_agent_manage_index_5101443`}</div>
          <div>
            <Icon name="close" hasTheme fontSize={18} onClick={() => onShowFriendModal(false)} />
          </div>
        </div>

        <div className="friend-modal-content">
          <div className="friend-list-item-header">
            <div>{t`features_agent_manage_index_5101444`}</div>
            <div>{t`order.columns.date`}</div>
          </div>
          {analysisList && analysisList.length > 0 ? (
            analysisList.map((v, i) => (
              <div key={i} className="friend-list-item-content">
                <div>{v.invitedUid}</div>
                <div>{formatDate(v.createdByTime)}</div>
              </div>
            ))
          ) : (
            <Empty
              className={'empty'}
              icon={
                <LazyImage
                  whetherManyBusiness
                  hasTheme
                  imageType={Type.png}
                  src={`${oss_svg_image_domain_address}icon_default_no_order`}
                  width={120}
                  height={120}
                />
              }
              description={t`trade.c2c.noData`}
            />
          )}
        </div>
        <div className="friend-modal-know">
          <Button type="primary" className="button" onClick={() => onShowFriendModal(false)}>
            {t`features_trade_spot_index_2510`}
          </Button>
        </div>
      </div>
    </CustomModal>
  )
}

export default ManageFriendsList
