import { Router } from 'express';
import {
  getMovimientos,
  getMovimientoById,
  createMovimiento,
  aprobarMovimiento,
  rechazarMovimiento,
  getKPIs,
} from '../controllers/movimientosController.js';

const router = Router();

router.get('/', getMovimientos);
router.get('/kpis', getKPIs);
router.get('/:id', getMovimientoById);
router.post('/', createMovimiento);
router.put('/:id/aprobar', aprobarMovimiento);
router.put('/:id/rechazar', rechazarMovimiento);

export default router;
