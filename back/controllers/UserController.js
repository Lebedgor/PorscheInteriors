import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import User from '../models/User.js'

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }

  return process.env.JWT_SECRET
}

const sendSuccess = (res, payload = {}, status = 200) => res.status(status).json({
  success: true,
  ...payload
})

const sendError = (res, status, message, extra = {}) => res.status(status).json({
  success: false,
  message,
  ...extra
})

const normalizeEmail = (email) => String(email || '').trim().toLowerCase()

const getUserPublicData = (user) => {
  if (!user) {
    return null
  }

  const { passwordHash, ...userData } = user

  return userData
}

const ensureEmailIsUnique = async (email) => {
  const [existingUsers] = await User.findByEmail(email)

  if (existingUsers?.length) {
    return false
  }

  return true
}

const createPasswordHash = async (password) => {
  const salt = await bcrypt.genSalt(10)

  return bcrypt.hash(password, salt)
}



export const register = async (req, res) => {
  try{
    const email = normalizeEmail(req.body.email)
    const isEmailUnique = await ensureEmailIsUnique(email)

    if (!isEmailUnique) {
      return sendError(res, 409, 'Користувач з таким email вже існує')
    }

    const hash = await createPasswordHash(req.body.password)

    const regData = {
      email,
      name: req.body.name,
      passwordHash: hash,
      avatar: req.body.avatar ? req.body.avatar : ''
    }

    let user = new User(regData);

    let [data, __] = await user.save();

    if (!data?.insertId) {
      return sendError(res, 500, 'Не удалось зарегистрироваться')
    }

    user = data;

    const token = jwt.sign({
      id: user.insertId,
    }, getJwtSecret(),
    {
      expiresIn: '30d',
    })

    sendSuccess(res, {
      userData: getUserPublicData({
        user_id: user.insertId,
        ...regData,
      }),
      token,
    })

  } catch (error){
    sendError(res, 500, 'Не удалось зарегистрироваться', {
      error
    })
  }
}

export const edit = async(req, res) => {

  try {

    const [userInfo, _] = await User.getUser(req.user_id);

    if (!userInfo?.length) {
      return sendError(res, 404, 'Пользователь не найден')
    }

    const isValidPass = await bcrypt.compare(req.body.currentPassword, userInfo[0].passwordHash);

    if(isValidPass){
      const hash = await createPasswordHash(req.body.password)
    
      let user = new User({
        passwordHash: hash,
        user_id: req.user_id,
      });
    
      let [data, __] = await user.update();

      if (!data?.affectedRows) {
        return sendError(res, 404, 'Не удалось изменить информацию пользователя')
      }
    
      user = data;

      const token = jwt.sign({
        id: req.user_id,
      }, getJwtSecret(),
      {
        expiresIn: '30d',
      })

      return sendSuccess(res, {
        message: 'Пароль успішно змінено',
        token,
      })

    } else {
      return sendError(res, 400, 'Поточний пароль вказано невірно', {
        token: false,
      })
    }
    
  } catch (error) {
    sendError(res, 500, 'Не удалось изменить информацию пользователя', {
      error
    })
  }

}

export const getUser = async(req, res) => {
  try {
    
    let [user, _] = await User.getUser(req.query.user_id || req.body.user_id || req.user_id);

    if (!user?.length) {
      return sendError(res, 404, "Пользователь не найден")
    }

    res.json(user[0])

  } catch (error) {
    sendError(res, 500, "Не удалось получить пользователя", {
      error
    })
  }
}

export const getAllUsers = async(req, res) => {
  try {
    
    let [users, _] = await User.getAllUsers();

    res.json(users)

  } catch (error) {
    sendError(res, 500, "Не удалось получить пользователей", {
      error
    });
  }
}

export const create = async(req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    const isEmailUnique = await ensureEmailIsUnique(email)

    if (!isEmailUnique) {
      return sendError(res, 409, 'Користувач з таким email вже існує')
    }

    const user = new User({
      email,
      name: req.body.name,
      passwordHash: await createPasswordHash(req.body.password),
      avatar: req.body.avatar ? req.body.avatar : ''
    })

    const [created] = await user.save()

    if (!created?.insertId) {
      return sendError(res, 500, 'Не вдалося створити користувача')
    }

    sendSuccess(res, {
      message: 'Користувача успішно створено',
      user: {
        user_id: created.insertId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        activate: 0,
      }
    }, 201)
  } catch (error) {
    sendError(res, 500, 'Не вдалося створити користувача', {
      error
    })
  }
}

export const activate = async(req, res) => {
  try {
    
    let [activated, _] = await User.activate(req.body);

    if (!activated?.affectedRows) {
      return sendError(res, 404, "Пользователь не найден")
    }

    sendSuccess(res, {
      activated,
      message: "Пользователь активирован"
    });

  } catch (error) {
    sendError(res, 500, "Ошибка при активации пользователя", {
      error
    })
  }
}

export const remove = async(req, res) => {
  try {
    const userId = Number(req.params.id)

    if (req.user_id === userId) {
      return sendError(res, 400, 'Неможливо видалити поточного користувача')
    }

    const [userInfo] = await User.getUser(userId)

    if (!userInfo?.length) {
      return sendError(res, 404, 'Пользователь не найден')
    }

    const user = new User({
      user_id: userId
    })

    const [deleted] = await user.remove()

    if (!deleted?.affectedRows) {
      return sendError(res, 404, 'Пользователь не найден')
    }

    sendSuccess(res, {
      message: 'Користувача успішно видалено'
    })
  } catch (error) {
    sendError(res, 500, 'Не вдалося видалити користувача', {
      error
    })
  }
}

export const login = async (req, res) => {
  try {

    let [data, _] = await User.login(req.body.email);

    let user = data[0];

    if(!user){
      return sendError(res, 400, 'Пользователь не найден');
    }

    const isValidPass = await bcrypt.compare(req.body.password, user.passwordHash);

    

    if(!isValidPass){
      return sendError(res, 400, 'Неверный логин или пароль');
    }

    

    const token = jwt.sign(
      {
        id: user.user_id,
      },
      getJwtSecret(),
      {
        expiresIn: '30d',
      }
    );

    sendSuccess(res, {
      userData: getUserPublicData(user),
      token,
    });

  } catch (error) {
    sendError(res, 500, 'Не удалось авторизоваться', {
      error
    })
  }
}

export const auth = async (req, res) => {
  try {

    const [user, _] = await User.auth(req.user_id);

    if (!user || !user[0]) {
      return sendError(res, 404, 'Пользователь не найден')
    }

    sendSuccess(res, {
      userData: getUserPublicData(user[0])
    })
  } catch (error) {
    sendError(res, 500, 'Не удалось получить данные пользователя', {
      error
    })
  }
}
