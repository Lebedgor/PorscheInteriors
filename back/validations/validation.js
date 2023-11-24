import { body } from 'express-validator';



export const registerValidation = [
  body('email', 'Неверный формат почты').isEmail(),
  body('password', 'Минимальное количество символов в пароле 5').isLength({ min: 5 }),
  body('name', 'Минимальное количество символов в имени 3').isLength({ min: 3 }),
  body('avatar', 'Неправильный формат ссылки на аватарку').optional().isURL(),
];

export const userEditValidation = [
  body('password', 'Минимальное количество символов в пароле 5').isLength({ min: 5 }),
];

export const loginValidation = [
  body('email', 'Неверный формат почты').isEmail(),
  body('password', 'Минимальное количество символов в пароле 5').isLength({ min: 5 }),
];

export const interiorValidation = [
  body('name', 'Минимальное количество символов в названии 5').isLength({ min: 5 }),
  body('description', 'Минимальное количество символов в статье 100').optional().isLength({ min: 100 }),
  body('tags', 'Неверный формат тэгов (укажите массив)').optional().isString(),
  body('avatarUrl', 'Неправильный формат ссылки на аватарку').optional().isString(),
];

export const modelValidation = [
  body('name', 'Минимальное количество символов в названии 5').isLength({ min: 5 }),
  body('image', 'Неправильный формат ссылки на аватарку').optional().isString(),
  body('sortOrder', 'Сортировкой может быть только цельное число').optional().isInt(),
];