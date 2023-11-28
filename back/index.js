import dotenv from 'dotenv'
import express from 'express';
import multer from 'multer';
import { registerValidation, userEditValidation, loginValidation, interiorValidation, modelValidation } from './validations/validation.js';
import checkAuth from './utils/checkAuth.js';
import * as UserController from './controllers/UserController.js';
import * as InteriorController from './controllers/InteriorController.js';
import * as CarModelController from "./controllers/CarModelController.js"
import * as ImageController from "./controllers/ImageController.js"
import * as Install from "./controllers/Install.js"
import handleValidationErrors from './validations/handleValidationErrors.js';
import cors from 'cors'
import fs from "fs"


const app = express();

//dotenv.config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let path = `uploads/${req.body.folder}`;
    if (!fs.existsSync(path)){
      fs.mkdirSync(path);
    }
    cb(null, path)
  },
  filename: (req, file, cb) => {
    console.log(file)
    let fileName = req.body.name ? req.body.name + '_' + req.body.originalName : req.body.originalName;
    cb(null, fileName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
      if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
          cb(null, true);
      } else {
          cb(null, false);
          const err = new Error('Разрешены только .png, .jpg и .jpeg форматы изображений!')
          err.name = 'ExtensionError'
          return cb(err);
      }
  },
})

app.use(express.json())
app.use(cors())

app.listen(4444, (error) => {
  if(error){
    return console.log(error)
  }

  console.log('Server OK')
})

app.get('/install', checkAuth, Install.install)

app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register)

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login)

app.get('/auth/me', checkAuth, UserController.auth)

app.patch('/user/edit', checkAuth, userEditValidation, UserController.edit)

app.get('/user/getUser', checkAuth, UserController.getUser)

app.get('/user/getAllUsers', checkAuth, UserController.getAllUsers);

app.patch('/user/activate', checkAuth, UserController.activate);

app.get('/model', CarModelController.getAll)

app.get('/model/:id', CarModelController.getOne)

app.post('/model', checkAuth, modelValidation, CarModelController.create)

app.patch('/model/:id', checkAuth, modelValidation, CarModelController.update)

app.delete('/model/:id', checkAuth, CarModelController.remove)

app.get('/interior', InteriorController.getAll)

app.get('/interior/:id', InteriorController.getOne)

app.get('/interior_images/:id', ImageController.getImages)

app.post('/interior', checkAuth, interiorValidation, InteriorController.create)

app.patch('/interior', checkAuth, interiorValidation, InteriorController.update)

app.delete('/interior/:id', checkAuth, InteriorController.remove)

app.post('/upload/:type', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: '/uploads/' + req.params.type + '/' + req.file.originalname,
  })
})

app.post('/upload_image', checkAuth, upload.single('image'), ImageController.add)

app.delete('/image', checkAuth, ImageController.remove)

app.post('/remove', checkAuth, ImageController.remove, (req, res) => {
  try{
    fs.unlink(req.body.url.substring(1), (err) => {});
    res.json({
      message: 'Файл успешно удален'
    })
  } catch(error){
    res.status(500).json({
      message: 'Не удалось удалить изображение',
      error
    }
    )
  }
})

app.use('/uploads', express.static('uploads'))
