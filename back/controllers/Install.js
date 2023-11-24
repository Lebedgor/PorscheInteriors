import db from "../utils/db.js"

export const install = (req, res) => {

  try {
     createInterior()
     createImage()
     createModel()
     createUser()

     res.json({
      message: "Таблицы в базе данных успешно созданы",

    })
  
  } catch (error) {
    console.log('error: ' + error)
  }

}

const createRequest = async(req) => {

  db.execute(req)

}

export const createInterior = () => {

  createRequest("CREATE TABLE IF NOT EXISTS interior (interior_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(512), description TEXT, image VARCHAR(512), sort TINYINT, user_id INT, model_id INT, date_added DATETIME, date_modified DATETIME)");

}

export const createImage = () => {

  createRequest("CREATE TABLE IF NOT EXISTS image (image_id INT AUTO_INCREMENT PRIMARY KEY, interior_id INT, link VARCHAR(512))");

}

export const createCar = () => {

  createRequest("CREATE TABLE IF NOT EXISTS car (car_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(512), image VARCHAR(512), sort TINYINT, user_id INT, date_added DATETIME, date_modified DATETIME)");

}

export const createModel = () => {

  createRequest("CREATE TABLE IF NOT EXISTS model (model_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(512), image VARCHAR(512), sort TINYINT, user_id INT, date_added DATETIME, date_modified DATETIME)");

}

export const createUser = () => {

  createRequest("CREATE TABLE IF NOT EXISTS user (user_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(512), activate TINYINT, email VARCHAR(512), passwordHash VARCHAR(1024), avatar VARCHAR(512) default '', date_added DATETIME, date_modified DATETIME)");

}