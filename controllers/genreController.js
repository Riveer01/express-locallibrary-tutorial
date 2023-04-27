const Genre = require('../models/genre');
const Book = require('../models/book');
// 从 v6.0.0 开始，都从 express-validator 引入 API
const { body, validationResult } = require('express-validator');

// 显示完整的藏书种类列表
exports.genre_list = async (req, res, next) => {
  try {
    const list_genre = await Genre.find().sort({ "name": 1 })
    res.render('genre_list', { title: 'Genre List', genre_list: list_genre })
  } catch (error) {
    next(error)
  }
};

// 为每个藏书种类显示详细信息的页面
exports.genre_detail = async (req, res, next) => {
  try {
    const genre = await Genre.findById(req.params.id)
    if (genre === null) {
      const err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }
    const genre_books = await Book.find({ 'genre': req.params.id })
    res.render('genre_detail', { title: 'Genre Detail', genre: genre, genre_books: genre_books });
  } catch (error) {
    next(error)
  }
};

// 由 GET 显示创建藏书种类的表单
exports.genre_create_get = (req, res) => {
  res.render('genre_form', { title: 'Create Genre' });
};

// 由 POST 处理藏书种类创建操作
exports.genre_create_post = [

  body('name', 'Genre name required').isLength({ min: 1 }).trim(),

  body('name').trim().escape(),

  async (req, res, next) => {

    const errors = validationResult(req);

    const genre = new Genre(
      { name: req.body.name }
    );

    if (!errors.isEmpty()) {
      res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array() });
      return;
    } else {
      try {
        const found_genre = await Genre.findOne({ 'name': req.body.name })
        if (found_genre) {
          res.redirect(found_genre.url);
        } else {
          try {
            await genre.save();
            res.redirect(genre.url);
          } catch (error) {
            next(error)
          }
        }
      } catch (error) {
        next(error)
      }
    }
  }
];

// 由 GET 显示删除藏书种类的表单
exports.genre_delete_get = async (req, res, next) => {
  try {
    const genre = await Genre.findById(req.params.id)
    const genre_books = await Book.find({ 'genre': req.params.id })
    if (genre == null) {
      res.redirect('/catalog/genres');
    }
    res.render('genre_delete', { title: 'Delete Genre', genre: genre, genre_books: genre_books });
  } catch (error) {
    next(error)
  }
};

// 由 POST 处理藏书种类删除操作
exports.genre_delete_post = async (req, res, next) => {
  try {
    const genre = await Genre.findById(req.body.genreid)
    const genre_books = await Book.find({ 'genre': req.body.genreid })
    if (genre_books.length > 0) {
      res.render('genre_delete', { title: 'Delete Genre', genre, genre_books });
      return;
    } else {
      try {
        await Genre.findByIdAndRemove(req.body.genreid)
        res.redirect('/catalog/genres')
      } catch (error) {
        next(error)
      }
    }
  } catch (error) {
    next(error)
  }
};

// 由 GET 显示更新藏书种类的表单
exports.genre_update_get = (req, res) => { res.send('未实现：藏书种类更新表单的 GET'); };

// 由 POST 处理藏书种类更新操作
exports.genre_update_post = (req, res) => { res.send('未实现：更新藏书种类的 POST'); };
