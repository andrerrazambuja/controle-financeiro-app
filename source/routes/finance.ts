import express from 'express';
import controller from '../controllers/finance';
const router = express.Router();

router.get('/extrato/:userId', controller.getExtrato);
router.post('/movimento/add/', controller.addMovimento);
router.post('/movimento/delete/', controller.delMovimento);

export = router;