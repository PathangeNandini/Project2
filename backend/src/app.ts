import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import storeRoutes from './routes/storeRoutes';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import orderRoutes from './routes/orderRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

dotenv.config();

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Omnichannel POS API is running',
    timestamp: new Date().toISOString(),
  });
});

// All resource routes are namespaced under /api to match the frontend client
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Centralized error handler (catches anything thrown/passed to next())
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('UNHANDLED ERROR:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ message: err.message || 'Internal server error' });
});

export default app;
