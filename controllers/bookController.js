// /controllers/bookController.js

const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');
const { body, validationResult } = require('express-validator');

const async = require('async');

exports.index = async function (req, res) {
  try {
    const book_count = await Book.count({})
    const book_instance_count = await BookInstance.count({})
    const book_instance_available_count = await BookInstance.count({ status: 'Available' })
    const author_count = await Author.count({})
    const genre_count = await Genre.count({})
    const results = {
      book_count,
      book_instance_count,
      book_instance_available_count,
      author_count,
      genre_count
    }
    // console.log(results)
    res.render('index', { title: 'Local Library Home', error: null, data: results });
  } catch (error) {
    res.render('index', { title: 'Local Library Home', error });
  }
};


// 显示完整的藏书列表
exports.book_list = async (req, res, next) => {
  try {
    const list_book = await Book.find({}, 'title author')
      .populate('author')
      .exec();
    res.render('book_list', { title: 'Book List', book_list: list_book });
  } catch (error) {
    next(error)
  }
};

// 为每本藏书显示详细信息的页面
exports.book_detail = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('author').populate('genre')
    if (book === null) {
      const err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    const book_instance = await BookInstance.find({ 'book': req.params.id })
    res.render('book_detail', { title: 'Title', book: book, book_instances: book_instance });
  } catch (error) {
    next(error)
  }
};

// 由 GET 显示创建藏书的表单
exports.book_create_get = async (req, res, next) => {
  try {
    const authors = await Author.find()
    const genres = await Genre.find()
    res.render('book_form', { title: 'Create Book', authors: authors, genres: genres });
  } catch (error) {
    next(error)
  }
};

// 由 POST 处理藏书创建操作
exports.book_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined')
        req.body.genre = [];
      else
        req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
  body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
  body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
  body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

  body('*').trim().escape(),
  body('genre.*').escape(),
  async (req, res, next) => {

    const errors = validationResult(req);

    const book = new Book(
      {
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: req.body.genre
      });

    if (!errors.isEmpty()) {
      try {
        const authors = await Author.find()
        const genres = await Genre.find()
        for (let i = 0; i < genres.length; i++) {
          if (book.genre.indexOf(genres[i]._id) > -1) {
            genres[i].checked = 'true';
          }
        }
        res.render('book_form', { title: 'Create Book', authors: authors, genres: genres, book: book, errors: errors.array() });
      } catch (error) {
        next(error)
      }
      return;
    } else {
      try {
        await book.save();
        res.redirect(book.url);
      } catch (error) {
        next(error)
      }
    }
  }
];

// 由 GET 显示删除藏书的表单
exports.book_delete_get = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
    const book_bookinstances = await BookInstance.find({ 'book': req.params.id })
    if (book == null) {
      res.redirect('/catalog/books');
    }
    res.render('book_delete', { title: 'Delete Book', book: book, book_bookinstances });
  } catch (error) {
    next(error)
  }
};

// 由 POST 处理藏书删除操作
exports.book_delete_post = async (req, res, next) => {
  try {
    const book = await Book.findById(req.body.bookid)
    const book_bookinstances = await Book.find({ 'book': req.body.bookid })
    if (book_bookinstances.length > 0) {
      res.render('book_delete', { title: 'Delete Book', book: book, book_bookinstances });
      return;
    } else {
      try {
        await Book.findByIdAndRemove(req.body.bookid)
        res.redirect('/catalog/books')
      } catch (error) {
        next(error)
      }
    }
  } catch (error) {
    next(error)
  }
};

// 由 GET 显示更新藏书的表单
exports.book_update_get = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('author').populate('genre');
    const authors = await Author.find();
    const genres = await Genre.find();
    if (book == null) {
      const err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    for (let all_g_iter = 0; all_g_iter < genres.length; all_g_iter++) {
      for (let book_g_iter = 0; book_g_iter < book.genre.length; book_g_iter++) {
        if (genres[all_g_iter]._id.toString() == book.genre[book_g_iter]._id.toString()) {
          genres[all_g_iter].checked = 'true';
        }
      }
    }
    res.render('book_form', { title: 'Update Book', authors: authors, genres: genres, book: book });
  } catch (error) {
    next(error)
  }
};

// 由 POST 处理藏书更新操作
exports.book_update_post = [

  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined')
        req.body.genre = [];
      else
        req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
  body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
  body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
  body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

  body('title').trim().escape(),
  body('author').trim().escape(),
  body('summary').trim().escape(),
  body('isbn').trim().escape(),
  body('genre.*').trim().escape(),

  async (req, res, next) => {

    const errors = validationResult(req);

    var book = new Book(
      {
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre,
        _id: req.params.id //This is required, or a new ID will be assigned!
      });

    if (!errors.isEmpty()) {
      try {
        const authors = await Author.find();
        const genres = await Genre.find();
        for (let i = 0; i < genres.length; i++) {
          if (book.genre.indexOf(genres[i]._id) > -1) {
            genres[i].checked = 'true';
          }
        }
        res.render('book_form', { title: 'Update Book', authors: authors, genres: genres, book: book, errors: errors.array() });
      } catch (error) {
        next(error)
      }
      return;
    } else {
      try {
        const thebook = await Book.findByIdAndUpdate(req.params.id, book, {});
        res.redirect(thebook.url);
      } catch (error) {
        next(error)
      }
    }
  }
];
