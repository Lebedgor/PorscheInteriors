import axios from 'axios'


const baseURL = process.env.REACT_APP_BASEURL || ''
const localImageBaseURL = baseURL
export const placeholderImage = '/uploads/placeholder.jpg'
const isAbsoluteUrl = (value = '') => /^https?:\/\//i.test(String(value))
const normalizeRelativeImagePath = (imagePath = '') => {
  const normalizedPath = String(imagePath || '').trim()

  if (!normalizedPath) {
    return placeholderImage
  }

  if (normalizedPath.startsWith('/')) {
    return normalizedPath
  }

  return `/${normalizedPath}`
}
const buildImageUrl = (host, imagePath) => `${String(host || '').replace(/\/+$/, '')}/${String(imagePath || '').replace(/^\/+/, '')}`
const getRelativePathFromUrl = (url = '') => {
  if (!url) {
    return ''
  }

  const normalizedUrl = String(url).trim()

  if (!isAbsoluteUrl(normalizedUrl)) {
    return normalizeRelativeImagePath(normalizedUrl)
  }

  try {
    const parsedUrl = new URL(normalizedUrl)

    return `${parsedUrl.pathname}${parsedUrl.search || ''}`
  } catch (error) {
    return ''
  }
}
export const getImageUrl = (imagePath) => {
  const rawPath = String(imagePath || placeholderImage).trim()

  if (isAbsoluteUrl(rawPath)) {
    return rawPath
  }

  const normalizedPath = normalizeRelativeImagePath(rawPath)

  return buildImageUrl(localImageBaseURL, normalizedPath)
}
export const getSiteImageUrl = (imagePath) => {
  const rawPath = String(imagePath || placeholderImage).trim()

  if (isAbsoluteUrl(rawPath)) {
    return rawPath
  }

  const normalizedPath = normalizeRelativeImagePath(rawPath)

  if (normalizedPath === placeholderImage) {
    return buildImageUrl(localImageBaseURL, normalizedPath)
  }

  return buildImageUrl(localImageBaseURL, normalizedPath)
}
export const handleSiteImageFallback = (event) => {
  const currentImage = event.currentTarget
  const relativePath = getRelativePathFromUrl(currentImage.src)
  const secondaryImageUrl = buildImageUrl(localImageBaseURL, relativePath)
  const placeholderUrl = buildImageUrl(localImageBaseURL, placeholderImage)

  if (!relativePath || relativePath === placeholderImage) {
    if (currentImage.src !== placeholderUrl) {
      currentImage.src = placeholderUrl
    }
    return
  }

  if (currentImage.dataset.siteFallbackStage !== 'secondary' && currentImage.src !== secondaryImageUrl) {
    currentImage.dataset.siteFallbackStage = 'secondary'
    currentImage.src = secondaryImageUrl
    return
  }

  if (currentImage.dataset.siteFallbackStage !== 'placeholder' && currentImage.src !== placeholderUrl) {
    currentImage.dataset.siteFallbackStage = 'placeholder'
    currentImage.src = placeholderUrl
  }
}
export const handleImageFallback = (event) => {
  const currentImage = event.currentTarget
  const placeholderUrl = buildImageUrl(localImageBaseURL, placeholderImage)

  if (currentImage.src !== placeholderUrl) {
    currentImage.src = placeholderUrl
  }
}

const instance = axios.create({
  baseURL
})

instance.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = token
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization
  }

  return config
})


export default instance
