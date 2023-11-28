import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js'




export const register = async (req, res) => {
  try{
  
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const regData = {
      email: req.body.email.toLowerCase(),
      name: req.body.name,
      passwordHash: hash,
      avatar: req.body.avatar ? req.body.avatar : ''
    }

    let user = new User(regData);

    let [data, __] = await user.save();

    user = data;

    const token = jwt.sign({
      id: user.insertId,
    }, '325465',
    {
      expiresIn: '30d',
    })

    const { passwordHash, ...userData } = user;
  
    res.json({
      userData,
      token,
    })

  } catch (error){
    res.status(500).json({
      message: 'Не удалось зарегистрироваться',
      error
    }
    )
  }
}

export const edit = async(req, res) => {

  try {

    const [userInfo, _] = await User.getUser(req.user_id);

    const isValidPass = await bcrypt.compare(req.body.currentPassword, userInfo[0].passwordHash);

    if(isValidPass){
      const password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
    
      let user = new User({
        passwordHash: hash,
      });
    
      let [data, __] = await user.update();
    
      user = data;

      const token = jwt.sign({
        id: user.insertId,
      }, '325465',
      {
        expiresIn: '30d',
      })

      // const { passwordHash, ...userData } = user;
  
      res.json({
        message: 'Пароль успiшно змiнено',
        token,
      })

    } else {
      res.json({
        message: 'Пароль не вiрний',
        token: false,
      })
    }
    
  } catch (error) {
    res.status(500).json({
      message: 'Не удалось изменить информацию пользователя',
      error
    }
    )
  }

}

export const getUser = async(req, res) => {
  try {
    
    let [user, _] = User.getUser(req.body.user_id);

    res.json(user[0])

  } catch (error) {
    res.status(500).json({
      message: "Пользователь не найден"
    })
  }
}

export const getAllUsers = async(req, res) => {
  try {
    
    let [users, _] = await User.getAllUsers();

    res.json(users)

  } catch (error) {
    res.status(500).json({
      message: "Ошибка при получении пользователей"
    });
  }
}

export const activate = async(req, res) => {
  try {
    
    let [activated, _] = await User.activate(req.body);

    res.json({
      activated,
      message: "Пользователь активирован"
    });

  } catch (error) {
    res.status(500).json({
      message: "Ошибка при активации пользователя"
    })
  }
}

export const login = async (req, res) => {
  try {

    let [data, _] = await User.login(req.body.email);

    let user = data[0];

    if(!user){
      return res.status(400).json({
        message: 'Пользователь не найден',
      });
    }

    const isValidPass = await bcrypt.compare(req.body.password, user.passwordHash);

    

    if(!isValidPass){
      return res.status(400).json({
        message: 'Неверный логин или пароль',
      });
    }

    

    const token = jwt.sign(
      {
        id: user.user_id,
      },
      '325465',
      {
        expiresIn: '30d',
      }
    );

    const { passwordHash, ...userData } = user;

    res.json({
      userData,
      token,
    });

  } catch (error) {
    res.status(500).json({
      message: 'Не удалось авторизоваться',
      error
    })
  }
}

export const auth = async (req, res) => {
  try {

    const [user, _] = await User.auth(req.user_id);

    if (!user) {
      res.status(404).json({
        message: 'Пользователь не найден'
      })
    }

    const { passwordHash, ...userData } = user[0];

    res.json({
      userData
    })
  } catch (error) {
    
  }
}