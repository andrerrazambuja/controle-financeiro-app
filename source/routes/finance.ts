import express from 'express';
import controller from '../controllers/finance';
const router = express.Router();

router.get('/extrato/:userId', controller.getExtrato);
router.post('/movimento/', controller.addMovimento);
router.delete('/movimento/', controller.delMovimento);

export = router;