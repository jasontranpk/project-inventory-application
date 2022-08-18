var express = require('express');
var router = express.Router();
const movieController = require('../controllers/movieController');
const genreController = require('../controllers/genreController');
/* GET home page. */
router.get('/', movieController.index);
router.get('/movies', movieController.index);
router.get('/movies/new', movieController.newGet);
router.post('/movies/new', movieController.newPost);
router.get('/movies/:id/update', movieController.updateGet);
router.post('/movies/:id/update', movieController.updatePost);
router.get('/movies/:id/delete', movieController.deleteGet);
router.post('/movies/:id/delete', movieController.deletePost);
router.get('/movies/:id', movieController.detail);

router.get('/genres/', genreController.genreList);
router.get('/genres/new', genreController.newGet);
router.post('/genres/new', genreController.newPost);
router.get('/genres/:id/update', genreController.updateGet);
router.post('/genres/:id/update', genreController.updatePost);
router.get('/genres/:id/delete', genreController.deleteGet);
router.post('/genres/:id/delete', genreController.deletePost);
router.get('/genres/:id', genreController.detail);
module.exports = router;
