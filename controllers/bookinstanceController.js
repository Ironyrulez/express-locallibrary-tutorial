var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');

const validator = require('express-validator');
var async = require('async');

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {
    // Return all bookinstances, selecting to return only book id
    BookInstance.find()
        .populate('book')   // Replace book id with full book details
        .exec(function (err, list_bookinstances) {
          if (err) { return next(err); }
          // Successful, so render
          res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
        });
    
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next) {
    // Find the book instance, retrieve the book details
    BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      if (bookinstance==null) { // No results.
          var err = new Error('Book copy not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      res.render('bookinstance_detail', { title: 'Copy: '+bookinstance.book.title, bookinstance:  bookinstance});
    })

};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {
    Book.find({},'title')
    .exec(function (err, books) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('bookinstance_form', {title: 'Create Book Instance', book_list: books, statusEnum: BookInstance.statusEnum});
    });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

    // Validate fields.
    validator.body('book', 'Book must be specified').trim().isLength({ min: 1 })
        .escape(),
    validator.body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 })
        .escape(),
    validator.body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601()
        .escape(),
    validator.body('status').trim().isIn(BookInstance.statusEnum).escape(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validator.validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bookinstance_form', { title: 'Create Book Instance', book_list: books,
                        bookinstance: bookinstance, statusEnum: BookInstance.statusEnum, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid.
            bookinstance.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(bookinstance.url);
                });
        }
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res) {
    BookInstance.findById(req.params.id)
      .exec(function (err, bookinstance) {
        if (err) { return next(err); }
        if (bookinstance == null) { // Bookinstance not found, redirect
          res.redirect('/catalog/bookinstances');
        }
        // Successful, so render.
        res.render('bookinstance_delete', { title: 'Delete Book Instance', bookinstance: bookinstance } );
      });
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res) {
    BookInstance.findByIdAndRemove(req.body.bookinstanceid,
      function deleteBookInstanceRedirect(err) {
          if (err) { return next(err); }
          // Success - go to bookinstance list
          res.redirect('/catalog/bookinstances')
      })

};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res) {
    async.parallel({
      books: function(callback) { // Get all book titles for selection field
        Book.find({},'title').exec(callback);
      },
      bookinstance: function(callback) {
        BookInstance.findById(req.params.id).exec(callback);
      }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.bookinstance == null) { // Instance not found but should exist, error
          var err = new Error('Book copy not found');
          err.status = 404;
          return next(err);
        }
        res.render('bookinstance_form', {title: 'Update Book Instance', bookinstance: results.bookinstance, book_list: results.books, statusEnum: BookInstance.statusEnum});
    });
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
    // Validate fields.
    validator.body('book', 'Book must be specified').trim().isLength({ min: 1 })
        .escape(),
    validator.body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 })
        .escape(),
    validator.body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601()
        .escape(),
    validator.body('status').trim().isIn(BookInstance.statusEnum).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validator.validationResult(req);

        // Create a BookInstance object with sanitized data, keep old id
        var bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bookinstance_form', { title: 'Update Book Instance', book_list: books,
                        bookinstance: bookinstance, statusEnum: BookInstance.statusEnum, errors: errors.array() });
            });
        }
        else {
            // Data from form is valid, update record.
            BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function (err, thecopy) {
                    if (err) { return next(err); }
                    // Successful - redirect to the book instance detail page.
                    res.redirect(thecopy.url);
                });
        }
    }
];