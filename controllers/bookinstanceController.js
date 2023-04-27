const Bookinstance = require('../models/bookinstance');
const { body, validationResult } = require('express-validator');
const Book = require('../models/book');

// 显示完整的藏书副本列表
exports.bookinstance_list = async (req, res, next) => {
  try {
    const list_bookinstance = await Bookinstance.find().populate('book')
    res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstance })
  } catch (error) {
    next(error)
  }
};

// 为每本藏书副本显示详细信息的页面
exports.bookinstance_detail = async (req, res, next) => {
  try {
    const bookinstance = await Bookinstance.findById(req.params.id).populate('book')
    if (bookinstance == null) { // No results.
      const err = new Error('Book copy not found');
      err.status = 404;
      return next(err);
    }
    // Successful, so render.
    res.render('bookinstance_detail', { title: 'Book:', bookinstance: bookinstance });
  } catch (error) {
    next(error)
  }
};

// 由 GET 显示创建藏书副本的表单
exports.bookinstance_create_get = async (req, res, next) => {
  try {
    const books = await Book.find({}, 'title')
    res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books });
  } catch (error) {
    next(error)
  }
};

// 由 POST 处理藏书副本创建操作
exports.bookinstance_create_post = [

  // Validate fields.
  body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
  body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

  // Sanitize fields.
  body('book').trim().escape(),
  body('imprint').trim().escape(),
  body('status').trim().escape(),
  body('due_back').toDate(),

  // Process request after validation and sanitization.
  async (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookinstance = new Bookinstance(
      {
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back
      });

    if (!errors.isEmpty()) {
      try {
        const books = await Book.find({}, 'title');
        res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance: bookinstance });
      } catch (error) {
        next(error)
      }
      return;
    }
    else {
      try {
        await bookinstance.save();
        res.redirect(bookinstance.url);
      } catch (error) {
        next(error)
      }
    }
  }
];

// 由 GET 显示删除藏书副本的表单
exports.bookinstance_delete_get = async (req, res, next) => {
  try {
    const bookinstance = await Bookinstance.findById(req.params.id).populate('book')
    console.log('bookinstance', bookinstance)
    if (bookinstance == null) {
      res.redirect('/catalog/bookinstances');
    }
    res.render('bookinstance_delete', { title: 'Delete Bookinstance', bookinstance });
  } catch (error) {
    next(error)
  }
};

// 由 POST 处理藏书副本删除操作
exports.bookinstance_delete_post = async (req, res, next) => {
  try {
    const bookinstance = await Bookinstance.findById(req.params.id)
    if (bookinstance.length > 0) {
      res.render('bookinstance_delete', { title: 'Delete Bookinstance', bookinstance });
      return;
    } else {
      try {
        await Bookinstance.findByIdAndRemove(req.body.bookinstanceid)
        res.redirect('/catalog/bookinstances')
      } catch (error) {
        next(error)
      }
    }
  } catch (error) {
    next(error)
  }
};

// 由 GET 显示更新藏书副本的表单
exports.bookinstance_update_get = (req, res) => { res.send('未实现：藏书副本更新表单的 GET'); };

// 由 POST 处理藏书副本更新操作
exports.bookinstance_update_post = (req, res) => { res.send('未实现：更新藏书副本的 POST'); };
