import dotenv from 'dotenv'
import express from 'express';
import multer from 'multer';
import { registerValidation, userEditValidation, loginValidation, interiorValidation, modelValidation, categoryValidation, userActivateValidation, userDeleteValidation, siteImageSettingsValidation, siteHomeSeoValidation, imageValidation } from './validations/validation.js';
import checkAuth from './utils/checkAuth.js';
import * as UserController from './controllers/UserController.js';
import * as ImageController from "./controllers/ImageController.js"
import * as Install from "./controllers/Install.js"
import * as CarModelController from './controllers/CarModelController.js';
import * as InteriorController from './controllers/InteriorController.js';
import * as SiteSettingsController from './controllers/SiteSettingsController.js'
import handleValidationErrors from './validations/handleValidationErrors.js';
import cors from 'cors'
import fs from "fs"
import path from 'path'
import { fileURLToPath } from 'url'
import { initDb } from './utils/db.js';
import Image from './models/Image.js';
import Category from './models/Category.js';



import * as CategoryController from './controllers/CategoryController.js';


const app = express();

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

const sanitizeFileName = (value) => String(value || '')
  .replace(/[\\/]+/g, '')
  .replace(/\.\.+/g, '')
  .replace(/[^a-zA-Z0-9._-]/g, '_')
const isAllowedUploadMimeType = (mimeType) => {
  const normalizedMimeType = String(mimeType || '').trim().toLowerCase()

  if (!normalizedMimeType) {
    return false
  }

  return normalizedMimeType.startsWith('image/') || normalizedMimeType.startsWith('video/')
}

const currentFilePath = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFilePath)
const projectRoot = path.resolve(currentDir, '..')
const uploadsRoot = path.join(projectRoot, 'uploads')
const uploadsCacheRoot = path.join(uploadsRoot, 'cache')
const placeholderPath = path.join(uploadsRoot, 'placeholder.jpg')

if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true })
}

if (!fs.existsSync(uploadsCacheRoot)) {
  fs.mkdirSync(uploadsCacheRoot, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsRoot)
  },
  filename: (req, file, cb) => {
    const name = sanitizeFileName(req.body.name || 'image')
    const originalName = sanitizeFileName(req.body.originalName || file.originalname)
    let fileName = `${name}_${originalName}`;
    cb(null, fileName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
      if (isAllowedUploadMimeType(file.mimetype)) {
          return cb(null, true);
      }

      const err = new Error('Дозволені лише файли з типом image/* або video/*')
      err.name = 'ExtensionError'
      return cb(err);
  },
})

const uploadSingleImage = (req, res, next) => {
  upload.single('image')(req, res, (error) => {
    if (!error) {
      return next()
    }

    if (error?.name === 'MulterError') {
      return res.status(400).json({
        success: false,
        message: 'Помилка завантаження файлу',
        error: error.message
      })
    }

    if (error?.name === 'ExtensionError') {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    return next(error)
  })
}

app.use(express.json())
app.use(cors())

const serveFrontendPageIfHtml = (req, res, next) => {
  if (!SiteSettingsController.isHtmlRequest(req)) {
    return next()
  }

  return SiteSettingsController.renderFrontendPageWithMeta(req, res, next)
}

app.get('/', serveFrontendPageIfHtml)

app.get('/install', checkAuth, Install.install)

app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register)

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login)

app.get('/auth/me', checkAuth, UserController.auth)

app.get('/site-settings', SiteSettingsController.getSiteSettings)

app.get('/site-settings/:section/:key', SiteSettingsController.getSiteSetting)

app.patch('/site-settings/images/formatting', checkAuth, siteImageSettingsValidation, handleValidationErrors, SiteSettingsController.updateImageSettings)

app.patch('/site-settings/seo/home', checkAuth, siteHomeSeoValidation, handleValidationErrors, SiteSettingsController.updateHomeSeoSettings)

app.get('/site-settings/image', SiteSettingsController.getImageSettings)

app.patch('/site-settings/image', checkAuth, siteImageSettingsValidation, handleValidationErrors, SiteSettingsController.updateImageSettings)

app.patch('/user/edit', checkAuth, userEditValidation, handleValidationErrors, UserController.edit)

app.post('/user', checkAuth, registerValidation, handleValidationErrors, UserController.create)

app.get('/user/getUser', checkAuth, UserController.getUser)

app.get('/user/getAllUsers', checkAuth, UserController.getAllUsers);

app.patch('/user/activate', checkAuth, userActivateValidation, handleValidationErrors, UserController.activate);

app.delete('/user/:id', checkAuth, userDeleteValidation, handleValidationErrors, UserController.remove);

app.post('/remove', checkAuth, ImageController.remove)
app.post('/cache/reset', checkAuth, ImageController.resetImageCache)
app.get('/cache/generate/status', checkAuth, ImageController.getCacheGenerationStatus)
app.post('/cache/generate/start', checkAuth, ImageController.startCacheGeneration)
app.post('/cache/generate/cancel', checkAuth, ImageController.cancelCacheGeneration)

app.use('/uploads', express.static(uploadsRoot))
app.get('/uploads/cache/:preset/*', ImageController.getCachedImage)
app.get(/^\/uploads\/.+/, (req, res) => {
  if (!fs.existsSync(placeholderPath)) {
    return res.status(404).json({
      success: false,
      message: 'Изображение не найдено'
    })
  }

  return res.sendFile(placeholderPath)
})

app.get('/interior_images/:id', ImageController.getImages)

app.post('/upload_image', checkAuth, uploadSingleImage, ImageController.add)
app.post('/youtube_video', checkAuth, ImageController.addYoutube)

app.patch('/image', checkAuth, imageValidation, handleValidationErrors, ImageController.update)

app.delete('/image', checkAuth, ImageController.remove)

app.get('/category/:id', serveFrontendPageIfHtml, CategoryController.getOne)

app.get('/category', CategoryController.getMain)

app.post('/category', checkAuth, categoryValidation, handleValidationErrors, CategoryController.create)

app.patch('/category', checkAuth, categoryValidation, handleValidationErrors, CategoryController.update)

app.delete('/category/:id', checkAuth, CategoryController.remove)

app.get('/model', CarModelController.getAll)

app.get('/model/:id', serveFrontendPageIfHtml, CarModelController.getOne)

app.post('/model', checkAuth, modelValidation, handleValidationErrors, CarModelController.create)

app.patch('/model', checkAuth, modelValidation, handleValidationErrors, CarModelController.update)

app.delete('/model/:id', checkAuth, CarModelController.remove)

app.get('/interior/:id', serveFrontendPageIfHtml, InteriorController.getOne)

app.post('/interior', checkAuth, interiorValidation, handleValidationErrors, InteriorController.create)

app.patch('/interior', checkAuth, interiorValidation, handleValidationErrors, InteriorController.update)

app.delete('/interior/:id', checkAuth, InteriorController.remove)

app.use((error, req, res, next) => {
  if (error?.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'Ошибка загрузки файла',
      error: error.message
    })
  }

  if (error?.name === 'ExtensionError') {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }

  return res.status(500).json({
    success: false,
    message: 'Внутренняя ошибка сервера',
    error: error?.message || error
  })
})

const startServer = async () => {
  await initDb()
  await Image.ensureTableStructure()
  await Category.ensureTableStructure()

  app.listen(Number(process.env.PORT) || 4444, (error) => {
    if(error){
      return console.log(error)
    }

    console.log('Server OK')
  })
}

startServer().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})
