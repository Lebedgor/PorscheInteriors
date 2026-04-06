import dotenv from 'dotenv'
import mysql from 'mysql2';


dotenv.config();


const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}

const pool = mysql.createPool(config)
const db = pool.promise();

export const initDb = async () => {
  await db.query('SELECT 1')
  console.log("DB OK")
}

export default db;
