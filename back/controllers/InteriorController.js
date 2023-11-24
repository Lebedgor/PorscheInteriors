import mongoose from "mongoose";
import Interior from "../models/Interior.js"
import Images from "../models/ImagesMangoose.js";

export const create = async (req, res) => {
  try {

    const interior = new Interior({
      name: req.body.name,
      description: req.body.description ? req.body.description : '',
      image: req.body.image,
      model_id: req.body.model_id,
      sort: req.body.sort,
      user_id: req.user_id
    });

    const [saved, _] = await interior.save();

    res.json({
      message: "Каталог интерьера успешно добавлен",
      saved
    })

  } catch (error) {
    res.status(500).json({
      message: "Не удалось создать каталог интерьера",
      error
    })
  }
}

export const update = async (req, res) => {
  try {

    const interior = new Interior({
      name: req.body.name,
      description: req.body.description ? req.body.description : '',
      image: req.body.image,
      sort: req.body.sort,
      user_id: req.user_id,
      interior_id: req.body.interior_id,
    });

    const [updated, _] = await interior.update();

    if(!updated) {
      return res.status(500).json({
        message: "Не удалось найти каталог"
      })
    }

    res.json({
      message: "Каталог интерьера успешно обновлен",
      updated
    })

  } catch (error) {

    res.status(500).json({
      message: "Не удалось найти каталог",
      error
    })
    
  }
}

export const remove = async (req, res) => {
  try{

    const del = await Interior.remove(req.params.id)

    if(!del){
      return res.status(500).json({
        message: "Не удалось удалить каталог интерьера"
      })
    }

    res.json({
      message: "Каталог интерьера удален",
      del
    })

  } catch(error) {
    res.status(500).json({
      message: "Не удалось удалить каталог интерьера",
      error
    })
  }
}

export const getOne = async (req, res) => {
  try {

    const [interior, _] = await Interior.getOne(req.params.id)

    if (!interior) {
      return res.status(404).json({
        message: "Не удалось найти интерьер"
      })
    }
    res.json(
      interior[0]
    )
  } catch (error) {
    res.status(404).json({
      message: "Не удалось найти интерьер",
      error
    })
  }
}

export const getImages = async (req, res) => {

  try {

    const limit = 10
    const page = req.query.page ? req.query.page : 1
  
    const images = await Images.find({interior_id: req.params.id}).limit(limit).skip(limit * (page - 1 ))
    const count = await Images.count({interior_id: req.params.id})
  
    if (!images) {
      return res.status(404).json({
        message: "Не удалось найти фото"
      })
    }
    res.json({
      images,
      count
    })
    
  } catch (error) {
    res.status(404).json({
      message: "Не удалось найти фото",
      error
    })
  }
}

export const getAll = async (req, res) => {
  try {
    const data = InteriorModel.find().populate("userId").exec()
    if (!data) {
      return res.status(404).json({
        message: "Не удалось найти статьи"
      })
    }
    res.json({
      data
    })
  } catch (error) {
    res.status(404).json({
      message: "Не удалось найти статьи",
      error
    })
  }
}