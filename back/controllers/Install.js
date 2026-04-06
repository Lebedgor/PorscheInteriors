import db from "../utils/db.js"

const sendSuccess = (res, payload = {}, status = 200) => res.status(status).json({
  success: true,
  ...payload
})

const sendError = (res, status, message, extra = {}) => res.status(status).json({
  success: false,
  message,
  ...extra
})

export const install = async (req, res) => {

  try {
     await createCategory()
     await createImage()
     await createModel()
     await createInterior()
     await createUser()
     await createSiteSettings()

     sendSuccess(res, {
      message: "Таблицы в базе данных успешно созданы",
    })
  
  } catch (error) {
    sendError(res, 500, "Не удалось создать таблицы в базе данных", {
      error
    })
  }

}

const createRequest = async(req) => {

  return db.execute(req)

}

export const createCategory = () => {

  return createRequest("CREATE TABLE IF NOT EXISTS category (category_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(512), description TEXT, image VARCHAR(512), sort TINYINT, user_id INT, parent_id INT DEFAULT '0', seo_title VARCHAR(512) NOT NULL DEFAULT '', seo_description TEXT, seo_h1 VARCHAR(512) NOT NULL DEFAULT '', date_added DATETIME, date_modified DATETIME)");

}

export const createImage = () => {

  return createRequest("CREATE TABLE IF NOT EXISTS image (image_id INT AUTO_INCREMENT PRIMARY KEY, category_id INT, link VARCHAR(512), preview_link VARCHAR(512) NOT NULL DEFAULT '', media_type VARCHAR(32) NOT NULL DEFAULT 'image', sort INT NULL, title VARCHAR(512) NOT NULL DEFAULT '', alt VARCHAR(512) NOT NULL DEFAULT '', date_added DATETIME NULL, date_modified DATETIME NULL)");

}

export const createCar = () => {

  return createRequest("CREATE TABLE IF NOT EXISTS car (car_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(512), image VARCHAR(512), sort TINYINT, user_id INT, date_added DATETIME, date_modified DATETIME)");

}

export const createModel = () => {

  return createRequest("CREATE TABLE IF NOT EXISTS model (model_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(512), image VARCHAR(512), sort TINYINT, user_id INT, date_added DATETIME, date_modified DATETIME)");

}

export const createInterior = () => {

  return createRequest("CREATE TABLE IF NOT EXISTS interior (interior_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(512), description TEXT, image VARCHAR(512), sort TINYINT, user_id INT, model_id INT, date_added DATETIME, date_modified DATETIME)");

}

export const createUser = () => {

  return createRequest("CREATE TABLE IF NOT EXISTS user (user_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(512), activate TINYINT, email VARCHAR(512), passwordHash VARCHAR(1024), avatar VARCHAR(512) default '', date_added DATETIME, date_modified DATETIME)");

}

export const createSiteSettings = () => {

  return createRequest("CREATE TABLE IF NOT EXISTS site_settings (setting_id INT AUTO_INCREMENT PRIMARY KEY, setting_key VARCHAR(255) NOT NULL UNIQUE, setting_value JSON NOT NULL, date_added DATETIME, date_modified DATETIME)");

}
