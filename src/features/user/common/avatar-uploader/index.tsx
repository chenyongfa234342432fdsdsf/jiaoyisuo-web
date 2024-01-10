import { Message, Modal, Spin, Tooltip, Upload } from '@nbit/arco'
import { useState } from 'react'
import classNames from 'classnames'
import { postV1MemberBaseExtendInfoApiRequest } from '@/apis/vip'
import UserAvatar from '@/features/user/common/user-avatar'
import { useUserStore } from '@/store/user'
import { t } from '@lingui/macro'
import { blobToBase64 } from '@/helper/vip'
import { postMemberUpload } from '@/apis/user'
import styles from './index.module.css'
import Icon from '../../../../components/icon'
import ImageCropper from '../../../../components/image-cropper'

/** 10mb file limit in bytes */
const fileLimit = 10000000

/**
 * modal that crop + upload images
 */
export function AvatarUploadModal({ visible, setvisible }) {
  const [isCropping, setisCropping] = useState(false)
  const [isUploading, setisUploading] = useState(false)
  const [file, setfile] = useState<File>()

  const { setUserInfo } = useUserStore()

  const awsImgUpload = async (blob: Blob) => {
    const image = (await blobToBase64(blob)) as any
    const img = await postMemberUpload({ image })
    const res = await postV1MemberBaseExtendInfoApiRequest({ avatarPath: img?.data?.url })
    setfile(file)
    setUserInfo({ avatarApprove: false })
    setvisible(false)
    setisCropping(false)
    if (res.isOk) {
      Message.success(t`features_user_common_avatar_uploader_index_hkk6qssb3b`)
    } else {
      Message.error(t`plugins_aws_s3_utils_index__cnjafvrnd`)
      setUserInfo({ avatarApprove: true })
    }
  }

  return (
    <Modal
      className={styles['avatar-upload-modal']}
      title={t`components_avatar_uploader_index_iz3yfi4hqb`}
      visible={visible}
      footer={null}
      onCancel={() => {
        setvisible(false)
        setisCropping(false)
        setisUploading(false)
      }}
      unmountOnExit
    >
      <div className={classNames('upload-modal-content', { '!hidden': isCropping })}>
        <Upload
          accept=".jpg, .png"
          className={'uploader'}
          beforeUpload={file => {
            const fileSize = file.size

            if (fileSize > fileLimit) {
              Message.error(t`components_avatar_uploader_index_env7gj2aoc`)
              return false
            }

            setisUploading(true)

            return new Promise(resolve => {
              setfile(file)
              setisCropping(true)
              setisUploading(false)
            })
          }}
          showUploadList={false}
        >
          {isUploading ? (
            <div className="space-y-3">
              <Spin />
              <div className="text-text_color_03">{t`components_avatar_uploader_index_7ltdgypc78`}</div>
              <div className="text-text_color_03 font-normal">{file?.name}</div>
            </div>
          ) : (
            <div className="space-y-3">
              <Icon className="text-xl" name="a-icon_personal_uploading" hasTheme />
              <div className="text-brand_color font-medium">{t`features/user/initial-person/applications-upload/index-2`}</div>
              <div className="text-text_color_03 font-normal">{t`components_avatar_uploader_index_kio836mfcv`}</div>
            </div>
          )}
        </Upload>
      </div>
      {isCropping && file && (
        <ImageCropper
          containerClassName={'rounded-lg mx-auto'}
          file={file}
          onOk={awsImgUpload}
          width={380}
          height={300}
        />
      )}
    </Modal>
  )
}

/**
 * Avatar component that can display, upload, crop images
 * Used in VIP settings module
 */
function AvatarUploader({ className }: { className: string }) {
  const [modalVisible, setmodalVisible] = useState(false)
  const userInfo = useUserStore()?.userInfo || {}
  const { avatarApprove } = userInfo
  return (
    <>
      <div className={`${styles.scoped} ${className}`}>
        <UserAvatar
          hasFrame
          width={90}
          height={90}
          tagIcon={
            avatarApprove ? (
              <Icon name="rebates_edit" onClick={() => setmodalVisible(true)} hasTheme />
            ) : (
              <Tooltip content={t`components_avatar_uploader_index_9wfkyge0e2`} position="right" trigger={'click'}>
                <Icon name="a-icon_personal_time" hasTheme />
              </Tooltip>
            )
          }
        />
      </div>
      <AvatarUploadModal visible={modalVisible} setvisible={setmodalVisible} />
    </>
  )
}

export default AvatarUploader
