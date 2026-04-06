import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }

  return process.env.JWT_SECRET
}


export default (req, res, next) => {
  let jwtSecret;

  try {
    jwtSecret = getJwtSecret()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'JWT_SECRET не настроен'
    })
  }

  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

  if(token){
    try {
      
      const decoded = jwt.verify(token, jwtSecret);

      req.user_id = decoded.id;
      
      next();

    } catch (error) {
      res.status(403).json({
        success: false,
        message: 'Нет доступа'
      })
    }
  } else {
    res.status(403).json({
      success: false,
      message: 'Отсутствует токен авторизации'
    })
  }

}
