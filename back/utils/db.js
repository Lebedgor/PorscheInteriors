import dotenv from 'dotenv'
import mysql from 'mysql2';


dotenv.config();


var config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}

const pool = mysql.createPool(config)

console.log("DB OK")


export default pool.promise();