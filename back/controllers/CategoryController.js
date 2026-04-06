import Category from "../models/Category.js"

const sendSuccess = (res, payload = {}, status = 200) => res.status(status).json({
  success: true,
  ...payload
})

const sendError = (res, status, message, extra = {}) => res.status(status).json({
  success: false,
  message,
  ...extra
})

const rootBreadcrumb = {
  parent_id: 0,
  category_id: 0,
  name: 'Продукцiя'
}

const getCategoryBreadcrumbs = async (category) => {
  if (!category?.category_id) {
    return [rootBreadcrumb]
  }

  const breadcrumbs = [category]
  let parentId = Number(category.parent_id) || 0

  while (parentId > 0) {
    const [parentRows] = await Category.getInfo(parentId)
    const parentCategory = parentRows?.[0]

    if (!parentCategory) {
      break
    }

    breadcrumbs.unshift(parentCategory)
    parentId = Number(parentCategory.parent_id) || 0
  }

  breadcrumbs.unshift(rootBreadcrumb)

  return breadcrumbs
}

export const create = async (req, res) => {
  try {

    const category = new Category({
      name: req.body.name,
      description: req.body.description ? req.body.description : '',
      image: req.body.image,
      sort: req.body.sort,
      user_id: req.user_id,
      parent_id: req.body.parent_id ?? 0,
      seo_title: req.body.seo_title,
      seo_description: req.body.seo_description,
      seo_h1: req.body.seo_h1
    });

    const [saved, _] = await category.save();

    if (!saved?.insertId) {
      return sendError(res, 500, "Не удалось создать категорию")
    }

    sendSuccess(res, {
      message: "Категория успешно создана",
      saved
    })

  } catch (error) {
    sendError(res, 500, "Не удалось создать категорию", {
      error
    })
  }
}

export const update = async (req, res) => {
  try {

    const category = new Category({
      name: req.body.name,
      description: req.body.description ? req.body.description : '',
      image: req.body.image,
      sort: req.body.sort,
      user_id: req.user_id,
      parent_id: req.body.parent_id ?? 0,
      seo_title: req.body.seo_title,
      seo_description: req.body.seo_description,
      seo_h1: req.body.seo_h1,
      category_id: req.body.category_id,
    });

    const [updated, _] = await category.update();

    if(!updated?.affectedRows) {
      return sendError(res, 404, "Категория не найдена")
    }

    sendSuccess(res, {
      message: "Категория успешно обновлена",
      updated
    })

  } catch (error) {

    sendError(res, 500, "Не удалось обновить категорию", {
      error
    })
    
  }
}

export const remove = async (req, res) => {
  try{

    const [del, _] = await Category.remove(req.params.id)

    if(!del?.affectedRows){
      return sendError(res, 404, "Категория не найдена")
    }

    sendSuccess(res, {
      message: "Категория успешно удалена",
      del
    })

  } catch(error) {
    sendError(res, 500, "Не удалось удалить категорию", {
      error
    })
  }
}

export const getOne = async (req, res) => {
  try {

    const [cat, _] = await Category.getInfo(req.params.id)

    const category = cat[0];

    const [categories, __] = await Category.getInner(req.params.id)

    if (!category) {
      return sendError(res, 404, "Категория не найдена")
    }

    sendSuccess(res, {
      category,
      categories,
      breadcrumbs: await getCategoryBreadcrumbs(category)
  })
  } catch (error) {
    sendError(res, 500, "Не удалось получить категорию", {
      error
    })
  }
}

export const getMain = async (req, res) => {
  try {

    let category = rootBreadcrumb


    const [categories, __] = await Category.getInner(0)

    sendSuccess(res, {
      category,
      categories,
      breadcrumbs: [rootBreadcrumb]
    }
    )
  } catch (error) {
    sendError(res, 500, "Не удалось получить категории", {
      error
    })
  }
}
