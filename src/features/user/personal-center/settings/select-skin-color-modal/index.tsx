import { Modal, Radio } from '@nbit/arco'
import { t } from '@lingui/macro'
import cn from 'classnames'
import { useState, useImperativeHandle, forwardRef } from 'react'
import { useMount } from 'ahooks'
import Icon from '@/components/icon'
import { ColorPlateEnum } from '@/constants/base'
import { useCommonStore } from '@/store/common'
import { getThemeTypeCache } from '@/helper/cache'
import LazyImage from '@/components/lazy-image'
import { oss_svg_image_domain_address } from '@/constants/oss'
import styles from './index.module.css'

function SelectSkinColorModal(_, ref) {
  const { theme } = useCommonStore()

  const themeTypeObj = [
    {
      title: t`features_agent_manage_index_5101437`,
      key: ColorPlateEnum.default,
      imgUrl: `${oss_svg_image_domain_address}monkey-${theme === 'dark' ? 'dark' : ''}skin.png`,
    },
    {
      title: t`features_user_personal_center_settings_select_skin_color_modal_index_rha6zabtqn`,
      key: ColorPlateEnum.okx,
      imgUrl: `${oss_svg_image_domain_address}okx-${theme === 'dark' ? 'dark' : ''}skins.png`,
    },
    {
      title: t`features_user_personal_center_settings_select_skin_color_modal_index__d0gfvemfn`,
      key: ColorPlateEnum.binance,
      imgUrl: `${oss_svg_image_domain_address}binance-${theme === 'dark' ? 'dark' : ''}skin.png`,
    },
    {
      title: t`features_user_personal_center_settings_select_skin_color_modal_index_9utfx8ot2h`,
      key: ColorPlateEnum.kucoin,
      imgUrl: `${oss_svg_image_domain_address}kucoin-${theme === 'dark' ? 'dark' : ''}skin.png`,
    },
  ]

  const [modalVisible, setModalVisible] = useState<boolean>(false)

  const { setThemeType, themeType } = useCommonStore()

  const setModalVisibleChange = () => {
    setModalVisible(true)
  }

  const setColorModalChange = e => {
    setThemeType(e)
    setModalVisible(false)
  }

  useImperativeHandle(ref, () => ({
    openVisibleSettingModal() {
      setModalVisibleChange()
    },
  }))

  useMount(() => {
    setThemeType(getThemeTypeCache())
  })

  return (
    <Modal
      title={t`features_user_personal_center_settings_select_skin_color_modal_index_ryvwtrz4sy`}
      footer={null}
      className={styles['color-modal-style']}
      maskClosable
      visible={modalVisible}
      unmountOnExit
      closable
      onCancel={() => setModalVisible(false)}
    >
      <div className="color-modal-container">
        <div>
          <Radio.Group value={themeType} onChange={setColorModalChange}>
            {themeTypeObj.map(item => {
              return (
                <Radio key={item.key} value={item.key}>
                  {({ checked }) => {
                    return (
                      <div>
                        <div className={cn('color-modal-item', { 'color-modal-item-select': checked })}>
                          <LazyImage src={item.imgUrl} />
                        </div>
                        <div className="flex justify-center py-4 text-text_color_01">
                          <Icon name={checked ? 'agreement_select' : 'agreement_unselect'} />
                          <span className="ml-1"> {item.title}</span>
                        </div>
                      </div>
                    )
                  }}
                </Radio>
              )
            })}
          </Radio.Group>
        </div>
      </div>
    </Modal>
  )
}

export default forwardRef(SelectSkinColorModal)
