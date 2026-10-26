import { Router } from 'express';
import {
  getMovimientos,
  getMovimientoById,
  getKPIs,
  getScrapPorLinea,
  registrarDictamen,
} from '../controllers/movimientosController.js';

const router = Router();

router.get('/', getMovimientos);
router.get('/kpis', getKPIs);
router.get('/fallas-por-linea', getScrapPorLinea);
router.patch('/:id/dictamen', registrarDictamen);
router.get('/:id', getMovimientoById);

export default router;
