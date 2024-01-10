import { t } from '@lingui/macro'
import { Button } from '@nbit/arco'
import { useMemo, useState } from 'react'
import EasyCropper, { Area } from 'react-easy-crop'

async function _getCroppedImg(url, pixelCrop): Promise<Blob | null> {
  const image = (await new Promise((resolve, reject) => {
    const _image = new Image()
    _image.addEventListener('load', () => resolve(_image))
    _image.addEventListener('error', error => reject(error))
    _image.src = url
  })) as HTMLImageElement
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx || !image) {
    return null
  }

  const imageSize = 2 * ((Math.max(image.width, image.height) / 2) * Math.sqrt(2))
  canvas.width = imageSize
  canvas.height = imageSize

  ctx.drawImage(image, imageSize / 2 - image.width / 2, imageSize / 2 - image.height / 2)
  const data = ctx.getImageData(0, 0, imageSize, imageSize)
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  ctx.putImageData(
    data,
    Math.round(0 - imageSize / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - imageSize / 2 + image.height * 0.5 - pixelCrop.y)
  )
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      resolve(blob)
    })
  })
}

/**
 * A wrapper for EasyCropper component + Button
 * @param props
 * @returns
 */
function ImageCropper(props: {
  file: File
  width: number
  height: number
  onOk: (blob: Blob) => void
  className?: string
  containerClassName?: string
}) {
  const { file, className, containerClassName, width, height } = props

  const [crop, setcrop] = useState({
    x: 0,
    y: 0,
  })

  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>()

  const url = useMemo(() => file && URL.createObjectURL(file), [file])
  return (
    <div className={className}>
      <EasyCropper
        classes={{ containerClassName }}
        style={{
          containerStyle: {
            width: width || '100%',
            height: height || '100%',
            position: 'relative',
          },
        }}
        onCropComplete={(_, croppedAreaPixels) => {
          setCroppedAreaPixels(croppedAreaPixels)
        }}
        aspect={4 / 4}
        image={url}
        crop={crop}
        onCropChange={setcrop}
        cropShape="round"
      />
      <Button
        style={{ width }}
        className={'mx-auto rounded-lg mt-6'}
        long
        onClick={async () => {
          const blob = await _getCroppedImg(url || '', croppedAreaPixels)

          if (blob) {
            props.onOk(blob)
          }
        }}
        type="primary"
      >{t`user.field.reuse_17`}</Button>
    </div>
  )
}

export default ImageCropper
