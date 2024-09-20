const express = require('express');
const moneyTransController = require('./../Controller/MoneyTransController');
const AuthController = require('./../Controller/AuthController');

const router = express.Router();

router.route('/download/:id').get(moneyTransController.downloadTrans);
router.use(AuthController.protectedEndPoint);
router
  .route('/:id')
  .post(moneyTransController.addTrans)
  .delete(moneyTransController.deleteTransById)
  .get(moneyTransController.getTransForParticularBook)
  .patch(moneyTransController.updateTrans);
router
  .route('/filter/:id')
  .get(moneyTransController.filterMoneyTransForParticularBook);
router.route('/basedOnCat/:id').get(moneyTransController.transBasedOnCategory);
module.exports = router;
