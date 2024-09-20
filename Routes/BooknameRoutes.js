const bookNameController = require('./../Controller/BookNameController');
const authController = require('./../Controller/AuthController');
const express = require('express');

const router = express.Router();
router.use(authController.protectedEndPoint);
router
  .route('/')
  .post(bookNameController.createBook)
  .get(bookNameController.getBookOfParticularUser);
router
  .route('/:id')
  .patch(bookNameController.updateBook)
  .delete(bookNameController.deleteBook);

module.exports = router;
