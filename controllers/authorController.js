const Author = require('../models/author');
const Book = require('../models/book');
const { body, validationResult } = require('express-validator');

// 显示完整的作者列表
exports.author_list = async (req, res, next) => {
  try {
    const list_authors = await Author.find().sort({ "family_name": 1, "ascending": 1 })
    res.render('author_list', { title: 'Author List', author_list: list_authors });
  } catch (error) {
    next(error)
  }
};

// 为每位作者显示详细信息的页面
exports.author_detail = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id)
    if (author == null) { // No results.
      const err = new Error('Author not found');
      err.status = 404;
      return next(err);
    }
    const author_books = await Book.find({ 'author': req.params.id }, 'title summary')
    res.render('author_detail', { title: 'Author Detail', author: author, author_books: author_books });
  } catch (error) {
    next(error)
  }
};

// 由 GET 显示创建作者的表单
exports.author_create_get = (req, res) => {
  res.render('author_form', { title: 'Create Author' });
};

// 由 POST 处理作者创建操作
exports.author_create_post = [

  body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
  body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
    .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
  body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
  body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

  body('first_name').trim().escape(),
  body('family_name').trim().escape(),
  body('date_of_birth').toDate(),
  body('date_of_death').toDate(),

  async (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
      return;
    }
    else {
      var author = new Author(
        {
          first_name: req.body.first_name,
          family_name: req.body.family_name,
          date_of_birth: req.body.date_of_birth,
          date_of_death: req.body.date_of_death
        });
      try {
        await author.save();
        res.redirect(author.url);
      } catch (error) {
        next(error)
      }
    }
  }
];

// 由 GET 显示删除作者的表单
exports.author_delete_get = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id)
    const author_books = await Book.find({ 'author': req.params.id })
    if (author == null) {
      res.redirect('/catalog/authors');
    }
    res.render('author_delete', { title: 'Delete Author', author: author, author_books: author_books });
  } catch (error) {
    next(error)
  }
};

// 由 POST 处理作者删除操作
exports.author_delete_post = async (req, res, next) => {
  try {
    const author = await Author.findById(req.body.authorid)
    const author_books = await Book.find({ 'author': req.body.authorid })
    if (author_books.length > 0) {
      res.render('author_delete', { title: 'Delete Author', author: author, author_books: author_books });
      return;
    } else {
      try {
        await Author.findByIdAndRemove(req.body.authorid)
        res.redirect('/catalog/authors')
      } catch (error) {
        next(error)
      }
    }
  } catch (error) {
    next(error)
  }
};

// 由 GET 显示更新作者的表单
exports.author_update_get = async (req, res, next) => {
  try {
    const book = Book
  } catch (error) {

  }
};

// 由 POST 处理作者更新操作
exports.author_update_post = (req, res) => { res.send('未实现：更新作者的 POST'); };
