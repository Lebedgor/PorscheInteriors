import ArticleModel from "../models/Article.js";



export const create = async (req, res) => {
  try {
    
    const post = new ArticleModel({
      title: req.body.title,
      description: req.body.description,
      image: req.body.image,
      tags: req.body.tags,
      userId: req.userId,
    })

    const saved = await post.save();

    res.json({
      message: 'Статья успешно добавлена',
      saved
    })
    
  } catch (error) {
    res.status(500).json({
      message: 'Не удалось получить статьи',
      error
    })
  }
}

export const update = async (req, res) => {

  try {
    
    const articleId = req.params.id;

    const find = { _id: articleId };

    const update = {
      title: req.body.title,
      description: req.body.description,
      image: req.body.image,
      tags: req.body.tags,
    }

    const article = await ArticleModel.findOneAndUpdate(find, update, { new: true })

    if(!article) {
      return res.status(403).json({
        message: 'Не найти статью по данному айди'
      })
    }

    res.json(article)

  } catch (error) {
    res.status(500).json({
      message: 'Не удалось обновить статью',
      error
    })
  }
  
}

export const getAll = async (req, res) => {
  try {

    const articles = await ArticleModel.find().populate('userId').exec();

    res.json(articles);
  } catch (error) {
    res.status(500).json({
      message: 'Не удалось получить статьи',
      error
    })
  }
}


export const getOne = async (req, res) => {
  try {

    const articleId = req.params.id;

    const filter = { _id: articleId };

    const update = { $inc: {viewsCount: 1} }

    const article = await ArticleModel.findOneAndUpdate(
      filter,
      update,
      {
        new: true
      }
    ).populate('userId').exec();

    if (!article){
      return res.status(404).json({
        message: 'Статья не найдена'
      })
    }

    res.json(article)

  } catch (error) {
    res.status(500).json({
      message: 'Не удалось найти статью глобально',
      error
    })
  }
}

export const remove = async (req, res) => {
  try {

    const articleId = req.params.id
    const article = await ArticleModel.findOneAndDelete({ _id: articleId })

    if(!article){
      return res.status(404).json({
        message: 'Не найдена статья для удаления'
      })
    }

    res.json({
      article,
      message: 'Статья ' + articleId + ' успешно удалена'
    })

  } catch (error) {
    res.status(404).json({
      message: 'Не удалось удалить статью'
    })
  }
}