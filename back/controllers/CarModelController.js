import Model from "../models/Model.js";

const sendSuccess = (res, payload = {}, status = 200) => res.status(status).json({
  success: true,
  ...payload
})

const sendError = (res, status, message, extra = {}) => res.status(status).json({
  success: false,
  message,
  ...extra
})



export const create = async(req, res) => {
  try {

    let model = new Model({
      name: req.body.name,
      image: req.body.image,
      sort: req.body.sort,
      user_id: req.user_id,
    })

    let [saved, _] = await model.save();

    if(!saved?.insertId){
      return sendError(res, 500, "Не удалось создать модель")
    }

    sendSuccess(res, {
      message: "Модель успешно создана",
      saved
    })

  } catch (error) {
    sendError(res, 500, "Не удалось создать модель", {
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

    if(!updated?.affectedRows){
      return sendError(res, 404, "Модель не найдена")
    }
    sendSuccess(res, {
      message: "Модель успешно обновлена",
      updated
    })
  } catch (error) {
    sendError(res, 500, "Не удалось обновить модель", {
      error
    })
  }
}

export const remove = async(req, res) => {
  try{

    const [del, _] = await Model.remove(req.params.id)

    if(!del?.affectedRows){
      return sendError(res, 404, "Модель не найдена")
    }

    sendSuccess(res, {
      message: "Модель успешно удалена",
      del
    })

  } catch(error) {
    sendError(res, 500, "Не удалось удалить модель", {
      error
    })
  }
}

export const getAll = async(req, res) => {
  try {

    const [data, _] = await Model.getAll();

    if(!data?.length) {
      return sendError(res, 404, "Модели не найдены")
    }
    res.json(data)
  } catch (error) {
    sendError(res, 500, "Не удалось получить модели", {
      error
    })
  }
}

export const getOne = async(req, res) => {
  try {

    const [modelRows, __] = await Model.getModelInfo(req.params.id);

    const [interiors, _] = await Model.getOne(req.params.id);

    if(!modelRows?.length) {
      return sendError(res, 404, "Модель не найдена")
    }

    sendSuccess(res, {
      model: modelRows[0], interiors
    })
  } catch (error) {
    sendError(res, 500, "Не удалось получить модель", {
      error
    })
  }
}
