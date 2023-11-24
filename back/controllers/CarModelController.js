import Interior from "../models/InteriorMangoose.js";
import Model from "../models/Model.js";




export const create = async(req, res) => {
  try {

    let model = new Model({
      name: req.body.name,
      image: req.body.image,
      sort: req.body.sort,
      user_id: req.user_id,
    })

    let [saved, _] = await model.save();


    if(!saved){
      return res.status(500).json({
        message: "Не удалось добавить модель"
      })
    }

    res.json({
      message: "Каталог модели успешно добавлен",
      saved
    })

  } catch (error) {
    res.status(500).json({
      message: "Не удалось добавить модель",
      error
    })
  }
}

export const update = async(req, res) => {
  try {
    
    let model = new Model({
      name: req.body.name,
      image: req.body.image,
      sort: req.body.sort,
      user_id: req.user_id,
      model_id: req.body.model_id
    })

    let [updated, _] = await model.update();

    if(!updated){
      return res.status(500).json({
        message: "Не удалось обновить модель"
      })
    }
    res.json(updated)
  } catch (error) {
    res.status(500).json({
      message: "Не удалось обновить модель"
    })
  }
}

export const remove = async(req, res) => {
  try{

    const [del, _] = await Model.remove(req.params.id)

    if(!del){
      return res.status(500).json({
        message: "Не удалось удалить модель"
      })
    }

    res.json({
      message: "Модель успешно удалена",
      del
    })

  } catch(error) {
    res.status(500).json({
      message: "Не удалось удалить модель",
      error
    })
  }
}

export const getAll = async(req, res) => {
  try {

    const [data, _] = await Model.getAll();

    if(!data) {
      return res.status(404).json({
        message: "Модели не найдены"
      })
    }
    res.json(data)
  } catch (error) {
    res.status(404).json({
      message: "Модели не найдены",
      error
    })
  }
}

export const getOne = async(req, res) => {
  try {

    const [interiors, _] = await Model.getOne(req.params.id);

    if(!interiors) {
      return res.status(404).json({
        message: "Модель не найдена"
      })
    }

    res.json(interiors)
  } catch (error) {
    res.status(404).json({
      message: "Модель не найдена",
      error
    })
  }
}