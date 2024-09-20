const express = require('express');
const PaymentController = require('./../Controller/PaymentController');
const AuthController = require('./../Controller/AuthController');
const router = express.Router();

router.use(AuthController.protectedEndPoint);
router.route('/getKeys/:amt').get(PaymentController.getKeys);
router
  .route('/')
  .post(PaymentController.addDataToDb)
  .get(PaymentController.history);

module.exports = router;
