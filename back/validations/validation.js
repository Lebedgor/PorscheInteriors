import { body, param } from 'express-validator';



export const registerValidation = [
  body('email', 'Неверный формат почты').isEmail(),
  body('password', 'Минимальное количество символов в пароле 5').isLength({ min: 5 }),
  body('name', 'Минимальное количество символов в имени 3').isLength({ min: 3 }),
  body('avatar', 'Неправильный формат ссылки на аватарку').optional().isURL(),
];

export const userEditValidation = [
  body('currentPassword', 'Минимальное количество символов в текущем пароле 5').isLength({ min: 5 }),
  body('password', 'Минимальное количество символов в пароле 5').isLength({ min: 5 }),
];

export const userActivateValidation = [
  body('user_id', 'Неверный идентификатор пользователя').isInt({ min: 1 }),
  body('activate', 'Статус активации должен быть 0 или 1').isInt({ min: 0, max: 1 }),
];

export const userDeleteValidation = [
  param('id', 'Неверный идентификатор пользователя').isInt({ min: 1 }),
];

export const siteImageSettingsValidation = [
  body('uploadWidth', 'Ширина изображения при загрузке должна быть от 100 до 6000').isInt({ min: 100, max: 6000 }),
  body('uploadHeight', 'Высота изображения при загрузке должна быть от 100 до 6000').isInt({ min: 100, max: 6000 }),
  body('uploadQuality', 'Качество изображения должно быть от 10 до 100').isInt({ min: 10, max: 100 }),
  body('thumbnailWidth', 'Ширина миниатюры должна быть от 80 до 2000').isInt({ min: 80, max: 2000 }),
  body('thumbnailHeight', 'Высота миниатюры должна быть от 80 до 2000').isInt({ min: 80, max: 2000 }),
  body('thumbnailFormat', 'Формат миниатюры должен быть webp, jpeg или png').isIn(['webp', 'jpeg', 'png']),
  body('popupWidth', 'Ширина всплывающего изображения должна быть от 200 до 4000').isInt({ min: 200, max: 4000 }),
  body('popupHeight', 'Высота всплывающего изображения должна быть от 200 до 4000').isInt({ min: 200, max: 4000 }),
  body('popupFormat', 'Формат всплывающего изображения должен быть webp, jpeg или png').isIn(['webp', 'jpeg', 'png']),
];

export const siteHomeSeoValidation = [
  body('title', 'Title повинен бути рядком').optional({ nullable: true }).isString(),
  body('description', 'Description повинен бути рядком').optional({ nullable: true }).isString(),
  body('h1', 'H1 повинен бути рядком').optional({ nullable: true }).isString(),
  body('og_title', 'OG title повинен бути рядком').optional({ nullable: true }).isString(),
  body('og_description', 'OG description повинен бути рядком').optional({ nullable: true }).isString(),
  body('og_image', 'OG image повинен бути рядком').optional({ nullable: true }).isString(),
];

export const loginValidation = [
  body('email', 'Неверный формат почты').isEmail(),
  body('password', 'Минимальное количество символов в пароле 5').isLength({ min: 5 }),
];

export const interiorValidation = [
  body('name', 'Минимальное количество символов в названии 5').isLength({ min: 5 }),
  body('description', 'Минимальное количество символов в статье 100').optional().isLength({ min: 100 }),
  body('tags', 'Неверный формат тэгов (укажите массив)').optional().isString(),
  body('image', 'Неправильный формат ссылки на изображение').optional().isString(),
  body('sort', 'Сортировкой может быть только цельное число').optional().isInt(),
  body('model_id', 'Неверный идентификатор модели').optional().isInt({ min: 1 }),
  body('interior_id', 'Неверный идентификатор интерьера').optional().isInt({ min: 1 }),
];

export const modelValidation = [
  body('name', 'Минимальное количество символов в названии 5').isLength({ min: 5 }),
  body('image', 'Неправильный формат ссылки на изображение').optional().isString(),
  body('sort', 'Сортировкой может быть только цельное число').optional().isInt(),
  body('model_id', 'Неверный идентификатор модели').optional().isInt({ min: 1 }),
];


export const categoryValidation = [
  body('name', 'Минимальное количество символов в названии 5').isLength({ min: 5 }),
  body('description', 'Минимальное количество символов в статье 100').optional().isLength({ min: 10 }),
  body('tags', 'Неверный формат тэгов (укажите массив)').optional().isString(),
  body('image', 'Неправильный формат ссылки на изображение').optional().isString(),
  body('sort', 'Сортировкой может быть только цельное число').optional().isInt(),
  body('parent_id', 'Неверный идентификатор родительской категории').optional().isInt({ min: 0 }),
  body('category_id', 'Неверный идентификатор категории').optional().isInt({ min: 1 }),
  body('seo_title', 'SEO title повинен бути рядком').optional({ nullable: true }).isString(),
  body('seo_description', 'SEO description повинен бути рядком').optional({ nullable: true }).isString(),
  body('seo_h1', 'SEO H1 повинен бути рядком').optional({ nullable: true }).isString(),
];

export const imageValidation = [
  body('image_id', 'Неверный идентификатор изображения').isInt({ min: 1 }),
  body('sort', 'Сортировкой может быть только цельное число').isInt({ min: 0 }),
  body('media_type', 'Тип медіа повинен бути image, video або youtube').optional({ nullable: true }).isIn(['image', 'video', 'youtube']),
  body('url', 'Посилання повинно бути рядком').optional({ nullable: true }).isString(),
  body('title', 'Title должен быть строкой').optional({ nullable: true }).isString(),
  body('alt', 'Alt должен быть строкой').optional({ nullable: true }).isString(),
];
