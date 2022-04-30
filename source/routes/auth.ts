import express from 'express';
import controller from '../controllers/auth';
const router = express.Router();

router.get('/:username/:password', controller.authUser);
router.post('/register/', controller.registerUser);

export = router;