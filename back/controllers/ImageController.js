import Image from "../models/Image.js"
import Category from "../models/Category.js"
import Model from "../models/Model.js"
import Interior from "../models/Interior.js"
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { getCurrentImageSettings } from './SiteSettingsController.js'

const currentFilePath = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFilePath)
const projectRoot = path.resolve(currentDir, '..', '..')
const uploadsRoot = path.join(projectRoot, 'uploads')
const cacheRoot = path.join(uploadsRoot, 'cache')
const placeholderPath = path.join(uploadsRoot, 'placeholder.jpg')
const getUploadUrl = (fileName) => `/uploads/${fileName}`
const remoteImageBaseUrl = process.env.IMAGE_SOURCE_BASEURL || 'https://back.porschednipro.com.ua/uploads'
const cacheGenerationState = {
  isRunning: false,
  cancelRequested: false,
  status: 'idle',
  total: 0,
  processed: 0,
  routesTotal: 0,
  routesProcessed: 0,
  imagesTotal: 0,
  imagesProcessed: 0,
  generated: 0,
  skipped: 0,
  failed: 0,
  currentStep: '',
  startedAt: '',
  finishedAt: '',
  error: ''
}

const sendSuccess = (res, payload = {}, status = 200) => res.status(status).json({
  success: true,
  ...payload
})

const sendError = (res, status, message, extra = {}) => res.status(status).json({
  success: false,
  message,
  ...extra
})

const normalizeTextField = (value, maxLength = 512) => String(value || '').trim().slice(0, maxLength)
const normalizeMediaType = (value) => {
  const normalizedValue = String(value || '').trim().toLowerCase()

  if (normalizedValue === 'video' || normalizedValue === 'youtube') {
    return normalizedValue
  }

  return 'image'
}
const normalizeSortValue = (value) => {
  if (value === '' || typeof value === 'undefined' || value === null) {
    return null
  }

  const normalizedValue = Number(value)

  if (!Number.isFinite(normalizedValue)) {
    return null
  }

  return Math.max(0, Math.round(normalizedValue))
}
const getMediaTypeByMime = (mimeType) => String(mimeType || '').trim().toLowerCase().startsWith('video/') ? 'video' : 'image'
const sanitizeFileName = (value) => String(value || '')
  .replace(/[\\/]+/g, '')
  .replace(/\.\.+/g, '')
  .replace(/[^a-zA-Z0-9._-]/g, '_')
const extractYouTubeVideoId = (value) => {
  const normalizedValue = String(value || '').trim()

  if (!normalizedValue) {
    return ''
  }

  try {
    const parsedUrl = new URL(normalizedValue)
    const host = parsedUrl.hostname.replace(/^www\./i, '').toLowerCase()

    if (host === 'youtu.be') {
      return parsedUrl.pathname.replace(/^\/+/, '').split('/')[0] || ''
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsedUrl.pathname === '/watch') {
        return parsedUrl.searchParams.get('v') || ''
      }

      const pathParts = parsedUrl.pathname.replace(/^\/+/, '').split('/')

      if (['embed', 'shorts', 'live'].includes(pathParts[0])) {
        return pathParts[1] || ''
      }
    }
  } catch (error) {
    return ''
  }

  return ''
}
const buildYouTubeWatchUrl = (videoId) => `https://www.youtube.com/watch?v=${videoId}`
const buildYouTubeEmbedUrl = (videoId) => `https://www.youtube.com/embed/${videoId}`
const getYouTubeThumbnailCandidates = (videoId) => [
  `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
  `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
]

const getSafeUploadPath = (url) => {
  if (!url) {
    return null
  }

  let normalizedValue = String(url).trim()

  if (!normalizedValue) {
    return null
  }

  if (/^https?:\/\//i.test(normalizedValue)) {
    try {
      const parsedUrl = new URL(normalizedValue)
      normalizedValue = `${parsedUrl.pathname}${parsedUrl.search || ''}`
    } catch (error) {
      return null
    }
  }

  const relativePath = normalizedValue
    .replace(/\?.*$/, '')
    .replace(/^\/+/, '')

  if (!relativePath.startsWith('uploads/')) {
    return null
  }

  const absolutePath = path.resolve(projectRoot, relativePath)

  if (!absolutePath.startsWith(uploadsRoot)) {
    return null
  }

  return absolutePath
}

const removeUploadFile = (uploadUrl) => {
  const safeUploadPath = getSafeUploadPath(uploadUrl)

  if (safeUploadPath && safeUploadPath !== placeholderPath && fs.existsSync(safeUploadPath)) {
    fs.unlinkSync(safeUploadPath)
  }
}

const ensureDirectory = (targetPath) => {
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true })
  }
}

const isValidImageResponse = (response) => {
  if (!response?.ok) {
    return false
  }

  const contentType = String(response.headers.get('content-type') || '').toLowerCase()

  return contentType.startsWith('image/')
}

const getSafeCachePath = (requestPath) => {
  const relativePath = String(requestPath || '').replace(/^\/+/, '')
  const absolutePath = path.resolve(projectRoot, relativePath)

  if (!absolutePath.startsWith(cacheRoot)) {
    return null
  }

  return absolutePath
}

const getRemoteSourceUrl = (sourcePath) => {
  const normalizedSource = String(sourcePath || '').trim()

  if (!normalizedSource) {
    return null
  }

  if (/^https?:\/\//i.test(normalizedSource)) {
    return normalizedSource
  }

  try {
    const relativeUploadPath = normalizedSource
      .replace(/^\/+/, '')
      .replace(/^uploads\/+/i, '')

    if (!relativeUploadPath) {
      return null
    }

    return new URL(relativeUploadPath, `${remoteImageBaseUrl.replace(/\/+$/, '')}/`).toString()
  } catch (error) {
    return null
  }
}

const loadSourceImageBuffer = async (sourcePath) => {
  const safeUploadPath = getSafeUploadPath(sourcePath)

  if (safeUploadPath && fs.existsSync(safeUploadPath)) {
    return fs.promises.readFile(safeUploadPath)
  }

  const remoteSourceUrl = getRemoteSourceUrl(sourcePath)

  if (remoteSourceUrl) {
    const remoteResponse = await fetch(remoteSourceUrl)

    if (remoteResponse.ok) {
      const arrayBuffer = await remoteResponse.arrayBuffer()

      return Buffer.from(arrayBuffer)
    }
  }

  return null
}

const buildCachePreset = (preset, settings) => {
  if (preset === 'popup') {
    return {
      width: settings.popupWidth,
      height: settings.popupHeight,
      format: settings.popupFormat,
      fit: 'inside'
    }
  }

  return {
    width: settings.thumbnailWidth,
    height: settings.thumbnailHeight,
    format: settings.thumbnailFormat,
    fit: 'cover'
  }
}

const applyOutputFormat = (imagePipeline, format, quality) => {
  if (format === 'png') {
    return imagePipeline.png()
  }

  if (format === 'jpeg') {
    return imagePipeline.jpeg({ quality, mozjpeg: true })
  }

  return imagePipeline.webp({ quality })
}

const getCacheFileExtension = (format) => {
  if (format === 'jpeg') {
    return 'jpg'
  }

  return format
}

const normalizeSourcePathForCache = (sourcePath) => {
  const normalizedValue = String(sourcePath || '').trim()

  if (!normalizedValue) {
    return ''
  }

  if (/^https?:\/\//i.test(normalizedValue)) {
    return normalizedValue
  }

  if (normalizedValue.startsWith('/')) {
    return normalizedValue
  }

  return `/${normalizedValue}`
}

const createStringHash = (value) => {
  const normalizedValue = String(value || '')
  let hash = 0

  for (let index = 0; index < normalizedValue.length; index += 1) {
    hash = ((hash << 5) - hash) + normalizedValue.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash).toString(36)
}

const getCachePathBySource = (sourcePath, preset, settings) => {
  const normalizedSourcePath = normalizeSourcePathForCache(sourcePath)

  if (!normalizedSourcePath) {
    return null
  }

  const cachePreset = buildCachePreset(preset, settings)
  const normalizedFormat = String(cachePreset.format || 'webp').trim().toLowerCase()
  const signature = `w${cachePreset.width}-h${cachePreset.height}-q${settings.uploadQuality}-f${normalizedFormat}`
  const cacheKey = [
    preset,
    normalizedSourcePath,
    cachePreset.width,
    cachePreset.height,
    normalizedFormat,
    settings.uploadQuality
  ].join('|')
  const hash = createStringHash(cacheKey)
  const extension = getCacheFileExtension(normalizedFormat)

  return path.join(cacheRoot, preset, signature, `${hash}.${extension}`)
}

const createProgressSnapshot = () => ({
  ...cacheGenerationState,
  progressPercent: cacheGenerationState.total > 0
    ? Math.min(100, Math.round((cacheGenerationState.processed / cacheGenerationState.total) * 100))
    : 0
})

const updateProgressStep = (step) => {
  cacheGenerationState.currentStep = step
}

const collectRouteAndImageTargets = async () => {
  const [categoryRowsResult, modelRowsResult, interiorRowsResult, imageRowsResult] = await Promise.all([
    Category.getAllForCache(),
    Model.getAll(),
    Interior.getAllForCache(),
    Image.getAllForCache()
  ])
  const categoryRows = categoryRowsResult?.[0] || []
  const modelRows = modelRowsResult?.[0] || []
  const interiorRows = interiorRowsResult?.[0] || []
  const imageRows = imageRowsResult?.[0] || []
  const routeSet = new Set(['/'])
  const imageSet = new Set()

  categoryRows.forEach((category) => {
    const categoryId = Number(category.category_id)

    if (Number.isFinite(categoryId) && categoryId > 0) {
      routeSet.add(`/category/${categoryId}`)
    }

    const imagePath = String(category.image || '').trim()

    if (imagePath) {
      imageSet.add(imagePath)
    }
  })

  modelRows.forEach((model) => {
    const modelId = Number(model.model_id)

    if (Number.isFinite(modelId) && modelId > 0) {
      routeSet.add(`/model/${modelId}`)
    }

    const imagePath = String(model.image || '').trim()

    if (imagePath) {
      imageSet.add(imagePath)
    }
  })

  interiorRows.forEach((interior) => {
    const interiorId = Number(interior.interior_id)

    if (Number.isFinite(interiorId) && interiorId > 0) {
      routeSet.add(`/interior/${interiorId}`)
    }

    const imagePath = String(interior.image || '').trim()

    if (imagePath) {
      imageSet.add(imagePath)
    }
  })

  imageRows.forEach((mediaItem) => {
    const mediaType = String(mediaItem.media_type || '').trim().toLowerCase()
    const link = String(mediaItem.link || '').trim()
    const previewLink = String(mediaItem.preview_link || '').trim()

    if (link && mediaType === 'image') {
      imageSet.add(link)
    }

    if (previewLink) {
      imageSet.add(previewLink)
    }
  })

  return {
    routes: Array.from(routeSet),
    images: Array.from(imageSet)
  }
}

const warmupRoute = async (baseUrl, routePath) => {
  const requestUrl = `${baseUrl.replace(/\/+$/, '')}${routePath}`
  const response = await fetch(requestUrl, {
    method: 'GET',
    headers: {
      accept: 'text/html'
    }
  })

  return response.ok
}

const runCacheGeneration = async (baseUrl) => {
  try {
    const settings = await getCurrentImageSettings()
    const { routes, images } = await collectRouteAndImageTargets()
    const cacheTasks = []

    images.forEach((imagePath) => {
      const thumbnailPath = getCachePathBySource(imagePath, 'thumbnail', settings)
      const popupPath = getCachePathBySource(imagePath, 'popup', settings)

      if (thumbnailPath) {
        cacheTasks.push({
          preset: 'thumbnail',
          sourcePath: imagePath,
          cachePath: thumbnailPath
        })
      }

      if (popupPath) {
        cacheTasks.push({
          preset: 'popup',
          sourcePath: imagePath,
          cachePath: popupPath
        })
      }
    })

    cacheGenerationState.total = routes.length + cacheTasks.length
    cacheGenerationState.routesTotal = routes.length
    cacheGenerationState.imagesTotal = cacheTasks.length

    for (const routePath of routes) {
      if (cacheGenerationState.cancelRequested) {
        break
      }

      updateProgressStep(`route:${routePath}`)

      try {
        const routeIsOk = await warmupRoute(baseUrl, routePath)

        if (!routeIsOk) {
          cacheGenerationState.failed += 1
        }
      } catch (error) {
        cacheGenerationState.failed += 1
      }

      cacheGenerationState.processed += 1
      cacheGenerationState.routesProcessed += 1
    }

    for (const task of cacheTasks) {
      if (cacheGenerationState.cancelRequested) {
        break
      }

      updateProgressStep(`cache:${task.preset}:${task.sourcePath}`)

      try {
        const wasGenerated = await generateCacheImage(task.cachePath, task.preset, task.sourcePath)

        if (wasGenerated) {
          cacheGenerationState.generated += 1
        } else {
          cacheGenerationState.skipped += 1
        }
      } catch (error) {
        cacheGenerationState.failed += 1
      }

      cacheGenerationState.processed += 1
      cacheGenerationState.imagesProcessed += 1
    }

    cacheGenerationState.currentStep = ''
    cacheGenerationState.isRunning = false
    cacheGenerationState.finishedAt = new Date().toISOString()
    cacheGenerationState.status = cacheGenerationState.cancelRequested ? 'cancelled' : 'completed'
    cacheGenerationState.cancelRequested = false
    cacheGenerationState.error = ''
  } catch (error) {
    cacheGenerationState.currentStep = ''
    cacheGenerationState.isRunning = false
    cacheGenerationState.finishedAt = new Date().toISOString()
    cacheGenerationState.status = 'error'
    cacheGenerationState.cancelRequested = false
    cacheGenerationState.error = error?.message || 'Помилка генерації кешу'
  }
}

const generateCacheImage = async (cachePath, preset, sourcePath) => {
  const sourceBuffer = await loadSourceImageBuffer(sourcePath)

  if (!sourceBuffer) {
    return false
  }

  const settings = await getCurrentImageSettings()
  const cachePreset = buildCachePreset(preset, settings)
  const cacheDirectory = path.dirname(cachePath)

  ensureDirectory(cacheDirectory)

  const imagePipeline = sharp(sourceBuffer, { failOn: 'none' })
    .rotate()
    .resize({
      width: cachePreset.width,
      height: cachePreset.height,
      fit: cachePreset.fit,
      position: 'centre',
      withoutEnlargement: true
    })

  const formattedImage = applyOutputFormat(imagePipeline, cachePreset.format, settings.uploadQuality)
  const outputBuffer = await formattedImage.toBuffer()

  await fs.promises.writeFile(cachePath, outputBuffer)

  return true
}

const sendPlaceholder = (res) => {
  if (fs.existsSync(placeholderPath)) {
    return res.sendFile(placeholderPath)
  }

  return sendError(res, 404, 'Изображение не найдено')
}

const downloadAndSaveYouTubeThumbnail = async (videoId) => {
  const thumbnailCandidates = getYouTubeThumbnailCandidates(videoId)
  let sourceBuffer = null

  for (const thumbnailUrl of thumbnailCandidates) {
    try {
      const response = await fetch(thumbnailUrl)

      if (!isValidImageResponse(response)) {
        continue
      }

      const arrayBuffer = await response.arrayBuffer()
      const currentBuffer = Buffer.from(arrayBuffer)

      if (currentBuffer.length > 0) {
        sourceBuffer = currentBuffer
        break
      }
    } catch (error) {
      continue
    }
  }

  if (!sourceBuffer) {
    throw new Error('Не вдалося завантажити мініатюру YouTube-відео')
  }

  ensureDirectory(uploadsRoot)

  const fileName = sanitizeFileName(`youtube_${videoId}_${Date.now()}.jpg`)
  const targetPath = path.join(uploadsRoot, fileName)

  await sharp(sourceBuffer, { failOn: 'none' })
    .resize({
      width: 500,
      height: 500,
      fit: 'cover',
      position: 'centre',
      withoutEnlargement: false
    })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(targetPath)

  return getUploadUrl(fileName)
}

const verifyYouTubeVideo = async (url) => {
  const verificationUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
  const response = await fetch(verificationUrl)

  if (!response.ok) {
    const error = new Error('Посилання на YouTube недійсне або відео недоступне')
    error.status = 400
    throw error
  }

  return response.json()
}

export const add = async(req, res) => {
  try {

    if (!req.file) {
      return sendError(res, 400, "Файл не был загружен")
    }

    if(req.body.id){

      const fileUrl = getUploadUrl(req.file.filename)
      const normalizedCategoryId = Number(req.body.id)
      const normalizedMediaType = getMediaTypeByMime(req.file.mimetype)
      let normalizedSort = normalizeSortValue(req.body.sort)

      if (!Number.isFinite(normalizedCategoryId) || normalizedCategoryId < 1) {
        return sendError(res, 400, 'Не получен корректный идентификатор категории')
      }

      if (normalizedSort === null) {
        const [nextSortRows] = await Image.getNextSort(normalizedCategoryId)
        normalizedSort = Number(nextSortRows?.[0]?.nextSort || 1)
      }

      const image = new Image({
        category_id: normalizedCategoryId,
        link: fileUrl,
        preview_link: '',
        media_type: normalizedMediaType,
        sort: normalizedSort,
        title: normalizeTextField(req.body.title),
        alt: normalizeTextField(req.body.alt)
      })
  
      const [saved, _] = await image.save()
  
      let message = "Изображение успешно загружено и добавлено в бд"
  
      if(!saved?.insertId){
        message = "Не удалось добавить изображение в бд"
      }
  
  
      sendSuccess(res, {
        url: fileUrl,
        message: message,
        name: req.file.filename,
        saved,
        image: {
          image_id: saved?.insertId || null,
          category_id: normalizedCategoryId,
          link: fileUrl,
          preview_link: '',
          media_type: normalizedMediaType,
          sort: normalizedSort,
          title: normalizeTextField(req.body.title),
          alt: normalizeTextField(req.body.alt)
        }
      })

    } else {
      const fileUrl = getUploadUrl(req.file.filename)

      sendSuccess(res, {
        url: fileUrl,
        name: req.file.filename,
        media_type: getMediaTypeByMime(req.file.mimetype)
      })
    }
    
  } catch (error) {
    sendError(res, 500, "Не удалось добавить изображение в бд", {
      error
    })
  }
}

export const addYoutube = async (req, res) => {
  try {
    const normalizedCategoryId = Number(req.body.id)
    const normalizedUrl = String(req.body.url || '').trim()
    const videoId = extractYouTubeVideoId(normalizedUrl)
    let normalizedSort = normalizeSortValue(req.body.sort)

    if (!Number.isFinite(normalizedCategoryId) || normalizedCategoryId < 1) {
      return sendError(res, 400, 'Не отримано коректний ідентифікатор категорії')
    }

    if (!videoId) {
      return sendError(res, 400, 'Вставте коректне посилання на YouTube')
    }

    await verifyYouTubeVideo(normalizedUrl)

    if (normalizedSort === null) {
      const [nextSortRows] = await Image.getNextSort(normalizedCategoryId)
      normalizedSort = Number(nextSortRows?.[0]?.nextSort || 1)
    }

    const normalizedVideoUrl = buildYouTubeWatchUrl(videoId)
    const previewLink = await downloadAndSaveYouTubeThumbnail(videoId)
    const image = new Image({
      category_id: normalizedCategoryId,
      link: normalizedVideoUrl,
      preview_link: previewLink,
      media_type: 'youtube',
      sort: normalizedSort,
      title: normalizeTextField(req.body.title),
      alt: normalizeTextField(req.body.alt)
    })
    const [saved] = await image.save()

    return sendSuccess(res, {
      url: normalizedVideoUrl,
      embed_url: buildYouTubeEmbedUrl(videoId),
      preview_link: previewLink,
      saved,
      image: {
        image_id: saved?.insertId || null,
        category_id: normalizedCategoryId,
        link: normalizedVideoUrl,
        preview_link: previewLink,
        media_type: 'youtube',
        sort: normalizedSort,
        title: normalizeTextField(req.body.title),
        alt: normalizeTextField(req.body.alt)
      }
    })
  } catch (error) {
    const status = Number(error?.status) || 500

    return sendError(res, status, error?.message || 'Не вдалося додати YouTube-відео', {
      error: error?.message || error
    })
  }
}

export const getImages = async(req, res) => {
  try {

    const limit = 10;
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const start = (page - 1) * limit;
    const [count, __] = await Image.getTotalImages(req.params.id);
    const [images, _] = await Image.getImages(req.params.id, start, limit);

    const total = Number(count?.[0]?.total || 0);
    

    sendSuccess(res, {
      images: images || [],
      total
  })
  } catch (error) {
    sendError(res, 500, "Не удалось получить изображения интерьера", {
      error
    })
  }
}

export const getCachedImage = async (req, res) => {
  try {
    const cachePath = getSafeCachePath(req.path)
    const preset = String(req.params.preset || '').trim().toLowerCase()
    const sourcePath = String(req.query.src || '').trim()

    if (!cachePath || !['thumbnail', 'popup'].includes(preset)) {
      return sendPlaceholder(res)
    }

    if (fs.existsSync(cachePath)) {
      return res.sendFile(cachePath)
    }

    const wasGenerated = await generateCacheImage(cachePath, preset, sourcePath)

    if (wasGenerated && fs.existsSync(cachePath)) {
      return res.sendFile(cachePath)
    }

    return sendPlaceholder(res)
  } catch (error) {
    return sendPlaceholder(res)
  }
}

export const resetImageCache = async (req, res) => {
  try {
    if (cacheGenerationState.isRunning) {
      return sendError(res, 409, 'Неможливо скинути кеш під час активної генерації')
    }

    await fs.promises.rm(cacheRoot, { recursive: true, force: true })
    ensureDirectory(cacheRoot)

    return sendSuccess(res, {
      message: 'Кеш зображень очищено'
    })
  } catch (error) {
    return sendError(res, 500, 'Не вдалося очистити кеш зображень', {
      error: error?.message || error
    })
  }
}

export const getCacheGenerationStatus = async (req, res) => sendSuccess(res, {
  job: createProgressSnapshot()
})

export const startCacheGeneration = async (req, res) => {
  try {
    if (cacheGenerationState.isRunning) {
      return sendError(res, 409, 'Генерація кешу вже виконується', {
        job: createProgressSnapshot()
      })
    }

    cacheGenerationState.isRunning = true
    cacheGenerationState.cancelRequested = false
    cacheGenerationState.status = 'running'
    cacheGenerationState.total = 0
    cacheGenerationState.processed = 0
    cacheGenerationState.routesTotal = 0
    cacheGenerationState.routesProcessed = 0
    cacheGenerationState.imagesTotal = 0
    cacheGenerationState.imagesProcessed = 0
    cacheGenerationState.generated = 0
    cacheGenerationState.skipped = 0
    cacheGenerationState.failed = 0
    cacheGenerationState.currentStep = ''
    cacheGenerationState.startedAt = new Date().toISOString()
    cacheGenerationState.finishedAt = ''
    cacheGenerationState.error = ''

    const protocol = req.protocol || 'http'
    const host = req.get('host')
    const baseUrl = `${protocol}://${host}`

    runCacheGeneration(baseUrl)

    return sendSuccess(res, {
      message: 'Генерацію кешу запущено',
      job: createProgressSnapshot()
    })
  } catch (error) {
    cacheGenerationState.isRunning = false
    cacheGenerationState.status = 'error'
    cacheGenerationState.error = error?.message || 'Не вдалося запустити генерацію кешу'

    return sendError(res, 500, 'Не вдалося запустити генерацію кешу', {
      error: cacheGenerationState.error
    })
  }
}

export const cancelCacheGeneration = async (req, res) => {
  if (!cacheGenerationState.isRunning) {
    return sendError(res, 409, 'Немає активної генерації для скасування', {
      job: createProgressSnapshot()
    })
  }

  cacheGenerationState.cancelRequested = true

  return sendSuccess(res, {
    message: 'Скасування генерації заплановано',
    job: createProgressSnapshot()
  })
}

export const remove = async(req, res) => {
  try {

    let message= 'Изображение успешно удалено';
    let imageFromDb = null

    if (req.body.id) {
      const [imageRows] = await Image.getById(req.body.id)
      imageFromDb = imageRows?.[0] || null
    }

    const uploadUrls = new Set([
      req.body.url,
      imageFromDb?.link,
      imageFromDb?.preview_link
    ].filter(Boolean))

    uploadUrls.forEach((uploadUrl) => {
      const safeUploadPath = getSafeUploadPath(uploadUrl)

      if (safeUploadPath && safeUploadPath !== placeholderPath && fs.existsSync(safeUploadPath)) {
        fs.unlinkSync(safeUploadPath)
      }
    })

    if(req.body.id){
      const [deleted, _] = await Image.remove(req.body.id)

      if(!deleted?.affectedRows){
        message = 'Изображение не найдено в базе данных'
      }
    } else if (!Array.from(uploadUrls).some((uploadUrl) => getSafeUploadPath(uploadUrl))) {
      message = 'Не был получен id изображения'
    }

    sendSuccess(res, {
      message: message
    })
    
  } catch (error) {
    sendError(res, 500, "Не удалось удалить изображение из бд1", {
      error
    })
  }
}

export const update = async (req, res) => {
  try {
    const normalizedImageId = Number(req.body.image_id)
    const normalizedSort = normalizeSortValue(req.body.sort)
    const normalizedTitle = normalizeTextField(req.body.title)
    const normalizedAlt = normalizeTextField(req.body.alt)

    if (!Number.isFinite(normalizedImageId) || normalizedImageId < 1) {
      return sendError(res, 400, 'Не получен корректный идентификатор изображения')
    }

    if (normalizedSort === null) {
      return sendError(res, 400, 'Сортировка должна быть целым числом')
    }

    const [imageRows] = await Image.getById(normalizedImageId)
    const currentImage = imageRows?.[0] || null

    if (!currentImage) {
      return sendError(res, 404, 'Изображение не найдено')
    }

    const normalizedMediaType = normalizeMediaType(currentImage.media_type || req.body.media_type)
    let normalizedLink = String(currentImage.link || '').trim()
    let normalizedPreviewLink = String(currentImage.preview_link || '').trim()

    if (normalizedMediaType === 'youtube') {
      const requestedUrl = String(req.body.url || '').trim()

      if (requestedUrl) {
        const videoId = extractYouTubeVideoId(requestedUrl)

        if (!videoId) {
          return sendError(res, 400, 'Вставте коректне посилання на YouTube')
        }

        const nextNormalizedUrl = buildYouTubeWatchUrl(videoId)
        const currentVideoId = extractYouTubeVideoId(normalizedLink)

        if (videoId !== currentVideoId || nextNormalizedUrl !== normalizedLink || !normalizedPreviewLink) {
          await verifyYouTubeVideo(requestedUrl)
          const nextPreviewLink = await downloadAndSaveYouTubeThumbnail(videoId)

          if (nextPreviewLink !== normalizedPreviewLink) {
            removeUploadFile(normalizedPreviewLink)
          }

          normalizedPreviewLink = nextPreviewLink
        }

        normalizedLink = nextNormalizedUrl
      }
    }

    const image = new Image({
      image_id: normalizedImageId,
      link: normalizedLink,
      preview_link: normalizedPreviewLink,
      media_type: normalizedMediaType,
      sort: normalizedSort,
      title: normalizedTitle,
      alt: normalizedAlt
    })

    const [updated] = await image.update()

    if (!updated?.affectedRows) {
      return sendError(res, 404, 'Изображение не найдено')
    }

    return sendSuccess(res, {
      message: 'Параметры изображения обновлены',
      image: {
        image_id: normalizedImageId,
        link: normalizedLink,
        preview_link: normalizedPreviewLink,
        media_type: normalizedMediaType,
        sort: normalizedSort,
        title: normalizedTitle,
        alt: normalizedAlt
      }
    })
  } catch (error) {
    const status = Number(error?.status) || 500

    return sendError(res, status, error?.message || 'Не удалось обновить изображение', {
      error: error?.message || error
    })
  }
}
