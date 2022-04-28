import express from 'express';
import controller from '../controllers/auth';
const router = express.Router();

router.get('/user/:id', controller.getUser); // REMOVER
router.get('/:username/:password', controller.authUser);
router.post('/register/', controller.registerUser);

export = router;