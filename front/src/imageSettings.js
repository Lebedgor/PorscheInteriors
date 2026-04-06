export const imageSettingsDefaults = {
  uploadWidth: 1920,
  uploadHeight: 1080,
  uploadQuality: 80,
  thumbnailWidth: 320,
  thumbnailHeight: 220,
  thumbnailFormat: 'webp',
  popupWidth: 1280,
  popupHeight: 860,
  popupFormat: 'webp',
}

export const imageFormatOptions = [
  { value: 'webp', label: 'WEBP' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' }
]

const normalizeNumber = (value, fallback, min, max) => {
  const parsedValue = Number(value)

  if (!Number.isFinite(parsedValue)) {
    return fallback
  }

  if (typeof min === 'number' && parsedValue < min) {
    return min
  }

  if (typeof max === 'number' && parsedValue > max) {
    return max
  }

  return Math.round(parsedValue)
}

const normalizeFormat = (value, fallback = 'webp') => {
  const normalizedValue = String(value || '').trim().toLowerCase()

  if (imageFormatOptions.some((option) => option.value === normalizedValue)) {
    return normalizedValue
  }

  return fallback
}

const getFileExtension = (fileName = '') => {
  const extensionMatch = String(fileName).match(/\.[^.]+$/)

  return extensionMatch ? extensionMatch[0] : ''
}

const getOutputType = (file) => {
  if (file?.type === 'image/png') {
    return 'image/png'
  }

  if (file?.type === 'image/jpeg' || file?.type === 'image/jpg') {
    return 'image/jpeg'
  }

  const extension = getFileExtension(file?.name).toLowerCase()

  if (extension === '.png') {
    return 'image/png'
  }

  return 'image/jpeg'
}

const normalizeSettings = (settings = {}) => ({
  uploadWidth: normalizeNumber(settings.uploadWidth, imageSettingsDefaults.uploadWidth, 100, 6000),
  uploadHeight: normalizeNumber(settings.uploadHeight, imageSettingsDefaults.uploadHeight, 100, 6000),
  uploadQuality: normalizeNumber(settings.uploadQuality, imageSettingsDefaults.uploadQuality, 10, 100),
  thumbnailWidth: normalizeNumber(settings.thumbnailWidth, imageSettingsDefaults.thumbnailWidth, 80, 2000),
  thumbnailHeight: normalizeNumber(settings.thumbnailHeight, imageSettingsDefaults.thumbnailHeight, 80, 2000),
  thumbnailFormat: normalizeFormat(settings.thumbnailFormat, imageSettingsDefaults.thumbnailFormat),
  popupWidth: normalizeNumber(settings.popupWidth, imageSettingsDefaults.popupWidth, 200, 4000),
  popupHeight: normalizeNumber(settings.popupHeight, imageSettingsDefaults.popupHeight, 200, 4000),
  popupFormat: normalizeFormat(settings.popupFormat, imageSettingsDefaults.popupFormat),
})

const normalizeSourcePath = (imagePath = '') => {
  const normalizedPath = String(imagePath || '').trim()

  if (!normalizedPath) {
    return ''
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath
  }

  if (normalizedPath.startsWith('/')) {
    return normalizedPath
  }

  return `/${normalizedPath}`
}

const createStringHash = (value = '') => {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash).toString(36)
}

const getCacheFileExtension = (format) => {
  const normalizedFormat = normalizeFormat(format)

  if (normalizedFormat === 'jpeg') {
    return 'jpg'
  }

  return normalizedFormat
}

const getPresetConfig = (preset, settings) => {
  if (preset === 'popup') {
    return {
      width: settings.popupWidth,
      height: settings.popupHeight,
      format: settings.popupFormat
    }
  }

  return {
    width: settings.thumbnailWidth,
    height: settings.thumbnailHeight,
    format: settings.thumbnailFormat
  }
}

const createImageElement = (file) => new Promise((resolve, reject) => {
  const image = new Image()
  const objectUrl = URL.createObjectURL(file)

  image.onload = () => {
    URL.revokeObjectURL(objectUrl)
    resolve(image)
  }

  image.onerror = () => {
    URL.revokeObjectURL(objectUrl)
    reject(new Error('Не вдалося прочитати зображення'))
  }

  image.src = objectUrl
})

const shouldResizeImage = (image, width, height) => {
  if (width && image.width > width) {
    return true
  }

  if (height && image.height > height) {
    return true
  }

  return false
}

const getResizeBounds = (image, width, height) => {
  if (width && height) {
    const sourceRatio = image.width / image.height
    const targetRatio = width / height
    let sourceX = 0
    let sourceY = 0
    let sourceWidth = image.width
    let sourceHeight = image.height

    if (sourceRatio > targetRatio) {
      sourceWidth = image.height * targetRatio
      sourceX = (image.width - sourceWidth) / 2
    } else if (sourceRatio < targetRatio) {
      sourceHeight = image.width / targetRatio
      sourceY = (image.height - sourceHeight) / 2
    }

    const scale = Math.min(width / sourceWidth, height / sourceHeight, 1)

    return {
      targetWidth: Math.max(1, Math.round(sourceWidth * scale)),
      targetHeight: Math.max(1, Math.round(sourceHeight * scale)),
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
    }
  }

  if (width) {
    const scale = Math.min(width / image.width, 1)

    return {
      targetWidth: Math.max(1, Math.round(image.width * scale)),
      targetHeight: Math.max(1, Math.round(image.height * scale)),
      sourceX: 0,
      sourceY: 0,
      sourceWidth: image.width,
      sourceHeight: image.height,
    }
  }

  if (height) {
    const scale = Math.min(height / image.height, 1)

    return {
      targetWidth: Math.max(1, Math.round(image.width * scale)),
      targetHeight: Math.max(1, Math.round(image.height * scale)),
      sourceX: 0,
      sourceY: 0,
      sourceWidth: image.width,
      sourceHeight: image.height,
    }
  }

  return {
    targetWidth: image.width,
    targetHeight: image.height,
    sourceX: 0,
    sourceY: 0,
    sourceWidth: image.width,
    sourceHeight: image.height,
  }
}

const canvasToBlob = (canvas, type, quality) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (!blob) {
      reject(new Error('Не вдалося сформувати файл зображення'))
      return
    }

    resolve(blob)
  }, type, quality)
})

export const getImageSettings = () => {
  return imageSettingsDefaults
}

export const normalizeImageSettings = (settings) => normalizeSettings(settings)

export const getThumbnailImageStyle = (settings = getImageSettings()) => ({
  width: '100%',
  maxWidth: `${settings.thumbnailWidth}px`,
  height: `${settings.thumbnailHeight}px`,
  objectFit: 'cover',
  display: 'block',
  margin: '0 auto',
})

export const getPopupImageStyle = (settings = getImageSettings()) => ({
  width: '100%',
  maxWidth: `${settings.popupWidth}px`,
  maxHeight: `${settings.popupHeight}px`,
  objectFit: 'contain',
})

export const getCachedImagePath = (imagePath, preset = 'thumbnail', customSettings = getImageSettings()) => {
  const normalizedPath = normalizeSourcePath(imagePath)

  if (!normalizedPath) {
    return ''
  }

  const settings = normalizeSettings(customSettings)
  const presetConfig = getPresetConfig(preset, settings)
  const normalizedFormat = normalizeFormat(presetConfig.format)
  const cacheKey = [
    preset,
    normalizedPath,
    presetConfig.width,
    presetConfig.height,
    normalizedFormat,
    settings.uploadQuality
  ].join('|')
  const signature = `w${presetConfig.width}-h${presetConfig.height}-q${settings.uploadQuality}-f${normalizedFormat}`
  const fileExtension = getCacheFileExtension(normalizedFormat)
  const hashedName = createStringHash(cacheKey)

  return `/uploads/cache/${preset}/${signature}/${hashedName}.${fileExtension}?src=${encodeURIComponent(normalizedPath)}`
}

export const formatImageBeforeUpload = async (file, customSettings = getImageSettings()) => {
  if (!file) {
    return null
  }

  const settings = normalizeSettings(customSettings)
  const sourceImage = await createImageElement(file)

  if (!shouldResizeImage(sourceImage, settings.uploadWidth, settings.uploadHeight)) {
    return file
  }

  const outputType = getOutputType(file)
  const bounds = getResizeBounds(sourceImage, settings.uploadWidth, settings.uploadHeight)
  const canvas = document.createElement('canvas')

  canvas.width = bounds.targetWidth
  canvas.height = bounds.targetHeight

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Не вдалося підготувати зображення')
  }

  context.drawImage(
    sourceImage,
    bounds.sourceX,
    bounds.sourceY,
    bounds.sourceWidth,
    bounds.sourceHeight,
    0,
    0,
    bounds.targetWidth,
    bounds.targetHeight
  )

  const blob = await canvasToBlob(canvas, outputType, settings.uploadQuality / 100)

  return new File([blob], file.name || 'image', {
    type: outputType,
    lastModified: Date.now()
  })
}
