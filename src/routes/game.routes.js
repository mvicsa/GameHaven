const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');
const { authenticate, restrictTo } = require('../middlewares/auth.middleware');
const { upload } = require('../utils/uploadConfig');

router.get('/', gameController.getGames);
router.get('/:id', gameController.getGame);
router.post('/', authenticate, restrictTo('admin'), upload.single('coverImage'), gameController.createGame);
router.put('/:id', authenticate, restrictTo('admin'), upload.single('coverImage'), gameController.updateGame);
router.delete('/:id', authenticate, restrictTo('admin'), gameController.deleteGame);

module.exports = router;