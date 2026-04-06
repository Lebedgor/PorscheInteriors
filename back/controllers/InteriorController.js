import Interior from "../models/Interior.js"

const sendSuccess = (res, payload = {}, status = 200) => res.status(status).json({
  success: true,
  ...payload
})

const sendError = (res, status, message, extra = {}) => res.status(status).json({
  success: false,
  message,
  ...extra
})

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

    if (!saved?.insertId) {
      return sendError(res, 500, "Не удалось создать интерьер")
    }

    sendSuccess(res, {
      message: "Интерьер успешно создан",
      saved
    })

  } catch (error) {
    sendError(res, 500, "Не удалось создать интерьер", {
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

    if(!updated?.affectedRows) {
      return sendError(res, 404, "Интерьер не найден")
    }

    sendSuccess(res, {
      message: "Интерьер успешно обновлен",
      updated
    })

  } catch (error) {

    sendError(res, 500, "Не удалось обновить интерьер", {
      error
    })
    
  }
}

export const remove = async (req, res) => {
  try{

    const [del, _] = await Interior.remove(req.params.id)

    if(!del?.affectedRows){
      return sendError(res, 404, "Интерьер не найден")
    }

    sendSuccess(res, {
      message: "Интерьер успешно удален",
      del
    })

  } catch(error) {
    sendError(res, 500, "Не удалось удалить интерьер", {
      error
    })
  }
}

export const getOne = async (req, res) => {
  try {

    const [interior, _] = await Interior.getOne(req.params.id)

    if (!interior?.length) {
      return sendError(res, 404, "Интерьер не найден")
    }
    res.json(
      interior[0]
    )
  } catch (error) {
    sendError(res, 500, "Не удалось получить интерьер", {
      error
    })
  }
}
