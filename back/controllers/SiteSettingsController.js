import SiteSetting from '../models/SiteSetting.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Category from '../models/Category.js'
import Model from '../models/Model.js'
import Interior from '../models/Interior.js'

const imageSettingsDefaults = {
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

const homeSeoDefaults = {
  title: '',
  description: '',
  h1: '',
  og_title: '',
  og_description: '',
  og_image: '',
}

const siteSettingsSchema = {
  general: {
    branding: {
      siteName: '',
      phone: '',
      email: '',
    }
  },
  images: {
    formatting: imageSettingsDefaults
  },
  seo: {
    home: homeSeoDefaults
  }
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

const currentFilePath = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFilePath)
const projectRoot = path.resolve(currentDir, '..', '..')
const frontendBuildTemplatePath = path.join(projectRoot, 'front', 'build', 'index.html')
const frontendPublicTemplatePath = path.join(projectRoot, 'front', 'public', 'index.html')

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

  if (['webp', 'jpeg', 'png'].includes(normalizedValue)) {
    return normalizedValue
  }

  return fallback
}

const normalizeImageSettings = (settings = {}) => ({
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

const normalizeSeoText = (value, fallback = '') => String(value ?? fallback).trim()

const normalizeHomeSeoSettings = (settings = {}) => {
  const title = normalizeSeoText(settings.title, homeSeoDefaults.title)
  const description = normalizeSeoText(settings.description, homeSeoDefaults.description)
  const h1 = normalizeSeoText(settings.h1, homeSeoDefaults.h1)
  const ogTitle = normalizeSeoText(settings.og_title, homeSeoDefaults.og_title)
  const ogDescription = normalizeSeoText(settings.og_description, homeSeoDefaults.og_description)
  const ogImage = normalizeSeoText(settings.og_image, homeSeoDefaults.og_image)

  return {
    title,
    description,
    h1,
    og_title: ogTitle || title,
    og_description: ogDescription || description,
    og_image: ogImage,
  }
}

const siteSettingsNormalizers = {
  'images.formatting': normalizeImageSettings,
  'seo.home': normalizeHomeSeoSettings
}

const getSettingStorageKey = (section, key) => `${section}.${key}`

const getSiteSettingDefaults = (section, key) => {
  const sectionConfig = siteSettingsSchema[section]

  if (!sectionConfig || !Object.prototype.hasOwnProperty.call(sectionConfig, key)) {
    return null
  }

  return sectionConfig[key]
}

const getSiteSettingNormalizer = (section, key) => {
  const storageKey = getSettingStorageKey(section, key)

  return siteSettingsNormalizers[storageKey] || ((value) => value)
}

const ensureDefaultSettings = async () => {
  await SiteSetting.ensureTable()

  const [rows] = await SiteSetting.getAll()
  const existingKeys = new Set((rows || []).map((row) => row.setting_key))

  for (const [section, group] of Object.entries(siteSettingsSchema)) {
    for (const [key, defaultValue] of Object.entries(group)) {
      const storageKey = getSettingStorageKey(section, key)

      if (!existingKeys.has(storageKey)) {
        await SiteSetting.save(storageKey, defaultValue)
      }
    }
  }
}

const parseSettingValue = (value) => typeof value === 'string'
  ? JSON.parse(value)
  : value

const buildStructuredSettings = async () => {
  await ensureDefaultSettings()

  const [rows] = await SiteSetting.getAll()
  const structuredSettings = {}

  for (const [section, group] of Object.entries(siteSettingsSchema)) {
    structuredSettings[section] = {}

    for (const [key, defaultValue] of Object.entries(group)) {
      const storageKey = getSettingStorageKey(section, key)
      const savedSetting = rows?.find((row) => row.setting_key === storageKey)
      const normalizer = getSiteSettingNormalizer(section, key)
      const parsedValue = savedSetting?.setting_value
        ? parseSettingValue(savedSetting.setting_value)
        : defaultValue

      structuredSettings[section][key] = normalizer(parsedValue)
    }
  }

  return structuredSettings
}

const getStructuredSetting = async (section, key) => {
  const defaults = getSiteSettingDefaults(section, key)

  if (defaults === null) {
    return null
  }

  const settings = await buildStructuredSettings()

  return settings?.[section]?.[key] ?? defaults
}

const updateStructuredSetting = async (section, key, value) => {
  const defaults = getSiteSettingDefaults(section, key)

  if (defaults === null) {
    return null
  }

  await SiteSetting.ensureTable()

  const normalizer = getSiteSettingNormalizer(section, key)
  const normalizedValue = normalizer(value)

  await SiteSetting.save(getSettingStorageKey(section, key), normalizedValue)

  return normalizedValue
}

export const getSiteSettings = async (req, res) => {
  try {
    const settings = await buildStructuredSettings()

    sendSuccess(res, {
      settings
    })
  } catch (error) {
    sendError(res, 500, 'Не вдалося отримати налаштування сайту', {
      error
    })
  }
}

export const getSiteSetting = async (req, res) => {
  try {
    const settings = await getStructuredSetting(req.params.section, req.params.key)

    if (settings === null) {
      return sendError(res, 404, 'Налаштування не знайдено')
    }

    sendSuccess(res, {
      settings
    })
  } catch (error) {
    sendError(res, 500, 'Не вдалося отримати налаштування сайту', {
      error
    })
  }
}

export const updateSiteSetting = async (req, res) => {
  try {
    const settings = await updateStructuredSetting(req.params.section, req.params.key, req.body)

    if (settings === null) {
      return sendError(res, 404, 'Налаштування не знайдено')
    }

    sendSuccess(res, {
      message: 'Налаштування сайту успішно збережено',
      settings
    })
  } catch (error) {
    sendError(res, 500, 'Не вдалося зберегти налаштування сайту', {
      error
    })
  }
}

export const getImageSettings = async (req, res) => {
  try {
    const settings = await getStructuredSetting('images', 'formatting')

    sendSuccess(res, {
      settings
    })
  } catch (error) {
    sendError(res, 500, 'Не вдалося отримати налаштування сайту', {
      error
    })
  }
}

export const updateImageSettings = async (req, res) => {
  try {
    const settings = await updateStructuredSetting('images', 'formatting', req.body)

    if (settings === null) {
      return sendError(res, 404, 'Налаштування не знайдено')
    }

    sendSuccess(res, {
      message: 'Налаштування зображень успішно збережено',
      settings
    })
  } catch (error) {
    sendError(res, 500, 'Не вдалося зберегти налаштування сайту', {
      error
    })
  }
}

export const updateHomeSeoSettings = async (req, res) => {
  try {
    const settings = await updateStructuredSetting('seo', 'home', req.body)

    if (settings === null) {
      return sendError(res, 404, 'Налаштування не знайдено')
    }

    sendSuccess(res, {
      message: 'SEO налаштування головної сторінки успішно збережено',
      settings
    })
  } catch (error) {
    sendError(res, 500, 'Не вдалося зберегти налаштування сайту', {
      error
    })
  }
}

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;')

const normalizeMetaText = (value, fallback = '') => String(value || fallback).trim()

const toAbsoluteUrl = (value, req) => {
  const normalizedValue = String(value || '').trim()

  if (!normalizedValue) {
    return ''
  }

  if (/^https?:\/\//i.test(normalizedValue)) {
    return normalizedValue
  }

  if (normalizedValue.startsWith('//')) {
    return `${req.protocol}:${normalizedValue}`
  }

  const normalizedPath = normalizedValue.startsWith('/') ? normalizedValue : `/${normalizedValue}`

  return `${req.protocol}://${req.get('host')}${normalizedPath}`
}

const getFrontendTemplate = () => {
  const templatePath = fs.existsSync(frontendBuildTemplatePath)
    ? frontendBuildTemplatePath
    : frontendPublicTemplatePath

  return fs.readFileSync(templatePath, 'utf8')
}

const buildMetaTags = ({ title, description, image, canonicalUrl }) => {
  const escapedTitle = escapeHtml(title)
  const escapedDescription = escapeHtml(description)
  const escapedCanonicalUrl = escapeHtml(canonicalUrl)
  const tags = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="uk_UA" />`,
    `<meta property="og:title" content="${escapedTitle}" />`,
    `<meta property="og:description" content="${escapedDescription}" />`,
    `<meta property="og:url" content="${escapedCanonicalUrl}" />`,
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${escapedTitle}" />`,
    `<meta name="twitter:description" content="${escapedDescription}" />`,
    `<link rel="canonical" href="${escapedCanonicalUrl}" />`
  ]

  if (image) {
    const escapedImage = escapeHtml(image)
    tags.push(`<meta property="og:image" content="${escapedImage}" />`)
    tags.push(`<meta name="twitter:image" content="${escapedImage}" />`)
  }

  return tags.join('\n    ')
}

const resolveSeoMetaForRoute = async (req) => {
  const homeSeoSettings = await getCurrentHomeSeoSettings()
  const defaultTitle = normalizeMetaText(homeSeoSettings.title, 'Porsche центр Дніпро')
  const defaultDescription = normalizeMetaText(homeSeoSettings.description, 'Porsche центр Дніпро. Галерея інтерʼєрів.')
  const defaultOgTitle = normalizeMetaText(homeSeoSettings.og_title, defaultTitle)
  const defaultOgDescription = normalizeMetaText(homeSeoSettings.og_description, defaultDescription)
  const defaultOgImage = toAbsoluteUrl(homeSeoSettings.og_image, req)
  const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
  const pathName = String(req.path || '')
  const routeId = Number(req.params?.id)

  if (pathName.startsWith('/category/') && Number.isFinite(routeId) && routeId > 0) {
    const [rows] = await Category.getInfo(routeId)
    const category = rows?.[0]

    if (category) {
      const title = normalizeMetaText(category.seo_title, category.name || defaultTitle)
      const description = normalizeMetaText(category.seo_description, category.description || defaultDescription)
      const image = toAbsoluteUrl(category.image, req) || defaultOgImage

      return {
        title,
        description,
        image,
        canonicalUrl
      }
    }
  }

  if (pathName.startsWith('/model/') && Number.isFinite(routeId) && routeId > 0) {
    const [rows] = await Model.getModelInfo(routeId)
    const model = rows?.[0]

    if (model) {
      const title = normalizeMetaText(model.name, defaultOgTitle)
      const description = normalizeMetaText(model.description, defaultOgDescription)
      const image = toAbsoluteUrl(model.image, req) || defaultOgImage

      return {
        title,
        description,
        image,
        canonicalUrl
      }
    }
  }

  if (pathName.startsWith('/interior/') && Number.isFinite(routeId) && routeId > 0) {
    const [rows] = await Interior.getOne(routeId)
    const interior = rows?.[0]

    if (interior) {
      const title = normalizeMetaText(interior.name, defaultOgTitle)
      const description = normalizeMetaText(interior.description, defaultOgDescription)
      const image = toAbsoluteUrl(interior.image, req) || defaultOgImage

      return {
        title,
        description,
        image,
        canonicalUrl
      }
    }
  }

  return {
    title: defaultOgTitle,
    description: defaultOgDescription,
    image: defaultOgImage,
    canonicalUrl
  }
}

export const isHtmlRequest = (req) => String(req.headers?.accept || '').toLowerCase().includes('text/html')

export const renderFrontendPageWithMeta = async (req, res, next) => {
  try {
    const seoMeta = await resolveSeoMetaForRoute(req)
    const metaTags = buildMetaTags(seoMeta)
    const titleTag = `<title>${escapeHtml(seoMeta.title)}</title>`
    const descriptionTag = `<meta name="description" content="${escapeHtml(seoMeta.description)}" />`
    let html = getFrontendTemplate()

    html = html.replace(/<meta\s+property=["']og:[^>]*>\s*/gi, '')
    html = html.replace(/<meta\s+name=["']twitter:[^>]*>\s*/gi, '')
    html = html.replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '')
    html = html.replace(/<title>[\s\S]*?<\/title>/i, titleTag)

    if (/<meta\s+name=["']description["'][^>]*>/i.test(html)) {
      html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, descriptionTag)
    } else {
      html = html.replace('</head>', `    ${descriptionTag}\n  </head>`)
    }

    html = html.replace('</head>', `    ${metaTags}\n  </head>`)

    return res.status(200).type('html').send(html)
  } catch (error) {
    return next(error)
  }
}

export const getCurrentImageSettings = async () => {
  const settings = await getStructuredSetting('images', 'formatting')

  return normalizeImageSettings(settings || imageSettingsDefaults)
}

export const getCurrentHomeSeoSettings = async () => {
  const settings = await getStructuredSetting('seo', 'home')

  return normalizeHomeSeoSettings(settings || homeSeoDefaults)
}

export { homeSeoDefaults, imageSettingsDefaults, normalizeHomeSeoSettings, normalizeImageSettings, siteSettingsSchema }
