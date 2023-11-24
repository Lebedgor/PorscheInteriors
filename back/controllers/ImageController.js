import Image from "../models/Image.js"
import fs from 'fs'


export const add = async(req, res) => {
  try {

    if(req.body.id){

      const image = new Image({
        interior_id: req.body.id,
        link: '/' + req.file.destination + '/' + req.file.originalname
      })
  
      const [saved, _] = await image.save()
  
      let message = "Изображение успешно загружено и добавлено в бд"
  
      if(!saved){
        message = "Не удалось добавить изображение в бд"
      }
  
  
      res.json({
        url: '/' + req.file.destination + '/' + req.file.originalname,
        message: message,
        name: req.file.originalname,
        saved
      })

    } else {
      res.json({
        url: '/' + req.file.destination + '/' + req.file.originalname,
        name: req.file.originalname,
      })
    }
    
  } catch (error) {
    res.json({
      message: "Не удалось добавить изображение в бд",
      error
    })
  }
}

export const getImages = async(req, res) => {
  try {

    const limit = 10;
    const page = req.query.page ? req.query.page : 1;
    const start = (page - 1) * limit;
    const [count, __] = await Image.getTotalImages(req.params.id);
    const [images, _] = await Image.getImages(req.params.id, start, limit);

    const total = count[0].total;
    

    if (!images) {
      return res.status(404).json({
        message: "Не удалось найти интерьер"
      })
    }
    res.json({
      images,
      total
  })
  } catch (error) {
    res.status(404).json({
      message: "Не удалось найти интерьер",
      error
    })
  }
}

export const remove = async(req, res) => {
  try {

    let message= 'Изображение успешно удалено';

    if(req.body.id){

      fs.unlink(req.body.url.substring(1), (err) => {});

      const deleted = await Image.remove(req.body.id)

      if(!deleted){
        message = 'Изображение не найдено в базе данных'
      }
    } else {
      message = 'Не был получен id изображения'
    }

    res.json({
      message: message
    })
    
  } catch (error) {
    res.json({
      message: "Не удалось удалить изображение из бд1",
      error
    })
  }
}