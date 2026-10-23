import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './config/database.js';
import movimientosRoutes from './routes/movimientosRoutes.js';
import catalogosRoutes from './routes/catalogosRoutes.js';
import { getHealth } from './controllers/healthController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Logging middleware
app.use((req, _res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// Rutas
app.get('/api/health', getHealth);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/catalogos', catalogosRoutes);

// Iniciar servidor y conectar a base de datos
app.listen(PORT, async () => {
  console.log(`🚀 [Backend] Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📋 [API Endpoints] Disponibles en http://localhost:${PORT}/api/movimientos`);
  console.log(`🔍 [Health Check] http://localhost:${PORT}/api/health`);

  // Intento de conexión inicial a SQL Server Management Studio
  await connectToDatabase();
});

export default app;
