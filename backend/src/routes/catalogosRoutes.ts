import { Router } from 'express';
import { getTipos, getRazones, getCertificaciones } from '../controllers/catalogosController.js';

const router = Router();

router.get('/tipos', getTipos);
router.get('/razones', getRazones);
router.get('/certificaciones', getCertificaciones);

export default router;
