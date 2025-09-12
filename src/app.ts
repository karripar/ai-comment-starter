import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import {notFound, errorHandler} from './middlewares';
import api from './api';
import {MessageResponse} from './types/MessageTypes';
import path from 'path';

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get<{}, MessageResponse>('/', (_req, res) => {
  res.json({
    message: 'API location: api/v1',
  });
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/v1', api);

app.use(notFound);
app.use(errorHandler);

export default app;
